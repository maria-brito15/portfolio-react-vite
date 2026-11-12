#!/usr/bin/env node
// Contraste WCAG AA dos tokens de src/styles/tokens.css (os cinco temas).
// Uso: node contrast.mjs [caminho/tokens.css]   → sai com 1 se algum par reprovar.
import { readFileSync } from 'node:fs';

const file = process.argv[2] || 'src/styles/tokens.css';
const css = readFileSync(file, 'utf8');

function block(re) {
  const m = css.match(re);
  const vars = {};
  if (m) for (const [, k, v] of m[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\b/g)) vars[k] = v;
  return vars;
}
const dark = block(/:root\s*\{([\s\S]*?)\n\}/);
const extra = (id) => ({
  ...dark,
  ...block(new RegExp(String.raw`\[data-theme='${id}'\]\s*\{([\s\S]*?)\n\}`)),
});
const light = extra('light');

const lum = (hex) => {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [primeiro plano, fundo, mínimo]: 4.5 texto normal; 3 só para elementos gráficos/dim decorativo
const pairs = [
  ['text', 'surface', 4.5], ['text-2', 'surface', 4.5], ['dim', 'surface', 4.5],
  ['accent', 'surface', 4.5], ['ok', 'surface', 4.5], ['warn', 'surface', 4.5], ['err', 'surface', 4.5],
  ['text', 'surface-2', 4.5], ['dim', 'surface-2', 4.5], ['accent', 'surface-2', 4.5],
  ['ok', 'surface-2', 4.5], ['warn', 'surface-2', 4.5], ['err', 'surface-2', 4.5],
  ['text', 'bg', 4.5], ['on-accent', 'accent', 4.5],
  // contorno de campo/seletor (WCAG 1.4.11, não-texto essencial): 3:1
  ['border-ui', 'bg', 3], ['border-ui', 'surface', 3], ['border-ui', 'surface-2', 3], ['border-ui', 'surface-3', 3],
  ['err', 'bg', 4.5],
  ...['accent-2', 'info', 'c-violet', 'c-mint', 'c-amber', 'c-coral', 'c-cyan', 'c-pink'].flatMap((n) =>
    ['bg', 'surface', 'surface-2', 'surface-3'].map((b) => [n, b, 4.5])),
];
let fail = 0;
for (const [name, theme] of [['escuro', dark], ['claro', light], ['dracula', extra('dracula')], ['solarized', extra('solarized')], ['âmbar', extra('amber')]]) {
  console.log(`\n# tema ${name}`);
  for (const [fg, bg, min] of pairs) {
    if (!theme[fg] || !theme[bg]) { console.log(`  ?  --${fg} / --${bg}: token ausente`); continue; }
    const r = ratio(theme[fg], theme[bg]);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok ' : 'XX '} --${fg} sobre --${bg}: ${r.toFixed(2)}:1 (mín ${min})`);
  }
}
console.log(fail ? `\n${fail} par(es) reprovado(s).` : '\nTodos os pares passam AA.');
process.exit(fail ? 1 : 0);
