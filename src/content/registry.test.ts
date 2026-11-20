// Registro completo (003, T5.2, FR-011): os 8 arquivos migrados mais `credits` (spec 002).
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateAll } from '../../scripts/contentValidator';
import { problemLine } from './schema/errors';
import { registry } from './registry';

const EXPECTED = [
  'src/content/credits.content.ts',
  'src/content/projects.content.ts',
  'src/content/experiences.content.ts',
  'src/content/academics.content.ts',
  'src/content/skills.content.ts',
  'src/content/resume.content.ts',
  'src/content/contact.content.ts',
  'src/content/now.content.ts',
  'src/content/uses.content.ts',
];

describe('registro de conteúdo', () => {
  it('tem 9 entradas: credits e os 8 arquivos migrados, cada uma com o caminho certo', () => {
    expect(registry).toHaveLength(9);
    expect(registry.map((entry) => entry.file).sort()).toEqual([...EXPECTED].sort());
  });

  it('não repete arquivo', () => {
    expect(new Set(registry.map((entry) => entry.file)).size).toBe(registry.length);
  });

  it('todo `*.content.ts` de src/content/ está no registro (nenhum órfão no disco)', () => {
    const problems = validateAll(registry, {
      publicDir: join(process.cwd(), 'public'),
      contentDir: join(process.cwd(), 'src', 'content'),
    });

    expect(problems.map(problemLine)).toEqual([]);
  });

  it('caso negativo: um `*.content.ts` sem registro é recusado pelo validador da 001', () => {
    const root = mkdtempSync(join(tmpdir(), 'registro-'));
    const contentDir = join(root, 'src', 'content');

    mkdirSync(contentDir, { recursive: true });
    writeFileSync(join(contentDir, 'orfao.content.ts'), 'export const orfao = [];\n');

    const problems = validateAll([], {
      publicDir: join(root, 'public'),
      contentDir,
      rootDir: root,
    });

    expect(problems.map(problemLine)).toEqual([
      'conteúdo inválido: src/content/orfao.content.ts › (arquivo) — não está registrado em src/content/registry.ts',
    ]);
  });
});
