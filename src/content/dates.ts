// Exibição e comparação de datas de conteúdo. Puro: sem zod e sem `Intl`, porque o `Intl` muda
// as abreviações entre versões do ICU (Windows e Linux), e a tabela aqui é fixa.
import type { Lang, ProjectDate } from '../types';

const MONTHS: Record<Lang, readonly string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
};

/** `2025` quando não há mês; `mar/2025` quando há. Nunca supõe um mês. */
export function formatDate(date: ProjectDate, lang: Lang): string {
  if (date.month === undefined) return String(date.year);

  return `${MONTHS[lang][date.month - 1]}/${date.year}`;
}

export type DateOrder = 'a-antes' | 'b-antes' | 'indeterminada';

/** Só diz o que se sabe: sem mês em um dos lados, ou meses iguais, a ordem é indeterminada. */
export function compareDates(a: ProjectDate, b: ProjectDate): DateOrder {
  if (a.year !== b.year) return a.year < b.year ? 'a-antes' : 'b-antes';
  if (a.month === undefined || b.month === undefined || a.month === b.month) {
    return 'indeterminada';
  }

  return a.month < b.month ? 'a-antes' : 'b-antes';
}
