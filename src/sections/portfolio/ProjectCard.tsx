import type { ComponentType } from 'react';
import type { Project, ProjectText } from '../../data/projects';
import type { ProjectDate } from '../../types';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatProjectDate, projectPeriod } from '../../utils/projectDate';
import ProjectMedia from './ProjectMedia';
import Card from '../../components/ui/Card';
import { PROJECT_TONE, techTone } from '../../data/tones';

interface VariantProps {
  project: Project;
  copy: ProjectText;
}

function RepoLink({ project, className = 'btn' }: { project: Project; className?: string }) {
  const { t } = useLanguage();

  // Sem repositório confirmado, nada é exibido: sem link inventado nem promessa.
  if (!project.repo) return null;

  return (
    <a href={project.repo} target="_blank" rel="noopener noreferrer" className={className}>
      {t.timeline.github}
    </a>
  );
}

function Stack({ tech }: { tech: string[] }) {
  return (
    <div className="stacks">
      {tech.map((item) => (
        <span className="st" key={item} data-tone={techTone(item)}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Featured({ project, copy }: VariantProps) {
  const { t } = useLanguage();

  return (
    <Card className="featured-card">
      <div className="proj-header">
        <div className="proj-ico" aria-hidden="true">
          {project.icon}
        </div>
        <span className="proj-bdg case">{copy.badge}</span>
      </div>
      <h2>{project.name}</h2>
      <p>{copy.description}</p>
      <Stack tech={project.tech} />
      <div className="project-actions">
        <Link to={project.caseStudy ?? '/projetos'} className="btn">
          {t.timeline.readCase}
        </Link>
        <RepoLink project={project} />
      </div>
      <ProjectMedia project={project} />
    </Card>
  );
}

function Evolution({ project, copy }: VariantProps) {
  return (
    <Card className="ecoshop-card">
      <div className="ecoshop-info">
        <div className="proj-header">
          <div className="proj-ico" aria-hidden="true">
            {project.icon}
          </div>
          <span className="proj-bdg award">{copy.badge}</span>
        </div>
        <h2 className="ecoshop-title">{project.name}</h2>
        <p className="ecoshop-desc">{copy.description}</p>
        <div className="evo-grid">
          {(copy.versions ?? []).map((version, i) => (
            <div className="evo-pair" key={version.label}>
              {i > 0 && (
                <div className="evo-arrow" aria-hidden="true">
                  →
                </div>
              )}
              <div className="evo-col">
                <span className="evo-tag">
                  {version.label} · {formatProjectDate(version.date)}
                </span>
                <p className="evo-stack">{version.stack}</p>
                <p className="evo-desc">{version.description}</p>
                <ul className="evo-points">
                  {version.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <Stack tech={project.tech} />
        <ProjectMedia project={project} />
        <div className="project-actions">
          <RepoLink project={project} />
        </div>
      </div>
    </Card>
  );
}

function Standard({ project, copy }: VariantProps) {
  return (
    <Card className="proj-card">
      <div className="proj-header">
        <div className="proj-ico" aria-hidden="true">
          {project.icon}
        </div>
        <span className="proj-bdg award">{copy.badge}</span>
      </div>
      <h2>{project.name}</h2>
      <p>{copy.description}</p>
      <Stack tech={project.tech} />
      <ProjectMedia project={project} />
      {project.repo && (
        <div className="project-actions">
          <RepoLink project={project} className="btn-o" />
        </div>
      )}
    </Card>
  );
}

function Minor({ project, copy }: VariantProps) {
  return (
    <div className="minor-item">
      <span className="minor-item-name">{project.name}</span>
      <span className="minor-item-desc">{copy.description}</span>
      <span className="minor-item-stack">{project.tech.join(' · ')}</span>
      <div className="minor-actions">
        <ProjectMedia project={project} />
        <RepoLink project={project} className="btn-o" />
      </div>
    </div>
  );
}

function toDateTime({ year, month }: ProjectDate) {
  return month ? `${year}-${String(month).padStart(2, '0')}` : String(year);
}

const VARIANTS: Record<Project['variant'], ComponentType<VariantProps>> = {
  featured: Featured,
  evolution: Evolution,
  card: Standard,
  minor: Minor,
};

export default function ProjectCard({
  project,
  orderUndetermined = false,
}: {
  project: Project;
  orderUndetermined?: boolean;
}) {
  const { lang, t } = useLanguage();
  const Variant = VARIANTS[project.variant];

  return (
    <li className="timeline-item" id={`projeto-${project.id}`} data-tone={PROJECT_TONE[project.id]}>
      <div className="timeline-date">
        <time dateTime={toDateTime(project.date)}>{projectPeriod(project, lang)}</time>
        {orderUndetermined && (
          <span className="date-note">{t.timeline.orderUndetermined(project.date.year)}</span>
        )}
      </div>
      <Variant project={project} copy={project[lang]} />
    </li>
  );
}
