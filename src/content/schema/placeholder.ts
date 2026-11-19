import { z } from 'zod';

// Marcador de pendência ou texto de exemplo (003, FR-012). `[]` vazio não casa: só colchetes com texto.
// O `lorem ipsum` e as siglas valem em qualquer caixa; `TODO` dentro de outra palavra não é marcador.
const PATTERNS: readonly { re: RegExp; reason: string }[] = [
  { re: /\[[^\]]+\]/, reason: 'marcador [entre colchetes] (texto de exemplo ou pendência)' },
  { re: /lorem ipsum/i, reason: 'texto de exemplo "lorem ipsum"' },
  { re: /\bTODO\b/i, reason: 'marcador "TODO"' },
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
