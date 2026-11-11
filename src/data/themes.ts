// Tabela única de temas. O `id` é o valor de `data-theme` (e o que fica salvo
// em `localStorage`); cada tema é só um bloco de tokens em `tokens.css`.
// O script inline do `index.html` repete os ids (não pode importar este
// arquivo); um teste confere que as duas listas não divergem.
import type { Localized, Theme } from '../types';
import { fold } from './routes';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface ThemeInfo {
  id: Theme;
  names: Localized;
  // Esquema de cor de base: os temas novos são todos escuros.
  scheme: 'dark' | 'light';
}

export const themes: ThemeInfo[] = [
  { id: 'dark', names: L('escuro', 'dark'), scheme: 'dark' },
  { id: 'light', names: L('claro', 'light'), scheme: 'light' },
  { id: 'dracula', names: L('dracula', 'dracula'), scheme: 'dark' },
  { id: 'solarized', names: L('solarized', 'solarized'), scheme: 'dark' },
  { id: 'amber', names: L('ambar', 'amber'), scheme: 'dark' },
];

export const DEFAULT_THEME: Theme = 'dark';

export const isTheme = (value: unknown): value is Theme =>
  themes.some((theme) => theme.id === value);

// Tema pelo id ou por qualquer nome (PT/EN), sem acento e sem caixa.
export function findTheme(arg: unknown) {
  const key = fold(arg);

  return themes.find((t) => t.id === key || fold(t.names.pt) === key || fold(t.names.en) === key);
}
