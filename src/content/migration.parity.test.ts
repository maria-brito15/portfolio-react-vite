// Paridade PT/EN dos 8 arquivos migrados (003, T5.2, FR-010, US-003). Cada caso trabalha numa CÓPIA em
// memória com o EN removido de um item; o dado real nunca é alterado.
import { join } from 'node:path';
import { reportLines, validateAll } from '../../scripts/contentValidator';
import { formatPath, problemLine } from './schema/errors';
import { registry } from './registry';

const MIGRATED = [
  'src/content/projects.content.ts',
  'src/content/experiences.content.ts',
  'src/content/academics.content.ts',
  'src/content/skills.content.ts',
  'src/content/resume.content.ts',
  'src/content/contact.content.ts',
  'src/content/now.content.ts',
  'src/content/uses.content.ts',
];

const PUBLIC_DIR = join(process.cwd(), 'public');

// Instantâneo do dado real antes de qualquer cópia: as cópias nunca podem mudá-lo.
const SNAPSHOT = JSON.stringify(registry.map((e) => e.data));

const isLocalized = (value: unknown): value is { pt: string; en: string } =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).pt === 'string' &&
  typeof (value as Record<string, unknown>).en === 'string';

/** Caminho (e o objeto) do primeiro texto PT/EN do dado, na ordem do arquivo; `null` se não houver. */
function firstLocalized(
  value: unknown,
  path: (string | number)[] = [],
): { path: (string | number)[]; node: object } | null {
  if (isLocalized(value)) return { path, node: value };

  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      const found = firstLocalized(item, [...path, i]);

      if (found) return found;
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      const found = firstLocalized(item, [...path, key]);

      if (found) return found;
    }
  }

  return null;
}

describe('paridade PT/EN dos arquivos migrados', () => {
  it.each(MIGRATED)(
    '%s: sem o EN de um item, a validação falha nomeando arquivo e campo',
    (file) => {
      const entry = registry.find((e) => e.file === file);

      expect(entry, `${file} precisa estar no registro`).toBeDefined();
      if (!entry) return;

      // Sanidade: o conteúdo real passa, então a falha abaixo vem só do EN removido.
      expect(validateAll([entry], { publicDir: PUBLIC_DIR })).toEqual([]);

      const copy = structuredClone(entry.data) as Record<string, unknown>;

      // O setup está vazio de propósito (sem texto inventado): a cópia ganha um grupo de EXEMPLO,
      // só em memória, para ter um título PT/EN do qual tirar o EN.
      if (file.endsWith('uses.content.ts')) {
        (copy.groups as unknown[]).push({ title: { pt: 'Exemplo', en: 'Example' }, items: [] });
      }

      const found = firstLocalized(copy);

      expect(found, `${file} não tem nenhum texto PT/EN para testar`).not.toBeNull();
      if (!found) return;

      delete (found.node as { en?: string }).en;

      const problems = validateAll([{ ...entry, data: copy }], { publicDir: PUBLIC_DIR });
      const lines = problems.map(problemLine);

      // A linha de erro nomeia o arquivo, o campo exato (com o `en` que falta) e o motivo.
      expect(lines).toEqual([
        `conteúdo inválido: ${file} › ${formatPath([...found.path, 'en'])} — texto ausente`,
      ]);
      expect(reportLines(problems).join('\n')).toContain(file);
    },
  );

  it('o dado real não foi alterado pelas cópias e continua válido', () => {
    expect(JSON.stringify(registry.map((e) => e.data))).toBe(SNAPSHOT);
    expect(validateAll(registry, { publicDir: PUBLIC_DIR })).toEqual([]);
  });
});
