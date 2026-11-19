// Utilitários do lado ANTIGO da equivalência (003, TD-009).
import { Fragment, createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const ENTITIES: readonly (readonly [string, string])[] = [
  ['&#x27;', "'"],
  ['&#39;', "'"],
  ['&quot;', '"'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&nbsp;', ' '],
  // `&amp;` por último: decodificá-lo antes recriaria entidades já resolvidas.
  ['&amp;', '&'],
];

/**
 * `ReactNode` antigo -> texto com `**negrito**`. Texto puro volta como está (não é renderizado, então
 * não ganha entidades). Qualquer marcação além de `<strong>` falha: o design só tem `**negrito**` (D5).
 */
export function richToText(node: ReactNode): string {
  if (typeof node === 'string') return node;

  const html = renderToStaticMarkup(createElement(Fragment, null, node));
  const text = html.replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**');
  const other = /<\/?[A-Za-z][^>]*>/.exec(text);

  if (other) {
    throw new Error(`marcação sem equivalente no conteúdo novo: ${other[0]} (só <strong> migra)`);
  }

  return ENTITIES.reduce((acc, [entity, char]) => acc.split(entity).join(char), text);
}
