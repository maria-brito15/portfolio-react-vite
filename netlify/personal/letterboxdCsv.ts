// Importador do CSV oficial de exportação do Letterboxd (Settings → Import & Export → Export your
// data). Roda só no servidor/na máquina dela (`npm run personal:import-letterboxd`): o navegador
// nunca vê CSV. Produz o histórico versionado `data/letterboxd-history.json`, que a função mescla
// com o RSS. Os arquivos usados são `diary.csv` e, opcionalmente, `reviews.csv`.
//
// As colunas são procuradas pelo NOME do cabeçalho (sem depender da ordem). Formato conhecido do
// export oficial [A: confirmar com o primeiro arquivo real]:
//   diary.csv   Date, Name, Year, Letterboxd URI, Rating, Rewatch, Tags, Watched Date
//   reviews.csv Date, Name, Year, Letterboxd URI, Rating, Rewatch, Review, Tags, Watched Date
// O export não traz id do TMDB nem "curtido": esses campos ficam ausentes (o `--tmdb` do script
// resolve o id por busca exata; "curtido" só existe nas entradas que também estão no RSS).
import type { FilmDiaryEntry, Rating } from '../../src/data/personal/types';
import { sortDiary } from './letterboxd';

export interface HistoryEntry {
  title: string;
  year?: number;
  watchedDate?: string;
  rating?: Rating;
  rewatch: boolean;
  review?: string;
  // Link da entrada no Letterboxd (https://boxd.it/… ou letterboxd.com).
  url?: string;
  tmdbId?: number;
  // `false` suprime a resenha na página (D8). Preservado ao reimportar.
  publish?: boolean;
}

export interface History {
  version: 1;
  importedAt: string;
  entries: HistoryEntry[];
}

export const emptyHistory = (): History => ({ version: 1, importedAt: '', entries: [] });

// CSV (RFC 4180): campos entre aspas com vírgula, quebra de linha e aspas duplicadas; BOM e CRLF.
export function parseCsv(input: string): string[][] {
  const text = input.startsWith('﻿') ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }

  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

const RATINGS: Rating[] = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const LINK = /^https:\/\/(boxd\.it|letterboxd\.com)\//;

function records(csv: string, required: string[]) {
  const [header, ...rows] = parseCsv(csv);

  if (!header) return [];

  const index = new Map(header.map((name, i) => [name.trim().toLowerCase(), i]));

  for (const name of required)
    if (!index.has(name.toLowerCase()))
      throw new Error(`CSV sem a coluna "${name}" (cabeçalho: ${header.join(', ')}).`);

  return rows.map((row) => (name: string) => row[index.get(name.toLowerCase()) ?? -1]?.trim() ?? '');
}

function toEntry(get: (column: string) => string): HistoryEntry | undefined {
  const title = get('Name');

  if (!title) return undefined;

  const year = Number(get('Year'));
  const rating = Number(get('Rating'));
  const watched = get('Watched Date');
  const url = get('Letterboxd URI');
  const review = get('Review');

  return {
    title,
    year: Number.isInteger(year) && year > 0 ? year : undefined,
    watchedDate: DAY.test(watched) ? watched : undefined,
    rating: get('Rating') && RATINGS.includes(rating as Rating) ? (rating as Rating) : undefined,
    rewatch: get('Rewatch').toLowerCase() === 'yes',
    review: review || undefined,
    url: LINK.test(url) ? url : undefined,
  };
}

// Chave de equivalência entre fontes (título + ano + data de exibição): sem acento, caixa nem
// pontuação, para "Amélie" do CSV casar com "Amélie" do RSS mesmo com travessão ou apóstrofo.
export const entryKey = (title: string, year: number | undefined, watchedDate: string | undefined) =>
  [
    title
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim(),
    year ?? '',
    watchedDate ?? '',
  ].join('|');

// Junta `diary.csv` (uma linha por exibição) e `reviews.csv` (o texto). A resenha entra na linha
// do diário de mesma chave; resenha sem linha no diário vira entrada própria. `previous` preserva
// o que ela já editou à mão (`publish`) e o `tmdbId` já resolvido.
export function importLetterboxdCsv(
  files: { diary: string; reviews?: string },
  previous: History = emptyHistory(),
  importedAt = new Date().toISOString(),
): History {
  const byKey = new Map<string, HistoryEntry>();
  const add = (entry: HistoryEntry) => {
    const key = entryKey(entry.title, entry.year, entry.watchedDate);
    const existing = byKey.get(key);

    // Mesmo filme revisto no mesmo dia: duas linhas legítimas; mantém as duas com chave distinta.
    byKey.set(existing ? `${key}#${byKey.size}` : key, entry);
  };

  for (const get of records(files.diary, ['Name', 'Year'])) {
    const entry = toEntry(get);

    if (entry) add(entry);
  }

  if (files.reviews) {
    for (const get of records(files.reviews, ['Name', 'Year', 'Review'])) {
      const entry = toEntry(get);

      if (!entry?.review) continue;

      const key = entryKey(entry.title, entry.year, entry.watchedDate);
      const target = byKey.get(key);

      if (target) {
        target.review = entry.review;
        target.rating ??= entry.rating;
        target.url ??= entry.url;
      } else add(entry);
    }
  }

  const kept = new Map(
    previous.entries.map((e) => [entryKey(e.title, e.year, e.watchedDate), e] as const),
  );
  const entries = [...byKey.values()].map((entry) => {
    const old = kept.get(entryKey(entry.title, entry.year, entry.watchedDate));

    return {
      ...entry,
      ...(old?.tmdbId !== undefined && { tmdbId: old.tmdbId }),
      ...(old?.publish !== undefined && { publish: old.publish }),
    };
  });

  return { version: 1, importedAt, entries: sortHistory(entries) };
}

const sortHistory = (entries: HistoryEntry[]) =>
  [...entries].sort((a, b) => {
    const da = a.watchedDate ?? '';
    const db = b.watchedDate ?? '';

    if (da === db) return a.title.localeCompare(b.title);

    return da === '' ? 1 : db === '' ? -1 : db.localeCompare(da);
  });

// Valida o JSON lido do disco (editado à mão: confia só no que tem forma). Entrada inválida sai.
export function parseHistory(data: unknown): History {
  const raw = data as Partial<History> | null;

  if (!raw || raw.version !== 1 || !Array.isArray(raw.entries)) return emptyHistory();

  const entries = raw.entries.filter(
    (e): e is HistoryEntry =>
      typeof e === 'object' && e !== null && typeof e.title === 'string' && e.title.trim() !== '',
  );

  return {
    version: 1,
    importedAt: typeof raw.importedAt === 'string' ? raw.importedAt : '',
    entries: entries.map((e) => ({
      title: e.title,
      year: Number.isInteger(e.year) ? e.year : undefined,
      watchedDate: typeof e.watchedDate === 'string' && DAY.test(e.watchedDate) ? e.watchedDate : undefined,
      rating: RATINGS.includes(e.rating as Rating) ? e.rating : undefined,
      rewatch: e.rewatch === true,
      review: typeof e.review === 'string' && e.review.trim() ? e.review : undefined,
      url: typeof e.url === 'string' && LINK.test(e.url) ? e.url : undefined,
      tmdbId: Number.isInteger(e.tmdbId) && (e.tmdbId as number) > 0 ? e.tmdbId : undefined,
      publish: typeof e.publish === 'boolean' ? e.publish : undefined,
    })),
  };
}

// Histórico → modelo. Sem link próprio, a entrada aponta para o diário no perfil.
export function historyToEntries(
  history: History,
  profileUrl: string,
  fetchedAt: string,
): FilmDiaryEntry[] {
  const seen = new Map<string, number>();

  return sortDiary(
    history.entries.map((e) => {
      const key = entryKey(e.title, e.year, e.watchedDate);
      const n = seen.get(key) ?? 0;

      seen.set(key, n + 1);

      return {
        id: `csv:${key.replace(/[^a-z0-9|]+/g, '-')}${n ? `#${n}` : ''}`,
        kind: 'movie' as const,
        title: e.title,
        year: e.year,
        watchedDate: e.watchedDate,
        rewatch: e.rewatch,
        rating: e.rating,
        tmdbId: e.tmdbId,
        reviewUrl: e.url ?? profileUrl,
        review: e.review,
        publish: e.publish,
        provenance: { source: 'letterboxd' as const, url: e.url, fetchedAt },
      };
    }),
  );
}

// RSS + histórico, sem duplicar: mesma (título + ano + data) = mesma exibição, e o RSS vence (traz
// "curtido", id do TMDB e link da entrada). O `publish: false` do histórico vale também para a
// entrada do RSS. Entrada sem data só casa com outra sem data de mesmo título e ano.
export function mergeDiary(rss: FilmDiaryEntry[], history: FilmDiaryEntry[]): FilmDiaryEntry[] {
  const hidden = new Set(
    history
      .filter((e) => e.publish === false)
      .map((e) => entryKey(e.title, e.year, e.watchedDate)),
  );
  const keys = new Set(rss.map((e) => entryKey(e.title, e.year, e.watchedDate)));
  const fromRss = rss.map((e) =>
    hidden.has(entryKey(e.title, e.year, e.watchedDate)) ? { ...e, publish: false } : e,
  );
  const extra = history.filter((e) => !keys.has(entryKey(e.title, e.year, e.watchedDate)));

  return sortDiary([...fromRss, ...extra]);
}
