import type { Lang } from '../types';
import type { PersonaId } from '../data/personas';
import { MAX_ANSWER_IN_HISTORY, MAX_HISTORY, MAX_QUESTION } from '../../netlify/assistant/validate';

// Cliente do assistente (`POST /api/ask`, função em netlify/functions/ask.mts).
// Converte tudo o que pode dar errado em um código que a interface sabe traduzir
// (IA-03): nenhum erro técnico chega à tela, e a falta da função (dev, preview sem
// variável, rede) é só "indisponível" (IA-22).
export { MAX_QUESTION };

export interface AskSource {
  id: string;
  label: string;
  path: string;
}

export type AskFailure =
  | 'invalid' // pergunta vazia ou fora do contrato
  | 'too-long' // acima do limite; nem sai do navegador (IA-07)
  | 'region' // EEA, Reino Unido e Suíça (IA-23)
  | 'rate' // limite por IP (IA-16)
  | 'quota' // cota do provedor ou teto global (IA-17, IA-24)
  | 'down' // função ausente, erro do servidor ou resposta ilegível
  | 'offline' // sem conexão
  | 'aborted'; // a pergunta foi cancelada (a saída saiu da tela)

export type AskOutcome =
  { ok: true; answer: string; sources: AskSource[] } | { ok: false; error: AskFailure };

export interface AskTurn {
  q: string;
  a: string;
}

export interface AskRequest {
  question: string;
  lang: Lang;
  persona?: PersonaId;
  history?: AskTurn[];
  signal?: AbortSignal;
}

export const ASK_ENDPOINT = '/api/ask';

const SERVER_ERRORS: Partial<Record<string, AskFailure>> = {
  invalid: 'invalid',
  region: 'region',
  rate: 'rate',
  quota: 'quota',
  down: 'down',
};

const failure = (error: AskFailure): AskOutcome => ({ ok: false, error });

function readSources(value: unknown): AskSource[] {
  if (!Array.isArray(value)) return [];

  // Só caminhos do próprio site viram link (nada de URL externa vinda da resposta).
  return value.filter(
    (s): s is AskSource =>
      typeof s === 'object' &&
      s !== null &&
      typeof s.id === 'string' &&
      typeof s.label === 'string' &&
      typeof s.path === 'string' &&
      s.path.startsWith('/') &&
      !s.path.startsWith('//'),
  );
}

export async function askAssistant(
  { question, lang, persona, history = [], signal }: AskRequest,
  fetchFn: typeof fetch = fetch,
): Promise<AskOutcome> {
  const q = question.trim();

  if (!q) return failure('invalid');
  if (q.length > MAX_QUESTION) return failure('too-long');

  let res: Response;

  try {
    res = await fetchFn(ASK_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        q,
        lang,
        ...(persona ? { persona } : {}),
        history: history
          .slice(-MAX_HISTORY)
          .map((t) => ({ q: t.q.slice(0, MAX_QUESTION), a: t.a.slice(0, MAX_ANSWER_IN_HISTORY) })),
      }),
      signal,
    });
  } catch (error) {
    if ((error as { name?: string } | null)?.name === 'AbortError') return failure('aborted');

    return failure('offline');
  }

  let data: unknown;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const body = (typeof data === 'object' && data !== null ? data : {}) as Record<string, unknown>;

  if (!res.ok) {
    // 404 (sem função, como em `npm run dev`) e qualquer código desconhecido: indisponível.
    return failure(SERVER_ERRORS[String(body.error)] ?? (res.status === 429 ? 'rate' : 'down'));
  }

  if (typeof body.answer !== 'string' || !body.answer.trim()) return failure('down');

  return { ok: true, answer: body.answer.trim(), sources: readSources(body.sources) };
}
