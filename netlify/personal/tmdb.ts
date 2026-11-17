// Cliente do TMDB (API v3, https://developer.themoviedb.org/docs) e enriquecimento do diário.
// Só no servidor: `TMDB_API_KEY` nunca vai ao navegador. Aceita a chave v3 (`api_key` na URL) ou o
// "API Read Access Token" v4 (começa com `eyJ`, vai como Bearer); o motivo de uma falha vai ao log,
// nunca a URL (que carregaria a chave v3).
//
// Por filme: uma chamada por idioma (`pt-BR` e `en-US`) com `append_to_response=credits`, que traz
// sinopse, gêneros, duração, pôster, fundo e equipe. O resultado vale para sempre (cache por
// `tmdbId` em Blobs); só se refaz o que veio sem pôster, depois de uma semana, porque pôster de
// lançamento recente aparece tarde. Atribuição obrigatória: ver `AttributionFooter`.
import type { FilmDiaryEntry, FilmMeta } from '../../src/data/personal/types';
import type { JsonStore } from './cache';

export type TmdbErrorKind = 'auth' | 'not_found' | 'rate' | 'unavailable';

export class TmdbError extends Error {
  constructor(
    readonly kind: TmdbErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

const API = 'https://api.themoviedb.org/3';
// Base documentada de imagens (`secure_base_url` de /configuration); tamanhos fixos usados pela página.
const IMAGE = 'https://image.tmdb.org/t/p';
const POSTER_SIZE = 'w342';
const BACKDROP_SIZE = 'w780';
const TIMEOUT_MS = 5_000;

export type TmdbKind = 'movie' | 'tv';

interface TmdbCredit {
  job?: string;
  name?: string;
}

interface TmdbDetails {
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  genres?: { name?: string }[];
  runtime?: number | null;
  credits?: { crew?: TmdbCredit[] };
  created_by?: TmdbCredit[];
}

const names = (list: { name?: string }[] | undefined) =>
  (list ?? []).map((g) => g.name?.trim()).filter((n): n is string => !!n);

function request(
  auth: string,
  path: string,
  params: Record<string, string>,
  fetchFn: typeof fetch,
) {
  const bearer = auth.startsWith('eyJ');
  const url = new URL(`${API}${path}`);

  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (!bearer) url.searchParams.set('api_key', auth);

  return fetchFn(url, {
    headers: { accept: 'application/json', ...(bearer && { authorization: `Bearer ${auth}` }) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function details(
  auth: string,
  kind: TmdbKind,
  id: number,
  language: string,
  fetchFn: typeof fetch,
): Promise<TmdbDetails> {
  let res: Response;

  try {
    res = await request(
      auth,
      `/${kind}/${id}`,
      { language, append_to_response: 'credits' },
      fetchFn,
    );
  } catch (error) {
    throw new TmdbError('unavailable', error instanceof Error ? error.message : 'rede');
  }

  if (res.status === 401 || res.status === 403) throw new TmdbError('auth', `HTTP ${res.status}`);
  if (res.status === 404) throw new TmdbError('not_found', `${kind} ${id}`);
  if (res.status === 429) throw new TmdbError('rate', 'HTTP 429');
  if (!res.ok) throw new TmdbError('unavailable', `HTTP ${res.status}`);

  return (await res.json()) as TmdbDetails;
}

const image = (size: string, path?: string | null) =>
  path && /^\/[\w.-]+$/.test(path) ? `${IMAGE}/${size}${path}` : undefined;

// Metadados de um filme ou série, nos dois idiomas. Diretor só para filme (para série, o TMDB tem
// "criado por", que não é a mesma coisa: fica vazio em vez de rotular errado).
export async function fetchTmdbMeta(options: {
  auth: string;
  id: number;
  kind: TmdbKind;
  fetchFn?: typeof fetch;
}): Promise<FilmMeta> {
  const doFetch = options.fetchFn ?? fetch;
  const [pt, en] = await Promise.all([
    details(options.auth, options.kind, options.id, 'pt-BR', doFetch),
    details(options.auth, options.kind, options.id, 'en-US', doFetch),
  ]);
  const overview = { pt: pt.overview?.trim() ?? '', en: en.overview?.trim() ?? '' };
  const directors =
    options.kind === 'movie'
      ? [
          ...new Set(
            (en.credits?.crew ?? [])
              .filter((c) => c.job === 'Director')
              .map((c) => c.name?.trim())
              .filter((n): n is string => !!n),
          ),
        ]
      : [];
  const runtime = options.kind === 'movie' ? (en.runtime ?? pt.runtime) : undefined;

  return {
    tmdbId: options.id,
    directors,
    genres: { pt: names(pt.genres), en: names(en.genres) },
    runtimeMin: runtime && runtime > 0 ? runtime : undefined,
    posterUrl: image(POSTER_SIZE, en.poster_path ?? pt.poster_path),
    backdropUrl: image(BACKDROP_SIZE, en.backdrop_path ?? pt.backdrop_path),
    // Sinopse que o TMDB não tem num idioma fica ausente nele (não se copia do outro).
    overview: overview.pt || overview.en ? { pt: overview.pt, en: overview.en } : undefined,
  };
}

// ---------- Cache permanente por filme ----------

interface MetaRecord {
  meta: FilmMeta;
  at: number;
}

export interface TmdbCache {
  version: 1;
  // Chave `movie:123` / `tv:456`.
  meta: Record<string, MetaRecord>;
  // Ids que o TMDB não conhece (404): não se insiste por um tempo.
  missing: Record<string, number>;
}

const WEEK_MS = 7 * 24 * 3_600_000;
export const TMDB_CACHE_KEY = 'tmdb-meta';

const cacheKey = (kind: TmdbKind, id: number) => `${kind}:${id}`;

function readCache(value: unknown): TmdbCache {
  const raw = value as Partial<TmdbCache> | null;

  return raw && raw.version === 1 && typeof raw.meta === 'object' && raw.meta !== null
    ? { version: 1, meta: raw.meta, missing: raw.missing ?? {} }
    : { version: 1, meta: {}, missing: {} };
}

export interface EnrichOptions {
  auth: string;
  store: JsonStore;
  fetchFn?: typeof fetch;
  now?: () => number;
  // Quantos filmes novos buscar por requisição; o resto fica para as próximas (a função da Netlify
  // tem tempo curto e o diário pode ter centenas de títulos vindos do CSV).
  maxFetches?: number;
  concurrency?: number;
  log?: (message: string) => void;
}

// Anexa `meta` e `posterUrl` a cada entrada cujo `tmdbId` esteja no cache; busca no TMDB os que
// faltam (limitado) e grava o cache. Falha do TMDB nunca derruba o diário: a entrada segue sem
// pôster (placeholder). Chave inválida ou limite de taxa interrompem as buscas desta requisição.
export function createEnricher(options: EnrichOptions) {
  const now = options.now ?? Date.now;
  const maxFetches = options.maxFetches ?? 20;
  const concurrency = options.concurrency ?? 5;

  return async function enrich(entries: FilmDiaryEntry[]): Promise<FilmDiaryEntry[]> {
    const cache = readCache(await options.store.get(TMDB_CACHE_KEY).catch(() => null));
    const time = now();
    const wanted = new Map<string, { kind: TmdbKind; id: number }>();

    for (const entry of entries) {
      if (entry.tmdbId === undefined) continue;

      const key = cacheKey(entry.kind, entry.tmdbId);
      const hit = cache.meta[key];
      const fresh = hit && (hit.meta.posterUrl || time - hit.at < WEEK_MS);
      const missing = cache.missing[key] !== undefined && time - cache.missing[key] < WEEK_MS;

      if (!fresh && !missing) wanted.set(key, { kind: entry.kind, id: entry.tmdbId });
    }

    // As entradas vêm do mais recente ao mais antigo: o que aparece primeiro na página é buscado antes.
    const queue = [...wanted].slice(0, maxFetches);
    let stop = false;
    let changed = false;

    async function worker() {
      for (let next = queue.shift(); next && !stop; next = queue.shift()) {
        const [key, { kind, id }] = next;

        try {
          const meta = await fetchTmdbMeta({
            auth: options.auth,
            id,
            kind,
            fetchFn: options.fetchFn,
          });

          cache.meta[key] = { meta, at: now() };
          delete cache.missing[key];
          changed = true;
        } catch (error) {
          if (error instanceof TmdbError && error.kind === 'not_found') {
            cache.missing[key] = now();
            changed = true;
          } else {
            const kind = error instanceof TmdbError ? error.kind : 'unknown';

            options.log?.(
              `personal-films: tmdb ${kind}${error instanceof Error ? `: ${error.message}` : ''}`,
            );
            if (kind === 'auth' || kind === 'rate') stop = true;
          }
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));

    if (changed) await options.store.set(TMDB_CACHE_KEY, cache).catch(() => {});

    return entries.map((entry) => {
      const meta =
        entry.tmdbId === undefined
          ? undefined
          : cache.meta[cacheKey(entry.kind, entry.tmdbId)]?.meta;

      return meta ? { ...entry, meta, posterUrl: meta.posterUrl } : entry;
    });
  };
}

// Resolve o id do TMDB de um filme do CSV (que não traz id) por busca exata: título (ou título
// original) igual e ano de lançamento igual, com UM só resultado. Ambíguo ou sem resultado = `undefined`
// (o filme fica sem pôster, nunca com o pôster errado). Usado só pelo importador, na máquina dela.
export async function searchTmdbMovieId(options: {
  auth: string;
  title: string;
  year: number;
  fetchFn?: typeof fetch;
}): Promise<number | undefined> {
  const fold = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  let res: Response;

  try {
    res = await request(
      options.auth,
      '/search/movie',
      { query: options.title, year: String(options.year), language: 'en-US' },
      options.fetchFn ?? fetch,
    );
  } catch (error) {
    throw new TmdbError('unavailable', error instanceof Error ? error.message : 'rede');
  }

  if (res.status === 401 || res.status === 403) throw new TmdbError('auth', `HTTP ${res.status}`);
  if (res.status === 429) throw new TmdbError('rate', 'HTTP 429');
  if (!res.ok) throw new TmdbError('unavailable', `HTTP ${res.status}`);

  const { results } = (await res.json()) as {
    results?: { id?: number; title?: string; original_title?: string; release_date?: string }[];
  };
  const exact = (results ?? []).filter(
    (r) =>
      typeof r.id === 'number' &&
      r.release_date?.startsWith(String(options.year)) &&
      [r.title, r.original_title].some((t) => t && fold(t) === fold(options.title)),
  );

  return exact.length === 1 ? exact[0].id : undefined;
}
