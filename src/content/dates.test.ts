import { compareDates, formatDate } from './dates';

describe('formatDate', () => {
  it('sem mês mostra só o ano, nos dois idiomas', () => {
    expect(formatDate({ year: 2025 }, 'pt')).toBe('2025');
    expect(formatDate({ year: 2025 }, 'en')).toBe('2025');
  });

  it('com mês mostra mês abreviado em minúsculas e o ano', () => {
    expect(formatDate({ year: 2025, month: 3 }, 'pt')).toBe('mar/2025');
    expect(formatDate({ year: 2025, month: 3 }, 'en')).toBe('mar/2025');
    expect(formatDate({ year: 2024, month: 12 }, 'pt')).toBe('dez/2024');
  });

  it('as tabelas de PT e EN têm os 12 meses', () => {
    const all = (lang: 'pt' | 'en') =>
      Array.from({ length: 12 }, (_, i) => formatDate({ year: 2025, month: i + 1 }, lang));

    expect(all('pt').join(' ')).toBe(
      'jan/2025 fev/2025 mar/2025 abr/2025 mai/2025 jun/2025 jul/2025 ago/2025 set/2025 out/2025 nov/2025 dez/2025',
    );
    expect(all('en').join(' ')).toBe(
      'jan/2025 feb/2025 mar/2025 apr/2025 may/2025 jun/2025 jul/2025 aug/2025 sep/2025 oct/2025 nov/2025 dec/2025',
    );
  });
});

describe('compareDates (as 5 linhas da tabela "Exibição de data")', () => {
  it.each([
    ['2025-03 × 2025-07', { year: 2025, month: 3 }, { year: 2025, month: 7 }, 'a-antes'],
    ['2025-03 × 2025', { year: 2025, month: 3 }, { year: 2025 }, 'indeterminada'],
    ['2025 × 2025', { year: 2025 }, { year: 2025 }, 'indeterminada'],
    ['2025-03 × 2025-03', { year: 2025, month: 3 }, { year: 2025, month: 3 }, 'indeterminada'],
    ['2024-12 × 2025', { year: 2024, month: 12 }, { year: 2025 }, 'a-antes'],
  ] as const)('%s', (_nome, a, b, esperado) => {
    expect(compareDates(a, b)).toBe(esperado);
  });

  it('trocar A e B inverte a ordem determinada e mantém a indeterminada', () => {
    expect(compareDates({ year: 2025, month: 7 }, { year: 2025, month: 3 })).toBe('b-antes');
    expect(compareDates({ year: 2026 }, { year: 2025, month: 1 })).toBe('b-antes');
    expect(compareDates({ year: 2025 }, { year: 2025, month: 3 })).toBe('indeterminada');
  });
});
