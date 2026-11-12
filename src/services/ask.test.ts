import { ASK_ENDPOINT, MAX_QUESTION, askAssistant } from './ask';

const reply = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

const base = { question: 'O que ela estuda?', lang: 'pt' as const };

describe('cliente do assistente (IA-02, IA-03, IA-07, IA-22)', () => {
  it('envia o contrato certo para /api/ask', async () => {
    const fetchFn = reply(200, { answer: 'Engenharia de Software.', sources: [] });

    await askAssistant(
      {
        ...base,
        persona: 'tech',
        history: [{ q: 'oi', a: 'olá' }],
      },
      fetchFn,
    );

    const [url, init] = fetchFn.mock.calls[0];

    expect(url).toBe(ASK_ENDPOINT);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      q: 'O que ela estuda?',
      lang: 'pt',
      persona: 'tech',
      history: [{ q: 'oi', a: 'olá' }],
    });
  });

  it('sem persona, o campo nem é enviado; histórico longo é cortado em 6', async () => {
    const fetchFn = reply(200, { answer: 'ok', sources: [] });

    await askAssistant(
      { ...base, history: Array.from({ length: 9 }, (_, i) => ({ q: `q${i}`, a: `a${i}` })) },
      fetchFn,
    );

    const sent = JSON.parse(fetchFn.mock.calls[0][1].body);

    expect(sent).not.toHaveProperty('persona');
    expect(sent.history.map((t: { q: string }) => t.q)).toEqual([
      'q3',
      'q4',
      'q5',
      'q6',
      'q7',
      'q8',
    ]);
  });

  it('devolve a resposta e só as fontes com caminho do próprio site', async () => {
    const fetchFn = reply(200, {
      answer: '  Estuda Engenharia.  ',
      sources: [
        { id: 'sobre', label: 'Sobre', path: '/sobre' },
        { id: 'x', label: 'Fora', path: 'https://evil.example' },
        { id: 'y', label: 'Protocolo', path: '//evil.example' },
        { id: 'z', label: 1, path: '/z' },
      ],
    });

    expect(await askAssistant(base, fetchFn)).toEqual({
      ok: true,
      answer: 'Estuda Engenharia.',
      sources: [{ id: 'sobre', label: 'Sobre', path: '/sobre' }],
    });
  });

  it('pergunta vazia ou acima de 300 caracteres nem sai do navegador', async () => {
    const fetchFn = reply(200, { answer: 'x', sources: [] });

    expect(await askAssistant({ ...base, question: '   ' }, fetchFn)).toEqual({
      ok: false,
      error: 'invalid',
    });
    expect(
      await askAssistant({ ...base, question: 'x'.repeat(MAX_QUESTION + 1) }, fetchFn),
    ).toEqual({ ok: false, error: 'too-long' });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it.each([
    [429, { error: 'rate' }, 'rate'],
    [503, { error: 'quota' }, 'quota'],
    [403, { error: 'region' }, 'region'],
    [403, { error: 'origin' }, 'down'],
    [400, { error: 'invalid' }, 'invalid'],
    [502, { error: 'down' }, 'down'],
    [500, { error: 'coisa-nova' }, 'down'],
    [429, {}, 'rate'],
    [404, {}, 'down'],
  ])('HTTP %i %j → %s', async (status, body, error) => {
    expect(await askAssistant(base, reply(status, body))).toEqual({ ok: false, error });
  });

  it('corpo ilegível ou sem resposta vira down', async () => {
    const html = vi.fn().mockResolvedValue(new Response('<html>', { status: 200 }));

    expect(await askAssistant(base, html)).toEqual({ ok: false, error: 'down' });
    expect(await askAssistant(base, reply(200, { answer: '  ' }))).toEqual({
      ok: false,
      error: 'down',
    });
    expect(await askAssistant(base, reply(200, {}))).toEqual({ ok: false, error: 'down' });
  });

  it('sem rede → offline; pergunta cancelada → aborted', async () => {
    expect(await askAssistant(base, vi.fn().mockRejectedValue(new TypeError('falha')))).toEqual({
      ok: false,
      error: 'offline',
    });

    const abort = Object.assign(new Error('cancelado'), { name: 'AbortError' });

    expect(await askAssistant(base, vi.fn().mockRejectedValue(abort))).toEqual({
      ok: false,
      error: 'aborted',
    });
  });
});
