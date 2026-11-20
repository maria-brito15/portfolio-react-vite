// Regras entre arquivos de conteúdo (003, T5.1, TD-010, D6): só no `verify`, sem alterar o validador da 001.
import { academics } from './academics.content';
import { experienceGroups } from './experiences.content';
import { projects } from './projects.content';
import { resume } from './resume.content';

type Projects = typeof projects;
type Experiences = typeof experienceGroups;
type Academics = typeof academics;
type Resume = typeof resume;

interface World {
  projects: Projects;
  experiences: Experiences;
  academics: Academics;
  resume: Resume;
}

/** Referências que apontam para um id que não existe, uma por linha. */
export function referenceProblems(world: World): string[] {
  const problems: string[] = [];
  const projectIds = new Set(world.projects.map((p) => p.id));
  const experienceIds = new Set(world.experiences.flatMap((g) => g.items.map((it) => it.id)));

  for (const year of world.academics.years) {
    year.items.forEach((item, i) => {
      const known = item.kind === 'project' ? projectIds : experienceIds;

      if (!known.has(item.id)) {
        problems.push(
          `src/content/academics.content.ts › years[${year.year}].items[${i}].id — ${item.kind} inexistente "${item.id}"`,
        );
      }
    });
  }

  world.resume.featuredProjects.forEach((fp, i) => {
    if (!projectIds.has(fp.project)) {
      problems.push(
        `src/content/resume.content.ts › featuredProjects[${i}].project — projeto inexistente "${fp.project}"`,
      );
    }
  });

  return problems;
}

/**
 * O mesmo id de etiqueta tem o mesmo rótulo em todo o conteúdo, e dois rótulos diferentes não
 * colidem num id (TD-005). Vale nos dois sentidos.
 */
export function tagProblems(list: Projects): string[] {
  const problems: string[] = [];
  const labelById = new Map<string, string>();
  const idByLabel = new Map<string, string>();

  list.forEach((project, pi) => {
    project.stack.forEach((tag, ti) => {
      const where = `src/content/projects.content.ts › [${pi}].stack[${ti}]`;
      const label = `${tag.label.pt} | ${tag.label.en}`;
      const knownLabel = labelById.get(tag.id);
      const knownId = idByLabel.get(label);

      if (knownLabel !== undefined && knownLabel !== label) {
        problems.push(
          `${where} — o id "${tag.id}" já tem o rótulo "${knownLabel}" e aqui tem "${label}"`,
        );
      }

      if (knownId !== undefined && knownId !== tag.id) {
        problems.push(
          `${where} — o rótulo "${label}" já tem o id "${knownId}" e aqui tem "${tag.id}"`,
        );
      }

      labelById.set(tag.id, knownLabel ?? label);
      idByLabel.set(label, knownId ?? tag.id);
    });
  });

  return problems;
}

const real: World = { projects, experiences: experienceGroups, academics, resume };

describe('referências entre arquivos (conteúdo real)', () => {
  it('toda referência do acadêmico e do currículo aponta para um id que existe', () => {
    expect(referenceProblems(real)).toEqual([]);
  });

  it('o mesmo id de etiqueta tem o mesmo rótulo, e rótulos diferentes não colidem', () => {
    expect(tagProblems(projects)).toEqual([]);
  });
});

describe('referências entre arquivos (casos negativos em cópia em memória)', () => {
  it('atividade do acadêmico que aponta para projeto inexistente falha, com arquivo e campo', () => {
    const copy = structuredClone(real);

    copy.academics.years[0]!.items[0] = { kind: 'project', id: 'nao-existe' };

    expect(referenceProblems(copy)).toEqual([
      'src/content/academics.content.ts › years[2025].items[0].id — project inexistente "nao-existe"',
    ]);
  });

  it('o `kind` conta: um id de experiência usado como projeto falha', () => {
    const copy = structuredClone(real);
    const experienceId = copy.experiences[0]!.items[0]!.id;

    copy.academics.years[0]!.items[0] = { kind: 'project', id: experienceId };

    expect(referenceProblems(copy)).toHaveLength(1);
  });

  it('projeto em destaque do currículo que não existe falha', () => {
    const copy = structuredClone(real);

    copy.resume.featuredProjects[0]!.project = 'fantasma';

    expect(referenceProblems(copy)).toEqual([
      'src/content/resume.content.ts › featuredProjects[0].project — projeto inexistente "fantasma"',
    ]);
  });

  it('mesmo id de etiqueta com rótulos diferentes falha', () => {
    const copy = structuredClone(projects);
    const tag = copy[1]!.stack[0]!;

    // Garante que o id já existe em outro projeto e troca só o rótulo de um deles.
    copy[0]!.stack[0] = { id: tag.id, label: { pt: 'Outro nome', en: 'Other name' } };

    const found = tagProblems(copy);

    expect(found.length).toBeGreaterThan(0);
    expect(found.join('\n')).toContain(`o id "${tag.id}"`);
  });

  it('dois rótulos diferentes no mesmo id, em sentido inverso, também falham', () => {
    const copy = structuredClone(projects);
    const label = copy[0]!.stack[0]!.label;

    copy[1]!.stack[0] = { id: 'id-diferente', label };

    expect(tagProblems(copy).join('\n')).toContain('já tem o id');
  });
});
