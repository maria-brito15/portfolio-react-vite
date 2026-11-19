import { z } from 'zod';
import type { Localized } from '../../types';
import { ContentDateSchema, type ContentDate } from './date';
import { LocalizedTextSchema } from './localized';
import { withNoPlaceholders } from './placeholder';
import { tagIdProblem } from './tag';

export interface ContentExperience {
  id: string;
  highlight?: boolean;
  period: { start: ContentDate; label: Localized };
  org: Localized;
  role: Localized;
  description: Localized;
  tag?: Localized;
}

export interface ContentExperienceGroup {
  id: string;
  title: Localized;
  items: ContentExperience[];
}

const IdSchema = z.unknown().superRefine((value, ctx) => {
  const problem = tagIdProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

const ItemSchema = z.strictObject({
  id: IdSchema,
  highlight: z.boolean().optional(),
  period: z.strictObject({ start: ContentDateSchema, label: LocalizedTextSchema }),
  org: LocalizedTextSchema,
  role: LocalizedTextSchema,
  description: LocalizedTextSchema,
  tag: LocalizedTextSchema.optional(),
});

const GroupSchema = z.strictObject({
  id: IdSchema,
  title: LocalizedTextSchema,
  items: z.array(ItemSchema).min(1, 'o grupo precisa de pelo menos 1 experiência'),
});

const MONTH_FIRST = /^\s*\d{1,2}\/\d{4}/;

// TD-006: o rótulo é o texto do período como é hoje; o início estruturado só pode dizer o que o
// rótulo diz. Mês no início só quando o rótulo mostra `MM/AAAA`; nunca um mês inventado.
function periodProblem(start: ContentDate, labelPt: string): string | null {
  if (!labelPt.includes(String(start.year))) {
    return `o rótulo do período não contém o ano de início (${start.year})`;
  }

  if (start.month !== undefined) {
    const shown = `${String(start.month).padStart(2, '0')}/${start.year}`;

    return labelPt.includes(shown) ? null : `o rótulo do período não mostra o mês (${shown})`;
  }

  return MONTH_FIRST.test(labelPt)
    ? 'o rótulo mostra mês e o início não tem mês (mês não pode ser inventado nem escondido)'
    : null;
}

export const ExperienceGroupsSchema = withNoPlaceholders(
  z.array(GroupSchema).superRefine((groups, ctx) => {
    const groupIds = new Map<string, number>();
    const itemIds = new Map<string, string>();

    groups.forEach((group, gi) => {
      const groupId = group.id as unknown as string;

      if (groupIds.has(groupId)) {
        ctx.addIssue({
          code: 'custom',
          path: [gi, 'id'],
          message: `identificador de grupo repetido "${groupId}"`,
        });
      }

      groupIds.set(groupId, gi);

      group.items.forEach((item, ii) => {
        const id = item.id as unknown as string;
        const owner = itemIds.get(id);

        if (owner !== undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [gi, 'items', ii, 'id'],
            message: `identificador repetido "${id}" (já usado no grupo "${owner}")`,
          });
        }

        itemIds.set(id, groupId);

        const label = item.period.label as unknown as Localized;
        const problem = periodProblem(item.period.start as unknown as ContentDate, label.pt);

        if (problem) {
          ctx.addIssue({
            code: 'custom',
            path: [gi, 'items', ii, 'period', 'label', 'pt'],
            message: problem,
          });
        }
      });
    });
  }),
) as unknown as z.ZodType<ContentExperienceGroup[]>;
