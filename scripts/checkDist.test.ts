// T4.2: `checkDist.mjs` confere o dist real. Aqui, contra pastas montadas à mão.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checkDist, fileForPath } from './checkDist.mjs';

const BASE = 'https://exemplo.test';
const page = (
  opts: { h1?: number; main?: number; bare?: boolean; alt?: string[]; root?: boolean } = {},
) => {
  const { h1 = 1, main = 1, bare = false, alt = [], root = true } = opts;

  return [
    `<html lang="pt-BR"${bare ? ' data-shell="bare"' : ''}><head>`,
    ...alt.map((href) => `<link rel="alternate" hreflang="en" href="${BASE}${href}" />`),
    '</head><body>',
    root
      ? `<div id="root"><div>x</div>${'<main>'.repeat(main)}${'<h1>t</h1>'.repeat(h1)}</div>`
      : '<div id="root"></div>',
    '</body></html>',
  ].join('');
};

const ESSENTIAL: Record<string, string> = {
  'index.html': page({ alt: ['/en'] }),
  'en.html': page({ alt: ['/'] }),
  '404.html': page(),
  'en/404.html': page(),
  'terminal.html': page({ bare: true }),
  'en/terminal.html': page({ bare: true }),
};

const made: string[] = [];

function dist(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'checkdist-'));

  made.push(root);
  for (const [file, html] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), html);
  }

  return root;
}

afterAll(() => made.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

describe('checkDist', () => {
  it('um dist completo não tem problema', () => {
    expect(checkDist(dist(ESSENTIAL))).toEqual([]);
  });

  it('acusa página sem <h1>, com dois <h1> ou sem <main>', () => {
    const problems = checkDist(
      dist({
        ...ESSENTIAL,
        'a.html': page({ h1: 0 }),
        'b.html': page({ h1: 2 }),
        'c.html': page({ main: 0 }),
      }),
    );

    expect(problems).toContain('a.html: 0 <h1> (esperado 1)');
    expect(problems).toContain('b.html: 2 <h1> (esperado 1)');
    expect(problems).toContain('c.html: 0 <main> (esperado 1)');
  });

  it('acusa arquivo essencial ausente e #root vazio', () => {
    const rest = Object.fromEntries(
      Object.entries(ESSENTIAL).filter(([file]) => file !== 'en/404.html'),
    );
    const problems = checkDist(dist({ ...rest, 'd.html': page({ root: false }) }));

    expect(problems).toContain('en/404.html: não foi gerado');
    expect(problems.some((p) => p.startsWith('d.html: #root vazio'))).toBe(true);
  });

  it('acusa hreflang que aponta para arquivo inexistente', () => {
    const problems = checkDist(dist({ ...ESSENTIAL, 'e.html': page({ alt: ['/en/nao-existe'] }) }));

    expect(problems).toContain('e.html: hreflang en aponta para /en/nao-existe, que não existe');
  });

  it('data-shell="bare" só no terminal', () => {
    const problems = checkDist(
      dist({ ...ESSENTIAL, 'f.html': page({ bare: true }), 'terminal.html': page() }),
    );

    expect(problems.some((p) => p.startsWith('f.html: data-shell="bare" presente'))).toBe(true);
    expect(problems.some((p) => p.startsWith('terminal.html: data-shell="bare" ausente'))).toBe(
      true,
    );
  });

  it('acusa .vite/ que sobrou e pasta inexistente', () => {
    const root = dist(ESSENTIAL);

    mkdirSync(join(root, '.vite'));
    expect(checkDist(root)).toContain('dist/.vite: sobrou do build');
    expect(checkDist(join(root, 'nao-existe'))[0]).toMatch(/pasta inexistente/);
  });

  it('fileForPath é o mesmo mapa do plugin', () => {
    expect(fileForPath('/')).toBe('index.html');
    expect(fileForPath('/en')).toBe('en.html');
    expect(fileForPath('/en/about')).toBe('en/about.html');
  });
});
