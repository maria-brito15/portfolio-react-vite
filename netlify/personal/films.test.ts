import xml from './fixtures/letterboxd-rss.xml?raw';
import { memoryJsonStore } from './cache';
import { createFilmsService, handleFilms } from './films';
import { importLetterboxdCsv } from './letterboxdCsv';

const TMDB = 'SECRET-TMDB-KEY';
const get = () => new Request('https://mariabdev.netlify.app/api/personal/films');

// Letterboxd devolve o feed real; TMDB devolve um pôster; `down` derruba um dos dois.
function network(down: { letterboxd?: boolean; tmdb?: boolean } = {}) {
  return vi.fn(async (input: URL | RequestInfo) => {
    const url = new URL(String(input));

    if (url.hostname === 'letterboxd.com')
      return down.letterboxd ? new Response('', { status: 503 }) : new Response(xml);
    if (down.tmdb) return new Response('', { status: 500 });

    return Response.json({ poster_path: '/p.jpg', overview: 'S', genres: [], runtime: 90 });
  });
}

const history = importLetterboxdCsv(
  {
    diary:
      'Name,Year,Letterboxd URI,Rating,Rewatch,Watched Date\nWildwood,2026,https://boxd.it/a,3.5,,2026-11-07\nAntigo,1990,https://boxd.it/b,4,,2019-01-02\n',
    reviews: 'Name,Year,Review,Watched Date\nAntigo,1990,Segredo,2019-01-02\n',
  },
  undefined,
  '2026-11-10T00:00:00.000Z',
);

describe('GET /api/personal/films', () => {
  it('200: RSS + CSV sem duplicar, ordenado, com pôster do TMDB, updatedAt e fonte', async () => {
    const service = createFilmsService({ TMDB_API_KEY: TMDB }, memoryJsonStore(), history, {
      fetchFn: network(),
    });
    const res = await handleFilms(get(), { service });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ stale: false, source: 'letterboxd' });
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThan(Date.parse('2026-11-14'));
    // 50 do RSS + 1 do CSV (Wildwood já está no RSS).
    expect(body.items).toHaveLength(51);
    expect(body.items.filter((i: { title: string }) => i.title === 'Wildwood')).toHaveLength(1);
    expect(body.items[0].title).toBe('Wildwood');
    expect(body.items.some((i: { posterUrl?: string }) => i.posterUrl)).toBe(true);
    expect(res.headers.get('cache-control')).toMatch(/max-age=60/);
  });

  it('sem TMDB_API_KEY: o diário funciona, sem pôsteres', async () => {
    const fetchFn = network();
    const service = createFilmsService({}, memoryJsonStore(), undefined, { fetchFn });
    const body = await (await handleFilms(get(), { service })).json();

    expect(body.items).toHaveLength(50);
    expect(body.items.some((i: { posterUrl?: string }) => i.posterUrl)).toBe(false);
    expect(
      fetchFn.mock.calls.every(([u]) => new URL(String(u)).hostname === 'letterboxd.com'),
    ).toBe(true);
  });

  it('TMDB fora do ar: ainda 200 e não vencido', async () => {
    const service = createFilmsService({ TMDB_API_KEY: TMDB }, memoryJsonStore(), undefined, {
      fetchFn: network({ tmdb: true }),
    });
    const body = await (await handleFilms(get(), { service })).json();

    expect(body.stale).toBe(false);
    expect(body.items).toHaveLength(50);
  });

  it('Letterboxd fora do ar com snapshot: serve o snapshot como vencido', async () => {
    const store = memoryJsonStore();
    const real = Date.now;

    await createFilmsService({}, store, undefined, { fetchFn: network() }).get();
    // TTL de 1 min e relógio adiantado: o snapshot vence e a fonte falha.
    Date.now = () => real() + 3_600_000 * 2;

    try {
      const service = createFilmsService({}, store, undefined, {
        fetchFn: network({ letterboxd: true }),
      });
      const body = await (await handleFilms(get(), { service })).json();

      expect(body.stale).toBe(true);
      expect(body.items).toHaveLength(50);
    } finally {
      Date.now = real;
    }
  });

  it('Letterboxd fora do ar, sem snapshot, com histórico: serve o histórico como vencido', async () => {
    const service = createFilmsService({}, memoryJsonStore(), history, {
      fetchFn: network({ letterboxd: true }),
    });
    const body = await (await handleFilms(get(), { service })).json();

    expect(body.stale).toBe(true);
    expect(body.updatedAt).toBe('2026-11-10T00:00:00.000Z');
    expect(body.items).toHaveLength(2);
  });

  it('Letterboxd fora do ar, sem snapshot nem histórico: 503 genérico e sem cache', async () => {
    const log = vi.fn();
    const service = createFilmsService({ TMDB_API_KEY: TMDB }, memoryJsonStore(), undefined, {
      fetchFn: network({ letterboxd: true }),
    });
    const res = await handleFilms(get(), { service, log });
    const text = await res.text();

    expect(res.status).toBe(503);
    expect(JSON.parse(text)).toEqual({ error: 'unavailable' });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(text).not.toMatch(/503|letterboxd/i);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('unavailable'));
  });

  it('publish: false: a resenha nem sai do servidor', async () => {
    const hidden = {
      ...history,
      entries: history.entries.map((e) => (e.title === 'Antigo' ? { ...e, publish: false } : e)),
    };
    const service = createFilmsService({}, memoryJsonStore(), hidden, { fetchFn: network() });
    const text = await (await handleFilms(get(), { service })).text();

    expect(text).not.toContain('Segredo');
    expect(text).toContain('Antigo');
  });

  it('só GET', async () => {
    const service = createFilmsService({}, memoryJsonStore(), undefined, { fetchFn: network() });

    for (const method of ['POST', 'PUT', 'DELETE'])
      expect(
        (await handleFilms(new Request('https://x.test/', { method }), { service })).status,
      ).toBe(405);
  });

  it('a chave do TMDB nunca aparece na resposta nem nos logs', async () => {
    const log = vi.fn();
    const service = createFilmsService({ TMDB_API_KEY: TMDB }, memoryJsonStore(), history, {
      fetchFn: network({ tmdb: true }),
      log,
    });
    const res = await handleFilms(get(), { service, log });

    expect(await res.text()).not.toContain(TMDB);
    expect(JSON.stringify(log.mock.calls)).not.toContain(TMDB);
    expect(JSON.stringify([...res.headers])).not.toContain(TMDB);
  });
});
