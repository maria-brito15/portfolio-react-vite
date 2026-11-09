import { useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ui } from '../i18n/ui';
import { useTerminalSession } from './sessionContext';
import { quickCommands } from './commands';
import CommandInput from './CommandInput';
import TerminalOutput from './TerminalOutput';

// Conteúdo da janela do terminal da página inicial (a Window é do SiteShell):
// banner, a última entrada (cada comando limpa a anterior), a linha de comando
// e os atalhos clicáveis. O estado vive na sessão compartilhada.
export default function Terminal({ content }) {
  const { lang } = useLanguage();
  const { entry, inputs, execute, busy } = useTerminalSession();
  const term = ui[lang].term;
  // Primeira visita: ainda não há nenhum comando no histórico da sessão.
  const firstVisit = inputs.length === 0;
  // Placeholder que ensina: "experimente: curriculo" (a página com mais conteúdo).
  const example = lang === 'pt' ? 'curriculo' : 'resume';
  const inputRef = useRef(null);
  const screenRef = useRef(null);
  const entryId = entry?.id;

  // Cada comando novo começa no topo da tela (o banner volta com `limpar`).
  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = 0;
  }, [entryId]);

  // Clicar em qualquer ponto vazio da janela foca a linha de comando,
  // sem atrapalhar a seleção de texto nem os links.
  function focusInput(event) {
    if (event.target.closest('a, button, input')) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <div className="term-screen" ref={screenRef} onClick={focusInput}>
        {/* O banner some da tela quando há uma saída, mas o título continua na página. */}
        <header className={`term-banner${entry ? ' sr-only' : ''}`}>
          <p className="t-dim">{content.terminal.boot}</p>
          <h1 id="inicio-title" className="term-name">
            <span className="t-accent">{content.terminal.name}</span>
          </h1>
          <p className="term-roles">
            {content.terminal.roles.map((role, i) => (
              <span key={role}>
                {i > 0 && <span className="t-dim"> · </span>}
                {role}
              </span>
            ))}
          </p>
          <p className="term-sub">{content.sub}</p>
          <p className="t-dim">{firstVisit ? term.firstVisit : content.terminal.hint}</p>
        </header>

        <div className="term-log" aria-live="polite">
          <TerminalOutput />
        </div>

        <CommandInput
          label={content.terminal.inputLabel}
          placeholder={entry || busy ? '' : `${term.try} ${example}`}
          inputRef={inputRef}
        />
      </div>

      <div className="term-quick" role="group" aria-label={content.terminal.quickLabel}>
        {quickCommands[lang].map((cmd) => (
          <button type="button" key={cmd} onClick={() => execute(cmd)} disabled={busy}>
            <span aria-hidden="true">$ </span>
            {cmd}
          </button>
        ))}
      </div>
    </>
  );
}
