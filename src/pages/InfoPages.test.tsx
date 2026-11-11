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

  it('/agora tem só o que a Duda informou; /setup segue vazio (nada inventado)', () => {
    expect(now.updated).toBe('2026-11-11');
    expect(now.items).toHaveLength(1);
    expect(now.items[0].text.pt).toContain('Specification-Driven Development');
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

describe('/setup em construção', () => {
  it('mostra título, aviso de construção, a janela de sempre e noindex', () => {
    renderApp('/setup');
    expect(screen.getByRole('heading', { level: 1, name: 'Setup' })).toBeInTheDocument();
    expect(screen.getByText('Em construção.')).toBeInTheDocument();
    expect(document.querySelector('.win-title')).toHaveTextContent('~/setup');
    expect(document.title).toContain('Duda Brito');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      expect.stringContaining('noindex'),
    );
  });

  it('o apelido em inglês abre a mesma página e o aviso troca de idioma', async () => {
    const user = userEvent.setup();

    renderApp('/uses');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Setup' })).toBeInTheDocument();
    expect(screen.getByText('Under construction.')).toBeInTheDocument();
  });

  it('o terminal mostra o aviso e o par "ver no terminal / abrir página própria"', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.type(input(), 'setup{Enter}');
    expect(within(log()).getByText('Em construção.')).toBeInTheDocument();
    expect(within(log()).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
  });
});

describe('/agora com conteúdo (CE-06)', () => {
  it('mostra o foco informado, a data e é indexável (sem aviso, sem noindex)', () => {
    renderApp('/agora');
    expect(screen.getByRole('heading', { level: 1, name: 'Agora' })).toBeInTheDocument();
    expect(screen.getByText('Foco')).toBeInTheDocument();
    expect(screen.getByText(/Specification-Driven Development \(SDD\)/)).toBeInTheDocument();
    expect(screen.getByText(/atualizado em 2026-11-11/)).toBeInTheDocument();
    expect(screen.queryByText('Em construção.')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      expect.stringContaining('index, follow'),
    );
  });

  it('troca de idioma e o apelido /now abre a mesma página', async () => {
    const user = userEvent.setup();

    renderApp('/now');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Now' })).toBeInTheDocument();
    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText(/updated on 2026-11-11/)).toBeInTheDocument();
  });

  it('o terminal mostra o mesmo conteúdo com o par de ações', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.type(input(), 'agora{Enter}');
    expect(within(log()).getByText('Foco')).toBeInTheDocument();
    expect(within(log()).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
  });
});

describe('ls e cd', () => {
  it('ls lista as duas páginas e cd abre', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.type(input(), 'ls{Enter}');
    expect(within(log()).getByRole('link', { name: 'agora' })).toHaveAttribute('href', '/agora');
    expect(within(log()).getByRole('link', { name: 'setup' })).toHaveAttribute('href', '/setup');
  });
});
