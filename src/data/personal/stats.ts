// Estatísticas derivadas dos itens (ReadingStats e FilmStats). Funções puras: o recorte é o ano
// mais recente com data, sem olhar o relógio, então o resultado depende só dos dados.
import type { Lang } from '../../types';
import type { Book, FilmDiaryEntry, FilmStats, ReadingStats } from './types';

const yearOf = (date?: string) => {
  const match = date ? /^(\d{4})-(0[1-9]|1[0-2])/.exec(date) : null;

  return match ? Number(match[1]) : undefined;
};

const latest = (years: (number | undefined)[]) => {
  const known = years.filter((y): y is number => y !== undefined);

  return known.length ? Math.max(...known) : undefined;
};

// Média das notas existentes; sem nenhuma nota, `undefined` (e não 0).
const average = (ratings: (number | undefined)[]) => {
  const rated = ratings.filter((r): r is number => r !== undefined);

  return rated.length ? rated.reduce((sum, r) => sum + r, 0) / rated.length : undefined;
};

export function readingStats(books: Book[]): ReadingStats {
  const read = books.filter((b) => b.status === 'read');
  const year = latest(read.map((b) => yearOf(b.finishedAt)));
  const scope = year === undefined ? read : read.filter((b) => yearOf(b.finishedAt) === year);
  const pages = scope.map((b) => b.pages).filter((p): p is number => p !== undefined);

  return {
    year,
    booksRead: scope.length,
    pagesRead: pages.length ? pages.reduce((sum, p) => sum + p, 0) : undefined,
    averageRating: average(scope.map((b) => b.rating)),
    currentlyReading: books.filter((b) => b.status === 'reading').length,
    wantToRead: books.filter((b) => b.status === 'want').length,
  };
}

export function filmStats(films: FilmDiaryEntry[]): FilmStats {
  const year = latest(films.map((f) => yearOf(f.watchedDate)));
  const scope = year === undefined ? films : films.filter((f) => yearOf(f.watchedDate) === year);

  return {
    year,
    filmsWatched: scope.length,
    rewatches: scope.filter((f) => f.rewatch).length,
    liked: scope.filter((f) => f.liked).length,
    averageRating: average(scope.map((f) => f.rating)),
  };
}

// Uma casa decimal, com vírgula em português ("3,9"); sem média, "—".
export function formatAverage(value: number | undefined, lang: Lang) {
  if (value === undefined) return '—';

  const text = (Math.round(value * 10) / 10).toFixed(1);

  return lang === 'pt' ? text.replace('.', ',') : text;
}
