import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { routeById } from '../data/routes';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import About from '../sections/portfolio/About';
import Skills from '../sections/portfolio/Skills';
import Projects from '../sections/portfolio/Projects';
import Experience from '../sections/portfolio/Experience';
import Contact from '../sections/portfolio/Contact';

// As antigas seções da home viraram páginas próprias, cada uma dentro da
// Window do SiteShell. `key` é a chave do conteúdo em src/data/portfolio.jsx.
const SECTIONS = {
  sobre: { key: 'about', Section: About },
  habilidades: { key: 'skills', Section: Skills },
  projetos: { key: 'projects', Section: Projects },
  experiencias: { key: 'experience', Section: Experience },
  contato: { key: 'contact', Section: Contact },
};

export default function SectionPage({ routeId }) {
  const { lang } = useLanguage();
  const c = portfolio[lang];
  const { key, Section } = SECTIONS[routeId];
  useDocumentMeta({
    title: `${routeById(routeId).label[lang]} — Duda Brito`,
    description: c.meta.description,
  });
  return (
    <SiteShell routeId={routeId}>
      <Section content={c[key]} />
    </SiteShell>
  );
}
