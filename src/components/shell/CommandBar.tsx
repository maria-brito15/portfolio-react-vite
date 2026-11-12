import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useRouter } from '../../router';
import { SHOW_OUTPUT } from './commandBarEvents';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TERMINAL_PATH, normalizePath } from '../../data/routes';
import CommandInput from '../../terminal/CommandInput';
import TerminalOutput from '../../terminal/TerminalOutput';
import { useTerminalSession } from '../../terminal/sessionContext';

const NARROW = '(max-width: 720px)';

// Campo de formulário? Os atalhos Ctrl+K e / não podem roubar o que a pessoa digita.
const isFormField = (el: EventTarget | null) =>
  el instanceof Element &&
  el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !== null;

// Barra de comandos fixa, logo abaixo do Header, em todas as páginas: um
// mini-terminal de uma linha que usa a mesma sessão do terminal da home.
// Fora do terminal, a saída aparece num painel suspenso; no terminal ela vai para o
// terminal da página. Em tela estreita a barra vira o botão `>_`, que a abre em tela cheia.
export default function CommandBar() {
  const { t } = useLanguage();
  const { path, hash, search } = useRouter();
  const { entry } = useTerminalSession();
  const narrow = useMediaQuery(NARROW);
  const bodyId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false); // tela cheia (só em tela estreita)
  const [panel, setPanel] = useState(false); // painel de saída

  const onTerminal = normalizePath(path) === TERMINAL_PATH;
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

  // `/` foca a barra, exceto dentro de campos de formulário. (Ctrl+K abre a
  // paleta de comandos: ver GlobalOverlays.)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || isFormField(event.target)) return;
      if (event.key !== '/' || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      if (narrow) setOpen(true);
      inputRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [narrow]);

  function afterSubmit() {
    if (!onTerminal || narrow) setPanel(true);
    else document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' });
  }

  // A paleta de comandos roda o comando na sessão e pede para mostrar a saída.
  useEffect(() => {
    const onShowOutput = () => {
      if (!onTerminal || narrow) setPanel(true);
      else document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener(SHOW_OUTPUT, onShowOutput);

    return () => window.removeEventListener(SHOW_OUTPUT, onShowOutput);
  }, [onTerminal, narrow]);

  function onKeyDown(event: ReactKeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (panel) setPanel(false);
    else if (open) setOpen(false);
    else inputRef.current?.blur();
  }

  const showPanel = panel && entry && (!onTerminal || narrow);

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
