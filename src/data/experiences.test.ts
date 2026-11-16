import { readFileSync } from 'node:fs';
import { academics } from './academics';
import { archEdges, archNodes, layers } from './architecture';
import { clientNeeds } from './clientJourney';
import { routeById } from './routes';
import { projects } from './projects';
import { services } from './services';
import { experienceGroups } from './experiences';
import { buildAcademicTimeline, filterActivities } from '../utils/academicTimeline';

const caseStudy = (lang: 'Pt' | 'En') =>
  readFileSync(`src/pages/case-study/WhatsAppDispatcher${lang}.tsx`, 'utf8');

describe('arquitetura (tech)', () => {
  const ids = archNodes.map((n) => n.id);

  it('ids únicos e toda ligação aponta para componentes que existem', () => {
    expect(new Set(ids).size).toBe(ids.length);

    for (const e of archEdges) {
      expect(ids, `${e.from}→${e.to}`).toEqual(expect.arrayContaining([e.from, e.to]));
      expect(e.from).not.toBe(e.to);
    }
  });

  it('todo componente está numa camada que existe e tem texto nos dois idiomas', () => {
    for (const n of archNodes) {
      expect(layers.map((l) => l.id)).toContain(n.layer);

      for (const text of [n.name, n.role, n.why, n.anchor]) {
        expect(text.pt.trim(), n.id).not.toBe('');
        expect(text.en.trim(), n.id).not.toBe('');
      }
    }
  });

  it('cada âncora é uma seção do estudo de caso naquele idioma', () => {
    for (const n of archNodes) {
      expect(caseStudy('Pt'), n.id).toContain(`id="${n.anchor.pt}"`);
      expect(caseStudy('En'), n.id).toContain(`id="${n.anchor.en}"`);
    }
  });

  it('as tecnologias de infraestrutura são as que o projeto declara', () => {
    const declared = projects.find((p) => p.id === 'whatsapp-dispatcher')!.tech;
    const named = archNodes
      .flatMap((n) => n.tech)
      .filter((t) => ['BullMQ', 'Redis', 'PostgreSQL', 'Prisma'].includes(t));

    expect(named.length).toBeGreaterThan(0);

    for (const t of named) expect(declared).toContain(t);
  });

  it('a integração não concluída fica marcada e o estudo de caso é a rota certa', () => {
    expect(archNodes.find((n) => n.id === 'whatsapp')?.status).toBeDefined();
    expect(routeById('whatsapp-dispatcher')?.path).toBe('/estudos-de-caso/whatsapp-dispatcher');
  });
});

describe('jornada do cliente', () => {
  it('toda posição e id apontam para algo de Serviços e Projetos, nos dois idiomas', () => {
    for (const lang of ['pt', 'en'] as const) {
      const c = services[lang];

      for (const n of clientNeeds) {
        for (const i of n.services) expect(c.services.items[i], `${n.id}/${i}`).toBeDefined();

        for (const i of n.faq) expect(c.faq.items[i], `${n.id}/faq ${i}`).toBeDefined();

        for (const id of n.cases) expect(c.cases.items.map((x) => x.id)).toContain(id);

        for (const id of n.projects) expect(projects.map((p) => p.id)).toContain(id);
      }
    }
  });
});

describe('linha do tempo acadêmica', () => {
  const sources = { projects, experienceGroups };
  const years = buildAcademicTimeline(academics, sources, 'pt');

  it('em ordem crescente, com os mesmos semestres e atividades da página Acadêmico', () => {
    expect(years.map((y) => y.year)).toEqual([...years.map((y) => y.year)].sort((a, b) => a - b));
    expect(years.flatMap((y) => y.semesters)).toHaveLength(academics.semesters.length);
    expect(years.flatMap((y) => y.activities)).toHaveLength(
      academics.years.flatMap((y) => y.items).length,
    );
  });

  it('o filtro só deixa a categoria pedida', () => {
    const rows = years.flatMap((y) => y.activities);

    expect(filterActivities(rows, 'courses')).toEqual([]);
    expect(filterActivities(rows, 'all')).toHaveLength(rows.length);
    expect(filterActivities(rows, 'project').every((r) => r.kind === 'project')).toBe(true);
  });
});
