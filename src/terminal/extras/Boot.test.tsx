import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import BootSequence, { BOOT_DONE_MS, BOOT_KEY, BOOT_TICK_MS, bootLines, shouldBoot } from './Boot';

const input = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
const log = () => document.querySelector<HTMLElement>('.term-log')!;
const boot = () => document.querySelector<HTMLElement>('.t-boot');

const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
};

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.removeItem(BOOT_KEY);
});
afterEach(() => {
  vi.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

describe('linhas do boot (TB-06)', () => {
  it('no máximo 6 linhas (5 de status + a dica), vindas dos dados, nos dois idiomas', () => {
    for (const lang of ['pt', 'en'] as const) {
      const lines = bootLines(lang);

      expect(lines.length).toBeLessThanOrEqual(5);
      expect(lines.some((l) => /\d+ (páginas|pages)/.test(l))).toBe(true);
    }
  });

  it('a sequência inteira cabe em 1,5 s', () => {
    expect(bootLines('pt').length * BOOT_TICK_MS + BOOT_DONE_MS).toBeLessThanOrEqual(1700);
  });
});

describe('boot na primeira visita (TB-06)', () => {
  it('anima uma linha por vez, sai sozinho e grava a marca', () => {
    vi.useFakeTimers();
    renderApp('/');
    expect(boot()).toBeInTheDocument();
    expect(localStorage.getItem(BOOT_KEY)).toBe('1');
    expect(boot()!.querySelectorAll('p')).toHaveLength(1); // só a dica
    act(() => {
      vi.advanceTimersByTime(BOOT_TICK_MS);
    });
    expect(boot()!).toHaveTextContent('carregando mariab.dev');
    // um passo por vez: o React só agenda o próximo temporizador depois de redesenhar
    for (let i = 1; i < bootLines('pt').length; i++) {
      act(() => {
        vi.advanceTimersByTime(BOOT_TICK_MS);
      });
    }
    expect(boot()!.querySelectorAll('p')).toHaveLength(bootLines('pt').length);
    act(() => {
      vi.advanceTimersByTime(BOOT_DONE_MS);
    });
    expect(boot()).toBeNull();
    // o banner e o h1 continuam na página
    expect(screen.getByRole('heading', { level: 1, name: 'Duda Brito' })).toBeInTheDocument();
  });

  it('não repete na visita seguinte', () => {
    const first = renderApp('/');

    expect(boot()).toBeInTheDocument();
    first.unmount();
    renderApp('/');
    expect(boot()).toBeNull();
  });

  it('qualquer tecla pula, e a tecla continua indo ao campo de comando', async () => {
    const user = userEvent.setup();

    renderApp('/');
    expect(boot()).toBeInTheDocument();
    await user.type(input(), 'a');
    expect(input()).toHaveValue('a');
    // depois de pular, o boot some da tela (mesmo sem esperar o tempo)
    await user.click(document.body);
    expect(boot()).toBeNull();
  });

  it('o primeiro comando encerra o boot, e limpar não o traz de volta', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.type(input(), 'sobre{Enter}');
    expect(boot()).toBeNull();
    await user.type(input(), 'limpar{Enter}');
    expect(boot()).toBeNull();
  });

  it('não roda com histórico da sessão, nem para robôs de busca', () => {
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['ajuda']));
    renderApp('/');
    expect(boot()).toBeNull();

    const ua = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');

    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      configurable: true,
    });
    try {
      sessionStorage.clear();
      expect(shouldBoot()).toBe(false);
    } finally {
      if (ua) Object.defineProperty(window.navigator, 'userAgent', ua);
      else delete (window.navigator as unknown as Record<string, unknown>).userAgent;
    }
  });
});

describe('movimento reduzido (TB-07)', () => {
  it('mostra as linhas de uma vez, sem temporizador de animação', () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    renderApp('/');
    expect(boot()!.querySelectorAll('p')).toHaveLength(bootLines('pt').length);
    // sem temporizador de animação: nada sai da tela sozinho; só uma ação do visitante
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(boot()).toBeInTheDocument();
    expect(boot()).not.toHaveTextContent(/pular|skip/);
  });
});

describe('comando boot (TB-08)', () => {
  it('repete a sequência sob demanda e fica oculto na ajuda', async () => {
    const user = userEvent.setup();

    localStorage.setItem(BOOT_KEY, '1');
    renderApp('/');
    await user.type(input(), 'boot{Enter}');
    expect(log().querySelector('.t-boot')).toBeInTheDocument();
    await user.type(input(), 'ajuda{Enter}');
    expect(log()).not.toHaveTextContent(/\bboot\b/);
  });

  it('no replay do histórico mostra a sequência completa, sem animar', () => {
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['boot']));
    localStorage.setItem(BOOT_KEY, '1');
    renderApp('/');
    expect(log().querySelectorAll('.t-boot p')).toHaveLength(bootLines('pt').length);
  });

  it('o componente isolado chama onDone ao pular', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();

    render(<BootSequence lang="en" instant={false} onDone={onDone} />);
    await user.keyboard('x');
    expect(onDone).toHaveBeenCalled();
    expect(screen.getByText('terminal ready')).toBeInTheDocument();
  });
});
