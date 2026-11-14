// Composição da home por persona (docs/specs/personas-home/). Só dado: quais blocos, em que
// ordem, com que título e chamado. Os blocos leem os dados que já existem (projetos,
// currículo, acadêmico, serviços); nada aqui é fato novo sobre a Duda, só texto de interface.
// Persona sem entrada (ou nenhuma persona) cai em `DEFAULT_HOME`. Nenhum bloco é escondido do
// site: o que sai da home de uma persona continua nos atalhos (`quick`) e na barra lateral.
import type { Localized } from '../types';
import { academics } from './academics';
import type { Tone } from './tones';
import { personaById, type PersonaId } from './personas';

const L = (pt: string, en: string): Localized => ({ pt, en });

export type HomeBlockId =
  | 'profile'
  | 'stack'
  | 'academic'
  | 'services'
  | 'projects'
  | 'quick'
  | 'github'
  | 'interactive'
  // Experiências por persona (docs/specs/experiencias-persona/), carregadas sob demanda.
  | 'overview'
  | 'architecture'
  | 'timeline'
  | 'journey'
  | 'explore'
  // "O que você procura?" (docs/specs/busca-contextual/): atalhos por intenção.
  | 'intents'
  // Espaço cultural (docs/specs/personal/): atalho para /pessoal, só quando a página não é rascunho.
  | 'personal';

export interface HomeBlock {
  id: HomeBlockId;
  // Blocos `half` vizinhos dividem a mesma linha.
  half?: boolean;
  title?: Localized;
  lead?: Localized;
  // Só para `projects`: ids de projeto, na ordem; sem a lista, valem os projetos com selo.
  projects?: string[];
}

export interface HomeAction {
  route: string;
  anchor?: string;
  label: Localized;
}

export interface PersonaHome {
  tone?: Tone;
  intro?: Localized;
  // Sem `primary`, o chamado é o `cta` da persona (`personas.ts`).
  primary?: HomeAction;
  secondary: HomeAction[];
  blocks: HomeBlock[];
}

const academicProjects = academics.years
  .flatMap((y) => y.items)
  .filter((a) => a.kind === 'project')
  .map((a) => a.id);

export const DEFAULT_HOME: PersonaHome = {
  primary: { route: 'projetos', label: L('Ver projetos', 'See projects') },
  secondary: [
    { route: 'curriculo', label: L('Currículo', 'Resume') },
    { route: 'terminal', label: L('Abrir o terminal', 'Open the terminal') },
  ],
  blocks: [
    { id: 'quick' },
    { id: 'intents' },
    { id: 'projects' },
    { id: 'github', half: true },
    { id: 'interactive', half: true },
  ],
};

export const personaHome: Record<PersonaId, PersonaHome> = {
  rh: {
    tone: 'amber',
    intro: L(
      'Um resumo da formação, das competências e das experiências, com o currículo completo a um clique.',
      'A summary of education, skills and experience, with the full resume one click away.',
    ),
    secondary: [
      { route: 'contato', label: L('Entrar em contato', 'Get in touch') },
      { route: 'experiencias', label: L('Ver experiências', 'See experience') },
    ],
    blocks: [
      { id: 'profile' },
      { id: 'overview' },
      { id: 'projects', projects: ['planoriza', 'ecoshop'] },
      { id: 'intents' },
      { id: 'quick', title: L('Todas as páginas', 'All pages') },
    ],
  },
  tech: {
    tone: 'violet',
    intro: L(
      'Explore projetos, decisões de arquitetura e repositórios.',
      'Explore projects, architecture decisions and repositories.',
    ),
    secondary: [
      { route: 'whatsapp-dispatcher', label: L('Ler o estudo de caso', 'Read the case study') },
      { route: 'github', label: L('Ver o GitHub', 'See GitHub') },
    ],
    blocks: [
      {
        id: 'projects',
        title: L('Projetos técnicos', 'Technical projects'),
        projects: ['whatsapp-dispatcher', 'ecoshop', 'portfolio', 'shorturl'],
      },
      { id: 'architecture' },
      { id: 'stack', half: true },
      { id: 'github', half: true },
      { id: 'intents' },
      { id: 'quick', title: L('Todas as páginas', 'All pages') },
    ],
  },
  professor: {
    tone: 'mint',
    intro: L(
      'Conheça a trajetória acadêmica e os projetos desenvolvidos.',
      'Get to know the academic path and the projects built along it.',
    ),
    secondary: [
      { route: 'curriculo', label: L('Currículo', 'Resume') },
      { route: 'experiencias', label: L('Atividades e extensão', 'Activities and outreach') },
    ],
    blocks: [
      { id: 'academic' },
      { id: 'timeline' },
      {
        id: 'projects',
        title: L('Projetos da trajetória', 'Projects along the path'),
        lead: L(
          'Os projetos que aparecem na linha do tempo acadêmica.',
          'The projects that appear on the academic timeline.',
        ),
        projects: academicProjects,
      },
      {
        id: 'personal',
        title: L('Pessoal', 'Personal'),
        lead: L(
          'Interesses fora da sala de aula: livros, filmes, música e teatro.',
          'Interests beyond the classroom: books, films, music and theater.',
        ),
      },
      { id: 'intents' },
      { id: 'quick', title: L('Todas as páginas', 'All pages') },
    ],
  },
  cliente: {
    tone: 'coral',
    intro: L(
      'Veja os serviços, exemplos de entrega e formas de contato.',
      'See the services, examples of delivered work and ways to get in touch.',
    ),
    primary: {
      route: 'servicos',
      anchor: 'contato',
      label: L('Pedir orçamento', 'Request a quote'),
    },
    secondary: [
      { route: 'servicos', anchor: 'faq', label: L('Perguntas frequentes', 'FAQ') },
      { route: 'servicos', label: L('Ver os serviços', 'See the services') },
    ],
    blocks: [
      { id: 'services' },
      { id: 'journey' },
      { id: 'projects', projects: ['ecoshop', 'whatsapp-dispatcher'] },
      { id: 'intents' },
      { id: 'quick', title: L('Todas as páginas', 'All pages') },
    ],
  },
  amigo: {
    tone: 'pink',
    intro: L(
      'Explore projetos, interesses e algumas surpresas.',
      'Explore projects, interests and a few surprises.',
    ),
    secondary: [
      { route: 'jogos', label: L('Jogar', 'Play') },
      { route: 'terminal', label: L('Abrir o terminal', 'Open the terminal') },
    ],
    blocks: [
      {
        id: 'interactive',
        title: L('Para explorar', 'To explore'),
        lead: L(
          'Jogos, o terminal e comandos para descobrir. Tem mais coisas escondidas.',
          'Games, the terminal and commands to discover. There is more hidden around.',
        ),
      },
      { id: 'explore' },
      {
        id: 'personal',
        title: L('Pessoal', 'Personal'),
        lead: L(
          'O que leio, assisto, ouço e vejo no palco, fora do código.',
          'What I read, watch, listen to and see on stage, beyond code.',
        ),
      },
      {
        id: 'projects',
        title: L('Projetos pessoais', 'Personal projects'),
        projects: ['portfolio', 'planoriza', 'shorturl'],
      },
      { id: 'intents' },
      { id: 'quick', title: L('Todas as páginas', 'All pages') },
    ],
  },
};

export const homeFor = (id: PersonaId | undefined): PersonaHome =>
  (id && personaHome[id]) || DEFAULT_HOME;

// A ação principal: a da configuração, ou o chamado da persona.
export function primaryAction(id: PersonaId | undefined): HomeAction {
  const home = homeFor(id);
  const persona = personaById(id);

  return (
    home.primary ??
    (persona ? { route: persona.cta.route, label: persona.cta.label } : DEFAULT_HOME.primary!)
  );
}
