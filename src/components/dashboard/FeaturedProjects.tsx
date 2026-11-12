import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { projects } from '../../data/projects';
import { routeById } from '../../data/routes';
import { PROJECT_TONE, techTone } from '../../data/tones';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import SectionTitle from '../ui/SectionTitle';

// Em destaque = os projetos que têm selo (reconhecimento, estudo de caso ou "este
// site"). Nada escolhido à mão: se o selo mudar nos dados, a lista muda junto.
export default function FeaturedProjects() {
  const { lang, t } = useLanguage();
  const h = t.ws.home;
  const page = routeById('projetos')?.path ?? '/projetos';
  const featured = projects.filter((p) => p[lang].badge);

  return (
    <section className="dash-section" aria-labelledby="featured-title">
      <div className="dash-head">
        <SectionTitle as="h2" id="featured-title" size="md">
          {h.featured}
        </SectionTitle>
        <Link to={page}>{h.allProjects}</Link>
      </div>
      <ul className="featured-grid">
        {featured.map((p) => (
          <li key={p.id}>
            <Card as="article" className="featured-project" data-tone={PROJECT_TONE[p.id]}>
              <h3>
                {p.icon && (
                  <span className="project-icon" aria-hidden="true">
                    {p.icon}
                  </span>
                )}
                {p.name}
              </h3>
              <p className="featured-badge">
                <Chip tone="live">{p[lang].badge}</Chip>
              </p>
              <div className="featured-desc">{p[lang].description}</div>
              <p className="featured-tech">
                {p.tech.slice(0, 4).map((tech) => (
                  <Chip key={tech} accent={techTone(tech)}>
                    {tech}
                  </Chip>
                ))}
              </p>
              <p className="featured-links">
                {p.caseStudy && <Link to={p.caseStudy}>{h.caseStudy}</Link>}
                <Link to={`${page}#projeto-${p.id}`}>{h.details}</Link>
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noopener noreferrer">
                    {h.repo}
                  </a>
                )}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
