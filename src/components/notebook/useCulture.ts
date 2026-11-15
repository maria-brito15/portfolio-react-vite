// O que a Duda está lendo e o último filme (CD-31, CD-11), a partir dos feeds que já existem.
// Nada de novo na camada de integração. Sem dado, `undefined`: quem mostra decide omitir (CD-32).
import { currentBook, latestFilm } from '../../data/personal/highlights';
import type { Book, FilmDiaryEntry } from '../../data/personal/types';
import { buildActivity, type ActivityItem } from '../../data/notebook/activity';
import { usePersonalBooks, usePersonalFilms } from '../../hooks/usePersonal';

export interface Culture {
  book?: Book;
  film?: FilmDiaryEntry;
  // O dado veio do mock da Fase 1 (fictício): a faixa o rotula como exemplo.
  bookSample: boolean;
  filmSample: boolean;
  // Feed de atividade (revisão R1) com o que já carregou; vazio enquanto nada chegou.
  activity: ActivityItem[];
}

export function useCulture(): Culture {
  const books = usePersonalBooks().state;
  const films = usePersonalFilms().state;
  const book = books.status === 'ready' ? currentBook(books.feed.items) : undefined;
  const film = films.status === 'ready' ? latestFilm(films.feed.items) : undefined;

  const activity = buildActivity(
    books.status === 'ready' ? books.feed.items : [],
    films.status === 'ready' ? films.feed.items : [],
  );

  return {
    activity,
    book,
    film,
    bookSample: books.status === 'ready' && books.feed.source === 'mock',
    filmSample: films.status === 'ready' && films.feed.source === 'mock',
  };
}
