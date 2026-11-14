import { ui } from './ui';

// Paridade PT/EN do espaço cultural (CL-26). O `check-i18n.mjs` da skill não consegue carregar o
// `ui.ts` (importa `./ws` e `./personal` sem extensão, o que o Node puro não resolve); este teste
// faz a mesma comparação, de chaves e de tipos, só para `ui.*.personal`.
const flat = (value: unknown, path = ''): string[] =>
  Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
    v && typeof v === 'object' ? flat(v, `${path}${key}.`) : [`${path}${key}`],
  );

const get = (value: unknown, path: string) =>
  path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], value);

const kind = (v: unknown) => (typeof v === 'function' ? 'fn' : typeof v);

describe('textos do espaço cultural em PT e EN (CL-26)', () => {
  const pt = flat(ui.pt.personal);
  const en = flat(ui.en.personal);

  it('as mesmas chaves nos dois idiomas', () => {
    expect(pt.length).toBeGreaterThan(40);
    expect([...en].sort()).toEqual([...pt].sort());
  });

  it('o mesmo tipo em cada chave (texto ou função)', () => {
    for (const key of pt)
      expect(kind(get(ui.en.personal, key)), key).toBe(kind(get(ui.pt.personal, key)));
  });

  it('nenhum texto vazio', () => {
    for (const lang of ['pt', 'en'] as const)
      for (const key of flat(ui[lang].personal)) {
        const value = get(ui[lang].personal, key);

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
      const a = get(ui.pt.personal, key);
      const b = get(ui.en.personal, key);

      if (typeof a === 'string' && !same.has(key)) expect(a, key).not.toBe(b);
    }
  });
});
