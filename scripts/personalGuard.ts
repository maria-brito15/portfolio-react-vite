// Trava de publicação do espaço cultural (CL-14). Enquanto a fonte estiver em modo `mock`
// (dados fictícios), o build de PRODUÇÃO da Netlify falha: dado inventado nunca vai ao ar por
// esquecimento. Previews de deploy e `npm run build` local continuam funcionando.
import type { Plugin } from 'vite';
import { parseMode, type PersonalMode } from '../src/services/integrations/parseMode';

export const GUARD_MESSAGE =
  'personalGuard: a fonte do espaço cultural está em modo "mock" (dados fictícios) e este é um build de produção. ' +
  'Defina VITE_PERSONAL_SOURCE=live com as integrações prontas (docs/specs/personal/tasks.md, Fase 2 em diante) ' +
  'ou publique a partir de um deploy de preview.';

// `context` é o `CONTEXT` da Netlify: `production`, `deploy-preview`, `branch-deploy` ou `dev`.
export function assertSourceMode({ mode, context }: { mode: PersonalMode; context?: string }) {
  if (mode === 'mock' && context === 'production') throw new Error(GUARD_MESSAGE);
}

export function personalGuardPlugin(): Plugin {
  return {
    name: 'portfolio-personal-guard',
    // Só no build: `vite` (dev) e o Vitest usam mock à vontade.
    apply: 'build',
    configResolved(config) {
      // `config.env` já traz as variáveis VITE_* do ambiente e dos arquivos .env.
      assertSourceMode({
        mode: parseMode(config.env.VITE_PERSONAL_SOURCE),
        context: process.env.CONTEXT,
      });
    },
  };
}
