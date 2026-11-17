// Tabela única de rotas e seções do site. Alimenta o
// breadcrumb, o título da Window, os comandos `cd`/`ls`, o autocompletar do
// terminal e o "abrir página própria": nenhum outro arquivo repete caminhos.
//
// - `name` / `alias`: nome do "diretório" em português e em inglês (o mesmo
//   nome do comando que mostra a visão em terminal);
// - `path`: onde a página própria mora;
// - `kind`: sempre "page" (a home é o painel; o terminal mora em `/terminal`);
// - `group`: grupo da barra lateral (rota sem grupo não aparece nela);
// - `command`: comando que mostra a visão em terminal (`/terminal?cmd=<command>`);
// - `parent`: id da rota-mãe no breadcrumb.

// O estado de rascunho (`draft`) e `showInNav` não vivem aqui: ficam em `routeStatus.ts`, para esta
// tabela não importar dados da 008 nem do modo de integração (TD-025 (b)).

import type { Lang, Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export type NavGroup = 'home' | 'portfolio' | 'interactive' | 'development' | 'personal';

// Ordem dos grupos da barra lateral; os rótulos ficam em `ui.nav.groups`.
export const NAV_GROUPS: NavGroup[] = [
  'home',
  'portfolio',
  'interactive',
  'development',
  'personal',
];

// O terminal é uma página própria (antes era a home); o `/?cmd=` antigo é redirecionado para cá.
export const TERMINAL_PATH = '/terminal';

export interface Route {
  id: string;
  kind: 'page';
  // Endereço em português (a raiz do site é o português).
  path: string;
  // Endereço em inglês: `/en` (a home) ou sob `/en/` (spec 002, FR-020).
  enPath: string;
  // Título e texto de SEO da página, nos dois idiomas (copiados de `pageMeta`, que a T2.3 esvazia).
  // `desc` abaixo continua sendo a dica curta do terminal, da paleta e da barra lateral.
  title: Localized;
  description: Localized;
  // Item do menu principal; `order` define a posição (único entre os itens do menu).
  menu?: true;
  order?: number;
  // Só a rota `/_prova` (T5.1): fora do menu, do sitemap e do índice; existe só no build de prova.
  prova?: true;
  // Renderizada sem casca: só a faixa decorativa e o `main` (hoje só o terminal, FR-041).
  bare?: true;
  // Endereços em inglês antigos (`/about`); saem na T2.4 (o redirecionamento é da spec 010).
  aliases?: string[];
  name?: string;
  alias?: string;
  command?: string;
  label: Localized;
  desc?: Localized;
  parent?: string;
  group?: NavGroup;
  segment?: Localized;
  hidden?: boolean;
}

export interface Crumb {
  label: string;
  to: string;
}

// Título e descrição de SEO das subpáginas de /pessoal (usados no map abaixo, por segmento em PT).
const personalMeta: Record<string, { title: Localized; description: Localized }> = {
  livros: {
    title: { pt: 'Livros | Leituras de Duda Brito', en: 'Books | Reading of Duda Brito' },
    description: {
      pt: 'Os livros que Duda Brito está lendo, já leu e quer ler, com notas e datas, numa estante editorial do portfólio.',
      en: 'The books Duda Brito is reading, has read and wants to read, with ratings and dates, on an editorial shelf of the portfolio.',
    },
  },
  filmes: {
    title: {
      pt: 'Filmes | Diário de Cinema de Duda Brito',
      en: 'Films | Film Diary of Duda Brito',
    },
    description: {
      pt: 'O diário de filmes de Duda Brito: o que ela assistiu, com nota, data e resenhas, em ordem cronológica por mês.',
      en: "Duda Brito's film diary: what she watched, with ratings, dates and reviews, in chronological order by month.",
    },
  },
  musica: {
    title: {
      pt: 'Música | Discos e Artistas | Duda Brito',
      en: 'Music | Records and Artists | Duda Brito',
    },
    description: {
      pt: 'A seleção de música de Duda Brito: discos e artistas que ela escolheu mostrar, com notas editoriais curtas, sem player embutido.',
      en: "Duda Brito's music selection: records and artists she chose to show, with short editorial notes and no embedded player.",
    },
  },
  teatro: {
    title: { pt: 'Teatro | Peças Vistas por Duda Brito', en: 'Theater | Plays Seen by Duda Brito' },
    description: {
      pt: 'As peças de teatro que Duda Brito viu: título, companhia, local e data, numa linha do tempo editorial do portfólio.',
      en: 'The plays Duda Brito has seen: title, company, venue and date, on an editorial timeline of the portfolio.',
    },
  },
};

export const routes: Route[] = [
  {
    id: 'home',
    enPath: '/en',
    title: {
      pt: 'Duda Brito | Engenharia de Software e Arquitetura de Software',
      en: 'Duda Brito | Software Engineering and Software Architecture',
    },
    description: {
      pt: 'Portfólio de Duda Brito, estudante de Engenharia de Software na PUC Minas. Arquitetura de software, system design, back-end e full-stack em projetos reais.',
      en: 'Portfolio of Duda Brito, Software Engineering student at PUC Minas. Software architecture, system design, backend and full-stack development in real projects.',
    },
    kind: 'page',
    path: '/',
    group: 'home',
    label: L('Início', 'Home'),
    desc: L(
      'painel com projetos, GitHub e atalhos',
      'dashboard with projects, GitHub and shortcuts',
    ),
  },
  {
    id: 'sobre',
    enPath: '/en/about',
    title: {
      pt: 'Sobre Duda Brito | Estudante de Engenharia de Software',
      en: 'About Duda Brito | Software Engineering Student',
    },
    description: {
      pt: 'Quem é Duda Brito: estudante de Engenharia de Software na PUC Minas, com interesse em arquitetura de software, system design, liderança técnica e IA.',
      en: 'Who Duda Brito is: a Software Engineering student at PUC Minas interested in software architecture, system design, technical leadership and AI.',
    },
    kind: 'page',
    group: 'portfolio',
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
    enPath: '/en/skills',
    title: {
      pt: 'Habilidades e Stack | Duda Brito, Back-end e Full-Stack',
      en: 'Skills and Stack | Duda Brito, Backend and Full-Stack',
    },
    description: {
      pt: 'Stack de Duda Brito com tempo de uso: Java, TypeScript, Node.js, React, PostgreSQL, Docker e práticas como Clean Architecture, DDD e testes automatizados.',
      en: "Duda Brito's stack with time in use: Java, TypeScript, Node.js, React, PostgreSQL, Docker and practices such as Clean Architecture, DDD and automated testing.",
    },
    kind: 'page',
    group: 'portfolio',
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
    enPath: '/en/projects',
    title: {
      pt: 'Projetos de Software | Duda Brito, Back-end e Full-Stack',
      en: 'Software Projects | Duda Brito, Backend and Full-Stack',
    },
    description: {
      pt: 'Projetos de Duda Brito com stack, decisões de arquitetura e repositórios: EcoShop, ShortURL, WhatsApp Dispatcher, Planoriza e este portfólio.',
      en: "Duda Brito's projects with stack, architecture decisions and repositories: EcoShop, ShortURL, WhatsApp Dispatcher, Planoriza and this portfolio.",
    },
    menu: true,
    order: 1,
    kind: 'page',
    group: 'portfolio',
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
    enPath: '/en/experience',
    title: {
      pt: 'Experiências e Atividades | Duda Brito',
      en: 'Experience and Activities | Duda Brito',
    },
    description: {
      pt: 'Atividades acadêmicas, cursos e reconhecimentos de Duda Brito ao longo da graduação em Engenharia de Software na PUC Minas.',
      en: "Duda Brito's academic activities, courses and recognitions during the Software Engineering degree at PUC Minas.",
    },
    kind: 'page',
    group: 'portfolio',
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
    enPath: '/en/contact',
    title: {
      pt: 'Contato | Duda Brito, Engenharia de Software',
      en: 'Contact | Duda Brito, Software Engineering',
    },
    description: {
      pt: 'Fale com Duda Brito sobre oportunidades, colaborações ou projetos de software: e-mail, LinkedIn e GitHub.',
      en: 'Get in touch with Duda Brito about opportunities, collaborations or software projects: email, LinkedIn and GitHub.',
    },
    menu: true,
    order: 4,
    kind: 'page',
    group: 'personal',
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
    enPath: '/en/resume',
    title: {
      pt: 'Currículo | Duda Brito, Estágio em Engenharia de Software',
      en: 'Resume | Duda Brito, Software Engineering Internship',
    },
    description: {
      pt: 'Currículo de Maria Eduarda Brito, estudante de Engenharia de Software na PUC Minas: competências técnicas, projetos, formação e experiências.',
      en: 'Resume of Maria Eduarda Brito, Software Engineering student at PUC Minas: technical skills, projects, education and experience.',
    },
    menu: true,
    order: 2,
    kind: 'page',
    group: 'portfolio',
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
    enPath: '/en/academics',
    title: {
      pt: 'Acadêmico | Duda Brito, Engenharia de Software na PUC Minas',
      en: 'Academics | Duda Brito, Software Engineering at PUC Minas',
    },
    description: {
      pt: 'Trajetória acadêmica de Maria Eduarda Brito na PUC Minas: formação, projetos finalistas, monitoria, extensão e competições.',
      en: "Maria Eduarda Brito's academic record at PUC Minas: degrees, finalist projects, teaching assistantship, outreach and competitions.",
    },
    menu: true,
    order: 3,
    kind: 'page',
    group: 'portfolio',
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
    enPath: '/en/services',
    title: {
      pt: 'Serviços de Desenvolvimento Web | Duda Brito',
      en: 'Web Development Services | Duda Brito',
    },
    description: {
      pt: 'Sites institucionais, e-commerce e sistemas sob medida, do design ao deploy. Serviços de desenvolvimento web de Duda Brito.',
      en: 'Institutional websites, e-commerce and custom systems, from design to deploy. Web development services by Duda Brito.',
    },
    kind: 'page',
    group: 'portfolio',
    path: '/servicos',
    aliases: ['/services'],
    name: 'servicos',
    alias: 'services',
    command: 'servicos',
    label: L('Serviços', 'Services'),
    desc: L('sites e landing pages', 'websites and landing pages'),
  },
  {
    // Sem `name`: não entra em `ls`/`cd` (a página já é o terminal). O `segment` é só o texto do breadcrumb.
    id: 'terminal',
    enPath: '/en/terminal',
    title: {
      pt: 'Terminal | Linha de Comando do Portfólio | Duda Brito',
      en: 'Terminal | Portfolio Command Line | Duda Brito',
    },
    description: {
      pt: 'O terminal interativo do portfólio de Duda Brito: navegue pelas páginas, rode comandos e veja a documentação de todos eles.',
      en: "Duda Brito's interactive portfolio terminal: browse the pages, run commands and read the documentation for all of them.",
    },
    bare: true,
    kind: 'page',
    path: TERMINAL_PATH,
    group: 'interactive',
    label: L('Terminal', 'Terminal'),
    segment: L('terminal', 'terminal'),
    desc: L(
      'a linha de comando do site, com todos os comandos',
      'the site command line, with every command',
    ),
  },
  {
    id: 'github',
    enPath: '/en/github',
    title: {
      pt: 'GitHub | Números e Repositórios | Duda Brito',
      en: 'GitHub | Numbers and Repositories | Duda Brito',
    },
    description: {
      pt: 'Números públicos do GitHub de Duda Brito (repositórios, estrelas, seguidores, contribuições e linguagens) e os repositórios dos projetos do portfólio.',
      en: "Duda Brito's public GitHub numbers (repositories, stars, followers, contributions and languages) and the repositories of the portfolio projects.",
    },
    kind: 'page',
    path: '/github',
    name: 'github',
    alias: 'gh',
    command: 'stats',
    group: 'development',
    label: L('GitHub', 'GitHub'),
    desc: L('números e repositórios', 'numbers and repositories'),
  },
  {
    // Em construção quando data/now.ts está vazio: ver routeStatus.ts.
    id: 'agora',
    enPath: '/en/now',
    title: { pt: 'Agora | Duda Brito', en: 'Now | Duda Brito' },
    description: {
      pt: 'Página "agora" de Duda Brito, estudante de Engenharia de Software: no que ela está focada neste momento.',
      en: 'The "now" page of Duda Brito, a Software Engineering student: what she is focused on at the moment.',
    },
    kind: 'page',
    group: 'personal',
    path: '/agora',
    aliases: ['/now'],
    name: 'agora',
    alias: 'now',
    command: 'agora',
    label: L('Agora', 'Now'),
    desc: L('no que estou focada agora', 'what I am focused on now'),
  },
  {
    // Em construção quando data/uses.ts está vazio: ver routeStatus.ts.
    id: 'setup',
    enPath: '/en/uses',
    title: { pt: 'Setup | Duda Brito', en: 'Setup | Duda Brito' },
    description: {
      pt: 'As ferramentas e o setup que Duda Brito, estudante de Engenharia de Software, usa no dia a dia.',
      en: 'The tools and setup that Duda Brito, a Software Engineering student, uses every day.',
    },
    kind: 'page',
    group: 'personal',
    path: '/setup',
    aliases: ['/uses'],
    name: 'setup',
    alias: 'uses',
    command: 'setup',
    label: L('Setup', 'Setup'),
    desc: L('ferramentas do dia a dia', 'everyday tools'),
  },
  // Espaço cultural (docs/specs/personal/). Rascunho e `showInNav` vêm de routeStatus.ts. Só o hub
  // entra na barra; as subpáginas são "hidden" e vivem dentro dele, como o estudo de caso.
  {
    id: 'pessoal',
    enPath: '/en/personal',
    title: {
      pt: 'Pessoal | Livros, Filmes, Música e Teatro | Duda Brito',
      en: 'Personal | Books, Films, Music and Theater | Duda Brito',
    },
    description: {
      pt: 'Livros, filmes, música e teatro de Duda Brito: um espaço editorial sobre o que ela lê, assiste, ouve e vê no palco, fora do código.',
      en: 'Books, films, music and theater by Duda Brito: an editorial space about what she reads, watches, listens to and sees on stage, beyond code.',
    },
    menu: true,
    order: 5,
    kind: 'page',
    group: 'personal',
    path: '/pessoal',
    aliases: ['/personal'],
    segment: L('pessoal', 'personal'),
    name: 'pessoal',
    alias: 'personal',
    command: 'pessoal',
    label: L('Pessoal', 'Personal'),
    desc: L('livros, filmes, música e teatro', 'books, films, music and theater'),
  },
  ...(
    [
      ['livros', 'books', 'Livros', 'Books', 'o que leio', 'what I read'],
      ['filmes', 'films', 'Filmes', 'Films', 'o que assisto', 'what I watch'],
      ['musica', 'music', 'Música', 'Music', 'o que ouço', 'what I listen to'],
      ['teatro', 'theater', 'Teatro', 'Theater', 'o que vejo no palco', 'what I see on stage'],
    ] as const
  ).map(([pt, en, labelPt, labelEn, descPt, descEn]): Route => ({
    id: `pessoal-${pt}`,
    kind: 'page',
    path: `/pessoal/${pt}`,
    aliases: [`/personal/${en}`],
    enPath: `/en/personal/${en}`,
    ...personalMeta[pt],
    parent: 'pessoal',
    segment: L(pt, en),
    // Visão em terminal da subpágina: `pessoal livros` (o comando `pessoal` aceita o argumento).
    command: `pessoal ${pt}`,
    label: L(labelPt, labelEn),
    desc: L(descPt, descEn),
    hidden: true,
  })),
  {
    // Fora do `ls`: é uma página dentro de "projetos".
    id: 'whatsapp-dispatcher',
    enPath: '/en/case-studies/whatsapp-dispatcher',
    title: {
      pt: 'WhatsApp Dispatcher: Estudo de Caso de Arquitetura | Duda Brito',
      en: 'WhatsApp Dispatcher: Architecture Case Study | Duda Brito',
    },
    description: {
      pt: 'Estudo de caso de arquitetura de um sistema de disparo de mensagens no WhatsApp: DDD, Clean Architecture, filas com BullMQ e Redis, idempotência e trade-offs.',
      en: 'Architecture case study of a WhatsApp message dispatch system: DDD, Clean Architecture, BullMQ and Redis queues, idempotency and trade-offs.',
    },
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

// Texto do segmento da rota no idioma. Sem texto de reserva (FR-015): falta de dado lança, nunca
// devolve o `id`.
export function routeSegment(route: Route, lang: Lang): string {
  const text = route.segment?.[lang];

  if (!text) throw new Error(`rota ${route.id}: segmento sem ${lang}`);

  return text;
}

// Nome do "diretório" da rota (`name` em PT, `alias` em EN); lança se faltar.
export function routeName(route: Route, lang: Lang): string {
  const text = lang === 'pt' ? route.name : route.alias;

  if (!text) throw new Error(`rota ${route.id}: ${lang === 'pt' ? 'name' : 'alias'} ausente`);

  return text;
}

// Rótulo no breadcrumb: o segmento, quando existe; senão o nome do diretório.
const crumbLabel = (route: Route, lang: Lang) =>
  route.segment ? routeSegment(route, lang) : routeName(route, lang);

// Segmentos do breadcrumb e do título da janela: [{ label, to }], sem o "~".
export function crumbsFor(route: Route | undefined | null, lang: Lang): Crumb[] {
  if (!route || route.id === 'home') return [];

  const own = { label: crumbLabel(route, lang), to: route.path };
  const parent = route.parent ? routeById(route.parent) : undefined;

  return parent ? [{ label: crumbLabel(parent, lang), to: parent.path }, own] : [own];
}

// Caminho exibido no título da janela: "~/academico", "~/projetos/whatsapp-dispatcher".
export function windowPath(route: Route | undefined | null, lang: Lang) {
  const parts = crumbsFor(route, lang).map((c) => c.label);

  return `~${parts.length ? `/${parts.join('/')}` : ''}`;
}

// URL da home que já executa o comando da página (visão em terminal).
export const terminalUrl = (route: Route, command = route.command) =>
  `${TERMINAL_PATH}?cmd=${encodeURIComponent(command ?? route.id)}`;

// `isListed` e `navRoutes` (rotas da barra lateral, sem rascunhos) dependem do estado de rascunho e
// ficam em routeStatus.ts.

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
