#!/usr/bin/env node
// Varredura rápida das regras "mecânicas" do projeto, sem rodar o app.
// Uso: node sweep.mjs [raiz-do-repo]  → sai com 1 se alguma regra for violada.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] || '.';
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    if (f === 'node_modules' || f === 'dist') return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const src = join(root, 'src');
const files = walk(src);
const read = (p) => readFileSync(p, 'utf8');
const problems = [];
const warnings = [];
const add = (rule, p, detail) => problems.push(`[${rule}] ${relative(root, p)}${detail ? ': ' + detail : ''}`);

const css = files.filter((f) => f.endsWith('.css'));
const code = files.filter((f) => /\.(jsx?|css)$/.test(f) && !/\.test\./.test(f));

// 1. um só estilo visual
for (const f of code) {
  const t = read(f);
  if (/Syne|DM Sans/.test(t)) add('fonte', f, 'Syne/DM Sans');
  if (/--grad-text|--grad-warm|background-clip:\s*text/.test(t)) add('degradê', f, 'texto em degradê');
}
for (const name of ['original.css', 'portfolio.css'])
  if (files.some((f) => f.endsWith('/' + name))) add('css-legado', join(src, 'styles', name), 'deveria ter sido removido');

// 2. variáveis CSS usadas e nunca definidas
const defined = new Set();
for (const f of css) for (const [, v] of read(f).matchAll(/(--[\w-]+)\s*:/g)) defined.add(v);
for (const f of css)
  for (const [, v] of read(f).matchAll(/var\((--[\w-]+)/g))
    if (!defined.has(v)) add('var-css', f, `${v} usada e não definida`);

// 3. caminhos escritos à mão fora da tabela de rotas
const routeFile = join(src, 'data', 'routes.js');
for (const f of files.filter((x) => /\.jsx?$/.test(x) && !/\.test\./.test(x) && x !== routeFile)) {
  const t = read(f);
  for (const m of t.matchAll(/['"`]\/(curriculo|academico|servicos|projetos|experiencias|contato)\b/g))
    warnings.push(`[rota-fixa] ${relative(root, f)}: ${m[0].slice(1)}"`.replace(/"$/, '') + ' escrito à mão (prefira routes.js)');
}

// 4. arquivo de teste solto / .only esquecido
for (const f of files.filter((x) => /\.test\.jsx?$/.test(x)))
  if (/\b(it|test|describe)\.only\(/.test(read(f))) add('teste', f, '.only esquecido');

// 5. SDD presente
if (!existsSync(join(root, 'docs', 'sdd-terminal-v2', 'gap-analysis.md')))
  problems.push('[sdd] docs/sdd-terminal-v2/gap-analysis.md não existe');

if (warnings.length) console.log('Avisos (não reprovam; confira se são links legítimos):\n' + warnings.join('\n') + '\n');
if (problems.length) { console.log(problems.join('\n')); console.log(`\n${problems.length} problema(s).`); process.exit(1); }
console.log('Varredura limpa: estilo único, variáveis CSS, rotas, testes e SDD.');
