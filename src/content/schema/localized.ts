import { z } from 'zod';
import { LANGS, type Localized } from '../../types';

// U+200B a U+200D e U+FEFF não são espaço para `trim()`, mas não mostram nada (EC-01).
const INVISIBLE = new RegExp(
  `[${String.fromCharCode(0x200b)}-${String.fromCharCode(0x200d)}${String.fromCharCode(0xfeff)}]`,
  'g',
);

const TYPE_NAMES = new Map<string, string>([
  ['string', 'texto'],
  ['number', 'número'],
  ['boolean', 'booleano'],
  ['bigint', 'número'],
  ['function', 'função'],
]);

/** Nome do tipo em PT, para a frase "esperado X, recebido Y". */
export function typeNameInPt(value: unknown): string {
  if (value === null) return 'nulo';
  if (Array.isArray(value)) return 'lista';
  if (typeof value === 'object') return 'objeto';

  return TYPE_NAMES.get(typeof value) ?? 'valor';
}

/** Motivo (PT) de um texto que não vale, ou `null` quando vale. */
export function textProblem(value: unknown): string | null {
  if (value === undefined) return 'texto ausente';
  if (typeof value !== 'string') return `esperado texto, recebido ${typeNameInPt(value)}`;
  if (value.replace(INVISIBLE, '').trim() === '') return 'texto vazio (só espaços)';

  return null;
}

// Escrito à mão (e não com `z.object`) porque o zod só roda a checagem de chaves extras quando
// as chaves obrigatórias passam, e aqui `{pt, em}` precisa acusar as duas coisas de uma vez.
export const LocalizedTextSchema = z.unknown().superRefine((value, ctx) => {
  if (value === undefined) {
    ctx.addIssue({ code: 'custom', message: 'texto ausente' });

    return;
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    ctx.addIssue({
      code: 'custom',
      message: `esperado objeto com ${LANGS.join(' e ')}, recebido ${typeNameInPt(value)}`,
    });

    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!(LANGS as readonly string[]).includes(key)) {
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: `idioma não suportado "${key}" (aceitos: ${LANGS.join(', ')})`,
      });
    }
  }

  for (const lang of LANGS) {
    const problem = textProblem(record[lang]);

    if (problem) ctx.addIssue({ code: 'custom', path: [lang], message: problem });
  }
}) as unknown as z.ZodType<Localized>;

export type LocalizedText = Localized;
