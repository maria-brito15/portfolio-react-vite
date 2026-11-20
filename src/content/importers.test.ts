// Quem importa o conteúdo novo (003, T5.1, TD-002, NFR-001): nesta spec nenhuma página o lê, então o
// JavaScript do navegador não muda. Só o `registry` e os schemas rodam em Node (verify e build).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const NEW_FILES = [
  'projects',
  'experiences',
  'academics',
  'skills',
  'resume',
  'contact',
  'now',
  'uses',
].map((name) => `${name}.content`);

interface SourceFile {
  path: string;
  source: string;
}

// `import type` não vai ao navegador; qualquer outro import dos alvos abaixo, sim.
const STATIC_IMPORT = /import\s+(?!type\b)[^;]*?from\s*['"]([^'"]+)['"]/g;
const SIDE_EFFECT_IMPORT = /import\s*['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

function importedPaths(source: string): string[] {
  return [STATIC_IMPORT, SIDE_EFFECT_IMPORT, DYNAMIC_IMPORT].flatMap((re) =>
    [...source.matchAll(re)].map((m) => m[1]!),
  );
}

function isForbiddenTarget(spec: string): boolean {
  const tail = spec.split('/').slice(-1)[0] ?? '';

  return (
    tail === 'registry' ||
    NEW_FILES.includes(tail) ||
    /(^|\/)content\/schema(\/|$)/.test(spec) ||
    /(^|\/)schema\/[a-zA-Z]+$/.test(spec)
  );
}

/** Arquivos de `src/` (fora de `src/content/`, dos testes e de `__migration__/`) que importam o conteúdo novo. */
export function forbiddenImporters(files: readonly SourceFile[]): string[] {
  return files
    .filter((f) => !f.path.startsWith('src/content/') && !/\.test\.tsx?$/.test(f.path))
    .flatMap((f) =>
      importedPaths(f.source)
        .filter(isForbiddenTarget)
        .map((spec) => `${f.path} importa "${spec}" (conteúdo novo, ainda sem página que o leia)`),
    );
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);

    if (statSync(full).isDirectory()) return walk(full);

    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

describe('importadores do conteúdo novo', () => {
  it('nenhum arquivo de src/ fora de src/content/ importa o registro, os schemas ou os 8 arquivos novos', () => {
    const root = process.cwd();
    const files = walk(join(root, 'src')).map((full) => ({
      path: relative(root, full).split(sep).join('/'),
      source: readFileSync(full, 'utf8'),
    }));

    expect(files.length).toBeGreaterThan(50);
    expect(forbiddenImporters(files)).toEqual([]);
  });

  it('caso negativo: uma página que importa o registro é acusada', () => {
    const files = [
      { path: 'src/pages/Falsa.tsx', source: "import { registry } from '../content/registry';" },
    ];

    expect(forbiddenImporters(files)).toEqual([
      'src/pages/Falsa.tsx importa "../content/registry" (conteúdo novo, ainda sem página que o leia)',
    ]);
  });

  it('caso negativo: importar um dos 8 arquivos novos, estático ou dinâmico, é acusado', () => {
    const files = [
      {
        path: 'src/pages/A.tsx',
        source: "import { projects } from '../content/projects.content';",
      },
      { path: 'src/pages/B.tsx', source: "const m = await import('../content/resume.content');" },
    ];

    expect(forbiddenImporters(files)).toHaveLength(2);
  });

  it('`import type` não conta (some no build) e o conteúdo da 002 (credits) é livre', () => {
    const files = [
      {
        path: 'src/pages/C.tsx',
        source: "import type { ContentProject } from '../content/schema/project';",
      },
      {
        path: 'src/components/F.tsx',
        source: "import { credits } from '../content/credits.content';",
      },
      { path: 'src/components/G.tsx', source: "import { pick } from '../content/pick';" },
    ];

    expect(forbiddenImporters(files)).toEqual([]);
  });

  it('testes e src/content/ podem importar o conteúdo', () => {
    const files = [
      {
        path: 'src/pages/H.test.tsx',
        source: "import { projects } from '../content/projects.content';",
      },
      { path: 'src/content/x.ts', source: "import { registry } from './registry';" },
    ];

    expect(forbiddenImporters(files)).toEqual([]);
  });
});
