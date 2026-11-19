import { z } from 'zod';
import type { Localized } from '../../types';
import { LocalizedTextSchema } from './localized';
import { withNoPlaceholders } from './placeholder';
import { tagIdProblem } from './tag';

export type Modality = 'presencial' | 'hibrida' | 'virtual';

export interface ContentCourse {
  name: Localized;
  hours?: number;
  modality?: Modality;
  grade?: number;
}

export interface ContentSemester {
  id: string;
  label: Localized;
  program: string;
  inProgress?: boolean;
  courses: ContentCourse[];
}

export interface ContentProgram {
  id: string;
  institution: string;
  degree: Localized;
  start: number;
  end: number;
  expected?: boolean;
}

export interface ContentActivityRef {
  kind: 'project' | 'experience';
  id: string;
}

export interface ContentAcademics {
  programs: ContentProgram[];
  timeline: { year: number; label: Localized }[];
  years: { year: number; items: ContentActivityRef[] }[];
  semesters: ContentSemester[];
}

const IdSchema = z.unknown().superRefine((value, ctx) => {
  const problem = tagIdProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

// Ano de 4 dígitos, inteiro (mesma regra da `ContentDate`, aqui sem mês).
const YearSchema = z
  .number({ error: 'ano não é um número inteiro' })
  .int('ano não é inteiro')
  .min(1000, 'ano sem 4 dígitos')
  .max(9999, 'ano sem 4 dígitos');

const SEMESTER_ID = /^\d{4}-[1-9]$/;

// `grade`: número finito >= 0, sem teto. O schema não inventa a escala da instituição (Q-002).
const CourseSchema = z.strictObject({
  name: LocalizedTextSchema,
  hours: z
    .number()
    .int('carga horária não é inteira')
    .positive('carga horária precisa ser > 0')
    .optional(),
  modality: z
    .enum(['presencial', 'hibrida', 'virtual'], {
      error: 'modalidade fora da lista (presencial, hibrida, virtual)',
    })
    .optional(),
  grade: z.number({ error: 'nota não é um número' }).min(0, 'nota negativa').optional(),
});

const ProgramSchema = z.strictObject({
  id: IdSchema,
  institution: z.string().min(1, 'instituição vazia'),
  degree: LocalizedTextSchema,
  start: YearSchema,
  end: YearSchema,
  expected: z.boolean().optional(),
});

const SemesterSchema = z.strictObject({
  id: z.string().regex(SEMESTER_ID, 'id de semestre fora do formato AAAA-N'),
  label: LocalizedTextSchema,
  program: IdSchema,
  inProgress: z.boolean().optional(),
  // Semestre em andamento pode não ter disciplina ainda.
  courses: z.array(CourseSchema),
});

const ActivitySchema = z.strictObject({
  kind: z.enum(['project', 'experience'], { error: 'kind precisa ser project ou experience' }),
  id: IdSchema,
});

const AcademicsObjectSchema = z.strictObject({
  programs: z.array(ProgramSchema),
  timeline: z.array(z.strictObject({ year: YearSchema, label: LocalizedTextSchema })),
  years: z.array(z.strictObject({ year: YearSchema, items: z.array(ActivitySchema) })),
  semesters: z.array(SemesterSchema),
});

// A referência `semesters[].program` é regra do schema (o dado está no mesmo arquivo). A de
// `years[].items[].id` aponta para outros arquivos e fica na verificação entre arquivos (T5.1).
export const AcademicsSchema = withNoPlaceholders(
  AcademicsObjectSchema.superRefine((academics, ctx) => {
    const programIds = new Set<string>();

    academics.programs.forEach((program, index) => {
      const id = program.id as unknown as string;

      if (programIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['programs', index, 'id'],
          message: `identificador repetido "${id}"`,
        });
      }

      programIds.add(id);

      if (program.end < program.start) {
        ctx.addIssue({
          code: 'custom',
          path: ['programs', index, 'end'],
          message: `o fim (${program.end}) é anterior ao início (${program.start})`,
        });
      }
    });

    const semesterIds = new Set<string>();

    academics.semesters.forEach((semester, index) => {
      if (semesterIds.has(semester.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['semesters', index, 'id'],
          message: `id de semestre repetido "${semester.id}"`,
        });
      }

      semesterIds.add(semester.id);

      const program = semester.program as unknown as string;

      if (!programIds.has(program)) {
        ctx.addIssue({
          code: 'custom',
          path: ['semesters', index, 'program'],
          message: `programa inexistente "${program}" (programas: ${[...programIds].join(', ')})`,
        });
      }
    });
  }),
) as unknown as z.ZodType<ContentAcademics>;
