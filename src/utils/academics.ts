import type { Academics, Course, Semester } from '../data/academics';
import type { ExperienceGroup } from '../data/experiences';
import type { Project } from '../data/projects';
import type { Lang, Localized, ProjectDate } from '../types';
import { formatProjectDate, parsePeriodStart, sortByDateDesc } from './projectDate';

// Cálculos da página Acadêmico.

// Carga horária cursada (disciplinas com nota) sobre a total, e média simples
// das notas já lançadas. Disciplinas sem nota (`grade: null`) não entram na média.
export function summarizeSemester(courses: Pick<Course, 'hours' | 'grade'>[]) {
  const total = courses.reduce((sum, c) => sum + (c.hours ?? 0), 0);
  const graded = courses.filter(
    (c): c is Pick<Course, 'hours'> & { grade: number } => typeof c.grade === 'number',
  );
  const done = graded.reduce((sum, c) => sum + (c.hours ?? 0), 0);
  const average = graded.length
    ? Math.round((graded.reduce((sum, c) => sum + c.grade, 0) / graded.length) * 10) / 10
    : null;

  return { done, total, average };
}

// Posição de `today` entre o início do primeiro ano e o fim do último, em %.
// É uma estimativa pelo calendário, não pela carga horária cumprida.
export function yearProgress(startYear: number, endYear: number, today = new Date()) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31, 23, 59, 59).getTime();
  const ratio = (today.getTime() - start) / (end - start);

  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}

const pickText = (value: string | Localized, lang: Lang) =>
  typeof value === 'string' ? value : value[lang];

// Linha de atividade (projeto ou experiência) já com a data estruturada
// `{ year, month? }`: projetos usam `date`; experiências, o início de `period.pt`.
// `kind` é "project" ou o id do grupo de experiências ("academic", "learning"…).
export interface ActivityRow {
  key: string;
  date: ProjectDate;
  period: string;
  title: string;
  detail?: string;
  kind: string;
  to?: string;
}

export interface ActivitySources {
  projects: Project[];
  experienceGroups: ExperienceGroup[];
}

function activityRow(
  entry: { kind: string; id: string },
  lang: Lang,
  { projects, experienceGroups }: ActivitySources,
): ActivityRow | null {
  if (entry.kind === 'project') {
    const p = projects.find((x) => x.id === entry.id);

    if (!p) return null;

    return {
      key: p.id,
      date: p.date,
      period: formatProjectDate(p.date),
      title: p.name,
      detail: p[lang].badge,
      kind: 'project',
      to: '/projetos',
    };
  }
  for (const group of experienceGroups) {
    const item = group.items.find((i) => i.id === entry.id);
    const date = item && parsePeriodStart(item.period.pt);

    if (!item || !date) continue;

    return {
      key: item.id,
      date,
      period: item.period[lang],
      title: item.role[lang],
      detail: pickText(item.org, lang),
      kind: group.id,
    };
  }

  return null;
}

// Atividades por ano: anos do mais recente ao mais antigo e, dentro de cada
// ano, itens do mais recente ao mais antigo (sem mês, depois dos que têm mês).
export function activitiesByYear(academics: Academics, sources: ActivitySources, lang: Lang) {
  return [...academics.years]
    .sort((a, b) => b.year - a.year)
    .map(({ year, items }) => ({
      year,
      rows: sortByDateDesc(
        items.map((e) => activityRow(e, lang, sources)).filter((r): r is ActivityRow => r !== null),
      ),
    }));
}

// Semestres do mais recente ao mais antigo, pelo rótulo "MM/AAAA".
export function semestersDesc(semesters: Semester[]) {
  return sortByDateDesc(
    semesters.map((s) => ({ ...s, date: parsePeriodStart(s.label.pt) ?? { year: 0 } })),
  );
}
