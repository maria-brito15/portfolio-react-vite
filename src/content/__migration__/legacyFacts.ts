// Projetores do lado ANTIGO: leem a forma antiga (`pt`/`en` aninhados, `null`, `ReactNode`) e devolvem fatos.
// Cada tarefa T4.x liga o seu domínio aqui. Escritos separadamente de `newFacts.ts` de propósito (TD-009).
import { academics as oldAcademics } from '../../data/academics';
import { experienceGroups as oldExperiences } from '../../data/experiences';
import { projects as oldProjects } from '../../data/projects';
import { resume as oldResume } from '../../data/resume';
import { skillTimeline } from '../../data/skillTimeline';
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

function skillsFacts(): Fact[] {
  const facts: Fact[] = [
    ['skills/groups', String(skillTimeline.length)],
    ['skills/count', String(skillTimeline.flatMap((g) => g.items).length)],
  ];

  for (const g of skillTimeline) {
    facts.push([path('skills', g.id, 'title', 'pt'), g.title.pt]);
    facts.push([path('skills', g.id, 'title', 'en'), g.title.en]);

    g.items.forEach((it, i) => {
      const at = (...rest: (string | number)[]) => path('skills', g.id, i, ...rest);

      facts.push([at('name'), it.name]);
      // `since: null` do antigo é ausente: não gera fato (e o novo não pode ter ano a mais).
      if (it.since !== null) facts.push([at('since'), String(it.since)]);

      if (it.source !== undefined) {
        facts.push([at('source', 'pt'), typeof it.source === 'string' ? it.source : it.source.pt]);
        facts.push([at('source', 'en'), typeof it.source === 'string' ? it.source : it.source.en]);
      }
    });
  }

  return facts;
}

function skillsGuards(): string[] {
  const problems: string[] = [];

  for (const g of skillTimeline) {
    problems.push(...unmappedKeys(`grupo ${g.id}`, g, ['id', 'title', 'items'], []));

    g.items.forEach((it) => {
      problems.push(...unmappedKeys(`competência ${it.name}`, it, ['name', 'since', 'source'], []));
    });
  }

  return problems;
}

// Nome e endereço do projeto em destaque vêm do projeto (um fato, um lugar). O rótulo do link
// ("GitHub", "Ler o estudo de caso") é texto de interface e fica fora (007).
function resumeFacts(): Fact[] {
  const { pt, en } = oldResume;
  const facts: Fact[] = [
    ['resume/summary/count', String(pt.summary.length)],
    ['resume/skillAreas/count', String(pt.skills.length)],
    ['resume/featuredProjects/count', String(pt.projects.length)],
    ['resume/name', pt.name],
    ['resume/headline/pt', pt.headline],
    ['resume/headline/en', en.headline],
    ['resume/location/pt', pt.location],
    ['resume/location/en', en.location],
    ['resume/languages/pt', pt.languages],
    ['resume/languages/en', en.languages],
  ];

  pt.summary.forEach((text, i) => {
    facts.push([path('resume', 'summary', i, 'pt'), text]);
    facts.push([path('resume', 'summary', i, 'en'), en.summary[i] ?? '']);
  });

  pt.skills.forEach(([label, text], i) => {
    const e = en.skills[i];

    facts.push([path('resume', 'skillAreas', i, 'label', 'pt'), label]);
    facts.push([path('resume', 'skillAreas', i, 'label', 'en'), e?.[0] ?? '']);
    facts.push([path('resume', 'skillAreas', i, 'text', 'pt'), text]);
    facts.push([path('resume', 'skillAreas', i, 'text', 'en'), e?.[1] ?? '']);
  });

  pt.projects.forEach((p, i) => {
    const e = en.projects[i];
    const at = (...rest: (string | number)[]) => path('resume', 'featuredProjects', i, ...rest);
    const link = p.link && ('href' in p.link ? p.link.href : p.link.to);

    facts.push([at('name'), p.name]);
    if (link) facts.push([at('link'), link]);
    facts.push([at('subtitle', 'pt'), p.subtitle], [at('subtitle', 'en'), e?.subtitle ?? '']);
    if (p.award) facts.push([at('award', 'pt'), p.award], [at('award', 'en'), e?.award ?? '']);

    p.points.forEach((point, j) => {
      facts.push([at('points', j, 'pt'), point], [at('points', j, 'en'), e?.points[j] ?? '']);
    });
  });

  return facts;
}

function resumeGuards(): string[] {
  const { pt, en } = oldResume;
  const problems: string[] = [];
  const interfaceText = [
    'print',
    'printHint',
    'sections',
    'skillsSummary',
    'experienceSummary',
    'awardsSummary',
    'received',
    'showMore',
    'showLess',
    'since',
    'expected',
    'languagesLabel',
    'academicsLink',
  ];
  const content = ['name', 'headline', 'location', 'summary', 'skills', 'projects', 'languages'];

  problems.push(...unmappedKeys('currículo (pt)', pt, content, interfaceText));
  problems.push(...unmappedKeys('currículo (en)', en, content, interfaceText));

  if (pt.name !== en.name) problems.push('currículo: o nome difere entre PT e EN');

  for (const [label, a, b] of [
    ['currículo: resumo', pt.summary, en.summary],
    ['currículo: competências', pt.skills, en.skills],
    ['currículo: projetos em destaque', pt.projects, en.projects],
  ] as const) {
    const problem = pairedProblem(label, a, b);

    if (problem) problems.push(problem);
  }

  pt.projects.forEach((p, i) => {
    problems.push(
      ...unmappedKeys(`destaque ${p.name}`, p, ['name', 'subtitle', 'award', 'link', 'points'], []),
    );

    if (p.link)
      problems.push(...unmappedKeys(`link de ${p.name}`, p.link, ['href', 'to'], ['label']));

    const problem = pairedProblem(
      `destaque ${p.name}: pontos`,
      p.points,
      en.projects[i]?.points ?? [],
    );

    if (problem) problems.push(problem);
    if (en.projects[i]?.name !== p.name) problems.push(`destaque ${p.name}: o nome difere em EN`);
  });

  return problems;
}

export const legacyFacts: Partial<Record<Domain, () => Fact[]>> = {
  projects: projectFacts,
  experiences: experienceFacts,
  academics: academicsFacts,
  skills: skillsFacts,
  resume: resumeFacts,
};

export const legacyGuards: Partial<Record<Domain, () => string[]>> = {
  projects: projectGuards,
  experiences: experienceGuards,
  academics: academicsGuards,
  skills: skillsGuards,
  resume: resumeGuards,
};

// A contagem esperada vem do próprio módulo antigo (não de um número digitado aqui).
export const legacyCounts: Partial<Record<Domain, () => number>> = {
  projects: () => oldProjects.length,
  experiences: () => oldExperiences.flatMap((g) => g.items).length,
  academics: () => oldAcademics.semesters.flatMap((s) => s.courses).length,
  skills: () => skillTimeline.flatMap((g) => g.items).length,
  resume: () => oldResume.pt.projects.length,
};
