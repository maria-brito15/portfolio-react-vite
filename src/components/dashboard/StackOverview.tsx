import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { projects } from '../../data/projects';
import { routeById } from '../../data/routes';
import { techTone } from '../../data/tones';
import Chip from '../ui/Chip';
import SectionTitle from '../ui/SectionTitle';
import type { BlockProps } from './blockProps';

// A stack como aparece nos projetos: cada tecnologia com a contagem de projetos que a usam.
// Calculado de `projects.tsx`, sem lista escrita à mão.
function techCounts() {
  const counts = new Map<string, number>();

  for (const p of projects)
    for (const tech of p.tech) counts.set(tech, (counts.get(tech) ?? 0) + 1);

  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export default function StackOverview({ heading, lead }: BlockProps) {
  const { t } = useLanguage();
  const h = t.ws.home;

  return (
    <section className="dash-section" aria-labelledby="stack-title">
      <div className="dash-head">
        <SectionTitle as="h2" id="stack-title" size="md">
          {heading ?? h.stack}
        </SectionTitle>
        <Link to={routeById('habilidades')?.path ?? '/habilidades'}>{h.stackMore}</Link>
      </div>
      <p className="t-dim">{lead ?? h.stackLead}</p>
      <ul className="stack-list">
        {techCounts().map(([tech, n]) => (
          <li key={tech}>
            <Chip accent={techTone(tech)}>
              {tech}
              {n > 1 && <span className="sr-only"> ({h.projectCount(n)})</span>}
              {n > 1 && <span aria-hidden="true"> ×{n}</span>}
            </Chip>
          </li>
        ))}
      </ul>
    </section>
  );
}
