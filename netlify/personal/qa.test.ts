// Fase 6 (QA): matriz de falhas da fonte (403, 429, 500, tempo esgotado) para o RSS do Letterboxd,
// com o contrato de reserva: snapshot vencido vira `stale` e "última sincronização" é o instante da
// última leitura boa, nunca o da falha.
import xml from './fixtures/letterboxd-rss.xml?raw';
import { memoryJsonStore } from './cache';
import { createFilmsService, handleFilms } from './films';
import { importLetterboxdCsv } from './letterboxdCsv';

const get = () => new Request('https://mariabdev.netlify.app/api/personal/films');
const HOUR = 3_600_000;
const history = importLetterboxdCsv(
  {
    diary:
      'Name,Year,Letterboxd URI,Rating,Rewatch,Watched Date\nAntigo,1990,https://boxd.it/b,4,,2019-01-02\n',
  },
  undefined,
  '2026-11-10T00:00:00.000Z',
);

const failures: Array<[string, () => Promise<Response>]> = [
  ['403', async () => new Response('', { status: 403 })],
  ['429', async () => new Response('', { status: 429, headers: { 'retry-after': '30' } })],
  ['500', async () => new Response('', { status: 500 })],
  [
    'timeout',
    async () => {
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    },
  ],
];

describe.each(failures)('RSS do Letterboxd responde %s', (_name, fail) => {
  it('com snapshot vencido: 200 stale e updatedAt é o da última leitura boa', async () => {
    const store = memoryJsonStore();
    let up = true;
    const fetchFn = vi.fn(async () => (up ? new Response(xml) : fail()));
    const first = await handleFilms(get(), {
      service: createFilmsService({}, store, undefined, { fetchFn }),
    });

    expect((await first.json()).stale).toBe(false);

    // Vence o snapshot (TTL de 1 h) e derruba a fonte.
    const saved = store.data.get('letterboxd') as { at: number; items: unknown[] };
    const lastGood = Date.now() - 2 * HOUR;

    store.data.set('letterboxd', { ...saved, at: lastGood });
    up = false;

    const res = await handleFilms(get(), {
      service: createFilmsService({}, store, undefined, { fetchFn }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.stale).toBe(true);
    expect(body.items.length).toBe(50);
    expect(Date.parse(body.updatedAt)).toBe(lastGood);
  });

  it('sem snapshot, com histórico do CSV: serve o CSV como stale, datado da importação', async () => {
    const service = createFilmsService({}, memoryJsonStore(), history, { fetchFn: vi.fn(fail) });
    const body = await (await handleFilms(get(), { service })).json();

    expect(body.stale).toBe(true);
    expect(body.updatedAt).toBe('2026-11-10T00:00:00.000Z');
    expect(body.items.map((i: { title: string }) => i.title)).toEqual(['Antigo']);
  });

  it('sem snapshot e sem histórico: 503 genérico, sem URL, token nem detalhe', async () => {
    const logs: string[] = [];
    const service = createFilmsService(
      { TMDB_API_KEY: 'SECRET-KEY' },
      memoryJsonStore(),
      undefined,
      {
        fetchFn: vi.fn(fail),
      },
    );
    const res = await handleFilms(get(), { service, log: (m) => logs.push(m) });

    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ error: 'unavailable' });
    expect(logs.join(' ')).not.toContain('SECRET-KEY');
  });
});
