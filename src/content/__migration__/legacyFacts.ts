// Projetores do lado ANTIGO: leem a forma antiga (`pt`/`en` aninhados, `null`, `ReactNode`) e devolvem fatos.
// Cada tarefa T4.x liga o seu domínio aqui. Escritos separadamente de `newFacts.ts` de propósito (TD-009).
import { academics as oldAcademics } from '../../data/academics';
import { experienceGroups as oldExperiences } from '../../data/experiences';
import { projects as oldProjects } from '../../data/projects';
import { parsePeriodStart } from '../../utils/projectDate';
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

function experienceFacts(): Fact[] {
  const facts: Fact[] = [
    ['experiences/groups', String(oldExperiences.length)],
    ['experiences/count', String(oldExperiences.flatMap((g) => g.items).length)],
  ];

  for (const g of oldExperiences) {
    facts.push([path('experiences', g.id, 'title', 'pt'), g.title.pt]);
    facts.push([path('experiences', g.id, 'title', 'en'), g.title.en]);

    for (const it of g.items) {
      const at = (...rest: (string | number)[]) => path('experiences', g.id, it.id, ...rest);
      // O início vem do rótulo antigo, como o design manda (§6.3 item 6): nenhum mês é suposto.
      const start = parsePeriodStart(it.period.pt);

      if (it.highlight !== undefined) facts.push([at('highlight'), String(it.highlight)]);
      if (start) facts.push([at('period', 'start', 'year'), String(start.year)]);
      if (start?.month !== undefined) {
        facts.push([at('period', 'start', 'month'), String(start.month)]);
      }

      facts.push([at('period', 'label', 'pt'), it.period.pt]);
      facts.push([at('period', 'label', 'en'), it.period.en]);

      // `org` é texto único (copiado nos dois idiomas) ou já localizado.
      facts.push([at('org', 'pt'), typeof it.org === 'string' ? it.org : it.org.pt]);
      facts.push([at('org', 'en'), typeof it.org === 'string' ? it.org : it.org.en]);
      facts.push([at('role', 'pt'), it.role.pt], [at('role', 'en'), it.role.en]);
      facts.push([at('description', 'pt'), it.description.pt]);
      facts.push([at('description', 'en'), it.description.en]);

      if (it.tag) facts.push([at('tag', 'pt'), it.tag.pt], [at('tag', 'en'), it.tag.en]);
    }
  }

  return facts;
}

function experienceGuards(): string[] {
  const problems: string[] = [];

  for (const g of oldExperiences) {
    problems.push(...unmappedKeys(`grupo ${g.id}`, g, ['id', 'title', 'items'], []));

    for (const it of g.items) {
      problems.push(
        ...unmappedKeys(
          `experiência ${it.id}`,
          it,
          ['id', 'highlight', 'period', 'org', 'role', 'description', 'tag'],
          [],
        ),
      );
    }
  }

  return problems;
}

function academicsFacts(): Fact[] {
  const facts: Fact[] = [
    ['academics/programs/count', String(oldAcademics.programs.length)],
    ['academics/timeline/count', String(oldAcademics.timeline.length)],
    ['academics/years/count', String(oldAcademics.years.length)],
    ['academics/semesters/count', String(oldAcademics.semesters.length)],
    ['academics/courses/count', String(oldAcademics.semesters.flatMap((s) => s.courses).length)],
  ];

  for (const pr of oldAcademics.programs) {
    const at = (...rest: (string | number)[]) => path('academics', 'programs', pr.id, ...rest);

    facts.push([at('institution'), pr.institution]);
    facts.push([at('degree', 'pt'), pr.degree.pt], [at('degree', 'en'), pr.degree.en]);
    facts.push([at('start'), String(pr.start)], [at('end'), String(pr.end)]);
    if (pr.expected !== undefined) facts.push([at('expected'), String(pr.expected)]);
  }

  oldAcademics.timeline.forEach((t, i) => {
    facts.push([path('academics', 'timeline', i, 'year'), String(t.year)]);
    facts.push([path('academics', 'timeline', i, 'label', 'pt'), t.label.pt]);
    facts.push([path('academics', 'timeline', i, 'label', 'en'), t.label.en]);
  });

  for (const y of oldAcademics.years) {
    facts.push([path('academics', 'years', y.year, 'count'), String(y.items.length)]);
    y.items.forEach((item, i) => {
      facts.push([path('academics', 'years', y.year, i, 'kind'), item.kind]);
      facts.push([path('academics', 'years', y.year, i, 'id'), item.id]);
    });
  }

  for (const sem of oldAcademics.semesters) {
    const at = (...rest: (string | number)[]) => path('academics', 'semesters', sem.id, ...rest);

    facts.push([at('label', 'pt'), sem.label.pt], [at('label', 'en'), sem.label.en]);
    facts.push([at('program'), sem.program]);
    if (sem.inProgress !== undefined) facts.push([at('inProgress'), String(sem.inProgress)]);
    facts.push([at('courses', 'count'), String(sem.courses.length)]);

    sem.courses.forEach((c, j) => {
      facts.push([at('courses', j, 'name', 'pt'), c.name.pt]);
      facts.push([at('courses', j, 'name', 'en'), c.name.en]);
      if (c.hours !== undefined) facts.push([at('courses', j, 'hours'), String(c.hours)]);
      if (c.modality !== undefined) facts.push([at('courses', j, 'modality'), c.modality]);
      // `grade: null` do antigo é ausente: não gera fato (e o novo não pode ter nota a mais).
      if (c.grade !== null && c.grade !== undefined) {
        facts.push([at('courses', j, 'grade'), String(c.grade)]);
      }
    });
  }

  return facts;
}

function academicsGuards(): string[] {
  const problems = unmappedKeys(
    'acadêmico',
    oldAcademics,
    ['programs', 'timeline', 'years', 'semesters'],
    [],
  );

  for (const pr of oldAcademics.programs) {
    const keys = ['id', 'institution', 'degree', 'start', 'end', 'expected'];

    problems.push(...unmappedKeys(`programa ${pr.id}`, pr, keys, []));
  }

  for (const sem of oldAcademics.semesters) {
    const keys = ['id', 'label', 'program', 'inProgress', 'courses'];

    problems.push(...unmappedKeys(`semestre ${sem.id}`, sem, keys, []));

    sem.courses.forEach((c, j) => {
      const courseKeys = ['name', 'hours', 'modality', 'grade'];

      problems.push(...unmappedKeys(`semestre ${sem.id} disciplina ${j}`, c, courseKeys, []));
    });
  }

  return problems;
}

export const legacyFacts: Partial<Record<Domain, () => Fact[]>> = {
  projects: projectFacts,
  experiences: experienceFacts,
  academics: academicsFacts,
};

export const legacyGuards: Partial<Record<Domain, () => string[]>> = {
  projects: projectGuards,
  experiences: experienceGuards,
  academics: academicsGuards,
};

// A contagem esperada vem do próprio módulo antigo (não de um número digitado aqui).
export const legacyCounts: Partial<Record<Domain, () => number>> = {
  projects: () => oldProjects.length,
  experiences: () => oldExperiences.flatMap((g) => g.items).length,
  academics: () => oldAcademics.semesters.flatMap((s) => s.courses).length,
};
