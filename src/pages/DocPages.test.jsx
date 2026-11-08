import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';

describe('currículo', () => {
  it('tem as seções numeradas no índice e o botão de imprimir', async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderApp('/curriculo');
    const toc = screen.getByRole('complementary', { name: 'Seções desta página' });
    expect(
      within(toc)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toEqual([
      '#resumo',
      '#competencias',
      '#experiencias-cv',
      '#projetos-cv',
      '#formacao',
      '#reconhecimentos',
    ]);
    await user.click(screen.getByRole('button', { name: /Imprimir/ }));
    expect(print).toHaveBeenCalled();
    print.mockRestore();
  });

  it('funciona em inglês e pela rota /resume', async () => {
    const user = userEvent.setup();
    renderApp('/resume');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('heading', { level: 2, name: /Technical skills/ })).toBeInTheDocument();
  });
});

describe('currículo no estilo cards', () => {
  it('mostra tempo nas competências, experiências numeradas e prêmios com contagem', async () => {
    const user = userEvent.setup();
    renderApp('/curriculo');
    const skills = document.getElementById('competencias');
    expect(within(skills).getByText('Java').parentElement).toHaveTextContent(/\+ ano|< 1 ano/);
    // tecnologia sem projeto datado não ganha tempo inventado
    expect(within(skills).getByText('PHP').parentElement.querySelector('.sk-time')).toBeNull();

    const xp = document.getElementById('experiencias-cv');
    expect(within(xp).getByText('6 atividades desde 2025')).toBeInTheDocument();
    const more = within(xp).getByRole('button', { name: 'Mostrar mais' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await user.click(more);
    expect(within(xp).getByRole('button', { name: 'Mostrar menos' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    const awards = document.getElementById('reconhecimentos');
    expect(within(awards).getByText('2×')).toBeInTheDocument();
    expect(within(awards).getByText(/recebido 2 vezes/)).toBeInTheDocument();
    expect(within(awards).getByRole('link', { name: 'Planoriza' })).toBeInTheDocument();
  });
});

describe('acadêmico', () => {
  it('mostra formação, linha do tempo e atividades por ano', () => {
    renderApp('/academico');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Trajetória acadêmica' }),
    ).toBeInTheDocument();
    expect(
      within(document.getElementById('formacao-academica')).getByText(
        'Bacharelado em Engenharia de Software',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /2029: Previsão de conclusão/ })).toBeInTheDocument();
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(6);
    expect(within(tables[0]).getByText('Planoriza')).toBeInTheDocument();
    expect(within(tables[1]).getByText(/Monitoria/)).toBeInTheDocument();
    // quatro semestres como placeholder, ainda sem disciplinas nem notas
    const grades = document.getElementById('disciplinas');
    expect(within(grades).getByText('01/2025')).toBeInTheDocument();
    expect(within(grades).getByText('02/2025')).toBeInTheDocument();
    expect(within(grades).getByText('01/2026')).toBeInTheDocument();
    expect(within(grades).getByText('02/2026')).toBeInTheDocument();
    expect(within(grades).getAllByText('Disciplinas e notas a preencher.')).toHaveLength(4);
    expect(within(grades).getAllByText('Bacharelado em Ciência da Computação')).toHaveLength(3);
    expect(within(grades).getByText('em andamento')).toBeInTheDocument();
  });
});
