import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import Terminal from '../terminal/Terminal';

// A home é o terminal: tudo o mais (sobre, habilidades, projetos, experiências,
// contato…) é um comando que mostra a visão em terminal ou abre a página própria.
export default function Home() {
  const { lang } = useLanguage();
  const c = portfolio[lang];
  useDocumentMeta(c.meta);
  return (
    <SiteShell routeId="home" variant="terminal" badge={c.hero.tag}>
      <Terminal content={c.hero} />
    </SiteShell>
  );
}
