// Limite por IP (IA-16) e teto global diário (IA-24), sem guardar nada além de
// contadores (IA-20): a chave do visitante é um hash de `IP + sal` junto da hora,
// então não dá para recuperar o IP, e as chaves da hora passada são apagadas
// (expiram em até 1 h; as do dia, em até 1 dia, sem identificar ninguém).
//
// O armazenamento é injetado (`CounterStore`): Netlify Blobs em produção, memória
// como reserva. Blobs tem consistência eventual e "última escrita vence" (D13): a
// contagem é aproximada, e isso é aceito: a barreira real é a soma deste limite, do
// teto global e da cota do Gemini.
import { createHash } from 'node:crypto';
import type { LimitResult, Limiter } from './handle';

export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

export interface CounterStore {
  // Soma 1 à chave e devolve o novo valor.
  increment(key: string): Promise<number>;
  // Apaga as chaves para as quais `isStale` é verdadeiro.
  prune(isStale: (key: string) => boolean): Promise<void>;
}

export interface LimiterOptions {
  perHour: number;
  dailyCap: number;
  salt: string;
  now?: () => number;
}

const hash = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 32);

// A chave termina no número da hora/dia: é o que permite apagar as vencidas sem metadados.
const bucketOf = (key: string) => Number(key.slice(key.lastIndexOf(':') + 1));

export function createLimiter(store: CounterStore, options: LimiterOptions): Limiter {
  const now = options.now ?? Date.now;

  return {
    async check(ip: string): Promise<LimitResult> {
      const time = now();
      const hour = Math.floor(time / HOUR_MS);
      const day = Math.floor(time / DAY_MS);
      const used = await store.increment(`ip:${hash(`${options.salt}|${ip}`)}:${hour}`);

      // Primeira pergunta da hora: aproveita para varrer as chaves vencidas.
      if (used === 1)
        await store
          .prune((key) =>
            key.startsWith('ip:')
              ? bucketOf(key) < hour
              : key.startsWith('day:') && bucketOf(key) < day,
          )
          .catch(() => {});
      if (used > options.perHour) return 'rate';

      const total = await store.increment(`day:${day}`);

      return total > options.dailyCap ? 'cap' : 'ok';
    },
  };
}

export function memoryStore(): CounterStore {
  const counts = new Map<string, number>();

  return {
    async increment(key) {
      const next = (counts.get(key) ?? 0) + 1;

      counts.set(key, next);

      return next;
    },
    async prune(isStale) {
      for (const key of counts.keys()) if (isStale(key)) counts.delete(key);
    },
  };
}

// O que usamos do `Store` do `@netlify/blobs` (assim o teste não precisa da Netlify).
export interface BlobStoreLike {
  get(key: string): Promise<string | null>;
  set(key: string, data: string): Promise<unknown>;
  delete(key: string): Promise<void>;
  list(options: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
}

export function blobsCounter(store: BlobStoreLike): CounterStore {
  return {
    async increment(key) {
      const next = (Number(await store.get(key)) || 0) + 1;

      await store.set(key, String(next));

      return next;
    },
    async prune(isStale) {
      for (const prefix of ['ip:', 'day:']) {
        const { blobs } = await store.list({ prefix });

        await Promise.all(blobs.filter((b) => isStale(b.key)).map((b) => store.delete(b.key)));
      }
    },
  };
}

// Se o armazenamento principal falhar, segue com o de reserva em vez de derrubar o
// assistente (ou de abrir mão do limite).
export function withFallback(primary: CounterStore, fallback: CounterStore): CounterStore {
  return {
    async increment(key) {
      try {
        return await primary.increment(key);
      } catch {
        return fallback.increment(key);
      }
    },
    async prune(isStale) {
      await primary.prune(isStale).catch(() => {});
      await fallback.prune(isStale);
    },
  };
}
