import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';

const ROUTES = [
  '/',
  '/curriculo',
  '/academico',
  '/servicos',
  '/sobre',
  '/habilidades',
  '/projetos',
  '/experiencias',
  '/contato',
  '/estudos-de-caso/whatsapp-dispatcher',
  '/pagina-que-nao-existe',
];

const barInput = () => screen.getByRole('textbox', { name: 'Barra de comandos do site' });

beforeEach(() => sessionStorage.clear());

describe('layout único em todas as páginas', () => {
  it.each(ROUTES)('%s tem um Header, uma barra de comandos, uma Window e um Footer', (route) => {
    renderApp(route);
    expect(document.querySelectorAll('header.site-nav')).toHaveLength(1);
    expect(document.querySelectorAll('.cmdbar')).toHaveLength(1);
    expect(document.querySelectorAll('.win')).toHaveLength(1);
    expect(document.querySelectorAll('footer')).toHaveLength(1);

    // a ordem do esqueleto: Header → barra → Window → Footer
    const order = ['header.site-nav', '.cmdbar', '.win', 'footer'].map((sel) =>
      document.querySelector<HTMLElement>(sel)!,
    );

    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it('o header é o mesmo em todas as rotas: acesso a comandos, logo e dois controles', () => {
    for (const route of ROUTES) {
      const { unmount } = renderApp(route);
      const header = document.querySelector<HTMLElement>('header.site-nav')!;

      expect(
        within(header)
          .queryAllByRole('link')
          .map((a) => a.getAttribute('href')),
        route,
      ).toEqual(['/']);
      expect(within(header).getByRole('link', { name: /mariab.dev/ })).toBeInTheDocument();

      const buttons = within(header)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label'));

      expect(buttons, route).toEqual(['Comandos (Ctrl K)', 'Modo claro', 'EN — Switch to English']);
      // sem menu de links nem menu recolhível
      expect(header.querySelector<HTMLElement>('ul, .nav-links, .menu-toggle')!).toBeNull();
      unmount();
    }
  });

  it('o botão >_ do header foca a barra de comandos', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    await user.click(screen.getByRole('button', { name: 'Comandos (Ctrl K)' }));
    expect(barInput()).toHaveFocus();
  });

  it('só as páginas internas têm "Voltar" e breadcrumb', () => {
    for (const route of ROUTES) {
      const { unmount } = renderApp(route);
      const inner = route !== '/';

      expect(!!document.querySelector<HTMLElement>('.shell-back')!, route).toBe(inner);
      expect(!!document.querySelector<HTMLElement>('.crumbs')!, route).toBe(inner);
      unmount();
    }
  });

  it('o breadcrumb usa o vocabulário dos comandos nos dois idiomas', async () => {
    const user = userEvent.setup();

    renderApp('/academico');

    const crumbs = () =>
      within(document.querySelector<HTMLElement>('.crumbs')!).getAllByRole('listitem');

    expect(crumbs().map((li) => li.textContent)).toEqual(['~', 'academico']);
    expect(document.querySelector<HTMLElement>('.win-title')!).toHaveTextContent(
      'visitante@mariab.dev: ~/academico',
    );
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(crumbs().map((li) => li.textContent)).toEqual(['~', 'academics']);
    expect(document.querySelector<HTMLElement>('.win-title')!).toHaveTextContent('~/academics');
  });

  it('o estudo de caso mostra projetos / whatsapp-dispatcher', () => {
    renderApp('/estudos-de-caso/whatsapp-dispatcher');
    expect(
      within(document.querySelector<HTMLElement>('.crumbs')!)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['~', 'projetos', 'whatsapp-dispatcher']);
  });
});

describe('Voltar', () => {
  it('usa history.back() quando a página anterior é do site', async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    renderApp('/projetos');
    await user.click(screen.getByRole('link', { name: /Ler o Estudo de Caso/ }));
    expect(window.location.pathname).toBe('/estudos-de-caso/whatsapp-dispatcher');
    await user.click(screen.getByRole('button', { name: 'Voltar à página anterior' }));
    expect(back).toHaveBeenCalledTimes(1);
    back.mockRestore();
  });

  it('vai para a home quando a página foi aberta direto', async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    renderApp('/academico');
    await user.click(screen.getByRole('button', { name: 'Voltar à página anterior' }));
    expect(back).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/');
    back.mockRestore();
  });
});

describe('barra de comandos', () => {
  it('Ctrl+K e / focam a barra', async () => {
    const user = userEvent.setup();

    renderApp('/academico');
    await user.keyboard('{Control>}k{/Control}');
    expect(barInput()).toHaveFocus();
    barInput().blur();
    await user.keyboard('/');
    expect(barInput()).toHaveFocus();
    expect(barInput()).toHaveValue('');
  });

  it('os atalhos não roubam o foco de campos de formulário', async () => {
    const user = userEvent.setup();

    renderApp('/');

    const terminal = screen.getByRole('textbox', { name: 'Linha de comando do terminal' });

    await user.click(terminal);
    await user.keyboard('a/b');
    expect(terminal).toHaveFocus();
    expect(terminal).toHaveValue('a/b');
    await user.keyboard('{Control>}k{/Control}');
    expect(terminal).toHaveFocus();
  });

  it('executa comandos fora da home e mostra a saída num painel', async () => {
    const user = userEvent.setup();

    renderApp('/servicos');
    await user.type(barInput(), 'curriculo{Enter}');

    const panel = document.querySelector<HTMLElement>('.cmdbar-panel')!;

    expect(within(panel).getByText('Maria Eduarda de Paula Brito')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/servicos');
    // fora da home, "ver no terminal" leva à home com o comando já executado
    expect(within(panel).getByRole('link', { name: /ver no terminal/ })).toHaveAttribute(
      'href',
      '/?cmd=curriculo',
    );
    expect(within(panel).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
    // Esc fecha o painel
    await user.keyboard('{Escape}');
    expect(document.querySelector<HTMLElement>('.cmdbar-panel')!).toBeNull();
  });

  it('completa com Tab e lista sugestões', async () => {
    const user = userEvent.setup();

    renderApp('/curriculo');
    await user.type(barInput(), 'proj{Tab}');
    expect(barInput()).toHaveValue('projetos ');
    await user.clear(barInput());
    await user.type(barInput(), 'c{Tab}');

    const list = screen.getByRole('list', { name: 'Sugestões de comandos' });

    expect(within(list).getByRole('button', { name: 'curriculo' })).toBeInTheDocument();
    await user.click(within(list).getByRole('button', { name: 'curriculo' }));
    expect(barInput()).toHaveValue('curriculo ');
  });

  it('na home, a barra e o terminal compartilham o histórico e a saída', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.type(barInput(), 'ajuda{Enter}');
    expect(
      within(document.querySelector<HTMLElement>('.term-log')!).getByText(/Comandos disponíveis/),
    ).toBeInTheDocument();
    expect(document.querySelector<HTMLElement>('.cmdbar-panel')!).toBeNull();
    await user.type(barInput(), '{ArrowUp}');
    expect(barInput()).toHaveValue('ajuda');
  });
});

describe('duas visualizações', () => {
  it('as páginas dedicadas têm [ ver no terminal ] e [ página própria ] na barra da janela', async () => {
    const user = userEvent.setup();

    renderApp('/academico');

    const bar = document.querySelector<HTMLElement>('.win-bar')!;

    expect(within(bar).getByRole('link', { name: 'ver no terminal' })).toHaveAttribute(
      'href',
      '/?cmd=academico',
    );
    expect(within(bar).getByRole('button', { name: 'página própria' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(within(bar).getByRole('link', { name: 'ver no terminal' }));
    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('');

    const log = document.querySelector<HTMLElement>('.term-log')!;

    expect(
      within(log).getByText('Linha do tempo'.toLowerCase(), { exact: false }),
    ).toBeInTheDocument();
    expect(within(log).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
  });

  it('/?cmd=servicos abre a home com o comando executado e limpa a URL', () => {
    renderApp('/?cmd=servicos');
    expect(window.location.search).toBe('');
    expect(document.querySelector<HTMLElement>('.term-entry')!).toHaveTextContent('servicos');
    expect(document.querySelector<HTMLElement>('.term-log')!).toHaveTextContent(
      'Site Institucional',
    );
  });

  it('ignora ?cmd= que não é de uma página', () => {
    renderApp('/?cmd=tema');
    expect(document.querySelector<HTMLElement>('.term-entry')!).toBeNull();
  });

  it('Serviços e estudo de caso levam a servicos / projetos no terminal', () => {
    renderApp('/servicos');
    expect(
      within(document.querySelector<HTMLElement>('.win-bar')!).getByRole('link', {
        name: 'ver no terminal',
      }),
    ).toHaveAttribute('href', '/?cmd=servicos');
  });

  it('o estudo de caso leva a projetos no terminal', () => {
    renderApp('/estudos-de-caso/whatsapp-dispatcher');
    expect(
      within(document.querySelector<HTMLElement>('.win-bar')!).getByRole('link', {
        name: 'ver no terminal',
      }),
    ).toHaveAttribute('href', '/?cmd=projetos');
  });

  it('toda saída com página dedicada termina com as duas ações', async () => {
    const user = userEvent.setup();

    renderApp('/');

    const input = screen.getByRole('textbox', { name: 'Linha de comando do terminal' });

    for (const cmd of [
      'sobre',
      'habilidades',
      'projetos',
      'experiencias',
      'curriculo',
      'academico',
      'servicos',
      'contato',
    ]) {
      await user.type(input, `${cmd}{Enter}`);

      const log = document.querySelector<HTMLElement>('.term-log')!;

      expect(within(log).getByRole('button', { name: /ver no terminal/ }), cmd).toBeInTheDocument();
      expect(within(log).getByText(/abrir página própria/), cmd).toBeInTheDocument();
    }
    // sem página dedicada: sem ações
    await user.type(input, 'ajuda{Enter}');
    expect(
      within(document.querySelector<HTMLElement>('.term-log')!).queryByText(/abrir página própria/),
    ).toBeNull();
  });
});
