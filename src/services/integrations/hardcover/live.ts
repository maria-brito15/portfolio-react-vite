// Livros reais: lê `GET /api/personal/books` (Netlify Function, netlify/functions/personal-books.mts).
// O token do Hardcover vive só no servidor; o navegador nunca o vê nem fala com o Hardcover.
import type { Book } from '../../../data/personal/types';
import type { PersonalSource } from '../types';
import { parseBookFeed } from './parse';

export const BOOKS_ENDPOINT = '/api/personal/books';

export const liveBooksSource: PersonalSource<Book> = {
  async load(signal) {
    const res = await fetch(BOOKS_ENDPOINT, { signal, headers: { accept: 'application/json' } });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const feed = parseBookFeed(await res.json());

    if (!feed) throw new Error('Resposta de livros fora do contrato.');

    return feed;
  },
};
