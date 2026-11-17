import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Um só estilo: terminal/IDE, uma família de fonte, sem degradê em texto.
const dir = join(process.cwd(), 'src', 'styles');
const sheets = readdirSync(dir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => [f, readFileSync(join(dir, f), 'utf8')]);
const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

interface Hit {
  file: string;
  value: string;
  stack: string[]; // preâmbulos que envolvem a declaração, do mais externo ao mais interno
}

// Percorre o CSS e devolve cada ocorrência de `pattern` dentro de declarações, com o contexto
// (at-rules e seletor) em que ela está. Comentários são ignorados.
function find(file: string, source: string, pattern: RegExp): Hit[] {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const hits: Hit[] = [];
  const stack: string[] = [];
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '{') {
      stack.push(text.slice(start, i).trim());
      start = i + 1;
    } else if (ch === '}') {
      for (const m of text.slice(start, i).matchAll(pattern)) {
        hits.push({ file, value: m[0], stack: [...stack] });
      }
      stack.pop();
      start = i + 1;
    } else if (ch === ';') {
      for (const m of text.slice(start, i).matchAll(pattern)) {
        hits.push({ file, value: m[0], stack: [...stack] });
      }
      start = i + 1;
    }
  }

  return hits;
}

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const GRADIENT = /gradient\(/gi;

// Isenções do código antigo que ainda não saiu (tasks.md, T1.1 v1.2). Cada uma tem dono e um teto:
// o teste falha se uma delas crescer ou se aparecer outra.
const selectorParts = (hit: Hit) => (hit.stack.at(-1) ?? '').split(',').map((s) => s.trim());
const EXEMPT = [
  {
    // dono: spec 007 (currículo): blocos @media print com #fff, #000 e #333
    name: 'resume.css @media print',
    match: (h: Hit) => h.file === 'resume.css' && h.stack.some((s) => s.startsWith('@media print')),
    max: 7,
  },
  {
    // dono: spec da página de serviços: lightbox com texto e contorno brancos sobre fundo escuro
    name: 'services.css lightbox',
    match: (h: Hit) =>
      h.file === 'services.css' &&
      selectorParts(h).every((s) => s.startsWith('#lb-') || s.startsWith('.lb-')),
    max: 4,
  },
];
const GRADIENT_EXEMPT = {
  // dono: T3.4, que apaga o `.grid-bg` e remove esta isenção
  name: 'base.css .grid-bg',
  match: (h: Hit) => h.file === 'base.css' && selectorParts(h).join(',') === '.grid-bg',
  max: 2,
};

const outsideTokens = sheets.filter(([name]) => name !== 'tokens.css');

describe('pele única', () => {
  it('nenhum CSS cita folhas que não existem mais', () => {
    for (const [name, css] of sheets) {
      expect(css, name).not.toMatch(/original\.css|portfolio\.css/);
    }
  });

  it('não sobra Syne, DM Sans nem degradê de texto', () => {
    for (const [name, css] of [...sheets, ['index.html', indexHtml]]) {
      expect(css, name).not.toMatch(/Syne|DM[ +]Sans|grad-text|grad-warm|background-clip/i);
    }
  });

  // Uma voz só: JetBrains Mono. Nenhuma outra família.
  it('a única família declarada é o mono dos tokens', () => {
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

describe('fonte única de cor e sem degradê (FR-001, FR-002, TD-017)', () => {
  const hexHits = outsideTokens.flatMap(([name, css]) => find(name, css, HEX));
  const gradientHits = sheets.flatMap(([name, css]) => find(name, css, GRADIENT));

  it('nenhum hex fora de tokens.css, salvo as isenções com dono e teto', () => {
    const free = hexHits.filter((h) => !EXEMPT.some((e) => e.match(h)));

    expect(free.map((h) => `${h.file}: ${h.value} em ${h.stack.at(-1)}`)).toEqual([]);

    for (const e of EXEMPT) {
      const count = hexHits.filter((h) => e.match(h)).length;

      expect(count, `${e.name}: ${count} hex`).toBeLessThanOrEqual(e.max);
      expect(count, `${e.name} existe`).toBeGreaterThan(0);
    }
  });

  it('nenhum degradê, salvo o `.grid-bg` que a T3.4 apaga', () => {
    const free = gradientHits.filter((h) => !GRADIENT_EXEMPT.match(h));

    expect(free.map((h) => `${h.file}: ${h.value}`)).toEqual([]);
    expect(gradientHits.length).toBeLessThanOrEqual(GRADIENT_EXEMPT.max);
  });

  it('o detector enxerga um hex e um degradê plantados fora das isenções', () => {
    const planted = '.x { color: #123456; background: linear-gradient(red, blue); }';

    expect(find('novo.css', planted, HEX).map((h) => h.value)).toEqual(['#123456']);
    expect(find('novo.css', planted, GRADIENT)).toHaveLength(1);
    expect(EXEMPT.some((e) => e.match(find('novo.css', planted, HEX)[0]))).toBe(false);
    expect(GRADIENT_EXEMPT.match(find('novo.css', planted, GRADIENT)[0])).toBe(false);
  });

  it('o hex de tokens.css só aparece nos blocos de tema e de impressão', () => {
    const tokens = sheets.find(([name]) => name === 'tokens.css')?.[1] ?? '';

    expect(find('tokens.css', tokens, HEX).length).toBeGreaterThan(40);
  });
});

describe('movimento reduzido e foco (FR-017, FR-018)', () => {
  const base = sheets.find(([name]) => name === 'base.css')?.[1] ?? '';

  it('em prefers-reduced-motion toda animação e transição é neutralizada', () => {
    const block = base.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\*,\s*\*::before,\s*\*::after\s*\{([^}]*)\}/,
    )?.[1];

    expect(block, 'regra global de movimento reduzido').toBeDefined();
    expect(block).toMatch(/animation-duration:\s*0\.001ms\s*!important/);
    expect(block).toMatch(/transition-duration:\s*0\.001ms\s*!important/);
    expect(block).toMatch(/animation-iteration-count:\s*1\s*!important/);
    expect(block).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });

  it('nenhuma animação nasce fora de prefers-reduced-motion sem a regra global', () => {
    // A regra global cobre `*`, então o que importa é que ela exista e que ninguém a desfaça
    // com um `animation-duration` maior e `!important` em outro lugar.
    for (const [name, css] of sheets) {
      if (name === 'base.css') continue;
      expect(css, name).not.toMatch(/(?:animation|transition)-duration:[^;]*!important/);
    }
  });

  it('o anel de foco global tem 3 px e usa o acento', () => {
    const rule = base.match(/a:focus-visible,\s*button:focus-visible\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(rule).toMatch(/outline:\s*3px solid var\(--accent\)/);
    expect(rule).toMatch(/outline-offset:\s*3px/);
  });

  it('os tokens de duração existem', () => {
    const tokens = sheets.find(([name]) => name === 'tokens.css')?.[1] ?? '';

    expect(tokens).toMatch(/--dur-fast:\s*\d+ms/);
    expect(tokens).toMatch(/--dur-base:\s*\d+ms/);
  });
});
