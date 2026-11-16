import { z } from 'zod';
import type { ProjectDate } from '../../types';
import { typeNameInPt } from './localized';

export type ContentDate = ProjectDate;

const KEYS = ['year', 'month'];

function yearProblem(value: unknown): string | null {
  if (value === undefined) return 'ano ausente';
  if (typeof value !== 'number' || !Number.isInteger(value)) return 'ano não é inteiro';
  if (value < 1000 || value > 9999) return `ano sem 4 dígitos (recebido ${value})`;

  return null;
}

// `month` ausente = não confirmado. `null` é recusado: o campo não existe ou tem valor.
function monthProblem(value: unknown): string | null {
  if (value === undefined) return null;
  if (value === null) return 'mês nulo não é aceito (omita o campo quando não confirmado)';
  if (typeof value !== 'number' || !Number.isInteger(value)) return 'mês não é inteiro';
  if (value < 1 || value > 12) return `mês fora de 1 a 12 (recebido ${value})`;

  return null;
}

// Escrito à mão pelo mesmo motivo do `LocalizedText`: todos os problemas saem de uma vez.
export const ContentDateSchema = z.unknown().superRefine((value, ctx) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    ctx.addIssue({
      code: 'custom',
      message: `esperado objeto com year e month opcional, recebido ${typeNameInPt(value)}`,
    });

    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!KEYS.includes(key)) {
      ctx.addIssue({ code: 'custom', path: [key], message: `campo não suportado "${key}"` });
    }
  }

  const year = yearProblem(record.year);
  const month = monthProblem(record.month);

  if (year) ctx.addIssue({ code: 'custom', path: ['year'], message: year });
  if (month) ctx.addIssue({ code: 'custom', path: ['month'], message: month });
}) as unknown as z.ZodType<ContentDate>;
