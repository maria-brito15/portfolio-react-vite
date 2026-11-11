// Página /agora: no que a Duda está focada neste momento. EM CONSTRUÇÃO: o
// conteúdo é dela e começa vazio de propósito (nada de texto inventado). Enquanto
// `items` estiver vazio, a página e o comando mostram o aviso e a rota fica fora
// do sitemap e do índice dos buscadores (`draft` em routes.ts).
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

export const now: NowContent = { updated: null, items: [] };
