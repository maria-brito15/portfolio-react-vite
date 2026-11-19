import { z } from 'zod';
import type { Localized } from '../../types';
import { LocalizedTextSchema } from './localized';
import { withNoPlaceholders } from './placeholder';
import { tagIdProblem } from './tag';

export interface ContentSkill {
  name: string;
  since?: number;
  source?: Localized;
}

export interface ContentSkillGroup {
  id: string;
  title: Localized;
  items: ContentSkill[];
}

const IdSchema = z.unknown().superRefine((value, ctx) => {
  const problem = tagIdProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

const SkillSchema = z.strictObject({
  // Nome de tecnologia: não se traduz.
  name: z.string().trim().min(1, 'nome vazio'),
  since: z
    .number({ error: 'ano não é um número inteiro' })
    .int('ano não é inteiro')
    .min(1000, 'ano sem 4 dígitos')
    .max(9999, 'ano sem 4 dígitos')
    .optional(),
  source: LocalizedTextSchema.optional(),
});

const GroupSchema = z.strictObject({
  id: IdSchema,
  title: LocalizedTextSchema,
  items: z.array(SkillSchema).min(1, 'o grupo precisa de pelo menos 1 competência'),
});

// `since` e `source` juntos ou nenhum: ano sem fonte é estimativa, fonte sem ano é ruído (FR-005).
export const SkillGroupsSchema = withNoPlaceholders(
  z.array(GroupSchema).superRefine((groups, ctx) => {
    const groupIds = new Set<string>();

    groups.forEach((group, gi) => {
      const id = group.id as unknown as string;

      if (groupIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          path: [gi, 'id'],
          message: `identificador de grupo repetido "${id}"`,
        });
      }

      groupIds.add(id);

      const names = new Set<string>();

      group.items.forEach((item, ii) => {
        if (names.has(item.name)) {
          ctx.addIssue({
            code: 'custom',
            path: [gi, 'items', ii, 'name'],
            message: `competência repetida no grupo "${item.name}"`,
          });
        }

        names.add(item.name);

        if (item.since !== undefined && item.source === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [gi, 'items', ii, 'source'],
            message: 'ano de início sem fonte (informe o projeto ou curso, ou omita os dois)',
          });
        }

        if (item.source !== undefined && item.since === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [gi, 'items', ii, 'since'],
            message: 'fonte sem ano de início (informe o ano, ou omita os dois)',
          });
        }
      });
    });
  }),
) as unknown as z.ZodType<ContentSkillGroup[]>;
