import { useEffect } from 'react';
import { Link } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { usePersona } from '../hooks/usePersona';
import { homeFor } from '../data/personaHome';
import { suggestionsFor, type NextAction } from '../data/nextActions';
import { markVisited, readVisited } from '../utils/visited';
import { routeById } from '../data/routes';
import { isCrawler } from '../utils/env';
import { useTrail } from '../trails/TrailProvider';
import TrailProgress from '../trails/TrailProgress';

// Faixa discreta ao fim de cada página (SiteShell): um próximo passo principal e um
// secundário para a persona ativa (`nextActions.ts`) e, quando a página é uma parada da
// trilha, o andamento dela com um botão para continuar. Nada abre sozinho: o tour só
// começa no clique. O progresso é o do `TrailProvider`; aqui só se lê.
function href(action: NextAction) {
  const route = routeById(action.route);

  if (!route || route.draft) return undefined;

  return action.anchor ? `${route.path}#${action.anchor}` : route.path;
}

export default function PageNext({ routeId }: { routeId: string }) {
  const { lang, t } = useLanguage();
  const { persona } = usePersona();
  const { trail, steps, step, progress, doneCount, found, active, start, dismiss } = useTrail();
  const text = t.trail;
  // Lido antes de marcar esta página como vista, para não sugerir o que já foi aberto.
  const visited = readVisited();
  const [first, second] = suggestionsFor(persona?.id, routeId, visited);
  const primary = first && href(first);
  const secondary = second && href(second);

  useEffect(() => markVisited(routeId), [routeId]);

  // A trilha aparece nas páginas que são paradas dela, ou quando já foi começada; some com
  // "Agora não" (o cartão da home e o comando `trilha` a trazem de volta) e com o tour aberto.
  const started = doneCount > 0 || progress.step > 0;
  const onTrail = steps.some((s) => s.route === routeId);
  const showTrail =
    Boolean(trail && persona) &&
    !active &&
    !progress.dismissed &&
    !isCrawler() &&
    (onTrail || started || progress.finished);

  if (!primary && !showTrail) return null;

  return (
    <nav className="page-next" aria-label={text.pageNext} data-tone={homeFor(persona?.id).tone}>
      {primary && first && (
        <div className="page-next-actions">
          <span className="t-dim">{text.pageNext}</span>
          <Link to={primary} className="dash-btn dash-btn--primary">
            {first.label[lang]}
          </Link>
          {secondary && second && (
            <Link to={secondary} className="page-next-secondary">
              {second.label[lang]}
            </Link>
          )}
        </div>
      )}

      {showTrail && trail && (
        <div className="page-next-trail">
          <span>
            <strong>{trail.title[lang]}</strong>
            {progress.finished ? (
              <span className="trail-seal"> {text.completed}</span>
            ) : (
              started &&
              step && (
                <span className="t-dim">
                  {' '}
                  · {text.nextStop(routeById(step.route)?.label[lang] ?? '')}
                </span>
              )
            )}
          </span>
          {!progress.finished && (
            <>
              <TrailProgress
                trail={trail}
                done={doneCount}
                total={steps.length}
                found={found}
                compact
              />
              <button type="button" className="page-next-trail-btn" onClick={start}>
                {started ? text.resume(doneCount, steps.length) : text.offer}
              </button>
              <button
                type="button"
                className="page-next-trail-btn page-next-trail-btn--quiet"
                onClick={dismiss}
              >
                {text.notNow}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
