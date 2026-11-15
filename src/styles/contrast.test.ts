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
const ACCENTS = ['accent', 'accent-2', 'ok', 'warn', 'err', 'info'];
// Paleta de categorias (--c-*): mesmos 4,5:1, também sobre --bg (a barra lateral fica sobre ele).
const TONES = ['violet', 'mint', 'amber', 'coral', 'cyan', 'pink'].map((n) => `c-${n}`);
const TEXTS = ['text', 'text-2', 'dim'];
// Temas extras (TB-04): só sobrescrevem tokens sobre o escuro; cada um precisa
// de bloco próprio em tokens.css, com contraste AA.
const extra = (id: string) => ({
  ...dark,
  ...tokens(new RegExp(`\\[data-theme='${id}'\\]\\s*\\{([\\s\\S]*?)\\n\\}`)),
});
const themes: [string, Record<string, string>][] = [
  ['escuro', dark],
  ['claro', light],
  ['dracula', extra('dracula')],
  ['solarized', extra('solarized')],
  ['amber', extra('amber')],
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

  it('cada tema extra tem bloco próprio e muda as superfícies e o acento', () => {
    for (const [name, theme] of themes.slice(2)) {
      expect(theme.surface, name).not.toBe(dark.surface);
      expect(theme.accent, name).not.toBe(dark.accent);
    }
  });

  it('nenhum tema usa degradê (ES-xx)', () => {
    expect(css).not.toMatch(/gradient\(/);
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

  it.each(themes)(
    'tema %s: --border-ui (contorno de campos) tem ≥ 3:1 em bg e nas três superfícies (WCAG 1.4.11)',
    (_, theme) => {
      for (const surface of ['bg', ...SURFACES]) {
        const value = ratio(theme['border-ui'], theme[surface]);

        expect(
          value,
          `--border-ui sobre --${surface}: ${value.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(3);
      }
    },
  );

  it('campos e mensagem de erro do formulário usam tokens, não cores fixas', () => {
    const sections = readFileSync(join(process.cwd(), 'src/styles/sections.css'), 'utf8');
    const form = sections.slice(
      sections.indexOf('.form-field {'),
      sections.indexOf('.contact-form .btn'),
    );

    expect(form).not.toMatch(/#[0-9a-f]{3,6}(?![0-9a-z])/i);
    expect(form).toContain('var(--border-ui)');
  });

  it.each(themes)(
    'tema %s: cada tom de categoria (--c-*) tem ≥ 4,5:1 em bg e nas três superfícies',
    (_, theme) => {
      for (const tone of TONES) {
        for (const surface of ['bg', ...SURFACES]) {
          const value = ratio(theme[tone], theme[surface]);

          expect(
            value,
            `--${tone} sobre --${surface}: ${value.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  it.each(themes)('tema %s: o texto de acento sobre bg também passa AA', (_, theme) => {
    for (const accent of ACCENTS) {
      expect(ratio(theme[accent], theme.bg), `--${accent}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('a impressão usa os mesmos tokens do tema claro (ES-09)', () => {
    const print = tokens(/@media print\s*\{\s*:root,\s*\[data-theme\]\s*\{([\s\S]*?)\n {2}\}/);

    for (const name of [...SURFACES, ...ACCENTS, ...TONES, ...TEXTS, 'on-accent']) {
      expect(print[name], `--${name} na impressão`).toBe(light[name]);
    }
  });

  it('o cálculo detecta um acento fraco (guarda do próprio teste)', () => {
    expect(ratio('#555555', dark.surface)).toBeLessThan(4.5);
    expect(ratio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });
});

// Caderno — Vol. XI (CD-04, CD-75): a serifa usa as mesmas cores dos tokens, então o contraste do
// texto e do anel de foco (--accent) vale também sobre --bg e sobre a capa (--surface-2), nos cinco temas.
describe('contraste do caderno (CD-75)', () => {
  const notebook = readFileSync(join(process.cwd(), 'src/styles/notebook.css'), 'utf8');

  it('os tokens editoriais existem com os valores do brief', () => {
    expect(css).toContain("--font-serif: 'Fraunces'");
    expect(css).toContain('--fs-hero: clamp(3rem, 6vw, 5rem)');
    expect(css).toContain('--fs-chapter: clamp(2rem, 4vw, 3.4rem)');
    expect(css).toContain('--fs-epigraph: clamp(1.1rem, 1.6vw, 1.4rem)');
  });

  it.each(themes)('tema %s: texto e foco (--accent) têm ≥ 4,5:1 sobre --bg', (_, theme) => {
    for (const name of [...TEXTS, 'accent', 'ok']) {
      const value = ratio(theme[name], theme.bg);

      expect(value, `--${name} sobre --bg: ${value.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('notebook.css só usa cores dos tokens (nenhum hex) e nenhum degradê', () => {
    expect(notebook).not.toMatch(/#[0-9a-f]{3,8}(?![0-9a-z-])/i);
    expect(notebook).not.toMatch(/gradient\(/);
  });
});

// Caderno, revisão R1: a paleta da biblioteca visual (bloco `@media screen` com `[data-caderno]`).
// Mesma régua dos temas: acentos e textos AA sobre bg e superfícies, contorno 3:1, e a lógica fixa
// (--accent quente, --ok verde de confirmação) nos cinco temas.
describe('paleta do caderno (revisão R1)', () => {
  const screenBlock = css.slice(css.indexOf('@media screen {'), css.indexOf('@media (max-width: 720px)'));
  const block = (selector: string) => {
    const at = screenBlock.indexOf(selector);
    const body = screenBlock.slice(screenBlock.indexOf('{', at) + 1, screenBlock.indexOf('}', at));

    return Object.fromEntries(
      [...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)].map(([, name, hex]) => [name, hex]),
    );
  };
  const base = Object.fromEntries(themes) as Record<string, Record<string, string>>;
  const caderno: [string, Record<string, string>][] = [
    ['escuro', { ...dark, ...block(":root[data-caderno][data-theme='dark']") }],
    ['claro', { ...light, ...block(":root[data-caderno][data-theme='light']") }],
    ['dracula', { ...base.dracula, ...block(":root[data-caderno][data-theme='dracula']") }],
    ['solarized', { ...base.solarized, ...block(":root[data-caderno][data-theme='solarized']") }],
    ['amber', { ...base.amber, ...block(":root[data-caderno][data-theme='amber']") }],
  ];

  it('só vale na tela, com a flag (data-caderno), e o escuro cobre também o <html> sem data-theme', () => {
    expect(screenBlock).toContain(":root[data-caderno]:not([data-theme]),\n  :root[data-caderno][data-theme='dark']");
    expect(screenBlock).not.toMatch(/gradient\(/);
  });

  it('escuro: fundo quase preto e frio (não #000), acento laranja e confirmação verde', () => {
    const [, d] = caderno[0];
    const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const [r, , b] = rgb(d.bg);
    const [ar, ag, ab] = rgb(d.accent);
    const [or, og, ob] = rgb(d.ok);

    expect(d.bg).not.toBe('#000000');
    expect(luminance(d.bg)).toBeLessThan(0.01);
    expect(b).toBeGreaterThanOrEqual(r); // frio
    expect(ar > ag && ag > ab).toBe(true); // laranja
    expect(og > or && og > ob).toBe(true); // verde
  });

  it.each(caderno)('tema %s: --accent e --ok têm ≥ 4,5:1 em bg e nas três superfícies', (_, theme) => {
    for (const name of ['accent', 'ok']) {
      for (const surface of ['bg', ...SURFACES]) {
        const value = ratio(theme[name], theme[surface]);

        expect(value, `--${name} sobre --${surface}: ${value.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(caderno)('tema %s: textos e demais acentos continuam AA; contorno ≥ 3:1', (_, theme) => {
    for (const name of [...TEXTS, ...ACCENTS]) {
      for (const surface of ['bg', ...SURFACES]) {
        expect(ratio(theme[name], theme[surface]), `--${name}/--${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }

    for (const surface of ['bg', ...SURFACES]) {
      expect(ratio(theme['border-ui'], theme[surface]), `--border-ui/--${surface}`).toBeGreaterThanOrEqual(3);
    }
    expect(ratio(theme['on-accent'], theme.accent), 'on-accent').toBeGreaterThanOrEqual(4.5);
  });
});
