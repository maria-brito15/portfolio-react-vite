// Composição da home: só dado. Quais blocos, em que ordem e quais chamados. Os blocos leem os
// dados que já existem (projetos, GitHub, rotas); nada aqui é fato novo sobre a Duda, só texto
// de interface. É a composição padrão que vale para todo visitante (DQ-007: `quick`,
// `projects` e `github`).
import type { Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export type HomeBlockId = 'quick' | 'projects' | 'github';

export interface HomeBlock {
  id: HomeBlockId;
  // Blocos `half` vizinhos dividem a mesma linha.
  half?: boolean;
  title?: Localized;
  lead?: Localized;
  // Só para `projects`: ids de projeto, na ordem; sem a lista, valem os projetos com selo.
  projects?: string[];
}

export interface HomeAction {
  route: string;
  anchor?: string;
  label: Localized;
}

export interface HomeLayout {
  primary: HomeAction;
  secondary: HomeAction[];
  blocks: HomeBlock[];
}

export const HOME: HomeLayout = {
  primary: { route: 'projetos', label: L('Ver projetos', 'See projects') },
  secondary: [
    { route: 'curriculo', label: L('Currículo', 'Resume') },
    { route: 'terminal', label: L('Abrir o terminal', 'Open the terminal') },
  ],
  blocks: [{ id: 'quick' }, { id: 'projects' }, { id: 'github', half: true }],
};
