// Plugin do Vite: SEO estático. O site é uma SPA, então o index.html chega vazio e
// crawlers que não executam JavaScript (LinkedIn, WhatsApp, Discord, X) não veriam
// título, descrição nem imagem de cada página. Este plugin:
//  - injeta no index.html o <head> da home (também no `npm run dev`);
//  - no build, grava um HTML por rota (`dist/sobre.html`, `dist/projetos.html`…)
//    com título, canonical, Open Graph, Twitter Card e JSON-LD próprios, e um
//    <noscript> com texto e links internos para quem não roda JavaScript;
//  - grava `dist/sitemap.xml` e `dist/404.html` (a Netlify serve este arquivo com
//    status 404 para qualquer endereço que não exista);
// Tudo sai de src/data/seo.ts e src/data/routes.ts; o React continua assumindo a
// página normalmente depois de carregar.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import { routes } from '../src/data/routes';
import {
  NOT_FOUND_ID,
  SITE_URL,
  absoluteUrl,
  headTags,
  jsonLdFor,
  metaFor,
  type HeadTag,
} from '../src/data/seo';

const HEAD = /<!-- seo:head -->[\s\S]*?<!-- \/seo:head -->/;
const BODY = /<!-- seo:body -->[\s\S]*?<!-- \/seo:body -->/;

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const renderTag = ({ tag, attrs }: HeadTag) =>
  `<${tag} ${Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
    .join(' ')} />`;

function headBlock(routeId: string) {
  const { title, tags } = headTags(routeId, 'pt');
  const graph = jsonLdFor(routeId, 'pt');
  // `<` escapado: nada dentro do JSON pode fechar a tag <script>.
  const json = graph ? JSON.stringify(graph).replace(/</g, '\\u003c') : '';

  return [
    '<!-- seo:head -->',
    `<title>${escapeHtml(title)}</title>`,
    ...tags.map(renderTag),
    ...(json ? [`<script id="ld-json" type="application/ld+json">${json}</script>`] : []),
    '<!-- /seo:head -->',
  ].join('\n    ');
}

// Conteúdo para quem não executa JavaScript: tema da página e links internos.
function bodyBlock(routeId: string) {
  const { title, description } = metaFor(routeId, 'pt');
  const links = routes
    .filter((r) => r.id !== 'home' && !r.hidden && !r.draft)
    .map((r) => `<li><a href="${r.path}">${escapeHtml(r.label.pt)}</a></li>`)
    .join('');

  return [
    '<!-- seo:body -->',
    '<noscript>',
    `<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p>`,
    '<p>Este portfólio é um terminal interativo e precisa de JavaScript. As páginas abaixo também podem ser abertas diretamente:</p>',
    `<nav aria-label="Páginas"><ul>${links}</ul></nav></main>`,
    '</noscript>',
    '<!-- /seo:body -->',
  ].join('');
}

const withRoute = (html: string, routeId: string) =>
  html.replace(HEAD, () => headBlock(routeId)).replace(BODY, () => bodyBlock(routeId));

export function seoPlugin(): Plugin {
  let outDir = 'dist';

  return {
    name: 'portfolio-seo',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir);
    },
    transformIndexHtml: (html) => withRoute(html, 'home'),
    closeBundle() {
      const template = readFileSync(join(outDir, 'index.html'), 'utf8');
      const write = (file: string, content: string) => {
        mkdirSync(dirname(join(outDir, file)), { recursive: true });
        writeFileSync(join(outDir, file), content);
      };

      // `/sobre` e `/about` (alias) viram arquivos próprios; o alias aponta, por
      // canonical, para o caminho principal. `.html` em vez de pasta/index.html:
      // a Netlify serve `/sobre` sem redirecionar para `/sobre/`.
      for (const route of routes) {
        if (route.id === 'home') continue;
        for (const path of [route.path, ...(route.aliases ?? [])])
          write(`${path.slice(1)}.html`, withRoute(template, route.id));
      }

      write('404.html', withRoute(template, NOT_FOUND_ID));

      // Páginas em construção não entram no sitemap (o HTML delas sai com noindex).
      const urls = routes
        .filter((r) => !r.draft)
        .map((r) => `  <url><loc>${absoluteUrl(r.path)}</loc></url>`);

      write(
        'sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      );
      write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}
