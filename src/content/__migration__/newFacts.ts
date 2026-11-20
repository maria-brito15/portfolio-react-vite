// Projetores do lado NOVO: leem o conteúdo em `src/content/*.content.ts`. Cada tarefa T4.x liga o seu.
import { academics } from '../academics.content';
import { contact } from '../contact.content';
import { experienceGroups } from '../experiences.content';
import { now } from '../now.content';
import { projects } from '../projects.content';
import { resume } from '../resume.content';
import { skillGroups } from '../skills.content';
import { uses } from '../uses.content';
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

function academicsFacts(): Fact[] {
  const facts: Fact[] = [
    ['academics/programs/count', String(academics.programs.length)],
    ['academics/timeline/count', String(academics.timeline.length)],
    ['academics/years/count', String(academics.years.length)],
    ['academics/semesters/count', String(academics.semesters.length)],
    ['academics/courses/count', String(academics.semesters.flatMap((s) => s.courses).length)],
  ];

  for (const pr of academics.programs) {
    const at = (...rest: (string | number)[]) => path('academics', 'programs', pr.id, ...rest);

    facts.push([at('institution'), pr.institution]);
    facts.push([at('degree', 'pt'), pr.degree.pt], [at('degree', 'en'), pr.degree.en]);
    facts.push([at('start'), String(pr.start)], [at('end'), String(pr.end)]);
    if (pr.expected !== undefined) facts.push([at('expected'), String(pr.expected)]);
  }

  academics.timeline.forEach((t, i) => {
    facts.push([path('academics', 'timeline', i, 'year'), String(t.year)]);
    facts.push([path('academics', 'timeline', i, 'label', 'pt'), t.label.pt]);
    facts.push([path('academics', 'timeline', i, 'label', 'en'), t.label.en]);
  });

  for (const y of academics.years) {
    facts.push([path('academics', 'years', y.year, 'count'), String(y.items.length)]);
    y.items.forEach((item, i) => {
      facts.push([path('academics', 'years', y.year, i, 'kind'), item.kind]);
      facts.push([path('academics', 'years', y.year, i, 'id'), item.id]);
    });
  }

  for (const sem of academics.semesters) {
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
      if (c.grade !== undefined) facts.push([at('courses', j, 'grade'), String(c.grade)]);
    });
  }

  return facts;
}

function skillsFacts(): Fact[] {
  const facts: Fact[] = [
    ['skills/groups', String(skillGroups.length)],
    ['skills/count', String(skillGroups.flatMap((g) => g.items).length)],
  ];

  for (const g of skillGroups) {
    facts.push([path('skills', g.id, 'title', 'pt'), g.title.pt]);
    facts.push([path('skills', g.id, 'title', 'en'), g.title.en]);

    g.items.forEach((it, i) => {
      const at = (...rest: (string | number)[]) => path('skills', g.id, i, ...rest);

      facts.push([at('name'), it.name]);
      if (it.since !== undefined) facts.push([at('since'), String(it.since)]);
      if (it.source)
        facts.push([at('source', 'pt'), it.source.pt], [at('source', 'en'), it.source.en]);
    });
  }

  return facts;
}

// O nome e o endereço do projeto em destaque são lidos do PROJETO (um fato, um lugar).
function resumeFacts(): Fact[] {
  const facts: Fact[] = [
    ['resume/summary/count', String(resume.summary.length)],
    ['resume/skillAreas/count', String(resume.skillAreas.length)],
    ['resume/featuredProjects/count', String(resume.featuredProjects.length)],
    ['resume/name', resume.name],
    ['resume/headline/pt', resume.headline.pt],
    ['resume/headline/en', resume.headline.en],
    ['resume/location/pt', resume.location.pt],
    ['resume/location/en', resume.location.en],
    ['resume/languages/pt', resume.languages.pt],
    ['resume/languages/en', resume.languages.en],
  ];

  resume.summary.forEach((text, i) => {
    facts.push([path('resume', 'summary', i, 'pt'), text.pt]);
    facts.push([path('resume', 'summary', i, 'en'), text.en]);
  });

  resume.skillAreas.forEach((area, i) => {
    facts.push([path('resume', 'skillAreas', i, 'label', 'pt'), area.label.pt]);
    facts.push([path('resume', 'skillAreas', i, 'label', 'en'), area.label.en]);
    facts.push([path('resume', 'skillAreas', i, 'text', 'pt'), area.text.pt]);
    facts.push([path('resume', 'skillAreas', i, 'text', 'en'), area.text.en]);
  });

  resume.featuredProjects.forEach((fp, i) => {
    const at = (...rest: (string | number)[]) => path('resume', 'featuredProjects', i, ...rest);
    const project = projects.find((p) => p.id === fp.project);

    if (!project) throw new Error(`destaque ${i}: projeto "${fp.project}" não existe`);

    const link = project.repo ?? project.caseStudy;

    facts.push([at('name'), project.name.pt]);
    if (link) facts.push([at('link'), link]);
    facts.push([at('subtitle', 'pt'), fp.subtitle.pt], [at('subtitle', 'en'), fp.subtitle.en]);
    if (fp.award) facts.push([at('award', 'pt'), fp.award.pt], [at('award', 'en'), fp.award.en]);

    fp.points.forEach((point, j) => {
      facts.push([at('points', j, 'pt'), point.pt], [at('points', j, 'en'), point.en]);
    });
  });

  return facts;
}

// O endereço puro do e-mail é o link sem o `mailto:` (quem exibe faz o mesmo).
const bare = (href: string) => href.slice('mailto:'.length);

function contactFacts(): Fact[] {
  // Só o caminho da foto entra: texto alternativo e dimensões são dado novo, sem par no antigo.
  return [
    ['contact/email', bare(contact.email)],
    ['contact/servicesEmail', bare(contact.servicesEmail)],
    ['contact/github', contact.github],
    ['contact/linkedin', contact.linkedin],
    ['contact/photo/path', contact.photo.path],
  ];
}

function nowFacts(): Fact[] {
  const facts: Fact[] = [['now/items/count', String(now.items.length)]];

  if (now.updated !== undefined) facts.push(['now/updated', now.updated]);

  now.items.forEach((item, i) => {
    facts.push([path('now', 'items', i, 'label', 'pt'), item.label.pt]);
    facts.push([path('now', 'items', i, 'label', 'en'), item.label.en]);
    facts.push([path('now', 'items', i, 'text', 'pt'), item.text.pt]);
    facts.push([path('now', 'items', i, 'text', 'en'), item.text.en]);
  });

  return facts;
}

function usesFacts(): Fact[] {
  const facts: Fact[] = [['uses/groups/count', String(uses.groups.length)]];

  if (uses.updated !== undefined) facts.push(['uses/updated', uses.updated]);

  uses.groups.forEach((g, i) => {
    facts.push([path('uses', 'groups', i, 'title', 'pt'), g.title.pt]);
    facts.push([path('uses', 'groups', i, 'title', 'en'), g.title.en]);
    facts.push([path('uses', 'groups', i, 'items', 'count'), String(g.items.length)]);

    g.items.forEach((it, j) => {
      facts.push([path('uses', 'groups', i, 'items', j, 'name'), it.name]);
      if (it.note) {
        facts.push([path('uses', 'groups', i, 'items', j, 'note', 'pt'), it.note.pt]);
        facts.push([path('uses', 'groups', i, 'items', j, 'note', 'en'), it.note.en]);
      }
    });
  });

  return facts;
}

export const newFacts: Partial<Record<Domain, () => Fact[]>> = {
  projects: projectFacts,
  experiences: experienceFacts,
  academics: academicsFacts,
  skills: skillsFacts,
  resume: resumeFacts,
  contact: contactFacts,
  now: nowFacts,
  uses: usesFacts,
};

export const newCounts: Partial<Record<Domain, () => number>> = {
  projects: () => projects.length,
  experiences: () => experienceGroups.flatMap((g) => g.items).length,
  academics: () => academics.semesters.flatMap((s) => s.courses).length,
  skills: () => skillGroups.flatMap((g) => g.items).length,
  resume: () => resume.featuredProjects.length,
  contact: () => Object.keys(contact).length,
  now: () => now.items.length,
  uses: () => uses.groups.length,
};
