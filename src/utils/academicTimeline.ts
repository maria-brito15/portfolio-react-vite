import type { Academics, Program, Semester } from '../data/academics';
import type { Lang } from '../types';
import {
  activitiesByYear,
  summarizeSemester,
  type ActivityRow,
  type ActivitySources,
} from './academics';
import { parsePeriodStart } from './projectDate';

// Linha do tempo acadêmica (professor): os dados de `academics.ts` reorganizados por ano, do
// mais antigo ao mais recente. Não existe dado novo aqui, só a junção de marcos, formações,
// semestres e atividades. Notas e médias saem dos mesmos cálculos da página Acadêmico.
export interface TimelineSemester {
  semester: Semester;
  average: number | null;
}

export interface TimelineYear {
  year: number;
  milestones: string[];
  // Formações que começam neste ano.
  programs: Program[];
  semesters: TimelineSemester[];
  activities: ActivityRow[];
}

export type TimelineFilter = 'all' | 'courses' | 'project' | 'academic' | 'learning';

export function buildAcademicTimeline(
  academics: Academics,
  sources: ActivitySources,
  lang: Lang,
): TimelineYear[] {
  const activities = activitiesByYear(academics, sources, lang);
  const semesterYear = (s: Semester) => parsePeriodStart(s.label.pt)?.year;
  const years = new Set<number>([
    ...academics.timeline.map((m) => m.year),
    ...academics.years.map((y) => y.year),
    ...academics.programs.map((p) => p.start),
    ...academics.semesters.map(semesterYear).filter((y): y is number => Boolean(y)),
  ]);

  return [...years]
    .sort((a, b) => a - b)
    .map((year) => ({
      year,
      milestones: academics.timeline.filter((m) => m.year === year).map((m) => m.label[lang]),
      programs: academics.programs.filter((p) => p.start === year),
      semesters: academics.semesters
        .filter((s) => semesterYear(s) === year)
        .map((semester) => ({
          semester,
          average: summarizeSemester(semester.courses).average,
        })),
      // Do mais antigo ao mais recente, como o resto da linha.
      activities: [...(activities.find((a) => a.year === year)?.rows ?? [])].reverse(),
    }));
}

// O que um filtro deixa aparecer num ano.
export const showsCourses = (filter: TimelineFilter) => filter === 'all' || filter === 'courses';

export const filterActivities = (rows: ActivityRow[], filter: TimelineFilter) =>
  filter === 'all' ? rows : filter === 'courses' ? [] : rows.filter((r) => r.kind === filter);
