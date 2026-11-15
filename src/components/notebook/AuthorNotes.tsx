import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { profile } from '../../data/profile';
import { routeById } from '../../data/routes';
import type { PortfolioContent } from '../../data/portfolio';

// "Notas da autora" (CD-23): o Sobre como carta. Serifa, medida de 64ch, sem cards. O texto é a bio
// atual, sem nenhum fato novo. O `h1` é a saudação. O currículo fecha a carta como link.
export default function AuthorNotes({ content }: { content: PortfolioContent['about'] }) {
  const { t } = useLanguage();
  const resume = routeById('curriculo');

  return (
    <article className="nb-letter">
      <h1 className="nb-letter-greeting">{t.nb.about.greeting}</h1>
      {content.bio.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      <div className="nb-letter-interests">
        <p className="nb-kicker">{content.interestsLabel}</p>
        <ul>
          {content.interests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </div>
      <footer className="nb-letter-sign">
        <p className="nb-letter-name">{content.name}</p>
        <p className="nb-letter-meta">
          {content.role} · {content.location}
        </p>
        <p className="nb-letter-meta">{content.languages}</p>
        <p className="nb-letter-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
        {resume && (
          <p>
            <Link to={resume.path} className="nb-letter-resume">
              {t.nb.about.resume}
            </Link>{' '}
            <span className="nb-letter-hint">{t.nb.about.resumeHint}</span>
          </p>
        )}
      </footer>
    </article>
  );
}
