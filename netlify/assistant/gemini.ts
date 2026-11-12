// Chamada à API REST do Gemini (D5), sem SDK. A chave só existe aqui, no servidor.
export type GeminiResult = { ok: true; text: string } | { ok: false; error: 'quota' | 'down' };

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
export const TIMEOUT_MS = 20_000;

export async function callGemini(
  { apiKey, model, body }: { apiKey: string; model: string; body: unknown },
  fetchFn: typeof fetch = fetch,
): Promise<GeminiResult> {
  let res: Response;

  try {
    res = await fetchFn(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { ok: false, error: 'down' };
  }

  // 429: cota ou limite de taxa do nível gratuito (IA-17).
  if (res.status === 429) return { ok: false, error: 'quota' };
  if (!res.ok) return { ok: false, error: 'down' };

  try {
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');

    return text ? { ok: true, text } : { ok: false, error: 'down' };
  } catch {
    return { ok: false, error: 'down' };
  }
}
