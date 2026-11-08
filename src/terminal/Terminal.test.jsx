import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { complete, findCommand } from './commands';

function terminalInput() {
  return screen.getByRole('textbox', { name: 'Linha de comando do terminal' });
}

describe('terminal da página inicial', () => {
  beforeEach(() => sessionStorage.clear());

  it('mostra o nome como título e responde ao comando ajuda', async () => {
    const user = userEvent.setup();
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Duda Brito' })).toBeInTheDocument();
    await user.type(terminalInput(), 'ajuda{Enter}');
    expect(screen.getByText(/Comandos disponíveis/)).toBeInTheDocument();
    expect(terminalInput()).toHaveValue('');
  });

  it('avisa quando o comando não existe', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.type(terminalInput(), 'xyz{Enter}');
    expect(screen.getByText(/xyz: comando não encontrado/)).toBeInTheDocument();
  });

  it('lista os projetos com link para o GitHub', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.type(terminalInput(), 'projetos{Enter}');
    const log = document.querySelector('.term-log');
    expect(within(log).getByText('EcoShop')).toBeInTheDocument();
    expect(within(log).getAllByRole('link', { name: 'github' }).length).toBeGreaterThan(0);
  });

  it('o atalho "curriculo" abre a página do currículo', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('button', { name: /curriculo/ }));
    expect(window.location.pathname).toBe('/curriculo');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Maria Eduarda de Paula Brito' }),
    ).toBeInTheDocument();
  });

  it('tema e idioma pelo terminal atualizam o resto do site', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const before = document.documentElement.getAttribute('data-theme');
    await user.type(terminalInput(), 'tema{Enter}');
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(before);
    await user.type(terminalInput(), 'idioma{Enter}');
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { name: /About me/ })).toBeInTheDocument();
    // o histórico é redesenhado no novo idioma
    expect(screen.getByText('language: English')).toBeInTheDocument();
  });

  it('↑ recupera o comando anterior e limpar zera a tela', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.type(terminalInput(), 'sobre{Enter}');
    await user.type(terminalInput(), '{ArrowUp}');
    expect(terminalInput()).toHaveValue('sobre');
    await user.clear(terminalInput());
    await user.type(terminalInput(), 'limpar{Enter}');
    expect(document.querySelectorAll('.term-entry')).toHaveLength(0);
  });

  it('restaura o histórico ao voltar para a página, sem repetir a navegação', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp('/');
    await user.type(terminalInput(), 'contato{Enter}');
    await user.type(terminalInput(), 'cd curriculo{Enter}');
    expect(window.location.pathname).toBe('/curriculo');
    unmount();
    renderApp('/');
    expect(window.location.pathname).toBe('/');
    expect(document.querySelectorAll('.term-entry')).toHaveLength(2);
  });
});

describe('interpretador', () => {
  it('aceita nomes em português e inglês', () => {
    expect(findCommand('help')).toBe(findCommand('ajuda'));
    expect(findCommand('RESUME')).toBe(findCommand('curriculo'));
  });

  it('completa comandos e diretórios', () => {
    expect(complete('proj', 'pt')).toBe('projetos ');
    expect(complete('cd acad', 'pt')).toBe('cd academico');
    expect(complete('cd acad', 'en')).toBe('cd academics');
    expect(complete('c', 'pt')).toEqual(expect.arrayContaining(['curriculo', 'contato', 'cd']));
  });
});
