import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './test/helpers';

describe('página inicial', () => {
  it('tem cada seção principal uma única vez, na ordem pedida', () => {
    renderApp('/');
    const ids = [...document.querySelectorAll('main section[id]')].map((s) => s.id);
    expect(ids).toEqual(['inicio', 'sobre', 'habilidades', 'projetos', 'experiencias', 'contato']);
    expect(document.querySelectorAll('[id]').length).toBe(
      new Set([...document.querySelectorAll('[id]')].map((e) => e.id)).size,
    );
    expect(screen.getAllByRole('heading', { level: 2, name: /Experiências/ })).toHaveLength(1);
  });

  it('lista os projetos na timeline sem repetir nenhum', () => {
    renderApp('/');
    const timeline = screen.getByRole('list', { name: /Linha do tempo/ });
    const names = within(timeline)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(names.slice(0, 2)).toEqual(['Planoriza', 'EcoShop']);
    expect(names).toHaveLength(3);
    expect(within(timeline).getByText('ShortURL')).toBeInTheDocument();
    expect(within(timeline).getByText('File Name Standardizer')).toBeInTheDocument();
  });

  it('troca de idioma, mantém na página e persiste a escolha', async () => {
    const user = userEvent.setup();
    renderApp('/');
    expect(screen.getByRole('heading', { name: /Sobre mim/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('heading', { name: /About me/ })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('portfolio-lang')).toBe('en');
    expect(window.location.pathname).toBe('/');
  });

  it('alterna o tema e persiste no localStorage', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Modo claro' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Modo escuro' })).toBeInTheDocument();
  });

  it('o menu móvel abre e fecha com aria-expanded', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});

describe('navegação', () => {
  it('abre o estudo de caso e a página de serviços sem recarregar', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('link', { name: /Ler o Estudo de Caso/ }));
    expect(window.location.pathname).toBe('/estudos-de-caso/whatsapp-dispatcher');
    expect(
      screen.getByRole('heading', { level: 1, name: 'WhatsApp Dispatcher' }),
    ).toBeInTheDocument();
    await user.click(screen.getAllByRole('link', { name: /Voltar aos projetos/ })[0]);
    expect(window.location.pathname).toBe('/');
    expect(window.location.hash).toBe('#projetos');
  });

  it('mostra a página 404 para rotas desconhecidas', () => {
    renderApp('/nao-existe');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
  });

  it('todas as rotas renderizam sem erro nos dois idiomas', async () => {
    const user = userEvent.setup();
    for (const path of ['/', '/servicos', '/estudos-de-caso/whatsapp-dispatcher']) {
      const { unmount } = renderApp(path);
      expect(screen.getByRole('main')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /Switch to English/ }));
      expect(document.documentElement.lang).toBe('en');
      unmount();
      localStorage.clear();
    }
  });
});

describe('FAQ', () => {
  it('abre um item por vez e expõe aria-expanded/aria-controls', async () => {
    const user = userEvent.setup();
    renderApp('/servicos');
    const [first, second] = screen.getAllByRole('button', { name: /\?$/ });
    expect(first).toHaveAttribute('aria-expanded', 'false');
    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(first.getAttribute('aria-controls'))).toHaveClass('open');
    await user.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  it('navega entre perguntas com as setas do teclado', async () => {
    const user = userEvent.setup();
    renderApp('/servicos');
    const [first, second] = screen.getAllByRole('button', { name: /\?$/ });
    first.focus();
    await user.keyboard('{ArrowDown}');
    expect(second).toHaveFocus();
  });
});

describe('lightbox', () => {
  it('abre, navega pelo teclado, bloqueia a rolagem, fecha com Esc e devolve o foco', async () => {
    const user = userEvent.setup();
    renderApp('/servicos');
    const thumbs = screen.getAllByRole('button', { name: /Ampliar imagem: BECAS/ });
    thumbs[0].focus();
    await user.click(thumbs[0]);
    const dialog = screen.getByRole('dialog', { name: 'Galeria de imagens' });
    expect(dialog).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(within(dialog).getByText('1 / 4')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByText('2 / 4')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(within(dialog).getByText('4 / 4')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    await waitFor(() => expect(thumbs[0]).toHaveFocus());
  });
});
