import { Link } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { now } from '../data/now';
import { routeById } from '../data/routes';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import GithubStats from '../components/GithubStats';
import QuickAccess from '../components/dashboard/QuickAccess';
import FeaturedProjects from '../components/dashboard/FeaturedProjects';
import InteractivePanel from '../components/dashboard/InteractivePanel';

// A home é o painel do workspace: apresentação, foco atual, acesso rápido,
// projetos em destaque, resumo do GitHub e as experiências interativas. O
// terminal continua a um clique (/terminal), mas não é mais o único caminho.
// `routeId` só muda para as rotas de persona (`/r/tech`), que mostram esta mesma
// página mas ficam fora do índice dos buscadores (meta em `seo.ts`).
export default function Home({ routeId = 'home' }: { routeId?: string }) {
  const { lang, t } = useLanguage();
  const c = portfolio[lang];
  const h = t.ws.home;
  const focus = now.items[0];

  useDocumentMeta(routeId);

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
            <Link
              to={routeById('projetos')?.path ?? '/projetos'}
              className="dash-btn dash-btn--primary"
            >
              {h.ctaProjects}
            </Link>
            <Link to={routeById('curriculo')?.path ?? '/curriculo'} className="dash-btn">
              {h.ctaResume}
            </Link>
            <Link to={routeById('terminal')?.path ?? '/terminal'} className="dash-btn">
              {h.ctaTerminal}
            </Link>
          </p>
        </header>

        <QuickAccess />
        <FeaturedProjects />
        <div className="dash-split">
          <GithubStats summary />
          <InteractivePanel />
        </div>
      </div>
    </SiteShell>
  );
}
