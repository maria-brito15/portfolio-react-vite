import { createSnapshotService, memoryJsonStore, type JsonStore } from './cache';

const TTL = 60_000;

function setup(over: { load?: () => Promise<string[]>; store?: JsonStore; backoff?: number } = {}) {
  let t = 1_000_000;
  const store = over.store ?? memoryJsonStore();
  const load = over.load ?? vi.fn(async () => ['novo']);
  const service = createSnapshotService<string>({
    key: 'k',
    store,
    load,
    ttlMs: TTL,
    failureBackoffMs: over.backoff ?? 30_000,
    now: () => t,
  });

  return { service, store, load, advance: (ms: number) => (t += ms), time: () => t };
}

describe('snapshot dentro da validade', () => {
  it('lê da fonte na primeira vez, guarda e devolve atualizado', async () => {
    const { service, load, store, time } = setup();
    const read = await service.get();

    expect(read).toEqual({ items: ['novo'], at: time(), stale: false });
    expect(load).toHaveBeenCalledTimes(1);
    await expect(store.get('k')).resolves.toEqual({ at: time(), items: ['novo'] });
  });

  it('dentro do TTL serve o guardado, sem tocar na fonte', async () => {
    const { service, load, advance } = setup();

    await service.get();
    advance(TTL - 1);

    expect((await service.get()).stale).toBe(false);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('vencido, busca de novo e guarda o novo', async () => {
    const load = vi.fn().mockResolvedValueOnce(['a']).mockResolvedValueOnce(['b']);
    const { service, advance } = setup({ load });

    await service.get();
    advance(TTL);

    expect((await service.get()).items).toEqual(['b']);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe('fonte fora do ar: último snapshot ou erro', () => {
  it('vencido e a fonte falha: devolve o snapshot marcado como vencido, com a data original', async () => {
    const load = vi.fn().mockResolvedValueOnce(['bom']).mockRejectedValueOnce(new Error('fora'));
    const { service, advance, time } = setup({ load });
    const first = await service.get();

    advance(TTL + 5);

    expect(await service.get()).toEqual({ items: ['bom'], at: first.at, stale: true });
    expect(first.at).toBeLessThan(time());
  });

  it('sem nenhum snapshot e a fonte falha: o erro sobe', async () => {
    const { service } = setup({ load: async () => Promise.reject(new Error('fora')) });

    await expect(service.get()).rejects.toThrow('fora');
  });

  it('depois de uma falha, não martela a fonte durante o backoff (com snapshot)', async () => {
    const load = vi.fn().mockResolvedValueOnce(['bom']).mockRejectedValue(new Error('fora'));
    const { service, advance } = setup({ load, backoff: 30_000 });

    await service.get();
    advance(TTL + 1);
    await service.get();
    await service.get();
    await service.get();

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('nem sem snapshot: dentro do backoff repete o mesmo erro sem nova busca', async () => {
    const load = vi.fn(async () => Promise.reject(new Error('fora')));
    const { service } = setup({ load, backoff: 30_000 });

    await expect(service.get()).rejects.toThrow('fora');
    await expect(service.get()).rejects.toThrow('fora');
    await expect(service.get()).rejects.toThrow('fora');

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('passado o backoff, tenta de novo e se recupera', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('fora')).mockResolvedValueOnce(['voltou']);
    const { service, advance } = setup({ load, backoff: 30_000 });

    await expect(service.get()).rejects.toThrow();
    advance(30_001);

    expect(await service.get()).toMatchObject({ items: ['voltou'], stale: false });
  });
});

describe('leituras simultâneas e armazenamento instável', () => {
  it('várias leituras ao mesmo tempo dividem uma só busca (single-flight)', async () => {
    let resolve!: (items: string[]) => void;
    const load = vi.fn(() => new Promise<string[]>((r) => (resolve = r)));
    const { service } = setup({ load });
    const reads = [service.get(), service.get(), service.get()];

    await Promise.resolve();
    await Promise.resolve();
    resolve(['uma']);

    const results = await Promise.all(reads);

    expect(load).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.items)).toEqual([['uma'], ['uma'], ['uma']]);
  });

  it('leitura do armazenamento falhando não derruba: busca da fonte', async () => {
    const store: JsonStore = {
      get: () => Promise.reject(new Error('blobs fora')),
      set: () => Promise.resolve(),
    };
    const { service } = setup({ store });

    expect((await service.get()).items).toEqual(['novo']);
  });

  it('escrita no armazenamento falhando não derruba: devolve o dado lido', async () => {
    const store: JsonStore = {
      get: async () => null,
      set: () => Promise.reject(new Error('blobs fora')),
    };
    const { service } = setup({ store });

    expect((await service.get()).items).toEqual(['novo']);
  });

  it('conteúdo guardado com formato inesperado é ignorado', async () => {
    const store = memoryJsonStore();

    await store.set('k', { at: 'ontem', items: 'não é lista' });

    const { service, load } = setup({ store });

    expect((await service.get()).items).toEqual(['novo']);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
