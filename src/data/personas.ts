// Personas: quem está visitando. A persona é uma lente sobre o mesmo conteúdo:
// muda a ordem, o destaque e as sugestões, nunca o que é dito sobre a Duda.
// Fonte única: `routes.ts` gera as rotas `/r/<id>` daqui, e a barra lateral, o
// painel e o terminal leem a ordem daqui. Este arquivo não importa `routes.ts`
// (o sentido contrário já existe): `order`, `commands` e `cta` guardam ids como
// texto e `personas.test.ts` confere que existem.
import type { Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export type PersonaId = 'rh' | 'tech' | 'professor' | 'amigo' | 'cliente';

export interface Persona {
  id: PersonaId;
  label: Localized;
  desc: Localized;
  // Outros nomes aceitos ao responder no terminal (o id e o número já valem).
  aliases: string[];
  // Ids de rota, do mais ao menos importante para esta persona.
  order: string[];
  // Comandos sugeridos depois da escolha (nomes em português).
  commands: string[];
  cta: { route: string; label: Localized };
  // Foco e tom pedidos ao assistente (instrução, não fato sobre a Duda).
  askHint: string;
}

export const personas: Persona[] = [
  {
    id: 'rh',
    label: L('Recrutador(a) / RH', 'Recruiter / HR'),
    desc: L('currículo, experiências e contato', 'resume, experience and contact'),
    aliases: ['recrutador', 'recrutadora', 'recruiter', 'hr'],
    order: ['curriculo', 'experiencias', 'sobre', 'contato'],
    commands: ['curriculo', 'experiencias', 'contato'],
    cta: { route: 'curriculo', label: L('Ver o currículo', 'See the resume') },
    askHint:
      'The visitor is a recruiter or HR person. Favor career, availability, experience and how to get in touch. Keep it short and non-technical.',
  },
  {
    id: 'tech',
    label: L('Recrutador(a) técnico(a) / engenheiro(a)', 'Tech recruiter / engineer'),
    desc: L('projetos, GitHub e stack', 'projects, GitHub and stack'),
    aliases: ['tecnico', 'tecnica', 'engenheiro', 'engenheira', 'engineer', 'dev', 'techrecruiter'],
    order: ['projetos', 'github', 'habilidades', 'terminal'],
    commands: ['projetos', 'habilidades', 'stats'],
    cta: { route: 'projetos', label: L('Ver os projetos', 'See the projects') },
    askHint:
      'The visitor is a technical recruiter or engineer. Favor projects, stack, repositories and technical decisions, and point to the project pages.',
  },
  {
    id: 'professor',
    label: L('Professor(a)', 'Professor'),
    desc: L('trajetória acadêmica e projetos', 'academic path and projects'),
    aliases: ['professora', 'docente', 'teacher'],
    order: ['academico', 'projetos', 'curriculo', 'sobre'],
    commands: ['academico', 'projetos', 'curriculo'],
    cta: { route: 'academico', label: L('Ver o acadêmico', 'See the academics') },
    askHint:
      'The visitor is a professor. Favor the academic path, courses, grades, and study or research projects.',
  },
  {
    id: 'amigo',
    label: L('Amigo(a) / curioso(a)', 'Friend / curious'),
    desc: L('sobre, jogos e projetos', 'about, games and projects'),
    aliases: ['amiga', 'curioso', 'curiosa', 'friend', 'curious'],
    order: ['sobre', 'jogos', 'projetos', 'agora'],
    commands: ['sobre', 'jogos', 'projetos'],
    cta: { route: 'sobre', label: L('Conhecer a Duda', 'Get to know Duda') },
    askHint:
      'The visitor is a friend or a curious person. Use a relaxed, friendly tone and favor the about page, games and personal projects.',
  },
  {
    id: 'cliente',
    label: L('Cliente', 'Client'),
    desc: L('serviços, projetos e contato', 'services, projects and contact'),
    aliases: ['client', 'customer', 'contratar', 'hire'],
    order: ['servicos', 'projetos', 'contato'],
    commands: ['servicos', 'projetos', 'contato'],
    cta: { route: 'servicos', label: L('Ver os serviços', 'See the services') },
    askHint:
      'The visitor is a potential client. Favor the services offered, delivered projects and how to get in touch. Avoid jargon.',
  },
];

export const PERSONA_IDS = personas.map((p) => p.id);

export const personaById = (id: unknown) => personas.find((p) => p.id === id);

const fold = (text: unknown) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s/_-]+/g, '')
    .toLowerCase();

// Persona pelo número (1–5, na ordem da lista), id ou apelido; ignora acento e caixa.
export function findPersona(text: unknown): Persona | undefined {
  const key = fold(text);

  if (!key) return undefined;
  if (/^\d+$/.test(key)) return personas[Number(key) - 1];

  return personas.find((p) => fold(p.id) === key || p.aliases.some((a) => fold(a) === key));
}

// A lente: itens da persona primeiro, na ordem dela; o resto na ordem original.
// Nada some. Sem persona, devolve a lista como veio.
export function byPersona<T>(
  items: T[],
  persona: Persona | undefined,
  idOf: (item: T) => string,
): T[] {
  if (!persona) return items;

  const rank = (item: T) => {
    const i = persona.order.indexOf(idOf(item));

    return i === -1 ? Infinity : i;
  };

  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)
    .map(({ item }) => item);
}

// Pertence ao destaque da persona (marca visual); sem persona, nunca.
export const isPick = (persona: Persona | undefined, id: string) =>
  Boolean(persona?.order.includes(id));
