import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import CommandCatalog from '../components/CommandCatalog';
import Terminal from '../terminal/Terminal';
import { TerminalProvider } from '../terminal/TerminalSession';

// O terminal do site, numa página própria (rota `bare`: a casca só dá a faixa e o `main`; a sessão
// do terminal nasce aqui, T3.5): o selo,
// a linha de comando e, logo abaixo, a documentação dos comandos (cada um roda com um clique).
export default function TerminalPage() {
  const { lang, t } = useLanguage();
  const c = portfolio[lang];

  useDocumentMeta('terminal');

  return (
    <TerminalProvider>
      <div className="terminal-page" id="terminal">
        <p className="t-dim terminal-badge">{c.hero.tag}</p>
        <Terminal content={c.hero} />
        <CommandCatalog title={t.ws.terminal.catalog} lead={t.ws.terminal.catalogLead} />
      </div>
    </TerminalProvider>
  );
}
