import {
  activitiesByYear,
  semestersDesc,
  summarizeSemester,
  terseActivityPeriod,
  yearProgress,
} from './academics';
import { academics } from '../data/academics';
import { projects } from '../data/projects';
import { experienceGroups } from '../data/experiences';

describe('summarizeSemester', () => {
  it('soma a carga horária e calcula a média só das notas lançadas', () => {
    const result = summarizeSemester([
      { hours: 80, grade: 90 },
      { hours: 60, grade: 81 },
      { hours: 40, grade: null },
    ]);

    expect(result).toEqual({ done: 140, total: 180, average: 85.5 });
  });

  it('sem notas, a média é nula', () => {
    expect(summarizeSemester([{ hours: 60, grade: null }])).toEqual({
      done: 0,
      total: 60,
      average: null,
    });
  });
});

describe('yearProgress', () => {
  it('fica entre 0 e 100 e cresce com o tempo', () => {
    expect(yearProgress(2025, 2029, new Date(2024, 5, 1))).toBe(0);
    expect(yearProgress(2025, 2029, new Date(2031, 0, 1))).toBe(100);
    expect(yearProgress(2025, 2029, new Date(2027, 6, 2))).toBe(50);
  });
});

describe('activitiesByYear', () => {
  const years = activitiesByYear(academics, { projects, experienceGroups }, 'pt');

  it('lista os anos do mais recente ao mais antigo', () => {
    expect(years.map((y) => y.year)).toEqual([2026, 2025]);
  });
  it('ordena cada ano do mais recente ao mais antigo, sem mês por último', () => {
    expect(years[0].rows.map((r) => r.period)).toEqual([
      '02/2026',
      '01/2026',
      '01/2026',
      '2º semestre de 2026 – em andamento',
    ]);
    expect(years[1].rows.map((r) => r.period)).toEqual([
      '02/2025',
      '02/2025',
      '01/2025',
      '01/2025',
    ]);
  });
  it('cada item fica no ano em que a data diz que ele pertence', () => {
    for (const y of years) for (const r of y.rows) expect(r.date.year).toBe(y.year);
  });
});

describe('terseActivityPeriod', () => {
  it('período curto (data ou rótulo por extenso) passa direto', () => {
    expect(terseActivityPeriod({ date: { year: 2026, month: 2 }, period: '02/2026' })).toBe(
      '02/2026',
    );
    expect(terseActivityPeriod({ date: { year: 2026, month: 10 }, period: 'out/2026' })).toBe(
      'out/2026',
    );
  });
  it('período longo (texto livre, ex. "em andamento") vira só a data: não cabe nas colunas estreitas do terminal', () => {
    const row = {
      date: { year: 2026 },
      period: '2º semestre de 2026 – em andamento',
    };

    expect(terseActivityPeriod(row)).toBe('2026');
  });
});

describe('semestersDesc', () => {
  it('ordena os semestres do mais recente ao mais antigo', () => {
    expect(semestersDesc(academics.semesters).map((s) => s.id)).toEqual([
      '2026-2',
      '2026-1',
      '2025-2',
      '2025-1',
    ]);
  });
});
