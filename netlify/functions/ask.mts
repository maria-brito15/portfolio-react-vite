// Ponto de entrada de `POST /api/ask` na Netlify (Functions v2). Só liga o núcleo
// (`netlify/assistant/handle.ts`) ao ambiente real: variáveis, Blobs, geolocalização e
// o contexto gerado no build. Variáveis (nunca no código): GEMINI_API_KEY,
// GEMINI_MODEL, ASK_DAILY_CAP (padrão 200) e ASK_SALT (opcional).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getStore } from '@netlify/blobs';
import { handleAsk } from '../assistant/handle';
import { blobsCounter, createLimiter, memoryStore, withFallback } from '../assistant/limiter';
import type { ContextSection } from '../assistant/prompt';

interface NetlifyContext {
  ip?: string;
  geo?: { country?: { code?: string } };
}

const DEFAULT_DAILY_CAP = 200;

// Gerado por `npm run build` (scripts/assistantContext.ts). Sem ele, o assistente
// responde "indisponível": sem contexto o modelo inventaria (ver handle.ts).
function loadContext(): { sections: ContextSection[] } {
  const candidates = [
    new URL('../assistant/context.json', import.meta.url),
    join(process.cwd(), 'netlify/assistant/context.json'),
  ];

  for (const file of candidates) {
    try {
      return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      // tenta o próximo caminho
    }
  }

  return { sections: [] };
}

const context = loadContext();
const memory = memoryStore();

function limiter() {
  const env = process.env;
  const primary = (() => {
    try {
      return blobsCounter(getStore('ask-limits', { consistency: 'strong' }));
    } catch {
      return memory;
    }
  })();

  return createLimiter(withFallback(primary, memory), {
    perHour: 10,
    dailyCap: Number(env.ASK_DAILY_CAP) || DEFAULT_DAILY_CAP,
    salt: env.ASK_SALT ?? 'ask',
  });
}

export default async (req: Request, netlify: NetlifyContext) => {
  const env = process.env;

  return handleAsk(
    req,
    { ip: netlify.ip ?? 'unknown', country: netlify.geo?.country?.code },
    {
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      context,
      limiter: limiter(),
      // URL = endereço principal do site; DEPLOY_PRIME_URL = o do preview do deploy.
      allowedOrigins: [env.URL, env.DEPLOY_PRIME_URL, env.DEPLOY_URL].filter((url): url is string =>
        Boolean(url),
      ),
      // `netlify dev` não tem geolocalização; em produção, país ausente = recusa.
      strictRegion: env.NETLIFY_DEV !== 'true',
    },
  );
};

export const config = { path: '/api/ask' };
