// Núcleo do `POST /api/ask`, sem depender do ambiente da Netlify: tudo o que vem de
// fora (relógio, `fetch`, limite, contexto, chave) entra por `deps`, então os testes
// rodam sem rede. `functions/ask.mts` só liga isto ao ambiente real.
//
// Contrato (design.md): 200 { answer, sources } · 400 invalid · 403 region/origin ·
// 429 rate · 503 quota · 502 down. Nada é gravado: nem pergunta, nem resposta (IA-20).
import { callGemini } from './gemini';
import { MAX_ANSWER_CHARS, buildRequest, type ContextSection } from './prompt';
import { isBlocked } from './region';
import { parseBody, type AskLang } from './validate';

export type AskError = 'invalid' | 'region' | 'origin' | 'rate' | 'quota' | 'down';

const STATUS: Record<AskError, number> = {
  invalid: 400,
  region: 403,
  origin: 403,
  rate: 429,
  quota: 503,
  down: 502,
};

export type LimitResult = 'ok' | 'rate' | 'cap';

export interface Limiter {
  check(ip: string): Promise<LimitResult>;
}

export interface AskDeps {
  apiKey?: string;
  model?: string;
  context: { sections: ContextSection[] };
  limiter: Limiter;
  allowedOrigins: string[];
  // Produção: país desconhecido é recusado. Desenvolvimento local: não há geolocalização.
  strictRegion: boolean;
  fetchFn?: typeof fetch;
}

export interface AskRequestInfo {
  ip: string;
  country?: string;
}

const MAX_SOURCES = 4;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const fail = (error: AskError) => json(STATUS[error], { error });

// Origem do próprio site (ou localhost em desenvolvimento). `Origin` é falsificável
// fora do navegador: o limite por IP é a defesa de verdade (IA-19).
export function originAllowed(origin: string | null, allowed: string[]) {
  if (!origin) return false;
  if (allowed.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);

    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

interface ModelAnswer {
  answer: string;
  sourceIds: string[];
}

function parseModel(text: string): ModelAnswer | null {
  try {
    const data = JSON.parse(text) as unknown;

    if (typeof data !== 'object' || data === null) return null;

    const { answer, sourceIds } = data as Record<string, unknown>;

    if (typeof answer !== 'string' || !answer.trim()) return null;

    return {
      answer: answer.trim().slice(0, MAX_ANSWER_CHARS + 200),
      sourceIds: Array.isArray(sourceIds)
        ? sourceIds.filter((id): id is string => typeof id === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

// Só ids que existem no contexto viram fonte; o resto é descartado (D3).
function toSources(ids: string[], sections: ContextSection[], lang: AskLang) {
  const seen = new Set<string>();
  const sources: { id: string; label: string; path: string }[] = [];

  for (const id of ids) {
    const section = sections.find((s) => s.id === id);

    if (!section || seen.has(id)) continue;
    seen.add(id);
    sources.push({ id, label: section.label[lang], path: section.path });
    if (sources.length === MAX_SOURCES) break;
  }

  return sources;
}

export async function handleAsk(req: Request, info: AskRequestInfo, deps: AskDeps) {
  if (req.method !== 'POST') return fail('invalid');
  if (!originAllowed(req.headers.get('origin'), deps.allowedOrigins)) return fail('origin');
  if (isBlocked(info.country, deps.strictRegion)) return fail('region');

  const input = parseBody(await req.text());

  if (!input) return fail('invalid');

  // Sem chave ou modelo (preview sem variável, dev): degrada sem chamar nada (IA-22).
  if (!deps.apiKey || !deps.model) return fail('down');
  // Sem contexto o modelo responderia de cabeça: melhor indisponível do que inventar.
  if (!deps.context.sections.length) return fail('down');

  const limit = await deps.limiter.check(info.ip);

  if (limit === 'rate') return fail('rate');
  if (limit === 'cap') return fail('quota');

  const result = await callGemini(
    { apiKey: deps.apiKey, model: deps.model, body: buildRequest(input, deps.context.sections) },
    deps.fetchFn,
  );

  if (!result.ok) return fail(result.error);

  const parsed = parseModel(result.text);

  if (!parsed) return fail('down');

  return json(200, {
    answer: parsed.answer,
    sources: toSources(parsed.sourceIds, deps.context.sections, input.lang),
  });
}
