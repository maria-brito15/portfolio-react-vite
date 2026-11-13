import {
  REVIEW_LIMIT,
  formatDay,
  formatMonth,
  formatRating,
  groupByMonth,
  groupByYear,
  truncateReview,
} from './review';
import type { Rating } from './types';

describe('truncateReview (CL-25)', () => {
  it('não mexe em resenha curta, só remove espaços das pontas', () => {
    expect(truncateReview('  Muito bom.  ')).toEqual({ text: 'Muito bom.', truncated: false });
  });

  it('o limite é inclusivo: exatamente 400 caracteres não corta', () => {
    const exact = 'a'.repeat(REVIEW_LIMIT);

    expect(truncateReview(exact)).toEqual({ text: exact, truncated: false });
  });

  it('corta em limite de palavra e acrescenta reticências', () => {
    const { text, truncated } = truncateReview('um dois três quatro cinco', 14);

    expect(truncated).toBe(true);
    expect(text).toBe('um dois três…');
  });

  it('palavra que termina exatamente no limite cabe inteira', () => {
    expect(truncateReview('um dois três quatro', 12).text).toBe('um dois três…');
  });

  it('não deixa pontuação pendurada antes das reticências', () => {
    expect(truncateReview('um dois, três quatro', 11).text).toBe('um dois…');
  });

  it('palavra única maior que o limite é cortada no limite', () => {
    const { text, truncated } = truncateReview('x'.repeat(50), 10);

    expect(truncated).toBe(true);
    expect(text).toBe(`${'x'.repeat(10)}…`);
  });

  it('o resultado truncado nunca passa do limite mais as reticências', () => {
    const long = 'palavra '.repeat(200);

    expect(truncateReview(long).text.length).toBeLessThanOrEqual(REVIEW_LIMIT + 1);
  });
});

describe('formatRating (CL-22)', () => {
  it.each<[Rating, string, string, string]>([
    [0.5, '½', '0,5 de 5', '0.5 out of 5'],
    [3, '★★★', '3 de 5', '3 out of 5'],
    [3.5, '★★★½', '3,5 de 5', '3.5 out of 5'],
    [5, '★★★★★', '5 de 5', '5 out of 5'],
  ])('%s', (rating, stars, pt, en) => {
    expect(formatRating(rating, 'pt')).toEqual({ stars, label: pt });
    expect(formatRating(rating, 'en')).toEqual({ stars, label: en });
  });
});

describe('groupByMonth (CL-22)', () => {
  const e = (id: string, watchedDate?: string) => ({ id, watchedDate });

  it('meses do mais recente ao mais antigo; dentro do mês, a data mais recente primeiro', () => {
    const groups = groupByMonth([
      e('a', '2026-09-30'),
      e('b', '2026-11-02'),
      e('c', '2026-11-07'),
      e('d', '2025-12-31'),
    ]);

    expect(groups.map((g) => g.key)).toEqual(['2026-11', '2026-09', '2025-12']);
    expect(groups[0].items.map((i) => i.id)).toEqual(['c', 'b']);
  });

  it('entrada sem data, ou com data fora do formato, vai ao grupo "undated" no fim', () => {
    const groups = groupByMonth([
      e('sem'),
      e('a', '2026-01-10'),
      e('ruim', '10/01/2026'),
      e('mes-13', '2026-13-01'),
    ]);

    expect(groups.map((g) => g.key)).toEqual(['2026-01', 'undated']);
    expect(groups[1].items.map((i) => i.id)).toEqual(['sem', 'ruim', 'mes-13']);
  });

  it('nenhuma entrada some e a lista vazia dá nenhum grupo', () => {
    const input = [e('a', '2026-05-01'), e('b'), e('c', '2026-05-02')];

    expect(groupByMonth(input).flatMap((g) => g.items)).toHaveLength(input.length);
    expect(groupByMonth([])).toEqual([]);
  });

  it('empate na data mantém a ordem de entrada e não altera o array original', () => {
    const input = [e('a', '2026-05-01'), e('b', '2026-05-01')];
    const copy = [...input];

    expect(groupByMonth(input)[0].items.map((i) => i.id)).toEqual(['a', 'b']);
    expect(input).toEqual(copy);
  });
});

describe('groupByYear (CL-21)', () => {
  const b = (id: string, finishedAt?: string) => ({ id, finishedAt });

  it('anos do mais recente ao mais antigo; dentro do ano, o término mais recente primeiro', () => {
    const groups = groupByYear([b('a', '2025-12-30'), b('b', '2026-03-01'), b('c', '2026-09-14')]);

    expect(groups.map((g) => g.key)).toEqual(['2026', '2025']);
    expect(groups[0].items.map((i) => i.id)).toEqual(['c', 'b']);
  });

  it('sem data ou fora do formato vai ao grupo "undated", por último; nada some', () => {
    const input = [b('sem'), b('a', '2026-01-02'), b('x', '26-01'), b('y', '2026-13-01')];
    const groups = groupByYear(input);

    expect(groups.map((g) => g.key)).toEqual(['2026', 'undated']);
    expect(groups.flatMap((g) => g.items)).toHaveLength(input.length);
    expect(groupByYear([])).toEqual([]);
  });
});

describe('formatDay e formatMonth (CL-22)', () => {
  it('o dia exibido é o do texto, sem deslocamento de fuso', () => {
    expect(formatDay('2026-11-07', 'pt')).toMatch(/^07.*nov/);
    expect(formatDay('2026-11-07', 'en')).toMatch(/Nov.*07|07.*Nov/);
    expect(formatDay('2026-01-01', 'pt')).toMatch(/^01.*jan/);
  });

  it('o mês vem por extenso, no idioma', () => {
    expect(formatMonth('2026-11', 'pt')).toBe('novembro de 2026');
    expect(formatMonth('2026-11', 'en')).toBe('November 2026');
  });

  it('formato inválido devolve vazio', () => {
    for (const bad of ['', 'ontem', '2026-13-01', '2026-02-30x', '07/11/2026'])
      expect(formatDay(bad, 'pt'), bad).toBe('');

    for (const bad of ['', '2026', '2026-13', '2026-11-07'])
      expect(formatMonth(bad, 'pt'), bad).toBe('');
  });
});
