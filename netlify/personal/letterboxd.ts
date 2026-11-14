// Cliente do feed RSS público do Letterboxd (docs/specs/personal/films.md). Só o RSS oficial do
// perfil, `https://letterboxd.com/<usuário>/rss/` (descoberto e conferido em 14/11/2026: HTTP 200,
// `application/rss+xml`, 50 itens, namespaces `letterboxd:` e `tmdb:`). Nada de HTML de página,
// nada de endpoint não oficial, nenhuma credencial.
//
// O que o feed traz (e só isto vira dado): título, ano, `watchedDate` (ausente em parte das
// entradas), `memberRating` (ausente sem nota), `rewatch`, `memberLike`, id do TMDB (`movieId` ou
// `tvId`) e, nas entradas de resenha (`guid` `letterboxd-review-…`), o texto da resenha dentro de
// `description`. Listas, favoritos e watchlist NÃO estão no feed do perfil.
import type { FilmDiaryEntry, Rating } from '../../src/data/personal/types';

export type LetterboxdErrorKind = 'unavailable' | 'bad_feed';

export class LetterboxdError extends Error {
  constructor(
    readonly kind: LetterboxdErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'LetterboxdError';
  }
}

export const letterboxdFeedUrl = (username: string) =>
  `https://letterboxd.com/${encodeURIComponent(username)}/rss/`;

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

// Decodifica as entidades que o feed usa (`&#039;`, `&quot;`, `&amp;`…). `&amp;` por último não é
// necessário aqui porque a troca é de uma passada só (sem dupla decodificação).
export function decodeEntities(text: string) {
  return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec, hex, name) => {
    const code = dec ? Number(dec) : hex ? parseInt(hex, 16) : undefined;

    if (code !== undefined) {
      try {
        return String.fromCodePoint(code);
      } catch {
        return whole;
      }
    }

    return NAMED[String(name).toLowerCase()] ?? whole;
  });
}

// Texto de uma tag do namespace (`letterboxd:filmTitle`); `undefined` se ausente ou vazia.
function tag(item: string, name: string) {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(item);
  const value = match ? decodeEntities(match[1]).trim() : '';

  return value || undefined;
}

const CDATA = /<!\[CDATA\[([\s\S]*?)\]\]>/;

// A `description` é HTML do próprio feed: um parágrafo com o pôster do Letterboxd (ignorado: o
// pôster vem do TMDB), a linha "Watched on…" (gerada pelo Letterboxd, não é resenha), o aviso de
// spoiler e, nas resenhas, os parágrafos escritos por ela.
export function reviewFromDescription(description: string) {
  const html = CDATA.exec(description)?.[1] ?? description;
  const paragraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  let spoiler = false;
  const kept: string[] = [];

  for (const paragraph of paragraphs) {
    if (/^\s*<img\b[^>]*\/?>\s*$/.test(paragraph)) continue;
    if (/^\s*<em>\s*This review may contain spoilers\.\s*<\/em>\s*$/.test(paragraph)) {
      spoiler = true;
      continue;
    }

    const text = decodeEntities(
      paragraph
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .trim(),
    );

    if (text) kept.push(text);
  }

  return { review: kept.length ? kept.join('\n\n') : undefined, spoiler };
}

const RATINGS: Rating[] = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const rating = (value?: string) => {
  const number = Number(value);

  return value !== undefined && RATINGS.includes(number as Rating) ? (number as Rating) : undefined;
};
const isDay = (value?: string) =>
  value !== undefined && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value);
const positiveInt = (value?: string) => {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : undefined;
};

// Normaliza o XML do feed para o modelo. Item sem título ou sem link do próprio Letterboxd é
// descartado; campo que o feed não traz fica ausente. Ordena por data de exibição (mais recente
// primeiro); sem data, no fim, na ordem do feed (que é a do registro).
export function parseLetterboxdFeed(xml: string, fetchedAt = new Date().toISOString()) {
  if (!/<rss[\s>]/.test(xml)) throw new LetterboxdError('bad_feed', 'Resposta não é um feed RSS.');

  const entries: FilmDiaryEntry[] = [];

  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = match[1];
    const title = tag(item, 'letterboxd:filmTitle');
    const link = tag(item, 'link');
    const guid = tag(item, 'guid');

    if (!title || !guid || !link?.startsWith('https://letterboxd.com/')) continue;

    const year = positiveInt(tag(item, 'letterboxd:filmYear'));
    const watchedDate = tag(item, 'letterboxd:watchedDate');
    const tvId = positiveInt(tag(item, 'tmdb:tvId'));
    const movieId = positiveInt(tag(item, 'tmdb:movieId'));
    const isReview = guid.startsWith('letterboxd-review-');
    const description = /<description>([\s\S]*?)<\/description>/.exec(item)?.[1] ?? '';
    const { review, spoiler } = isReview
      ? reviewFromDescription(description)
      : { review: undefined, spoiler: false };

    entries.push({
      id: `lb:${guid.replace(/^letterboxd-/, '')}`,
      kind: tvId !== undefined && movieId === undefined ? 'tv' : 'movie',
      title,
      year,
      watchedDate: isDay(watchedDate) ? watchedDate : undefined,
      rewatch: tag(item, 'letterboxd:rewatch') === 'Yes',
      rating: rating(tag(item, 'letterboxd:memberRating')),
      liked: tag(item, 'letterboxd:memberLike') === 'Yes',
      tmdbId: movieId ?? tvId,
      reviewUrl: link,
      review,
      spoiler: review && spoiler ? true : undefined,
      provenance: { source: 'letterboxd', url: link, fetchedAt },
    });
  }

  return sortDiary(entries);
}

// Mais recente primeiro por `watchedDate`; sem data ao fim; empate mantém a ordem de entrada
// (`sort` é estável).
export function sortDiary(entries: FilmDiaryEntry[]): FilmDiaryEntry[] {
  return [...entries].sort((a, b) => {
    const da = a.watchedDate ?? '';
    const db = b.watchedDate ?? '';

    if (da === db) return 0;

    return da === '' ? 1 : db === '' ? -1 : db.localeCompare(da);
  });
}

const TIMEOUT_MS = 6_000;

export async function fetchLetterboxdFeed(options: {
  username: string;
  fetchFn?: typeof fetch;
  now?: () => Date;
}) {
  const doFetch = options.fetchFn ?? fetch;
  let res: Response;

  try {
    res = await doFetch(letterboxdFeedUrl(options.username), {
      headers: {
        accept: 'application/rss+xml, application/xml;q=0.9',
        'user-agent': 'portfolio-duda (feed RSS do próprio perfil)',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new LetterboxdError('unavailable', error instanceof Error ? error.message : 'rede');
  }

  if (!res.ok) throw new LetterboxdError('unavailable', `HTTP ${res.status}`);

  return parseLetterboxdFeed(await res.text(), (options.now?.() ?? new Date()).toISOString());
}
