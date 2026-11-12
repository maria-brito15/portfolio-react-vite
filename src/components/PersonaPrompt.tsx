import { useState } from 'react';
import { Link } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { usePersona } from '../hooks/usePersona';
import { personas } from '../data/personas';
import { routeById } from '../data/routes';

// Faixa da home: pergunta quem está visitando (opcional) e, depois da escolha,
// mostra a persona atual com o chamado para ação dela. A região é `aria-live`
// para a troca ser anunciada. Os mesmos dados e o mesmo estado do terminal.
export default function PersonaPrompt() {
  const { lang, t } = useLanguage();
  const p = t.persona;
  const { persona, asked, choose, skip, clear } = usePersona();
  const [changing, setChanging] = useState(false);

  const picker = (
    <div className="persona-options" role="group" aria-label={p.group}>
      {personas.map((item, i) => (
        <button
          type="button"
          key={item.id}
          className="persona-option"
          aria-pressed={item.id === persona?.id}
          onClick={() => {
            choose(item.id);
            setChanging(false);
          }}
        >
          <span aria-hidden="true">{i + 1}) </span>
          {item.label[lang]}
        </button>
      ))}
    </div>
  );

  const cta = persona && routeById(persona.cta.route);

  return (
    <div className="persona-slot" aria-live="polite">
      {!asked && (
        <section className="persona-bar" aria-labelledby="persona-q">
          <p id="persona-q">{p.question}</p>
          {picker}
          <button type="button" className="persona-link" onClick={skip}>
            {p.skip}
          </button>
        </section>
      )}

      {asked && persona && (
        <section className="persona-bar persona-bar--set" aria-label={p.group}>
          <p>
            <span className="t-dim">{p.viewing} </span>
            <strong>{persona.label[lang]}</strong>
          </p>
          {cta && (
            <Link to={cta.path} className="dash-btn dash-btn--primary">
              {persona.cta.label[lang]}
            </Link>
          )}
          <button type="button" className="persona-link" onClick={() => setChanging((v) => !v)}>
            {p.change}
          </button>
          <button
            type="button"
            className="persona-link"
            onClick={() => {
              clear();
              setChanging(false);
            }}
          >
            {p.clear}
          </button>
          {changing && picker}
        </section>
      )}

      {asked && !persona && (
        <div className="persona-idle">
          <button type="button" className="persona-link" onClick={() => setChanging((v) => !v)}>
            {p.choose}
          </button>
          {changing && picker}
        </div>
      )}
    </div>
  );
}
