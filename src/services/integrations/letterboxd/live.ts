// Filmes reais: lê `GET /api/personal/films` (Netlify Function, netlify/functions/personal-films.mts).
// Letterboxd (RSS), CSV e TMDB são lidos só no servidor; o navegador nunca fala com eles.
import type { FilmDiaryEntry } from '../../../data/personal/types';
import type { PersonalSource } from '../types';
import { parseFilmFeed } from './parse';

export const FILMS_ENDPOINT = '/api/personal/films';

export const liveFilmsSource: PersonalSource<FilmDiaryEntry> = {
  async load(signal) {
    const res = await fetch(FILMS_ENDPOINT, { signal, headers: { accept: 'application/json' } });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const feed = parseFilmFeed(await res.json());

    if (!feed) throw new Error('Resposta de filmes fora do contrato.');

    return feed;
  },
};
