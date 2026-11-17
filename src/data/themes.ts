// Tabela única de temas (claro e escuro). O `id` é o valor de `data-theme` (e o que fica salvo
// em `localStorage`); cada tema é só um bloco de tokens em `tokens.css`.
// O script inline do `index.html` repete os ids (não pode importar este
// arquivo); um teste confere que as duas listas não divergem.
import type { Lang, Localized, Theme } from '../types';
import { fold } from './routes';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface ThemeInfo {
  id: Theme;
  names: Localized;
  scheme: 'dark' | 'light';
}

// Dois temas só (spec 002, D-002): claro e escuro.
export const themes: ThemeInfo[] = [
  { id: 'dark', names: L('escuro', 'dark'), scheme: 'dark' },
  { id: 'light', names: L('claro', 'light'), scheme: 'light' },
];

// Reserva quando nenhum tema foi aplicado ainda. A T1.3 passa a resolver pelo sistema
// (`resolveTheme`, no módulo de boot); até lá, claro, que é o `:root` de tokens.css.
export const DEFAULT_THEME: Theme = 'light';

export const isTheme = (value: unknown): value is Theme =>
  themes.some((theme) => theme.id === value);

// Nome do tema no idioma. Sem texto de reserva (FR-015): id desconhecido lança, nunca devolve o id.
export function themeName(id: Theme, lang: Lang): string {
  const theme = themes.find((t) => t.id === id);

  if (!theme) throw new Error(`tema desconhecido: ${id}`);

  return theme.names[lang];
}

// Tema pelo id ou por qualquer nome (PT/EN), sem acento e sem caixa.
export function findTheme(arg: unknown) {
  const key = fold(arg);

  return themes.find((t) => t.id === key || fold(t.names.pt) === key || fold(t.names.en) === key);
}
