import { z } from 'zod';
import { typeNameInPt } from './localized';

export const RATING_MIN = 0.5;
export const RATING_MAX = 5;
export const RATING_STEP = 0.5;

// Vírgula decimal, como o resto das mensagens em PT.
const show = (n: number) => String(n).replace('.', ',');
const VALID = `valores válidos: ${show(RATING_MIN)} a ${RATING_MAX}`;

/** Motivo (PT) de uma nota informada que não vale, ou `null`. Ausente não passa por aqui. */
export function ratingProblem(value: unknown): string | null {
  if (typeof value !== 'number') {
    return `esperado número, recebido ${typeNameInPt(value)}`;
  }
  if (!Number.isFinite(value)) return `nota ${show(value)} não é um número finito`;
  if (value === 0) return 'nota 0 inválida: sem nota é campo ausente';
  if (value < RATING_MIN || value > RATING_MAX) {
    return `nota ${show(value)} fora do intervalo (${VALID})`;
  }
  // Todo múltiplo de 0,5 é exato em ponto flutuante: o resto da divisão não tem arredondamento.
  if (value % RATING_STEP !== 0) {
    return `nota ${show(value)} fora do passo de ${show(RATING_STEP)} (${VALID})`;
  }

  return null;
}

// Opcional: sem nota é o campo ausente, nunca 0. `null` é recusado como qualquer não número.
export const RatingSchema = z
  .unknown()
  .superRefine((value, ctx) => {
    const problem = ratingProblem(value);

    if (problem) ctx.addIssue({ code: 'custom', message: problem });
  })
  .optional() as unknown as z.ZodType<number | undefined>;
