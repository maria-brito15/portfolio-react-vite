// Livros: o modo `mock` carrega os dados fictícios sob demanda; o `live` lê o Hardcover pelo servidor
// (`live.ts`). Páginas e hooks importam daqui, nunca de `./mock` nem de `./live`.
import type { Book } from '../../../data/personal/types';
import { personalMode } from '../mode';
import { lazySource } from '../source';
import type { PersonalSource } from '../types';
import { liveBooksSource } from './live';

export const booksSource: PersonalSource<Book> =
  personalMode === 'mock'
    ? lazySource(() => import('./mock').then((m) => m.mockBooksSource))
    : liveBooksSource;
