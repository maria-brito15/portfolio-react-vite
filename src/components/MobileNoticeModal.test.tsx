import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';

function mockNarrowScreen(narrow: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches: narrow && query.includes('max-width: 640px'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList;
}

const dialog = () => screen.queryByRole('dialog', { name: 'Feito para computador' });

describe('aviso de visualização em celular', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('aparece em tela estreita sem marca prévia (MB-01)', () => {
    mockNarrowScreen(true);
    renderApp('/');
    expect(dialog()).toBeInTheDocument();
  });

  it('nunca é montado em desktop (MB-02)', () => {
    mockNarrowScreen(false);
    renderApp('/');
    expect(dialog()).toBeNull();
  });

  it('some ao fechar e não reaparece em um novo carregamento (MB-03)', async () => {
    const user = userEvent.setup();

    mockNarrowScreen(true);

    const { unmount } = renderApp('/');

    expect(dialog()).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(dialog()).toBeNull();
    expect(localStorage.getItem('portfolio-mobile-notice-dismissed')).toBe('1');
    unmount();

    renderApp('/');
    expect(dialog()).toBeNull();
  });

  it('Esc fecha e devolve o foco; o site continua usável depois de fechar (MB-04, MB-05)', async () => {
    const user = userEvent.setup();

    mockNarrowScreen(true);
    renderApp('/');

    const closeButton = screen.getByRole('button', { name: 'Entendi' });

    expect(closeButton).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).toBe('');

    const terminal = screen.getByRole('textbox', { name: 'Linha de comando do terminal' });

    await user.click(terminal);
    expect(terminal).toHaveFocus();
  });

  it('muda de idioma com o resto do site (MB-06)', async () => {
    const user = userEvent.setup();

    mockNarrowScreen(true);
    renderApp('/');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('dialog', { name: 'Built for desktop' })).toBeInTheDocument();
  });

  it('não quebra o site quando localStorage lança erro (MB-08)', () => {
    mockNarrowScreen(true);

    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => renderApp('/')).not.toThrow();
    expect(dialog()).toBeInTheDocument();
    spy.mockRestore();
  });
});
