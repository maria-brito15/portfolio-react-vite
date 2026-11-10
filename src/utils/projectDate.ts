// Datas de projeto com precisão variável: { year, month? }.
// `month` (1–12) só existe quando foi confirmado; nunca se preenche um valor
// presumido, e não há sentinela numérica (Infinity, 0, 9999) na comparação.

import type { Dated, Lang, Localized, ProjectDate } from '../types';

export function formatProjectDate({ year, month }: ProjectDate) {
  return month ? `${String(month).padStart(2, '0')}/${year}` : String(year);
}

// Rótulo de exibição de um projeto: o texto confirmado em `dateLabel` (quando a
// autora prefere o mês por extenso, ex. "out/2026"/"oct/2026"), senão o MM/AAAA
// padrão. `date` continua sendo a fonte da ordenação; `dateLabel` é só exibição.
export function projectPeriod(
  { date, dateLabel }: Dated & { dateLabel?: Localized },
  lang: Lang,
) {
  return dateLabel?.[lang] ?? formatProjectDate(date);
}

// Compara por ano; no mesmo ano, datas com mês vêm antes das sem mês, e entre
// datas sem mês o resultado é 0 (empate, preservando a ordem declarada).
// A posição de uma data sem mês dentro do ano é só um agrupamento estável:
// ela é indeterminada e a interface a sinaliza como tal.
export function compareProjectDates(a: ProjectDate, b: ProjectDate) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month && b.month) return a.month - b.month;
  if (a.month) return -1;
  if (b.month) return 1;

  return 0;
}

// Ordem cronológica crescente pela data de início (`date`) de cada projeto.
export function sortByDate<T extends Dated>(list: T[]) {
  return [...list].sort((a, b) => compareProjectDates(a.date, b.date));
}

// Ordem inversa (mais recente primeiro) pela mesma regra de `compareProjectDates`,
// invertida só entre anos e entre meses: no mesmo ano, datas com mês continuam
// vindo antes das sem mês, e datas sem mês empatam (preservando a ordem declarada).
export function compareProjectDatesDesc(a: ProjectDate, b: ProjectDate) {
  if (a.year !== b.year) return b.year - a.year;
  if (a.month && b.month) return b.month - a.month;
  if (a.month) return -1;
  if (b.month) return 1;

  return 0;
}

// Ordem cronológica decrescente pela `date` de cada item. Não altera a entrada.
export function sortByDateDesc<T extends Dated>(list: T[]) {
  return [...list].sort((a, b) => compareProjectDatesDesc(a.date, b.date));
}

// Extrai { year, month? } do início de um texto de período, sem inventar mês:
// "01/2026" → { year: 2026, month: 1 }; "2025–2026" e "2º semestre de 2026 – em
// andamento" → só o ano. Devolve null quando não há ano.
export function parsePeriodStart(period: string | null | undefined): ProjectDate | null {
  const text = String(period ?? '');
  const full = text.match(/^\s*(\d{1,2})\/(\d{4})/);

  if (full && Number(full[1]) >= 1 && Number(full[1]) <= 12) {
    return { year: Number(full[2]), month: Number(full[1]) };
  }

  const year = text.match(/\d{4}/);

  return year ? { year: Number(year[0]) } : null;
}

// Ids cuja posição relativa não pode ser determinada: sem mês e com ao menos
// outro projeto no mesmo ano sem mês (com mês, a ordem seria conhecida).
export function findUndeterminedOrder(list: (Dated & { id: string })[]) {
  const monthless = list.filter((p) => !p.date.month);

  return new Set(
    monthless
      .filter((p) => monthless.some((q) => q !== p && q.date.year === p.date.year))
      .map((p) => p.id),
  );
}
