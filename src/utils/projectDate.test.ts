import {
  compareProjectDates,
  findUndeterminedOrder,
  formatProjectDate,
  parsePeriodStart,
  sortByDate,
  sortByDateDesc,
} from './projectDate';

const p = (id: string, year: number, month?: number) => ({
  id,
  date: month ? { year, month } : { year },
});

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

describe('sortByDateDesc', () => {
  it('ordena por ano e depois por mês, do mais recente ao mais antigo', () => {
    const sorted = sortByDateDesc([
      p('a', 2025, 1),
      p('c', 2026, 1),
      p('b', 2025, 2),
      p('d', 2026, 2),
    ]);

    expect(sorted.map((x) => x.id)).toEqual(['d', 'c', 'b', 'a']);
  });
  it('no mesmo ano, datas sem mês ficam depois das que têm mês', () => {
    const sorted = sortByDateDesc([p('sem', 2026), p('jan', 2026, 1), p('fev', 2026, 2)]);

    expect(sorted.map((x) => x.id)).toEqual(['fev', 'jan', 'sem']);
  });
  it('mantém a ordem declarada em empates e não altera a entrada', () => {
    const input = [p('x', 2026), p('y', 2026), p('a', 2025, 1), p('b', 2025, 1)];

    expect(sortByDateDesc(input).map((i) => i.id)).toEqual(['x', 'y', 'a', 'b']);
    expect(input.map((i) => i.id)).toEqual(['x', 'y', 'a', 'b']);
  });
  it('ano mais novo sem mês vem antes de ano anterior com mês', () => {
    expect(sortByDateDesc([p('a', 2025, 12), p('b', 2026)]).map((i) => i.id)).toEqual(['b', 'a']);
  });
});

describe('parsePeriodStart', () => {
  it('lê mês e ano de MM/AAAA', () => {
    expect(parsePeriodStart('02/2026')).toEqual({ year: 2026, month: 2 });
  });
  it('não inventa mês para anos, intervalos e semestres', () => {
    expect(parsePeriodStart('2025–2026')).toEqual({ year: 2025 });
    expect(parsePeriodStart('2º semestre de 2026 – em andamento')).toEqual({ year: 2026 });
    expect(parsePeriodStart('2nd half of 2026 – ongoing')).toEqual({ year: 2026 });
  });
  it('devolve null sem ano ou com mês inválido tratado como só ano', () => {
    expect(parsePeriodStart('em andamento')).toBeNull();
    expect(parsePeriodStart('13/2026')).toEqual({ year: 2026 });
  });
});
