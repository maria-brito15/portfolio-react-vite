// Mede o gzip do JavaScript e do CSS que o HTML da `/_prova` referencia (spec 002, T5.3, TD-019):
// `<script src>`, `<link rel="modulepreload">` e `<link rel="stylesheet">`, sem repetir arquivo.
// Falha (exit 1) se o JS passar de 100 KB ou o CSS de 20 KB (KB = 1000 bytes, como o `vite build`).
// Uso: `node scripts/measureBundle.mjs dist-prova`.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

export const LIMITS = { js: 100_000, css: 20_000 };
const PAGES = ['_prova.html', 'en/_prova.html'];

/** Arquivos locais (`/static/…`) que o HTML pede, por tipo, sem repetição. */
export function referencedAssets(html) {
  const js = new Set();
  const css = new Set();
  const local = (href) =>
    href && href.startsWith('/') && !href.startsWith('//') ? href : undefined;

  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
    const href = local(m[1]);

    if (href && /\.m?js$/.test(href)) js.add(href);
  }
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = m[0];
    const href = local(tag.match(/\bhref="([^"]+)"/)?.[1]);

    if (!href) continue;
    if (/rel="modulepreload"/.test(tag) && /\.m?js$/.test(href)) js.add(href);
    if (/rel="stylesheet"/.test(tag) && /\.css$/.test(href)) css.add(href);
  }

  return { js: [...js], css: [...css] };
}

const gz = (file) => gzipSync(readFileSync(file)).length;

export function measureHtml(dir, page) {
  const html = readFileSync(join(dir, page), 'utf8');
  const assets = referencedAssets(html);
  const sum = (list) => list.reduce((total, href) => total + gz(join(dir, href)), 0);

  return { page, js: sum(assets.js), css: sum(assets.css), files: assets };
}

export function judge(results, limits = LIMITS) {
  const problems = [];

  for (const r of results) {
    if (r.js > limits.js) problems.push(`${r.page}: JS ${r.js} B gzip > ${limits.js} B`);
    if (r.css > limits.css) problems.push(`${r.page}: CSS ${r.css} B gzip > ${limits.css} B`);
  }

  return problems;
}

export function measureBundle(dir) {
  const results = PAGES.filter((p) => existsSync(join(dir, p))).map((p) => measureHtml(dir, p));

  if (results.length === 0) throw new Error(`${dir}: sem _prova.html (rode npm run build:prova)`);

  return { results, problems: judge(results) };
}

const isMain = Boolean(process.argv[1]) && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
  const dir = process.argv[2] ?? 'dist-prova';
  const { results, problems } = measureBundle(dir);

  for (const r of results) {
    console.log(
      `measureBundle: ${r.page}: JS ${(r.js / 1000).toFixed(1)} KB gzip (${r.files.js.length} arquivos), CSS ${(r.css / 1000).toFixed(1)} KB gzip (${r.files.css.length} arquivos)`,
    );
  }
  for (const p of problems) console.error(`measureBundle: ${p}`);
  console.log(
    problems.length
      ? 'measureBundle: ESTOUROU a meta (parar e propor à Duda, sem editar a meta)'
      : `measureBundle: OK (limites JS ${LIMITS.js / 1000} KB, CSS ${LIMITS.css / 1000} KB)`,
  );
  process.exit(problems.length ? 1 : 0);
}
