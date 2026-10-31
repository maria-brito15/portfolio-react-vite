// Datas de projeto com precisão variável: { year, month? }.
// `month` (1–12) só existe quando foi confirmado; nunca se preenche um valor
// presumido, e não há sentinela numérica (Infinity, 0, 9999) na comparação.

export function formatProjectDate({ year, month }) {
  return month ? `${String(month).padStart(2, '0')}/${year}` : String(year);
}

// Compara por ano; no mesmo ano, datas com mês vêm antes das sem mês, e entre
// datas sem mês o resultado é 0 (empate, preservando a ordem declarada).
// A posição de uma data sem mês dentro do ano é só um agrupamento estável:
// ela é indeterminada e a interface a sinaliza como tal.
export function compareProjectDates(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month && b.month) return a.month - b.month;
  if (a.month) return -1;
  if (b.month) return 1;
  return 0;
}

// Ordem cronológica crescente pela data de início (`date`) de cada projeto.
export function sortByDate(list) {
  return [...list].sort((a, b) => compareProjectDates(a.date, b.date));
}

// Ids cuja posição relativa não pode ser determinada: sem mês e com ao menos
// outro projeto no mesmo ano sem mês (com mês, a ordem seria conhecida).
export function findUndeterminedOrder(list) {
  const monthless = list.filter((p) => !p.date.month);
  return new Set(
    monthless
      .filter((p) => monthless.some((q) => q !== p && q.date.year === p.date.year))
      .map((p) => p.id),
  );
}
