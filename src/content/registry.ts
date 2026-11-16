// Registro explícito: liga cada arquivo de conteúdo ao seu schema (design TD-002).
// Explícito (e não `import.meta.glob`) porque o `vite.config.ts` o importa direto, e lá não há glob.
// Um `*.content.ts` que existe no disco e não está aqui é problema de verificação (EC-10).
import type { ZodType } from 'zod';

export interface RegistryEntry {
  /** Caminho relativo à raiz do projeto, com `/`: `src/content/exemplo.content.ts`. */
  file: string;
  schema: ZodType;
  data: unknown;
}

// Vazio hoje: lista vazia é válida (EC-11). A spec 003 acrescenta o primeiro conteúdo real.
export const registry: RegistryEntry[] = [];
