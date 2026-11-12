import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { RouterProvider } from '../../router';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { PERSONA_KEY } from '../../hooks/usePersona';
import { commandCatalog } from '../catalog';
import { complete, findCommand, runCommand } from '../commands';
import { MAX_PER_SESSION, resetAskSession } from './ask';

const terminalInput = () => screen.getByRole('textbox', { name: 'Linha de comando do terminal' });
const log = () => document.querySelector<HTMLElement>('.term-log')!;

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(terminalInput(), `${line}{Enter}`);
}

const ok = (answer: string, sources: unknown[] = []) =>
  vi
    .fn()
    .mockImplementation(
      async () => new Response(JSON.stringify({ answer, sources }), { status: 200 }),
    );
const fail = (status: number, error: string) =>
  vi.fn().mockImplementation(async () => new Response(JSON.stringify({ error }), { status }));

beforeEach(() => {
  sessionStorage.clear();
  resetAskSession();
});

describe('comando pergunte (IA-01)', () => {
  it('existe em PT e EN, aparece no Tab, na ajuda e no catálogo', async () => {
    const user = userEvent.setup();

    expect(findCommand('pergunte')?.names).toEqual(['pergunte', 'ask']);
    expect(findCommand('ask')).toBe(findCommand('pergunte'));
    expect(complete('perg', 'pt')).toBe('pergunte ');
    expect(complete('as', 'en')).toBe('ask ');
    expect(commandCatalog().find((c) => c.id === 'pergunte')?.needsArg).toBe(true);

    renderApp();
    await run(user, 'ajuda');
    expect(log()).toHaveTextContent(/pergunte/);
  });

  it('sem argumento explica o uso, com exemplos clicáveis, e não chama a rede', async () => {
    const user = userEvent.setup();
    const fetchFn = ok('x');

    vi.stubGlobal('fetch', fetchFn);
    renderApp();
    await run(user, 'pergunte');

    expect(log()).toHaveTextContent('responde só com o que está neste site');
    expect(log().querySelectorAll('.t-run')).toHaveLength(3);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});

describe('resposta, fontes e aviso (IA-05, IA-21, IA-25)', () => {
  it('mostra "consultando…", depois a resposta e as fontes como links do site', async () => {
    const user = userEvent.setup();
    let release!: (r: Response) => void;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise<Response>((resolve) => (release = resolve))),
    );
    renderApp();
    await run(user, 'pergunte "o que ela estuda?"');

    expect(log()).toHaveTextContent('consultando o conteúdo do site…');
    expect(log().querySelector('.t-ask')).toHaveAttribute('aria-busy', 'true');

    release(
      new Response(
        JSON.stringify({
          answer: 'Estuda Engenharia de Software.',
          sources: [{ id: 'sobre', label: 'Sobre', path: '/sobre' }],
        }),
        { status: 200 },
      ),
    );

    expect(await screen.findByText('Estuda Engenharia de Software.')).toBeInTheDocument();
    expect(log()).toHaveTextContent('fontes:');
    expect(within(log()).getByRole('link', { name: 'Sobre' })).toHaveAttribute('href', '/sobre');
    expect(log().querySelector('.t-ask')).not.toHaveAttribute('aria-busy');
  });

  it('o aviso de dados aparece só na primeira pergunta da sessão', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', ok('Resposta.'));
    renderApp();

    await run(user, 'pergunte primeira');
    await screen.findByText('Resposta.');
    expect(log()).toHaveTextContent(/enviada a um serviço de IA externo/);
    expect(log()).toHaveTextContent(/maiores de 18 anos/);

    await run(user, 'pergunte segunda');
    await screen.findByText('Resposta.');
    expect(log()).not.toHaveTextContent(/enviada a um serviço de IA externo/);
  });

  it('em inglês, tudo o que é do site vem em inglês', async () => {
    const user = userEvent.setup();

    localStorage.setItem('portfolio-lang', 'en');
    vi.stubGlobal('fetch', fail(503, 'quota'));
    renderApp();
    await user.type(
      screen.getByRole('textbox', { name: /terminal command line/i }),
      'ask hello{Enter}',
    );

    expect(await screen.findByText(/reached its free limit/)).toBeInTheDocument();
    expect(log()).toHaveTextContent(/may use and review it/);
  });
});

describe('estados de erro (IA-03, IA-22, IA-23)', () => {
  it.each([
    [fail(403, 'region'), /não está disponível na sua região/],
    [fail(429, 'rate'), /muitas perguntas em pouco tempo/],
    [fail(503, 'quota'), /atingiu o limite gratuito de hoje/],
    [fail(502, 'down'), /indisponível agora/],
    [fail(404, ''), /indisponível agora/],
    [vi.fn().mockRejectedValue(new TypeError('x')), /sem conexão/],
  ])('mensagem própria, sem erro técnico (%#)', async (fetchFn, message) => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', fetchFn);
    renderApp();
    await run(user, 'pergunte oi');

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(log()).not.toHaveTextContent(/TypeError|undefined|NetworkError/);
  });

  it('erro do servidor oferece o contato; o terminal segue livre para outros comandos', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', fail(502, 'down'));
    renderApp();
    await run(user, 'pergunte oi');
    await screen.findByText(/indisponível agora/);
    expect(screen.getByRole('link', { name: 'contato' })).toHaveAttribute('href', '/contato');

    await run(user, 'ajuda');
    expect(log()).toHaveTextContent(/Comandos disponíveis/);
  });

  it('pergunta acima de 300 caracteres é recusada no cliente (IA-07)', async () => {
    const user = userEvent.setup();
    const fetchFn = ok('x');

    vi.stubGlobal('fetch', fetchFn);
    renderApp();
    await user.click(terminalInput());
    await user.paste(`pergunte ${'a'.repeat(301)}`);
    await user.keyboard('{Enter}');

    expect(log()).toHaveTextContent('pergunta longa demais (no máximo 300 caracteres)');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it(`depois de ${MAX_PER_SESSION} perguntas a sessão para de chamar a rede`, () => {
    const ctx = {
      lang: 'pt' as const,
      theme: 'dark' as const,
      history: [],
      replay: false,
      toggleLang: () => {},
      toggleTheme: () => {},
      setTheme: () => {},
    };

    vi.stubGlobal('fetch', ok('x'));
    for (let i = 0; i < MAX_PER_SESSION; i++) runCommand(`pergunte q${i}`, ctx);

    const { container } = render(
      <RouterProvider>
        <LanguageProvider>{runCommand('pergunte mais', ctx).output('pt')}</LanguageProvider>
      </RouterProvider>,
    );

    expect(container).toHaveTextContent('limite de 20 perguntas nesta sessão');
    expect(container.querySelector('a[href="/contato"]')).not.toBeNull();
  });
});

describe('histórico, persona e replay (IA-04, IA-12, D8)', () => {
  it('a 2ª pergunta leva a 1ª como histórico, e a persona escolhida vai junto', async () => {
    const user = userEvent.setup();
    const fetchFn = ok('Resposta.');

    localStorage.setItem(PERSONA_KEY, 'tech');
    vi.stubGlobal('fetch', fetchFn);
    renderApp();

    await run(user, 'pergunte primeira');
    await screen.findByText('Resposta.');
    await run(user, 'pergunte segunda');
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));

    const first = JSON.parse(fetchFn.mock.calls[0][1].body);
    const second = JSON.parse(fetchFn.mock.calls[1][1].body);

    expect(first.history).toEqual([]);
    expect(first.persona).toBe('tech');
    expect(second.history).toEqual([{ q: 'primeira', a: 'Resposta.' }]);
  });

  it('histórico restaurado (recarregar a página) não chama a rede e avisa', () => {
    const fetchFn = ok('x');

    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['pergunte "oi"']));
    vi.stubGlobal('fetch', fetchFn);
    renderApp();

    expect(log()).toHaveTextContent('resposta não guardada');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('o assistente só devolve texto: a saída não tem botão de ação nem formulário', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', ok('Texto <b>puro</b>'));
    renderApp();
    await run(user, 'pergunte oi');

    expect(await screen.findByText('Texto <b>puro</b>')).toBeInTheDocument();
    expect(log().querySelector('.t-ask b, .t-ask form, .t-ask button')).toBeNull();
  });
});
