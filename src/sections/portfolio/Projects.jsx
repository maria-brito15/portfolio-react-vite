import { useMemo } from 'react';
import { projects, sortProjectsChronologically } from '../../data/projects';
import { findUndeterminedOrder } from '../../utils/projectDate';
import { useLanguage } from '../../i18n/LanguageContext';
import ProjectCard from './ProjectCard';

// Timeline dinâmica: os projetos vêm de src/data/projects.jsx e são ordenados
// do mais antigo ao mais recente; cada um mantém a apresentação original.
export default function Projects({ content }) {
  const { t } = useLanguage();
  const ordered = useMemo(() => sortProjectsChronologically(projects), []);
  const undetermined = useMemo(() => findUndeterminedOrder(projects), []);
  return (
    <section id="projetos" className="sec" aria-labelledby="projetos-title">
      <div className="lbl">{content.label}</div>
      <h2 className="stitle" id="projetos-title">
        {content.title}
      </h2>
      <p className="section-intro">{content.intro}</p>
      <ol className="timeline" aria-label={t.timeline.label}>
        {ordered.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            orderUndetermined={undetermined.has(project.id)}
          />
        ))}
      </ol>
    </section>
  );
}
