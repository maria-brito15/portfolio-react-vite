import { Link, useRouter } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import Prompt from '../terminal/Prompt';

export default function NotFound() {
  const { t } = useLanguage();
  const { path } = useRouter();
  useDocumentMeta({ title: `${t.notFound.title} | Duda Brito`, description: t.notFound.text });
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
        <Link to="/" className="btn">
          {t.notFound.back}
        </Link>
      </div>
    </SiteShell>
  );
}
