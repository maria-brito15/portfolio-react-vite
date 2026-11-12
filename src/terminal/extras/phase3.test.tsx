import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { skillTimeline, type SkillGroup } from '../../data/skillTimeline';
import { skillLog } from './gitlog';
import { statsRows } from './stats';
import { buildInfo } from '../../data/build';
import { commandInventory, findCommand } from '../commands';
import { levenshtein, suggestPages } from '../../utils/suggest';
import { announceInConsole, consoleMessage } from '../../utils/consoleMessage';
import {
  commitCount,
  packageVersion,
  buildInfo as makeBuildInfo,
} from '../../../scripts/buildInfo';

const input = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
const log = () => document.querySelector<HTMLElement>('.term-log')!;

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(input(), `${line}{Enter}`);
}

beforeEach(() => sessionStorage.clear());

describe('git log: timeline de habilidades (CE-01)', () => {
  const groups: SkillGroup[] = [
    {
      id: 'a',
      title: { pt: 'A', en: 'A' },
      items: [
        { name: 'Velho', since: 2024, source: 'Proj A' },
        { name: 'Novo', since: 2026, source: { pt: 'Curso', en: 'Course' } },
        { name: 'Sem data', since: null },
        { name: 'Outro 26', since: 2026, source: 'Proj B' },
      ],
    },
  ];

  it('agrupa por ano, do mais recente ao mais antigo, e deixa os sem data de fora', () => {
    const result = skillLog(groups, 'en');

    expect(result.years.map((y) => y.year)).toEqual([2026, 2024]);
    expect(result.years[0].items).toEqual([
      { name: 'Novo', source: 'Course' },
      { name: 'Outro 26', source: 'Proj B' },
    ]);
    expect(result.undated).toEqual(['Sem data']);
  });

  it('o terminal mostra os anos reais e conta os sem data, nos dois idiomas', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'git log');

    const real = skillLog(skillTimeline, 'pt');

    expect([...log().querySelectorAll('.t-gitlog dt')].map((e) => e.textContent)).toEqual(
      real.years.map((y) => String(y.year)),
    );
    expect(log()).toHaveTextContent(`${real.undated.length} sem ano informado`);
    // nenhuma tecnologia sem data aparece dentro da linha do tempo
    for (const name of real.undated)
      expect(within(log().querySelector('.t-gitlog')!).queryByText(name)).toBeNull();
  });

  it('evolucao, git log e log são o mesmo comando; outro subcomando ensina o certo', async () => {
    const user = userEvent.setup();

    expect(findCommand('evolucao')).toBe(findCommand('git'));
    expect(findCommand('log')).toBe(findCommand('git'));
    renderApp();
    await run(user, 'git status');
    expect(log()).toHaveTextContent("git: 'status' não é um comando daqui");
  });
});

describe('stats (CE-02)', () => {
  it('mostra os dados injetados e "indisponível" quando faltam', () => {
    const rows = Object.fromEntries(
      statsRows({ commits: 128, version: '1.0.0', builtAt: '2026-11-11T12:00:00.000Z' }, 'pt'),
    );

    expect(rows.commits).toBe('128');
    expect(rows['versão']).toBe('1.0.0');
    expect(rows.build).toMatch(/2026/);

    const none = Object.fromEntries(
      statsRows({ commits: null, version: null, builtAt: null }, 'en'),
    );

    expect(none.commits).toBe('unavailable');
    expect(none.version).toBe('unavailable');
    expect(none.build).toBe('dev (no build)');
  });

  it('o comando existe, está na ajuda e lê o build real (nunca um número fixo)', async () => {
    const user = userEvent.setup();

    expect(commandInventory().find((c) => c.id === 'stats')?.hidden).toBe(false);
    renderApp();
    await run(user, 'stats');
    if (buildInfo.commits !== null) expect(log()).toHaveTextContent(String(buildInfo.commits));
    expect(log()).toHaveTextContent('lidos do repositório');
  });

  it('o script de build lê commits e versão, e tolera pasta sem git', () => {
    expect(packageVersion()).toMatch(/^\d+\.\d+\.\d+/);
    expect(packageVersion('/pasta/que/nao/existe')).toBeNull();
    expect(commitCount('/pasta/que/nao/existe')).toBeNull();
    expect(makeBuildInfo('serve').builtAt).toBeNull();
    expect(new Date(makeBuildInfo('build').builtAt as string).getFullYear()).toBeGreaterThan(2024);
  });
});

describe('404 temático (CE-03)', () => {
  it('levenshtein e sugestões por similaridade', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(suggestPages('/projeto').map((p) => p.id)[0]).toBe('projetos');
    expect(suggestPages('/Skils')[0].id).toBe('habilidades');
    expect(suggestPages('/contatos')[0].id).toBe('contato');
    expect(suggestPages('/curric')[0].id).toBe('curriculo');
    expect(suggestPages('/zzzzzzzz')).toEqual([]);
    expect(suggestPages('/')).toEqual([]);
    expect(suggestPages('/projetos/x/y/%').length).toBeLessThanOrEqual(3);
  });

  it('a página mostra "você quis dizer" com links e a dica do ls', () => {
    renderApp('/projeto');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '~/projetos' })).toHaveAttribute('href', '/projetos');
    expect(screen.getByText(/digite ls na barra de comandos/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar ao portfólio/ })).toHaveAttribute('href', '/');
  });

  it('sem nada parecido, mostra só o ls e a volta para a home', () => {
    renderApp('/zzzzzzzzzz');
    expect(screen.queryByText('Você quis dizer:')).toBeNull();
    expect(screen.getByText(/digite ls na barra de comandos/)).toBeInTheDocument();
  });
});

describe('mensagem no console (CE-05)', () => {
  it('uma única chamada a console.info, no idioma do navegador, sem erro nem aviso', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      announceInConsole('pt-BR');
      announceInConsole('en-US');
      expect(info).toHaveBeenCalledTimes(2);
      expect(info.mock.calls[0][0]).toContain('Oi!');
      expect(info.mock.calls[1][0]).toContain('Hi!');
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('cita o repositório e o contato reais', () => {
    for (const lang of ['pt', 'en'] as const) {
      expect(consoleMessage(lang)).toContain('github.com/maria-brito15/portfolio-react-vite');
      expect(consoleMessage(lang)).toContain('@');
    }
  });
});
