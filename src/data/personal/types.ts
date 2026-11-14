// Modelo normalizado do espaço cultural (/pessoal). Toda fonte (Hardcover, Letterboxd, TMDB,
// curadoria manual e o mock da Fase 1) converte o que recebe para estes tipos; as páginas só
// conhecem eles. Campo que a fonte não informa fica `undefined`: nunca se presume um valor
// (mesma regra de `ProjectDate.month`). Ver docs/specs/personal/README.md, seção 7.
import type { Localized } from '../../types';

// `mock` marca dado fictício da Fase 1: ele nunca vai à produção (CL-13 a CL-15).
export type Source = 'hardcover' | 'letterboxd' | 'tmdb' | 'manual' | 'mock';

// Escala do Letterboxd: de meia em meia estrela.
export type Rating = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

export interface Provenance {
  source: Source;
  url?: string;
  // Instante ISO em que o dado foi lido da fonte.
  fetchedAt: string;
}

export interface Book {
  // `hc:<id>`, `manual:<slug>` ou `mock:<slug>`.
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  pages?: number;
  status: 'reading' | 'read' | 'want' | 'paused' | 'dnf';
  rating?: Rating;
  // Dia ISO (AAAA-MM-DD), só se a fonte informar.
  startedAt?: string;
  finishedAt?: string;
  // Nota editorial escrita pela Duda; nunca gerada.
  note?: Localized;
  // Andamento de quem está lendo: só o que a fonte informa (páginas lidas e/ou percentual 0–100).
  progress?: { pages?: number; percent?: number };
  // Resenha escrita por ela na fonte (Hardcover `review_raw`); ausente se não houver.
  review?: string;
  provenance: Provenance;
}

export interface FilmDiaryEntry {
  // `lb:<guid>` ou `mock:<slug>`.
  id: string;
  kind: 'movie' | 'tv';
  title: string;
  year?: number;
  // Parte das entradas reais do feed não tem data de exibição.
  watchedDate?: string;
  rewatch: boolean;
  rating?: Rating;
  liked: boolean;
  tmdbId?: number;
  posterUrl?: string;
  reviewUrl: string;
  review?: string;
  // `false` suprime a resenha (padrão: publicar). Decisão D8.
  publish?: boolean;
  provenance: Provenance;
}

// Enriquecimento do TMDB, por `tmdbId`.
export interface FilmMeta {
  tmdbId: number;
  directors: string[];
  genres: string[];
  runtimeMin?: number;
  // PT e EN vêm do TMDB, não são escritos à mão.
  overview?: Localized;
}

// Curadoria manual.
export interface Album {
  id: string;
  title: string;
  artist: string;
  year?: number;
  coverUrl?: string;
  // Entra na seção "Em rotação" (o que a Duda está ouvindo agora). Só ela marca.
  inRotation?: boolean;
  note?: Localized;
  provenance: Provenance;
}

// Curadoria manual.
export interface TheaterVisit {
  id: string;
  title: string;
  company?: string;
  venue?: string;
  city?: string;
  date?: string;
  note?: Localized;
  provenance: Provenance;
}

export interface PersonalFeed<T> {
  items: T[];
  // Instante ISO da última sincronização com a fonte.
  updatedAt: string;
  // `true` quando a fonte falhou e o dado vem de um cache vencido.
  stale: boolean;
  source: Source | 'snapshot';
}

// Nomes de domínio das curadorias manuais (a música e o teatro da Duda).
export type MusicItem = Album;
export type TheaterItem = TheaterVisit;

// Números derivados dos itens carregados (nunca digitados à mão). Campo ausente = a fonte não
// tem o dado (sem páginas, sem nota): a interface mostra "—", não zero.
export interface ReadingStats {
  // Ano do recorte (o do término mais recente); ausente = nenhum livro lido tem data de término
  // e os números valem para todos os lidos.
  year?: number;
  booksRead: number;
  pagesRead?: number;
  averageRating?: number;
  currentlyReading: number;
  wantToRead: number;
}

export interface FilmStats {
  // Ano do recorte (o da exibição mais recente); ausente = nenhuma entrada tem data.
  year?: number;
  filmsWatched: number;
  rewatches: number;
  liked: number;
  averageRating?: number;
}
