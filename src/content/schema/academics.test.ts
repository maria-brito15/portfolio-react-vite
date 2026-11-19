import { formatPath } from './errors';
import { AcademicsSchema } from './index';

const loc = (pt: string, en = pt) => ({ pt, en });

// Dados de EXEMPLO para teste (não são conteúdo real).
const course = (over: Record<string, unknown> = {}) => ({ name: loc('Disciplina'), ...over });
const semester = (over: Record<string, unknown> = {}) => ({
  id: '2026-1',
  label: loc('1º semestre'),
  program: 'es',
  courses: [course({ grade: 90 })],
  ...over,
});
const academics = (over: Record<string, unknown> = {}) => ({
  programs: [
    { id: 'es', institution: 'Instituição', degree: loc('Curso'), start: 2026, end: 2029 },
  ],
  timeline: [{ year: 2026, label: loc('Marco') }],
  years: [{ year: 2026, items: [{ kind: 'project', id: 'exemplo' }] }],
  semesters: [semester()],
  ...over,
});

function problems(value: unknown): string[] {
  const result = AcademicsSchema.safeParse(value);

  return result.success
    ? []
    : result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`);
}

const withCourse = (c: Record<string, unknown>) =>
  academics({ semesters: [semester({ courses: [course(c)] })] });

describe('AcademicsSchema', () => {
  it('conteúdo completo passa', () => {
    expect(problems(academics())).toEqual([]);
  });

  it('nota 0 e 120 são válidas (sem teto); sem nota é válido', () => {
    expect(problems(withCourse({ grade: 0 }))).toEqual([]);
    expect(problems(withCourse({ grade: 120 }))).toEqual([]);
    expect(problems(withCourse({}))).toEqual([]);
  });

  it('nota -1 e NaN falham', () => {
    expect(problems(withCourse({ grade: -1 }))).toContain(
      'semesters[0].courses[0].grade: nota negativa',
    );
    expect(problems(withCourse({ grade: Number.NaN })).join('\n')).toContain('grade');
  });

  it('nota nula ou em texto falha (ausente é omitir o campo)', () => {
    expect(problems(withCourse({ grade: null })).join('\n')).toContain('grade');
    expect(problems(withCourse({ grade: '90' })).join('\n')).toContain('grade');
  });

  it('semestre com programa inexistente falha', () => {
    expect(problems(academics({ semesters: [semester({ program: 'xx' })] }))).toContainEqual(
      expect.stringContaining('semesters[0].program: programa inexistente "xx"'),
    );
  });

  it('fim anterior ao início falha', () => {
    const bad = academics({
      programs: [{ id: 'es', institution: 'I', degree: loc('C'), start: 2029, end: 2026 }],
    });

    expect(problems(bad)).toContain('programs[0].end: o fim (2026) é anterior ao início (2029)');
  });

  it('semestre em andamento com courses vazio é válido', () => {
    expect(
      problems(academics({ semesters: [semester({ inProgress: true, courses: [] })] })),
    ).toEqual([]);
  });

  it('hours 0 e hours fracionado falham; hours positivo passa', () => {
    expect(problems(withCourse({ hours: 0 })).join('\n')).toContain('carga horária');
    expect(problems(withCourse({ hours: 40.5 })).join('\n')).toContain('carga horária');
    expect(problems(withCourse({ hours: 80 }))).toEqual([]);
  });

  it('modalidade fora da lista falha; as três válidas passam', () => {
    expect(problems(withCourse({ modality: 'remota' })).join('\n')).toContain('modalidade');

    for (const modality of ['presencial', 'hibrida', 'virtual']) {
      expect(problems(withCourse({ modality }))).toEqual([]);
    }
  });

  it('id de semestre repetido e fora do formato falham', () => {
    expect(problems(academics({ semesters: [semester(), semester()] }))).toContain(
      'semesters[1].id: id de semestre repetido "2026-1"',
    );
    expect(problems(academics({ semesters: [semester({ id: '2026' })] })).join('\n')).toContain(
      'fora do formato AAAA-N',
    );
  });

  it('ano sem 4 dígitos na linha do tempo falha', () => {
    expect(problems(academics({ timeline: [{ year: 26, label: loc('x') }] })).join('\n')).toContain(
      'timeline[0].year',
    );
  });

  it('kind desconhecido numa atividade falha', () => {
    const bad = academics({ years: [{ year: 2026, items: [{ kind: 'curso', id: 'a' }] }] });

    expect(problems(bad).join('\n')).toContain('years[0].items[0].kind');
  });

  it('a referência years[].items[].id NÃO é regra deste schema (é da T5.1)', () => {
    const other = academics({
      years: [{ year: 2026, items: [{ kind: 'project', id: 'qualquer' }] }],
    });

    expect(problems(other)).toEqual([]);
  });
});
