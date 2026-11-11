import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { BEST_KEY } from './bestTimes';
import Minesweeper from './Minesweeper';

const input = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
const log = () => document.querySelector<HTMLElement>('.term-log')!;
const cells = () => screen.getAllByRole('button', { name: /^linha \d+, coluna \d+/ });
const cell = (row: number, col: number) =>
  screen.getByRole('button', { name: new RegExp(`^linha ${row}, coluna ${col},`) });
const status = () => screen.getByRole('status');

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(input(), `${line}{Enter}`);
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.setItem('portfolio-booted', '1');
});
afterEach(() => vi.useRealTimers());

describe('tabuleiro (JG-05, JG-07)', () => {
  it('9×9 no nível fácil, com contador de minas, cronômetro e estado inicial', () => {
    render(<Minesweeper lang="pt" level="easy" />);
    expect(cells()).toHaveLength(81);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('0s')).toBeInTheDocument();
    expect(status()).toHaveTextContent('clique em uma casa para começar');
  });

  it('cada casa é um botão com aria-label completo, nos dois idiomas', () => {
    const { rerender } = render(<Minesweeper lang="pt" level="easy" />);

    expect(cell(3, 4)).toHaveAccessibleName('linha 3, coluna 4, fechada');
    rerender(<Minesweeper lang="en" level="easy" />);
    expect(screen.getByRole('button', { name: 'row 3, column 4, closed' })).toBeInTheDocument();
  });

  it('o número aparece como dígito e a bandeira como símbolo, nunca só cor', async () => {
    const user = userEvent.setup();

    render(<Minesweeper lang="pt" level="easy" />);
    await user.click(cell(5, 5));

    const opened = cells().filter((c) => c.classList.contains('is-open'));

    expect(opened.length).toBeGreaterThan(0);
    for (const c of opened) {
      const near = Number(/(\d) minas? vizinhas?/.exec(c.getAttribute('aria-label')!)?.[1] ?? 0);

      expect(c.textContent).toBe(near ? String(near) : '');
    }
    await user.keyboard('f');
    await user.click(screen.getByRole('button', { name: /modo bandeira/ }));
    await user.click(cells().find((c) => !c.classList.contains('is-open'))!);
    expect(cells().find((c) => c.textContent === '⚑')).toHaveAccessibleName(/bandeira/);
  });

  it('o primeiro clique nunca perde e inicia o cronômetro, que para ao reiniciar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Minesweeper lang="pt" level="easy" />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('0s')).toBeInTheDocument(); // não corre antes do clique
    await user.click(cell(1, 1));
    expect(status()).toHaveTextContent('jogando');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/^[3-9]s$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reiniciar/ }));
    expect(screen.getByText('0s')).toBeInTheDocument();
    expect(status()).toHaveTextContent('clique em uma casa para começar');
  });
});

describe('mouse, toque e teclado (JG-06)', () => {
  it('clique direito marca e desmarca, e o contador de minas acompanha', () => {
    render(<Minesweeper lang="pt" level="easy" />);
    fireEvent.contextMenu(cell(1, 1));
    expect(cell(1, 1)).toHaveAccessibleName('linha 1, coluna 1, bandeira');
    expect(screen.getByText('9')).toBeInTheDocument();
    fireEvent.contextMenu(cell(1, 1));
    expect(cell(1, 1)).toHaveAccessibleName('linha 1, coluna 1, fechada');
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('o modo bandeira troca o clique por marcar', async () => {
    const user = userEvent.setup();

    render(<Minesweeper lang="pt" level="easy" />);

    const toggle = screen.getByRole('button', { name: /modo bandeira: desligado/ });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: /modo bandeira: ligado/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(cell(2, 2));
    expect(cell(2, 2)).toHaveAccessibleName('linha 2, coluna 2, bandeira');
    expect(status()).toHaveTextContent('clique em uma casa'); // marcar não inicia a partida
  });

  it('toque longo marca a casa e o clique seguinte não a abre', () => {
    vi.useFakeTimers();
    render(<Minesweeper lang="pt" level="easy" />);
    fireEvent.pointerDown(cell(3, 3), { pointerType: 'touch' });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(cell(3, 3)).toHaveAccessibleName('linha 3, coluna 3, bandeira');
    fireEvent.pointerUp(cell(3, 3));
    fireEvent.click(cell(3, 3));
    expect(cell(3, 3)).toHaveAccessibleName('linha 3, coluna 3, bandeira');
  });

  it('toque curto não marca (cancela o temporizador)', () => {
    vi.useFakeTimers();
    render(<Minesweeper lang="pt" level="easy" />);
    fireEvent.pointerDown(cell(3, 3), { pointerType: 'touch' });
    fireEvent.pointerUp(cell(3, 3));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(cell(3, 3)).toHaveAccessibleName('linha 3, coluna 3, fechada');
  });

  it('setas movem o foco e param nas bordas; só uma casa fica na ordem do Tab', async () => {
    const user = userEvent.setup();

    render(<Minesweeper lang="pt" level="easy" />);
    expect(cell(1, 1)).toHaveFocus();
    expect(cells().filter((c) => c.tabIndex === 0)).toHaveLength(1);
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(cell(2, 2)).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowLeft}{ArrowLeft}');
    expect(cell(1, 1)).toHaveFocus();
    expect(cell(1, 1).tabIndex).toBe(0);
  });

  it('F marca a casa focada, Enter abre, R reinicia', async () => {
    const user = userEvent.setup();

    render(<Minesweeper lang="pt" level="easy" />);
    await user.keyboard('{ArrowRight}f');
    expect(cell(1, 2)).toHaveAccessibleName(/bandeira/);
    await user.keyboard('f{ArrowRight}{Enter}');
    expect(status()).toHaveTextContent('jogando');
    await user.keyboard('r');
    expect(status()).toHaveTextContent('clique em uma casa para começar');
    expect(cells().every((c) => /fechada/.test(c.getAttribute('aria-label')!))).toBe(true);
  });

  it('Esc sai do jogo e devolve o foco para a linha de comando', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'minas');
    expect(await screen.findByRole('group', { name: 'Campo minado' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('group', { name: 'Campo minado' })).toBeNull();
    expect(log()).toHaveTextContent('partida encerrada');
    expect(input()).toHaveFocus();
  });
});

describe('fim de partida (JG-05, JG-08)', () => {
  // Joga com sorteio fixo: abre casa por casa até o jogo acabar.
  function playToTheEnd(user: ReturnType<typeof userEvent.setup>) {
    return (async () => {
      for (let i = 0; i < 81 && !/ganhou|bum/.test(status().textContent ?? ''); i++) {
        const next = cells().find((c) => /fechada/.test(c.getAttribute('aria-label')!));

        if (!next) break;
        await user.click(next);
      }
    })();
  }

  it('o resultado é anunciado em região aria-live e nada mais se mexe', async () => {
    const user = userEvent.setup();

    render(<Minesweeper lang="pt" level="easy" />);
    expect(status()).toHaveAttribute('aria-live', 'polite');
    await playToTheEnd(user);
    expect(status().textContent).toMatch(/ganhou em \d+s|bum! você pisou numa mina/);

    // depois do fim, clicar numa casa fechada não muda mais nada
    const closed = cells().find((c) => /fechada/.test(c.getAttribute('aria-label')!));

    if (closed) {
      await user.click(closed);
      expect(closed).toHaveAccessibleName(/fechada/);
    }
  });

  it('ao ganhar grava o melhor tempo só no navegador; ao perder não grava', async () => {
    const user = userEvent.setup();

    // sorteio com minas fixas: a única casa livre fora do pânico é a clicada e as vizinhas
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      render(<Minesweeper lang="pt" level="easy" />);
      await playToTheEnd(user);
    } finally {
      random.mockRestore();
    }
    if (/ganhou/.test(status().textContent ?? '')) {
      expect(JSON.parse(localStorage.getItem(BEST_KEY) as string).easy).toBeGreaterThanOrEqual(0);
      expect(status()).toHaveTextContent('Novo recorde!');
    } else {
      expect(localStorage.getItem(BEST_KEY)).toBeNull();
    }
  });

  it('mostra o melhor tempo já guardado', () => {
    localStorage.setItem(BEST_KEY, '{"easy":42}');
    render(<Minesweeper lang="pt" level="easy" />);
    expect(screen.getByText(/melhor: 42s/)).toBeInTheDocument();
  });
});

describe('comandos (JG-01, JG-04, JG-09)', () => {
  it('jogos lista os três níveis e entra na ajuda junto com minas', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'jogos');

    const options = [...log().querySelectorAll('.t-index-list li')].map((li) => li.textContent);

    expect(options).toHaveLength(3);
    expect(options[0]).toContain('minas');
    expect(options[1]).toContain('minas medio');
    expect(options[2]).toContain('minas dificil');
    await run(user, 'ajuda');

    const listed = [...log().querySelectorAll('.t-help dl:first-of-type dt .t-cmd')].map(
      (e) => e.textContent,
    );

    expect(listed).toEqual(expect.arrayContaining(['minas', 'jogos']));
  });

  it('minas abre o tabuleiro sob demanda, no nível pedido, em PT e EN', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'minas medio');
    expect(await screen.findByRole('group', { name: 'Campo minado' })).toBeInTheDocument();
    expect(cells()).toHaveLength(256);
    await run(user, 'minesweeper hard');
    await screen.findByRole('group', { name: /Campo minado|Minesweeper/ });
    expect(document.querySelectorAll('.ms-cell')).toHaveLength(480);
    await run(user, 'minas DIFÍCIL');
    await screen.findByRole('group', { name: /Campo minado/ });
    expect(document.querySelectorAll('.ms-cell')).toHaveLength(480);
  });

  it('nível inválido ensina as opções em vez de quebrar', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'minas gigante');
    expect(log()).toHaveTextContent('minas: gigante: nível desconhecido');
    expect(within(log()).getByRole('button', { name: /minas dificil/ })).toBeInTheDocument();
    await run(user, 'minas facil medio');
    expect(log()).toHaveTextContent('nível desconhecido');
  });

  it('trocar de idioma redesenha o tabuleiro sem perder a partida', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'minas');
    await screen.findByRole('group', { name: 'Campo minado' });
    await user.click(cell(5, 5));
    expect(status()).toHaveTextContent('jogando');

    const opened = cells().filter((c) => c.classList.contains('is-open')).length;

    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('group', { name: 'Minesweeper' })).toBeInTheDocument();
    expect(status()).toHaveTextContent('playing');
    expect(document.querySelectorAll('.ms-cell.is-open')).toHaveLength(opened);
  });

  it('sair volta ao prompt; no replay do histórico nunca reabre uma partida', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'minas');
    await screen.findByRole('group', { name: 'Campo minado' });
    await run(user, 'sair');
    expect(screen.queryByRole('group', { name: 'Campo minado' })).toBeNull();
    expect(log()).toHaveTextContent('de volta ao prompt');
  });

  it('o replay do histórico mostra só "partida encerrada"', () => {
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['minas']));
    renderApp('/');
    expect(document.querySelectorAll('.ms-cell')).toHaveLength(0);
    expect(log()).toHaveTextContent('partida encerrada');
  });
});

describe('celular (JG-04, JG-06)', () => {
  const original = window.matchMedia;

  afterEach(() => {
    window.matchMedia = original;
  });

  it('o nível difícil avisa que o tabuleiro é largo e rola só dentro da janela', () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('max-width: 720px'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    render(<Minesweeper lang="pt" level="hard" />);
    expect(screen.getByText(/tabuleiro difícil é largo/)).toBeInTheDocument();
    expect(document.querySelector('.ms-scroll')).toBeInTheDocument();
  });

  it('no nível fácil não há aviso', () => {
    render(<Minesweeper lang="pt" level="easy" />);
    expect(screen.queryByText(/é largo/)).toBeNull();
  });
});
