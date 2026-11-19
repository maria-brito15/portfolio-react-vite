// Projetores do lado ANTIGO: leem a forma antiga (`pt`/`en` aninhados, `null`, `ReactNode`) e devolvem fatos.
// Cada tarefa T4.x liga o seu domínio aqui. Escritos separadamente de `newFacts.ts` de propósito (TD-009).
import type { Fact } from './compare';

export const DOMAINS = [
  'projects',
  'experiences',
  'academics',
  'skills',
  'resume',
  'contact',
  'now',
  'uses',
] as const;

export type Domain = (typeof DOMAINS)[number];

export const legacyFacts: Partial<Record<Domain, () => Fact[]>> = {};
