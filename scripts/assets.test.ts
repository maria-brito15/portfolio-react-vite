// T1.4 (FR-029, FR-030, TD-016): fontes só do próprio site, no máximo duas famílias e quatro arquivos,
// `font-display: swap`, licença e atribuição registradas, nenhuma URL externa em CSS nem no HTML-fonte.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const stylesDir = join(root, 'src', 'styles');
const fontsDir = join(root, 'public', 'fonts');
const sheets = readdirSync(stylesDir)
  .filter((f) => f.endsWith('.css'))
  .map((f): [string, string] => [f, readFileSync(join(stylesDir, f), 'utf8')]);
const tokens = sheets.find(([name]) => name === 'tokens.css')?.[1] ?? '';
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const fontFiles = readdirSync(fontsDir).filter((f) => /\.(woff2?|ttf|otf|eot)$/i.test(f));

const faces = [...tokens.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body]) => body);
const family = (body: string) => body.match(/font-family:\s*'([^']+)'/)?.[1] ?? '';
const urls = (body: string) =>
  [...body.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);
const hostedFaces = faces.filter((body) => urls(body).length > 0);

describe('fontes próprias (FR-029, FR-030)', () => {
  it('no máximo duas famílias hospedadas e quatro arquivos de fonte', () => {
    const families = new Set(hostedFaces.map(family));

    expect([...families].sort()).toEqual(['IBM Plex Mono', 'IBM Plex Sans']);
    expect(families.size).toBeLessThanOrEqual(2);
    expect(fontFiles.length).toBeLessThanOrEqual(4);
    expect(fontFiles).toHaveLength(3);
  });

  it('cada @font-face com arquivo tem font-display: swap', () => {
    expect(hostedFaces.length).toBeGreaterThanOrEqual(3);

    for (const body of hostedFaces) {
      expect(body, family(body)).toMatch(/font-display:\s*swap/);
    }
  });

  it('cada fonte vem de /fonts/ do próprio site e o arquivo existe e é WOFF2', () => {
    for (const body of hostedFaces) {
      for (const url of urls(body)) {
        expect(url, url).toMatch(/^\/fonts\/[\w.-]+\.woff2$/);
        expect(existsSync(join(root, 'public', url)), url).toBe(true);
      }
      expect(body).toMatch(/unicode-range:/);
    }
  });

  it('todo arquivo de fonte de public/fonts é usado por algum @font-face', () => {
    const used = new Set(hostedFaces.flatMap(urls).map((u) => u.replace('/fonts/', '')));

    expect([...used].sort()).toEqual([...fontFiles].sort());
  });

  it('as fontes reservas ajustadas usam só fontes locais, sem arquivo', () => {
    const fallbacks = faces.filter((body) => /Fallback/.test(family(body)));

    expect(fallbacks.length).toBeGreaterThanOrEqual(2);

    for (const body of fallbacks) {
      expect(urls(body), family(body)).toEqual([]);
      expect(body).toMatch(/src:\s*local\(/);
      expect(body).toMatch(/size-adjust:/);
    }
  });

  it('nenhuma URL externa em CSS nem no HTML-fonte (sem pedido a terceiros)', () => {
    for (const [name, css] of sheets) {
      expect(css, name).not.toMatch(/https?:\/\//);
      expect(css, name).not.toMatch(/@import/);
      expect(css, name).not.toMatch(/url\(\s*['"]?\/\//);
    }
    expect(indexHtml).not.toMatch(/(?:href|src)=["'](?:https?:)?\/\//);
    expect(indexHtml).not.toMatch(/fonts\.(googleapis|gstatic)|use\.typekit|cdnjs|jsdelivr|unpkg/i);
  });

  it('as fontes anteriores (JetBrains Mono) não estão mais no repositório', () => {
    expect(fontFiles.filter((f) => /jetbrains/i.test(f))).toEqual([]);
    expect(tokens).not.toMatch(/JetBrains/i);
    expect(indexHtml).not.toMatch(/jetbrains/i);
  });

  it('os preloads do index.html apontam para arquivos que existem e são as 3 fontes', () => {
    const preloads = [...indexHtml.matchAll(/rel="preload"\s+href="([^"]+)"/g)].map((m) => m[1]);

    expect(preloads.sort()).toEqual(fontFiles.map((f) => `/fonts/${f}`).sort());

    for (const href of preloads) {
      expect(existsSync(join(root, 'public', href)), href).toBe(true);
    }
  });
});

describe('licença e atribuição das fontes (conventions: todo ativo externo)', () => {
  const license = readFileSync(join(fontsDir, 'LICENSE-IBM-Plex.txt'), 'utf8');

  it('registra autor, licença OFL 1.1, origem oficial, data e o texto completo', () => {
    expect(license).toMatch(/SIL Open Font License,? Version 1\.1/i);
    expect(license).toMatch(/IBM Corp/);
    expect(license).toMatch(/github\.com\/ibm\/plex/i);
    expect(license).toMatch(/@ibm\/plex-sans 1\.1\.0/);
    expect(license).toMatch(/@ibm\/plex-mono 2\.5\.0/);
    expect(license).toMatch(/2026-11-17/);
    expect(license).toMatch(/PERMISSION & CONDITIONS/);
  });

  it('cita cada arquivo de fonte do diretório, com o tamanho real em bytes', () => {
    for (const file of fontFiles) {
      const size = statSync(join(fontsDir, file)).size;

      expect(license, file).toContain(file);
      expect(license, `${file} (${size} bytes)`).toMatch(new RegExp(`${file}\\s+${size}\\b`));
    }
  });
});
