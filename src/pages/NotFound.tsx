import { Link, useRouter } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { suggestPages } from '../utils/suggest';
import SiteShell from '../components/shell/SiteShell';
import Prompt from '../terminal/Prompt';

export default function NotFound() {
  const { lang, t } = useLanguage();
  const { path } = useRouter();
  const suggestions = suggestPages(path);

  useDocumentMeta('notFound');

  return (
    <SiteShell missingPath={path}>
      <div className="not-found">
        <p className="term-line not-found-cmd">
          <Prompt />
          <span className="t-input">cd {path}</span>
        </p>
        <p className="not-found-cmd t-err">bash: cd: {path}: 404</p>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.text}</p>
        {suggestions.length > 0 && (
          <div className="not-found-suggest">
            <p className="t-dim">{t.notFound.didYouMean}</p>
            <ul>
              {suggestions.map((page) => (
                <li key={page.id}>
                  <Link to={page.path}>~/{lang === 'pt' ? page.name : page.alias}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="t-dim">{t.notFound.tryLs}</p>
        <Link to="/" className="btn">
          {t.notFound.back}
        </Link>
      </div>
    </SiteShell>
  );
}
