// Diário de filmes: o modo `mock` carrega os dados fictícios sob demanda; o `live` (Fase 2)
// trocará só este export. Páginas e hooks importam daqui, nunca de `./mock`.
import type { FilmDiaryEntry } from '../../../data/personal/types';
import { personalMode } from '../mode';
import { lazySource, unavailableSource } from '../source';
import type { PersonalSource } from '../types';

export const filmsSource: PersonalSource<FilmDiaryEntry> =
  personalMode === 'mock'
    ? lazySource(() => import('./mock').then((m) => m.mockFilmsSource))
    : unavailableSource('Letterboxd');
