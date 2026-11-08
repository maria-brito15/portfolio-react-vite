import { parsePeriodStart } from './projectDate';

// Números do currículo usados pela página /curriculo e pela visão em terminal.

// Experiências do currículo: todos os grupos exceto "Reconhecimentos", que
// ganha seção própria. `firstYear` é o ano do início mais antigo.
export function experienceStats(experienceGroups) {
  const items = experienceGroups.filter((g) => g.id !== 'awards').flatMap((g) => g.items);
  const years = items.map((item) => parsePeriodStart(item.period.pt)?.year).filter(Boolean);
  return { count: items.length, firstYear: Math.min(...years) };
}

// Projetos finalistas (selo "Finalista…"): viram as instâncias do reconhecimento.
export const finalistProjects = (projects) =>
  projects.filter((p) => /^Finalista/.test(p.pt.badge ?? ''));
