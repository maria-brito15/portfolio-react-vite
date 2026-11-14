// Ponto de entrada de `GET /api/personal/books` na Netlify (Functions v2). Só liga o núcleo
// (`netlify/personal/books.ts`) ao ambiente real: variáveis e Blobs. Variáveis (nunca no código):
// HARDCOVER_API_TOKEN (segredo, só aqui) e PERSONAL_HARDCOVER_TTL_MIN (padrão 360).
import { getStore } from '@netlify/blobs';
import { createBooksService, handleBooks } from '../personal/books';
import { memoryJsonStore, type JsonStore } from '../personal/cache';

// Sem Blobs (`netlify dev` sem login, teste local), cai para a memória: o cache vale só enquanto a
// instância viver, mas a página funciona.
function store(): JsonStore {
  try {
    const blobs = getStore('personal-cache');

    return {
      get: (key) => blobs.get(key, { type: 'json' }),
      set: (key, value) => blobs.setJSON(key, value).then(() => undefined),
    };
  } catch {
    return memoryJsonStore();
  }
}

const service = createBooksService(process.env, store());

export default async (req: Request) =>
  handleBooks(req, { service, log: (message) => console.error(message) });

export const config = { path: '/api/personal/books' };
