// Diálogo modal simples: portal no <body>, foco preso dentro, Esc fecha, clique
// no fundo fecha e o foco volta para quem o abriu. Usado pela paleta de
// comandos e pela lista de atalhos.
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]';

export default function Overlay({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);

  // Foca o primeiro campo (ou controle) ao abrir e devolve o foco ao fechar.
  useEffect(() => {
    const opener = document.activeElement;
    const first =
      box.current?.querySelector<HTMLElement>('[data-autofocus]') ??
      box.current?.querySelector<HTMLElement>(FOCUSABLE);

    first?.focus();

    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();

      return;
    }
    if (event.key !== 'Tab') return;

    // Tab e Shift+Tab circulam só dentro do diálogo.
    const items = [...(box.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];

    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="overlay-box"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        ref={box}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
