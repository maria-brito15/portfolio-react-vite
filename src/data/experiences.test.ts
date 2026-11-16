import { academics } from './academics';
import { projects } from './projects';
import { experienceGroups } from './experiences';
import { buildAcademicTimeline, filterActivities } from '../utils/academicTimeline';

describe('linha do tempo acadêmica', () => {
  const sources = { projects, experienceGroups };
  const years = buildAcademicTimeline(academics, sources, 'pt');

  it('em ordem crescente, com os mesmos semestres e atividades da página Acadêmico', () => {
    expect(years.map((y) => y.year)).toEqual([...years.map((y) => y.year)].sort((a, b) => a - b));
    expect(years.flatMap((y) => y.semesters)).toHaveLength(academics.semesters.length);
    expect(years.flatMap((y) => y.activities)).toHaveLength(
      academics.years.flatMap((y) => y.items).length,
    );
  });

  it('o filtro só deixa a categoria pedida', () => {
    const rows = years.flatMap((y) => y.activities);

    expect(filterActivities(rows, 'courses')).toEqual([]);
    expect(filterActivities(rows, 'all')).toHaveLength(rows.length);
    expect(filterActivities(rows, 'project').every((r) => r.kind === 'project')).toBe(true);
  });
});
