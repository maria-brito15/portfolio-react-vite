#!/usr/bin/env node
// Compara as chaves de ui.pt e ui.en (src/i18n/ui.js) e lista o que falta de cada lado.
// Uso: node check-i18n.mjs [caminho/ui.js]   → sai com 1 se houver divergência.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const file = resolve(process.argv[2] || 'src/i18n/ui.js');
const { ui } = await import(pathToFileURL(file).href);

const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [`${p}${k}`]);

const pt = new Set(flat(ui.pt));
const en = new Set(flat(ui.en));
const onlyPt = [...pt].filter((k) => !en.has(k));
const onlyEn = [...en].filter((k) => !pt.has(k));

// o tipo (string x função x array) também precisa casar
const get = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);
const kind = (v) => (typeof v === 'function' ? 'fn' : Array.isArray(v) ? 'arr' : typeof v);
const mismatch = [...pt].filter((k) => en.has(k) && kind(get(ui.pt, k)) !== kind(get(ui.en, k)));

console.log(`PT: ${pt.size} chaves · EN: ${en.size} chaves`);
if (onlyPt.length) console.log('\nSó em PT:\n  ' + onlyPt.join('\n  '));
if (onlyEn.length) console.log('\nSó em EN:\n  ' + onlyEn.join('\n  '));
if (mismatch.length) console.log('\nTipo diferente entre PT e EN:\n  ' + mismatch.join('\n  '));
const bad = onlyPt.length + onlyEn.length + mismatch.length;
console.log(bad ? `\n${bad} divergência(s).` : '\nPT e EN estão em paridade.');
process.exit(bad ? 1 : 0);
