// Fonte única de SEO: título, descrição, URL canônica, Open Graph, Twitter Card
// e JSON-LD de cada página, nos dois idiomas. É lida em dois lugares:
//  - no navegador, por `useDocumentMeta`, a cada troca de rota ou de idioma;
//  - no build, por `scripts/seoPlugin.ts`, que grava um HTML por rota (o que
//    crawlers que não executam JavaScript, como os de link preview, enxergam),
//    além de sitemap.xml.
// Rotas e rótulos vêm de routes.ts; nada de caminho repetido aqui.
//
// Idioma: o site troca PT/EN no cliente (localStorage), sem URL própria por
// idioma. Por isso NÃO há hreflang: ele exige uma URL por versão, e anunciar
// URLs que servem o mesmo HTML seria informação falsa. O HTML estático sai em
// pt-BR (idioma padrão); o inglês é servido ao visitante pelo seletor.

import type { Lang, Localized } from '../types';
import { profile } from './profile';
import { projects } from './projects';
import { routeById, normalizePath, type Route } from './routes';

export const SITE_URL = 'https://mariabdev.netlify.app';
export const SITE_NAME = 'Duda Brito';
export const FULL_NAME = 'Maria Eduarda de Paula Brito';
export const OG_IMAGE = '/assets/og-image.png';
export const NOT_FOUND_ID = 'notFound';

export interface PageMeta {
  title: string;
  description: string;
}

const M = (pt: PageMeta, en: PageMeta): Localized<PageMeta> => ({ pt, en });

// Títulos até ~60 caracteres e descrições até ~160, para não serem cortados nos resultados.
export const pageMeta: Record<string, Localized<PageMeta>> = {
  home: M(
    {
      title: 'Duda Brito | Engenharia de Software e Arquitetura de Software',
      description:
        'Portfólio de Duda Brito, estudante de Engenharia de Software na PUC Minas. Arquitetura de software, system design, back-end e full-stack em projetos reais.',
    },
    {
      title: 'Duda Brito | Software Engineering and Software Architecture',
      description:
        'Portfolio of Duda Brito, Software Engineering student at PUC Minas. Software architecture, system design, backend and full-stack development in real projects.',
    },
  ),
  sobre: M(
    {
      title: 'Sobre Duda Brito | Estudante de Engenharia de Software',
      description:
        'Quem é Duda Brito: estudante de Engenharia de Software na PUC Minas, com interesse em arquitetura de software, system design, liderança técnica e IA.',
    },
    {
      title: 'About Duda Brito | Software Engineering Student',
      description:
        'Who Duda Brito is: a Software Engineering student at PUC Minas interested in software architecture, system design, technical leadership and AI.',
    },
  ),
  habilidades: M(
    {
      title: 'Habilidades e Stack | Duda Brito, Back-end e Full-Stack',
      description:
        'Stack de Duda Brito com tempo de uso: Java, TypeScript, Node.js, React, PostgreSQL, Docker e práticas como Clean Architecture, DDD e testes automatizados.',
    },
    {
      title: 'Skills and Stack | Duda Brito, Backend and Full-Stack',
      description:
        "Duda Brito's stack with time in use: Java, TypeScript, Node.js, React, PostgreSQL, Docker and practices such as Clean Architecture, DDD and automated testing.",
    },
  ),
  projetos: M(
    {
      title: 'Projetos de Software | Duda Brito, Back-end e Full-Stack',
      description:
        'Projetos de Duda Brito com stack, decisões de arquitetura e repositórios: EcoShop, ShortURL, WhatsApp Dispatcher, Planoriza e este portfólio.',
    },
    {
      title: 'Software Projects | Duda Brito, Backend and Full-Stack',
      description:
        "Duda Brito's projects with stack, architecture decisions and repositories: EcoShop, ShortURL, WhatsApp Dispatcher, Planoriza and this portfolio.",
    },
  ),
  experiencias: M(
    {
      title: 'Experiências e Atividades | Duda Brito',
      description:
        'Atividades acadêmicas, cursos e reconhecimentos de Duda Brito ao longo da graduação em Engenharia de Software na PUC Minas.',
    },
    {
      title: 'Experience and Activities | Duda Brito',
      description:
        "Duda Brito's academic activities, courses and recognitions during the Software Engineering degree at PUC Minas.",
    },
  ),
  contato: M(
    {
      title: 'Contato | Duda Brito, Engenharia de Software',
      description:
        'Fale com Duda Brito sobre oportunidades, colaborações ou projetos de software: e-mail, LinkedIn e GitHub.',
    },
    {
      title: 'Contact | Duda Brito, Software Engineering',
      description:
        'Get in touch with Duda Brito about opportunities, collaborations or software projects: email, LinkedIn and GitHub.',
    },
  ),
  curriculo: M(
    {
      title: 'Currículo | Duda Brito, Estágio em Engenharia de Software',
      description:
        'Currículo de Maria Eduarda Brito, estudante de Engenharia de Software na PUC Minas: competências técnicas, projetos, formação e experiências.',
    },
    {
      title: 'Resume | Duda Brito, Software Engineering Internship',
      description:
        'Resume of Maria Eduarda Brito, Software Engineering student at PUC Minas: technical skills, projects, education and experience.',
    },
  ),
  academico: M(
    {
      title: 'Acadêmico | Duda Brito, Engenharia de Software na PUC Minas',
      description:
        'Trajetória acadêmica de Maria Eduarda Brito na PUC Minas: formação, projetos finalistas, monitoria, extensão e competições.',
    },
    {
      title: 'Academics | Duda Brito, Software Engineering at PUC Minas',
      description:
        "Maria Eduarda Brito's academic record at PUC Minas: degrees, finalist projects, teaching assistantship, outreach and competitions.",
    },
  ),
  servicos: M(
    {
      title: 'Serviços de Desenvolvimento Web | Duda Brito',
      description:
        'Sites institucionais, e-commerce e sistemas sob medida, do design ao deploy. Serviços de desenvolvimento web de Duda Brito.',
    },
    {
      title: 'Web Development Services | Duda Brito',
      description:
        'Institutional websites, e-commerce and custom systems, from design to deploy. Web development services by Duda Brito.',
    },
  ),
  agora: M(
    {
      title: 'Agora | Duda Brito',
      description:
        'Página "agora" de Duda Brito, estudante de Engenharia de Software: no que ela está focada neste momento.',
    },
    {
      title: 'Now | Duda Brito',
      description:
        'The "now" page of Duda Brito, a Software Engineering student: what she is focused on at the moment.',
    },
  ),
  setup: M(
    {
      title: 'Setup | Duda Brito',
      description:
        'As ferramentas e o setup que Duda Brito, estudante de Engenharia de Software, usa no dia a dia.',
    },
    {
      title: 'Setup | Duda Brito',
      description:
        'The tools and setup that Duda Brito, a Software Engineering student, uses every day.',
    },
  ),
  'whatsapp-dispatcher': M(
    {
      title: 'WhatsApp Dispatcher: Estudo de Caso de Arquitetura | Duda Brito',
      description:
        'Estudo de caso de arquitetura de um sistema de disparo de mensagens no WhatsApp: DDD, Clean Architecture, filas com BullMQ e Redis, idempotência e trade-offs.',
    },
    {
      title: 'WhatsApp Dispatcher: Architecture Case Study | Duda Brito',
      description:
        'Architecture case study of a WhatsApp message dispatch system: DDD, Clean Architecture, BullMQ and Redis queues, idempotency and trade-offs.',
    },
  ),
  [NOT_FOUND_ID]: M(
    {
      title: 'Página não encontrada | Duda Brito',
      description: 'Esta página não existe. Volte ao terminal do portfólio de Duda Brito.',
    },
    {
      title: 'Page not found | Duda Brito',
      description: "This page doesn't exist. Go back to Duda Brito's portfolio terminal.",
    },
  ),
};

export const metaFor = (id: string, lang: Lang): PageMeta =>
  (pageMeta[id] ?? pageMeta[NOT_FOUND_ID])[lang];

export const absoluteUrl = (path: string) => `${SITE_URL}${normalizePath(path)}`;

// Descritores das tags do <head>. O build as escreve como HTML; o navegador as
// atualiza no lugar. `key` identifica a tag (name, property ou rel).
export interface HeadTag {
  tag: 'meta' | 'link';
  attrs: Record<string, string>;
}

const LOCALES: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US' };

export function headTags(routeId: string, lang: Lang): { title: string; tags: HeadTag[] } {
  const { title, description } = metaFor(routeId, lang);
  const route = routeById(routeId);
  const url = absoluteUrl(route?.path ?? '/');
  const image = `${SITE_URL}${OG_IMAGE}`;
  const imageAlt =
    lang === 'pt'
      ? 'Duda Brito, estudante de Engenharia de Software na PUC Minas'
      : 'Duda Brito, Software Engineering student at PUC Minas';
  // O 404 e as páginas em construção (`draft`, sem conteúdo) ficam fora do índice.
  const robots =
    routeId === NOT_FOUND_ID || route?.draft
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1';
  const m = (attr: 'name' | 'property', key: string, content: string): HeadTag => ({
    tag: 'meta',
    attrs: { [attr]: key, content },
  });

  return {
    title,
    tags: [
      m('name', 'description', description),
      m('name', 'robots', robots),
      // O 404 não declara canonical: não há URL "oficial" para um endereço que não existe.
      ...(routeId === NOT_FOUND_ID
        ? []
        : [{ tag: 'link' as const, attrs: { rel: 'canonical', href: url } }]),
      m('property', 'og:type', 'website'),
      m('property', 'og:site_name', SITE_NAME),
      m('property', 'og:title', title),
      m('property', 'og:description', description),
      m('property', 'og:url', url),
      m('property', 'og:locale', LOCALES[lang]),
      m('property', 'og:locale:alternate', LOCALES[lang === 'pt' ? 'en' : 'pt']),
      m('property', 'og:image', image),
      m('property', 'og:image:type', 'image/png'),
      m('property', 'og:image:width', '1200'),
      m('property', 'og:image:height', '630'),
      m('property', 'og:image:alt', imageAlt),
      m('name', 'twitter:card', 'summary_large_image'),
      m('name', 'twitter:title', title),
      m('name', 'twitter:description', description),
      m('name', 'twitter:image', image),
      m('name', 'twitter:image:alt', imageAlt),
    ],
  };
}

// Seletor da tag no documento, para atualizar em vez de duplicar.
export const tagSelector = ({ tag, attrs }: HeadTag) => {
  const id = (['name', 'property', 'rel'] as const).find((k) => attrs[k]) ?? 'name';

  return `${tag}[${id}="${attrs[id]}"]`;
};

// ---------------------------------------------------------------- JSON-LD

const personId = `${SITE_URL}/#person`;
const websiteId = `${SITE_URL}/#website`;

// Áreas que o site apresenta como interesse ou prática (páginas Sobre, Habilidades e
// Currículo). Nada aqui é uma qualificação que o site não mostre.
const KNOWS_ABOUT = [
  'Software Architecture',
  'System Design',
  'Backend Development',
  'Full-Stack Development',
  'Domain-Driven Design',
  'Clean Architecture',
  'Automated Testing',
  'Specification-Driven Development',
  'Project Management',
  'Java',
  'TypeScript',
  'Node.js',
  'React',
  'PostgreSQL',
];

const person = (lang: Lang) => ({
  '@type': 'Person',
  '@id': personId,
  name: FULL_NAME,
  alternateName: SITE_NAME,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}${profile.photo}`,
  jobTitle: lang === 'pt' ? 'Estudante de Engenharia de Software' : 'Software Engineering Student',
  description: metaFor('home', lang).description,
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'PUC Minas',
    url: 'https://www.pucminas.br',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Belo Horizonte',
    addressRegion: 'MG',
    addressCountry: 'BR',
  },
  knowsAbout: KNOWS_ABOUT,
  knowsLanguage: ['pt', 'en', 'fr'],
  sameAs: [profile.github, profile.linkedin],
});

const website = (lang: Lang) => ({
  '@type': 'WebSite',
  '@id': websiteId,
  url: `${SITE_URL}/`,
  name: `${SITE_NAME} — Portfolio`,
  description: metaFor('home', lang).description,
  inLanguage: ['pt-BR', 'en'],
  publisher: { '@id': personId },
  author: { '@id': personId },
});

function projectNode(p: (typeof projects)[number], lang: Lang) {
  const text = p[lang].description;
  const date = p.date.month
    ? `${p.date.year}-${String(p.date.month).padStart(2, '0')}`
    : String(p.date.year);

  return {
    '@type': p.repo ? 'SoftwareSourceCode' : 'CreativeWork',
    name: p.name,
    // Só descrições em texto puro; as que têm marcação (negrito) ficam sem `description`
    // em vez de serem reescritas aqui.
    ...(typeof text === 'string' ? { description: text } : {}),
    dateCreated: date,
    keywords: p.tech.join(', '),
    author: { '@id': personId },
    url: p.caseStudy ? absoluteUrl(p.caseStudy) : (p.repo ?? absoluteUrl('/projetos')),
    ...(p.repo ? { codeRepository: p.repo } : {}),
  };
}

function breadcrumb(route: Route, lang: Lang) {
  const home = routeById('home') as Route;
  const parent = route.parent ? routeById(route.parent) : undefined;
  const trail = [
    { name: home.label[lang], path: home.path },
    ...(parent ? [{ name: parent.label[lang], path: parent.path }] : []),
    { name: route.segment ? route.segment[lang] : route.label[lang], path: route.path },
  ];

  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

// Grafo da página. Home e Sobre são `ProfilePage` (a pessoa é a entidade principal);
// Projetos lista os projetos; as demais são `WebPage` ligadas ao mesmo site e à mesma pessoa.
export function jsonLdFor(routeId: string, lang: Lang) {
  const route = routeById(routeId);

  if (!route) return null;

  const { title, description } = metaFor(routeId, lang);
  const url = absoluteUrl(route.path);
  const profilePage = routeId === 'home' || routeId === 'sobre';
  const page: Record<string, unknown> = {
    '@type': profilePage ? 'ProfilePage' : routeId === 'projetos' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#page`,
    url,
    name: title,
    description,
    inLanguage: lang === 'pt' ? 'pt-BR' : 'en',
    isPartOf: { '@id': websiteId },
    ...(profilePage ? { mainEntity: { '@id': personId } } : { about: { '@id': personId } }),
  };

  if (routeId === 'projetos')
    page.mainEntity = {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: projectNode(p, lang),
      })),
    };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      website(lang),
      person(lang),
      page,
      ...(routeId === 'home' ? [] : [breadcrumb(route, lang)]),
    ],
  };
}
