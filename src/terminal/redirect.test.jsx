import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';

const terminalInput = () => screen.getByRole('textbox', { name: 'Linha de comando do terminal' });
const log = () => document.querySelector('.term-log');
const advance = (ms) =>
  act(async () => {
    vi.advanceTimersByTime(ms);
  });

// O Testing Library só avança timers falsos se achar um `jest` global.
function setup() {
  vi.useFakeTimers();
  globalThis.jest = { advanceTimersByTime: vi.advanceTimersByTime };

  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

function mockReducedMotion(reduce) {
  window.matchMedia = (query) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
}

describe('carregamento antes de redirecionar', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    delete window.matchMedia;
    delete globalThis.jest;
  });

  it('"curriculo" mostra a visão em terminal e só navega pelo botão "abrir página própria"', async () => {
    const user = setup();

    renderApp('/');
    await user.type(terminalInput(), 'curriculo{Enter}');
    await advance(2000);
    expect(window.location.pathname).toBe('/');

    await user.click(within(log()).getByRole('button', { name: /abrir página própria/ }));
    // progresso animado, ainda na home
    expect(log()).toHaveTextContent('abrindo /curriculo…');
    expect(log()).toHaveTextContent(/\[■*□*\] \d+%/);
    expect(terminalInput()).toHaveAttribute('readonly');
    await advance(400);
    expect(log()).toHaveTextContent(/\[■+□+\] \d+%/);
    expect(window.location.pathname).toBe('/');

    await advance(600);
    expect(window.location.pathname).toBe('/curriculo');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Maria Eduarda de Paula Brito' }),
    ).toBeInTheDocument();
  });

  it('"cd <página>" passa pelo mesmo carregamento', async () => {
    const user = setup();

    renderApp('/');
    await user.type(terminalInput(), 'cd academico{Enter}');
    expect(window.location.pathname).toBe('/');
    expect(log()).toHaveTextContent('abrindo /academico…');
    await advance(1000);
    expect(window.location.pathname).toBe('/academico');
  });

  it('"cd ~" na própria home não tem carregamento', async () => {
    const user = setup();

    renderApp('/');
    await user.type(terminalInput(), 'cd ~{Enter}');
    expect(log()).not.toHaveTextContent('%');
    expect(window.location.pathname).toBe('/');
  });

  it('Esc cancela o carregamento e a URL não muda', async () => {
    const user = setup();

    renderApp('/');
    await user.type(terminalInput(), 'cd curriculo{Enter}');
    await advance(300);
    await user.keyboard('{Escape}');
    expect(log()).toHaveTextContent('^C');
    expect(log()).toHaveTextContent('cancelado');
    await advance(3000);
    expect(window.location.pathname).toBe('/');
    // a entrada volta a funcionar
    expect(terminalInput()).not.toHaveAttribute('readonly');
  });

  it('Ctrl+C também cancela', async () => {
    const user = setup();

    renderApp('/');
    await user.type(terminalInput(), 'cd servicos{Enter}');
    await advance(200);
    await user.keyboard('{Control>}c{/Control}');
    expect(log()).toHaveTextContent('cancelado');
    await advance(3000);
    expect(window.location.pathname).toBe('/');
  });

  it('com prefers-reduced-motion não há barra animada e navega em ~300 ms', async () => {
    mockReducedMotion(true);

    const user = setup();

    renderApp('/');
    await user.type(terminalInput(), 'cd curriculo{Enter}');
    expect(log()).toHaveTextContent('carregando…');
    expect(log()).not.toHaveTextContent(/[■□]/);
    expect(log()).not.toHaveTextContent('%');
    await advance(200);
    expect(window.location.pathname).toBe('/');
    await advance(150);
    expect(window.location.pathname).toBe('/curriculo');
  });

  it('não navega duas vezes ao clicar de novo durante o carregamento', async () => {
    const user = setup();
    const push = vi.spyOn(window.history, 'pushState');

    renderApp('/');
    await user.type(terminalInput(), 'servicos{Enter}');

    const open = within(log()).getByRole('button', { name: /abrir página própria/ });

    await user.click(open);
    await user.click(open);
    await advance(3000);
    expect(push).toHaveBeenCalledTimes(1);
    push.mockRestore();
  });

  it('sem timers soltos: desmontar durante o carregamento não navega', async () => {
    const user = setup();
    const { unmount } = renderApp('/');
    const push = vi.spyOn(window.history, 'pushState');

    await user.type(terminalInput(), 'cd curriculo{Enter}');
    await advance(200);
    unmount();
    await advance(3000);
    expect(push).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/');
    push.mockRestore();
  });

  it('replay do histórico não anima nem navega', async () => {
    setup();
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['cd academico']));
    renderApp('/');
    expect(log()).toHaveTextContent('abrindo /academico… pronto ✓');
    expect(log()).not.toHaveTextContent('%');
    await advance(3000);
    expect(window.location.pathname).toBe('/');
  });

  it('links de página dentro das saídas também mostram o carregamento', async () => {
    const user = setup();

    renderApp('/');
    await user.type(terminalInput(), 'ls{Enter}');
    await user.click(within(log()).getByRole('link', { name: 'servicos' }));
    expect(window.location.pathname).toBe('/');
    expect(log()).toHaveTextContent('abrindo /servicos…');
    await advance(1000);
    expect(window.location.pathname).toBe('/servicos');
  });
});
