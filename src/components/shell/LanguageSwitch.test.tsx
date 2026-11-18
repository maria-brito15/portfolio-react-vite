// T2.6 (V-08): o seletor PT | EN são dois links reais; o atual leva aria-current; o clique grava a
// escolha e navega; montar sem clicar não grava nada.
import { act, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider, useRouter } from '../../router';
import LanguageSwitch from './LanguageSwitch';

function Path() {
  return <p data-testid="path">{useRouter().path}</p>;
}

const open = (path: string) => {
  window.history.replaceState(null, '', path);

  return render(
    <RouterProvider>
      <LanguageProvider>
        <LanguageSwitch />
        <Path />
      </LanguageProvider>
    </RouterProvider>,
  );
};
const link = (label: string) => screen.getByRole('link', { name: label });

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('LanguageSwitch (FR-021, FR-022, FR-040)', () => {
  it('são dois links reais para a mesma página em cada idioma, com hreflang e lang', () => {
    open('/projetos');

    expect(link('PT')).toHaveAttribute('href', '/projetos');
    expect(link('PT')).toHaveAttribute('hreflang', 'pt-BR');
    expect(link('PT')).toHaveAttribute('lang', 'pt-BR');
    expect(link('EN')).toHaveAttribute('href', '/en/projects');
    expect(link('EN')).toHaveAttribute('hreflang', 'en');
    expect(link('EN')).toHaveAttribute('lang', 'en');
    expect(screen.getByRole('group', { name: 'Idioma' })).toBeInTheDocument();
  });

  it('o idioma atual leva aria-current e o outro não', () => {
    open('/projetos');
    expect(link('PT')).toHaveAttribute('aria-current', 'true');
    expect(link('EN')).not.toHaveAttribute('aria-current');
  });

  it('em /en/projects o atual é EN, o grupo fala inglês e os links levam à mesma página', () => {
    open('/en/projects');
    expect(link('EN')).toHaveAttribute('aria-current', 'true');
    expect(link('PT')).not.toHaveAttribute('aria-current');
    expect(link('PT')).toHaveAttribute('href', '/projetos');
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
  });

  it('a home vai para /en e uma rota desconhecida leva à home do outro idioma', () => {
    const view = open('/');

    expect(link('EN')).toHaveAttribute('href', '/en');
    view.unmount();
    open('/xyz');
    expect(link('EN')).toHaveAttribute('href', '/en');
    expect(link('PT')).toHaveAttribute('href', '/');
  });

  it('montar sem clicar não grava nada', () => {
    const set = vi.spyOn(Storage.prototype, 'setItem');

    open('/projetos');
    expect(set).not.toHaveBeenCalled();
  });

  it('o clique navega e grava a escolha', () => {
    open('/projetos');
    act(() => link('EN').click());
    expect(screen.getByTestId('path')).toHaveTextContent('/en/projects');
    expect(localStorage.getItem('portfolio-lang')).toBe('en');
    expect(link('EN')).toHaveAttribute('aria-current', 'true');
    act(() => link('PT').click());
    expect(screen.getByTestId('path')).toHaveTextContent('/projetos');
    expect(localStorage.getItem('portfolio-lang')).toBe('pt');
  });

  it('armazenamento bloqueado: a troca funciona, sem erro (FR-026)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    open('/projetos');
    expect(() => act(() => link('EN').click())).not.toThrow();
    expect(screen.getByTestId('path')).toHaveTextContent('/en/projects');
  });

  it('alvos de toque de 44 px estão no CSS e o estado não é só cor (sublinhado e peso)', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('src/styles/shell.css', 'utf8');
    const block = css.slice(css.indexOf('.lang-switch a {'), css.indexOf('.lang-switch a {') + 260);

    expect(block).toMatch(/min-width:\s*44px/);
    expect(block).toMatch(/min-height:\s*44px/);
    expect(css).toMatch(/\.lang-switch a\[aria-current='true'\][^}]*font-weight:\s*600/);
    expect(css).toMatch(/\.lang-switch a\[aria-current='true'\][^}]*text-decoration:\s*underline/);
  });
});
