// Fonte dos dados culturais: `mock` (Fase 1, dados fictícios) ou `live` (APIs reais). Vem de
// `VITE_PERSONAL_SOURCE`; sem a variável, ou com qualquer outro valor, vale `mock`. O build de
// produção recusa `mock` (scripts/personalGuard.ts), então um erro de digitação nunca publica
// dado falso.
//
// Este módulo também é lido no Node (o `seoPlugin` importa `routes.ts`, que decide `draft` pelo
// modo). Lá não há `import.meta.env`; a variável vem do ambiente do processo, que é onde a
// Netlify a define. Um `.env` local só vale para o navegador.
import { parseMode } from './parseMode';

export { parseMode, type PersonalMode } from './parseMode';

const raw =
  import.meta.env?.VITE_PERSONAL_SOURCE ??
  (typeof process === 'undefined' ? undefined : process.env.VITE_PERSONAL_SOURCE);

export const personalMode = parseMode(raw);
