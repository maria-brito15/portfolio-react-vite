import ContactForm from '../../components/ContactForm';
import ContactLinks from '../../components/ContactLinks';
import { profile } from '../../data/profile';

export default function Contact({ content }) {
  return (
    <section className="contact-wrap" id="contato" aria-labelledby="contato-title">
      <div className="cbg" aria-hidden="true"></div>
      <div className="cinner">
        <div className="lbl" style={{ justifyContent: 'center' }}>
          {content.label}
        </div>
        <h2
          className="stitle"
          id="contato-title"
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
        >
          {content.title}
        </h2>
        <p className="contact-text">{content.text}</p>
        <ContactLinks email={profile.email} emailLabel={content.email} />
        <ContactForm />
      </div>
    </section>
  );
}
