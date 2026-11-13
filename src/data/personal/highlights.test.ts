import { mockAlbums, mockVisits } from '../../services/integrations/manual/mock';
import { mockBooks } from '../../services/integrations/hardcover/mock';
import { mockFilms } from '../../services/integrations/letterboxd/mock';
import { currentBook, featuredAlbum, latestFilm, latestPlay } from './highlights';
import { formatSyncDate, groupByYearOf } from './review';

describe('destaques do hub (CL-20)', () => {
  it('livro de agora: o que está "lendo"; sem ele, nada (pausado não conta)', () => {
    expect(currentBook(mockBooks)?.id).toBe('mock:book-1');
    expect(currentBook(mockBooks.filter((b) => b.status !== 'reading'))).toBeUndefined();
    expect(currentBook([])).toBeUndefined();
  });

  it('último filme: o de data mais recente; entrada sem data nunca é a última', () => {
    expect(latestFilm(mockFilms)?.id).toBe('mock:film-1');
    expect(latestFilm(mockFilms.filter((f) => f.watchedDate === undefined))).toBeUndefined();
    expect(latestFilm([])).toBeUndefined();
  });

  it('disco em destaque: o primeiro em rotação; sem rotação, o primeiro da lista', () => {
    expect(featuredAlbum(mockAlbums)?.id).toBe('mock:album-1');

    const none = mockAlbums.map((a) => ({ ...a, inRotation: undefined }));

    expect(featuredAlbum(none)?.id).toBe('mock:album-1');
    expect(featuredAlbum([])).toBeUndefined();
  });

  it('última peça: a de data mais recente; peça sem data nunca é a última', () => {
    expect(latestPlay(mockVisits)?.id).toBe('mock:visit-1');
    expect(latestPlay(mockVisits.filter((v) => !v.date))).toBeUndefined();
    expect(latestPlay([])).toBeUndefined();
  });
});

describe('groupByYearOf (CL-24)', () => {
  it('agrupa por ano da data escolhida, do mais recente ao mais antigo, sem data por último', () => {
    const groups = groupByYearOf(mockVisits, (v) => v.date);

    expect(groups.map((g) => g.key)).toEqual(['2026', '2025', 'undated']);
    expect(groups[0].items.map((v) => v.id)).toEqual(['mock:visit-1', 'mock:visit-2']);
    expect(groups[2].items.map((v) => v.id)).toEqual(['mock:visit-4', 'mock:visit-5']);
  });
});

describe('formatSyncDate sem hora (dado manual)', () => {
  it('só a data, no fuso pedido', () => {
    const date = formatSyncDate('2026-11-11', 'pt', 'UTC', false);

    expect(date).toMatch(/11.*nov.*2026/);
    expect(date).not.toMatch(/\d{1,2}:\d{2}/);
    expect(formatSyncDate('2026-11-11', 'pt', 'UTC')).toMatch(/\d{1,2}:\d{2}/);
  });
});
