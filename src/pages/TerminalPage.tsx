import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import CommandCatalog from '../components/CommandCatalog';
import Terminal from '../terminal/Terminal';

// O terminal do site, numa página própria: a janela com a linha de comando e,
// logo abaixo, a documentação dos comandos (cada um roda com um clique).
export default function TerminalPage() {
  const { lang, t } = useLanguage();
  const c = portfolio[lang];

  useDocumentMeta('terminal');

  return (
    <SiteShell
      routeId="terminal"
      variant="terminal"
      badge={c.hero.tag}
      after={<CommandCatalog title={t.ws.terminal.catalog} lead={t.ws.terminal.catalogLead} />}
    >
      <Terminal content={c.hero} />
    </SiteShell>
  );
}
