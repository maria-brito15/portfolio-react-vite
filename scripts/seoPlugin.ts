// Plugin do Vite: SEO estático e pré-render. O site é uma SPA, então o index.html chega vazio e
// crawlers que não executam JavaScript (LinkedIn, WhatsApp, Discord, X) não veriam título,
// descrição nem imagem de cada página; e quem abre sem JavaScript não veria conteúdo. Este plugin:
//  - injeta no index.html o script de boot e o <head> da home (também no `npm run dev`);
//  - no build, em `closeBundle`, pré-renderiza cada rota × idioma (scripts/prerender.ts, spec 002,
//    TD-008): um HTML por endereço (`dist/sobre.html`, `dist/en/about.html`, `dist/en.html`…) com o
//    conteúdo da página, o <head> próprio (título, canonical, hreflang, Open Graph, JSON-LD) e
//    `dist/404.html` e `dist/en/404.html` (a Netlify os serve com status 404);
//  - grava `dist/sitemap.xml` e `dist/robots.txt`.
// Tudo sai de src/data/seo.ts e src/data/routes.ts; o React hidrata a página depois de carregar.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import { bootSource } from '../src/boot/boot';
import { routes } from '../src/data/routes';
import { SITE_URL, absoluteUrl } from '../src/data/seo';
import { headBlock } from '../src/data/seoDocument';
import { isDraft } from '../src/data/routeStatus';
import { prerenderSite } from './prerender';

const HEAD = /<!-- seo:head -->[\s\S]*?<!-- \/seo:head -->/;

// Script de boot (tema e faixa de idioma) no lugar do marcador: síncrono, antes do CSS e do
// JavaScript do site, para o tema valer no primeiro desenho (FR-005). O texto vem de um único
// módulo (src/boot/boot.ts); aqui só se insere.
const BOOT = '<!-- boot:script -->';
const withBoot = (html: string) =>
  html.replace(BOOT, () => `<script id="boot">\n${bootSource()}\n    </script>`);

const withHead = (html: string, routeId: string) =>
  html.replace(HEAD, () => headBlock(routeId, 'pt'));

export function seoPlugin(): Plugin {
  let root = process.cwd();
  let outDir = 'dist';
  let define: Record<string, unknown> = {};

  return {
    name: 'portfolio-seo',
    configResolved(config) {
      root = config.root;
      outDir = join(config.root, config.build.outDir);
      define = config.define ?? {};
    },
    transformIndexHtml: (html) => withHead(withBoot(html), 'home'),
    async closeBundle() {
      // O build de servidor aninhado não usa este plugin (`configFile: false`); o guarda é só um
      // cinto de segurança contra recursão.
      if (this.environment?.config?.build?.ssr) return;

      await prerenderSite({ root, outDir, define });

      const write = (file: string, content: string) => {
        mkdirSync(dirname(join(outDir, file)), { recursive: true });
        writeFileSync(join(outDir, file), content);
      };

      // Páginas em construção não entram no sitemap (o HTML delas sai com noindex).
      const urls = routes
        .filter((r) => !isDraft(r.id))
        .map((r) => `  <url><loc>${absoluteUrl(r.path)}</loc></url>`);

      write(
        'sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      );
      write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}
