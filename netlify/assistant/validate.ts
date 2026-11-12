// Validação da entrada (IA-18, IA-07). Nada aqui chama o modelo.
import { PERSONA_IDS, type PersonaId } from '../../src/data/personas';

export const MAX_QUESTION = 300;
export const MAX_ANSWER_IN_HISTORY = 1000;
export const MAX_HISTORY = 6;
export const MAX_BODY_BYTES = 16_000;

export type AskLang = 'pt' | 'en';

export interface HistoryItem {
  q: string;
  a: string;
}

export interface AskInput {
  q: string;
  lang: AskLang;
  persona?: PersonaId;
  history: HistoryItem[];
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// Devolve a entrada limpa ou `null` quando qualquer coisa está fora do contrato.
export function parseBody(raw: string): AskInput | null {
  if (raw.length > MAX_BODY_BYTES) return null;

  let body: unknown;

  try {
    body = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(body)) return null;

  const { q, lang, persona, history } = body;

  if (typeof q !== 'string') return null;

  const question = q.trim();

  if (!question || question.length > MAX_QUESTION) return null;
  if (lang !== 'pt' && lang !== 'en') return null;
  if (persona !== undefined && !PERSONA_IDS.includes(persona as PersonaId)) return null;
  if (history !== undefined && !Array.isArray(history)) return null;

  const items: HistoryItem[] = [];

  for (const item of (history as unknown[] | undefined) ?? []) {
    if (!isRecord(item) || typeof item.q !== 'string' || typeof item.a !== 'string') return null;
    if (item.q.length > MAX_QUESTION || item.a.length > MAX_ANSWER_IN_HISTORY) return null;
    items.push({ q: item.q, a: item.a });
  }

  if (items.length > MAX_HISTORY) return null;

  return { q: question, lang, persona: persona as PersonaId | undefined, history: items };
}
