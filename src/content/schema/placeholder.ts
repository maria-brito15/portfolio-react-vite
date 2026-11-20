import { z } from 'zod';

// Marcador de pendência ou texto de exemplo (003, FR-012). `[]` vazio não casa: só colchetes com texto.
// `TODO` só em maiúsculas: "todo" é uma palavra comum em português ("quase todo estudante"). `lorem ipsum`,
// `TBD` e `FIXME` valem em qualquer caixa; nenhum é marcador dentro de outra palavra.
const PATTERNS: readonly { re: RegExp; reason: string }[] = [
  { re: /\[[^\]]+\]/, reason: 'marcador [entre colchetes] (texto de exemplo ou pendência)' },
  { re: /lorem ipsum/i, reason: 'texto de exemplo "lorem ipsum"' },
  { re: /\bTODO\b/, reason: 'marcador "TODO"' },
  { re: /\bTBD\b/i, reason: 'marcador "TBD"' },
  { re: /\bFIXME\b/i, reason: 'marcador "FIXME"' },
];

function problemFor(text: string): string | null {
  for (const { re, reason } of PATTERNS) if (re.test(text)) return reason;

  return null;
}

function walk(value: unknown, path: PropertyKey[], ctx: z.RefinementCtx): void {
  if (typeof value === 'string') {
    const reason = problemFor(value);

    if (reason) ctx.addIssue({ code: 'custom', path, message: reason });

    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, [...path, index], ctx));

    return;
  }

  if (typeof value === 'object' && value !== null) {
    for (const [key, item] of Object.entries(value)) walk(item, [...path, key], ctx);
  }
}

/** Embrulha um schema raiz: depois de validar, recusa todo texto que pareça exemplo. Não altera o dado. */
export function withNoPlaceholders<T extends z.ZodType>(schema: T) {
  return schema.superRefine((data, ctx) => walk(data, [], ctx));
}
