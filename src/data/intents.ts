// "O que você procura?" (docs/specs/busca-contextual/): atalhos por intenção na home, para quem
// não sabe o que buscar. Cada intenção leva a uma rota ou âncora que já existe em `routes.ts` /
// `sections.ts`; nenhuma rota nova. A persona só muda a ORDEM (a intenção dela vem primeiro) e,
// em dois casos, o destino mais específico. Sem persona, vale a ordem padrão.
import type { Localized } from '../types';
import type { PersonaId } from './personas';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface IntentTarget {
  route: string;
  anchor?: string;
}

export interface Intent {
  id: string;
  label: Localized;
  hint: Localized;
  to: IntentTarget;
  // Destino mais específico para uma persona, quando existe.
  byPersona?: Partial<Record<PersonaId, IntentTarget>>;
}

export const intents: Intent[] = [
  {
    id: 'competencias',
    label: L('Conhecer as competências', 'Explore the skills'),
    hint: L('tecnologias, tempo de uso e formação', 'technologies, time in use and education'),
    to: { route: 'curriculo', anchor: 'competencias' },
    byPersona: { tech: { route: 'habilidades' } },
  },
  {
    id: 'projetos',
    label: L('Avaliar os projetos', 'Evaluate the projects'),
    hint: L('o que foi construído e como', 'what was built and how'),
    to: { route: 'projetos' },
    byPersona: {
      tech: { route: 'whatsapp-dispatcher' },
      cliente: { route: 'servicos', anchor: 'cases' },
    },
  },
  {
    id: 'academico',
    label: L('Entender a trajetória acadêmica', 'Understand the academic path'),
    hint: L('formação, disciplinas e atividades', 'degrees, courses and activities'),
    to: { route: 'academico', anchor: 'trajetoria' },
  },
  {
    id: 'servicos',
    label: L('Encontrar serviços', 'Find services'),
    hint: L('o que posso fazer por você', 'what I can do for you'),
    to: { route: 'servicos', anchor: 'servicos' },
  },
  {
    id: 'conhecer',
    label: L('Saber quem é a Duda', 'See who Duda is'),
    hint: L('a página Sobre', 'the About page'),
    to: { route: 'sobre' },
  },
];

// Da mais à menos provável para cada persona (todas as intenções aparecem em todas).
export const DEFAULT_INTENT_ORDER = [
  'competencias',
  'projetos',
  'academico',
  'servicos',
  'conhecer',
];

export const intentOrder: Record<PersonaId, string[]> = {
  rh: ['competencias', 'projetos', 'academico', 'servicos', 'conhecer'],
  tech: ['projetos', 'competencias', 'academico', 'servicos', 'conhecer'],
  professor: ['academico', 'projetos', 'competencias', 'servicos', 'conhecer'],
  cliente: ['servicos', 'projetos', 'conhecer', 'competencias', 'academico'],
  amigo: ['conhecer', 'projetos', 'competencias', 'academico', 'servicos'],
};

export function intentsFor(persona: PersonaId | undefined) {
  const order = persona ? intentOrder[persona] : DEFAULT_INTENT_ORDER;

  return order
    .map((id) => intents.find((i) => i.id === id))
    .filter((i): i is Intent => Boolean(i))
    .map((intent) => ({ intent, to: (persona && intent.byPersona?.[persona]) || intent.to }));
}
