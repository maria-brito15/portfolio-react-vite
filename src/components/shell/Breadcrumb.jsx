import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';

// `~ / academico` — o último item é a página atual. `crumbs` vem de
// crumbsFor() (src/data/routes.js), então PT e EN usam o vocabulário dos comandos.
export default function Breadcrumb({ crumbs }) {
  const { t } = useLanguage();
  return (
    <nav className="crumbs" aria-label={t.shell.crumbs}>
      <ol>
        <li>
          <Link to="/">~</Link>
        </li>
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={crumb.to} aria-current={last ? 'page' : undefined}>
              {last ? crumb.label : <Link to={crumb.to}>{crumb.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
