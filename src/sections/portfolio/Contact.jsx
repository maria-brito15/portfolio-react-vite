import ContactForm from '../../components/ContactForm';
import ContactLinks from '../../components/ContactLinks';
import { profile } from '../../data/profile';
import SectionTitle from '../../components/ui/SectionTitle';

export default function Contact({ content }) {
  return (
    <section className="contact-wrap" id="contato" aria-labelledby="contato-title">
      <div className="cinner">
        <SectionTitle id="contato-title" label={content.label} center>
          {content.title}
        </SectionTitle>
        <p className="contact-text">{content.text}</p>
        <ContactLinks email={profile.email} emailLabel={content.email} />
        <ContactForm />
      </div>
    </section>
  );
}
