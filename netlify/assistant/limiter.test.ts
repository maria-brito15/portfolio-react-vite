import {
  DAY_MS,
  HOUR_MS,
  blobsCounter,
  createLimiter,
  memoryStore,
  withFallback,
  type BlobStoreLike,
} from './limiter';

const T0 = Date.UTC(2026, 10, 12, 10, 30);

function clock(start = T0) {
  let time = start;

  return { now: () => time, advance: (ms: number) => (time += ms) };
}

const opts = (c: ReturnType<typeof clock>, over = {}) => ({
  perHour: 10,
  dailyCap: 200,
  salt: 'sal',
  now: c.now,
  ...over,
});

describe('limite por IP (IA-16)', () => {
  it('aceita 10 por hora e a 11ª dá rate', async () => {
    const c = clock();
    const limiter = createLimiter(memoryStore(), opts(c));

    for (let i = 0; i < 10; i++) expect(await limiter.check('1.1.1.1'), `#${i + 1}`).toBe('ok');
    expect(await limiter.check('1.1.1.1')).toBe('rate');
  });

  it('cada IP tem a sua conta', async () => {
    const limiter = createLimiter(memoryStore(), opts(clock()));

    for (let i = 0; i < 10; i++) await limiter.check('1.1.1.1');

    expect(await limiter.check('1.1.1.1')).toBe('rate');
    expect(await limiter.check('2.2.2.2')).toBe('ok');
  });

  it('a hora seguinte começa do zero', async () => {
    const c = clock();
    const limiter = createLimiter(memoryStore(), opts(c));

    for (let i = 0; i < 11; i++) await limiter.check('1.1.1.1');
    c.advance(HOUR_MS);

    expect(await limiter.check('1.1.1.1')).toBe('ok');
  });

  it('o pedido barrado por IP não consome o teto global', async () => {
    const store = memoryStore();
    const limiter = createLimiter(store, opts(clock(), { perHour: 1, dailyCap: 2 }));

    await limiter.check('1.1.1.1'); // global 1
    await limiter.check('1.1.1.1'); // rate: não conta
    await limiter.check('1.1.1.1'); // rate: não conta

    expect(await limiter.check('2.2.2.2')).toBe('ok'); // global 2
    expect(await limiter.check('3.3.3.3')).toBe('cap'); // global 3 > 2
  });
});

describe('teto global diário (IA-24)', () => {
  it('passando do teto responde cap, e o dia seguinte zera', async () => {
    const c = clock();
    const limiter = createLimiter(memoryStore(), opts(c, { dailyCap: 3 }));

    for (const ip of ['a', 'b', 'c']) expect(await limiter.check(ip)).toBe('ok');
    expect(await limiter.check('d')).toBe('cap');

    c.advance(DAY_MS);
    expect(await limiter.check('e')).toBe('ok');
  });
});

describe('sem registro e expiração (IA-20)', () => {
  const makeBlobs = () => {
    const data = new Map<string, string>();
    const store: BlobStoreLike = {
      get: async (k) => data.get(k) ?? null,
      set: async (k, v) => void data.set(k, v),
      delete: async (k) => void data.delete(k),
      list: async ({ prefix }) => ({
        blobs: [...data.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })),
      }),
    };

    return { data, store };
  };

  it('as chaves guardam hash e hora, nunca o IP', async () => {
    const { data, store } = makeBlobs();
    const limiter = createLimiter(blobsCounter(store), opts(clock()));

    await limiter.check('203.0.113.9');

    const keys = [...data.keys()];

    expect(keys.some((k) => k.includes('203.0.113.9'))).toBe(false);
    expect(keys.find((k) => k.startsWith('ip:'))).toMatch(/^ip:[0-9a-f]{32}:\d+$/);
    expect(keys.find((k) => k.startsWith('day:'))).toMatch(/^day:\d+$/);
  });

  it('o mesmo IP com sal diferente gera outra chave (não dá para cruzar bases)', async () => {
    const a = makeBlobs();
    const b = makeBlobs();

    await createLimiter(blobsCounter(a.store), opts(clock(), { salt: 'um' })).check('1.1.1.1');
    await createLimiter(blobsCounter(b.store), opts(clock(), { salt: 'dois' })).check('1.1.1.1');

    expect([...a.data.keys()].find((k) => k.startsWith('ip:'))).not.toBe(
      [...b.data.keys()].find((k) => k.startsWith('ip:')),
    );
  });

  it('chaves da hora e do dia anteriores são apagadas', async () => {
    const c = clock();
    const { data, store } = makeBlobs();
    const limiter = createLimiter(blobsCounter(store), opts(c));

    await limiter.check('1.1.1.1');
    await limiter.check('2.2.2.2');
    expect(data.size).toBe(3); // 2 ips + 1 dia

    c.advance(DAY_MS + HOUR_MS);
    await limiter.check('3.3.3.3'); // primeira da nova hora: varre

    expect([...data.keys()].filter((k) => k.startsWith('ip:'))).toHaveLength(1);
    expect([...data.keys()].filter((k) => k.startsWith('day:'))).toHaveLength(1);
  });

  it('falha do Blobs cai na memória, sem derrubar nem abrir mão do limite', async () => {
    const broken: BlobStoreLike = {
      get: async () => Promise.reject(new Error('blobs fora')),
      set: async () => Promise.reject(new Error('blobs fora')),
      delete: async () => Promise.reject(new Error('blobs fora')),
      list: async () => Promise.reject(new Error('blobs fora')),
    };
    const limiter = createLimiter(
      withFallback(blobsCounter(broken), memoryStore()),
      opts(clock(), { perHour: 2 }),
    );

    expect(await limiter.check('1.1.1.1')).toBe('ok');
    expect(await limiter.check('1.1.1.1')).toBe('ok');
    expect(await limiter.check('1.1.1.1')).toBe('rate');
  });
});
