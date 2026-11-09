#!/usr/bin/env node
// Conta ✅ ◐ ❌ ❔ por prefixo de requisito em docs/sdd-terminal-v2/gap-analysis.md
// e imprime a tabela-resumo pronta para colar. Evita contar à mão.
// Uso: node gap-summary.mjs [caminho/gap-analysis.md]
import { readFileSync } from 'node:fs';

const file = process.argv[2] || 'docs/sdd-terminal-v2/gap-analysis.md';
const lines = readFileSync(file, 'utf8').split('\n');
const marks = { '✅': 0, '◐': 1, '❌': 2, '❔': 3 };
const stats = {};
let ignored = 0;

for (const line of lines) {
  // linha de tabela que começa com um ID tipo ES-01, DS-12
  const m = line.match(/^\|\s*([A-Z]{2})-(\d{2})\b[^|]*\|(.*)$/);
  if (!m) continue;
  const rest = m[3];
  const found = Object.keys(marks).find((k) => rest.includes(k));
  if (!found) { ignored++; console.error(`sem marca de status: ${m[1]}-${m[2]}`); continue; }
  stats[m[1]] ??= [0, 0, 0, 0];
  stats[m[1]][marks[found]]++;
}

console.log('| Grupo | ✅ | ◐ | ❌ | ❔ | Total |');
console.log('| --- | --- | --- | --- | --- | --- |');
const tot = [0, 0, 0, 0];
for (const [g, s] of Object.entries(stats)) {
  s.forEach((n, i) => (tot[i] += n));
  console.log(`| ${g} | ${s.join(' | ')} | ${s.reduce((a, b) => a + b, 0)} |`);
}
console.log(`| **Total** | ${tot.join(' | ')} | ${tot.reduce((a, b) => a + b, 0)} |`);
if (ignored) process.exit(1);
