// Ponto de entrada de `GET /api/personal/films` na Netlify (Functions v2). Liga o núcleo
// (`netlify/personal/films.ts`) ao ambiente real. Variáveis (nunca no código): TMDB_API_KEY (segredo,
// só aqui), LETTERBOXD_USERNAME (público) e PERSONAL_LETTERBOXD_TTL_MIN (padrão 60). O histórico do
// CSV é o JSON versionado em netlify/personal/data (incluído no pacote pelo bundler).
import { getStore } from '@netlify/blobs';
import { handleFilms, createFilmsService } from '../personal/films';
import { memoryJsonStore, type JsonStore } from '../personal/cache';
import historyJson from '../personal/data/letterboxd-history.json';
import { parseHistory } from '../personal/letterboxdCsv';

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

const log = (message: string) => console.error(message);
const service = createFilmsService(process.env, store(), parseHistory(historyJson), { log });

export default async (req: Request) => handleFilms(req, { service, log });

export const config = { path: '/api/personal/films' };
