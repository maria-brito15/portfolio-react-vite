// Próximos passos por persona e por página (docs/specs/navegacao-contextual/). Só dado: para
// cada persona e página (id de `routes.ts`), uma ação principal e, às vezes, uma secundária.
// Os destinos são rotas e âncoras que já existem; o texto é só de interface. Página ou persona
// sem regra: nada aparece. Sem persona, também nada (o visitante não pediu).
//
// Os exemplos do roadmap que dependem de algo que o site não tem (a página de "processo de
// trabalho" do cliente, um diagrama de arquitetura) foram trocados pelo destino mais próximo
// que existe.
import type { Localized } from '../types';
import { personaById, type PersonaId } from './personas';
import { routeById } from './routes';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface NextAction {
  route: string;
  anchor?: string;
  label: Localized;
}

export interface NextRule {
  primary: NextAction;
  secondary?: NextAction;
}

const to = (route: string, pt: string, en: string, anchor?: string): NextAction => ({
  route,
  anchor,
  label: L(pt, en),
});

const CONTACT = to('contato', 'Entrar em contato', 'Get in touch');
const RESUME = to('curriculo', 'Ver o currículo', 'See the resume');
const PROJECTS = to('projetos', 'Ver os projetos', 'See the projects');
const GAMES = to('jogos', 'Jogar', 'Play');

export const nextActions: Record<PersonaId, Record<string, NextRule>> = {
  rh: {
    sobre: { primary: RESUME, secondary: to('experiencias', 'Ver experiências', 'See experience') },
    habilidades: {
      primary: to('experiencias', 'Ver as experiências', 'See the experience'),
      secondary: RESUME,
    },
    curriculo: {
      primary: to('experiencias', 'Ver as experiências', 'See the experience'),
      secondary: CONTACT,
    },
    academico: {
      primary: RESUME,
      secondary: to('experiencias', 'Ver experiências', 'See experience'),
    },
    projetos: { primary: RESUME, secondary: CONTACT },
    experiencias: { primary: CONTACT, secondary: RESUME },
    contato: { primary: RESUME },
  },
  tech: {
    sobre: { primary: PROJECTS, secondary: to('habilidades', 'Ver a stack', 'See the stack') },
    habilidades: { primary: PROJECTS, secondary: to('github', 'Ver o GitHub', 'See GitHub') },
    projetos: {
      primary: to('whatsapp-dispatcher', 'Ler o estudo de caso', 'Read the case study'),
      secondary: to('github', 'Ver o GitHub', 'See GitHub'),
    },
    'whatsapp-dispatcher': {
      primary: to('github', 'Ver os repositórios no GitHub', 'See the repositories on GitHub'),
      secondary: CONTACT,
    },
    github: { primary: CONTACT, secondary: PROJECTS },
    curriculo: { primary: PROJECTS, secondary: CONTACT },
    experiencias: { primary: PROJECTS, secondary: CONTACT },
  },
  professor: {
    sobre: {
      primary: to('academico', 'Ver o acadêmico', 'See the academics'),
      secondary: PROJECTS,
    },
    academico: {
      primary: to('projetos', 'Ver os projetos', 'See the projects'),
      secondary: to('experiencias', 'Atividades e extensão', 'Activities and outreach'),
    },
    projetos: {
      primary: to('academico', 'Ver o contexto acadêmico', 'See the academic context'),
      secondary: RESUME,
    },
    'whatsapp-dispatcher': {
      primary: to('projetos', 'Ver os outros projetos', 'See the other projects'),
      secondary: to('academico', 'Ver o acadêmico', 'See the academics'),
    },
    experiencias: {
      primary: to('academico', 'Ver as atividades por ano', 'See activities by year', 'por-ano'),
      secondary: PROJECTS,
    },
    curriculo: {
      primary: to('academico', 'Ver o acadêmico', 'See the academics'),
      secondary: to('experiencias', 'Ver experiências', 'See experience'),
    },
  },
  cliente: {
    sobre: {
      primary: to('servicos', 'Ver os serviços', 'See the services'),
      secondary: CONTACT,
    },
    servicos: {
      primary: to('servicos', 'Ver os cases', 'See the case studies', 'cases'),
      secondary: to('servicos', 'Pedir orçamento', 'Request a quote', 'contato'),
    },
    projetos: {
      primary: to('servicos', 'Ver os serviços', 'See the services'),
      secondary: to('servicos', 'Pedir orçamento', 'Request a quote', 'contato'),
    },
    'whatsapp-dispatcher': {
      primary: to('servicos', 'Perguntas frequentes', 'FAQ', 'faq'),
      secondary: to('servicos', 'Pedir orçamento', 'Request a quote', 'contato'),
    },
    contato: {
      primary: to('servicos', 'Perguntas frequentes', 'FAQ', 'faq'),
      secondary: PROJECTS,
    },
    curriculo: {
      primary: to('servicos', 'Ver os serviços', 'See the services'),
      secondary: CONTACT,
    },
  },
  amigo: {
    sobre: {
      primary: to('projetos', 'Ver os projetos', 'See the projects'),
      secondary: GAMES,
    },
    projetos: {
      primary: GAMES,
      secondary: to('terminal', 'Abrir o terminal', 'Open the terminal'),
    },
    jogos: {
      primary: to('terminal', 'Abrir o terminal', 'Open the terminal'),
      secondary: to('sobre', 'Conhecer a Duda', 'Get to know Duda'),
    },
    github: { primary: GAMES, secondary: to('sobre', 'Conhecer a Duda', 'Get to know Duda') },
    agora: { primary: GAMES, secondary: to('sobre', 'Conhecer a Duda', 'Get to know Duda') },
    contato: { primary: GAMES, secondary: to('sobre', 'Conhecer a Duda', 'Get to know Duda') },
  },
};

export const nextFor = (persona: PersonaId | undefined, routeId: string | undefined) =>
  persona && routeId ? nextActions[persona]?.[routeId] : undefined;

// Sugestões que o visitante ainda não viu (Fase 5): as da regra, sem as páginas já abertas nesta
// sessão nem a atual; se sobrar vaga, entram as páginas da persona (`personas.ts`) que ele ainda
// não abriu. No máximo duas, nunca uma rota repetida. Uma ação com âncora (`servicos#cases`) é
// uma parte da página, então conta como nova mesmo se a página já foi aberta.
export const MAX_SUGGESTIONS = 2;

export function suggestionsFor(
  persona: PersonaId | undefined,
  routeId: string | undefined,
  visited: ReadonlySet<string>,
): NextAction[] {
  const rule = nextFor(persona, routeId);

  if (!rule || !persona) return [];

  const seen = (a: NextAction) => !a.anchor && (visited.has(a.route) || a.route === routeId);
  const fresh = [rule.primary, rule.secondary].filter(
    (a): a is NextAction => Boolean(a) && !seen(a as NextAction),
  );

  if (fresh.length < MAX_SUGGESTIONS) {
    const taken = new Set(fresh.map((a) => a.route));
    const pool = (personaById(persona)?.order ?? [])
      .filter((id) => id !== 'home' && id !== routeId && !visited.has(id) && !taken.has(id))
      .map((id) => routeById(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r) && !r!.draft && !r!.hidden);

    for (const r of pool) {
      if (fresh.length >= MAX_SUGGESTIONS) break;
      fresh.push({ route: r.id, label: r.label });
    }
  }

  return fresh.slice(0, MAX_SUGGESTIONS);
}
