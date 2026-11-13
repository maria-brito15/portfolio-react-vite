import { useMemo, useState } from 'react';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { academics } from '../../data/academics';
import { experienceGroups } from '../../data/experiences';
import { projects } from '../../data/projects';
import { routeById } from '../../data/routes';
import {
  buildAcademicTimeline,
  filterActivities,
  showsCourses,
  type TimelineFilter,
} from '../../utils/academicTimeline';
import Chip from '../../components/ui/Chip';
import SectionTitle from '../../components/ui/SectionTitle';
import type { BlockProps } from '../../components/dashboard/blockProps';

// Linha do tempo acadêmica (professor): formação, disciplinas e atividades por ano, com
// filtro por categoria. Lê `academics.ts`, `experiences.ts` e `projects.tsx`; a página
// Acadêmico continua com as tabelas completas de notas.
const FILTERS: TimelineFilter[] = ['all', 'courses', 'project', 'academic', 'learning'];

const TEXT = {
  pt: {
    title: 'Linha do tempo acadêmica',
    lead: 'A trajetória ano a ano. Abra um ano para ver disciplinas, projetos e atividades.',
    filters: 'Filtrar a linha do tempo',
    filterNames: {
      all: 'Tudo',
      courses: 'Disciplinas',
      project: 'Projetos',
      academic: 'Atividades acadêmicas',
      learning: 'Cursos e competições',
    },
    begins: 'Início',
    inProgress: 'em andamento',
    average: 'Média',
    noCourses: 'Disciplinas ainda não lançadas.',
    full: 'Notas e detalhes na página Acadêmico →',
    project_link: 'Ver nos projetos',
  },
  en: {
    title: 'Academic timeline',
    lead: 'The path year by year. Open a year to see courses, projects and activities.',
    filters: 'Filter the timeline',
    filterNames: {
      all: 'All',
      courses: 'Courses',
      project: 'Projects',
      academic: 'Academic activities',
      learning: 'Courses and competitions',
    },
    begins: 'Start',
    inProgress: 'in progress',
    average: 'Average',
    noCourses: 'Courses not posted yet.',
    full: 'Grades and details on the Academics page →',
    project_link: 'See in projects',
  },
};

export default function AcademicTimeline({ heading, lead }: BlockProps) {
  const { lang } = useLanguage();
  const text = TEXT[lang];
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const years = useMemo(
    () => buildAcademicTimeline(academics, { projects, experienceGroups }, lang),
    [lang],
  );
  const academicPage = routeById('academico')?.path ?? '/academico';
  const projectsPage = routeById('projetos')?.path ?? '/projetos';
  const latestYear = Math.max(
    ...years.filter((y) => y.year <= new Date().getFullYear()).map((y) => y.year),
  );

  return (
    <section className="dash-section exp-block" aria-labelledby="timeline-title" data-tone="mint">
      <SectionTitle as="h2" id="timeline-title" size="md">
        {heading ?? text.title}
      </SectionTitle>
      <p className="t-dim">{lead ?? text.lead}</p>

      <div className="exp-tabs" role="group" aria-label={text.filters}>
        {FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            className="exp-tab"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {text.filterNames[id]}
          </button>
        ))}
      </div>

      <ol className="exp-list exp-timeline">
        {years.map((y) => {
          const rows = filterActivities(y.activities, filter);
          const semesters = showsCourses(filter) ? y.semesters : [];
          const headline = y.milestones.length
            ? y.milestones
            : y.programs.map((p) => `${text.begins}: ${p.degree[lang]}`);
          const visible =
            filter === 'all' || rows.length > 0 || semesters.some((s) => s.semester.courses.length);

          if (!visible) return null;

          return (
            <li key={y.year}>
              <details className="exp-item" open={y.year === latestYear || undefined}>
                <summary>
                  <strong>{y.year}</strong>
                  {headline.length > 0 && <span className="t-dim"> · {headline.join(' · ')}</span>}
                </summary>

                {semesters.map(({ semester, average }) => (
                  <div key={semester.id} className="exp-semester">
                    <h3>
                      {semester.label[lang]}
                      {semester.inProgress && <Chip tone="live">{text.inProgress}</Chip>}
                      {average !== null && (
                        <span className="t-dim">
                          {' '}
                          · {text.average}: {average}
                        </span>
                      )}
                    </h3>
                    {semester.courses.length ? (
                      <ul className="exp-courses">
                        {semester.courses.map((c) => (
                          <li key={c.name.pt}>
                            {c.name[lang]}
                            {c.grade !== null && <span className="t-dim"> · {c.grade}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="t-dim">{text.noCourses}</p>
                    )}
                  </div>
                ))}

                {rows.length > 0 && (
                  <ul className="exp-courses">
                    {rows.map((row) => (
                      <li key={row.key}>
                        <strong>{row.title}</strong>
                        <span className="t-dim">
                          {' '}
                          · {row.period}
                          {row.detail ? ` · ${row.detail}` : ''}
                        </span>{' '}
                        {row.kind === 'project' && (
                          <Link to={row.to ?? projectsPage}>{text.project_link}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </li>
          );
        })}
      </ol>
      <Link to={academicPage}>{text.full}</Link>
    </section>
  );
}
