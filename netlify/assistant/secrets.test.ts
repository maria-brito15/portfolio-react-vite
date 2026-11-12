import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// IA-14: a chave do Gemini só existe como variável de ambiente no servidor. Nada que
// vai para o navegador (`src/`, `dist/`) pode citá-la, e nenhum arquivo do repositório
// pode conter uma chave de verdade.
const walk = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);

        if (name === 'node_modules' || name === 'context.json') return [];

        return statSync(path).isDirectory() ? walk(path) : [path];
      })
    : [];

const read = (file: string) => readFileSync(file, 'utf8');
const KEY_SHAPE = /AIza[0-9A-Za-z_-]{30,}/;

describe('a chave do Gemini não vaza (IA-14)', () => {
  it('nenhum arquivo do repositório tem uma chave com cara de chave', () => {
    const files = [
      ...walk('src'),
      ...walk('netlify'),
      ...walk('scripts'),
      ...walk('docs'),
      'netlify.toml',
      'vercel.json',
      'package.json',
    ].filter(
      (f) =>
        existsSync(f) &&
        /\.(ts|tsx|mts|js|mjs|json|md|toml|css|html|txt)$/.test(f) &&
        !f.endsWith('secrets.test.ts'),
    );

    expect(files.length).toBeGreaterThan(20);
    for (const file of files) expect(KEY_SHAPE.test(read(file)), file).toBe(false);
  });

  it('o código do navegador nem cita a variável da chave', () => {
    for (const file of walk('src').filter((f) => /\.(ts|tsx)$/.test(f)))
      expect(read(file), file).not.toMatch(/GEMINI_API_KEY|x-goog-api-key/);
  });

  it('o build (dist/), quando existe, não tem a variável nem uma chave', () => {
    for (const file of walk('dist').filter((f) => /\.(js|html|json|css|txt|xml)$/.test(f))) {
      const text = read(file);

      expect(text, file).not.toMatch(/GEMINI_API_KEY|x-goog-api-key/);
      expect(KEY_SHAPE.test(text), file).toBe(false);
    }
  });

  it('o netlify.toml não define a chave (ela vive no painel da Netlify)', () => {
    expect(read('netlify.toml')).not.toMatch(/GEMINI_API_KEY\s*=/);
  });
});
