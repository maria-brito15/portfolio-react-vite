// Schema dos créditos do rodapé (FR-036, FR-037, TD-020). Os valores ficam em
// src/content/credits.content.ts, que só importa o tipo (regra de lint dos arquivos de conteúdo).
import { z } from 'zod';
import { LocalizedTextSchema } from './localized';

export const CreditsSchema = z.strictObject({
  writer: z.string().trim().min(1),
  shotIn: LocalizedTextSchema,
  cast: z
    .array(
      z.strictObject({
        package: z.string().trim().min(1),
        name: z.string().trim().min(1),
      }),
    )
    .min(1),
});

export type Credits = z.infer<typeof CreditsSchema>;
