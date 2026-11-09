import { useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { profile } from '../data/profile';
import { classifySendError, sendContactMessage } from '../services/emailService';
import { validateContact } from '../utils/validateContact';

const EMPTY = { name: '', email: '', message: '' };
const FIELDS = ['name', 'email', 'message'];

export default function ContactForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  // idle | sending | success | error | not-configured
  const [status, setStatus] = useState('idle');
  const inputs = useRef({});
  // Trava síncrona: o estado só atualiza na próxima renderização, então dois
  // envios disparados no mesmo instante passariam pelo teste de `status`.
  const sendingRef = useRef(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((v) => ({ ...v, [name]: value }));
    // Depois do primeiro envio, o erro do campo some assim que ele fica válido.
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        const code = validateContact({ ...values, [name]: value })[name];

        if (code) next[name] = code;
        else delete next[name];

        return next;
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (sendingRef.current) return;
    // Armadilha para bots: campo invisível que pessoas nunca preenchem.
    if (event.currentTarget.elements.website?.value) {
      setValues(EMPTY);
      setStatus('success');

      return;
    }

    const found = validateContact(values);

    setErrors(found);
    if (Object.keys(found).length) {
      setStatus('idle');
      inputs.current[FIELDS.find((f) => found[f])]?.focus();

      return;
    }
    sendingRef.current = true;
    setStatus('sending');
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setValues(EMPTY);
      setStatus('success');
    } catch (error) {
      const kind = classifySendError(error);

      if (kind !== 'not-configured') console.error('Falha no envio pelo EmailJS:', error);
      setStatus(kind);
    } finally {
      sendingRef.current = false;
    }
  }

  const sending = status === 'sending';

  function field(name, label, props) {
    const Tag = name === 'message' ? 'textarea' : 'input';
    const errorId = `contact-${name}-error`;

    return (
      <div className="form-field">
        <label htmlFor={`contact-${name}`}>{label}</label>
        <Tag
          ref={(el) => (inputs.current[name] = el)}
          id={`contact-${name}`}
          name={name}
          value={values[name]}
          onChange={handleChange}
          disabled={sending}
          required
          aria-required="true"
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? errorId : undefined}
          {...props}
        />
        {errors[name] && (
          <small id={errorId} className="form-error">
            {t.form.errors[errors[name]]}
          </small>
        )}
      </div>
    );
  }

  const mail = <a href={`mailto:${profile.email}`}>{profile.email}</a>;

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="contact-form-title"
    >
      <h3 id="contact-form-title" className="contact-form-title">
        {t.form.title}
      </h3>
      {field('name', t.form.name, {
        type: 'text',
        autoComplete: 'name',
        maxLength: 100,
        placeholder: t.form.namePlaceholder,
      })}
      {field('email', t.form.email, {
        type: 'email',
        autoComplete: 'email',
        inputMode: 'email',
        placeholder: t.form.emailPlaceholder,
      })}
      {field('message', t.form.message, {
        rows: 5,
        maxLength: 5000,
        placeholder: t.form.messagePlaceholder,
      })}
      <div className="hp-field" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <button className="btn" type="submit" disabled={sending} aria-busy={sending}>
        {sending ? t.form.sending : t.form.send}
      </button>
      <div className="form-status" role="status" aria-live="polite">
        {status === 'success' && <p className="form-note success">{t.form.success}</p>}
        {['error', 'network', 'rate-limited'].includes(status) && (
          <p className="form-note failure">
            {status === 'error' && t.form.failure}
            {status === 'network' && t.form.network}
            {status === 'rate-limited' && t.form.rateLimited} {mail}.
          </p>
        )}
        {status === 'not-configured' && (
          <p className="form-note failure">
            {t.form.notConfigured} {mail}.
          </p>
        )}
      </div>
    </form>
  );
}
