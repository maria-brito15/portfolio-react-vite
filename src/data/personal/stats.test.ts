import { mockBooks } from '../../services/integrations/hardcover/mock';
import { mockFilms } from '../../services/integrations/letterboxd/mock';
import { editorialNumber } from './editorial';
import { filmStats, formatAverage, readingStats } from './stats';
import type { Book, FilmDiaryEntry } from './types';

const book = (over: Partial<Book>): Book => ({
  id: 'x',
  title: 'L',
  authors: ['A'],
  status: 'read',
  provenance: { source: 'mock', fetchedAt: '2026-11-13T12:00:00Z' },
  ...over,
});

const film = (over: Partial<FilmDiaryEntry>): FilmDiaryEntry => ({
  id: 'x',
  kind: 'movie',
  title: 'F',
  rewatch: false,
  liked: false,
  reviewUrl: 'https://letterboxd.com/',
  provenance: { source: 'mock', fetchedAt: '2026-11-13T12:00:00Z' },
  ...over,
});

describe('readingStats (ReadingStats)', () => {
  it('recorta no ano do término mais recente e conta lendo e quero ler no total', () => {
    expect(readingStats(mockBooks)).toEqual({
      year: 2026,
      booksRead: 1,
      pagesRead: 288,
      averageRating: 4.5,
      currentlyReading: 1,
      wantToRead: 2,
    });
  });

  it('sem páginas ou sem nota: campo ausente, nunca zero', () => {
    const stats = readingStats([book({ finishedAt: '2026-01-01' })]);

    expect(stats.booksRead).toBe(1);
    expect(stats.pagesRead).toBeUndefined();
    expect(stats.averageRating).toBeUndefined();
  });

  it('livros lidos sem nenhuma data valem todos, sem ano', () => {
    const stats = readingStats([book({ pages: 100, rating: 4 }), book({ pages: 50, rating: 3 })]);

    expect(stats).toMatchObject({
      year: undefined,
      booksRead: 2,
      pagesRead: 150,
      averageRating: 3.5,
    });
  });

  it('lista vazia: tudo zero ou ausente, sem erro', () => {
    expect(readingStats([])).toEqual({
      year: undefined,
      booksRead: 0,
      pagesRead: undefined,
      averageRating: undefined,
      currentlyReading: 0,
      wantToRead: 0,
    });
  });

  it('abandonados e pausados não entram nas contas de lidos', () => {
    const stats = readingStats([book({ status: 'dnf', finishedAt: '2026-05-01', pages: 900 })]);

    expect(stats.booksRead).toBe(0);
  });
});

describe('filmStats (FilmStats)', () => {
  it('recorta no ano da exibição mais recente', () => {
    expect(filmStats(mockFilms)).toEqual({
      year: 2026,
      filmsWatched: 6,
      rewatches: 2,
      liked: 3,
      averageRating: (3.5 + 5 + 4 + 5 + 1.5) / 5,
    });
  });

  it('média só das notas existentes; sem nota nenhuma, ausente', () => {
    expect(filmStats([film({ watchedDate: '2026-01-02' })]).averageRating).toBeUndefined();
  });

  it('sem nenhuma data, vale tudo e o ano é ausente', () => {
    expect(filmStats([film({}), film({ rewatch: true })])).toMatchObject({
      year: undefined,
      filmsWatched: 2,
      rewatches: 1,
    });
  });

  it('lista vazia', () => {
    expect(filmStats([])).toEqual({
      year: undefined,
      filmsWatched: 0,
      rewatches: 0,
      liked: 0,
      averageRating: undefined,
    });
  });
});

describe('formatAverage', () => {
  it('uma casa decimal, com vírgula em português', () => {
    expect(formatAverage(3.94, 'pt')).toBe('3,9');
    expect(formatAverage(3.94, 'en')).toBe('3.9');
    expect(formatAverage(4, 'pt')).toBe('4,0');
  });

  it('sem média, travessão', () => {
    expect(formatAverage(undefined, 'pt')).toBe('—');
  });
});

describe('numeração editorial (001 a 005)', () => {
  it('o hub é 001 e as seções seguem a ordem das rotas', () => {
    const ids = ['pessoal', 'pessoal-livros', 'pessoal-filmes', 'pessoal-musica', 'pessoal-teatro'];

    expect(ids.map(editorialNumber)).toEqual(['001', '002', '003', '004', '005']);
  });

  it('rota fora do espaço não tem número', () => {
    expect(editorialNumber('sobre')).toBeUndefined();
  });
});
