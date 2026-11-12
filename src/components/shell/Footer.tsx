import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { profile } from '../../data/profile';
import { routeById } from '../../data/routes';

// Rodapé: assinatura e os canais de contato e links profissionais, sempre à mão.
export default function Footer() {
  const { lang, t } = useLanguage();
  const resume = routeById('curriculo');
  const contact = routeById('contato');

  return (
    <footer>
      <nav className="footer-links" aria-label={t.ws.footer.label}>
        {contact && <Link to={contact.path}>{contact.label[lang]}</Link>}
        {resume && <Link to={resume.path}>{t.ws.footer.resume}</Link>}
        <a href={`mailto:${profile.email}`}>{t.ws.footer.email}</a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </nav>
      <p>{t.footer}</p>
    </footer>
  );
}
