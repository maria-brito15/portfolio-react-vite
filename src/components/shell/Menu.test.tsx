// T3.2 (V-06): botão do menu com aria-expanded e aria-controls; foco no 1º item ao abrir e no botão
// ao fechar (botão, Esc, escolha); nav na ordem de `order`; tema e idioma depois dos itens.
import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { ThemeProvider } from '../../hooks/useTheme';
import { RouterProvider } from '../../router';
import { routes } from '../../data/routes';
import Header from './Header';

const open = (path = '/') => {
  window.history.replaceState(null, '', path);

  return render(
    <RouterProvider>
      <LanguageProvider>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </LanguageProvider>
    </RouterProvider>,
  );
};
const menuEn = routes.find((r) => r.menu)!.enPath;
const button = () => screen.getByRole('button', { name: /menu/i });

beforeEach(() => {
  localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'light');
});
afterEach(() => window.history.replaceState(null, '', '/'));

describe('Menu (FR-013 a FR-015)', () => {
  it('o botão liga ao painel e começa fechado', () => {
    open();

    const id = button().getAttribute('aria-controls');

    expect(button()).toHaveAttribute('aria-expanded', 'false');
    expect(id && document.getElementById(id)).toBeTruthy();
    expect(document.getElementById(id!)).not.toHaveAttribute('data-open');
  });

  it('abrir leva o foco ao primeiro item; o botão fechar devolve o foco ao botão', () => {
    open();
    fireEvent.click(button());

    expect(button()).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toBe(screen.getAllByRole('link')[1]);
    fireEvent.click(button());
    expect(button()).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(button());
  });

  it('Esc fecha e devolve o foco ao botão', () => {
    open();
    fireEvent.click(button());
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });

    expect(button()).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(button());
  });

  it('escolher um item fecha e devolve o foco ao botão', () => {
    open();
    fireEvent.click(button());
    fireEvent.click(document.activeElement!);

    expect(button()).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(button());
  });

  it('escolher o idioma não fecha o painel', () => {
    open();
    fireEvent.click(button());
    fireEvent.click(screen.getByRole('link', { name: 'EN' }));

    expect(button()).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Header novo (FR-008, FR-016)', () => {
  it('lista só os itens de menu, na ordem de `order`', () => {
    open();

    const expected = routes
      .filter((r) => r.menu)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((r) => r.label.pt);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });

    expect([...nav.querySelectorAll('a')].map((a) => a.textContent)).toEqual(expected);
  });

  it('a ordem do DOM é marca, itens, tema, idioma', () => {
    const { container } = open();
    const tags = [...container.querySelectorAll('a, button')].map(
      (el) => el.getAttribute('class') ?? el.getAttribute('hreflang') ?? el.tagName,
    );
    const nav = screen.getByRole('navigation').querySelectorAll('a').length;

    expect(tags[0]).toBe('hdr-brand');
    expect(tags[1]).toBe('menu-button');
    expect(tags[2 + nav]).toBe('theme-btn');
    expect(tags.slice(3 + nav)).toEqual(['pt-BR', 'en']);
  });

  it('marca a página atual com aria-current e leva /en nos links em inglês', () => {
    open(menuEn);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });

    expect(nav.querySelector('[aria-current="page"]')).toHaveAttribute('href', menuEn);
  });

  it('o botão de tema nomeia o destino, tem aria-pressed depois de montar, e alterna', () => {
    open();

    const toggle = screen.getByRole('button', { name: /^Alternar tema: / });

    expect(toggle).toHaveAccessibleName('Alternar tema: escuro');

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAccessibleName('Alternar tema: claro');
  });
});
