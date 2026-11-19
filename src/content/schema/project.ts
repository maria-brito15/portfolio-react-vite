import { z } from 'zod';
import type { Localized } from '../../types';
import { compareDates } from '../dates';
import { ContentDateSchema, type ContentDate } from './date';
import { ImageSchema, type ContentImage } from './image';
import { LinkSchema } from './link';
import { LocalizedTextSchema } from './localized';
import { withNoPlaceholders } from './placeholder';
import { RichTextSchema } from './rich';
import { TagSetSchema, tagIdProblem, type ContentTag } from './tag';

export interface ContentProjectVersion {
  label: string;
  date: ContentDate;
  stack: Localized;
  description: Localized;
  points: Localized[];
}

export interface ContentProject {
  id: string;
  name: Localized;
  start: ContentDate;
  dateLabel?: Localized;
  stack: ContentTag[];
  repo?: string;
  caseStudy?: string;
  images: ContentImage[];
  badge?: Localized;
  description: Localized;
  versions?: ContentProjectVersion[];
}

/**
 * Identificador de etiqueta a partir do rótulo (TD-005): `Next.js 15` vira `next-js-15`,
 * `CI/CD` vira `ci-cd`, `JavaScript ES6+` vira `javascript-es6`. Usada pelo conteúdo e pelos testes.
 */
export function tagIdFromLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const IdSchema = z.unknown().superRefine((value, ctx) => {
  const problem = tagIdProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

const HttpsLinkSchema = LinkSchema.superRefine((value, ctx) => {
  if (typeof value === 'string' && !value.startsWith('https://')) {
    ctx.addIssue({ code: 'custom', message: 'precisa de https' });
  }
});

const InternalPathSchema = LinkSchema.superRefine((value, ctx) => {
  if (typeof value === 'string' && !value.startsWith('/')) {
    ctx.addIssue({ code: 'custom', message: 'precisa ser um caminho interno que começa com "/"' });
  }
});

const VersionSchema = z.strictObject({
  label: z.string().min(1, 'rótulo vazio'),
  date: ContentDateSchema,
  stack: LocalizedTextSchema,
  description: LocalizedTextSchema,
  // Um ponto é um par PT/EN: PT e EN nascem com o mesmo número de pontos.
  points: z.array(LocalizedTextSchema).min(1, 'a versão precisa de pelo menos 1 ponto'),
});

const ProjectObjectSchema = z.strictObject({
  id: IdSchema,
  name: LocalizedTextSchema,
  start: ContentDateSchema,
  dateLabel: LocalizedTextSchema.optional(),
  stack: TagSetSchema,
  repo: HttpsLinkSchema.optional(),
  caseStudy: InternalPathSchema.optional(),
  images: z.array(ImageSchema),
  badge: LocalizedTextSchema.optional(),
  description: RichTextSchema,
  versions: z.array(VersionSchema).optional(),
});

// Regras entre campos do mesmo projeto: rótulo de data com o ano de `start`; rótulos de versão
// únicos; versão não anterior ao início.
function crossRules(project: z.infer<typeof ProjectObjectSchema>, ctx: z.RefinementCtx): void {
  const start = project.start as unknown as ContentDate;

  if (project.dateLabel) {
    const label = project.dateLabel as unknown as Localized;

    for (const lang of ['pt', 'en'] as const) {
      if (!label[lang].includes(String(start.year))) {
        ctx.addIssue({
          code: 'custom',
          path: ['dateLabel', lang],
          message: `o rótulo de data não contém o ano de início (${start.year})`,
        });
      }
    }
  }

  const seen = new Set<string>();

  (project.versions ?? []).forEach((version, index) => {
    if (seen.has(version.label)) {
      ctx.addIssue({
        code: 'custom',
        path: ['versions', index, 'label'],
        message: `rótulo de versão repetido "${version.label}"`,
      });
    }

    seen.add(version.label);

    if (compareDates(start, version.date as unknown as ContentDate) === 'b-antes') {
      ctx.addIssue({
        code: 'custom',
        path: ['versions', index, 'date'],
        message: 'a versão é anterior ao início do projeto',
      });
    }
  });
}

export const ProjectSchema = withNoPlaceholders(
  ProjectObjectSchema.superRefine(crossRules),
) as unknown as z.ZodType<ContentProject>;

export const ProjectsSchema = withNoPlaceholders(
  z.array(ProjectObjectSchema.superRefine(crossRules)).superRefine((projects, ctx) => {
    const firstSeen = new Map<string, number>();

    projects.forEach((project, index) => {
      const id = project.id as unknown as string;
      const first = firstSeen.get(id);

      if (first !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: `identificador repetido "${id}" (já usado em [${first}])`,
        });
      } else {
        firstSeen.set(id, index);
      }
    });
  }),
) as unknown as z.ZodType<ContentProject[]>;
