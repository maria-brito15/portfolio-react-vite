import ContactForm from '../../components/ContactForm';
import ContactLinks from '../../components/ContactLinks';
import { profile } from '../../data/profile';
import SectionTitle from '../../components/ui/SectionTitle';

import type { PortfolioContent } from '../../data/portfolio';

export default function Contact({ content }: { content: PortfolioContent['contact'] }) {
  return (
    <section className="contact-wrap" id="contato" aria-labelledby="contato-title">
      <div className="cinner">
        <SectionTitle as="h1" id="contato-title" label={content.label} center>
          {content.title}
        </SectionTitle>
        <p className="contact-text">{content.text}</p>
        <ContactLinks email={profile.email} emailLabel={content.email} />
        <ContactForm />
      </div>
    </section>
  );
}
