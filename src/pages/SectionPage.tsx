import { useLanguage } from '../i18n/LanguageContext';
import type { ReactNode } from 'react';
import { portfolio, type PortfolioContent } from '../data/portfolio';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import About from '../sections/portfolio/About';
import Skills from '../sections/portfolio/Skills';
import Projects from '../sections/portfolio/Projects';
import Experience from '../sections/portfolio/Experience';
import Contact from '../sections/portfolio/Contact';

// As antigas seções da home viraram páginas próprias, cada uma dentro da
// Window do SiteShell. `key` é a chave do conteúdo em src/data/portfolio.tsx.
const SECTIONS: Record<string, (c: PortfolioContent) => ReactNode> = {
  sobre: (c) => <About content={c.about} />,
  habilidades: (c) => <Skills content={c.skills} />,
  projetos: (c) => <Projects content={c.projects} />,
  experiencias: (c) => <Experience content={c.experience} />,
  contato: (c) => <Contact content={c.contact} />,
};

export default function SectionPage({ routeId }: { routeId: string }) {
  const { lang } = useLanguage();
  const c = portfolio[lang];
  const render = SECTIONS[routeId];

  useDocumentMeta(routeId);

  return <SiteShell routeId={routeId}>{render(c)}</SiteShell>;
}
