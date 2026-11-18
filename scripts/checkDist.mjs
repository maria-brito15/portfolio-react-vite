// Confere o `dist` real depois do `vite build` (spec 002, T4.2, FR-028): todo HTML tem `<main>` e
// um só `<h1>`; os arquivos essenciais existem (home e 404 nos dois idiomas, terminal); todo
// `hreflang` aponta para um arquivo que existe; `data-shell="bare"` só no terminal; nada sobrou de
// `.vite/` nem de `.prerender/`. Uso: `node scripts/checkDist.mjs dist` (sai 0 sem problema).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRED = [
  'index.html',
  'en.html',
  '404.html',
  'en/404.html',
  'terminal.html',
  'en/terminal.html',
];
const BARE_FILES = new Set(['terminal.html', 'en/terminal.html']);

function htmlFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);

    if (statSync(full).isDirectory())
      return name === 'static' || name === 'assets' ? [] : htmlFiles(full, base);

    return name.endsWith('.html') ? [relative(base, full).split(sep).join('/')] : [];
  });
}

// Mesmo mapa de scripts/prerender.ts (`/` → index.html, `/en` → en.html, `/en/about` → en/about.html).
export function fileForPath(path) {
  const clean = path.replace(/\/+$/, '');

  return clean === '' ? 'index.html' : `${clean.slice(1)}.html`;
}

export function checkDist(dist) {
  const problems = [];

  if (!existsSync(dist)) return [`${dist}: pasta inexistente`];

  const files = htmlFiles(dist);

  for (const required of REQUIRED)
    if (!files.includes(required)) problems.push(`${required}: não foi gerado`);
  for (const leftover of ['.vite']) {
    if (existsSync(join(dist, leftover))) problems.push(`dist/${leftover}: sobrou do build`);
  }

  for (const file of files) {
    const html = readFileSync(join(dist, file), 'utf8');
    const h1 = [...html.matchAll(/<h1[ >]/g)].length;
    const main = [...html.matchAll(/<main[ >]/g)].length;

    if (main !== 1) problems.push(`${file}: ${main} <main> (esperado 1)`);
    if (h1 !== 1) problems.push(`${file}: ${h1} <h1> (esperado 1)`);

    const bare = /<html[^>]*data-shell="bare"/.test(html);

    if (bare !== BARE_FILES.has(file))
      problems.push(`${file}: data-shell="bare" ${bare ? 'presente' : 'ausente'} fora do esperado`);

    for (const m of html.matchAll(
      /<link rel="alternate" hreflang="([^"]+)" href="https?:\/\/[^/]+(\/[^"]*)"/g,
    )) {
      if (!existsSync(join(dist, fileForPath(m[2]))))
        problems.push(`${file}: hreflang ${m[1]} aponta para ${m[2]}, que não existe`);
    }

    if (/<template id="B:|id="S:\d+"|\$R[CSX]\(|<!--\$\?-->/.test(html))
      problems.push(
        `${file}: trecho adiado pelo React (conteúdo fora do lugar, some sem JavaScript)`,
      );
    if (!/<main[^>]*>[\s\S]*<h1[ >][\s\S]*<\/main>/.test(html))
      problems.push(`${file}: o <h1> não está dentro do <main>`);

    if (!/<div id="root"><(?!\/div>)/.test(html))
      problems.push(`${file}: #root vazio (sem pré-render)`);
  }

  return problems;
}

const isMain = Boolean(process.argv[1]) && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain && process.argv[2]) {
  const problems = checkDist(process.argv[2]);

  for (const p of problems) console.error(`checkDist: ${p}`);
  console.log(
    problems.length
      ? `checkDist: ${problems.length} problema(s)`
      : `checkDist: OK (${htmlFiles(process.argv[2]).length} páginas)`,
  );
  process.exit(problems.length ? 1 : 0);
}
