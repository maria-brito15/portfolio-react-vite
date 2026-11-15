// Feed de atividade do caderno (revisão R1, CD-92): "em [data], [ação] — nota [x]", montado só com
// o que os feeds já integrados informam (Hardcover para livros, Letterboxd/TMDB para filmes).
// Nada é presumido: item sem data não vira evento, livro sem `startedAt` não "começou", e a nota
// só aparece se a fonte a trouxer. Função pura, sem React, para testar sem montar página.
import type { Book, FilmDiaryEntry, Rating } from '../personal/types';

export type ActivityKind = 'watched' | 'rewatched' | 'finished' | 'started';

export interface ActivityItem {
  id: string;
  // Dia ISO (AAAA-MM-DD), sempre vindo da fonte.
  date: string;
  kind: ActivityKind;
  title: string;
  year?: number;
  rating?: Rating;
  // Só o RSS do Letterboxd informa; ausente = a fonte não disse.
  liked?: boolean;
  image?: string;
  // Página do item na fonte (resenha no Letterboxd, livro no Hardcover), se houver.
  href?: string;
}

const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;

// Só o dia: horas e fuso que a fonte anexar não mudam a data mostrada.
const day = (value?: string) => (value && DAY.test(value) ? value.slice(0, 10) : undefined);

export function buildActivity(books: Book[], films: FilmDiaryEntry[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const film of films) {
    const date = day(film.watchedDate);

    if (!date) continue;

    items.push({
      id: `${film.id}@${date}`,
      date,
      kind: film.rewatch ? 'rewatched' : 'watched',
      title: film.title,
      year: film.year,
      rating: film.rating,
      liked: film.liked,
      image: film.posterUrl ?? film.meta?.posterUrl,
      href: film.reviewUrl,
    });
  }

  for (const book of books) {
    const finished = book.status === 'read' ? day(book.finishedAt) : undefined;
    const started = day(book.startedAt);
    const base = { title: book.title, image: book.coverUrl, href: book.provenance.url };

    if (finished) {
      items.push({ ...base, id: `${book.id}#finished`, date: finished, kind: 'finished', rating: book.rating });
    }

    if (started) items.push({ ...base, id: `${book.id}#started`, date: started, kind: 'started' });
  }

  // Mais recente primeiro; no mesmo dia, terminar vem antes de começar (empate mantém a entrada).
  const weight: Record<ActivityKind, number> = { finished: 0, watched: 1, rewatched: 1, started: 2 };

  return items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        b.item.date.localeCompare(a.item.date) ||
        weight[a.item.kind] - weight[b.item.kind] ||
        a.index - b.index,
    )
    .map(({ item }) => item);
}

// Nota de 0 a 5 arredondada à meia estrela (o componente de estrelas aceita qualquer número).
export const toHalf = (value: number) => Math.min(5, Math.max(0, Math.round(value * 2) / 2));
