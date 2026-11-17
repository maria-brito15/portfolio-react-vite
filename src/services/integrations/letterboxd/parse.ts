// Validação da resposta de `GET /api/personal/films` no navegador (mesma postura de hardcover/parse):
// o formato é conferido e o que não serve é descartado. Pôster só `https:`; `publish: false` nunca
// deixa a resenha passar, mesmo que o servidor a enviasse.
import type { FilmDiaryEntry, FilmMeta, PersonalFeed } from '../../../data/personal/types';

const RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);
const day = (v: unknown) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
const https = (v: unknown) => (typeof v === 'string' && v.startsWith('https://') ? v : undefined);
const positive = (v: unknown) =>
  typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : undefined;
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => !!text(s)) : []);

function parseMeta(raw: unknown): FilmMeta | undefined {
  if (!isObject(raw)) return undefined;

  const tmdbId = positive(raw.tmdbId);

  if (tmdbId === undefined) return undefined;

  const genres = isObject(raw.genres) ? raw.genres : {};
  const overview = isObject(raw.overview) ? raw.overview : undefined;

  return {
    tmdbId,
    directors: strings(raw.directors),
    genres: { pt: strings(genres.pt), en: strings(genres.en) },
    runtimeMin: positive(raw.runtimeMin),
    posterUrl: https(raw.posterUrl),
    backdropUrl: https(raw.backdropUrl),
    overview:
      overview && (text(overview.pt) || text(overview.en))
        ? { pt: text(overview.pt) ?? '', en: text(overview.en) ?? '' }
        : undefined,
  };
}

function parseEntry(raw: unknown): FilmDiaryEntry | undefined {
  if (!isObject(raw)) return undefined;

  const { id, title, reviewUrl } = raw;

  if (typeof id !== 'string' || !text(title) || !https(reviewUrl)) return undefined;

  const publish = raw.publish === false ? false : undefined;
  const provenance = isObject(raw.provenance) ? raw.provenance : {};
  const meta = parseMeta(raw.meta);

  return {
    id,
    kind: raw.kind === 'tv' ? 'tv' : 'movie',
    title: title as string,
    year: positive(raw.year),
    watchedDate: day(raw.watchedDate),
    rewatch: raw.rewatch === true,
    rating: RATINGS.includes(raw.rating as number)
      ? (raw.rating as FilmDiaryEntry['rating'])
      : undefined,
    liked: typeof raw.liked === 'boolean' ? raw.liked : undefined,
    tmdbId: positive(raw.tmdbId),
    posterUrl: https(raw.posterUrl),
    reviewUrl: reviewUrl as string,
    review: publish === false ? undefined : text(raw.review),
    spoiler: publish === false ? undefined : raw.spoiler === true ? true : undefined,
    publish,
    meta,
    provenance: {
      source: 'letterboxd',
      url: https(provenance.url),
      fetchedAt: text(provenance.fetchedAt) ?? '',
    },
  };
}

// `undefined`: fora do contrato (o hook mostra o estado de erro).
export function parseFilmFeed(data: unknown): PersonalFeed<FilmDiaryEntry> | undefined {
  if (!isObject(data) || !Array.isArray(data.items)) return undefined;
  if (typeof data.updatedAt !== 'string' || typeof data.stale !== 'boolean') return undefined;

  return {
    items: data.items.map(parseEntry).filter((e): e is FilmDiaryEntry => e !== undefined),
    updatedAt: data.updatedAt,
    stale: data.stale,
    source: 'letterboxd',
  };
}
