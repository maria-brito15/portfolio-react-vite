// Cache de leitura com snapshot de reserva (docs/specs/personal/README.md, seção 6). Serve o dado
// guardado enquanto ele é novo; vencido, tenta buscar de novo; se a fonte falhar, devolve o último
// snapshot marcado como vencido (`stale`) em vez de erro; sem snapshot nenhum, só então falha.
//
// Regras que evitam martelar a fonte (o Hardcover limita ~60 requisições por minuto):
// - leituras simultâneas dividem uma só busca em andamento (single-flight);
// - depois de uma falha, não se tenta de novo antes de `failureBackoffMs`, mesmo que cheguem
//   dezenas de visitantes (o estado vive na instância da função; é suficiente, só reduz tentativas).
//
// O armazenamento é injetado: Netlify Blobs em produção, memória nos testes.

export interface JsonStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

export interface Snapshot<T> {
  // Instante (ms desde 1970) em que o dado foi lido da fonte com sucesso.
  at: number;
  items: T[];
}

export interface CachedRead<T> {
  items: T[];
  at: number;
  stale: boolean;
}

export interface SnapshotServiceOptions<T> {
  key: string;
  store: JsonStore;
  load: () => Promise<T[]>;
  ttlMs: number;
  failureBackoffMs?: number;
  now?: () => number;
}

const isSnapshot = <T>(value: unknown): value is Snapshot<T> =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Snapshot<T>).at === 'number' &&
  Array.isArray((value as Snapshot<T>).items);

export function createSnapshotService<T>(options: SnapshotServiceOptions<T>) {
  const now = options.now ?? Date.now;
  const backoff = options.failureBackoffMs ?? 60_000;
  let inflight: Promise<T[]> | undefined;
  let lastFailure: { at: number; error: unknown } | undefined;

  return {
    async get(): Promise<CachedRead<T>> {
      // Armazenamento fora do ar não derruba a página: segue como se não houvesse snapshot.
      const stored = await options.store.get(options.key).catch(() => null);
      const snapshot = isSnapshot<T>(stored) ? stored : null;
      const time = now();

      if (snapshot && time - snapshot.at < options.ttlMs)
        return { items: snapshot.items, at: snapshot.at, stale: false };

      const cooling = lastFailure !== undefined && time - lastFailure.at < backoff;

      if (cooling) {
        if (snapshot) return { items: snapshot.items, at: snapshot.at, stale: true };

        throw lastFailure!.error;
      }

      try {
        inflight ??= options.load().finally(() => {
          inflight = undefined;
        });

        const items = await inflight;
        const at = now();

        await options.store.set(options.key, { at, items } satisfies Snapshot<T>).catch(() => {});
        lastFailure = undefined;

        return { items, at, stale: false };
      } catch (error) {
        lastFailure = { at: now(), error };

        if (snapshot) return { items: snapshot.items, at: snapshot.at, stale: true };

        throw error;
      }
    },
  };
}

export function memoryJsonStore(): JsonStore & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();

  return {
    data,
    async get(key) {
      return data.get(key) ?? null;
    },
    async set(key, value) {
      data.set(key, value);
    },
  };
}
