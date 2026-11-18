// T3.8 (V-14, TD-023, FR-040): o estado (página atual, idioma atual, botão ligado, menu aberto) nunca
// se mostra só por cor. Toda regra de estado muda também peso, sublinhado ou forma.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'styles');
const sheets = readdirSync(dir)
  .filter((f) => f.endsWith('.css'))
  .map((f): [string, string] => [f, readFileSync(join(dir, f), 'utf8')]);

const STATE = /\[aria-(?:current|pressed|expanded)\b/;
// Propriedades que só mudam a cor (ou o contorno em cor); sozinhas não bastam.
const COLOR_ONLY = new Set([
  'color',
  'background',
  'background-color',
  'border-color',
  'outline-color',
  'fill',
  'stroke',
  'opacity',
  'box-shadow',
  'transition',
]);

// Regras folha (`seletor { declarações }`), sem comentários; funciona dentro de @media.
export function stateRules(css: string) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');

  return [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, selector, body]) => ({
      selector: selector.trim(),
      props: body
        .split(';')
        .map((d) => d.split(':')[0].trim().toLowerCase())
        .filter(Boolean),
    }))
    .filter((rule) => STATE.test(rule.selector));
}

export const colorOnly = (css: string) =>
  stateRules(css)
    .filter((rule) => !rule.props.some((p) => !COLOR_ONLY.has(p)))
    .map((rule) => rule.selector);

// dono: spec da página de serviços. O FAQ abre e fecha com a seta que gira (`transform`, regra
// seguinte) além da cor; a regra de cor sozinha é do acordeão dela.
const EXEMPT = [
  { file: 'services.css', selector: ".faq-item:has(.faq-q[aria-expanded='true'])" },
  { file: 'services.css', selector: ".faq-q[aria-expanded='true']" },
];

describe('estado nunca só por cor (FR-040)', () => {
  it('nenhuma regra de estado muda só a cor, salvo as isenções com dono', () => {
    const offenders = sheets.flatMap(([file, css]) =>
      colorOnly(css)
        .filter((selector) => !EXEMPT.some((e) => e.file === file && e.selector === selector))
        .map((selector) => `${file}: ${selector}`),
    );

    expect(offenders).toEqual([]);
  });

  it('as isenções ainda existem (senão saem da lista)', () => {
    for (const e of EXEMPT) {
      const css = sheets.find(([file]) => file === e.file)?.[1] ?? '';

      expect(colorOnly(css), e.selector).toContain(e.selector);
    }
  });

  it('o menu, o botão de tema e a página atual ganham peso e sublinhado em shell.css', () => {
    const rules = stateRules(sheets.find(([file]) => file === 'shell.css')![1]);
    const joined = (marker: string) =>
      rules.filter((r) => r.selector.includes(marker)).flatMap((r) => r.props);

    for (const marker of ['[aria-current', "[aria-pressed='true']", "[aria-expanded='true']"]) {
      const props = joined(marker);

      expect(props, marker).toContain('font-weight');
      expect(props, marker).toContain('text-decoration');
    }
  });

  it('o detector pega uma regra plantada que só muda a cor (e deixa passar a que muda o peso)', () => {
    const planted = ".x[aria-current='page'] { color: red; }";
    const fine = ".x[aria-pressed='true'] { color: red; font-weight: 700; }";
    const media = "@media (min-width: 1px) { .y[aria-expanded='true'] { background: blue; } }";

    expect(colorOnly(planted)).toEqual([".x[aria-current='page']"]);
    expect(colorOnly(fine)).toEqual([]);
    expect(colorOnly(media)).toEqual([".y[aria-expanded='true']"]);
  });
});
