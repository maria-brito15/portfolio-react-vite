import { z } from 'zod';
import { typeNameInPt } from './localized';

// Data com dia (`AAAA-MM-DD`), para "atualizado em". É a única primitiva de data com dia: a
// `ContentDate` da 001 guarda só ano e mês confirmado.
const FORMAT = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number): number {
  // Dia 0 do mês seguinte é o último dia deste mês; o ano bissexto sai do próprio calendário.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Motivo (PT) de uma data com dia que não vale, ou `null`. */
export function calendarDateProblem(value: unknown): string | null {
  if (value === undefined) return 'data ausente';
  if (typeof value !== 'string')
    return `esperado texto AAAA-MM-DD, recebido ${typeNameInPt(value)}`;

  const match = FORMAT.exec(value);

  if (!match) return `formato inválido "${value}" (esperado AAAA-MM-DD)`;

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];

  if (month < 1 || month > 12) return `mês fora de 1 a 12 (recebido ${month})`;
  if (day < 1 || day > daysInMonth(year, month)) {
    return `dia inexistente em ${match[1]}-${match[2]} (recebido ${day})`;
  }

  return null;
}

export const CalendarDateSchema = z.unknown().superRefine((value, ctx) => {
  const problem = calendarDateProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
}) as unknown as z.ZodType<string>;

export type CalendarDate = string;
