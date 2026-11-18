import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

const FOCUSABLE = 'a[href], button:not([disabled])';

// Menu em tela estreita (TD-010, FR-013 a FR-015). O botão e o painel estão SEMPRE no HTML: abaixo
// de 1024 px (e só com a classe `js` no <html>) o CSS esconde o painel até `data-open`; sem
// JavaScript, ou em tela larga, o painel é a linha única normal. Foco: ao abrir vai ao primeiro
// item; ao fechar (botão, Esc, escolha de item) volta ao botão.
export default function Menu({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    button.current?.focus();
  }

  function onPanelClick(event: MouseEvent) {
    // Escolher um item (link) fecha o painel; os controles de tema e idioma ficam abertos.
    if ((event.target as HTMLElement).closest('nav a')) close();
  }

  return (
    <div
      className="menu"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        className="menu-button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t.menu.close : t.menu.open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>
      <div
        ref={panel}
        id={panelId}
        className="menu-panel"
        data-open={open ? 'true' : undefined}
        onClick={onPanelClick}
      >
        {children}
      </div>
    </div>
  );
}
