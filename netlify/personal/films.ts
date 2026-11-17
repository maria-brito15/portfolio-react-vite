// Núcleo de `GET /api/personal/films` (docs/specs/personal/films.md): RSS do Letterboxd (cache de
// 1 h, snapshot de reserva) + histórico do CSV (JSON versionado) + TMDB (cache permanente por
// filme). Caches separados por fonte; o TMDB nunca torna a resposta "vencida": sem ele, o diário
// segue sem pôsteres. Contrato igual ao dos livros: 200 { items, updatedAt, stale, source } · 405 ·
// 503 { error } sem detalhes (o motivo vai só ao log).
import type { FilmDiaryEntry, PersonalFeed } from '../../src/data/personal/types';
import { createSnapshotService, type CachedRead, type JsonStore } from './cache';
import { LetterboxdError, fetchLetterboxdFeed } from './letterboxd';
import { emptyHistory, historyToEntries, mergeDiary, type History } from './letterboxdCsv';
import { TmdbError, createEnricher } from './tmdb';

export type FilmsError = 'unavailable';

export interface FilmsService {
  get(): Promise<CachedRead<FilmDiaryEntry>>;
}

export interface FilmsDeps {
  service: FilmsService;
  log?: (message: string) => void;
}

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra },
  });

export async function handleFilms(req: Request, deps: FilmsDeps) {
  if (req.method !== 'GET') return json(405, { error: 'method' }, { allow: 'GET' });

  try {
    const { items, at, stale } = await deps.service.get();
    const feed: PersonalFeed<FilmDiaryEntry> = {
      items: items.map(publishable),
      updatedAt: new Date(at).toISOString(),
      stale,
      source: 'letterboxd',
    };

    return json(200, feed, { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' });
  } catch (error) {
    const kind =
      error instanceof LetterboxdError || error instanceof TmdbError ? error.kind : 'unknown';

    deps.log?.(`personal-films: ${kind}${error instanceof Error ? `: ${error.message}` : ''}`);

    return json(
      503,
      { error: 'unavailable' satisfies FilmsError },
      { 'cache-control': 'no-store', 'retry-after': '60' },
    );
  }
}

// `publish: false` (D8): a resenha nem sai do servidor.
const publishable = (entry: FilmDiaryEntry): FilmDiaryEntry =>
  entry.publish === false ? { ...entry, review: undefined, spoiler: undefined } : entry;

export interface FilmsEnv {
  LETTERBOXD_USERNAME?: string;
  PERSONAL_LETTERBOXD_TTL_MIN?: string;
  TMDB_API_KEY?: string;
}

export const DEFAULT_LETTERBOXD_TTL_MIN = 60;

export function createFilmsService(
  env: FilmsEnv,
  store: JsonStore,
  history: History = emptyHistory(),
  options: { fetchFn?: typeof fetch; log?: (message: string) => void } = {},
): FilmsService {
  const username = env.LETTERBOXD_USERNAME?.trim() || 'dudapbrt';
  const profile = `https://letterboxd.com/${encodeURIComponent(username)}/`;
  const ttlMin = Number(env.PERSONAL_LETTERBOXD_TTL_MIN);
  const ttlMs =
    (Number.isFinite(ttlMin) && ttlMin > 0 ? ttlMin : DEFAULT_LETTERBOXD_TTL_MIN) * 60_000;
  const auth = env.TMDB_API_KEY?.trim();
  const enrich = auth
    ? createEnricher({ auth, store, fetchFn: options.fetchFn, log: options.log })
    : undefined;
  const rss = createSnapshotService<FilmDiaryEntry>({
    key: 'letterboxd',
    store,
    ttlMs,
    load: () => fetchLetterboxdFeed({ username, fetchFn: options.fetchFn }),
  });
  const csv = () =>
    historyToEntries(history, profile, history.importedAt || new Date(0).toISOString());
  const finish = async (entries: FilmDiaryEntry[]) => (enrich ? enrich(entries) : entries);

  return {
    async get() {
      try {
        const read = await rss.get();

        return { ...read, items: await finish(mergeDiary(read.items, csv())) };
      } catch (error) {
        // RSS fora do ar e sem snapshot: o histórico do CSV ainda é verdade, marcado como vencido.
        if (history.entries.length === 0) throw error;

        options.log?.(`personal-films: rss indisponível, servindo o histórico do CSV`);

        return {
          items: await finish(csv()),
          at: Date.parse(history.importedAt) || 0,
          stale: true,
        };
      }
    },
  };
}
