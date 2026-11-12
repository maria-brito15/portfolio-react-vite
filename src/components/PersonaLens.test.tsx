import { screen, within } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { NAV_GROUPS, navRoutes } from '../data/routes';

const sidebarLinks = () =>
  within(screen.getByRole('navigation', { name: /barra lateral|sidebar|navegação/i })).getAllByRole(
    'link',
  );
const quickTiles = () =>
  within(
    screen.getByRole('heading', { level: 2, name: 'Acesso rápido' }).closest('section')!,
  ).getAllByRole('link');

describe('lente da persona (PR-10, PR-14)', () => {
  it('sem persona: ordem e marcas de sempre', () => {
    renderApp('/');

    expect(document.querySelectorAll('[data-pick]')).toHaveLength(0);
    expect(quickTiles()[0]).toHaveAttribute('href', '/projetos');
  });

  it('com persona: as entradas dela vão primeiro e ficam marcadas; nada some', () => {
    const plain = renderApp('/');
    const allTiles = quickTiles().map((a) => a.getAttribute('href'));
    const allSidebar = sidebarLinks().map((a) => a.getAttribute('href'));

    plain.unmount();
    localStorage.setItem(PERSONA_KEY, 'professor');
    renderApp('/');

    const tiles = quickTiles().map((a) => a.getAttribute('href'));
    const side = sidebarLinks().map((a) => a.getAttribute('href'));

    expect(tiles[0]).toBe('/academico');
    expect([...tiles].sort()).toEqual([...allTiles].sort());
    expect([...side].sort()).toEqual([...allSidebar].sort());
    expect(quickTiles()[0]).toHaveAttribute('data-pick', 'true');
    expect(quickTiles()[0]).toHaveTextContent('destaque para o seu perfil');
    expect(document.querySelectorAll('.sidebar-link[data-pick]').length).toBeGreaterThan(0);
  });

  it('a barra lateral só reordena dentro de cada grupo', () => {
    localStorage.setItem(PERSONA_KEY, 'tech');
    renderApp('/');

    const hrefs = sidebarLinks().map((a) => a.getAttribute('href'));
    const expected = NAV_GROUPS.flatMap((g) => navRoutes(g)).map((r) => r.path);

    expect([...hrefs].sort()).toEqual([...expected].sort());
  });

  it('/r/cliente mantém a home ativa na barra lateral', () => {
    renderApp('/r/cliente');

    expect(document.querySelector('.sidebar-link.is-active')).toHaveAttribute('href', '/');
  });
});
