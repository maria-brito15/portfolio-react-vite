// Validador de conteúdo: a única implementação, chamada pelo teste (etapa `testes` do verify) e
// pelo plugin `contentGuard` (etapa `geração`). Roda em Node, nunca no navegador (design TD-003).
import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { imagePathProblem } from '../src/content/schema/image';
import {
  formatPath,
  formatProblems,
  problemsFromZod,
  type ContentProblem,
} from '../src/content/schema/errors';
import type { RegistryEntry } from '../src/content/registry';

export const REGISTRY_FILE = 'src/content/registry.ts';
const PUBLIC_LABEL = 'public';

export interface ValidateOptions {
  /** Raiz do `public/`, onde as imagens precisam existir. */
  publicDir: string;
  /** Pasta (absoluta) em que `*.content.ts` precisam estar no registro; omitida, não confere. */
  contentDir?: string;
  /** Raiz do projeto; os nomes de arquivo nos problemas saem relativos a ela, com `/`. */
  rootDir?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Procura o arquivo listando cada pasta e comparando o nome exato: a diferença de maiúscula
 * falha no Windows e no Linux do mesmo jeito (EC-04). `..` e `\` nem chegam aqui (a forma do
 * caminho já foi recusada), mas o caminho resolvido ainda precisa ficar dentro de `public/`.
 */
function fileExists(publicDir: string, urlPath: string): boolean {
  const root = resolve(publicDir);
  const resolved = resolve(root, `.${urlPath}`);

  if (resolved !== root && !resolved.startsWith(root + sep)) return false;

  let dir = root;
  const parts = relative(root, resolved).split(sep);

  for (const [i, part] of parts.entries()) {
    let names: string[];

    try {
      names = readdirSync(dir);
    } catch {
      return false;
    }
    if (!names.includes(part)) return false;
    dir = join(dir, part);
    if (i === parts.length - 1) return statSync(dir).isFile();
  }

  return false;
}

/** Imagem = objeto com `path` (texto) e `alt`: o `ImageSchema` é estrito, nenhum outro tem os dois. */
function collectImages(
  data: unknown,
  path: PropertyKey[] = [],
): { path: PropertyKey[]; src: string }[] {
  if (Array.isArray(data)) return data.flatMap((item, i) => collectImages(item, [...path, i]));
  if (!isRecord(data)) return [];

  const own =
    typeof data.path === 'string' && 'alt' in data
      ? [{ path: [...path, 'path'], src: data.path }]
      : [];

  return [
    ...own,
    ...Object.entries(data).flatMap(([key, value]) => collectImages(value, [...path, key])),
  ];
}

function listContentFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) return listContentFiles(full);

    return entry.name.endsWith('.content.ts') ? [full] : [];
  });
}

export function validateAll(
  registry: readonly RegistryEntry[],
  { publicDir, contentDir, rootDir = process.cwd() }: ValidateOptions,
): ContentProblem[] {
  const problems: ContentProblem[] = [];

  for (const entry of registry) {
    const parsed = entry.schema.safeParse(entry.data);

    if (!parsed.success) problems.push(...problemsFromZod(entry.file, parsed.error));

    for (const image of collectImages(entry.data)) {
      // Forma ruim já é problema do schema; aqui só se confere o arquivo de um caminho bem formado.
      if (imagePathProblem(image.src) !== null || fileExists(publicDir, image.src)) continue;

      problems.push({
        file: entry.file,
        field: formatPath(image.path),
        reason: `arquivo não encontrado: ${image.src} (procurado em ${PUBLIC_LABEL}${image.src})`,
      });
    }
  }

  if (contentDir !== undefined) {
    const registered = new Set(registry.map((entry) => entry.file));
    const onDisk = listContentFiles(contentDir).map((full) =>
      relative(rootDir, full).split(sep).join('/'),
    );

    for (const file of onDisk) {
      if (registered.has(file)) continue;
      problems.push({
        file,
        field: '(arquivo)',
        reason: `não está registrado em ${REGISTRY_FILE}`,
      });
    }

    for (const file of registered) {
      if (onDisk.includes(file)) continue;
      problems.push({
        file,
        field: '(arquivo)',
        reason: `está em ${REGISTRY_FILE}, mas o arquivo não existe`,
      });
    }
  }

  return problems;
}

/** As linhas finais (problemas, `… mais K` e o fecho), prontas para o teste ou para o build. */
export function reportLines(problems: readonly ContentProblem[]): string[] {
  return formatProblems(problems);
}
