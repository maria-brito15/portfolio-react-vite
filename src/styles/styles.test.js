import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Um só estilo: terminal/IDE, uma família de fonte, sem degradê em texto.
const dir = join(process.cwd(), 'src', 'styles');
const sheets = readdirSync(dir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => [f, readFileSync(join(dir, f), 'utf8')]);
const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

describe('pele única', () => {
  it('não sobra Syne, DM Sans nem degradê de texto', () => {
    for (const [name, css] of [...sheets, ['index.html', indexHtml]]) {
      expect(css, name).not.toMatch(/Syne|DM[ +]Sans|grad-text|grad-warm|background-clip/i);
    }
  });

  it('a única família de fonte declarada é o mono dos tokens', () => {
    for (const [name, css] of sheets) {
      const families = [...css.matchAll(/font-family:\s*([^;]+);/g)].map((m) => m[1].trim());
      for (const family of families) {
        const ok =
          name === 'tokens.css' ? /JetBrains Mono/.test(family) : family === 'var(--font-mono)';
        expect(ok, `${name}: ${family}`).toBe(true);
      }
    }
  });

  it('não existem os CSS do "mundo marketing"', () => {
    const names = sheets.map(([name]) => name);
    expect(names).not.toContain('original.css');
    expect(names).not.toContain('portfolio.css');
  });

  it('as cores vêm dos tokens: toda variável usada está definida', () => {
    const all = sheets.map(([, css]) => css).join('\n');
    const used = new Set([...all.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
    const defined = new Set([...all.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
    expect([...used].filter((name) => !defined.has(name))).toEqual([]);
  });
});
