// DADOS FICTÍCIOS (Fase 1) de música e teatro. Tudo inventado de propósito, nada que a Duda
// tenha ouvido ou visto. Casos incômodos: disco sem ano e sem nota, em rotação sem nota, título e
// artista muito longos; peça sem data, sem companhia, sem local, com nota e título longo.
import type { Album, TheaterVisit } from '../../../data/personal/types';
import { mockProvenance, mockSource } from '../source';

const album = (item: Omit<Album, 'provenance'>): Album => ({
  ...item,
  provenance: mockProvenance(),
});

const visit = (item: Omit<TheaterVisit, 'provenance'>): TheaterVisit => ({
  ...item,
  provenance: mockProvenance(),
});

export const mockAlbums: Album[] = [
  album({
    id: 'mock:album-1',
    title: 'Disco de exemplo 1',
    artist: 'Artista de exemplo',
    year: 2024,
    inRotation: true,
    note: {
      pt: 'Nota editorial curta de exemplo (dado fictício).',
      en: 'Short example editorial note (fictional data).',
    },
  }),
  album({
    id: 'mock:album-2',
    title: 'Disco de exemplo 2',
    artist: 'Banda de exemplo',
    inRotation: true,
  }),
  album({
    id: 'mock:album-3',
    title: 'Disco de exemplo 3',
    artist: 'Banda de exemplo',
    year: 1998,
    note: {
      pt: 'Outra nota de exemplo (dado fictício).',
      en: 'Another example note (fictional data).',
    },
  }),
  album({
    id: 'mock:album-4',
    title: 'Disco de exemplo sem ano nem nota',
    artist: 'Artista solo de exemplo',
  }),
  album({
    id: 'mock:album-5',
    title:
      'Um título de disco de exemplo extremamente longo para testar a quebra de linha em telas estreitas',
    artist: 'Um nome de artista de exemplo também muito longo, com vários integrantes',
    year: 2011,
  }),
];

export const mockVisits: TheaterVisit[] = [
  visit({
    id: 'mock:visit-1',
    title: 'Peça de exemplo 1',
    company: 'Companhia de exemplo',
    venue: 'Teatro de exemplo',
    city: 'Cidade de exemplo',
    date: '2026-10-18',
    note: {
      pt: 'Nota de exemplo sobre a peça (dado fictício).',
      en: 'Example note about the play (fictional data).',
    },
  }),
  visit({
    id: 'mock:visit-2',
    title: 'Peça de exemplo 2',
    venue: 'Teatro de exemplo',
    date: '2026-03-02',
  }),
  visit({
    id: 'mock:visit-3',
    title: 'Peça de exemplo 3',
    company: 'Companhia de exemplo',
    date: '2025-11-20',
  }),
  visit({
    id: 'mock:visit-4',
    title:
      'Um título de peça de exemplo extremamente longo para testar a quebra de linha em telas estreitas',
    venue: 'Teatro de exemplo',
    city: 'Cidade de exemplo',
  }),
  visit({ id: 'mock:visit-5', title: 'Peça de exemplo sem data, companhia nem local' }),
];

export const mockAlbumsSource = mockSource(mockAlbums);
export const mockTheaterSource = mockSource(mockVisits);
