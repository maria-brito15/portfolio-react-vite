// Registro explícito: liga cada arquivo de conteúdo ao seu schema (design TD-002).
// Explícito (e não `import.meta.glob`) porque o `vite.config.ts` o importa direto, e lá não há glob.
// Um `*.content.ts` que existe no disco e não está aqui é problema de verificação (EC-10).
import type { ZodType } from 'zod';
import { credits } from './credits.content';
import { academics } from './academics.content';
import { experienceGroups } from './experiences.content';
import { projects } from './projects.content';
import { resume } from './resume.content';
import { CreditsSchema } from './schema/credits';
import { AcademicsSchema } from './schema/academics';
import { ExperienceGroupsSchema } from './schema/experience';
import { ProjectsSchema } from './schema/project';
import { ResumeSchema } from './schema/resume';
import { SkillGroupsSchema } from './schema/skills';
import { skillGroups } from './skills.content';

export interface RegistryEntry {
  /** Caminho relativo à raiz do projeto, com `/`: `src/content/exemplo.content.ts`. */
  file: string;
  schema: ZodType;
  data: unknown;
}

export const registry: RegistryEntry[] = [
  { file: 'src/content/credits.content.ts', schema: CreditsSchema, data: credits },
  { file: 'src/content/projects.content.ts', schema: ProjectsSchema, data: projects },
  {
    file: 'src/content/experiences.content.ts',
    schema: ExperienceGroupsSchema,
    data: experienceGroups,
  },
  { file: 'src/content/academics.content.ts', schema: AcademicsSchema, data: academics },
  { file: 'src/content/skills.content.ts', schema: SkillGroupsSchema, data: skillGroups },
  { file: 'src/content/resume.content.ts', schema: ResumeSchema, data: resume },
];
