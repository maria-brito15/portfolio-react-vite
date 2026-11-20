// Página "agora" (spec 003, T4.5). Conteúdo da Duda, copiado de `src/data/now.ts` sem alteração
// (informado em 11/11/2026). A rota continua com o estado de rascunho que `routeStatus.ts` lê do módulo
// antigo até a spec 007 reescrever a página.
import type { ContentNow } from './schema/now';

export const now: ContentNow = {
  updated: '2026-11-11',
  items: [
    {
      label: { pt: 'Foco', en: 'Focus' },
      text: {
        pt: 'Specification-Driven Development (SDD), desenvolvimento agêntico e IA.',
        en: 'Specification-Driven Development (SDD), agentic development and AI.',
      },
    },
  ],
};
