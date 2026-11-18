// Número sozinho, ls, cd e autocompletar.
// Parte da divisão de `sections.test.tsx` (spec 001, T6.3): nenhum caso mudou.
import { act, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { routes } from '../data/routes';
import { sectionsOf } from '../data/sections';
import { complete } from './commands';
import { log, run } from './sectionsHelpers';

beforeEach(() => sessionStorage.clear());

describe('número sozinho e navegação sequencial (DS-05, DS-07)', () => {
  const nav = () => log().querySelector<HTMLElement>('.t-sectionnav')!;

  it('depois de curriculo, 2 abre a seção 2 e proximo abre a 3', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo');
    await run(user, '2');
    await waitFor(() => expect(log()).toHaveTextContent('Competências técnicas'));
    expect(nav()).toHaveTextContent('próxima: curriculo 3 (experiencias)');
    await run(user, 'proximo');
    await waitFor(() => expect(nav()).toHaveTextContent('anterior: curriculo 2 (competencias)'));
    expect(nav()).toHaveTextContent('próxima: curriculo 4 (projetos)');
  });

  it('n e p equivalem a proximo e anterior', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo 3');
    await run(user, 'n');
    await waitFor(() => expect(nav()).toHaveTextContent('anterior: curriculo 3 (experiencias)'));
    await run(user, 'p');
    await waitFor(() => expect(nav()).toHaveTextContent('próxima: curriculo 4 (projetos)'));
    await run(user, 'anterior');
    await waitFor(() => expect(nav()).toHaveTextContent('próxima: curriculo 3 (experiencias)'));
  });

  it('os limites avisam: primeira e última seção', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo 1');
    await run(user, 'anterior');
    await waitFor(() => expect(log()).toHaveTextContent('esta é a primeira seção'));
    await run(user, 'curriculo 6');
    await run(user, 'proximo');
    await waitFor(() => expect(log()).toHaveTextContent('esta é a última seção'));
  });

  it('com o índice aberto, proximo abre a primeira seção', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo');
    await run(user, 'proximo');
    await waitFor(() => expect(nav()).toHaveTextContent('anterior: esta é a primeira seção'));
    expect(nav()).toHaveTextContent('próxima: curriculo 2 (competencias)');
  });

  it('sem contexto, número, proximo e anterior respondem noContext', async () => {
    const user = userEvent.setup();

    renderApp();
    for (const line of ['2', 'proximo', 'p']) {
      await run(user, line);
      await waitFor(() => expect(log()).toHaveTextContent('nenhum índice aberto'));
    }
    await run(user, 'curriculo');
    await run(user, 'limpar');
    await run(user, '2');
    await waitFor(() => expect(log()).toHaveTextContent('nenhum índice aberto'));
  });

  it('segue a última página aberta e funciona em inglês', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'idioma');
    await run(user, 'next');
    await waitFor(() => expect(log()).toHaveTextContent('no index open'));
    await run(user, 'resume');
    await run(user, 'academics');
    await run(user, '2');
    await waitFor(() => expect(nav()).toHaveTextContent('academics 3'));
    await run(user, 'previous');
    await waitFor(() => expect(nav()).toHaveTextContent('next: academics 2'));
    await run(user, '1');
    await waitFor(() => expect(nav()).toHaveTextContent('previous: this is the first section'));
  });

  it('proximo e anterior aparecem na ajuda e no autocompletar', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ajuda');
    await waitFor(() => expect(log()).toHaveTextContent('proximo'));
    expect(log()).toHaveTextContent('anterior');
    expect(complete('prox', 'pt')).toBe('proximo ');
    expect(complete('prev', 'en')).toBe('previous ');
  });
});

describe('ls <página> e <página> <seção>', () => {
  it('ls sem argumento lista as páginas com o número de seções', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ls');
    expect(log()).toHaveTextContent('curriculo');
    expect(log()).toHaveTextContent('6 seções');
  });

  it('curriculo competencias imprime o conteúdo da seção, sem navegar', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo competencias');
    expect(window.location.pathname).toBe('/terminal');
    expect(log()).toHaveTextContent('Competências técnicas');
    expect(log()).toHaveTextContent('Java');
    expect(log()).toHaveTextContent('desde 2025');
    expect(within(log()).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
  });

  it('funciona com barra, maiúsculas e em inglês', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'CURRICULO/Competencias');
    expect(log()).toHaveTextContent('Competências técnicas');
    await run(user, 'idioma');
    await run(user, 'resume skills');
    expect(log()).toHaveTextContent('Technical skills');
  });

  it('academico disciplinas mostra as disciplinas aprovadas e o semestre atual como placeholder', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'academico disciplinas');
    expect(log()).toHaveTextContent('02/2026');
    expect(log()).toHaveTextContent('sem disciplinas lançadas');
    expect(log()).toHaveTextContent('92');
    // sem carga horária nem modalidade informadas, a tabela fica compacta
    // (disciplina + nota), sem colunas de "—" à toa, nos três semestres com notas.
    expect(log().querySelectorAll('.t-table-grades--compact')).toHaveLength(3);
  });

  it('academico (resumo) mostra a contagem de disciplinas e a média por semestre, não um número solto', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'academico');
    expect(log()).toHaveTextContent('7 disciplinas');
    expect(log()).toHaveTextContent('média: 82');
    expect(log()).toHaveTextContent('em andamento');
  });

  it('projetos ecoshop mostra detalhes e versões', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'projetos ecoshop');
    expect(log()).toHaveTextContent('EcoShop');
    expect(log()).toHaveTextContent('v1');
    expect(log()).toHaveTextContent('v2');
    expect(log()).toHaveTextContent('github');
  });

  it(
    'nenhuma seção de nenhuma página fica inacessível pelo terminal',
    { timeout: 90000 },
    async () => {
      const user = userEvent.setup();

      renderApp();
      for (const route of routes.filter((r) => sectionsOf(r.id).length)) {
        for (const section of sectionsOf(route.id)) {
          await run(user, `${route.name} ${section.name}`);

          const entry = log().querySelector<HTMLElement>('.term-entry')!;

          expect(entry, `${route.name} ${section.name}`).toBeTruthy();
          expect(entry.textContent.length, `${route.name} ${section.name}`).toBeGreaterThan(40);
          expect(entry.textContent).not.toMatch(/não encontrada/);
        }
      }
    },
  );
});

describe('cd <página>/<seção>', () => {
  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as Record<string, unknown>).jest;
  });

  it('abre a página própria na seção certa', async () => {
    vi.useFakeTimers();
    (globalThis as Record<string, unknown>).jest = { advanceTimersByTime: vi.advanceTimersByTime };

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderApp();
    await run(user, 'cd curriculo/competencias');
    expect(log()).toHaveTextContent('abrindo /curriculo#competencias…');
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
    expect(window.location.pathname).toBe('/curriculo');
    expect(window.location.hash).toBe('#competencias');
    expect(document.getElementById('competencias')!).toBeInTheDocument();
  });

  it('"abrir página própria" de uma seção leva à âncora', async () => {
    vi.useFakeTimers();
    (globalThis as Record<string, unknown>).jest = { advanceTimersByTime: vi.advanceTimersByTime };

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderApp();
    await run(user, 'academico disciplinas');
    await user.click(within(log()).getByRole('button', { name: /abrir página própria/ }));
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
    expect(window.location.pathname + window.location.hash).toBe('/academico#disciplinas');
  });

  it('/?cmd= aceita comando + seção', () => {
    renderApp('/?cmd=curriculo%20competencias');
    expect(window.location.search).toBe('');
    expect(log()).toHaveTextContent('Competências técnicas');
  });
});

describe('autocompletar', () => {
  it('completa página depois de cd/ls/open e seção depois da barra ou do espaço', () => {
    expect(complete('cd curr', 'pt')).toBe('cd curriculo');
    expect(complete('ls acad', 'en')).toBe('ls academics');
    expect(complete('open serv', 'pt')).toBe('open servicos');
    expect(complete('cd curriculo/comp', 'pt')).toBe('cd curriculo/competencias');
    expect(complete('cd curriculo comp', 'pt')).toBe('cd curriculo competencias');
    expect(complete('curriculo comp', 'pt')).toBe('curriculo competencias');
    expect(complete('curriculo/comp', 'pt')).toBe('curriculo/competencias');
    expect(complete('resume ski', 'en')).toBe('resume skills');
    expect(complete('academico disc', 'pt')).toBe('academico disciplinas');
    expect(complete('projetos eco', 'pt')).toBe('projetos ecoshop');
  });

  it('lista as opções quando há mais de uma', () => {
    const sections = complete('cd curriculo/', 'pt');

    expect(sections).toEqual(
      expect.arrayContaining([
        'resumo',
        'competencias',
        'experiencias',
        'projetos',
        'formacao',
        'reconhecimentos',
      ]),
    );
    expect(complete('curriculo ', 'pt')).toHaveLength(6);
    expect(complete('cd ', 'pt')).toEqual(
      expect.arrayContaining(['curriculo', 'academico', 'projetos']),
    );
    expect(complete('academico f', 'pt')).toBe('academico formacao');
  });

  it('não inventa: sem opção, devolve a entrada', () => {
    expect(complete('cd zzz', 'pt')).toBe('cd zzz');
    expect(complete('curriculo zzz', 'pt')).toBe('curriculo zzz');
    expect(complete('echo ab', 'pt')).toBe('echo ab');
  });
});
