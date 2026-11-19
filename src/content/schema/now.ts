import { z } from 'zod';
import type { Localized } from '../../types';
import { CalendarDateSchema } from './calendarDate';
import { LocalizedTextSchema } from './localized';
import { withNoPlaceholders } from './placeholder';

export interface ContentNow {
  updated?: string;
  items: { label: Localized; text: Localized }[];
}

export interface ContentUses {
  updated?: string;
  groups: { title: Localized; items: { name: string; note?: Localized }[] }[];
}

const NowObjectSchema = z.strictObject({
  updated: CalendarDateSchema.optional(),
  items: z.array(z.strictObject({ label: LocalizedTextSchema, text: LocalizedTextSchema })),
});

// "Agora" com itens sem data engana: quem lê acha que está atual. Sem itens, a data não é exigida.
export const NowSchema = withNoPlaceholders(
  NowObjectSchema.superRefine((now, ctx) => {
    if (now.items.length > 0 && now.updated === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['updated'],
        message: 'a data de atualização é obrigatória quando há itens (AAAA-MM-DD)',
      });
    }
  }),
) as unknown as z.ZodType<ContentNow>;

// Setup pode ter `groups: []` e continuar rascunho (a rota segue fora do índice dos buscadores).
export const UsesSchema = withNoPlaceholders(
  z.strictObject({
    updated: CalendarDateSchema.optional(),
    groups: z.array(
      z.strictObject({
        title: LocalizedTextSchema,
        items: z.array(
          z.strictObject({
            name: z.string().trim().min(1, 'nome vazio'),
            note: LocalizedTextSchema.optional(),
          }),
        ),
      }),
    ),
  }),
) as unknown as z.ZodType<ContentUses>;
