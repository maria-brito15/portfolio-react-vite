// DADOS FICTÍCIOS (Fase 1). Títulos e autores são inventados de propósito: uma obra real
// atribuída à Duda seria dado inventado sobre ela. Nenhum item tem `coverUrl`: o mock não
// faz pedido de rede; a capa de verdade é coberta nos testes do componente.
//
// Casos incômodos incluídos: sem capa (todos), sem número de páginas, sem data de término,
// sem nota, título muito longo, vários autores, quatro estados da estante.
import type { Book } from '../../../data/personal/types';
import { mockProvenance, mockSource } from '../source';

const book = (item: Omit<Book, 'provenance' | 'authors'> & { authors?: string[] }): Book => ({
  authors: ['Autora de exemplo'],
  ...item,
  provenance: mockProvenance(),
});

export const mockBooks: Book[] = [
  book({
    id: 'mock:book-1',
    title: 'Livro de exemplo 1',
    status: 'reading',
    pages: 412,
    startedAt: '2026-10-28',
    progress: { pages: 120, percent: 29 },
  }),
  book({
    id: 'mock:book-2',
    title: 'Livro de exemplo 2',
    status: 'read',
    pages: 288,
    rating: 4.5,
    startedAt: '2026-08-30',
    finishedAt: '2026-09-14',
    review: 'Resenha de exemplo do livro (dado fictício).',
    note: {
      pt: 'Nota editorial de exemplo (dado fictício).',
      en: 'Example editorial note (fictional data).',
    },
  }),
  book({
    id: 'mock:book-3',
    title: 'Livro de exemplo 3',
    status: 'read',
    pages: 176,
    rating: 3,
    finishedAt: '2025-12-30',
  }),
  book({
    id: 'mock:book-4',
    title: 'Livro de exemplo sem data de término',
    status: 'read',
    rating: 5,
  }),
  book({ id: 'mock:book-5', title: 'Livro de exemplo 5', status: 'want' }),
  book({
    id: 'mock:book-6',
    title: 'Livro de exemplo 6',
    authors: ['Autor de exemplo'],
    status: 'want',
    pages: 540,
  }),
  book({
    id: 'mock:book-7',
    title: 'Livro de exemplo 7',
    status: 'paused',
    pages: 330,
    startedAt: '2026-06-02',
  }),
  book({
    id: 'mock:book-8',
    title:
      'Um título de livro de exemplo extremamente longo para testar a quebra de linha em colunas estreitas e no celular',
    authors: [
      'Primeira autora de exemplo',
      'Segundo autor de exemplo',
      'Terceira autora de exemplo',
    ],
    status: 'dnf',
    pages: 902,
    rating: 1.5,
    startedAt: '2026-03-10',
  }),
];

export const mockBooksSource = mockSource(mockBooks);
