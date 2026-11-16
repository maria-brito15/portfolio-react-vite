import type { ZodError } from 'zod';

/** Limite de problemas mostrados; o resto vira `… mais K` (design §6.2). */
export const MAX_PROBLEMS = 50;

/** Um problema, no formato fixo: `conteúdo inválido: <arquivo> › <campo> — <motivo>`. */
export interface ContentProblem {
  file: string;
  field: string;
  reason: string;
}

export function problemLine({ file, field, reason }: ContentProblem): string {
  return `conteúdo inválido: ${file} › ${field} — ${reason}`;
}

/** `['lista', 2, 'capa', 'alt', 'en']` vira `lista[2].capa.alt.en`; caminho vazio vira `(arquivo)`. */
export function formatPath(path: readonly PropertyKey[]): string {
  if (path.length === 0) return '(arquivo)';

  return path.reduce<string>((acc, key) => {
    if (typeof key === 'number') return `${acc}[${key}]`;

    return acc === '' ? String(key) : `${acc}.${String(key)}`;
  }, '');
}

/** Converte os problemas do zod em problemas de conteúdo, com a mensagem em PT. */
export function problemsFromZod(file: string, error: ZodError): ContentProblem[] {
  return error.issues.flatMap((issue): ContentProblem[] => {
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => ({
        file,
        field: formatPath([...issue.path, key]),
        reason: `campo não suportado "${key}"`,
      }));
    }

    return [{ file, field: formatPath(issue.path), reason: issue.message }];
  });
}

/** Linhas finais: até 50 problemas, `… mais K` e o fecho `N problema(s) em M arquivo(s)`. */
export function formatProblems(problems: readonly ContentProblem[]): string[] {
  if (problems.length === 0) return [];

  const lines = problems.slice(0, MAX_PROBLEMS).map(problemLine);
  const hidden = problems.length - MAX_PROBLEMS;
  const files = new Set(problems.map((p) => p.file)).size;

  if (hidden > 0) lines.push(`… mais ${hidden}`);
  lines.push(`${problems.length} problema(s) em ${files} arquivo(s)`);

  return lines;
}
