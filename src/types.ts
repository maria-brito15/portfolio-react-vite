// Tipos compartilhados: idioma, textos nos dois idiomas e datas de precisão variável.

export type Lang = 'pt' | 'en';

export type Localized<T = string> = Record<Lang, T>;

// Ids dos temas: a lista com nomes e esquema fica em `data/themes.ts`.
export type Theme = 'light' | 'dark' | 'dracula' | 'solarized' | 'amber';

// `month` (1–12) só existe quando foi confirmado; nunca se preenche um valor presumido.
export interface ProjectDate {
  year: number;
  month?: number;
}

export interface Dated {
  date: ProjectDate;
}
