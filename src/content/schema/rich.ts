import { z } from 'zod';
import { LANGS, type Localized } from '../../types';
import { LocalizedTextSchema } from './localized';

const MARK = '**';
// `<` seguido de letra ou `/` é tag; `a < b` e `x <3` não são.
const HTML_TAG = /<[A-Za-z/]/;

/** Motivo (PT) de uma marcação que não vale, ou `null`. Texto sem `**` vale sempre. */
export function richProblem(text: string): string | null {
  if (HTML_TAG.test(text)) return 'tag HTML não é aceita (só **negrito**)';
  if (text.includes(`${MARK}${MARK}`)) return 'negrito vazio (****)';

  const marks = text.split(MARK).length - 1;

  if (marks % 2 !== 0) return 'negrito sem fechamento (** em número ímpar)';

  // `***` junta uma marca com um asterisco solto: é ambíguo e vira aninhamento.
  if (text.includes('***')) return 'negrito aninhado ou ambíguo (***)';

  return null;
}

// Texto com marcação, PT e EN. Só os campos declarados assim são lidos pelo `parseRich`.
export const RichTextSchema = LocalizedTextSchema.superRefine((value, ctx) => {
  if (typeof value !== 'object' || value === null) return;

  const record = value as Record<string, unknown>;

  for (const lang of LANGS) {
    const text = record[lang];

    if (typeof text !== 'string') continue;

    const problem = richProblem(text);

    if (problem) ctx.addIssue({ code: 'custom', path: [lang], message: problem });
  }
}) as unknown as z.ZodType<Localized>;

export type RichText = Localized;
