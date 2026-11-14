import type { FilmDiaryEntry } from '../../src/data/personal/types';
import { memoryJsonStore } from './cache';
import {
  TMDB_CACHE_KEY,
  TmdbError,
  createEnricher,
  fetchTmdbMeta,
  searchTmdbMovieId,
} from './tmdb';

const KEY = 'SECRET-KEY-123';
const body = (lang: string) => ({
  poster_path: '/poster.jpg',
  backdrop_path: '/back.jpg',
  overview: lang === 'pt-BR' ? 'Sinopse.' : 'Synopsis.',
  genres: [{ name: lang === 'pt-BR' ? 'Drama' : 'Drama EN' }],
  runtime: 112,
  credits: {
    crew: [
      { job: 'Director', name: 'Fulana' },
      { job: 'Editor', name: 'X' },
      { job: 'Director', name: 'Fulana' },
    ],
  },
});
const api = () =>
  vi.fn(async (input: URL | RequestInfo) =>
    Response.json(body(new URL(String(input)).searchParams.get('language')!)),
  );

const entry = (id: number, over: Partial<FilmDiaryEntry> = {}): FilmDiaryEntry => ({
  id: `lb:${id}`,
  kind: 'movie',
  title: `Filme ${id}`,
  rewatch: false,
  tmdbId: id,
  reviewUrl: 'https://letterboxd.com/x/',
  provenance: { source: 'letterboxd', fetchedAt: '' },
  ...over,
});

describe('fetchTmdbMeta', () => {
  it('pôster, fundo, sinopse e gêneros nos dois idiomas; diretor sem repetição; duração', async () => {
    const meta = await fetchTmdbMeta({ auth: KEY, id: 1, kind: 'movie', fetchFn: api() });

    expect(meta).toEqual({
      tmdbId: 1,
      directors: ['Fulana'],
      genres: { pt: ['Drama'], en: ['Drama EN'] },
      runtimeMin: 112,
      posterUrl: 'https://image.tmdb.org/t/p/w342/poster.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w780/back.jpg',
      overview: { pt: 'Sinopse.', en: 'Synopsis.' },
    });
  });

  it('série: sem diretor nem duração (não rotula "criado por" como direção)', async () => {
    const meta = await fetchTmdbMeta({ auth: KEY, id: 2, kind: 'tv', fetchFn: api() });

    expect(meta.directors).toEqual([]);
    expect(meta.runtimeMin).toBeUndefined();
  });

  it('sem pôster: URL ausente; caminho estranho é recusado', async () => {
    const fetchFn = vi.fn(async () => Response.json({ poster_path: null, backdrop_path: '/../x' }));
    const meta = await fetchTmdbMeta({ auth: KEY, id: 3, kind: 'movie', fetchFn });

    expect(meta.posterUrl).toBeUndefined();
    expect(meta.backdropUrl).toBeUndefined();
    expect(meta.overview).toBeUndefined();
  });

  it('chave v3 vai em api_key; token v4 (eyJ…) vai como Bearer e fora da URL', async () => {
    const v3 = api();
    const v4 = vi.fn(async (...args: [URL | RequestInfo, RequestInit?]) => {
      void args;

      return Response.json(body('en-US'));
    });

    await fetchTmdbMeta({ auth: KEY, id: 1, kind: 'movie', fetchFn: v3 });
    await fetchTmdbMeta({ auth: 'eyJtoken', id: 1, kind: 'movie', fetchFn: v4 });

    expect(String(v3.mock.calls[0][0])).toContain(`api_key=${KEY}`);
    expect(String(v4.mock.calls[0][0])).not.toContain('eyJtoken');
    expect((v4.mock.calls[0][1]!.headers as Record<string, string>).authorization).toBe(
      'Bearer eyJtoken',
    );
  });

  it.each([
    [401, 'auth'],
    [404, 'not_found'],
    [429, 'rate'],
    [500, 'unavailable'],
  ])('HTTP %i vira TmdbError(%s), sem a chave na mensagem', async (status, kind) => {
    const error = await fetchTmdbMeta({
      auth: KEY,
      id: 1,
      kind: 'movie',
      fetchFn: async () => new Response('', { status }),
    }).catch((e) => e);

    expect(error).toBeInstanceOf(TmdbError);
    expect(error.kind).toBe(kind);
    expect(error.message).not.toContain(KEY);
  });
});

describe('createEnricher', () => {
  it('anexa meta e pôster, grava o cache e não busca de novo', async () => {
    const store = memoryJsonStore();
    const fetchFn = api();
    const enrich = createEnricher({ auth: KEY, store, fetchFn });
    const [first] = await enrich([entry(1)]);

    expect(first.posterUrl).toBe('https://image.tmdb.org/t/p/w342/poster.jpg');
    expect(first.meta?.directors).toEqual(['Fulana']);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    await enrich([entry(1)]);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(store.data.has(TMDB_CACHE_KEY)).toBe(true);
  });

  it('limita as buscas por requisição; o resto fica sem pôster e segue no diário', async () => {
    const enrich = createEnricher({
      auth: KEY,
      store: memoryJsonStore(),
      fetchFn: api(),
      maxFetches: 2,
    });
    const out = await enrich([entry(1), entry(2), entry(3)]);

    expect(out.filter((e) => e.meta)).toHaveLength(2);
    expect(out[2].posterUrl).toBeUndefined();
  });

  it('falha do TMDB não derruba o diário; chave recusada interrompe as buscas', async () => {
    const fetchFn = vi.fn(async () => new Response('', { status: 401 }));
    const log = vi.fn();
    const enrich = createEnricher({
      auth: KEY,
      store: memoryJsonStore(),
      fetchFn,
      log,
      concurrency: 1,
    });
    const out = await enrich([entry(1), entry(2), entry(3)]);

    expect(out).toHaveLength(3);
    expect(out.every((e) => !e.meta)).toBe(true);
    expect(fetchFn.mock.calls.length).toBeLessThanOrEqual(2);
    expect(JSON.stringify(log.mock.calls)).not.toContain(KEY);
  });

  it('404 é lembrado e não é buscado de novo', async () => {
    const fetchFn = vi.fn(async () => new Response('', { status: 404 }));
    const enrich = createEnricher({ auth: KEY, store: memoryJsonStore(), fetchFn });

    await enrich([entry(9)]);

    const calls = fetchFn.mock.calls.length;

    await enrich([entry(9)]);
    expect(fetchFn.mock.calls.length).toBe(calls);
  });

  it('sem pôster no cache, refaz só depois de uma semana', async () => {
    let time = 0;
    const fetchFn = vi.fn(async () => Response.json({ poster_path: null }));
    const enrich = createEnricher({
      auth: KEY,
      store: memoryJsonStore(),
      fetchFn,
      now: () => time,
    });

    await enrich([entry(1)]);

    const calls = fetchFn.mock.calls.length;

    time = 6 * 24 * 3_600_000;
    await enrich([entry(1)]);
    expect(fetchFn.mock.calls.length).toBe(calls);

    time = 8 * 24 * 3_600_000;
    await enrich([entry(1)]);
    expect(fetchFn.mock.calls.length).toBeGreaterThan(calls);
  });

  it('armazenamento fora do ar não quebra', async () => {
    const store = {
      get: async () => Promise.reject(new Error('x')),
      set: async () => Promise.reject(new Error('x')),
    };
    const out = await createEnricher({ auth: KEY, store, fetchFn: api() })([entry(1)]);

    expect(out[0].meta).toBeDefined();
  });
});

describe('searchTmdbMovieId', () => {
  const search = (results: object[]) => async () => Response.json({ results });

  it('aceita só resultado único com título e ano exatos', async () => {
    const results = [
      { id: 7, title: 'Amélie', release_date: '2001-04-25' },
      { id: 8, title: 'Outro', release_date: '2001-01-01' },
    ];

    expect(
      await searchTmdbMovieId({ auth: KEY, title: 'Amelie', year: 2001, fetchFn: search(results) }),
    ).toBe(7);
  });

  it('ambíguo, sem ano igual ou vazio = sem id (melhor sem pôster que o pôster errado)', async () => {
    const two = [
      { id: 1, title: 'X', release_date: '2000-01-01' },
      { id: 2, title: 'X', release_date: '2000-05-01' },
    ];
    const run = (year: number, results: object[]) =>
      searchTmdbMovieId({ auth: KEY, title: 'X', year, fetchFn: search(results) });

    expect(await run(2000, two)).toBeUndefined();
    expect(await run(1999, two)).toBeUndefined();
    expect(await run(2000, [])).toBeUndefined();
  });
});
