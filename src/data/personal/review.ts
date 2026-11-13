// Funções puras do espaço cultural: truncar resenha (D8), formatar nota e agrupar o diário
// por mês. Sem dependência de React nem de rede, para testar sem montar página.
import type { Lang } from '../../types';
import type { Rating } from './types';

export const REVIEW_LIMIT = 400;

export interface TruncatedReview {
  text: string;
  truncated: boolean;
}

// Corta no limite de palavra; sem espaço antes do limite (palavra única enorme), corta no
// próprio limite. O "…" faz parte do texto devolvido quando houve corte.
export function truncateReview(review: string, limit = REVIEW_LIMIT): TruncatedReview {
  const text = review.trim();

  if (text.length <= limit) return { text, truncated: false };

  const head = text.slice(0, limit);
  // O limite caiu bem no fim de uma palavra: ela cabe inteira.
  const lastSpace = /\s/.test(text[limit]) ? limit : head.search(/\s\S*$/);
  const cut = (lastSpace > 0 ? head.slice(0, lastSpace) : head).replace(/[\s.,;:!?-]+$/, '');

  return { text: `${cut}…`, truncated: true };
}

// `3.5` → `★★★½`, mais o texto equivalente para leitor de tela ("3,5 de 5" / "3.5 out of 5").
export function formatRating(rating: Rating, lang: Lang) {
  const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '');
  const value = lang === 'pt' ? String(rating).replace('.', ',') : String(rating);

  return { stars, label: lang === 'pt' ? `${value} de 5` : `${value} out of 5` };
}

export interface MonthGroup<T> {
  // `AAAA-MM`, ou `undated` para as entradas sem data de exibição.
  key: string;
  items: T[];
}

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])(?:-\d{2})?/;

// Meses do mais recente ao mais antigo; dentro do mês, a data mais recente primeiro (empate
// mantém a ordem de entrada). Entrada sem data (ou com data fora do formato) vai ao grupo
// `undated`, sempre por último: o feed real tem itens assim e nenhum deve sumir.
export function groupByMonth<T extends { watchedDate?: string }>(entries: T[]): MonthGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const entry of entries) {
    const match = entry.watchedDate ? MONTH.exec(entry.watchedDate) : null;
    const key = match ? `${match[1]}-${match[2]}` : 'undated';

    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  const byDateDesc = (a: T, b: T) => (b.watchedDate ?? '').localeCompare(a.watchedDate ?? '');

  return [...groups]
    .map(([key, items]) => ({
      key,
      items: key === 'undated' ? items : [...items].sort(byDateDesc),
    }))
    .sort((a, b) => {
      if (a.key === 'undated') return 1;
      if (b.key === 'undated') return -1;

      return b.key.localeCompare(a.key);
    });
}

// Data e hora da última sincronização, no formato do idioma. Data inválida devolve texto
// vazio: a interface omite a frase em vez de mostrar "Invalid Date".
export function formatSyncDate(iso: string, lang: Lang, timeZone?: string, withTime = true) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: withTime ? 'short' : undefined,
    timeZone,
  }).format(date);
}

export interface YearGroup<T> {
  // `AAAA`, ou `undated` para o que não tem data de término.
  key: string;
  items: T[];
}

// Agrupa por ano da data que `dateOf` devolve, do mais recente ao mais antigo; dentro do ano, a
// data mais recente primeiro. Sem data (ou fora do formato) vai ao grupo `undated`, por último.
export function groupByYearOf<T>(
  items: T[],
  dateOf: (item: T) => string | undefined,
): YearGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const date = dateOf(item);
    const match = date ? /^(\d{4})-(0[1-9]|1[0-2])/.exec(date) : null;
    const key = match ? match[1] : 'undated';

    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const byDateDesc = (a: T, b: T) => (dateOf(b) ?? '').localeCompare(dateOf(a) ?? '');

  return [...groups]
    .map(([key, list]) => ({ key, items: key === 'undated' ? list : [...list].sort(byDateDesc) }))
    .sort((a, b) => {
      if (a.key === 'undated') return 1;
      if (b.key === 'undated') return -1;

      return b.key.localeCompare(a.key);
    });
}

// Livros lidos por ano de término.
export const groupByYear = <T extends { finishedAt?: string }>(items: T[]) =>
  groupByYearOf(items, (item) => item.finishedAt);

const locale = (lang: Lang) => (lang === 'pt' ? 'pt-BR' : 'en-US');

// "07 de nov." / "Nov 07" a partir de `AAAA-MM-DD`. Lê a data como UTC: sem deslocamento de
// fuso, o dia exibido é sempre o do texto. Fora do formato devolve vazio.
export function formatDay(day: string, lang: Lang) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(day);

  if (!match) return '';

  return new Intl.DateTimeFormat(locale(lang), {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])));
}

// "novembro de 2026" / "November 2026" a partir de `AAAA-MM`. Fora do formato devolve vazio.
export function formatMonth(month: string, lang: Lang) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);

  if (!match) return '';

  return new Intl.DateTimeFormat(locale(lang), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(+match[1], +match[2] - 1, 1)));
}
