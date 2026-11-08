import { useLanguage } from '../i18n/LanguageContext';
import { portfolio } from '../data/portfolio';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import SectionDivider from '../components/SectionDivider';
import Terminal from '../terminal/Terminal';
import About from '../sections/portfolio/About';
import Skills from '../sections/portfolio/Skills';
import Projects from '../sections/portfolio/Projects';
import Experience from '../sections/portfolio/Experience';
import Contact from '../sections/portfolio/Contact';

export default function Home() {
  const { lang } = useLanguage();
  const c = portfolio[lang];
  useDocumentMeta(c.meta);
  return (
    <SiteShell
      routeId="home"
      variant="terminal"
      badge={c.hero.tag}
      after={
        <>
          <About content={c.about} />
          <SectionDivider label={c.skills.divider} />
          <Skills content={c.skills} />
          <SectionDivider label={c.projects.divider} />
          <Projects content={c.projects} />
          <SectionDivider label={c.experience.divider} />
          <Experience content={c.experience} />
          <Contact content={c.contact} />
        </>
      }
    >
      <Terminal content={c.hero} />
    </SiteShell>
  );
}
