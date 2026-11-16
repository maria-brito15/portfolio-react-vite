import { Link } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { now } from '../data/now';
import { routeById } from '../data/routes';
import { HOME, type HomeAction } from '../data/homeLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import HomeSections from '../components/dashboard/HomeSections';

// A home é o painel do workspace: apresentação, foco atual e os blocos da composição
// (`homeLayout.ts`). O terminal continua a um clique (/terminal), mas não é mais o único caminho.
export default function Home() {
  const { lang, t } = useLanguage();
  const c = portfolio[lang];
  const h = t.ws.home;
  const focus = now.items[0];
  const actions: [HomeAction, 'primary' | 'plain'][] = [
    [HOME.primary, 'primary'],
    ...HOME.secondary.map((a): [HomeAction, 'plain'] => [a, 'plain']),
  ];

  useDocumentMeta('home');

  return (
    <SiteShell routeId="home">
      <div className="dash">
        <header className="dash-hero" id="inicio">
          <p className="t-dim">{c.hero.tag}</p>
          <h1 id="inicio-title">
            <span className="t-dim">{h.hello} </span>
            <span className="t-accent">{c.hero.terminal.name}</span>
          </h1>
          <p className="dash-roles">{c.hero.terminal.roles.join(' · ')}</p>
          <p className="dash-sub">{c.hero.sub}</p>
          {focus && (
            <p className="dash-focus">
              <strong>{h.focus}:</strong> {focus.text[lang]}
            </p>
          )}
          <p className="dash-cta">
            {actions.map(([action, kind]) => {
              const route = routeById(action.route);

              if (!route) return null;

              return (
                <Link
                  key={`${action.route}#${action.anchor ?? ''}`}
                  to={action.anchor ? `${route.path}#${action.anchor}` : route.path}
                  className={`dash-btn${kind === 'primary' ? ' dash-btn--primary' : ''}`}
                >
                  {action.label[lang]}
                </Link>
              );
            })}
          </p>
        </header>

        <HomeSections />
      </div>
    </SiteShell>
  );
}
