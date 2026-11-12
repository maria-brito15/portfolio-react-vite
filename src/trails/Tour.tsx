import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useRouter } from '../router';
import { normalizePath, routeById } from '../data/routes';
import { prefersReducedMotion } from '../utils/env';
import { useTerminalSession } from '../terminal/sessionContext';
import type { TrailStep } from '../data/trails';
import { useTrail } from './TrailProvider';

// Tour com destaque (docs/specs/trilhas/): leva à página do passo, destaca o elemento
// real com um anel e mostra o cartão com o texto, o contador e os botões. Carregado
// sob demanda (TourHost). O anel é decorativo (`aria-hidden`); quem lê a tela segue o
// cartão, que recebe o foco a cada passo e devolve o foco ao sair.
const FIND_TIMEOUT_MS = 4000;
const RING_PAD = 6;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Elemento do passo: a âncora da página ou, sem ela, o primeiro título.
const findTarget = (step: TrailStep) =>
  step.anchor
    ? document.getElementById(step.anchor)
    : document.querySelector<HTMLElement>('main h1, h1');

// Texto com `código` entre crases (os comandos dos passos).
function withCode(text: string) {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

export default function Tour() {
  const { lang, t } = useLanguage();
  const { path, navigate } = useRouter();
  const session = useTerminalSession();
  const { trail, steps, step, index, progress, next, prev, exit, markDone } = useTrail();
  const text = t.trail;
  // Alvo achado, junto do passo a que pertence (trocar de passo "esquece" o anterior
  // sem precisar zerar o estado dentro de um efeito).
  const [found, setFound] = useState<{ id: string; el: HTMLElement } | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const cardRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(
    typeof document === 'undefined' ? null : document.activeElement,
  );

  const route = step ? routeById(step.route) : undefined;
  const onRoute = Boolean(route && normalizePath(path) === route.path);
  const target = found && step && found.id === step.id ? found.el : null;

  // Devolve o foco a quem abriu o tour, se esse elemento ainda existe.
  useEffect(
    () => () => {
      const el = opener.current;

      if (el instanceof HTMLElement && document.contains(el)) el.focus({ preventScroll: true });
    },
    [],
  );

  // Leva à página do passo.
  useEffect(() => {
    if (route && !onRoute) navigate(route.path);
  }, [route, onRoute, navigate]);

  // Passo "ver": conclui assim que a página dele está aberta.
  useEffect(() => {
    if (step?.kind === 'ver' && onRoute) markDone(step.id);
  }, [step, onRoute, markDone]);

  // Acha o alvo (a página pode demorar a montar) e rola até ele. Sem alvo, o cartão
  // aparece do mesmo jeito, sem anel (TR-13).
  useEffect(() => {
    if (!step || !onRoute) return;

    let frame = 0;
    const started = performance.now();

    const look = () => {
      const el = findTarget(step);

      if (el) {
        setFound({ id: step.id, el });

        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY - window.innerHeight * 0.18;

        window.scrollTo({
          top: Math.max(top, 0),
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });

        return;
      }
      if (performance.now() - started < FIND_TIMEOUT_MS) frame = requestAnimationFrame(look);
    };

    frame = requestAnimationFrame(look);

    return () => cancelAnimationFrame(frame);
  }, [step, onRoute]);

  // Posição do anel e do cartão: acompanha rolagem, redimensionamento e mudanças do alvo.
  const measure = useCallback(() => {
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const top = Math.max(rect.top - RING_PAD, 4);
    const bottom = Math.min(rect.bottom + RING_PAD, window.innerHeight - 4);

    setBox(
      bottom > top
        ? {
            top,
            left: rect.left - RING_PAD,
            width: rect.width + RING_PAD * 2,
            height: bottom - top,
          }
        : null,
    );
    // Alvo na metade de baixo da tela: o cartão sobe, para nunca cobri-lo.
    setPlacement(rect.top + rect.height / 2 > window.innerHeight / 2 ? 'top' : 'bottom');
  }, [target]);

  useEffect(() => {
    if (!target) return;

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);

    observer?.observe(target);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [target, measure]);

  // O foco vai para o cartão a cada passo (o leitor de tela lê o texto novo).
  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, [step?.id]);

  // Esc sai do tour de onde estiver o foco.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        exit();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [exit]);

  if (!trail || !step) return null;

  const done = progress.done.includes(step.id);
  const last = index === steps.length - 1;

  // Ação do passo "agir": conclui o passo e fecha a trilha (o link navega).
  function act() {
    if (!step?.action) return;
    markDone(step.id);

    if (step.action.kind === 'print') {
      window.print();

      return;
    }

    const to = routeById(step.action.route);

    if (to) navigate(`${to.path}${step.action.anchor ? `#${step.action.anchor}` : ''}`);
    next();
  }

  const actionLabel =
    step.action?.kind === 'print'
      ? text.print
      : step.action
        ? (routeById(step.action.route)?.label[lang] ?? '')
        : '';

  return (
    <>
      {target && box && (
        <div
          className="tour-ring"
          aria-hidden="true"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        />
      )}

      <div
        ref={cardRef}
        className={`tour-card tour-card--${placement}`}
        role="dialog"
        aria-modal="false"
        aria-label={`${text.region}: ${trail.title[lang]}`}
        tabIndex={-1}
      >
        <p className="tour-meta t-dim">
          <span>{trail.title[lang]}</span> <span>{text.counter(index + 1, steps.length)}</span>
        </p>

        <p className="tour-text" aria-live="polite">
          {withCode(step.text(lang))}
        </p>

        {step.kind === 'fazer' && step.command && (
          <p className="tour-act">
            <button
              type="button"
              className="dash-btn"
              onClick={() => session?.execute(step.command as string)}
              disabled={session?.busy}
            >
              {text.run} <code>{step.command}</code>
            </button>
          </p>
        )}

        {step.kind === 'agir' && step.action && (
          <p className="tour-act">
            <button type="button" className="dash-btn dash-btn--primary" onClick={act}>
              {actionLabel}
            </button>
          </p>
        )}

        {done && step.kind !== 'ver' && (
          <p className="tour-done" role="status">
            ✓ {text.done}
          </p>
        )}

        <div className="tour-nav">
          <button type="button" className="dash-btn" onClick={prev} disabled={index === 0}>
            {text.previous}
          </button>
          <button type="button" className="dash-btn dash-btn--primary" onClick={next}>
            {last ? text.finish : text.next}
          </button>
          <button type="button" className="persona-link" onClick={exit}>
            {text.exit}
          </button>
        </div>
      </div>
    </>
  );
}
