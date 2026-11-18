import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { pick } from '../../content/pick';
import { credits } from '../../content/credits.content';
import { castVersions } from '../../data/cast';
import { pathInLang, routeById } from '../../data/routes';

// Rodapé de créditos (FR-036, FR-037, TD-020): título, "directed by", lista de definição (roteiro e
// código, elenco, filmado em, fim), "sem cookies" e um único link, para a home. Rótulos em ui.ts;
// valores em credits.content.ts; versões do elenco lidas da versão instalada no build.
export default function FooterNext() {
  const { lang, t } = useLanguage();
  const home = routeById('home');
  const cast = credits.cast
    .map(({ package: pkg, name }) => {
      const major = castVersions[pkg];

      return major == null ? name : `${name} ${major}`;
    })
    .join(' · ');

  return (
    <footer className="credits">
      <p className="credits-title">{t.credits.title}</p>
      <p className="credits-by">
        {t.credits.directedBy} {credits.writer}
      </p>
      <dl className="credits-list">
        <div>
          <dt>{t.credits.writer}</dt>
          <dd>{credits.writer}</dd>
        </div>
        <div>
          <dt>{t.credits.cast}</dt>
          <dd>{cast}</dd>
        </div>
        <div>
          <dt>{t.credits.shotIn}</dt>
          <dd>{pick(credits.shotIn, lang)}</dd>
        </div>
        <div>
          <dt>{t.credits.end}</dt>
          <dd>{t.credits.noCookies}</dd>
        </div>
      </dl>
      {home && <Link to={pathInLang(home.path, lang)}>{t.credits.home}</Link>}
    </footer>
  );
}
