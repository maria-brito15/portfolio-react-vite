// Cálculos da página Acadêmico.

// Carga horária cursada (disciplinas com nota) sobre a total, e média simples
// das notas já lançadas. Disciplinas sem nota (`grade: null`) não entram na média.
export function summarizeSemester(courses) {
  const total = courses.reduce((sum, c) => sum + (c.hours ?? 0), 0);
  const graded = courses.filter((c) => typeof c.grade === 'number');
  const done = graded.reduce((sum, c) => sum + (c.hours ?? 0), 0);
  const average = graded.length
    ? Math.round((graded.reduce((sum, c) => sum + c.grade, 0) / graded.length) * 10) / 10
    : null;
  return { done, total, average };
}

// Posição de `today` entre o início do primeiro ano e o fim do último, em %.
// É uma estimativa pelo calendário, não pela carga horária cumprida.
export function yearProgress(startYear, endYear, today = new Date()) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31, 23, 59, 59).getTime();
  const ratio = (today.getTime() - start) / (end - start);
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}
