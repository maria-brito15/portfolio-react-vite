import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { NAV_GROUPS, navRoutes, routes } from '../data/routes';
import { projects } from '../data/projects';
import { BEST_KEY } from '../terminal/games/bestTimes';
import { CATEGORIES, categoryOf, commandCatalog } from '../terminal/catalog';
import { commandInventory } from '../terminal/commands';

const sidebar = () =>
  screen.getByRole('navigation', { name: /Navegação principal|Main navigation/ });

beforeEach(() => sessionStorage.clear());

describe('barra lateral', () => {
  it('lista todas as rotas com grupo, sem rascunhos nem duplicatas, e marca a página atual', () => {
    renderApp('/projetos');

    const links = within(sidebar()).getAllByRole('link');
    const hrefs = links.map((a) => a.getAttribute('href'));
    const expected = NAV_GROUPS.flatMap((g) => navRoutes(g).map((r) => r.path));

    expect(hrefs).toEqual(expected);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    // /setup está em construção (rascunho) e fica de fora; /agora tem conteúdo
    expect(hrefs).not.toContain('/setup');
    expect(hrefs).toContain('/agora');
    // toda rota navegável tem um caminho na barra: nada importante fica escondido
    for (const id of ['sobre', 'projetos', 'habilidades', 'curriculo', 'academico', 'servicos'])
      expect(hrefs).toContain(routes.find((r) => r.id === id)!.path);

    for (const path of ['/jogos', '/terminal', '/github', '/contato'])
      expect(hrefs).toContain(path);

    const current = within(sidebar()).getByRole('link', { current: 'page' });

    expect(current).toHaveAttribute('href', '/projetos');
  });

  it('o estudo de caso ilumina "Projetos", a rota-mãe', () => {
    renderApp('/estudos-de-caso/whatsapp-dispatcher');
    expect(within(sidebar()).getByRole('link', { current: 'page' })).toHaveAttribute(
      'href',
      '/projetos',
    );
  });

  it('os grupos são recolhíveis e têm rótulo nos dois idiomas', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');
    expect(within(sidebar()).getByText('Portfólio')).toBeInTheDocument();
    expect(within(sidebar()).getByText('Desenvolvimento')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(within(sidebar()).getByText('Portfolio')).toBeInTheDocument();
    expect(within(sidebar()).getByText('Development')).toBeInTheDocument();
    expect(within(sidebar()).getByRole('link', { name: 'Games' })).toBeInTheDocument();
    expect(sidebar().querySelectorAll('details')).toHaveLength(
      NAV_GROUPS.filter((g) => navRoutes(g).length).length,
    );
  });

  it('o botão do header abre e fecha a gaveta; Esc fecha; navegar também', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');

    const menu = screen.getByRole('button', { name: 'Abrir menu de navegação' });

    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar()).not.toHaveClass('is-open');
    await user.click(menu);
    expect(screen.getByRole('button', { name: 'Fechar menu de navegação' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(sidebar()).toHaveClass('is-open');
    await user.keyboard('{Escape}');
    expect(sidebar()).not.toHaveClass('is-open');
    await user.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    await user.click(within(sidebar()).getByRole('link', { name: 'Habilidades' }));
    expect(window.location.pathname).toBe('/habilidades');
    expect(sidebar()).not.toHaveClass('is-open');
  });

  it('gaveta aberta: o foco entra nela, Tab circula só dentro e Esc devolve o foco ao botão', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');

    const menu = screen.getByRole('button', { name: 'Abrir menu de navegação' });

    menu.focus();
    await user.keyboard('{Enter}');

    const links = within(sidebar()).getAllByRole('link');

    expect(links[0]).toHaveFocus();
    // Shift+Tab no primeiro item vai ao último; Tab no último volta ao primeiro.
    await user.tab({ shift: true });
    expect(sidebar().contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 40; i++) await user.tab();
    expect(sidebar().contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    expect(sidebar()).not.toHaveClass('is-open');
    expect(screen.getByRole('button', { name: 'Abrir menu de navegação' })).toHaveFocus();
  });

  it('o botão de atalhos abre a lista de atalhos', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');
    await user.click(within(sidebar()).getByRole('button', { name: /Atalhos de teclado/ }));
    expect(await screen.findByRole('dialog', { name: 'Atalhos de teclado' })).toBeInTheDocument();
  });
});

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

  it('mostra os recordes do campo minado salvos neste navegador, e só eles', () => {
    localStorage.setItem(BEST_KEY, JSON.stringify({ easy: 42 }));
    renderApp('/');
    expect(screen.getByText(/melhor tempo: fácil 42 s/)).toBeInTheDocument();
  });

  it('troca de idioma sem perder nada', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    for (const name of ['Quick access', 'Featured projects', 'Interactive'])
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See projects' })).toBeInTheDocument();
  });
});

describe('Game Center', () => {
  it('lista os três níveis com o recorde real e abre o tabuleiro existente ao jogar', async () => {
    const user = userEvent.setup();

    localStorage.setItem(BEST_KEY, JSON.stringify({ medium: 77 }));
    renderApp('/jogos');
    expect(screen.getByRole('heading', { level: 1, name: 'Game Center' })).toBeInTheDocument();
    expect(screen.getByText('9×9 · 10 minas')).toBeInTheDocument();
    expect(screen.getByText('16×16 · 40 minas')).toBeInTheDocument();
    expect(screen.getByText('30×16 · 99 minas')).toBeInTheDocument();
    expect(screen.getByText('Melhor tempo: 77 s')).toBeInTheDocument();
    expect(screen.getAllByText('Melhor tempo: sem recorde')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Jogar: Campo Minado, fácil' }));
    expect(await screen.findAllByRole('button', { name: /^linha \d+, coluna \d+/ })).toHaveLength(
      81,
    );
    await user.click(screen.getByRole('button', { name: /Encerrar partida/ }));
    expect(screen.queryAllByRole('button', { name: /^linha \d+, coluna \d+/ })).toHaveLength(0);
  });

  it('os comandos extras rodam no terminal e levam até ele', async () => {
    const user = userEvent.setup();

    renderApp('/jogos');

    const section = screen
      .getByRole('heading', { level: 2, name: 'Experiências no terminal' })
      .closest('section')!;

    await user.click(within(section).getByRole('button', { name: 'jogos' }));
    expect(window.location.pathname).toBe('/terminal');
    expect(await screen.findByText(/jogos disponíveis/)).toBeInTheDocument();
  });

  it('ver no terminal leva ao comando jogos', () => {
    renderApp('/jogos');
    expect(screen.getByRole('link', { name: 'ver no terminal' })).toHaveAttribute(
      'href',
      '/terminal?cmd=jogos',
    );
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
  it('escolher o terminal, um jogo ou uma habilidade abre a página sem passar pelo interpretador', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');
    await user.keyboard('{Control>}k{/Control}');

    const dialog = await screen.findByRole('dialog', { name: 'Paleta de comandos' });

    await user.type(within(dialog).getByRole('combobox'), 'campo minado difícil');
    expect(within(dialog).getByText('Jogos')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(window.location.pathname).toBe('/jogos');
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
