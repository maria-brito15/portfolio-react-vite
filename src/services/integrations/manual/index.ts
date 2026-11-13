// Música e teatro: em modo `mock` carregam os dados fictícios sob demanda; em `live` leem a
// curadoria da Duda (`src/data/personal/music.ts` e `theater.ts`), hoje vazia. Páginas e hooks
// importam daqui, nunca de `./mock`.
import { music } from '../../../data/personal/music';
import { theater } from '../../../data/personal/theater';
import type { Album, TheaterVisit } from '../../../data/personal/types';
import { personalMode } from '../mode';
import { lazySource, staticSource } from '../source';
import type { PersonalSource } from '../types';

export const albumsSource: PersonalSource<Album> =
  personalMode === 'mock'
    ? lazySource(() => import('./mock').then((m) => m.mockAlbumsSource))
    : staticSource(music.albums, music.updated);

export const theaterSource: PersonalSource<TheaterVisit> =
  personalMode === 'mock'
    ? lazySource(() => import('./mock').then((m) => m.mockTheaterSource))
    : staticSource(theater.visits, theater.updated);
