import type { FilmDiaryEntry } from '../../src/data/personal/types';
import {
  entryKey,
  historyToEntries,
  importLetterboxdCsv,
  mergeDiary,
  parseCsv,
  parseHistory,
} from './letterboxdCsv';

// CSV SINTÉTICO no formato conhecido do export (não é o da Duda).
const DIARY = `Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
2024-05-02,"Amélie",2001,https://boxd.it/aaa,4.5,,,2024-05-01
2024-05-03,"Filme, com vírgula",1999,https://boxd.it/bbb,,Yes,,2024-05-03
2024-06-01,Sem data,2010,https://boxd.it/ccc,3,,,
2026-11-07,Wildwood,2026,https://boxd.it/ddd,3.5,,,2026-11-07
`;
const REVIEWS = `Date,Name,Year,Letterboxd URI,Rating,Rewatch,Review,Tags,Watched Date
2024-05-02,Amélie,2001,https://boxd.it/aaa,4.5,,"Linda.
Com ""aspas"" e quebra de linha.",,2024-05-01
2023-01-01,Só resenha,2000,https://boxd.it/eee,2,,Texto,,2023-01-01
`;

describe('parseCsv', () => {
  it('aspas, vírgula, aspas duplicadas, quebra de linha, CRLF e BOM', () => {
    expect(parseCsv('﻿a,b\r\n"x,1","y ""q""\nz"\r\n')).toEqual([
      ['a', 'b'],
      ['x,1', 'y "q"\nz'],
    ]);
  });
});

describe('importLetterboxdCsv', () => {
  const history = importLetterboxdCsv(
    { diary: DIARY, reviews: REVIEWS },
    undefined,
    '2026-11-14T00:00:00Z',
  );
  const find = (title: string) => history.entries.find((e) => e.title === title)!;

  it('lê o diário pelas colunas e valida os campos', () => {
    expect(history.version).toBe(1);
    expect(find('Amélie')).toMatchObject({
      year: 2001,
      rating: 4.5,
      rewatch: false,
      watchedDate: '2024-05-01',
      url: 'https://boxd.it/aaa',
    });
    expect(find('Filme, com vírgula')).toMatchObject({ rewatch: true, rating: undefined });
    expect(find('Sem data').watchedDate).toBeUndefined();
  });

  it('junta a resenha à linha do diário e cria entrada para resenha sem diário', () => {
    expect(find('Amélie').review).toBe('Linda.\nCom "aspas" e quebra de linha.');
    expect(find('Só resenha')).toMatchObject({ review: 'Texto', rating: 2 });
    expect(history.entries).toHaveLength(5);
  });

  it('não inventa: sem id do TMDB, sem "curtido"', () => {
    for (const e of history.entries) {
      expect(e).not.toHaveProperty('liked');
      expect(e.tmdbId).toBeUndefined();
    }
  });

  it('ordena do mais recente ao mais antigo, sem data ao fim', () => {
    expect(history.entries.map((e) => e.title)).toEqual([
      'Wildwood',
      'Filme, com vírgula',
      'Amélie',
      'Só resenha',
      'Sem data',
    ]);
  });

  it('reimportar preserva publish e tmdbId editados', () => {
    const edited = {
      ...history,
      entries: history.entries.map((e) =>
        e.title === 'Amélie' ? { ...e, publish: false, tmdbId: 194 } : e,
      ),
    };
    const again = importLetterboxdCsv({ diary: DIARY, reviews: REVIEWS }, edited);

    expect(again.entries.find((e) => e.title === 'Amélie')).toMatchObject({
      publish: false,
      tmdbId: 194,
    });
  });

  it('cabeçalho sem a coluna esperada falha com mensagem clara', () => {
    expect(() => importLetterboxdCsv({ diary: 'Foo,Bar\n1,2\n' })).toThrow(/coluna "Name"/);
  });

  it('link fora do Letterboxd é descartado', () => {
    const h = importLetterboxdCsv({
      diary: 'Name,Year,Letterboxd URI\nX,2000,https://evil.test/x\n',
    });

    expect(h.entries[0].url).toBeUndefined();
  });
});

describe('mesclagem com o RSS', () => {
  const rss = (over: Partial<FilmDiaryEntry>): FilmDiaryEntry => ({
    id: 'lb:watch-1',
    kind: 'movie',
    title: 'Wildwood',
    year: 2026,
    watchedDate: '2026-11-07',
    rewatch: false,
    liked: true,
    tmdbId: 791523,
    reviewUrl: 'https://letterboxd.com/dudapbrt/film/wildwood-2026/',
    provenance: { source: 'letterboxd', fetchedAt: '2026-11-14T00:00:00Z' },
    ...over,
  });
  const csv = historyToEntries(
    importLetterboxdCsv({ diary: DIARY, reviews: REVIEWS }),
    'https://letterboxd.com/dudapbrt/',
    '2026-11-14T00:00:00Z',
  );

  it('(título + ano + data) iguais = uma exibição só, e o RSS vence', () => {
    const merged = mergeDiary([rss({})], csv);

    expect(merged.filter((e) => e.title === 'Wildwood')).toHaveLength(1);
    expect(merged.find((e) => e.title === 'Wildwood')).toMatchObject({
      id: 'lb:watch-1',
      liked: true,
    });
    expect(merged).toHaveLength(5);
  });

  it('mesmo filme em outro dia é outra exibição', () => {
    const merged = mergeDiary([rss({ watchedDate: '2026-11-08' })], csv);

    expect(merged.filter((e) => e.title === 'Wildwood')).toHaveLength(2);
  });

  it('chave ignora acento, caixa e pontuação', () => {
    expect(entryKey('Amélie', 2001, '2024-05-01')).toBe(entryKey('AMELIE!', 2001, '2024-05-01'));
  });

  it('publish: false do histórico esconde também a entrada do RSS, sem alterar o original', () => {
    const hidden = csv.map((e) => (e.title === 'Wildwood' ? { ...e, publish: false } : e));
    const original = rss({ review: 'texto' });
    const merged = mergeDiary([original], hidden);

    expect(merged.find((e) => e.title === 'Wildwood')?.publish).toBe(false);
    expect(original.publish).toBeUndefined();
  });

  it('ids únicos e todos com link https', () => {
    expect(csv.every((e) => e.reviewUrl.startsWith('https://'))).toBe(true);
    expect(new Set(csv.map((e) => e.id)).size).toBe(csv.length);
  });
});

describe('parseHistory', () => {
  it('JSON fora do formato vira histórico vazio; entrada ruim sai', () => {
    expect(parseHistory({ foo: 1 }).entries).toEqual([]);
    expect(
      parseHistory({ version: 1, entries: [{ title: '' }, { title: 'Ok', rating: 9 }] }).entries,
    ).toMatchObject([{ title: 'Ok', rating: undefined, rewatch: false }]);
  });
});
