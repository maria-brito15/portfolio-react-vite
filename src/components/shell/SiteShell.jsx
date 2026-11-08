import { useLanguage } from '../../i18n/LanguageContext';
import { useRouter } from '../../router';
import { crumbsFor, routeById, terminalUrl, windowPath } from '../../data/routes';
import Header from './Header';
import CommandBar from './CommandBar';
import Window from './Window';
import Breadcrumb from './Breadcrumb';
import ViewActions from './ViewActions';
import Footer from './Footer';

// Esqueleto único de todas as páginas:
//   Header → barra de comandos → [voltar + breadcrumb] → Window → conteúdo → Footer
// Nenhuma página monta isso por conta própria. `routeId` vem de routes.js;
// o 404 não está na tabela e informa só o caminho digitado (`missingPath`).
//
// - `children` vai dentro da Window (o terminal, no caso da home);
// - `after` vai logo abaixo dela (as demais seções da home);
// - `badge` é o selo à direita da barra de título.
export default function SiteShell({ routeId, missingPath, badge, variant, children, after }) {
  const { lang, t } = useLanguage();
  const { back } = useRouter();
  const route = routeId ? routeById(routeId) : null;
  const home = routeId === 'home';

  const crumbs = missingPath
    ? [{ label: missingPath.replace(/^\/+/, '') || '/', to: missingPath }]
    : crumbsFor(route, lang);
  const title = `visitante@mariab.dev: ${
    missingPath ? `~/${crumbs[0].label}` : windowPath(route, lang)
  }`;

  // Páginas com visão em terminal ganham o par de ações na barra de título.
  const actions =
    route?.command && !home ? (
      <ViewActions view="page" terminal={{ to: terminalUrl(route) }} page={{}} />
    ) : null;

  return (
    <>
      <div className="grid-bg" aria-hidden="true"></div>
      <div className="site-top">
        <Header />
        <CommandBar />
      </div>
      <main className={`shell${home ? ' shell--home' : ''}`}>
        <section
          className="shell-stage"
          id={home ? 'inicio' : undefined}
          aria-labelledby={home ? 'inicio-title' : undefined}
        >
          {home && (
            <div className="shell-glow" aria-hidden="true">
              <div className="glow"></div>
            </div>
          )}
          {!home && (
            <div className="shell-nav">
              <button
                type="button"
                className="shell-back"
                onClick={back}
                aria-label={t.shell.backLabel}
              >
                {t.shell.back}
              </button>
              <Breadcrumb crumbs={crumbs} />
            </div>
          )}
          <Window title={title} badge={badge} actions={actions} variant={variant}>
            {children}
          </Window>
        </section>
        {after}
      </main>
      <Footer />
    </>
  );
}
