import { useCallback, useId, useState, type ReactNode } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useRouter } from '../../router';
import { crumbsFor, routeById, terminalUrl, windowPath } from '../../data/routes';
import Header from './Header';
import Sidebar from './Sidebar';
import CommandBar from './CommandBar';
import Window from './Window';
import Breadcrumb from './Breadcrumb';
import ViewActions from './ViewActions';
import Footer from './Footer';
import Taskbar from './Taskbar';

// Esqueleto único de todas as páginas:
//   Header → barra de comandos → Sidebar + [voltar + breadcrumb] → Window → Footer
// Nenhuma página monta isso por conta própria. `routeId` vem de routes.ts;
// o 404 não está na tabela e informa só o caminho digitado (`missingPath`).
//
// - `children` vai dentro da Window (o terminal, na página /terminal);
// - a home (`routeId="home"`) é o painel: sem Window, sem breadcrumb, e o
//   conteúdo ocupa a área toda (as janelas são só das páginas e do terminal);
// - `badge` é o selo à direita da barra de título;
// - `after` vai logo abaixo da Window (ex.: o catálogo de comandos do terminal).
interface SiteShellProps {
  routeId?: string;
  missingPath?: string;
  badge?: ReactNode;
  variant?: string;
  after?: ReactNode;
  children?: ReactNode;
}

export default function SiteShell({
  routeId,
  missingPath,
  badge,
  variant,
  after,
  children,
}: SiteShellProps) {
  const { lang, t } = useLanguage();
  const { path, hash, back, navigate } = useRouter();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const route = routeId ? routeById(routeId) : undefined;
  const dashboard = routeId === 'home';
  const terminal = routeId === 'terminal';

  // Trocar de página fecha a gaveta do menu.
  const where = path + hash;
  const [lastWhere, setLastWhere] = useState(where);

  if (lastWhere !== where) {
    setLastWhere(where);
    setMenuOpen(false);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const crumbs = missingPath
    ? [{ label: missingPath.replace(/^\/+/, '') || '/', to: missingPath }]
    : crumbsFor(route, lang);
  const title = `visitante@mariab.dev: ${
    missingPath ? `~/${crumbs[0].label}` : windowPath(route, lang)
  }`;

  // Páginas com visão em terminal ganham o par de ações na barra de título.
  const actions =
    route?.command && !dashboard && !terminal ? (
      <ViewActions view="page" terminal={{ to: terminalUrl(route) }} page={{}} />
    ) : null;

  return (
    <>
      <div className="grid-bg" aria-hidden="true"></div>
      <div className="site-top">
        <Header menuOpen={menuOpen} menuId={menuId} onMenu={() => setMenuOpen((open) => !open)} />
        <CommandBar />
      </div>
      <div className="workspace">
        <Sidebar id={menuId} open={menuOpen} onClose={closeMenu} />
        <main className={`shell${dashboard ? ' shell--dashboard' : ''}`}>
          <section
            className="shell-stage"
            id={terminal ? 'terminal' : undefined}
            aria-labelledby={terminal ? 'inicio-title' : undefined}
          >
            {dashboard ? (
              children
            ) : (
              <>
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
                <Window
                  id={routeId ?? 'notfound'}
                  title={title}
                  badge={badge}
                  actions={actions}
                  variant={variant}
                  onClose={() => navigate('/')}
                >
                  {children}
                </Window>
                {after}
              </>
            )}
          </section>
        </main>
      </div>
      <Footer />
      <Taskbar />
    </>
  );
}
