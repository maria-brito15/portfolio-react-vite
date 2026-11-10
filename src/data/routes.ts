// Tabela única de rotas e seções do site. Alimenta o
// breadcrumb, o título da Window, os comandos `cd`/`ls`, o autocompletar do
// terminal e o "abrir página própria": nenhum outro arquivo repete caminhos.
//
// - `name` / `alias`: nome do "diretório" em português e em inglês (o mesmo
//   nome do comando que mostra a visão em terminal);
// - `path`: onde a página própria mora;
// - `kind`: sempre "page" (a home é só o terminal; tudo o mais é página própria);
// - `command`: comando que mostra a visão em terminal (`/?cmd=<command>`);
// - `parent`: id da rota-mãe no breadcrumb.

import type { Lang, Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface Route {
  id: string;
  kind: 'page';
  path: string;
  aliases?: string[];
  name?: string;
  alias?: string;
  command?: string;
  label: Localized;
  desc?: Localized;
  parent?: string;
  segment?: Localized;
  hidden?: boolean;
}

export interface Crumb {
  label: string;
  to: string;
}

export const routes: Route[] = [
  {
    id: 'home',
    kind: 'page',
    path: '/',
    label: L('Início', 'Home'),
    desc: L('terminal e seções', 'terminal and sections'),
  },
  {
    id: 'sobre',
    kind: 'page',
    path: '/sobre',
    aliases: ['/about'],
    name: 'sobre',
    alias: 'about',
    command: 'sobre',
    label: L('Sobre', 'About'),
    desc: L('quem sou', 'who I am'),
  },
  {
    id: 'habilidades',
    kind: 'page',
    path: '/habilidades',
    aliases: ['/skills'],
    name: 'habilidades',
    alias: 'skills',
    command: 'habilidades',
    label: L('Habilidades', 'Skills'),
    desc: L('stack e ferramentas', 'stack and tools'),
  },
  {
    id: 'projetos',
    kind: 'page',
    path: '/projetos',
    aliases: ['/projects'],
    name: 'projetos',
    alias: 'projects',
    command: 'projetos',
    label: L('Projetos', 'Projects'),
    desc: L('linha do tempo de projetos', 'project timeline'),
  },
  {
    id: 'experiencias',
    kind: 'page',
    path: '/experiencias',
    aliases: ['/experience'],
    name: 'experiencias',
    alias: 'experience',
    command: 'experiencias',
    label: L('Experiências', 'Experience'),
    desc: L('além da sala de aula', 'beyond the classroom'),
  },
  {
    id: 'contato',
    kind: 'page',
    path: '/contato',
    aliases: ['/contact'],
    name: 'contato',
    alias: 'contact',
    command: 'contato',
    label: L('Contato', 'Contact'),
    desc: L('e-mail, LinkedIn, GitHub', 'email, LinkedIn, GitHub'),
  },
  {
    id: 'curriculo',
    kind: 'page',
    path: '/curriculo',
    aliases: ['/resume'],
    name: 'curriculo',
    alias: 'resume',
    command: 'curriculo',
    label: L('Currículo', 'Resume'),
    desc: L('currículo em uma página', 'one-page resume'),
  },
  {
    id: 'academico',
    kind: 'page',
    path: '/academico',
    aliases: ['/academics'],
    name: 'academico',
    alias: 'academics',
    command: 'academico',
    label: L('Acadêmico', 'Academics'),
    desc: L('formação e trajetória', 'education and record'),
  },
  {
    id: 'servicos',
    kind: 'page',
    path: '/servicos',
    aliases: ['/services'],
    name: 'servicos',
    alias: 'services',
    command: 'servicos',
    label: L('Serviços', 'Services'),
    desc: L('sites e landing pages', 'websites and landing pages'),
  },
  {
    // Fora do `ls`: é uma página dentro de "projetos".
    id: 'whatsapp-dispatcher',
    kind: 'page',
    path: '/estudos-de-caso/whatsapp-dispatcher',
    parent: 'projetos',
    segment: L('whatsapp-dispatcher', 'whatsapp-dispatcher'),
    command: 'projetos',
    label: L('Estudo de caso', 'Case study'),
    hidden: true,
  },
];

export const routeById = (id: string) => routes.find((r) => r.id === id);

// Seções e páginas que aparecem em `ls`, `cd` e no autocompletar.
export type Directory = Route & { name: string; alias: string; desc: Localized };

export const directories = routes.filter((r) => r.name && !r.hidden) as Directory[];

export const normalizePath = (path: string) => path.replace(/(.)\/$/, '$1');

// Página (rota própria) que atende a um caminho, ou undefined para o 404.
export function findPageByPath(path: string) {
  const clean = normalizePath(path);

  return routes.find((r) => r.kind === 'page' && (r.path === clean || r.aliases?.includes(clean)));
}

// Remove acentos e caixa ("Currículo" vale como "curriculo").
export const fold = (text: unknown) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Diretório pelo nome em PT ou EN; aceita `./x`, `~/x`, `/x`, barra final e acentos.
export function findDirectory(arg: unknown) {
  const name = fold(arg)
    .replace(/^\.?\/+|\/+$/g, '')
    .replace(/^~\/?/, '');

  return directories.find((d) => d.name === name || d.alias === name);
}

// Segmentos do breadcrumb e do título da janela: [{ label, to }], sem o "~".
export function crumbsFor(route: Route | undefined | null, lang: Lang): Crumb[] {
  if (!route || route.id === 'home') return [];

  const own = {
    label: route.segment
      ? route.segment[lang]
      : ((lang === 'pt' ? route.name : route.alias) ?? route.id),
    to: route.path,
  };
  const parent = route.parent ? routeById(route.parent) : undefined;

  return parent
    ? [{ label: (lang === 'pt' ? parent.name : parent.alias) ?? parent.id, to: parent.path }, own]
    : [own];
}

// Caminho exibido no título da janela: "~/academico", "~/projetos/whatsapp-dispatcher".
export function windowPath(route: Route | undefined | null, lang: Lang) {
  const parts = crumbsFor(route, lang).map((c) => c.label);

  return `~${parts.length ? `/${parts.join('/')}` : ''}`;
}

// URL da home que já executa o comando da página (visão em terminal).
export const terminalUrl = (route: Route, command = route.command) =>
  `/?cmd=${encodeURIComponent(command ?? route.id)}`;

// Âncoras da home antiga (`/#projetos`…) → página própria equivalente (SH-10).
// A home virou só o terminal; links publicados antes disso (LinkedIn, currículo,
// README) são redirecionados no cliente. `#inicio` continua valendo na home.
// Hash fora da tabela é ignorado.
const LEGACY_PAGES = ['sobre', 'habilidades', 'projetos', 'experiencias', 'contato'];
export const legacyHashes: Record<string, string> = Object.fromEntries(
  LEGACY_PAGES.flatMap((id) => {
    const route = routeById(id) as Route;

    return [
      [`#${route.name}`, route.path],
      [`#${route.alias}`, route.path],
    ];
  }),
);

// Destino de um link antigo, ou undefined quando não é um (outra página, hash novo).
export function legacyTarget(path: string, hash: string) {
  if (normalizePath(path) !== '/' || !hash) return undefined;

  let decoded = hash;

  try {
    decoded = decodeURIComponent(hash);
  } catch {
    // hash malformado (ex.: "#%"): não é um link antigo
  }

  return legacyHashes[fold(decoded)];
}
