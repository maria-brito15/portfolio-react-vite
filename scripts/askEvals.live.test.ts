// Avaliação do assistente com o MODELO REAL (T-IA6). Fica desligada em `npm test`
// (gasta a cota gratuita e depende de rede e de chave). Para rodar:
//
//   PowerShell:  $env:ASK_EVAL='1'; $env:GEMINI_API_KEY='...'; $env:GEMINI_MODEL='...'; npm run ask:eval
//   bash:        ASK_EVAL=1 GEMINI_API_KEY=... GEMINI_MODEL=... npm run ask:eval
//
// Usa o mesmo núcleo da função (`handleAsk`), então testa o prompt, o esquema e a
// validação de fontes de verdade. Imprime cada resposta para leitura humana e grava
// o relatório em `test-results/ask-evals.json`. Procedimento: docs/specs/assistente-ia/evals.md.
import { mkdirSync, writeFileSync } from 'node:fs';
import { handleAsk } from '../netlify/assistant/handle';
import { cases, check } from './askEvals.cases';
import { buildContext } from './assistantContext';

const live =
  process.env.ASK_EVAL === '1' && !!process.env.GEMINI_API_KEY && !!process.env.GEMINI_MODEL;
const ORIGIN = 'https://eval.local';
const PAUSE_MS = 6_000; // folga para o limite por minuto do nível gratuito

const context = buildContext();
const report: Record<string, unknown>[] = [];

describe.skipIf(!live)('assistente com o modelo real', () => {
  afterAll(() => {
    mkdirSync('test-results', { recursive: true });
    writeFileSync('test-results/ask-evals.json', JSON.stringify(report, null, 2));
  });

  it.each(cases)(
    '$kind · $id',
    async (c) => {
      const req = new Request('https://eval.local/api/ask', {
        method: 'POST',
        headers: { origin: ORIGIN },
        body: JSON.stringify({ q: c.q, lang: c.lang, history: c.history ?? [] }),
      });
      const res = await handleAsk(
        req,
        { ip: 'eval', country: 'BR' },
        {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL,
          context,
          limiter: { check: async () => 'ok' },
          allowedOrigins: [ORIGIN],
          strictRegion: true,
        },
      );
      const body = await res.json();

      await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

      // Cota esgotada ou serviço fora do ar não é falha de qualidade: aborta a rodada.
      expect(res.status, `HTTP ${res.status}: ${JSON.stringify(body)}`).toBe(200);

      const problems = check(c, {
        answer: body.answer,
        sources: body.sources.map((s: { id: string }) => s.id),
      });

      report.push({
        id: c.id,
        kind: c.kind,
        q: c.q,
        answer: body.answer,
        sources: body.sources,
        problems,
      });
      console.log(
        `\n[${c.kind}] ${c.id}\n  P: ${c.q}\n  R: ${body.answer}\n  fontes: ${body.sources.map((s: { id: string }) => s.id).join(', ') || '(nenhuma)'}\n  ${problems.length ? `PROBLEMAS: ${problems.join('; ')}` : 'ok'}`,
      );
      expect(problems).toEqual([]);
    },
    60_000,
  );
});
