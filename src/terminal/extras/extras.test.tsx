import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { commandInventory, findCommand, complete } from '../commands';
import { stackFacts, neofetchRows } from './neofetch';
import MatrixRain, { MATRIX_MS } from './Matrix';
import { fortunes } from '../../data/fortunes';
import { skillTimeline } from '../../data/skillTimeline';

const input = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
const log = () => document.querySelector<HTMLElement>('.term-log')!;

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(input(), `${line}{Enter}`);
}

beforeEach(() => sessionStorage.clear());

describe('inventário dos comandos de personalidade (PE-09)', () => {
  const byId = (id: string) => commandInventory().find((c) => c.id === id);

  it('neofetch e fortune aparecem na ajuda; os easter eggs ficam ocultos', () => {
    expect(byId('neofetch')?.hidden).toBe(false);
    expect(byId('fortune')?.hidden).toBe(false);
    for (const id of ['cowsay', 'matrix', 'rm', 'sudo']) expect(byId(id)?.hidden, id).toBe(true);
  });

  it('Tab completa os novos comandos', () => {
    expect(complete('neof', 'pt')).toBe('neofetch ');
    expect(complete('fort', 'en')).toBe('fortune ');
    expect(findCommand('RM')).toBe(findCommand('rm'));
  });
});

describe('neofetch (PE-01, PE-02)', () => {
  it('só mostra campos que vêm dos dados', () => {
    const { count, since } = stackFacts();
    const dated = skillTimeline.flatMap((g) => g.items).filter((i) => i.since);

    expect(count).toBe(dated.length);
    expect(since).toBe(Math.min(...dated.map((i) => i.since as number)));

    const rows = Object.fromEntries(neofetchRows('pt', 'dark', new Date(2026, 5, 1)));

    expect(rows.nome).toContain('Brito');
    expect(rows.tema).toBe('escuro');
    expect(rows.stack).toBe(`${count} tecnologias com data`);
    expect(rows.desde).toBe(`${since} (1+ ano)`);
  });

  it('o terminal mostra o monograma das iniciais e os campos nos dois idiomas', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'neofetch');
    expect(log().querySelector('.t-ascii')).toHaveTextContent('####');
    expect(within(log()).getByText('cargo')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(within(log()).getByText('role')).toBeInTheDocument();
  });
});

describe('sudo, rm e cowsay (PE-03 a PE-05)', () => {
  it('sudo contratar-duda aponta o contato; outro sudo mantém a resposta antiga', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'sudo contratar-duda');
    expect(within(log()).getByRole('link', { name: /@/ })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    );
    await run(user, 'sudo hire-duda');
    expect(within(log()).getByText(/permission granted|permissão concedida/)).toBeInTheDocument();
    await run(user, 'sudo ls');
    expect(log()).toHaveTextContent('sudoers');
  });

  it('rm -rf não apaga nada: o histórico e a sessão ficam intactos', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'rm -rf /');
    expect(log()).toHaveTextContent('nada foi apagado');
    expect(JSON.parse(sessionStorage.getItem('portfolio-terminal') as string)).toEqual([
      'rm -rf /',
    ]);
    expect(window.location.pathname).toBe('/');
  });

  it('cowsay desenha o balão com o texto, e tem frase padrão', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'cowsay "oi, tudo bem"');
    expect(log().querySelector('pre')).toHaveTextContent('< oi, tudo bem >');
    await run(user, 'cowsay');
    expect(log().querySelector('pre')).toHaveTextContent('< muuu! >');
  });
});

describe('fortune (PE-07)', () => {
  it('com a lista vazia diz que está em construção, sem inventar texto', async () => {
    const user = userEvent.setup();

    expect(fortunes).toHaveLength(0);
    renderApp('/');
    await run(user, 'fortune');
    expect(log()).toHaveTextContent('sem frases ainda (em construção)');
  });
});

describe('historico (PE-08)', () => {
  it('fecha a lista com a contagem e continua listando os comandos', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'ls');
    await run(user, 'historico');
    expect(log().querySelectorAll('.t-history li')).toHaveLength(2);
    expect(log()).toHaveTextContent('2 comandos até agora');
  });
});

describe('matrix (PE-06)', () => {
  const original = HTMLCanvasElement.prototype.getContext;

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = (() => ({
      fillRect: () => {},
      fillText: () => {},
      font: '',
    })) as unknown as typeof original;
  });
  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = original;
    vi.useRealTimers();
  });

  it('anima, e qualquer tecla encerra', async () => {
    const user = userEvent.setup();

    render(<MatrixRain lang="pt" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(document.querySelector('canvas')).toBeNull();
    expect(screen.getByText(/matrix encerrado/)).toBeInTheDocument();
  });

  it('encerra sozinho depois de 6 s', () => {
    vi.useFakeTimers();
    render(<MatrixRain lang="en" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(MATRIX_MS + 100);
    });
    expect(screen.getByText(/matrix ended/)).toBeInTheDocument();
  });

  it('com movimento reduzido não anima: só a linha final', () => {
    const matchMedia = window.matchMedia;

    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    try {
      render(<MatrixRain lang="pt" />);
      expect(document.querySelector('canvas')).toBeNull();
      expect(screen.getByText(/matrix encerrado/)).toBeInTheDocument();
    } finally {
      window.matchMedia = matchMedia;
    }
  });

  it('o comando carrega sob demanda e mostra o canvas', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'matrix');
    expect(await screen.findByText(/qualquer tecla ou clique/)).toBeInTheDocument();
  });

  it('no replay do histórico não anima de novo', () => {
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['matrix']));
    renderApp('/');
    expect(document.querySelector('canvas')).toBeNull();
    expect(log()).toHaveTextContent('matrix encerrado');
  });
});
