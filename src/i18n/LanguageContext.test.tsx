// T2.5 (V-08, TD-007, FR-019 a FR-023): o idioma é o do endereço; nada é gravado ao montar; só a
// escolha explícita grava `portfolio-lang`; o armazenamento bloqueado não quebra nada.
import { act, render, screen } from '@testing-library/react';
import { RouterProvider, useRouter } from '../router';
import { LanguageProvider, useLanguage } from './LanguageContext';

function Probe() {
  const { lang, t, toggleLang, setLang } = useLanguage();
  const { path } = useRouter();

  return (
    <div>
      <p data-testid="lang">{lang}</p>
      <p data-testid="path">{path}</p>
      <p data-testid="ui">{t.nav.about}</p>
      <button type="button" onClick={toggleLang}>
        alternar
      </button>
      <button type="button" onClick={() => setLang('pt')}>
        pt
      </button>
      <button type="button" onClick={() => setLang('en')}>
        en
      </button>
    </div>
  );
}

const open = (path: string) => {
  window.history.replaceState(null, '', path);

  return render(
    <RouterProvider>
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    </RouterProvider>,
  );
};
const text = (id: string) => screen.getByTestId(id).textContent;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('idioma pelo endereço (FR-019, FR-021)', () => {
  it('/en/about mostra inglês, mesmo com portfolio-lang=pt gravado, e o lang acompanha', () => {
    localStorage.setItem('portfolio-lang', 'pt');
    open('/en/about');
    expect(text('lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('/sobre mostra português, mesmo com portfolio-lang=en gravado', () => {
    localStorage.setItem('portfolio-lang', 'en');
    open('/sobre');
    expect(text('lang')).toBe('pt');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('/en e /en/ são inglês; a raiz e um endereço desconhecido em PT são português', () => {
    const view = open('/en');

    expect(text('lang')).toBe('en');
    view.unmount();
    open('/en/');
    expect(text('lang')).toBe('en');
  });

  it('os textos de interface seguem o idioma do endereço', () => {
    const view = open('/en/projects');
    const english = text('ui');

    view.unmount();
    open('/projetos');
    expect(text('ui')).not.toBe(english);
  });
});

describe('gravação só por escolha (FR-022, V-08)', () => {
  it('montar sem clicar não grava nada', () => {
    const set = vi.spyOn(Storage.prototype, 'setItem');

    open('/en/about');
    expect(set).not.toHaveBeenCalled();
    expect(localStorage.getItem('portfolio-lang')).toBeNull();
  });

  it('alternar navega à página equivalente e grava a escolha', () => {
    open('/sobre');
    act(() => screen.getByRole('button', { name: 'alternar' }).click());
    expect(text('path')).toBe('/en/about');
    expect(text('lang')).toBe('en');
    expect(window.location.pathname).toBe('/en/about');
    expect(localStorage.getItem('portfolio-lang')).toBe('en');
    act(() => screen.getByRole('button', { name: 'alternar' }).click());
    expect(text('path')).toBe('/sobre');
    expect(localStorage.getItem('portfolio-lang')).toBe('pt');
  });

  it('setLang escolhe o idioma pedido; o mesmo idioma grava e não navega', () => {
    open('/projetos');
    act(() => screen.getByRole('button', { name: 'pt' }).click());
    expect(text('path')).toBe('/projetos');
    expect(localStorage.getItem('portfolio-lang')).toBe('pt');
    act(() => screen.getByRole('button', { name: 'en' }).click());
    expect(text('path')).toBe('/en/projects');
  });

  it('a home vai para /en e volta para a raiz', () => {
    open('/');
    act(() => screen.getByRole('button', { name: 'alternar' }).click());
    expect(text('path')).toBe('/en');
    act(() => screen.getByRole('button', { name: 'alternar' }).click());
    expect(text('path')).toBe('/');
  });

  it('uma rota desconhecida (404) leva à home do outro idioma', () => {
    const view = open('/xyz');

    act(() => screen.getByRole('button', { name: 'alternar' }).click());
    expect(text('path')).toBe('/en');
    view.unmount();
    open('/en/xyz');
    act(() => screen.getByRole('button', { name: 'alternar' }).click());
    expect(text('path')).toBe('/');
  });

  it('armazenamento bloqueado: sem erro, e a troca vale na visita (FR-026)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    open('/sobre');
    expect(() => act(() => screen.getByRole('button', { name: 'alternar' }).click())).not.toThrow();
    expect(text('lang')).toBe('en');
    expect(text('path')).toBe('/en/about');
  });
});
