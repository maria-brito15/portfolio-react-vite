// FR-007 e TD-003: contraste dos tokens, lidos de tokens.css nos dois temas, por uma matriz de pares
// permitidos. Um par fora da matriz falha (Achados 4 e 5 do design: acento e borda de controle
// sobre os tons escuros). Texto normal 4,5:1; componentes (borda de controle) 3:1.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function tokens(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)].map(([, name, hex]) => [name, hex]),
  );
}

const blockOf = (re: RegExp) => css.match(re)?.[1] ?? '';
const rootBlock = blockOf(/\n:root\s*\{([\s\S]*?)\n\}/);
const darkBlock = blockOf(/\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/);
const mediaBlock = blockOf(/:root:not\(\[data-theme\]\)\s*\{([\s\S]*?)\n {2}\}/);
const printBlock = blockOf(/@media print\s*\{\s*:root,\s*\[data-theme\]\s*\{([\s\S]*?)\n {2}\}/);

const light = tokens(rootBlock);
const darkOverrides = tokens(darkBlock);
const dark = { ...light, ...darkOverrides };

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

const PASTELS = ['tone-peach', 'tone-lilac', 'tone-mint', 'tone-lemon', 'tone-sky', 'tone-pink'];
const DARK_TONES = ['tone-dark-1', 'tone-dark-2', 'tone-dark-3', 'tone-dark-4'];
const DECO = ['deco-1', 'deco-2', 'deco-3', 'deco-4', 'deco-5'];
const BASE_FG = ['text', 'text-muted', 'accent', 'control-border', 'on-accent', 'divider', 'bg'];

// Matriz de pares permitidos: [primeiro plano, fundo, piso de contraste]. O que não está aqui é
// proibido. Pastéis valem no tema claro; tons escuros no escuro, só com --text por cima.
const ALLOWED: Record<'light' | 'dark', [string, string, number][]> = {
  light: [
    ['text', 'bg', 4.5],
    ['text', 'surface', 4.5],
    ['text-muted', 'bg', 4.5],
    ['text-muted', 'surface', 4.5],
    ['accent', 'bg', 4.5],
    ['accent', 'surface', 4.5],
    ['on-accent', 'accent', 4.5],
    ['control-border', 'bg', 3],
    ['control-border', 'surface', 3],
    ...PASTELS.flatMap((tone): [string, string, number][] => [
      ['text', tone, 4.5],
      ['text-muted', tone, 4.5],
      ['accent', tone, 4.5],
      ['control-border', tone, 3],
    ]),
  ],
  dark: [
    ['text', 'bg', 4.5],
    ['text', 'surface', 4.5],
    ['text-muted', 'bg', 4.5],
    ['text-muted', 'surface', 4.5],
    ['accent', 'bg', 4.5],
    ['accent', 'surface', 4.5],
    ['on-accent', 'accent', 4.5],
    ['control-border', 'bg', 3],
    ['control-border', 'surface', 3],
    ...DARK_TONES.map((tone): [string, string, number] => ['text', tone, 4.5]),
  ],
};

const themes: ['light' | 'dark', Record<string, string>][] = [
  ['light', light],
  ['dark', dark],
];

// Falha se o par não está na matriz do tema (a guarda que o CSS e os componentes devem respeitar).
function assertAllowed(theme: 'light' | 'dark', fg: string, bg: string) {
  const pair = ALLOWED[theme].find(([f, b]) => f === fg && b === bg);

  if (!pair) throw new Error(`par proibido no tema ${theme}: --${fg} sobre --${bg}`);

  return pair[2];
}

// Varre o CSS: toda regra com `color: var(--x)` e fundo `var(--tone-*)` precisa de um par permitido
// em algum tema. (Hoje nenhuma regra usa --tone-*: as páginas novas é que passam a usar.)
function pairsInCss(source: string): [string, string][] {
  const pairs: [string, string][] = [];

  for (const [, body] of source.matchAll(/\{([^{}]*)\}/g)) {
    const fg = body.match(/(?:^|[;\s])color:\s*var\(--([\w-]+)\)/)?.[1];
    const bg = body.match(
      /background(?:-color)?:\s*var\(--(tone-(?:peach|lilac|mint|lemon|sky|pink|dark-\d))\)/,
    )?.[1];

    if (fg && bg) pairs.push([fg, bg]);
  }

  return pairs;
}

describe('contraste dos tokens (FR-007, TD-003)', () => {
  it('lê os tokens dos dois temas', () => {
    for (const [name, theme] of themes) {
      for (const token of ['bg', 'surface', ...BASE_FG, ...PASTELS, ...DARK_TONES]) {
        expect(theme[token], `${name}: --${token}`).toMatch(/^#[0-9a-f]{3,6}$/i);
      }
    }
    expect(dark.accent).not.toBe(light.accent);
    expect(dark.bg).not.toBe(light.bg);
  });

  it.each(themes)('tema %s: cada par permitido passa o piso e bate com o design', (name, theme) => {
    for (const [fg, bg, floor] of ALLOWED[name]) {
      const value = ratio(theme[fg], theme[bg]);

      expect(value, `--${fg} sobre --${bg}: ${value.toFixed(2)}:1`).toBeGreaterThanOrEqual(floor);
    }
  });

  it('as razões calculadas batem com as do design (amostra)', () => {
    const near = (a: string, b: string, expected: number) =>
      expect(ratio(a, b)).toBeCloseTo(expected, 1);

    near(light['text'], light['bg'], 16.82);
    near(light['text-muted'], light['bg'], 6.62);
    near(light['accent'], light['bg'], 7.5);
    near(light['control-border'], light['bg'], 4.17);
    near(light['on-accent'], light['accent'], 7.98);
    near(dark['text'], dark['bg'], 16.35);
    near(dark['text-muted'], dark['bg'], 7.71);
    near(dark['accent'], dark['bg'], 7.44);
    near(dark['control-border'], dark['bg'], 4.54);
    near(light['accent'], light['tone-pink'], 5.98);
    near(dark['text'], dark['tone-dark-2'], 6.6);
  });

  it('o design proíbe acento e borda de controle sobre os tons escuros (Achados 4 e 5)', () => {
    for (const tone of DARK_TONES) {
      // os valores reais ficam abaixo do piso, então a matriz precisa deixá-los de fora
      expect(ratio(dark.accent, dark[tone]), `accent/${tone}`).toBeLessThan(4.5);
      expect(ratio(dark['control-border'], dark[tone]), `control-border/${tone}`).toBeLessThan(3);
      expect(() => assertAllowed('dark', 'accent', tone)).toThrow(/proibido/);
      expect(() => assertAllowed('dark', 'control-border', tone)).toThrow(/proibido/);
      expect(assertAllowed('dark', 'text', tone)).toBe(4.5);
    }
  });

  it('um par fora da matriz falha (provado com pares plantados)', () => {
    expect(() => assertAllowed('light', 'divider', 'bg')).toThrow(/proibido/);
    expect(() => assertAllowed('light', 'text', 'tone-dark-1')).toThrow(/proibido/);
    expect(() => assertAllowed('dark', 'text', 'tone-peach')).toThrow(/proibido/);
    expect(pairsInCss('.x { color: var(--accent); background: var(--tone-dark-2); }')).toEqual([
      ['accent', 'tone-dark-2'],
    ]);
  });

  it('nenhuma regra do CSS usa um par fora da matriz', () => {
    const dir = join(process.cwd(), 'src', 'styles');
    const files = ['base.css', 'ui.css', 'sections.css', 'services.css', 'shell.css'];
    const everyPair = (fg: string, bg: string) =>
      (['light', 'dark'] as const).some((theme) =>
        ALLOWED[theme].some(([f, b]) => f === fg && b === bg),
      );

    for (const file of files) {
      for (const [fg, bg] of pairsInCss(readFileSync(join(dir, file), 'utf8'))) {
        expect(everyPair(fg, bg), `${file}: --${fg} sobre --${bg}`).toBe(true);
      }
    }
  });

  it('as cinco cores decorativas existem nos dois temas (só decoração, sem contraste exigido)', () => {
    for (const [name, theme] of themes) {
      for (const token of DECO)
        expect(theme[token], `${name}: --${token}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(dark['deco-1']).not.toBe(light['deco-1']);
  });

  it('o bloco escuro do sistema é igual ao bloco `data-theme="dark"`', () => {
    const media = tokens(mediaBlock);

    expect(media).toEqual(darkOverrides);
    expect(Object.keys(media).length).toBeGreaterThan(8);
  });

  it('a impressão usa os mesmos valores do tema claro (ES-09)', () => {
    const print = tokens(printBlock);

    expect(Object.keys(print).length).toBeGreaterThan(8);

    for (const [name, value] of Object.entries(print)) {
      expect(value, `--${name} na impressão`).toBe(light[name]);
    }
  });

  // LEGADO (TD-017): as páginas antigas ainda usam estas cores como texto; elas seguem em 4,5:1
  // sobre o fundo e a superfície nos dois temas, até a spec de cada página trocá-las.
  it.each(themes)('tema %s: cores semânticas legadas têm ≥ 4,5:1 em bg e surface', (_, theme) => {
    for (const name of ['accent-2', 'ok', 'warn', 'err', 'info']) {
      for (const surface of ['bg', 'surface']) {
        const value = ratio(theme[name], theme[surface]);

        expect(value, `--${name} sobre --${surface}: ${value.toFixed(2)}:1`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    }
  });

  it('campos e mensagem de erro do formulário usam tokens, não cores fixas', () => {
    const sections = readFileSync(join(process.cwd(), 'src/styles/sections.css'), 'utf8');
    const form = sections.slice(
      sections.indexOf('.form-field {'),
      sections.indexOf('.contact-form .btn'),
    );

    expect(form).not.toMatch(/#[0-9a-f]{3,6}(?![0-9a-z])/i);
    expect(form).toContain('var(--border-ui)');
  });

  it('o cálculo detecta um acento fraco (guarda do próprio teste)', () => {
    expect(ratio('#555555', dark.surface)).toBeLessThan(4.5);
    expect(ratio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });
});
