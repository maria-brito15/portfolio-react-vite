import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../router';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ThemeProvider } from '../hooks/useTheme';
import { PERSONA_KEY, PersonaProvider } from '../hooks/usePersona';
import { TerminalProvider } from '../terminal/TerminalSession';
import { trails } from '../data/trails';
import { subscribeTrailEvents, type TrailEvent } from './events';
import { TRAIL_KEY, resetTrailMemory } from './storage';
import { TrailProvider, useTrail } from './TrailProvider';
import TourHost from './TourHost';

// Todas as âncoras das trilhas existem nesta página falsa; o tour é testado isolado
// (com as páginas de verdade ele é testado em TrailCard.test.tsx).
const ANCHORS = [
  ...new Set(trails.flatMap((t) => t.steps.flatMap((s) => (s.anchor ? [s.anchor] : [])))),
];

function FakePage({ withAnchors }: { withAnchors: boolean }) {
  return (
    <main>
      <h1>Página</h1>
      {withAnchors &&
        ANCHORS.map((id) => (
          <section key={id} id={id}>
            {id}
          </section>
        ))}
    </main>
  );
}

function Start() {
  const { start, steps, doneCount } = useTrail();

  return (
    <>
      <button onClick={start}>começar</button>
      <output aria-label="feitos">
        {doneCount}/{steps.length}
      </output>
    </>
  );
}

function setup(persona: string, { withAnchors = true } = {}) {
  localStorage.setItem(PERSONA_KEY, persona);
  window.history.replaceState(null, '', '/');

  return render(
    <RouterProvider>
      <LanguageProvider>
        <ThemeProvider>
          <PersonaProvider>
            <TrailProvider>
              <TerminalProvider>
                <Start />
                <FakePage withAnchors={withAnchors} />
                <TourHost />
              </TerminalProvider>
            </TrailProvider>
          </PersonaProvider>
        </ThemeProvider>
      </LanguageProvider>
    </RouterProvider>,
  );
}

const dialog = () => screen.findByRole('dialog');
const saved = () => JSON.parse(localStorage.getItem(TRAIL_KEY) ?? 'null');

beforeEach(() => resetTrailMemory());

describe('abrir e navegar (TR-11)', () => {
  it('abre com o título, o contador, o texto do passo e leva à página dele', async () => {
    const user = userEvent.setup();

    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));

    const card = await dialog();

    expect(card).toHaveAccessibleName('Trilha guiada: Resumo em 60 segundos');
    expect(card).toHaveTextContent('1 de 5');
    expect(card).toHaveTextContent('Comece pelo resumo: quem é a Duda e o que ela busca.');
    await waitFor(() => expect(window.location.pathname).toBe('/curriculo'));
  });

  it('o foco vai para o cartão, que não prende nem fecha o resto da página', async () => {
    const user = userEvent.setup();

    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));

    const card = await dialog();

    await waitFor(() => expect(card).toHaveFocus());
    expect(card).toHaveAttribute('aria-modal', 'false');
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
  });

  it('o anel destaca o alvo, é decorativo, e some quando o alvo não existe (TR-13)', async () => {
    const user = userEvent.setup();
    const first = setup('rh');

    await user.click(screen.getByRole('button', { name: 'começar' }));
    await dialog();

    const ring = await waitFor(() => {
      const el = document.querySelector('.tour-ring');

      expect(el).not.toBeNull();

      return el as HTMLElement;
    });

    expect(ring).toHaveAttribute('aria-hidden', 'true');
    first.unmount();
    localStorage.clear();
    resetTrailMemory();

    // Mesma trilha numa página sem os elementos: o cartão aparece, sem anel e sem erro.
    setup('rh', { withAnchors: false });
    await userEvent.setup().click(screen.getByRole('button', { name: 'começar' }));
    expect(await dialog()).toHaveTextContent('Comece pelo resumo');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(document.querySelector('.tour-ring')).toBeNull();
  });

  it('anterior, próximo e o contador acompanham os passos', async () => {
    const user = userEvent.setup();

    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));

    const card = await dialog();
    const previous = screen.getByRole('button', { name: 'Anterior' });

    expect(previous).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(card).toHaveTextContent('2 de 5');
    expect(card).toHaveTextContent('competências técnicas');

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(card).toHaveTextContent('1 de 5');
  });

  it('o último passo oferece "Concluir", que mostra a mensagem final; "Sair" fecha', async () => {
    const user = userEvent.setup();

    setup('cliente');
    await user.click(screen.getByRole('button', { name: 'começar' }));
    await dialog();

    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));

    const end = screen.getByRole('dialog');

    expect(end).toHaveTextContent('Trilha concluída');
    expect(end).toHaveTextContent('Pronto. É só preencher o formulário quando quiser.');
    expect(document.querySelector('.tour-ring')).toBeNull();
    expect(saved().trails.cliente.finished).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('sair a qualquer hora (TR-12)', () => {
  it('Esc fecha, devolve o foco a quem abriu e reabrir continua do mesmo passo', async () => {
    const user = userEvent.setup();

    setup('rh');

    const opener = screen.getByRole('button', { name: 'começar' });

    await user.click(opener);
    await dialog();
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await user.click(screen.getByRole('button', { name: 'Próximo' }));

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
    expect(saved().trails.rh.step).toBe(2);

    await user.click(opener);
    expect(await dialog()).toHaveTextContent('3 de 5');
  });

  it('o botão "Sair" também fecha', async () => {
    const user = userEvent.setup();

    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));
    await dialog();
    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('tipos de passo (TR-14 a TR-17)', () => {
  it('"ver" conclui ao chegar', async () => {
    const user = userEvent.setup();

    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));
    await dialog();

    await waitFor(() => expect(screen.getByLabelText('feitos')).toHaveTextContent('1/5'));
  });

  it('"fazer" mostra o comando, roda pelo botão e conclui quando o comando roda', async () => {
    const user = userEvent.setup();
    const events: TrailEvent[] = [];
    const stop = subscribeTrailEvents((e) => events.push(e));

    setup('tech');
    await user.click(screen.getByRole('button', { name: 'começar' }));
    await dialog();
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Próximo' }));

    const card = await dialog();

    expect(card).toHaveTextContent('No terminal, rode');
    expect(card.querySelector('code')).toHaveTextContent('stats');
    expect(card).not.toHaveTextContent('✓ feito');

    await user.click(screen.getByRole('button', { name: /rodar/ }));
    expect(events).toContainEqual({ type: 'command', name: 'stats' });
    expect(await screen.findByText(/✓ feito/)).toBeInTheDocument();
    stop();
  });

  it('"agir" com link: abre o destino, conclui o passo e mostra a mensagem final', async () => {
    const user = userEvent.setup();

    setup('cliente');
    await user.click(screen.getByRole('button', { name: 'começar' }));
    await dialog();
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Próximo' }));

    await user.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(window.location.pathname + window.location.hash).toBe('/servicos#contato');
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Pronto. É só preencher o formulário quando quiser.',
    );
    expect(saved().trails.cliente.done).toContain('orcamento');
    expect(saved().trails.cliente.finished).toBe(true);
  });

  it('"agir" imprimir: chama a impressão e marca o passo, sem fechar', async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});

    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));
    await dialog();
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole('button', { name: 'Próximo' }));

    await user.click(screen.getByRole('button', { name: 'Imprimir / salvar em PDF' }));
    expect(print).toHaveBeenCalledTimes(1);
    expect(saved().trails.rh.done).toContain('curriculo-pdf');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    print.mockRestore();
  });
});

describe('movimento reduzido, robôs e idioma (TR-23, TR-26)', () => {
  const stubMotion = (reduce: boolean) =>
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: reduce,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    );

  it('com movimento reduzido a rolagem é instantânea; sem ele, suave', async () => {
    for (const [reduce, behavior] of [
      [true, 'auto'],
      [false, 'smooth'],
    ] as const) {
      const scroll = vi.fn();

      window.scrollTo = scroll as never;
      stubMotion(reduce);
      localStorage.clear();
      resetTrailMemory();

      const { unmount } = setup('rh');

      await userEvent.setup().click(screen.getByRole('button', { name: 'começar' }));
      await dialog();
      await waitFor(() =>
        expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ behavior })),
      );
      unmount();
    }
    window.scrollTo = (() => {}) as never;
  });

  it('para robôs de busca o tour não é montado', async () => {
    const agent = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Googlebot/2.1');
    const user = userEvent.setup();

    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    agent.mockRestore();
  });

  it('em inglês os botões e o texto do passo vêm em inglês', async () => {
    const user = userEvent.setup();

    localStorage.setItem('portfolio-lang', 'en');
    setup('rh');
    await user.click(screen.getByRole('button', { name: 'começar' }));

    const card = await dialog();

    expect(card).toHaveAccessibleName('Guided trail: 60-second summary');
    expect(card).toHaveTextContent('1 of 5');
    expect(card).toHaveTextContent('Start with the summary');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exit' })).toBeInTheDocument();
  });
});
