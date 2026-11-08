import { summarizeSemester, yearProgress } from './academics';

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
