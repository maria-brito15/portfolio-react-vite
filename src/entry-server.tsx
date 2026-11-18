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
import { escapeHtml, headBlock } from './data/seoDocument';
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
  // `progressiveChunkSize` enorme: sem ele o React tira de dentro do `<main>` os trechos acima de
  // ~12,8 KB (`<template id="B:0">` + bloco escondido + script inline), e quem não roda JavaScript
  // veria a página vazia (FR-028).
  const { prelude } = await prerender(
    <RouterProvider initial={path}>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </RouterProvider>,
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
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

const HEAD = /<!-- seo:head -->[\s\S]*?<!-- \/seo:head -->/;
const BODY = /<!-- seo:body -->[\s\S]*?<!-- \/seo:body -->/;
const ROOT = '<div id="root"></div>';

export interface AssembleInput {
  /** `dist/index.html` do build do cliente (com o boot, o CSS e o script já injetados). */
  template: string;
  rendered: RenderedRoute;
  /** Caminhos (`/static/…js`) dos chunks da rota, para `<link rel="modulepreload">`. */
  preload?: string[];
  /** Folhas de estilo dos chunks da rota (`/static/…css`), para a página não piscar sem estilo. */
  styles?: string[];
}

export function assembleDocument({
  template,
  rendered,
  preload = [],
  styles = [],
}: AssembleInput): string {
  const { routeId, lang, bare, html } = rendered;

  if (!template.includes(ROOT)) throw new Error('o template não tem <div id="root"></div>');

  const links = [
    ...preload.map((href) => `<link rel="modulepreload" href="${escapeHtml(href)}" />`),
    ...styles.map((href) => `<link rel="stylesheet" crossorigin href="${escapeHtml(href)}" />`),
  ];
  const attrs = `lang="${lang === 'pt' ? 'pt-BR' : 'en'}"${bare ? ' data-shell="bare"' : ''}`;

  return template
    .replace(/<html[^>]*>/, `<html ${attrs}>`)
    .replace(HEAD, () => [headBlock(routeId, lang), ...links].join('\n    '))
    .replace(BODY, '')
    .replace(ROOT, () => `<div id="root">${html}</div>`);
}
