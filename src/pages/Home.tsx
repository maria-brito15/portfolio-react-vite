import { Link } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { now } from '../data/now';
import { routeById } from '../data/routes';
import { homeFor, primaryAction, type HomeAction } from '../data/personaHome';
import { usePersona } from '../hooks/usePersona';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import PersonaPrompt from '../components/PersonaPrompt';
import TrailCard from '../trails/TrailCard';
import PersonaHomeSections from '../components/dashboard/PersonaHomeSections';
import NotebookHome from '../components/notebook/NotebookHome';
import { CADERNO_V2 } from '../config';

// A home é o painel do workspace: apresentação, foco atual e os blocos da composição da
// persona (`personaHome.ts`; sem persona, a padrão). O terminal continua a um clique
// (/terminal), mas não é mais o único caminho.
// `routeId` só muda para as rotas de persona (`/r/tech`), que mostram esta mesma
// página mas ficam fora do índice dos buscadores (meta em `seo.ts`).
export default function Home({ routeId = 'home' }: { routeId?: string }) {
  const { lang, t } = useLanguage();
  const { persona } = usePersona();
  const c = portfolio[lang];
  const h = t.ws.home;
  const focus = now.items[0];
  const home = homeFor(persona?.id);
  const actions: [HomeAction, 'primary' | 'plain'][] = [
    [primaryAction(persona?.id), 'primary'],
    ...home.secondary.map((a): [HomeAction, 'plain'] => [a, 'plain']),
  ];

  useDocumentMeta(routeId);

  // Caderno (CD-10): capa + sommaire no lugar do painel; o painel abaixo fica como está com a flag desligada.
  if (CADERNO_V2) {
    return (
      <SiteShell routeId="home">
        <NotebookHome />
      </SiteShell>
    );
  }

  return (
    <SiteShell routeId="home">
      <div className="dash" data-persona={persona?.id} data-tone={home.tone}>
        <header className="dash-hero" id="inicio">
          <p className="t-dim">{c.hero.tag}</p>
          <h1 id="inicio-title">
            <span className="t-dim">{h.hello} </span>
            <span className="t-accent">{c.hero.terminal.name}</span>
          </h1>
          <p className="dash-roles">{c.hero.terminal.roles.join(' · ')}</p>
          <p className="dash-sub">{c.hero.sub}</p>
          {persona && home.intro && <p className="dash-lens">{home.intro[lang]}</p>}
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

        <PersonaPrompt />
        <TrailCard />
        <PersonaHomeSections />
      </div>
    </SiteShell>
  );
}
