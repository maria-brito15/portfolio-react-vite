import Reveal from '../../components/Reveal';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { handleRadialGlow } from '../../utils/radialGlow';
import { formatProjectDate } from '../../utils/projectDate';
import ProjectMedia from './ProjectMedia';
import Card from '../../components/ui/Card';

function RepoLink({ project, className = 'btn' }) {
  const { t } = useLanguage();
  // Sem repositório confirmado, nada é exibido: sem link inventado nem promessa.
  if (!project.repo) return null;
  return (
    <a href={project.repo} target="_blank" rel="noopener noreferrer" className={className}>
      {t.timeline.github}
    </a>
  );
}

function Stack({ tech }) {
  return (
    <div className="stacks">
      {tech.map((item) => (
        <span className="st" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Featured({ project, copy }) {
  const { t } = useLanguage();
  return (
    <Card className="featured-card">
      <div className="proj-header">
        <div className="proj-ico" aria-hidden="true">
          {project.icon}
        </div>
        <span className="proj-bdg case">{copy.badge}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{copy.description}</p>
      <Stack tech={project.tech} />
      <div className="project-actions">
        <Link to={project.caseStudy} className="btn">
          {t.timeline.readCase}
        </Link>
        <RepoLink project={project} />
      </div>
      <ProjectMedia project={project} />
    </Card>
  );
}

function Evolution({ project, copy }) {
  return (
    <Card className="ecoshop-card">
      <div className="ecoshop-info">
        <div className="proj-header">
          <div className="proj-ico" aria-hidden="true">
            {project.icon}
          </div>
          <span className="proj-bdg award">{copy.badge}</span>
        </div>
        <h3 className="ecoshop-title">{project.name}</h3>
        <p className="ecoshop-desc">{copy.description}</p>
        <div className="evo-grid">
          {copy.versions.map((version, i) => (
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

function Standard({ project, copy }) {
  return (
    <Card className="proj-card" onMouseMove={handleRadialGlow}>
      <div className="proj-header">
        <div className="proj-ico" aria-hidden="true">
          {project.icon}
        </div>
        <span className="proj-bdg award">{copy.badge}</span>
      </div>
      <h3>{project.name}</h3>
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

function Minor({ project, copy }) {
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

function toDateTime({ year, month }) {
  return month ? `${year}-${String(month).padStart(2, '0')}` : String(year);
}

const VARIANTS = { featured: Featured, evolution: Evolution, card: Standard, minor: Minor };

export default function ProjectCard({ project, orderUndetermined = false }) {
  const { lang, t } = useLanguage();
  const Variant = VARIANTS[project.variant];
  return (
    <Reveal as="li" className="timeline-item">
      <div className="timeline-date">
        <time dateTime={toDateTime(project.date)}>{formatProjectDate(project.date)}</time>
        {orderUndetermined && (
          <span className="date-note">{t.timeline.orderUndetermined(project.date.year)}</span>
        )}
      </div>
      <Variant project={project} copy={project[lang]} />
    </Reveal>
  );
}
