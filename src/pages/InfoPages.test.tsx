import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { directories, findPageByPath, routeById } from '../data/routes';
import { now } from '../data/now';
import { uses } from '../data/uses';
import { commandInventory, findCommand } from '../terminal/commands';

const input = () => screen.getByRole('textbox', { name: 'Linha de comando do terminal' });
const log = () => document.querySelector<HTMLElement>('.term-log')!;

beforeEach(() => sessionStorage.clear());

describe('rotas /agora e /setup (CE-06, CE-07)', () => {
  it('existem só em routes.ts, com apelidos em inglês e em construção enquanto vazias', () => {
    expect(findPageByPath('/agora')?.id).toBe('agora');
    expect(findPageByPath('/now')?.id).toBe('agora');
    expect(findPageByPath('/setup')?.id).toBe('setup');
    expect(findPageByPath('/uses')?.id).toBe('setup');
    expect(routeById('agora')?.draft).toBe(now.items.length === 0);
    expect(routeById('setup')?.draft).toBe(uses.groups.length === 0);
    expect(directories.map((d) => d.name)).toEqual(expect.arrayContaining(['agora', 'setup']));
  });

  it('o conteúdo começa vazio: nenhum texto inventado', () => {
    expect(now).toEqual({ updated: null, items: [] });
    expect(uses).toEqual({ updated: null, groups: [] });
  });

  it('os comandos existem nos dois idiomas, ligados à rota, e aparecem na ajuda', () => {
    for (const [pt, en, route] of [
      ['agora', 'now', 'agora'],
      ['setup', 'uses', 'setup'],
    ]) {
      expect(findCommand(pt)).toBe(findCommand(en));
      expect(commandInventory().find((c) => c.id === pt)).toMatchObject({
        route,
        hidden: false,
      });
    }
  });
});

describe('páginas em construção', () => {
  it.each([
    ['/agora', 'Agora'],
    ['/setup', 'Setup'],
  ])('%s mostra título, aviso de construção e a janela de sempre', (path, title) => {
    renderApp(path);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText('Em construção.')).toBeInTheDocument();
    expect(document.querySelector('.win-title')).toHaveTextContent(`~/${path.slice(1)}`);
    expect(document.title).toContain('Duda Brito');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      expect.stringContaining('noindex'),
    );
  });

  it('o aviso troca de idioma e o apelido em inglês abre a mesma página', async () => {
    const user = userEvent.setup();

    renderApp('/now');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeInTheDocument();
    expect(screen.getByText('Under construction.')).toBeInTheDocument();
  });

  it('o terminal mostra o aviso e o par "ver no terminal / abrir página própria"', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.type(input(), 'agora{Enter}');
    expect(within(log()).getByText('Em construção.')).toBeInTheDocument();
    expect(within(log()).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
    await user.type(input(), 'uses{Enter}');
    expect(within(log()).getByText('Em construção.')).toBeInTheDocument();
  });

  it('ls lista as duas páginas e cd abre', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.type(input(), 'ls{Enter}');
    expect(within(log()).getByRole('link', { name: 'agora' })).toHaveAttribute('href', '/agora');
    expect(within(log()).getByRole('link', { name: 'setup' })).toHaveAttribute('href', '/setup');
  });
});
