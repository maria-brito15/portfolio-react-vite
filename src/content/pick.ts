import type { Lang, Localized } from '../types';

/**
 * Lê o texto de um idioma e só dele. Se faltar, lança: nunca devolve a chave nem o texto do
 * outro idioma como reserva (FR-015, TD-005). A falta é barrada antes, na validação (FR-007).
 */
export function pick(text: Localized, lang: Lang): string {
  const value: unknown = text?.[lang];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `texto ausente em "${lang}": o conteúdo deveria ter sido recusado na validação`,
    );
  }

  return value;
}
