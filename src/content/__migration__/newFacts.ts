// Projetores do lado NOVO: leem o conteúdo em `src/content/*.content.ts`. Cada tarefa T4.x liga o seu.
import { projects } from '../projects.content';
import type { Fact } from './compare';
import type { Domain } from './legacyFacts';

const path = (...parts: (string | number)[]) => parts.join('/');

function projectFacts(): Fact[] {
  const facts: Fact[] = [['projects/count', String(projects.length)]];

  for (const p of projects) {
    const at = (...rest: (string | number)[]) => path('projects', p.id, ...rest);

    facts.push([at('name', 'pt'), p.name.pt], [at('name', 'en'), p.name.en]);
    facts.push([at('start', 'year'), String(p.start.year)]);
    if (p.start.month !== undefined) facts.push([at('start', 'month'), String(p.start.month)]);

    if (p.dateLabel) {
      facts.push([at('dateLabel', 'pt'), p.dateLabel.pt], [at('dateLabel', 'en'), p.dateLabel.en]);
    }

    p.stack.forEach((tag, i) => {
      facts.push([at('stack', i, 'label', 'pt'), tag.label.pt]);
      facts.push([at('stack', i, 'label', 'en'), tag.label.en]);
    });

    if (p.repo !== undefined) facts.push([at('repo'), p.repo]);
    if (p.caseStudy !== undefined) facts.push([at('caseStudy'), p.caseStudy]);

    // Só o caminho entra: texto alternativo e dimensões são dado novo (D1), sem par no antigo.
    facts.push([at('images', 'count'), String(p.images.length)]);
    p.images.forEach((image, i) => facts.push([at('images', i, 'path'), image.path]));

    if (p.badge) {
      facts.push([at('badge', 'pt'), p.badge.pt], [at('badge', 'en'), p.badge.en]);
    }

    facts.push([at('description', 'pt'), p.description.pt]);
    facts.push([at('description', 'en'), p.description.en]);

    const versions = p.versions ?? [];

    facts.push([at('versions', 'count'), String(versions.length)]);
    versions.forEach((v, i) => {
      facts.push([at('versions', i, 'label'), v.label]);
      facts.push([at('versions', i, 'date', 'year'), String(v.date.year)]);
      if (v.date.month !== undefined) {
        facts.push([at('versions', i, 'date', 'month'), String(v.date.month)]);
      }
      facts.push([at('versions', i, 'stack', 'pt'), v.stack.pt]);
      facts.push([at('versions', i, 'description', 'pt'), v.description.pt]);
      facts.push([at('versions', i, 'stack', 'en'), v.stack.en]);
      facts.push([at('versions', i, 'description', 'en'), v.description.en]);
      v.points.forEach((point, j) => {
        facts.push([at('versions', i, 'points', j, 'pt'), point.pt]);
        facts.push([at('versions', i, 'points', j, 'en'), point.en]);
      });
    });
  }

  return facts;
}

export const newFacts: Partial<Record<Domain, () => Fact[]>> = {
  projects: projectFacts,
};

export const newCounts: Partial<Record<Domain, () => number>> = {
  projects: () => projects.length,
};
