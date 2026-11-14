// Validação da resposta de `GET /api/personal/books` no navegador. O servidor já normaliza, mas a
// resposta atravessa a rede (e um cache de borda): o cliente confere o formato e descarta o que
// não serve, em vez de confiar. Capa só com `https:`; item sem id, título ou estado válido sai.
import type { Book, PersonalFeed } from '../../../data/personal/types';

const STATUSES: Book['status'][] = ['reading', 'read', 'want', 'paused', 'dnf'];
const RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);
const day = (v: unknown) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
const https = (v: unknown) => (typeof v === 'string' && v.startsWith('https://') ? v : undefined);
const count = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined;

function parseBook(raw: unknown): Book | undefined {
  if (!isObject(raw)) return undefined;

  const { id, title, status } = raw;

  if (typeof id !== 'string' || !text(title) || !STATUSES.includes(status as Book['status']))
    return undefined;

  const progress = isObject(raw.progress)
    ? { pages: count(raw.progress.pages), percent: count(raw.progress.percent) }
    : undefined;
  const provenance = isObject(raw.provenance) ? raw.provenance : {};

  return {
    id,
    title: title as string,
    authors: Array.isArray(raw.authors) ? raw.authors.filter((a): a is string => !!text(a)) : [],
    coverUrl: https(raw.coverUrl),
    pages: count(raw.pages),
    status: status as Book['status'],
    rating: RATINGS.includes(raw.rating as number) ? (raw.rating as Book['rating']) : undefined,
    startedAt: day(raw.startedAt),
    finishedAt: day(raw.finishedAt),
    review: text(raw.review),
    progress: progress && (progress.pages || progress.percent) ? progress : undefined,
    provenance: {
      source: 'hardcover',
      url: https(provenance.url),
      fetchedAt: text(provenance.fetchedAt) ?? '',
    },
  };
}

// `undefined`: a resposta não tem o formato do contrato (o hook mostra o estado de erro).
export function parseBookFeed(data: unknown): PersonalFeed<Book> | undefined {
  if (!isObject(data) || !Array.isArray(data.items)) return undefined;
  if (typeof data.updatedAt !== 'string' || typeof data.stale !== 'boolean') return undefined;

  return {
    items: data.items.map(parseBook).filter((b): b is Book => b !== undefined),
    updatedAt: data.updatedAt,
    stale: data.stale,
    source: 'hardcover',
  };
}
