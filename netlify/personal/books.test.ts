import type { Book } from '../../src/data/personal/types';
import { createBooksService, handleBooks, type BooksService } from './books';
import { memoryJsonStore } from './cache';

const TOKEN = 'SECRET-TOKEN-123';

const book: Book = {
  id: 'hc:1',
  title: 'Livro fictício',
  authors: ['Autora'],
  status: 'read',
  provenance: { source: 'hardcover', fetchedAt: '2026-11-14T12:00:00.000Z' },
};

const get = (url = 'https://mariabdev.netlify.app/api/personal/books') => new Request(url);
const service = (over: Partial<Awaited<ReturnType<BooksService['get']>>> = {}): BooksService => ({
  get: async () => ({
    items: [book],
    at: Date.parse('2026-11-14T12:00:00Z'),
    stale: false,
    ...over,
  }),
});

describe('GET /api/personal/books', () => {
  it('200 com os livros, a data da última sincronização e a fonte', async () => {
    const res = await handleBooks(get(), { service: service() });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      items: [book],
      updatedAt: '2026-11-14T12:00:00.000Z',
      stale: false,
      source: 'hardcover',
    });
  });

  it('dado vencido chega com stale: true', async () => {
    const res = await handleBooks(get(), { service: service({ stale: true }) });

    expect((await res.json()).stale).toBe(true);
  });

  it('só GET: outros métodos recebem 405', async () => {
    for (const method of ['POST', 'PUT', 'DELETE'])
      expect(
        (await handleBooks(new Request('https://x.test/', { method }), { service: service() }))
          .status,
      ).toBe(405);
  });

  it('cache de borda curto no sucesso; nenhum cache no erro', async () => {
    const ok = await handleBooks(get(), { service: service() });
    const fail = await handleBooks(get(), { service: null });

    expect(ok.headers.get('cache-control')).toMatch(/max-age=60/);
    expect(fail.headers.get('cache-control')).toBe('no-store');
  });

  it('sem token configurado: 503 "not_configured"', async () => {
    const res = await handleBooks(get(), { service: null });

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'not_configured' });
  });

  it('fonte fora do ar e sem snapshot: 503 genérico, sem detalhes, e o motivo só no log', async () => {
    const log = vi.fn();
    const res = await handleBooks(get(), {
      service: { get: async () => Promise.reject(new Error(`falhou com ${TOKEN}`)) },
      log,
    });
    const text = await res.text();

    expect(res.status).toBe(503);
    expect(JSON.parse(text)).toEqual({ error: 'unavailable' });
    expect(text).not.toContain('falhou');
    expect(res.headers.get('retry-after')).toBe('60');
    expect(log).toHaveBeenCalledTimes(1);
  });
});

describe('createBooksService (ambiente)', () => {
  const fetchOk = () =>
    vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { me: [{ id: 1 }] } })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              user_books: [{ id: 1, status_id: 3, book: { id: 9, title: 'Fictício', slug: 'f' } }],
            },
          }),
        ),
      );

  it('sem token (ausente ou só espaços): não há serviço', () => {
    expect(createBooksService({}, memoryJsonStore())).toBeNull();
    expect(createBooksService({ HARDCOVER_API_TOKEN: '   ' }, memoryJsonStore())).toBeNull();
  });

  it('com token: lê do Hardcover, devolve livros e guarda o snapshot', async () => {
    const store = memoryJsonStore();
    const svc = createBooksService({ HARDCOVER_API_TOKEN: TOKEN }, store, fetchOk())!;
    const read = await svc.get();

    expect(read.items.map((b) => b.title)).toEqual(['Fictício']);
    expect(store.data.has('books')).toBe(true);
  });

  it('a resposta HTTP nunca contém o token', async () => {
    const svc = createBooksService({ HARDCOVER_API_TOKEN: TOKEN }, memoryJsonStore(), fetchOk());
    const res = await handleBooks(get(), { service: svc });
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(text).not.toContain(TOKEN);
    expect([...res.headers.values()].join(' ')).not.toContain(TOKEN);
  });

  it('TTL: padrão de 6 h; variável em minutos; valor inválido volta ao padrão', async () => {
    const hour = 60 * 60_000;
    const run = async (ttl: string | undefined, elapsed: number) => {
      const store = memoryJsonStore();
      const fetchFn = vi.fn(
        async () => new Response(JSON.stringify({ data: { me: [{ id: 1 }], user_books: [] } })),
      );
      const svc = createBooksService(
        { HARDCOVER_API_TOKEN: TOKEN, PERSONAL_HARDCOVER_TTL_MIN: ttl },
        store,
        fetchFn,
      )!;

      await svc.get();
      store.data.set('books', { at: Date.now() - elapsed, items: [] });

      const before = fetchFn.mock.calls.length;

      await svc.get();

      return fetchFn.mock.calls.length > before; // buscou de novo?
    };

    expect(await run(undefined, 5 * hour)).toBe(false);
    expect(await run(undefined, 7 * hour)).toBe(true);
    expect(await run('10', 5 * 60_000)).toBe(false);
    expect(await run('10', 11 * 60_000)).toBe(true);
    expect(await run('abc', 5 * hour)).toBe(false);
    expect(await run('-3', 7 * hour)).toBe(true);
  });
});
