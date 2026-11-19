// Projetores do lado NOVO: leem o conteúdo em `src/content/*.content.ts`. Cada tarefa T4.x liga o seu.
import type { Fact } from './compare';
import type { Domain } from './legacyFacts';

export const newFacts: Partial<Record<Domain, () => Fact[]>> = {};
