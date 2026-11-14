import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { personalEn, personalPt } from './personal';

// Paridade PT/EN do espaço cultural (CL-26). O `check-i18n.mjs` da skill não consegue carregar o
// `ui.ts` (importa `./ws` e `./personal` sem extensão, o que o Node puro não resolve); este teste
// faz a mesma comparação, de chaves e de tipos, para `personalPt` e `personalEn` (que não passam
// pelo `ui.ts`: ver `usePersonalText.ts`).
const flat = (value: unknown, path = ''): string[] =>
  Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
    v && typeof v === 'object' ? flat(v, `${path}${key}.`) : [`${path}${key}`],
  );

const get = (value: unknown, path: string) =>
  path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], value);

const kind = (v: unknown) => (typeof v === 'function' ? 'fn' : typeof v);

describe('textos do espaço cultural em PT e EN (CL-26)', () => {
  const pt = flat(personalPt);
  const en = flat(personalEn);

  it('as mesmas chaves nos dois idiomas', () => {
    expect(pt.length).toBeGreaterThan(40);
    expect([...en].sort()).toEqual([...pt].sort());
  });

  it('o mesmo tipo em cada chave (texto ou função)', () => {
    for (const key of pt) expect(kind(get(personalEn, key)), key).toBe(kind(get(personalPt, key)));
  });

  it('nenhum texto vazio', () => {
    for (const lang of ['pt', 'en'] as const)
      for (const key of flat(lang === 'pt' ? personalPt : personalEn)) {
        const value = get(lang === 'pt' ? personalPt : personalEn, key);

        if (typeof value === 'string') expect(value.trim(), `${lang}.${key}`).not.toBe('');
      }
  });

  it('PT e EN diferem (nada ficou copiado de um idioma para o outro)', () => {
    // exceções legítimas: nomes próprios e o aviso do TMDB, que é em inglês nos dois idiomas
    const same = new Set([
      'footer.via',
      'footer.tmdb',
      'footer.sources.hardcover',
      'footer.sources.letterboxd',
      'footer.sources.tmdb',
    ]);

    for (const key of pt) {
      const a = get(personalPt, key);
      const b = get(personalEn, key);

      if (typeof a === 'string' && !same.has(key)) expect(a, key).not.toBe(b);
    }
  });
});

// Orçamento do JS inicial (CL-36): o `ui.ts` entra no bundle de todo visitante; o texto do espaço
// cultural (7 kB) fica fora dele e é lido por `usePersonalText()` dentro dos chunks lazy.
describe('texto do espaço cultural fora do JS inicial', () => {
  it('o ui.ts não importa nem expõe o texto do espaço cultural', () => {
    const source = readFileSync(join(process.cwd(), 'src/i18n/ui.ts'), 'utf8');

    expect(source).not.toMatch(/from '\.\/personal'/);
    expect(source).not.toMatch(/personal:\s*personal(Pt|En)/);
  });
});
