// Tags do <head> e JSON-LD de cada página (spec 002, TD-025 (b)): só o plugin de build e o
// `useDocumentMeta` (carregado sob demanda) usam este módulo. Ele lê o estado de rascunho de
// `routeStatus.ts` para o `noindex`; `seo.ts` (título, descrição, constantes) não o importa.
import type { Lang } from '../types';
import { profile } from './profile';
import { projects } from './projects';
import { routeById, type Route } from './routes';
import { isDraft } from './routeStatus';
import {
  FULL_NAME,
  NOT_FOUND_ID,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  metaFor,
} from './seo';

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
    routeId === NOT_FOUND_ID || isDraft(routeId)
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
  routeId = route.id;

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
