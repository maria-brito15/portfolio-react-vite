import {
  BOOKS_QUERIES,
  HARDCOVER_ENDPOINT,
  HardcoverError,
  fetchHardcoverBooks,
  normalizeUserBooks,
  toDay,
  toRating,
  type RawUserBook,
} from './hardcover';

// ATENÇÃO: o formato das linhas abaixo é o que se ASSUME do Hardcover (docs oficiais + guias da
// comunidade). Os nomes de campo ainda não foram confirmados com o token da Duda: rode
// `npm run personal:probe` e ajuste `hardcover.ts` e estas fixtures se algo divergir. Os dados
// (títulos, nomes) são fictícios.
const FETCHED = '2026-11-14T12:00:00.000Z';
const TOKEN = 'SECRET-TOKEN-123';

const row = (over: Partial<RawUserBook> & { id?: number } = {}): RawUserBook => ({
  id: 1,
  status_id: 3,
  rating: 4,
  book: { id: 100, slug: 'livro-ficticio', title: 'Livro fictício', pages: 300 },
  ...over,
});

describe('toRating, toDay', () => {
  it('nota em meia estrela, de 0,5 a 5; zero, ausente ou inválida é "sem nota"', () => {
    expect(toRating(4)).toBe(4);
    expect(toRating(4.3)).toBe(4.5);
    expect(toRating(4.2)).toBe(4);
    expect(toRating(0.2)).toBe(0.5);
    expect(toRating(7)).toBe(5);

    for (const bad of [0, -1, null, undefined, '4', NaN])
      expect(toRating(bad), String(bad)).toBeUndefined();
  });

  it('dia de uma data ou data-hora ISO; o resto é ausente', () => {
    expect(toDay('2026-09-14')).toBe('2026-09-14');
    expect(toDay('2026-09-14T22:10:00Z')).toBe('2026-09-14');

    for (const bad of ['', 'ontem', '14/09/2026', null, undefined, 20260914])
      expect(toDay(bad), String(bad)).toBeUndefined();
  });
});

describe('normalizeUserBooks: estados e campos', () => {
  it('traduz status_id: 1 quero ler, 2 lendo, 3 lido, 4 pausado, 5 abandonado; 6 e desconhecidos ficam de fora', () => {
    const books = normalizeUserBooks(
      [1, 2, 3, 4, 5, 6, 99].map((status_id) =>
        row({ status_id, book: { id: status_id, title: `L${status_id}` } }),
      ),
      FETCHED,
    );

    expect(books.map((b) => [b.title, b.status])).toEqual([
      ['L1', 'want'],
      ['L2', 'reading'],
      ['L3', 'read'],
      ['L4', 'paused'],
      ['L5', 'dnf'],
    ]);
  });

  it('descarta linha sem livro, sem título ou sem id do livro', () => {
    const books = normalizeUserBooks(
      [
        row({ book: null }),
        row({ book: { id: 1, title: '   ' } }),
        row({ book: { id: 2 } }),
        row({ book: { title: 'sem id' } as never }),
        row({ book: { id: 3, title: 'ok' } }),
      ],
      FETCHED,
    );

    expect(books.map((b) => b.title)).toEqual(['ok']);
  });

  it('id estável com prefixo, procedência do Hardcover com o link do livro e a data da leitura', () => {
    const [book] = normalizeUserBooks([row()], FETCHED);

    expect(book.id).toBe('hc:100');
    expect(book.provenance).toEqual({
      source: 'hardcover',
      url: 'https://hardcover.app/books/livro-ficticio',
      fetchedAt: FETCHED,
    });
  });

  it('sem slug, sem link; slug com caracteres especiais é codificado', () => {
    const [noSlug] = normalizeUserBooks([row({ book: { id: 1, title: 'A' } })], FETCHED);
    const [odd] = normalizeUserBooks(
      [row({ book: { id: 2, title: 'B', slug: 'a b/c' } })],
      FETCHED,
    );

    expect(noSlug.provenance.url).toBeUndefined();
    expect(odd.provenance.url).toBe('https://hardcover.app/books/a%20b%2Fc');
  });

  it('nunca inventa: sem autores, páginas, capa, nota, datas ou resenha, esses campos ficam ausentes', () => {
    const [book] = normalizeUserBooks(
      [row({ rating: null, book: { id: 1, title: 'Mínimo' } })],
      FETCHED,
    );

    expect(book.authors).toEqual([]);
    for (const key of [
      'pages',
      'coverUrl',
      'rating',
      'startedAt',
      'finishedAt',
      'review',
      'progress',
    ] as const)
      expect(book[key], key).toBeUndefined();
  });

  it('páginas só se for número positivo', () => {
    const books = normalizeUserBooks(
      [0, -5, null, 280].map((pages, i) => row({ book: { id: i, title: `P${i}`, pages } })),
      FETCHED,
    );

    expect(books.map((b) => b.pages)).toEqual([undefined, undefined, undefined, 280]);
  });
});

describe('normalizeUserBooks: datas, nota e resenha', () => {
  it('lido: término da última leitura; sem ele, last_read_date; início da leitura ou first_started', () => {
    const [a, b] = normalizeUserBooks(
      [
        row({
          user_book_reads: [{ started_at: '2026-08-30', finished_at: '2026-09-14T10:00:00Z' }],
        }),
        row({
          book: { id: 2, title: 'B' },
          first_started_reading_date: '2026-01-02',
          last_read_date: '2026-02-03',
        }),
      ],
      FETCHED,
    );

    expect([a.startedAt, a.finishedAt]).toEqual(['2026-08-30', '2026-09-14']);
    expect([b.startedAt, b.finishedAt]).toEqual(['2026-01-02', '2026-02-03']);
  });

  it('término só existe para livro lido (lendo, pausado e abandonado não têm)', () => {
    const books = normalizeUserBooks(
      [2, 4, 5].map((status_id) =>
        row({
          status_id,
          book: { id: status_id, title: `S${status_id}` },
          user_book_reads: [{ finished_at: '2026-09-14' }],
        }),
      ),
      FETCHED,
    );

    for (const book of books) expect(book.finishedAt, book.title).toBeUndefined();
  });

  it('resenha aparada; vazia vira ausente; tamanho limitado', () => {
    const [full, empty, long] = normalizeUserBooks(
      [
        row({ review_raw: '  Gostei muito.  ' }),
        row({ book: { id: 2, title: 'B' }, review_raw: '   ' }),
        row({ book: { id: 3, title: 'C' }, review_raw: 'x'.repeat(9000) }),
      ],
      FETCHED,
    );

    expect(full.review).toBe('Gostei muito.');
    expect(empty.review).toBeUndefined();
    expect(long.review).toHaveLength(5000);
  });
});

describe('normalizeUserBooks: capa e autores', () => {
  it('capa só com https, como texto ou como { url }', () => {
    const books = normalizeUserBooks(
      [
        row({ book: { id: 1, title: 'A', cached_image: { url: 'https://img.test/a.jpg' } } }),
        row({ book: { id: 2, title: 'B', cached_image: 'https://img.test/b.jpg' } }),
        row({ book: { id: 3, title: 'C', cached_image: { url: 'http://img.test/c.jpg' } } }),
        row({ book: { id: 4, title: 'D', cached_image: { url: 'javascript:alert(1)' } } }),
        row({ book: { id: 5, title: 'E', cached_image: 'data:image/png;base64,AAAA' } }),
        row({ book: { id: 6, title: 'F', cached_image: null } }),
      ],
      FETCHED,
    );

    expect(books.map((b) => b.coverUrl)).toEqual([
      'https://img.test/a.jpg',
      'https://img.test/b.jpg',
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('autores de { author: { name } }, { name } e texto; sem nome e repetidos saem', () => {
    const [book] = normalizeUserBooks(
      [
        row({
          book: {
            id: 1,
            title: 'A',
            cached_contributors: [
              { author: { name: 'Autora Um' } },
              { name: 'Autor Dois' },
              'Autora Três',
              { author: { name: 'Autora Um' } },
              { author: {} },
              null,
              42,
            ],
          },
        }),
      ],
      FETCHED,
    );

    expect(book.authors).toEqual(['Autora Um', 'Autor Dois', 'Autora Três']);
  });
});

describe('normalizeUserBooks: andamento e duplicados', () => {
  it('lendo: páginas lidas e percentual da fonte; sem percentual, derivado de páginas/total', () => {
    const [fromSource, derived, none] = normalizeUserBooks(
      [
        row({ status_id: 2, user_book_reads: [{ progress: 41.6, progress_pages: 120 }] }),
        row({
          status_id: 2,
          book: { id: 2, title: 'B', pages: 200 },
          user_book_reads: [{ progress_pages: 50 }],
        }),
        row({ status_id: 2, book: { id: 3, title: 'C' }, user_book_reads: [{}] }),
      ],
      FETCHED,
    );

    expect(fromSource.progress).toEqual({ pages: 120, percent: 42 });
    expect(derived.progress).toEqual({ pages: 50, percent: 25 });
    expect(none.progress).toBeUndefined();
  });

  it('percentual fica entre 0 e 100; só livro "lendo" tem andamento', () => {
    const [over, read] = normalizeUserBooks(
      [
        row({ status_id: 2, user_book_reads: [{ progress: 250 }] }),
        row({ status_id: 3, book: { id: 2, title: 'B' }, user_book_reads: [{ progress: 100 }] }),
      ],
      FETCHED,
    );

    expect(over.progress?.percent).toBe(100);
    expect(read.progress).toBeUndefined();
  });

  it('o mesmo livro em duas linhas aparece uma vez, com o estado mais ativo', () => {
    const books = normalizeUserBooks(
      [
        row({ id: 1, status_id: 1 }),
        row({ id: 2, status_id: 2 }),
        row({ id: 3, status_id: 3 }),
        row({ id: 4, status_id: 5, book: { id: 200, title: 'Outro' } }),
        row({ id: 5, status_id: 4, book: { id: 200, title: 'Outro' } }),
      ],
      FETCHED,
    );

    expect(books.map((b) => [b.id, b.status])).toEqual([
      ['hc:100', 'reading'],
      ['hc:200', 'paused'],
    ]);
  });
});

// ---------------------------------------------------------------- cliente

const ok = (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 });
const withMe = (...pages: unknown[][]) => {
  const queue = [
    { me: [{ id: 7, username: 'x' }] },
    ...pages.map((rows) => ({ user_books: rows })),
  ];

  return vi.fn(async () => ok(queue.shift()));
};
const noSleep = vi.fn(async () => {});

describe('fetchHardcoverBooks: requisição', () => {
  it('fala com o endpoint oficial, com Bearer, e devolve os livros normalizados', async () => {
    const fetchFn = withMe([row()]);
    const books = await fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep: noSleep });

    expect(books).toHaveLength(1);

    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];

    expect(url).toBe(HARDCOVER_ENDPOINT);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('não duplica o prefixo Bearer se o token já o traz', async () => {
    const fetchFn = withMe([]);

    await fetchHardcoverBooks({ token: `Bearer ${TOKEN}`, fetchFn, sleep: noSleep });

    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];

    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('aceita "me" como lista ou como objeto', async () => {
    const asObject = vi
      .fn()
      .mockResolvedValueOnce(ok({ me: { id: 9 } }))
      .mockResolvedValueOnce(ok({ user_books: [row()] }));

    expect(
      await fetchHardcoverBooks({ token: TOKEN, fetchFn: asObject, sleep: noSleep }),
    ).toHaveLength(1);
  });

  it('pagina: uma página cheia pede a seguinte, e junta tudo', async () => {
    const full = Array.from({ length: 100 }, (_, i) =>
      row({ id: i, book: { id: i, title: `L${i}` } }),
    );
    const fetchFn = withMe(full, [row({ id: 500, book: { id: 500, title: 'Último' } })]);
    const books = await fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep: noSleep });

    expect(books).toHaveLength(101);
    expect(fetchFn).toHaveBeenCalledTimes(3);

    const second = JSON.parse(
      (fetchFn.mock.calls[2] as unknown as [string, RequestInit])[1].body as string,
    );

    expect(second.variables).toMatchObject({ userId: 7, limit: 100, offset: 100 });
  });

  it('só consultas rasas, dentro do limite de profundidade 3 do Hardcover', () => {
    const depth = (query: string) => {
      let level = 0;
      let max = 0;

      for (const char of query) {
        if (char === '{') max = Math.max(max, ++level);
        if (char === '}') level--;
      }

      return max;
    };

    // `query { user_books(...) { book { ... } } }`: operação (1) → campo raiz (2) → book (3)
    for (const query of BOOKS_QUERIES) expect(depth(query)).toBeLessThanOrEqual(4);
  });
});

describe('fetchHardcoverBooks: falhas, limites e novas tentativas', () => {
  it('token recusado (401/403) falha na hora, sem insistir', async () => {
    for (const status of [401, 403]) {
      const fetchFn = vi.fn(async () => new Response('{}', { status }));

      await expect(
        fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep: noSleep }),
      ).rejects.toMatchObject({ kind: 'auth', status });
      expect(fetchFn).toHaveBeenCalledTimes(1);
    }
  });

  it('429: espera o Retry-After (em segundos) e tenta de novo', async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(async () => {});
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'retry-after': '3' } }))
      .mockResolvedValueOnce(ok({ me: [{ id: 1 }] }))
      .mockResolvedValueOnce(ok({ user_books: [] }));

    await fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep });

    expect(sleep).toHaveBeenCalledWith(3000);
  });

  it('Retry-After enorme é limitado, e sem o cabeçalho a espera cresce (backoff)', async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(async () => {});
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'retry-after': '600' } }))
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(ok({ me: [{ id: 1 }] }))
      .mockResolvedValueOnce(ok({ user_books: [] }));

    await fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep });

    expect(sleep.mock.calls.map((c) => c[0])).toEqual([8000, 1000]);
  });

  it('429 até o fim: erro "rate" depois de esgotar as tentativas', async () => {
    const fetchFn = vi.fn(async () => new Response('', { status: 429 }));

    await expect(
      fetchHardcoverBooks({ token: TOKEN, fetchFn, retries: 2, sleep: noSleep }),
    ).rejects.toMatchObject({ kind: 'rate' });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('5xx é tentado de novo e, persistindo, vira erro "http"', async () => {
    const fetchFn = vi.fn(async () => new Response('', { status: 502 }));

    await expect(
      fetchHardcoverBooks({ token: TOKEN, fetchFn, retries: 1, sleep: noSleep }),
    ).rejects.toMatchObject({ kind: 'http', status: 502 });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('4xx fora 401/403/429 não é repetido', async () => {
    const fetchFn = vi.fn(async () => new Response('', { status: 400 }));

    await expect(
      fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep: noSleep }),
    ).rejects.toMatchObject({ kind: 'http', status: 400 });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('falha de rede é repetida e pode se recuperar', async () => {
    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(ok({ me: [{ id: 1 }] }))
      .mockResolvedValueOnce(ok({ user_books: [row()] }));

    expect(await fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep: noSleep })).toHaveLength(1);
  });

  it('tempo esgotado: aborta a requisição e vira erro "timeout"', async () => {
    const fetchFn = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );

    await expect(
      fetchHardcoverBooks({
        token: TOKEN,
        fetchFn: fetchFn as unknown as typeof fetch,
        timeoutMs: 5,
        retries: 0,
        sleep: noSleep,
      }),
    ).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('orçamento total estourado: erro, nunca resultado parcial', async () => {
    let t = 0;
    const full = Array.from({ length: 100 }, (_, i) =>
      row({ id: i, book: { id: i, title: `L${i}` } }),
    );
    const fetchFn = vi.fn(async () => {
      t += 15_000;

      return ok(fetchFn.mock.calls.length === 1 ? { me: [{ id: 1 }] } : { user_books: full });
    });

    await expect(
      fetchHardcoverBooks({
        token: TOKEN,
        fetchFn,
        budgetMs: 20_000,
        now: () => t,
        sleep: noSleep,
      }),
    ).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('resposta sem id do usuário ou sem "data" é erro "shape"', async () => {
    const noId = vi.fn(async () => ok({ me: [] }));
    const noData = vi.fn(async () => new Response('{}', { status: 200 }));

    await expect(
      fetchHardcoverBooks({ token: TOKEN, fetchFn: noId, sleep: noSleep }),
    ).rejects.toMatchObject({ kind: 'shape' });
    await expect(
      fetchHardcoverBooks({ token: TOKEN, fetchFn: noData, sleep: noSleep }),
    ).rejects.toMatchObject({ kind: 'shape' });
  });

  it('o token nunca aparece nas mensagens de erro', async () => {
    const scenarios: (typeof fetch)[] = [
      vi.fn(async () => new Response('{}', { status: 401 })),
      vi.fn(async () => new Response('', { status: 500 })),
      vi.fn(async () => new Response('', { status: 429 })),
      vi.fn(
        async () => new Response(JSON.stringify({ errors: [{ message: 'x' }] }), { status: 200 }),
      ),
      vi.fn().mockRejectedValue(new TypeError('boom')),
    ];

    for (const fetchFn of scenarios) {
      const error = await fetchHardcoverBooks({
        token: TOKEN,
        fetchFn,
        retries: 0,
        sleep: noSleep,
      }).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(HardcoverError);
      expect(String((error as Error).message)).not.toContain(TOKEN);
    }
  });
});

describe('fetchHardcoverBooks: esquema (campo recusado)', () => {
  const graphqlError = () =>
    new Response(JSON.stringify({ errors: [{ message: "field 'review_raw' not found" }] }), {
      status: 200,
    });

  it('se o Hardcover recusa um campo do nível completo, cai no nível mínimo e segue', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(ok({ me: [{ id: 3 }] }))
      .mockResolvedValueOnce(graphqlError())
      .mockResolvedValueOnce(ok({ user_books: [row()] }));
    const books = await fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep: noSleep });

    expect(books).toHaveLength(1);

    const queries = fetchFn.mock.calls.map(
      (c) => JSON.parse((c[1] as RequestInit).body as string).query as string,
    );

    expect(queries[1]).toContain('review_raw');
    expect(queries[2]).not.toContain('review_raw');
    expect(queries[2]).toContain('status_id');
  });

  it('se o nível mínimo também é recusado, o erro "graphql" sobe', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(ok({ me: [{ id: 3 }] }))
      .mockImplementation(async () => graphqlError());

    await expect(
      fetchHardcoverBooks({ token: TOKEN, fetchFn, sleep: noSleep }),
    ).rejects.toMatchObject({ kind: 'graphql' });
  });

  it('o nível mínimo nunca pede campos opcionais', () => {
    for (const field of ['review_raw', 'cached_image', 'cached_contributors', 'user_book_reads'])
      expect(BOOKS_QUERIES[1], field).not.toContain(field);
  });
});
