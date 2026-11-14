// Diário de filmes: o modo `mock` carrega os dados fictícios sob demanda; o `live` lê o Letterboxd
// (RSS + CSV) com metadados do TMDB pelo servidor (`live.ts`). Páginas e hooks importam daqui,
// nunca de `./mock` nem de `./live`.
import type { FilmDiaryEntry } from '../../../data/personal/types';
import { personalMode } from '../mode';
import { lazySource } from '../source';
import type { PersonalSource } from '../types';
import { liveFilmsSource } from './live';

export const filmsSource: PersonalSource<FilmDiaryEntry> =
  personalMode === 'mock'
    ? lazySource(() => import('./mock').then((m) => m.mockFilmsSource))
    : liveFilmsSource;
