// DADOS FICTÍCIOS (Fase 1): metadados por `tmdbId`, para os filmes de `letterboxd/mock.ts`.
// Casos incômodos: sem sinopse, sem duração, sem diretor, série, `tmdbId` sem metadado
// (9007 e 9006 ficam de fora de propósito: filme sem enriquecimento).
import type { FilmMeta } from '../../../data/personal/types';
import { mockSource } from '../source';

export const mockFilmMeta: FilmMeta[] = [
  {
    tmdbId: 9001,
    directors: ['Direção de exemplo'],
    genres: { pt: ['Gênero de exemplo', 'Outro gênero de exemplo'], en: ['Gênero de exemplo', 'Outro gênero de exemplo'] },
    runtimeMin: 112,
    overview: {
      pt: 'Sinopse de exemplo em português (dado fictício).',
      en: 'Example synopsis in English (fictional data).',
    },
  },
  {
    tmdbId: 9002,
    directors: ['Direção de exemplo', 'Codireção de exemplo'],
    genres: { pt: ['Gênero de exemplo'], en: ['Gênero de exemplo'] },
    runtimeMin: 97,
  },
  { tmdbId: 9003, directors: [], genres: { pt: ['Gênero de exemplo'], en: ['Gênero de exemplo'] } },
  {
    tmdbId: 9005,
    directors: [],
    genres: { pt: ['Série de exemplo'], en: ['Série de exemplo'] },
    overview: {
      pt: 'Sinopse de série de exemplo (dado fictício).',
      en: 'Example series synopsis (fictional data).',
    },
  },
];

export const mockFilmMetaSource = mockSource(mockFilmMeta);
