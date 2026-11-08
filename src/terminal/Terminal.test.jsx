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

  it('o atalho "curriculo" mostra a visão em terminal, sem navegar', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('button', { name: /curriculo/ }));
    expect(window.location.pathname).toBe('/');
    const log = document.querySelector('.term-log');
    expect(within(log).getByText('Maria Eduarda de Paula Brito')).toBeInTheDocument();
    expect(within(log).getByRole('button', { name: /ver no terminal/ })).toBeInTheDocument();
    expect(within(log).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
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

  it('cada comando limpa a tela: fica só a última entrada', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.type(terminalInput(), 'ajuda{Enter}');
    await user.type(terminalInput(), 'projetos{Enter}');
    expect(document.querySelectorAll('.term-entry')).toHaveLength(1);
    expect(screen.queryByText(/Comandos disponíveis/)).not.toBeInTheDocument();
    // o histórico digitado continua inteiro
    await user.type(terminalInput(), '{ArrowUp}');
    expect(terminalInput()).toHaveValue('projetos');
    await user.type(terminalInput(), '{ArrowUp}');
    expect(terminalInput()).toHaveValue('ajuda');
  });

  it('restaura só a última saída ao voltar para a página, sem repetir a navegação', () => {
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['contato', 'cd curriculo']));
    renderApp('/');
    expect(window.location.pathname).toBe('/');
    expect(document.querySelectorAll('.term-entry')).toHaveLength(1);
    expect(document.querySelector('.term-entry')).toHaveTextContent('cd curriculo');
    expect(document.querySelector('.term-entry')).toHaveTextContent('abrindo /curriculo… pronto ✓');
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
