// Constantes de SEO e o meta (título e descrição) de cada página, nos dois idiomas. É lido em dois
// lugares:
//  - no navegador, por `useDocumentMeta`, a cada troca de rota ou de idioma;
//  - no build, por `scripts/seoPlugin.ts`, que grava um HTML por rota (o que crawlers que não
//    executam JavaScript, como os de link preview, enxergam), além de sitemap.xml.
//
// O texto de cada página (`title`, `description`) vive na tabela de rotas, `routes.ts` (spec 002,
// FR-009, TD-006): uma fonte só. Aqui fica apenas o meta da página 404, que não é uma rota. As tags
// do <head> (inclusive `hreflang`) e o JSON-LD estão em seoHead.ts.

import type { Lang, Localized } from '../types';
import { normalizePath, routeById } from './routes';

export const SITE_URL = 'https://mariabdev.netlify.app';
export const SITE_NAME = 'Duda Brito';
export const FULL_NAME = 'Maria Eduarda de Paula Brito';
export const OG_IMAGE = '/assets/og-image.png';
export const NOT_FOUND_ID = 'notFound';

export interface PageMeta {
  title: string;
  description: string;
}

// A 404 não tem rota (qualquer endereço desconhecido a mostra), então seu meta mora aqui.
const NOT_FOUND_META: Localized<PageMeta> = {
  pt: {
    title: 'Página não encontrada | Duda Brito',
    description: 'Esta página não existe. Volte ao terminal do portfólio de Duda Brito.',
  },
  en: {
    title: 'Page not found | Duda Brito',
    description: "This page doesn't exist. Go back to Duda Brito's portfolio terminal.",
  },
};

// Título e descrição da rota, lidos da tabela. Qualquer id sem rota (a 404) cai no meta da 404.
export const metaFor = (id: string, lang: Lang): PageMeta => {
  const route = id === NOT_FOUND_ID ? undefined : routeById(id);

  if (!route) return NOT_FOUND_META[lang];

  return { title: route.title[lang], description: route.description[lang] };
};

export const absoluteUrl = (path: string) => `${SITE_URL}${normalizePath(path)}`;
