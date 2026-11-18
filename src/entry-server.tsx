// Pré-render (spec 002, TD-008, FR-028). Dois exports, usados pelo plugin de build (T4.2) e pelos
// testes (scripts/prerender.test.ts):
//  - `renderRoute(path)`: o HTML da árvore de React da rota, com o `lazy` já resolvido;
//  - `assembleDocument(...)`: o documento inteiro a partir do `index.html` gerado pelo Vite
//    (`<head>` da rota, `lang`, `hreflang`, boot, `modulepreload`, `data-shell` e o `#root`).
// Nada daqui lê `window`, `localStorage` nem `matchMedia`: a casca e as páginas só leem dado
// determinístico (URL, tabela de rotas, textos), senão a hidratação divergiria do HTML.
import { prerender } from 'react-dom/static';
import App from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './hooks/useTheme';
import { RouterProvider } from './router';
import { NOT_FOUND_ID } from './data/seo';
import { headTags, jsonLdFor, type HeadTag } from './data/seoHead';
import { findPageByPath, langOfPath } from './data/routes';
import type { Lang } from './types';

export interface RenderedRoute {
  /** Id da rota na tabela; `notFound` para um endereço que não existe. */
  routeId: string;
  lang: Lang;
  /** `404` só para a página de erro; as demais, `200`. */
  status: 200 | 404;
  /** A rota é "sem casca" (hoje só o terminal): o `<html>` leva `data-shell="bare"`. */
  bare: boolean;
  /** HTML de dentro do `#root`. */
  html: string;
}

export async function renderRoute(path: string): Promise<RenderedRoute> {
  const route = findPageByPath(path);
  const lang = langOfPath(path);
  const { prelude } = await prerender(
    <RouterProvider initial={path}>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </RouterProvider>,
  );

  return {
    routeId: route?.id ?? NOT_FOUND_ID,
    lang,
    status: route ? 200 : 404,
    bare: Boolean(route?.bare),
    html: await new Response(prelude).text(),
  };
}

// ---------------------------------------------------------------- montador do documento

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const renderTag = ({ tag, attrs }: HeadTag) =>
  `<${tag} ${Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ')} />`;

const HEAD = /<!-- seo:head -->[\s\S]*?<!-- \/seo:head -->/;
const BODY = /<!-- seo:body -->[\s\S]*?<!-- \/seo:body -->/;
const ROOT = '<div id="root"></div>';

export function headBlock(routeId: string, lang: Lang): string {
  const { title, tags } = headTags(routeId, lang);
  const graph = jsonLdFor(routeId, lang);
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

export interface AssembleInput {
  /** `dist/index.html` do build do cliente (com o boot, o CSS e o script já injetados). */
  template: string;
  rendered: RenderedRoute;
  /** Caminhos (`/static/…js`) dos chunks da rota, para `<link rel="modulepreload">`. */
  preload?: string[];
}

export function assembleDocument({ template, rendered, preload = [] }: AssembleInput): string {
  const { routeId, lang, bare, html } = rendered;

  if (!template.includes(ROOT)) throw new Error('o template não tem <div id="root"></div>');

  const links = preload.map((href) => `<link rel="modulepreload" href="${escapeHtml(href)}" />`);
  const attrs = `lang="${lang === 'pt' ? 'pt-BR' : 'en'}"${bare ? ' data-shell="bare"' : ''}`;

  return template
    .replace(/<html[^>]*>/, `<html ${attrs}>`)
    .replace(HEAD, () => [headBlock(routeId, lang), ...links].join('\n    '))
    .replace(BODY, '')
    .replace(ROOT, () => `<div id="root">${html}</div>`);
}
