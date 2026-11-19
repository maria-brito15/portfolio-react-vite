// Projetores do lado ANTIGO: leem a forma antiga (`pt`/`en` aninhados, `null`, `ReactNode`) e devolvem fatos.
// Cada tarefa T4.x liga o seu domínio aqui. Escritos separadamente de `newFacts.ts` de propósito (TD-009).
import { projects as oldProjects } from '../../data/projects';
import type { Fact } from './compare';
import { pairedProblem, unmappedKeys } from './coverage';
import { richToText } from './legacy';

export const DOMAINS = [
  'projects',
  'experiences',
  'academics',
  'skills',
  'resume',
  'contact',
  'now',
  'uses',
] as const;

export type Domain = (typeof DOMAINS)[number];

const path = (...parts: (string | number)[]) => parts.join('/');

function projectFacts(): Fact[] {
  const facts: Fact[] = [['projects/count', String(oldProjects.length)]];

  for (const p of oldProjects) {
    const at = (...rest: (string | number)[]) => path('projects', p.id, ...rest);

    facts.push([at('name', 'pt'), p.name], [at('name', 'en'), p.name]);
    facts.push([at('start', 'year'), String(p.date.year)]);
    if (p.date.month !== undefined) facts.push([at('start', 'month'), String(p.date.month)]);

    if (p.dateLabel) {
      facts.push([at('dateLabel', 'pt'), p.dateLabel.pt], [at('dateLabel', 'en'), p.dateLabel.en]);
    }

    p.tech.forEach((label, i) => {
      facts.push([at('stack', i, 'label', 'pt'), label], [at('stack', i, 'label', 'en'), label]);
    });

    if (p.repo !== null) facts.push([at('repo'), p.repo]);
    if (p.caseStudy) facts.push([at('caseStudy'), p.caseStudy]);

    facts.push([at('images', 'count'), String(p.gallery.length)]);
    p.gallery.forEach((src, i) => facts.push([at('images', i, 'path'), src]));

    if (p.pt.badge) facts.push([at('badge', 'pt'), p.pt.badge]);
    if (p.en.badge) facts.push([at('badge', 'en'), p.en.badge]);

    facts.push([at('description', 'pt'), richToText(p.pt.description)]);
    facts.push([at('description', 'en'), richToText(p.en.description)]);

    const pt = p.pt.versions ?? [];
    const en = p.en.versions ?? [];

    facts.push([at('versions', 'count'), String(pt.length)]);
    pt.forEach((v, i) => {
      const e = en[i];

      facts.push([at('versions', i, 'label'), v.label]);
      facts.push([at('versions', i, 'date', 'year'), String(v.date.year)]);
      if (v.date.month !== undefined) {
        facts.push([at('versions', i, 'date', 'month'), String(v.date.month)]);
      }
      facts.push([at('versions', i, 'stack', 'pt'), v.stack]);
      facts.push([at('versions', i, 'description', 'pt'), v.description]);
      if (e) {
        facts.push([at('versions', i, 'stack', 'en'), e.stack]);
        facts.push([at('versions', i, 'description', 'en'), e.description]);
      }
      // PT e EN do mesmo ponto lado a lado: é a ordem do lado novo (o formato pareia os dois).
      v.points.forEach((point, j) => {
        facts.push([at('versions', i, 'points', j, 'pt'), point]);

        const enPoint = e?.points[j];

        if (enPoint !== undefined) facts.push([at('versions', i, 'points', j, 'en'), enPoint]);
      });
    });
  }

  return facts;
}

// Trava de cobertura (design §6.3 item 5): contagem do antigo, chaves não mapeadas, PT/EN pareados.
function projectGuards(): string[] {
  const problems: string[] = [];

  for (const p of oldProjects) {
    const label = `projeto ${p.id}`;

    problems.push(
      ...unmappedKeys(
        label,
        p,
        ['id', 'name', 'date', 'dateLabel', 'tech', 'repo', 'caseStudy', 'gallery', 'pt', 'en'],
        ['variant', 'icon'],
      ),
      ...unmappedKeys(`${label} (pt)`, p.pt, ['badge', 'description', 'versions'], []),
      ...unmappedKeys(`${label} (en)`, p.en, ['badge', 'description', 'versions'], []),
    );

    const countOf = pairedProblem(`${label}: versões`, p.pt.versions ?? [], p.en.versions ?? []);

    if (countOf) problems.push(countOf);

    (p.pt.versions ?? []).forEach((v, i) => {
      problems.push(
        ...unmappedKeys(
          `${label} versão ${i}`,
          v,
          ['label', 'date', 'stack', 'description', 'points'],
          [],
        ),
      );

      const points = pairedProblem(
        `${label} versão ${i}: pontos`,
        v.points,
        p.en.versions?.[i]?.points ?? [],
      );

      if (points) problems.push(points);
    });
  }

  return problems;
}

export const legacyFacts: Partial<Record<Domain, () => Fact[]>> = {
  projects: projectFacts,
};

export const legacyGuards: Partial<Record<Domain, () => string[]>> = {
  projects: projectGuards,
};

// A contagem esperada vem do próprio módulo antigo (não de um número digitado aqui).
export const legacyCounts: Partial<Record<Domain, () => number>> = {
  projects: () => oldProjects.length,
};
