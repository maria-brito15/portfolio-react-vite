import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BOOKS_ENDPOINT, liveBooksSource } from './live';
import { parseBookFeed } from './parse';

const valid = {
  id: 'hc:1',
  title: 'Livro fictício',
  authors: ['Autora'],
  status: 'read',
  rating: 4.5,
  pages: 300,
  finishedAt: '2026-09-14',
  provenance: {
    source: 'hardcover',
    url: 'https://hardcover.app/books/x',
    fetchedAt: '2026-11-14T12:00:00Z',
  },
};
const feed = (items: unknown[], over: object = {}) => ({
  items,
  updatedAt: '2026-11-14T12:00:00.000Z',
  stale: false,
  source: 'hardcover',
  ...over,
});

describe('parseBookFeed (resposta do servidor)', () => {
  it('aceita o contrato e mantém o que o servidor mandou', () => {
    const parsed = parseBookFeed(feed([valid]))!;

    expect(parsed).toMatchObject({
      updatedAt: '2026-11-14T12:00:00.000Z',
      stale: false,
      source: 'hardcover',
    });
    expect(parsed.items[0]).toMatchObject({
      id: 'hc:1',
      title: 'Livro fictício',
      status: 'read',
      rating: 4.5,
      pages: 300,
      finishedAt: '2026-09-14',
    });
    expect(parsed.items[0].provenance.url).toBe('https://hardcover.app/books/x');
  });

  it('formato fora do contrato: nada', () => {
    for (const bad of [
      null,
      undefined,
      'x',
      [],
      {},
      { items: 'x' },
      feed([], { updatedAt: 1 }),
      feed([], { stale: 'sim' }),
    ])
      expect(parseBookFeed(bad), JSON.stringify(bad)).toBeUndefined();
  });

  it('descarta item sem id, sem título ou com estado inválido; os bons ficam', () => {
    const parsed = parseBookFeed(
      feed([
        valid,
        { ...valid, id: 5 },
        { ...valid, title: '  ' },
        { ...valid, status: 'ignored' },
        null,
        'x',
      ]),
    )!;

    expect(parsed.items).toHaveLength(1);
  });

  it('capa só com https; nota fora da escala, data inválida e números ruins viram ausentes', () => {
    const [book] = parseBookFeed(
      feed([
        {
          ...valid,
          coverUrl: 'javascript:alert(1)',
          rating: 4.3,
          finishedAt: '14/09/2026',
          pages: -1,
          provenance: { source: 'hardcover', url: 'http://inseguro.test', fetchedAt: 'x' },
        },
      ]),
    )!.items;

    expect(book.coverUrl).toBeUndefined();
    expect(book.rating).toBeUndefined();
    expect(book.finishedAt).toBeUndefined();
    expect(book.pages).toBeUndefined();
    expect(book.provenance.url).toBeUndefined();
  });

  it('capa https passa; andamento só com valores válidos', () => {
    const [book] = parseBookFeed(
      feed([
        {
          ...valid,
          status: 'reading',
          coverUrl: 'https://img.test/c.jpg',
          progress: { pages: 120, percent: 29 },
        },
      ]),
    )!.items;

    expect(book.coverUrl).toBe('https://img.test/c.jpg');
    expect(book.progress).toEqual({ pages: 120, percent: 29 });
  });

  it('procedência é sempre "hardcover", mesmo que o servidor diga outra coisa', () => {
    const parsed = parseBookFeed(
      feed([{ ...valid, provenance: { source: 'mock', fetchedAt: 'x' } }], { source: 'mock' }),
    )!;

    expect(parsed.source).toBe('hardcover');
    expect(parsed.items[0].provenance.source).toBe('hardcover');
  });
});

describe('liveBooksSource', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lê o endpoint do próprio site, sem credencial no navegador', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(feed([valid])), { status: 200 }));

    vi.stubGlobal('fetch', fetchFn);

    const result = await liveBooksSource.load();
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];

    expect(url).toBe(BOOKS_ENDPOINT);
    expect(url.startsWith('/')).toBe(true);
    expect(JSON.stringify(init)).not.toMatch(/authorization|bearer|token/i);
    expect(result.items).toHaveLength(1);
  });

  it('repassa o cancelamento', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(feed([])), { status: 200 }));
    const controller = new AbortController();

    vi.stubGlobal('fetch', fetchFn);
    await liveBooksSource.load(controller.signal);

    expect((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].signal).toBe(
      controller.signal,
    );
  });

  it('HTTP de erro e corpo fora do contrato rejeitam (a página mostra o estado de erro)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 503 })),
    );
    await expect(liveBooksSource.load()).rejects.toThrow('HTTP 503');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"oi":1}', { status: 200 })),
    );
    await expect(liveBooksSource.load()).rejects.toThrow(/contrato/);
  });

  it('dado vencido do servidor chega marcado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(feed([valid], { stale: true })))),
    );

    expect((await liveBooksSource.load()).stale).toBe(true);
  });
});

describe('modo da fonte de livros', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('em modo live o index entrega a fonte real; em mock, a fictícia', async () => {
    const mock = await import('./index');
    const live = await import('./live');

    expect(mock.booksSource).not.toBe(live.liveBooksSource);

    vi.stubEnv('VITE_PERSONAL_SOURCE', 'live');
    vi.resetModules();

    const liveIndex = await import('./index');
    const liveSource = await import('./live');

    expect(liveIndex.booksSource).toBe(liveSource.liveBooksSource);
  });
});

// "Sem uso do token no navegador": nada em src/ conhece o token nem fala com o Hardcover.
describe('o token e o endpoint do Hardcover ficam fora do código do navegador', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);

      return statSync(path).isDirectory() ? walk(path) : [path];
    });
  const sources = walk(join(process.cwd(), 'src')).filter(
    (f) => /\.(ts|tsx|css)$/.test(f) && !/\.test\./.test(f),
  );

  it('nenhum arquivo de src/ cita HARDCOVER_API_TOKEN ou api.hardcover.app', () => {
    expect(sources.length).toBeGreaterThan(50);

    for (const file of sources) {
      const text = readFileSync(file, 'utf8');

      expect(text, file).not.toMatch(/HARDCOVER_API_TOKEN|api\.hardcover\.app/);
    }
  });

  it('nenhuma variável VITE_ carrega o token', () => {
    const env = readFileSync('.env.example', 'utf8');

    expect(env).not.toMatch(/VITE_[A-Z_]*(HARDCOVER|TOKEN)/);
  });
});
