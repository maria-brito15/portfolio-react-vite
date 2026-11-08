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
    // anos do mais recente ao mais antigo
    expect(within(tables[0]).getByText(/Monitoria/)).toBeInTheDocument();
    expect(within(tables[1]).getByText('Planoriza')).toBeInTheDocument();
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

describe('acadêmico: ordem decrescente', () => {
  const periods = (table) =>
    within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell').at(-1).textContent);

  it('mostra primeiro o ano mais recente e, dentro dele, o mês mais recente', () => {
    renderApp('/academico');
    const [y2026, y2025] = screen.getAllByRole('table');
    expect(periods(y2026).slice(0, 3)).toEqual(['02/2026', '01/2026', '01/2026']);
    expect(periods(y2026).at(-1)).toMatch(/2026/); // sem mês, por último
    expect(periods(y2025)[0]).toBe('02/2025');
    const all = [...periods(y2026), ...periods(y2025)];
    expect(all.indexOf('02/2025')).toBeGreaterThan(all.indexOf('01/2026'));
  });

  it('lista o semestre mais recente primeiro em Disciplinas e notas', () => {
    renderApp('/academico');
    const labels = within(document.getElementById('disciplinas'))
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.firstChild.textContent);
    expect(labels).toEqual(['02/2026', '01/2026', '02/2025', '01/2025']);
  });
});
