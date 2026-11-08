import { useLanguage } from '../i18n/LanguageContext';
import Prompt from './Prompt';
import { EntryContext, RedirectLine } from './outputs';
import { useTerminalSession } from './sessionContext';

// Desenha a única entrada da tela (último comando + saída + estado do
// redirecionamento). Usada no terminal da home e no painel da barra de comandos.
export default function TerminalOutput() {
  const { lang } = useLanguage();
  const { entry, progress } = useTerminalSession();
  if (!entry) return null;
  return (
    <EntryContext.Provider value={entry.id}>
      <div className="term-entry">
        <p className="term-line">
          <Prompt />
          <span className="t-input">{entry.input}</span>
        </p>
        {entry.output(lang)}
        <RedirectLine redirect={entry.redirect} progress={progress} />
      </div>
    </EntryContext.Provider>
  );
}
