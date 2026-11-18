import { useSyncExternalStore } from 'react';
import { Link, useRouter } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { pathInLang } from '../data/routes';
import { suggestRoutes } from '../data/suggestRoutes';
import Prompt from '../terminal/Prompt';

// `false` no HTML gerado e na hidratação, `true` depois: as sugestões "parecidas com o que você
// digitou" só entram no cliente, porque o HTML estático não sabe o endereço (TD-022, FR-039).
const noop = () => () => {};

export default function NotFound() {
  const { lang, t } = useLanguage();
  const { path } = useRouter();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const suggestions = suggestRoutes(hydrated ? path : '', lang);

  useDocumentMeta('notFound');

  return (
    <div className="not-found">
      <p className="term-line not-found-cmd">
        <Prompt />
        <span className="t-input">cd {path}</span>
      </p>
      <p className="not-found-cmd t-err">bash: cd: {path}: 404</p>
      <h1>{t.notFound.title}</h1>
      <p>{t.notFound.text}</p>
      <div className="not-found-suggest">
        <p className="t-dim">{t.notFound.didYouMean}</p>
        <ul>
          {suggestions.map((route) => (
            <li key={route.id}>
              <Link to={pathInLang(route.path, lang)}>{route.label[lang]}</Link>
            </li>
          ))}
        </ul>
      </div>
      <Link to={pathInLang('/', lang)} className="btn">
        {t.notFound.back}
      </Link>
    </div>
  );
}
