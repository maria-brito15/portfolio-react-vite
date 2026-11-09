import { act, screen } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import { findPageByPath, legacyHashes, legacyTarget } from './routes';

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('links antigos da home (SH-10)', () => {
  it('a tabela cobre os cinco ids antigos e seus nomes em inglês, sem inventar rotas', () => {
    expect(legacyHashes).toEqual({
      '#sobre': '/sobre',
      '#about': '/sobre',
      '#habilidades': '/habilidades',
      '#skills': '/habilidades',
      '#projetos': '/projetos',
      '#projects': '/projetos',
      '#experiencias': '/experiencias',
      '#experience': '/experiencias',
      '#contato': '/contato',
      '#contact': '/contato',
    });
    for (const path of Object.values(legacyHashes)) {
      expect(findPageByPath(path), path).toBeDefined();
    }
  });

  it('legacyTarget só age na home e nunca lança', () => {
    expect(legacyTarget('/', '#projetos')).toBe('/projetos');
    expect(legacyTarget('/', '#Projetos')).toBe('/projetos');
    expect(legacyTarget('/projetos', '#projetos')).toBeUndefined();
    expect(legacyTarget('/', '#inicio')).toBeUndefined();
    expect(legacyTarget('/', '#xyz')).toBeUndefined();
    expect(legacyTarget('/', '#%')).toBeUndefined();
    expect(legacyTarget('/', '')).toBeUndefined();
  });

  it.each([
    ['/#sobre', '/sobre'],
    ['/#habilidades', '/habilidades'],
    ['/#projetos', '/projetos'],
    ['/#experiencias', '/experiencias'],
    ['/#contato', '/contato'],
    ['/#projects', '/projetos'],
  ])('abrir %s leva a %s sem empilhar histórico', (from, to) => {
    const push = vi.spyOn(window.history, 'pushState');
    const replace = vi.spyOn(window.history, 'replaceState');
    renderApp(from);
    expect(window.location.pathname).toBe(to);
    expect(window.location.hash).toBe('');
    // a URL antiga foi substituída (replaceState), não empilhada: o Voltar não a reabre
    expect(replace).toHaveBeenCalledWith({ idx: 0 }, '', to);
    expect(push).not.toHaveBeenCalled();
    expect(window.history.state.idx).toBe(0);
  });

  it('a página própria aparece (não o terminal da home)', async () => {
    renderApp('/#projetos');
    expect(window.location.pathname).toBe('/projetos');
    expect((await screen.findAllByRole('heading')).length).toBeGreaterThan(0);
    expect(document.querySelector('.term-screen')).toBeNull();
  });

  it('hash desconhecido ou #inicio não redireciona', () => {
    for (const hash of ['#xyz', '#inicio', '#%']) {
      const { unmount } = renderApp(`/${hash}`);
      expect(window.location.pathname, hash).toBe('/');
      expect(window.location.hash, hash).toBe(hash);
      unmount();
    }
  });

  it('um link antigo clicado com a home aberta também redireciona', async () => {
    renderApp('/');
    expect(window.location.pathname).toBe('/');
    await act(async () => {
      window.history.pushState(null, '', '/#contato');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(window.location.pathname).toBe('/contato');
    expect(window.location.hash).toBe('');
  });
});
