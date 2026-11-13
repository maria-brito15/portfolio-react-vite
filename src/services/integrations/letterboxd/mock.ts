// DADOS FICTÍCIOS (Fase 1). Títulos inventados; o link de cada entrada aponta para a raiz do
// Letterboxd, sem fingir uma resenha real. Os casos incômodos espelham o feed real (RSS de
// 13/11/2026): entrada sem data, sem nota, série, revisto, mesmo dia, resenha longa,
// resenha com `publish: false`, título muito longo, sem ano e sem identificador do TMDB.
import type { FilmDiaryEntry } from '../../../data/personal/types';
import { mockProvenance, mockSource } from '../source';

const REVIEW_URL = 'https://letterboxd.com/';

const entry = (
  item: Omit<FilmDiaryEntry, 'provenance' | 'reviewUrl' | 'kind' | 'rewatch' | 'liked'> &
    Partial<Pick<FilmDiaryEntry, 'kind' | 'rewatch' | 'liked'>>,
): FilmDiaryEntry => ({
  kind: 'movie',
  rewatch: false,
  liked: false,
  reviewUrl: REVIEW_URL,
  ...item,
  provenance: mockProvenance(),
});

// Mais de 400 caracteres: passa do limite do truncamento (D8).
const LONG_REVIEW = 'Texto de resenha fictício para testar o truncamento. '.repeat(12);

export const mockFilms: FilmDiaryEntry[] = [
  entry({
    id: 'mock:film-1',
    title: 'Filme de exemplo 1',
    year: 2026,
    watchedDate: '2026-11-07',
    rating: 3.5,
    liked: true,
    tmdbId: 9001,
    review: 'Resenha curta de exemplo (dado fictício).',
  }),
  entry({
    id: 'mock:film-2',
    title: 'Filme de exemplo 2',
    year: 2023,
    watchedDate: '2026-11-07',
    rating: 5,
    rewatch: true,
    liked: true,
    tmdbId: 9001,
  }),
  entry({
    id: 'mock:film-3',
    title: 'Filme de exemplo 3',
    year: 2023,
    watchedDate: '2026-09-30',
    rating: 4,
    rewatch: true,
    tmdbId: 9002,
    review: LONG_REVIEW,
  }),
  entry({
    id: 'mock:film-4',
    title: 'Filme de exemplo sem nota',
    year: 2025,
    watchedDate: '2026-08-29',
    tmdbId: 9003,
  }),
  entry({
    id: 'mock:film-5',
    kind: 'tv',
    title: 'Série de exemplo',
    year: 2025,
    watchedDate: '2026-08-15',
    rating: 5,
    liked: true,
    tmdbId: 9005,
  }),
  entry({
    id: 'mock:film-6',
    title:
      'Um título de filme de exemplo extremamente longo para testar a quebra de linha em telas estreitas',
    year: 1999,
    watchedDate: '2026-08-15',
    rating: 1.5,
    tmdbId: 9006,
    review: 'Resenha que a Duda decidiu não publicar (dado fictício).',
    publish: false,
  }),
  entry({
    id: 'mock:film-7',
    title: 'Filme de exemplo sem data de exibição',
    year: 2024,
    rating: 2,
    tmdbId: 9007,
  }),
  entry({
    id: 'mock:film-8',
    title: 'Filme de exemplo sem ano nem identificador',
    watchedDate: '2025-12-31',
    rating: 0.5,
  }),
];

export const mockFilmsSource = mockSource(mockFilms);
