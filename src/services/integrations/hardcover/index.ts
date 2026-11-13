// Livros: o modo `mock` carrega os dados fictícios sob demanda; o `live` (Fase 3) trocará só
// este export. Páginas e hooks importam daqui, nunca de `./mock`.
import type { Book } from '../../../data/personal/types';
import { personalMode } from '../mode';
import { lazySource, unavailableSource } from '../source';
import type { PersonalSource } from '../types';

export const booksSource: PersonalSource<Book> =
  personalMode === 'mock'
    ? lazySource(() => import('./mock').then((m) => m.mockBooksSource))
    : unavailableSource('Hardcover');
