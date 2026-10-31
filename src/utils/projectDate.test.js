import {
  compareProjectDates,
  findUndeterminedOrder,
  formatProjectDate,
  sortByDate,
} from './projectDate';

const p = (id, year, month) => ({ id, date: month ? { year, month } : { year } });

describe('formatProjectDate', () => {
  it('usa MM/AAAA com mês e AAAA sem mês', () => {
    expect(formatProjectDate({ year: 2025, month: 1 })).toBe('01/2025');
    expect(formatProjectDate({ year: 2026, month: 11 })).toBe('11/2026');
    expect(formatProjectDate({ year: 2026 })).toBe('2026');
  });
});

describe('compareProjectDates / sortByDate', () => {
  it('ordena por ano e depois por mês', () => {
    const sorted = sortByDate([p('c', 2026, 1), p('b', 2025, 2), p('a', 2025, 1)]);
    expect(sorted.map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
  it('mês ausente: mantém a ordem declarada entre datas sem mês, sem NaN', () => {
    const list = [p('x', 2026), p('y', 2026), p('z', 2026)];
    expect(compareProjectDates(list[0].date, list[1].date)).toBe(0);
    expect(sortByDate(list).map((x) => x.id)).toEqual(['x', 'y', 'z']);
  });
  it('ano anterior sem mês vem antes do ano seguinte com mês', () => {
    const sorted = sortByDate([p('b', 2026, 1), p('a', 2025)]);
    expect(sorted.map((x) => x.id)).toEqual(['a', 'b']);
  });
  it('no mesmo ano, datas com mês vêm antes das sem mês e não altera a entrada', () => {
    const input = [p('sem', 2026), p('com', 2026, 3)];
    expect(sortByDate(input).map((x) => x.id)).toEqual(['com', 'sem']);
    expect(input.map((x) => x.id)).toEqual(['sem', 'com']);
  });
});

describe('findUndeterminedOrder', () => {
  it('marca só projetos sem mês que dividem o ano com outro sem mês', () => {
    const ids = findUndeterminedOrder([
      p('a', 2025, 1),
      p('b', 2026),
      p('c', 2026),
      p('d', 2027),
      p('e', 2026, 1),
    ]);
    expect([...ids].sort()).toEqual(['b', 'c']);
  });
});
