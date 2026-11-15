import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useRouter } from '../../router';
import { crumbsFor, routeById, windowPath } from '../../data/routes';
import { chapterFor } from '../../data/notebook/chapters';
import type { SiteShellProps } from '../shell/shellProps';
import Window from '../shell/Window';
import Breadcrumb from '../shell/Breadcrumb';
import PageNext from '../PageNext';
import TopBar from './TopBar';
import Marquee from './Marquee';
import ChapterHeader from './ChapterHeader';
import CreditsFooter from './CreditsFooter';

// Cada página monta o próprio shell (ele remonta a cada rota), então o caminho anterior vive no módulo.
const previous: { current: string | null } = { current: null };

// Esqueleto do caderno (CD-12 a CD-17, CD-70, CD-71):
//   skip-link → barra superior → faixa cultural → [cabeçalho de capítulo | Window] → créditos
// Window só em `/terminal` e nos estudos de caso (rotas com `parent: 'projetos'`); nas demais, o
// cabeçalho de capítulo. A home e o 404 trazem o próprio cabeçalho. Breadcrumb só em páginas profundas.
// Um só <main id="main-content">; a região viva anuncia o capítulo a cada rota.
export default function NotebookShell({
  routeId,
  missingPath,
  badge,
  variant,
  after,
  children,
}: SiteShellProps) {
  const { lang, t } = useLanguage();
  const { path } = useRouter();
  const route = routeId ? routeById(routeId) : undefined;
  const home = routeId === 'home';
  const terminal = routeId === 'terminal';
  const caseStudy = route?.parent === 'projetos';
  const windowed = terminal || caseStudy;
  const deep = Boolean(route?.parent) && !caseStudy;
  const main = useRef<HTMLElement>(null);

  // Título anunciado: o capítulo (ex.: "03 CINEMA") ou o rótulo da rota.
  const chapter = chapterFor(routeId);
  const title = home
    ? t.nb.liveHome
    : chapter?.key
      ? t.nb.rows[chapter.key].name
      : (route?.label[lang] ?? missingPath ?? '');
  const [announce, setAnnounce] = useState('');

  // Cada mudança de rota: anuncia o capítulo e leva o foco ao <main> (sem rolar).
  useEffect(() => {
    // A região viva já existe vazia; o texto entra depois, para os leitores de tela o anunciarem.
    const timer = window.setTimeout(() => setAnnounce(t.nb.live(title)), 60);

    // Não rouba o foco na primeira carga (o skip-link precisa ser o primeiro foco).
    if (previous.current !== null && previous.current !== path) {
      main.current?.focus({ preventScroll: true });
    }
    previous.current = path;

    return () => window.clearTimeout(timer);
  }, [path, title, t]);

  const crumbs = missingPath
    ? [{ label: missingPath.replace(/^\/+/, '') || '/', to: missingPath }]
    : crumbsFor(route, lang);

  return (
    <>
      <a className="nb-skip" href="#main-content">
        {t.nb.skip}
      </a>
      <div className="nb-root">
        <div className="nb-head">
          <TopBar />
          <Marquee />
        </div>
        <main
          id="main-content"
          className={`nb-main${home ? ' nb-main--home' : ''}`}
          tabIndex={-1}
          ref={main}
        >
          {home ? (
            children
          ) : missingPath ? (
            <div className="nb-page">{children}</div>
          ) : windowed ? (
            <section className="nb-window">
              {terminal && (
                <div className="nb-studio">
                  <p className="nb-chapter-line">
                    <span className="nb-chapter-name">{t.nb.studio.title}</span>
                  </p>
                  <p className="nb-kicker">{t.nb.studio.sub}</p>
                </div>
              )}
              {(deep || caseStudy) && <Breadcrumb crumbs={crumbs} />}
              <Window
                id={routeId ?? 'notfound'}
                title={`visitante@mariab.dev: ${windowPath(route, lang)}`}
                badge={badge}
                variant={variant}
              >
                {children}
              </Window>
              {after}
              {caseStudy && <PageNext routeId={routeId as string} />}
            </section>
          ) : (
            <div className="nb-page" id={terminal ? 'terminal' : undefined}>
              {routeId && <ChapterHeader routeId={routeId} />}
              {deep && <Breadcrumb crumbs={crumbs} />}
              {children}
              {after}
              {routeId && !terminal && <PageNext routeId={routeId} />}
            </div>
          )}
        </main>
        <CreditsFooter />
        <div className="nb-sr" role="status" aria-live="polite">
          {announce}
        </div>
      </div>
    </>
  );
}
