// A "janelinha" de todo o site: barra de título (três bolinhas, caminho do
// tipo `visitante@mariab.dev: ~/academico`, ações opcionais e badge) e o
// conteúdo. O terminal da home e as páginas dedicadas usam o mesmo componente.
//
// Em tela larga com mouse (WindowProvider) as bolinhas funcionam (fechar,
// recolher, maximizar) e a barra de título arrasta a janela, também pelo
// teclado (setas movem 16 px, Home volta ao lugar). Nas outras telas a janela
// é fixa e as bolinhas são só desenho.
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { clampPosition, keyDelta, type Origin } from './windowGeometry';
import { useWindowManager } from './windowManager';

interface WindowProps {
  // Identifica a janela para posição, maximizar e barra de tarefas.
  id?: string;
  title?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  variant?: string;
  className?: string;
  // Fechar numa página volta à home; sem isso (a própria home), fechar recolhe.
  onClose?: () => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}

const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });

export default function Window({
  id,
  title,
  badge,
  actions,
  variant,
  className = '',
  onClose,
  onClick, // usado pelo terminal: clicar na janela foca a linha de comando
  children,
}: WindowProps) {
  const { t } = useLanguage();
  const manager = useWindowManager();
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; from: { x: number; y: number } } | null>(
    null,
  );

  const managed = manager.managed && id !== undefined;
  const pos = id ? manager.position(id) : { x: 0, y: 0 };
  const maximized = managed && manager.maximized(id as string);
  const minimized = managed && manager.minimized?.id === id;
  const label = typeof title === 'string' ? title : (id ?? '');

  const { forget } = manager;

  useEffect(() => {
    if (!id) return;

    return () => forget(id);
  }, [id, forget]);

  const cls = [
    'win',
    variant && `win--${variant}`,
    variant === 'terminal' && 'term',
    maximized && 'is-max',
    minimized && 'is-min',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Retângulo da janela sem o deslocamento atual: base do limite do arrasto.
  function originOf(): Origin | null {
    const rect = ref.current?.getBoundingClientRect();

    return rect ? { left: rect.left - pos.x, top: rect.top - pos.y, width: rect.width } : null;
  }

  function moveTo(next: { x: number; y: number }) {
    const origin = originOf();

    if (id && origin) manager.moveTo(id, clampPosition(next, origin, viewport()));
  }

  const onBar = managed && !maximized;

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!onBar || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button, a, input')) return;
    drag.current = { startX: event.clientX, startY: event.clientY, from: pos };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const d = drag.current;

    if (d)
      moveTo({ x: d.from.x + event.clientX - d.startX, y: d.from.y + event.clientY - d.startY });
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    drag.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function onBarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!onBar || event.target !== event.currentTarget) return;
    if (event.key === 'Home') {
      event.preventDefault();
      if (id) manager.resetPosition(id);

      return;
    }

    const delta = keyDelta(event.key);

    if (!delta) return;
    event.preventDefault();
    moveTo({ x: pos.x + delta.x, y: pos.y + delta.y });
  }

  function close() {
    if (onClose) onClose();
    else if (id) manager.minimize(id, label);
  }

  function toggleMinimize() {
    if (!id) return;
    if (minimized) manager.restore();
    else manager.minimize(id, label);
  }

  const barProps = managed
    ? {
        role: 'group' as const,
        tabIndex: 0,
        'aria-label': t.win.titleBar,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
        onKeyDown: onBarKeyDown,
        onDoubleClick: (event: MouseEvent<HTMLDivElement>) => {
          if (id && !(event.target as HTMLElement).closest('button, a')) manager.resetPosition(id);
        },
      }
    : {};

  return (
    <div
      className={cls}
      onClick={onClick}
      ref={ref}
      style={
        managed && (pos.x || pos.y) ? { transform: `translate(${pos.x}px, ${pos.y}px)` } : undefined
      }
    >
      <div className={`win-bar${managed ? ' is-draggable' : ''}`} {...barProps}>
        {managed ? (
          <span className="win-dots">
            <button type="button" className="win-dot" aria-label={t.win.close} onClick={close}>
              <i></i>
            </button>
            <button
              type="button"
              className="win-dot"
              aria-label={minimized ? t.win.restore : t.win.minimize}
              onClick={toggleMinimize}
            >
              <i></i>
            </button>
            <button
              type="button"
              className="win-dot"
              aria-label={maximized ? t.win.restore : t.win.maximize}
              aria-pressed={maximized}
              onClick={() => id && manager.toggleMaximized(id)}
            >
              <i></i>
            </button>
          </span>
        ) : (
          <span className="win-dots" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
        )}
        <span className="win-title">{title}</span>
        {actions}
        {badge && <span className="win-badge">{badge}</span>}
      </div>
      <div className="win-body" hidden={minimized}>
        {children}
      </div>
    </div>
  );
}
