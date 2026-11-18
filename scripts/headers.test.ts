// T3.7 (V-10, TD-014, TD-015): o netlify.toml traz os 4 cabeçalhos de segurança em `for = "/*"` e as
// regras de 404 na ordem certa, sem `force`. Sem CSP (TD-015). Não confere o bloco `[functions]` (008).
import { readFileSync } from 'node:fs';

interface Block {
  table: string;
  fields: Record<string, string>;
  values: Record<string, string>;
}

const unquote = (value: string) => value.trim().replace(/^"(.*)"$/, '$1');

// Leitor mínimo, só do que este arquivo usa: `[[tabela]]`, `[tabela.sub]` e `chave = valor`.
export function readBlocks(toml: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | undefined;
  let inValues = false;

  for (const raw of toml.split(/\r?\n/)) {
    const line = raw.trim();

    if (!line || line.startsWith('#')) continue;

    const array = /^\[\[(.+)\]\]$/.exec(line);
    const table = /^\[([^[\]]+)\]$/.exec(line);

    if (array) {
      current = { table: array[1], fields: {}, values: {} };
      blocks.push(current);
      inValues = false;
    } else if (table) {
      inValues = /\.values$/.test(table[1]);
      if (!inValues) {
        current = { table: table[1], fields: {}, values: {} };
        blocks.push(current);
      }
    } else if (current) {
      const eq = line.indexOf('=');

      if (eq < 0) continue;
      (inValues ? current.values : current.fields)[line.slice(0, eq).trim()] = unquote(
        line.slice(eq + 1),
      );
    }
  }

  return blocks;
}

export const REQUIRED_HEADERS: Record<string, (value: string) => boolean> = {
  'X-Content-Type-Options': (v) => v === 'nosniff',
  'Referrer-Policy': (v) => v === 'strict-origin-when-cross-origin',
  'X-Frame-Options': (v) => v === 'DENY',
  'Permissions-Policy': (v) =>
    ['camera=()', 'microphone=()', 'geolocation=()'].every((part) => v.includes(part)),
};

export function missingHeaders(toml: string): string[] {
  const all = readBlocks(toml).find((b) => b.table === 'headers' && b.fields.for === '/*');

  return Object.entries(REQUIRED_HEADERS)
    .filter(([name, ok]) => !(all && name in all.values && ok(all.values[name])))
    .map(([name]) => name);
}

export function redirectRules(toml: string) {
  return readBlocks(toml)
    .filter((b) => b.table === 'redirects')
    .map((b) => ({
      from: b.fields.from,
      to: b.fields.to,
      status: b.fields.status,
      force: b.fields.force,
    }));
}

const real = readFileSync('netlify.toml', 'utf8');

describe('cabeçalhos de segurança (FR-031, NFR-002)', () => {
  it('os quatro estão em for = "/*"', () => {
    expect(missingHeaders(real)).toEqual([]);
  });

  it('o teste falha quando um cabeçalho some (cópia temporária)', () => {
    for (const name of Object.keys(REQUIRED_HEADERS)) {
      const without = real
        .split('\n')
        .filter((line) => !line.trim().startsWith(`${name} =`))
        .join('\n');

      expect(missingHeaders(without), name).toEqual([name]);
    }
  });

  it('o teste falha quando um valor muda (ex.: X-Frame-Options SAMEORIGIN)', () => {
    expect(
      missingHeaders(real.replace('X-Frame-Options = "DENY"', 'X-Frame-Options = "SAMEORIGIN"')),
    ).toEqual(['X-Frame-Options']);
  });

  it('não há Content-Security-Policy (TD-015: fora, por causa dos serviços de terceiros)', () => {
    expect(real).not.toMatch(/Content-Security-Policy/i);
  });
});

describe('regras de 404 e de /en/ (FR-027)', () => {
  it('na ordem: /en/ → /en (301), /en/* → /en/404.html (404), /* → /404.html (404)', () => {
    expect(redirectRules(real)).toEqual([
      { from: '/en/', to: '/en', status: '301', force: undefined },
      { from: '/en/*', to: '/en/404.html', status: '404', force: undefined },
      { from: '/*', to: '/404.html', status: '404', force: undefined },
    ]);
  });

  it('nenhuma regra usa force (um arquivo que existe sempre vence)', () => {
    expect(redirectRules(real).every((rule) => rule.force === undefined)).toBe(true);
    expect(real).not.toMatch(/force\s*=\s*true/);
  });

  it('não existe a regra antiga "/* → /index.html 200"', () => {
    expect(real).not.toMatch(/to\s*=\s*"\/index\.html"/);
  });
});
