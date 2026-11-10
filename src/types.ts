// Tipos compartilhados: idioma, textos nos dois idiomas e datas de precisão variável.

export type Lang = 'pt' | 'en';

export type Localized<T = string> = Record<Lang, T>;

export type Theme = 'light' | 'dark';

// `month` (1–12) só existe quando foi confirmado; nunca se preenche um valor presumido.
export interface ProjectDate {
  year: number;
  month?: number;
}

export interface Dated {
  date: ProjectDate;
}
