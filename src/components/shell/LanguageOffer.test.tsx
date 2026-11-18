// T2.6 (V-08): as 9 linhas da tabela "Resolução do idioma" pelo componente; dispensar; não rouba o
// foco; nunca redireciona; armazenamento bloqueado sem erro; montar sem clicar não grava.
import { readFileSync } from 'node:fs';
import { act, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider, useRouter } from '../../router';
import LanguageOffer from './LanguageOffer';

function Path() {
  return <p data-testid="path">{useRouter().path}</p>;
}

const open = (path: string) => {
  window.history.replaceState(null, '', path);

  return render(
    <RouterProvider>
      <LanguageProvider>
        <button type="button">antes</button>
        <LanguageOffer />
        <Path />
      </LanguageProvider>
    </RouterProvider>,
  );
};
const langs = (value: string[]) =>
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(value);
const band = () => screen.queryByRole('region', { name: 'Oferta de idioma' });
const FLAG = 'data-lang-offer';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute(FLAG);
  langs(['en-US', 'en']);
});
afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('LanguageOffer: tabela "Resolução do idioma" (FR-025, FR-026, FR-034, FR-035)', () => {
  it('1. /projetos, nada gravado, navegador em inglês: oferece /en/projects', () => {
    open('/projetos');
    expect(band()).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read this page in English' })).toHaveAttribute(
      'href',
      '/en/projects',
    );
  });

  it('2. navegador em português: sem faixa', () => {
    langs(['pt-BR', 'en']);
    open('/projetos');
    expect(band()).toBeNull();
  });

  it('3. navegador em espanhol ou outro: sem faixa', () => {
    langs(['es-AR']);
    open('/projetos');
    expect(band()).toBeNull();
  });

  it('4. escolha PT gravada: a escolha vence', () => {
    localStorage.setItem('portfolio-lang', 'pt');
    open('/projetos');
    expect(band()).toBeNull();
  });

  it('5. faixa dispensada: sem faixa (FR-034)', () => {
    localStorage.setItem('portfolio-lang-offer', 'dismissed');
    open('/projetos');
    expect(band()).toBeNull();
  });

  it('6. /en/projects, nada gravado: EN, sem faixa (FR-035)', () => {
    open('/en/projects');
    expect(band()).toBeNull();
  });

  it('7. /en/projects com escolha PT: o endereço direto vence', () => {
    localStorage.setItem('portfolio-lang', 'pt');
    langs(['pt-BR']);
    open('/en/projects');
    expect(band()).toBeNull();
  });

  it('8. armazenamento bloqueado: a faixa aparece em toda visita, sem erro (FR-026)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    expect(() => open('/projetos')).not.toThrow();
    expect(band()).toBeInTheDocument();
  });

  it('9. /xyz inexistente em PT: segue a regra e oferece a home em inglês', () => {
    open('/xyz');
    expect(screen.getByRole('link', { name: 'Read this page in English' })).toHaveAttribute(
      'href',
      '/en',
    );
  });
});

describe('LanguageOffer: comportamento', () => {
  it('nunca redireciona: o endereço aberto continua o mesmo', () => {
    open('/projetos');
    expect(screen.getByTestId('path')).toHaveTextContent('/projetos');
    expect(window.location.pathname).toBe('/projetos');
  });

  it('montar sem clicar não grava nada', () => {
    const set = vi.spyOn(Storage.prototype, 'setItem');

    open('/projetos');
    expect(band()).toBeInTheDocument();
    expect(set).not.toHaveBeenCalled();
  });

  it('não rouba o foco ao aparecer e não tem autofocus', () => {
    open('/projetos');
    expect(band()).toBeInTheDocument();
    expect(document.body).toHaveFocus();
    expect(band()?.querySelector('[autofocus]')).toBeNull();
    expect(screen.getByRole('button', { name: 'antes' })).not.toHaveFocus();
  });

  it('tem nome acessível, o link está em inglês e o botão tem alvo de toque no CSS', () => {
    open('/projetos');
    expect(band()).toHaveAccessibleName('Oferta de idioma');
    expect(screen.getByRole('link', { name: 'Read this page in English' })).toHaveAttribute(
      'lang',
      'en',
    );
    expect(screen.getByRole('link', { name: 'Read this page in English' })).toHaveAttribute(
      'hreflang',
      'en',
    );

    const css = readFileSync('src/styles/shell.css', 'utf8');

    expect(css).toMatch(/\.lang-offer\s*\{[^}]*position:\s*fixed;[^}]*top:\s*0/);
    expect(css).toMatch(/\.lang-offer button\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(
      /html\[data-lang-offer\] body\s*\{[^}]*padding-top:\s*var\(--lang-offer-h\)/,
    );
  });

  it('dispensar grava a dispensa, some e libera o espaço reservado', () => {
    document.documentElement.setAttribute(FLAG, '');
    open('/projetos');
    act(() => screen.getByRole('button', { name: 'Dispensar' }).click());
    expect(localStorage.getItem('portfolio-lang-offer')).toBe('dismissed');
    expect(band()).toBeNull();
    expect(document.documentElement).not.toHaveAttribute(FLAG);
  });

  it('dispensar com o armazenamento bloqueado: sem erro, e a faixa some nesta visita', () => {
    open('/projetos');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    expect(() =>
      act(() => screen.getByRole('button', { name: 'Dispensar' }).click()),
    ).not.toThrow();
    expect(band()).toBeNull();
  });

  it('o link oferece o inglês: grava a escolha, navega e a faixa some', () => {
    open('/projetos');
    act(() => screen.getByRole('link', { name: 'Read this page in English' }).click());
    expect(screen.getByTestId('path')).toHaveTextContent('/en/projects');
    expect(localStorage.getItem('portfolio-lang')).toBe('en');
    expect(band()).toBeNull();
  });

  it('o espaço reservado pelo boot é liberado quando a faixa não vai aparecer', () => {
    document.documentElement.setAttribute(FLAG, '');
    langs(['pt-BR']);
    open('/projetos');
    expect(document.documentElement).not.toHaveAttribute(FLAG);
  });

  it('o boot e o componente usam a mesma chave da dispensa', () => {
    expect(readFileSync('src/boot/boot.ts', 'utf8')).toContain("'portfolio-lang-offer'");
    expect(readFileSync('src/i18n/LanguageContext.tsx', 'utf8')).toContain(
      "'portfolio-lang-offer'",
    );
  });
});
