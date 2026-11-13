// Destaque de cada seção no hub (CL-20): o livro de agora, o último filme, o disco em rotação e
// a última peça. Funções puras; devolvem `undefined` quando não há o que destacar.
import type { Album, Book, FilmDiaryEntry, TheaterVisit } from './types';
import { groupByMonth, groupByYearOf } from './review';

export const currentBook = (books: Book[]) => books.find((b) => b.status === 'reading');

// O mais recente com data de exibição; entrada sem data nunca é "a última".
export const latestFilm = (films: FilmDiaryEntry[]) =>
  groupByMonth(films).find((g) => g.key !== 'undated')?.items[0];

export const featuredAlbum = (albums: Album[]) => albums.find((a) => a.inRotation) ?? albums[0];

export const latestPlay = (visits: TheaterVisit[]) =>
  groupByYearOf(visits, (v) => v.date).find((g) => g.key !== 'undated')?.items[0];
