// Fonte dos dados culturais: `mock` (Fase 1, dados fictícios) ou `live` (APIs reais). Vem de
// `VITE_PERSONAL_SOURCE`; sem a variável, ou com qualquer outro valor, vale `mock`. O build de
// produção recusa `mock` (scripts/personalGuard.ts), então um erro de digitação nunca publica
// dado falso.
import { parseMode } from './parseMode';

export { parseMode, type PersonalMode } from './parseMode';

export const personalMode = parseMode(import.meta.env.VITE_PERSONAL_SOURCE);
