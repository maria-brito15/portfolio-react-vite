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
import AuthorNotes from '../components/notebook/AuthorNotes';
import Postscript from '../components/notebook/Postscript';
import { CADERNO_V2 } from '../config';

// As antigas seções da home viraram páginas próprias, cada uma dentro da
// Window do SiteShell. `key` é a chave do conteúdo em src/data/portfolio.tsx.
const SECTIONS: Record<string, (c: PortfolioContent) => ReactNode> = {
  sobre: (c) => <About content={c.about} />,
  habilidades: (c) => <Skills content={c.skills} />,
  projetos: (c) => <Projects content={c.projects} />,
  experiencias: (c) => <Experience content={c.experience} />,
  contato: (c) => <Contact content={c.contact} />,
};

// Caderno (CD-23, CD-24): o Sobre vira carta e o Contato vira "PS"; as demais seções não mudam.
const NOTEBOOK: Record<string, (c: PortfolioContent) => ReactNode> = {
  sobre: (c) => <AuthorNotes content={c.about} />,
  contato: (c) => <Postscript content={c.contact} />,
};

export default function SectionPage({ routeId }: { routeId: string }) {
  const { lang } = useLanguage();
  const c = portfolio[lang];
  const render = (CADERNO_V2 && NOTEBOOK[routeId]) || SECTIONS[routeId];

  useDocumentMeta(routeId);

  return <SiteShell routeId={routeId}>{render(c)}</SiteShell>;
}
