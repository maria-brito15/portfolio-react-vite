// Núcleo de `GET /api/personal/books` (docs/specs/personal/hardcover.md), sem depender do ambiente
// da Netlify: o serviço de cache entra por `deps`, então os testes rodam sem rede. `functions/
// personal-books.mts` só liga isto ao ambiente real (variáveis, Blobs).
//
// Contrato: 200 { items, updatedAt, stale, source } · 405 método · 503 { error } (sem detalhes: o
// motivo real vai só para o log do servidor, nunca para o navegador). O token nunca sai daqui.
import type { Book, PersonalFeed } from '../../src/data/personal/types';
import { createSnapshotService, type CachedRead, type JsonStore } from './cache';
import { HardcoverError, fetchHardcoverBooks } from './hardcover';

export type BooksError = 'not_configured' | 'unavailable';

export interface BooksService {
  get(): Promise<CachedRead<Book>>;
}

export interface BooksDeps {
  // `null`: sem token configurado (preview sem variável, desenvolvimento).
  service: BooksService | null;
  log?: (message: string) => void;
}

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra },
  });

export async function handleBooks(req: Request, deps: BooksDeps) {
  if (req.method !== 'GET') return json(405, { error: 'method' }, { allow: 'GET' });
  if (!deps.service)
    return json(
      503,
      { error: 'not_configured' satisfies BooksError },
      { 'cache-control': 'no-store' },
    );

  try {
    const { items, at, stale } = await deps.service.get();
    const feed: PersonalFeed<Book> = {
      items,
      updatedAt: new Date(at).toISOString(),
      stale,
      source: 'hardcover',
    };

    // O cache de verdade é o do servidor (Blobs); a borda só segura por um minuto.
    return json(200, feed, {
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
    });
  } catch (error) {
    const kind = error instanceof HardcoverError ? error.kind : 'unknown';

    deps.log?.(`personal-books: ${kind}${error instanceof Error ? `: ${error.message}` : ''}`);

    return json(
      503,
      { error: 'unavailable' satisfies BooksError },
      {
        'cache-control': 'no-store',
        'retry-after': '60',
      },
    );
  }
}

export interface BooksEnv {
  HARDCOVER_API_TOKEN?: string;
  PERSONAL_HARDCOVER_TTL_MIN?: string;
}

export const DEFAULT_TTL_MIN = 360;

// Monta o serviço a partir do ambiente. Sem token, `null` (a função responde "não configurado").
export function createBooksService(
  env: BooksEnv,
  store: JsonStore,
  fetchFn?: typeof fetch,
): BooksService | null {
  const token = env.HARDCOVER_API_TOKEN?.trim();

  if (!token) return null;

  const ttlMin = Number(env.PERSONAL_HARDCOVER_TTL_MIN);
  const ttlMs = (Number.isFinite(ttlMin) && ttlMin > 0 ? ttlMin : DEFAULT_TTL_MIN) * 60_000;

  return createSnapshotService<Book>({
    key: 'books',
    store,
    ttlMs,
    load: () => fetchHardcoverBooks({ token, fetchFn }),
  });
}
