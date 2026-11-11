// Página /setup (uses): ferramentas e setup do dia a dia. EM CONSTRUÇÃO: o
// conteúdo é da Duda e começa vazio de propósito (nada de texto inventado).
// Enquanto não houver grupos, a página e o comando mostram o aviso e a rota fica
// fora do sitemap e do índice dos buscadores (`draft` em routes.ts).
import type { Localized } from '../types';

export interface UsesItem {
  name: string;
  note?: Localized;
}

export interface UsesGroup {
  title: Localized;
  items: UsesItem[];
}

export interface UsesContent {
  updated: string | null;
  groups: UsesGroup[];
}

export const uses: UsesContent = { updated: null, groups: [] };
