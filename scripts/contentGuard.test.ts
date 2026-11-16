import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ESLint } from 'eslint';
import type { Plugin } from 'vite';
import { ExampleListSchema, makeExampleItems } from '../src/content/__fixtures__/example.fixture';
import type { RegistryEntry } from '../src/content/registry';
import { assertContentValid, contentGuardPlugin } from './contentGuard';

function project() {
  const root = mkdtempSync(join(tmpdir(), 'guard-'));

  mkdirSync(join(root, 'public', 'assets'), { recursive: true });
  writeFileSync(join(root, 'public', 'assets', 'exemplo.png'), 'png');
  mkdirSync(join(root, 'src', 'content'), { recursive: true });

  return root;
}

const entry = (itens: unknown[]): RegistryEntry => ({
  file: 'src/content/exemplo.content.ts',
  schema: ExampleListSchema,
  data: { itens },
});

const options = (root: string) => ({ publicDir: join(root, 'public'), rootDir: root });

describe('contentGuard: função pura', () => {
  it('conteúdo válido não lança', () => {
    expect(() =>
      assertContentValid([entry(makeExampleItems(2))], options(project())),
    ).not.toThrow();
  });

  it('registro vazio não lança', () => {
    expect(() => assertContentValid([], options(project()))).not.toThrow();
  });

  it('conteúdo inválido lança com a linha inteira do §6.2 e o fecho', () => {
    const itens = makeExampleItems(1).map((item) => ({ ...item, titulo: { pt: 'Só PT' } }));

    expect(() => assertContentValid([entry(itens)], options(project()))).toThrow(
      'conteúdo inválido: src/content/exemplo.content.ts › itens[0].titulo.en — texto ausente\n' +
        '1 problema(s) em 1 arquivo(s)',
    );
  });
});

// O plugin recebe um registro de teste: o registro real não é alterado nem lido aqui.
function runBuildStart(plugin: Plugin, root: string) {
  const hooks = plugin as unknown as {
    configResolved(config: { root: string }): void;
    buildStart(): void;
  };

  hooks.configResolved({ root });
  hooks.buildStart();
}

describe('contentGuard: plugin do Vite', () => {
  it('só roda no build', () => {
    expect(contentGuardPlugin([]).apply).toBe('build');
  });

  it('um conteúdo inválido no registro derruba o buildStart', () => {
    const root = project();
    const itens = makeExampleItems(1).map((item) => ({ ...item, link: 'http://x.com' }));

    expect(() => runBuildStart(contentGuardPlugin([entry(itens)]), root)).toThrow(
      'precisa de https, recebido http',
    );
  });

  it('um conteúdo válido deixa o build seguir', () => {
    const root = project();

    writeFileSync(join(root, 'src', 'content', 'exemplo.content.ts'), 'export {}');

    expect(() =>
      runBuildStart(contentGuardPlugin([entry(makeExampleItems(2))]), root),
    ).not.toThrow();
  });

  it('o plugin também acusa *.content.ts esquecido no registro', () => {
    const root = project();

    writeFileSync(join(root, 'src', 'content', 'esquecido.content.ts'), 'export {}');

    expect(() => runBuildStart(contentGuardPlugin([]), root)).toThrow(
      'src/content/esquecido.content.ts › (arquivo) — não está registrado em src/content/registry.ts',
    );
  });

  it('o registro real (vazio hoje) passa no plugin com a raiz real do projeto', () => {
    expect(() => runBuildStart(contentGuardPlugin(), process.cwd())).not.toThrow();
  });
});

describe('regra de importação em *.content.ts', () => {
  async function lint(code: string, filePath: string) {
    const eslint = new ESLint({ cwd: process.cwd() });
    const [result] = await eslint.lintText(code, { filePath });

    return result.messages.filter((m) => m.ruleId === 'no-restricted-syntax');
  }

  const file = join(process.cwd(), 'src', 'content', 'exemplo.content.ts');

  it('import de valor de um módulo qualquer falha', async () => {
    expect(await lint("import { z } from 'zod';\nexport const a = 1;\n", file)).toHaveLength(1);
    expect(await lint("import x from '../utils/algo';\nexport const a = x;\n", file)).toHaveLength(
      1,
    );
  });

  it('import dinâmico e reexportação de outro módulo falham', async () => {
    expect(await lint("export const a = () => import('zod');\n", file)).toHaveLength(1);
    expect(await lint("export { z } from 'zod';\n", file)).toHaveLength(1);
  });

  it('import type e import de outro arquivo de conteúdo passam', async () => {
    const code =
      "import type { ContentTag } from './schema';\nimport { tags } from './tags.content';\nexport const a = tags;\nexport type T = ContentTag;\n";

    expect(await lint(code, file)).toHaveLength(0);
  });

  it('a regra não vale fora de *.content.ts', async () => {
    const other = join(process.cwd(), 'src', 'content', 'outro.ts');

    expect(await lint("import { z } from 'zod';\nexport const a = z;\n", other)).toHaveLength(0);
  });
});
