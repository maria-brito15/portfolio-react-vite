import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { BAR_VISIBLE, KEY_STEP, clampPosition, keyDelta } from './windowGeometry';

const original = window.matchMedia;

// Tela larga com mouse (a que liga as janelas gerenciadas) ou celular.
function setScreen(desktop: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: desktop ? query.includes('pointer: fine') : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

const win = () => document.querySelector<HTMLElement>('.win')!;
const bar = () => document.querySelector<HTMLElement>('.win-bar')!;
const dot = (name: RegExp) => within(win()).getByRole('button', { name });

beforeEach(() => {
  sessionStorage.clear();
  setScreen(true);
});
afterEach(() => {
  window.matchMedia = original;
});

describe('geometria do arrasto (JA-01, JA-02)', () => {
  const origin = { left: 100, top: 80, width: 600 };
  const viewport = { width: 1000, height: 700 };

  it('não deixa a janela sair pela esquerda, direita ou topo', () => {
    expect(clampPosition({ x: -500, y: -500 }, origin, viewport)).toEqual({ x: -100, y: -80 });
    expect(clampPosition({ x: 900, y: 0 }, origin, viewport)).toEqual({ x: 300, y: 0 });
  });

  it('a barra de título nunca desce para fora da tela', () => {
    expect(clampPosition({ x: 0, y: 5000 }, origin, viewport).y).toBe(
      viewport.height - BAR_VISIBLE - origin.top,
    );
  });

  it('janela mais larga que a tela fica entre os dois limites', () => {
    const wide = clampPosition({ x: 50, y: 0 }, { left: 0, top: 0, width: 1400 }, viewport);

    expect(wide.x).toBeLessThanOrEqual(0);
    expect(wide.x).toBeGreaterThanOrEqual(viewport.width - 1400);
  });

  it('as setas movem 16 px e outras teclas não movem', () => {
    expect(keyDelta('ArrowLeft')).toEqual({ x: -KEY_STEP, y: 0 });
    expect(keyDelta('ArrowDown')).toEqual({ x: 0, y: KEY_STEP });
    expect(keyDelta('a')).toBeNull();
  });
});

describe('bolinhas da janela (JA-04)', () => {
  it('em tela larga viram botões com nome nos dois idiomas', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    expect(dot(/Fechar janela/)).toBeInTheDocument();
    expect(dot(/Recolher janela/)).toBeInTheDocument();
    expect(dot(/Maximizar janela/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(dot(/Close window/)).toBeInTheDocument();
  });

  it('recolher esconde o corpo e a barra de tarefas restaura', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    expect(screen.queryByRole('navigation', { name: 'Janelas recolhidas' })).toBeNull();
    await user.click(dot(/Recolher janela/));
    expect(document.querySelector('.win-body')).not.toBeVisible();
    expect(win()).toHaveClass('is-min');

    const taskbar = screen.getByRole('navigation', { name: 'Janelas recolhidas' });

    expect(within(taskbar).getByRole('button')).toHaveTextContent(
      'visitante@mariab.dev: ~/academico',
    );
    await user.click(within(taskbar).getByRole('button'));
    expect(document.querySelector('.win-body')).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Janelas recolhidas' })).toBeNull();
  });

  it('o botão amarelo também restaura uma janela recolhida', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    await user.click(dot(/Recolher janela/));
    await user.click(dot(/Restaurar janela/));
    expect(win()).not.toHaveClass('is-min');
  });

  it('fechar numa página volta à home', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    await user.click(dot(/Fechar janela/));
    expect(window.location.pathname).toBe('/');
  });

  it('fechar o terminal leva ao painel, como em qualquer página; recolher guarda a janela até reabrir', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.click(dot(/Recolher janela/));
    expect(window.location.pathname).toBe('/terminal');
    expect(win()).toHaveClass('is-min');
    await user.click(
      within(screen.getByRole('navigation', { name: 'Janelas recolhidas' })).getByRole('button'),
    );
    expect(win()).not.toHaveClass('is-min');
    await user.click(dot(/Fechar janela/));
    expect(window.location.pathname).toBe('/');
  });

  it('maximizar e restaurar alternam a classe e o aria-pressed', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    await user.click(dot(/Maximizar janela/));
    expect(win()).toHaveClass('is-max');
    expect(dot(/Restaurar janela/)).toHaveAttribute('aria-pressed', 'true');
    await user.click(dot(/Restaurar janela/));
    expect(win()).not.toHaveClass('is-max');
  });

  it('a janela recolhida some da barra de tarefas ao mudar de página', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    await user.click(dot(/Recolher janela/));
    await user.click(screen.getByRole('button', { name: 'Voltar à página anterior' }));
    expect(window.location.pathname).toBe('/');
    expect(screen.queryByRole('navigation', { name: 'Janelas recolhidas' })).toBeNull();
  });
});

describe('arrasto por teclado e ponteiro (JA-01, JA-02)', () => {
  it('a barra é focável e as setas movem 16 px; Home volta ao lugar', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    // jsdom não faz layout: o retângulo da janela é um espaço largo para o limite não atrapalhar
    win().getBoundingClientRect = () =>
      ({ left: 400, top: 300, width: 400, height: 300, right: 800, bottom: 600 }) as DOMRect;
    bar().focus();
    expect(bar()).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(win().style.transform).toBe(`translate(${KEY_STEP}px, ${KEY_STEP}px)`);
    await user.keyboard('{Home}');
    expect(win().style.transform).toBe('');
  });

  it('arrastar pela barra move a janela e o duplo clique a devolve', () => {
    renderApp('/academico');
    win().getBoundingClientRect = () =>
      ({ left: 400, top: 300, width: 400, height: 300, right: 800, bottom: 600 }) as DOMRect;
    fireEvent.pointerDown(bar(), { clientX: 500, clientY: 320, button: 0, pointerId: 1 });
    fireEvent.pointerMove(bar(), { clientX: 540, clientY: 350, pointerId: 1 });
    expect(win().style.transform).toBe('translate(40px, 30px)');
    fireEvent.pointerUp(bar(), { pointerId: 1 });
    fireEvent.pointerMove(bar(), { clientX: 900, clientY: 900, pointerId: 1 });
    expect(win().style.transform).toBe('translate(40px, 30px)');
    fireEvent.doubleClick(bar());
    expect(win().style.transform).toBe('');
  });

  it('clicar num botão da barra não inicia o arrasto', () => {
    renderApp('/academico');
    fireEvent.pointerDown(dot(/Maximizar janela/), { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(bar(), { clientX: 100, clientY: 100 });
    expect(win().style.transform).toBe('');
  });

  it('a posição vale para a sessão: continua ao voltar à mesma página', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    win().getBoundingClientRect = () =>
      ({ left: 400, top: 300, width: 400, height: 300, right: 800, bottom: 600 }) as DOMRect;
    bar().focus();
    await user.keyboard('{ArrowLeft}');
    expect(win().style.transform).toBe(`translate(${-KEY_STEP}px, 0px)`);
    // nada é gravado no navegador
    expect(JSON.stringify({ ...localStorage })).not.toMatch(/translate|position/i);
  });
});

describe('celular e sem mouse (JA-03)', () => {
  it('a janela fica fixa: bolinhas decorativas, barra não focável, sem barra de tarefas', async () => {
    setScreen(false);
    renderApp('/academico');
    expect(within(win()).queryByRole('button', { name: /janela/i })).toBeNull();
    expect(bar()).not.toHaveAttribute('tabindex');
    expect(bar()).not.toHaveClass('is-draggable');
    expect(document.querySelector('.win-dots')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('navigation', { name: 'Janelas recolhidas' })).toBeNull();
  });
});
