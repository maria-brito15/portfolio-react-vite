// T2.4: no navegador, `initial` manda sobre a barra de endereço (o servidor e a 1ª renderização do
// cliente partem do mesmo dado), e a navegação continua funcionando depois.
import { act, render, screen } from '@testing-library/react';
import { RouterProvider, useRouter } from './router';

function Probe() {
  const { path, navigate } = useRouter();

  return (
    <div>
      <p data-testid="path">{path}</p>
      <button type="button" onClick={() => navigate('/en/about')}>
        ir
      </button>
    </div>
  );
}

afterEach(() => window.history.replaceState({}, '', '/'));

describe('RouterProvider com `initial` no navegador', () => {
  it('usa o `initial` em vez de window.location', () => {
    window.history.replaceState({}, '', '/contato');
    render(
      <RouterProvider initial="/en/projects">
        <Probe />
      </RouterProvider>,
    );
    expect(screen.getByTestId('path')).toHaveTextContent('/en/projects');
  });

  it('sem `initial`, lê o endereço do navegador (inclusive /en/)', () => {
    window.history.replaceState({}, '', '/en/');
    render(
      <RouterProvider>
        <Probe />
      </RouterProvider>,
    );
    expect(screen.getByTestId('path')).toHaveTextContent('/en');
  });

  it('navegar depois continua funcionando e atualiza o endereço', () => {
    render(
      <RouterProvider initial="/projetos">
        <Probe />
      </RouterProvider>,
    );
    act(() => screen.getByRole('button', { name: 'ir' }).click());
    expect(screen.getByTestId('path')).toHaveTextContent('/en/about');
    expect(window.location.pathname).toBe('/en/about');
  });
});
