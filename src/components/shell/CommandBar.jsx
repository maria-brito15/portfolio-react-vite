import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from '../../router';
import { FOCUS_COMMANDS } from './commandBarEvents';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { normalizePath } from '../../data/routes';
import CommandInput from '../../terminal/CommandInput';
import TerminalOutput from '../../terminal/TerminalOutput';
import { useTerminalSession } from '../../terminal/sessionContext';

const NARROW = '(max-width: 720px)';

// Campo de formulário? Os atalhos Ctrl+K e / não podem roubar o que a pessoa digita.
const isFormField = (el) =>
  el instanceof Element &&
  el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !== null;

// Barra de comandos fixa, logo abaixo do Header, em todas as páginas: um
// mini-terminal de uma linha que usa a mesma sessão do terminal da home.
// Fora da home, a saída aparece num painel suspenso; na home ela vai para o
// terminal. Em tela estreita a barra vira o botão `>_`, que a abre em tela cheia.
export default function CommandBar() {
  const { t } = useLanguage();
  const { path, hash, search } = useRouter();
  const { entry } = useTerminalSession();
  const narrow = useMediaQuery(NARROW);
  const bodyId = useId();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false); // tela cheia (só em tela estreita)
  const [panel, setPanel] = useState(false); // painel de saída

  const onHome = normalizePath(path) === '/';
  const overlay = narrow && open;

  // Ao trocar de página ou âncora, fecha painel e tela cheia.
  const where = path + hash + search;
  const [lastWhere, setLastWhere] = useState(where);

  if (lastWhere !== where) {
    setLastWhere(where);
    setPanel(false);
    setOpen(false);
  }

  // Abrir a tela cheia leva o foco para o campo.
  useEffect(() => {
    if (overlay) inputRef.current?.focus();
  }, [overlay]);

  // Ctrl+K (ou /) foca a barra, exceto dentro de campos de formulário.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || isFormField(event.target)) return;

      const shortcut =
        (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) ||
        (event.key === '/' && !event.ctrlKey && !event.metaKey);

      if (!shortcut) return;
      event.preventDefault();
      if (narrow) setOpen(true);
      inputRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [narrow]);

  // O botão `>_` do Header pede o foco por evento.
  useEffect(() => {
    const onFocusRequest = () => {
      if (narrow) setOpen(true);
      inputRef.current?.focus();
    };

    window.addEventListener(FOCUS_COMMANDS, onFocusRequest);

    return () => window.removeEventListener(FOCUS_COMMANDS, onFocusRequest);
  }, [narrow]);

  function afterSubmit() {
    if (!onHome || narrow) setPanel(true);
    else document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
  }

  function onKeyDown(event) {
    if (event.key !== 'Escape') return;
    if (panel) setPanel(false);
    else if (open) setOpen(false);
    else inputRef.current?.blur();
  }

  const showPanel = panel && entry && (!onHome || narrow);

  return (
    // O onKeyDown só trata Esc, vindo dos controles filhos.
    <div
      className={`cmdbar${overlay ? ' is-open' : ''}`}
      role="search"
      aria-label={t.cmdbar.label}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="cmdbar-toggle"
        aria-expanded={overlay}
        aria-controls={bodyId}
        aria-label={t.cmdbar.open}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">&gt;_</span>
        <span className="cmdbar-toggle-text">{t.cmdbar.openText}</span>
      </button>

      <div className="cmdbar-body" id={bodyId}>
        <div className="cmdbar-row">
          <CommandInput
            variant="bar"
            label={t.cmdbar.inputLabel}
            placeholder={t.cmdbar.placeholder}
            inputRef={inputRef}
            onSubmit={afterSubmit}
          />
          <kbd className="cmdbar-kbd" title={t.cmdbar.shortcut}>
            Ctrl K
          </kbd>
          <button
            type="button"
            className="cmdbar-close"
            aria-label={t.cmdbar.close}
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="cmdbar-live" aria-live="polite">
          {showPanel && (
            <div className="cmdbar-panel term" aria-label={t.cmdbar.output}>
              <button
                type="button"
                className="cmdbar-panel-close"
                aria-label={t.cmdbar.closeOutput}
                onClick={() => setPanel(false)}
              >
                <span aria-hidden="true">✕</span>
              </button>
              <TerminalOutput />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
