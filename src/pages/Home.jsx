import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionDivider from '../components/SectionDivider';
import Terminal from '../terminal/Terminal';
import About from '../sections/portfolio/About';
import Skills from '../sections/portfolio/Skills';
import Projects from '../sections/portfolio/Projects';
import Experience from '../sections/portfolio/Experience';
import Contact from '../sections/portfolio/Contact';

export default function Home() {
  const { lang, t } = useLanguage();
  const c = portfolio[lang];
  useDocumentMeta(c.meta);
  const links = [
    { to: '/#sobre', label: t.nav.about },
    { to: '/#habilidades', label: t.nav.skills },
    { to: '/#projetos', label: t.nav.projects },
    { to: '/#experiencias', label: t.nav.experience },
    { to: '/#contato', label: t.nav.contact },
    { to: '/curriculo', label: t.nav.resume },
    { to: '/academico', label: t.nav.academics },
    { to: '/servicos', label: t.nav.services },
  ];
  return (
    <>
      <Header links={links} />
      <main>
        <Terminal content={c.hero} />
        <About content={c.about} />
        <SectionDivider label={c.skills.divider} />
        <Skills content={c.skills} />
        <SectionDivider label={c.projects.divider} />
        <Projects content={c.projects} />
        <SectionDivider label={c.experience.divider} />
        <Experience content={c.experience} />
        <Contact content={c.contact} />
      </main>
      <Footer>{t.footer}</Footer>
    </>
  );
}
