// Leitura pura do modo da fonte. Fica separada de `mode.ts` porque o plugin de build
// (scripts/personalGuard.ts) roda no Node, onde `import.meta.env` não existe.
export type PersonalMode = 'mock' | 'live';

export const parseMode = (raw: unknown): PersonalMode => (raw === 'live' ? 'live' : 'mock');
