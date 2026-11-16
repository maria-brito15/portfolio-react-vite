import { z } from 'zod';
import type { Localized } from '../../types';
import { LocalizedTextSchema, typeNameInPt } from './localized';

export interface ContentTag {
  id: string;
  label: Localized;
}

const TAG_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Motivo (PT) de um identificador que não vale, ou `null`. O hífen só separa partes (DQ-004). */
export function tagIdProblem(value: unknown): string | null {
  if (value === undefined) return 'identificador ausente';
  if (typeof value !== 'string') return `esperado texto, recebido ${typeNameInPt(value)}`;
  if (value === '') return 'identificador vazio';
  if (TAG_ID.test(value)) return null;
  if (value.startsWith('-')) return `identificador "${value}" não pode começar com hífen`;
  if (value.endsWith('-')) return `identificador "${value}" não pode terminar com hífen`;
  if (value.includes('--')) return `identificador "${value}" não pode ter dois hífens seguidos`;

  return `identificador "${value}" fora do formato (minúsculas, números e hífen)`;
}

const TagIdSchema = z.unknown().superRefine((value, ctx) => {
  const problem = tagIdProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

export const TagSchema = z.strictObject({
  id: TagIdSchema,
  label: LocalizedTextSchema,
}) as unknown as z.ZodType<ContentTag>;

// Cada item passa pelo `TagSchema` (problemas com o caminho do item) e a unicidade é conferida
// ao mesmo tempo, para uma etiqueta com formato errado não esconder uma repetida.
// Unicidade por conjunto, não global (EC-09). Lista vazia é válida.
export const TagSetSchema = z.unknown().superRefine((value, ctx) => {
  if (!Array.isArray(value)) {
    ctx.addIssue({
      code: 'custom',
      message: `esperado lista de etiquetas, recebido ${typeNameInPt(value)}`,
    });

    return;
  }

  const firstSeen = new Map<string, number>();

  value.forEach((item: unknown, index) => {
    const parsed = TagSchema.safeParse(item);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({ ...issue, path: [index, ...issue.path] } as Parameters<
          typeof ctx.addIssue
        >[0]);
      }
    }

    const id = (item as { id?: unknown } | null)?.id;

    if (typeof id !== 'string' || !TAG_ID.test(id)) return;

    const first = firstSeen.get(id);

    if (first === undefined) {
      firstSeen.set(id, index);

      return;
    }

    ctx.addIssue({
      code: 'custom',
      path: [index, 'id'],
      message: `identificador repetido "${id}" (já usado em [${first}])`,
    });
  });
}) as unknown as z.ZodType<ContentTag[]>;
