// Projetores do lado NOVO: leem o conteúdo em `src/content/*.content.ts`. Cada tarefa T4.x liga o seu.
import { experienceGroups } from '../experiences.content';
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

function experienceFacts(): Fact[] {
  const facts: Fact[] = [
    ['experiences/groups', String(experienceGroups.length)],
    ['experiences/count', String(experienceGroups.flatMap((g) => g.items).length)],
  ];

  for (const g of experienceGroups) {
    facts.push([path('experiences', g.id, 'title', 'pt'), g.title.pt]);
    facts.push([path('experiences', g.id, 'title', 'en'), g.title.en]);

    for (const it of g.items) {
      const at = (...rest: (string | number)[]) => path('experiences', g.id, it.id, ...rest);

      if (it.highlight !== undefined) facts.push([at('highlight'), String(it.highlight)]);

      facts.push([at('period', 'start', 'year'), String(it.period.start.year)]);
      if (it.period.start.month !== undefined) {
        facts.push([at('period', 'start', 'month'), String(it.period.start.month)]);
      }

      facts.push([at('period', 'label', 'pt'), it.period.label.pt]);
      facts.push([at('period', 'label', 'en'), it.period.label.en]);
      facts.push([at('org', 'pt'), it.org.pt], [at('org', 'en'), it.org.en]);
      facts.push([at('role', 'pt'), it.role.pt], [at('role', 'en'), it.role.en]);
      facts.push([at('description', 'pt'), it.description.pt]);
      facts.push([at('description', 'en'), it.description.en]);

      if (it.tag) facts.push([at('tag', 'pt'), it.tag.pt], [at('tag', 'en'), it.tag.en]);
    }
  }

  return facts;
}

export const newFacts: Partial<Record<Domain, () => Fact[]>> = {
  projects: projectFacts,
  experiences: experienceFacts,
};

export const newCounts: Partial<Record<Domain, () => number>> = {
  projects: () => projects.length,
  experiences: () => experienceGroups.flatMap((g) => g.items).length,
};
