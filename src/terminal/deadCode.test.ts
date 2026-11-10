// Marco D: nada do índice de seções fica sem uso (chaves de texto e exportações).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ui } from '../i18n/ui';

// Código-fonte de produção (sem testes e sem o próprio ui.js), lido como texto.
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
const sources = walk(join(process.cwd(), 'src'))
  .map((p) => p.split('\\').join('/'))
  .filter((p) => /\.(ts|tsx)$/.test(p) && !/\.test\./.test(p) && !p.endsWith('/i18n/ui.ts'))
  .map((path) => ({ path, text: readFileSync(path, 'utf8') }));

const reads = (key: string) => sources.some(({ text }) => new RegExp(`\\.${key}\\b`).test(text));

describe('código morto do índice de seções', () => {
  it('a leitura dos arquivos funciona', () => {
    expect(sources.length).toBeGreaterThan(20);
    expect(sources.some(({ path }) => path.endsWith('/terminal/pageIndex.tsx'))).toBe(true);
  });

  it('toda chave term.nav.* (PT e EN) é lida por algum arquivo', () => {
    const keys = Object.keys(ui.pt.term.nav);

    expect(Object.keys(ui.en.term.nav).sort()).toEqual([...keys].sort());
    for (const key of keys) expect(reads(key), `term.nav.${key} não é usada`).toBe(true);
  });

  it('term.firstVisit e term.try são usadas', () => {
    for (const key of ['firstVisit', 'try'])
      expect(reads(key), `term.${key} não é usada`).toBe(true);
  });

  it('toda exportação de pageIndex.tsx é importada por outro arquivo', () => {
    const own = sources.find(({ path }) => path.endsWith('/terminal/pageIndex.tsx'))!;
    const names = [...own.text.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);

    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const used = sources.some(
        ({ path, text }) => path !== own.path && new RegExp(`\\b${name}\\b`).test(text),
      );

      expect(used, `${name} é exportada e não usada`).toBe(true);
    }
  });
});
