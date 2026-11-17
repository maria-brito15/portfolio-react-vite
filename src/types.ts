// Tipos compartilhados: idioma, textos nos dois idiomas e datas de precisão variável.

// Os idiomas existem num lugar só: o tipo e a lista de execução saem daqui.
export const LANGS = ['pt', 'en'] as const;

export type Lang = (typeof LANGS)[number];

export type Localized<T = string> = Record<Lang, T>;

// Ids dos temas: a lista com nomes e esquema fica em `data/themes.ts`.
export type Theme = 'light' | 'dark';

// `month` (1–12) só existe quando foi confirmado; nunca se preenche um valor presumido.
export interface ProjectDate {
  year: number;
  month?: number;
}

export interface Dated {
  date: ProjectDate;
}
