import { z } from 'zod';
import type { Localized } from '../../types';
import { LocalizedTextSchema } from './localized';
import { withNoPlaceholders } from './placeholder';
import { tagIdProblem } from './tag';

export interface ContentResume {
  name: string;
  headline: Localized;
  location: Localized;
  languages: Localized;
  summary: Localized[];
  skillAreas: { label: Localized; text: Localized }[];
  featuredProjects: {
    project: string;
    subtitle: Localized;
    award?: Localized;
    points: Localized[];
  }[];
}

const IdSchema = z.unknown().superRefine((value, ctx) => {
  const problem = tagIdProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

// Um objeto, dois idiomas por campo (Q-004). Sem texto de interface (`print`, `showMore`…: 007) e
// sem nome nem link copiados do projeto: `featuredProjects[].project` aponta para ele (TD-008).
// Formação e reconhecimentos também não se repetem: vêm de `academics` e das experiências.
export const ResumeSchema = withNoPlaceholders(
  z.strictObject({
    name: z.string().trim().min(1, 'nome vazio'),
    headline: LocalizedTextSchema,
    location: LocalizedTextSchema,
    languages: LocalizedTextSchema,
    summary: z.array(LocalizedTextSchema).min(1, 'o resumo precisa de pelo menos 1 parágrafo'),
    skillAreas: z.array(z.strictObject({ label: LocalizedTextSchema, text: LocalizedTextSchema })),
    featuredProjects: z.array(
      z.strictObject({
        project: IdSchema,
        subtitle: LocalizedTextSchema,
        award: LocalizedTextSchema.optional(),
        points: z
          .array(LocalizedTextSchema)
          .min(1, 'o projeto em destaque precisa de pelo menos 1 ponto'),
      }),
    ),
  }),
) as unknown as z.ZodType<ContentResume>;
