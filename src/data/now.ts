// Página /agora: no que a Duda está focada neste momento. O conteúdo é dela
// (informado em 11/11/2026); texto em inglês traduzido a partir do português.
// Enquanto `items` estiver vazio, a página e o comando mostram o aviso "em
// construção" e a rota fica fora do sitemap e do índice (`draft` em routes.ts).
import type { Localized } from '../types';

export interface NowItem {
  label: Localized;
  text: Localized;
}

export interface NowContent {
  // Data da última atualização, "AAAA-MM-DD"; exibida ao lado do conteúdo.
  updated: string | null;
  items: NowItem[];
}

export const now: NowContent = {
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
