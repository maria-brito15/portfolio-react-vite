// ES-05: contraste AA (>= 4,5:1) dos tokens de cor, lidos de tokens.css nos dois temas.
// Trocar um acento por uma cor abaixo disso faz este teste falhar.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function tokens(re: RegExp): Record<string, string> {
  const block = css.match(re)?.[1] ?? '';

  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)].map(([, name, hex]) => [name, hex]),
  );
}
const dark = tokens(/:root\s*\{([\s\S]*?)\n\}/);
const light = { ...dark, ...tokens(/\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/) };

const luminance = (hex: string) => {
  let h = hex.slice(1);

  if (h.length === 3) h = [...h].map((c) => c + c).join('');

  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
};

const SURFACES = ['surface', 'surface-2', 'surface-3'];
const ACCENTS = ['accent', 'ok', 'warn', 'err'];
const TEXTS = ['text', 'text-2', 'dim'];
const themes: [string, Record<string, string>][] = [
  ['escuro', dark],
  ['claro', light],
];

describe('contraste AA dos tokens (ES-05)', () => {
  it('lê os tokens dos dois temas', () => {
    for (const [, theme] of themes) {
      for (const name of [...SURFACES, ...ACCENTS, ...TEXTS, 'on-accent']) {
        expect(theme[name], `--${name}`).toMatch(/^#[0-9a-f]{3,6}$/i);
      }
    }
    expect(dark.accent).not.toBe(light.accent);
  });

  it.each(themes)(
    'tema %s: cada acento tem ≥ 4,5:1 em surface, surface-2 e surface-3',
    (_, theme) => {
      for (const accent of ACCENTS) {
        for (const surface of SURFACES) {
          const value = ratio(theme[accent], theme[surface]);

          expect(
            value,
            `--${accent} sobre --${surface}: ${value.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  it.each(themes)(
    'tema %s: texto (text, text-2, dim) tem ≥ 4,5:1 em surface, surface-2 e surface-3',
    (_, theme) => {
      for (const text of TEXTS) {
        for (const surface of SURFACES) {
          const value = ratio(theme[text], theme[surface]);

          expect(
            value,
            `--${text} sobre --${surface}: ${value.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  it.each(themes)('tema %s: texto sobre botão de acento (on-accent sobre accent)', (_, theme) => {
    expect(ratio(theme['on-accent'], theme.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it('a impressão usa os mesmos tokens do tema claro (ES-09)', () => {
    const print = tokens(/@media print\s*\{\s*:root,\s*\[data-theme\]\s*\{([\s\S]*?)\n {2}\}/);

    for (const name of [...SURFACES, ...ACCENTS, ...TEXTS, 'on-accent']) {
      expect(print[name], `--${name} na impressão`).toBe(light[name]);
    }
  });

  it('o cálculo detecta um acento fraco (guarda do próprio teste)', () => {
    expect(ratio('#555555', dark.surface)).toBeLessThan(4.5);
    expect(ratio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });
});
