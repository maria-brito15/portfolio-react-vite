import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { projects } from '../data/projects';
import { CATEGORIES, categoryOf, commandCatalog } from '../terminal/catalog';
import { commandInventory } from '../terminal/commands';

beforeEach(() => sessionStorage.clear());

describe('painel inicial', () => {
  it('mostra só projetos com selo, com links para o estudo de caso e para o repositório', () => {
    renderApp('/');

    const section = screen
      .getByRole('heading', { level: 2, name: 'Projetos em destaque' })
      .closest('section')!;
    const badged = projects.filter((p) => p.pt.badge);

    expect(within(section).getAllByRole('article')).toHaveLength(badged.length);
    expect(within(section).getByRole('link', { name: 'Ler estudo de caso' })).toHaveAttribute(
      'href',
      '/estudos-de-caso/whatsapp-dispatcher',
    );
    for (const p of badged.filter((x) => x.repo))
      expect(
        within(section)
          .getAllByRole('link', { name: /Repositório/ })
          .map((a) => a.getAttribute('href')),
      ).toContain(p.repo);
  });

  it('resume o GitHub: sem rede, mostra o erro com "tentar de novo", nunca um número inventado', async () => {
    renderApp('/');
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver detalhes e repositórios/ })).toHaveAttribute(
      'href',
      '/github',
    );
  });

  it('troca de idioma sem perder nada', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.click(screen.getByRole('link', { name: 'EN' }));
    for (const name of ['Quick access', 'Featured projects'])
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See projects' })).toBeInTheDocument();
  });
});

describe('página do GitHub', () => {
  it('lista só os projetos com repositório público', () => {
    renderApp('/github');

    const list = screen.getByRole('list', { name: 'Repositórios dos projetos' });
    const withRepo = projects.filter((p) => p.repo);

    expect(within(list).getAllByRole('article')).toHaveLength(withRepo.length);
    expect(
      within(list)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toEqual(withRepo.map((p) => p.repo));
  });

  it('o comando github (apelido de stats) existe', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.type(
      screen.getByRole('textbox', { name: /Linha de comando do terminal/ }),
      'github{Enter}',
    );
    expect(
      await within(document.querySelector<HTMLElement>('.term-log')!).findByText('commits'),
    ).toBeInTheDocument();
  });
});

describe('catálogo de comandos do terminal', () => {
  it('todo comando visível tem categoria; nenhum oculto aparece', () => {
    const visible = commandInventory().filter((c) => !c.hidden);

    for (const c of visible) expect(categoryOf(c.id), `${c.id} sem categoria`).toBeDefined();
    expect(commandCatalog().map((c) => c.id)).toEqual(visible.map((c) => c.id));
    expect(CATEGORIES.every((c) => commandCatalog().some((e) => e.category === c))).toBe(true);
    for (const hidden of ['cowsay', 'matrix', 'rm', 'boot', 'sudo'])
      expect(commandCatalog().map((c) => c.id)).not.toContain(hidden);
  });

  it('cada botão roda o comando na própria sessão do terminal, sem outro interpretador', async () => {
    const user = userEvent.setup();

    renderApp();

    const catalog = screen
      .getByRole('heading', { level: 2, name: 'Referência de comandos' })
      .closest('section')!;

    await user.click(within(catalog).getByRole('button', { name: 'atalhos' }));
    expect(
      within(document.querySelector<HTMLElement>('.term-log')!).getByText(/abre a paleta/),
    ).toBeInTheDocument();
    // comando com argumento obrigatório não vira botão
    expect(within(catalog).queryByRole('button', { name: 'cd' })).toBeNull();
    expect(within(catalog).getByText('cd')).toBeInTheDocument();
  });
});

describe('paleta: destinos diretos', () => {
  it('escolher o terminal ou uma página abre o destino sem passar pelo interpretador', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');
    await user.keyboard('{Control>}k{/Control}');

    const dialog = await screen.findByRole('dialog', { name: 'Paleta de comandos' });

    await user.type(within(dialog).getByRole('combobox'), 'terminal');
    expect(within(dialog).getByText('Páginas')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(window.location.pathname).toBe('/terminal');
  });

  it('o estado vazio sugere o que tentar', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.keyboard('{Control>}k{/Control}');

    const dialog = await screen.findByRole('dialog', { name: 'Paleta de comandos' });

    await user.type(within(dialog).getByRole('combobox'), 'zzzz');
    expect(within(dialog).getByRole('status')).toHaveTextContent('nada encontrado');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Tente:');
  });

  it('um projeto abre a página de projetos na âncora do projeto (mesmo `cd` do terminal)', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.keyboard('{Control>}k{/Control}');

    const dialog = await screen.findByRole('dialog', { name: 'Paleta de comandos' });

    await user.type(within(dialog).getByRole('combobox'), 'ecoshop');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(window.location.pathname).toBe('/projetos'));
    expect(window.location.hash).toBe('#projeto-ecoshop');
  });
});
