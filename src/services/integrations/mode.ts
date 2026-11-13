// Fonte dos dados culturais: `mock` (Fase 1, dados fictícios) ou `live` (APIs reais). Vem de
// `VITE_PERSONAL_SOURCE`; sem a variável, ou com qualquer outro valor, vale `mock`. O build de
// produção recusa `mock` (T-CL3), então um erro de digitação nunca publica dado falso.
export type PersonalMode = 'mock' | 'live';

export const parseMode = (raw: unknown): PersonalMode => (raw === 'live' ? 'live' : 'mock');

export const personalMode = parseMode(import.meta.env.VITE_PERSONAL_SOURCE);
