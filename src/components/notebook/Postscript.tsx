import ContactForm from '../ContactForm';
import ContactLinks from '../ContactLinks';
import { useLanguage } from '../../i18n/LanguageContext';
import { profile } from '../../data/profile';
import type { PortfolioContent } from '../../data/portfolio';

// Contato como "PS" (CD-24): um envelope em volta do formulário. A lógica de `ContactForm` não muda;
// só o visual e o título. O `h1` é "PS — escreva-me / write to me".
export default function Postscript({ content }: { content: PortfolioContent['contact'] }) {
  const { t } = useLanguage();

  return (
    <section className="nb-postscript" aria-label={t.nb.contact.envelope}>
      <h1 className="nb-ps-title">{t.nb.contact.ps}</h1>
      <p className="nb-kicker">{t.nb.contact.kicker}</p>
      <p className="nb-ps-text">{content.text}</p>
      <div className="nb-envelope">
        <ContactLinks email={profile.email} emailLabel={content.email} />
        <ContactForm />
      </div>
    </section>
  );
}
