// Pedaços do documento HTML que não dependem de React: o escape, a tag do <head> e o bloco
// `seo:head` de uma rota. Usado pelo plugin de build (que o carrega no config do Vite, onde não
// pode entrar React nem CSS) e pelo `entry-server`.
import type { Lang } from '../types';
import { headTags, jsonLdFor, type HeadTag } from './seoHead';

export const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const renderTag = ({ tag, attrs }: HeadTag) =>
  `<${tag} ${Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ')} />`;

export function headBlock(routeId: string, lang: Lang): string {
  const { title, tags } = headTags(routeId, lang);
  const graph = jsonLdFor(routeId, lang);
  // `<` escapado: nada dentro do JSON pode fechar a tag <script>.
  const json = graph ? JSON.stringify(graph).replace(/</g, '\u003c') : '';

  return [
    '<!-- seo:head -->',
    `<title>${escapeHtml(title)}</title>`,
    ...tags.map(renderTag),
    ...(json ? [`<script id="ld-json" type="application/ld+json">${json}</script>`] : []),
    '<!-- /seo:head -->',
  ].join('\n    ');
}
