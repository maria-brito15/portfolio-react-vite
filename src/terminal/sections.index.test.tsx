// Comandos, índice e contexto das seções do terminal.
// Parte da divisão de `sections.test.tsx` (spec 001, T6.3): nenhum caso mudou.
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { RouterProvider } from '../router';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ThemeProvider } from '../hooks/useTheme';
import { TerminalProvider } from './TerminalSession';
import { routes } from '../data/routes';
import { resolveTarget } from '../data/sections';
import {
  commandInventory,
  contextAfter,
  contextOfHistory,
  findCommand,
  parse,
  runCommand,
} from './commands';
import { useTerminalSession } from './sessionContext';
import { log, run } from './sectionsHelpers';

beforeEach(() => sessionStorage.clear());

describe('inventário de comandos', () => {
  const inventory = commandInventory();

  it('nenhum nome (PT, EN ou apelido) se repete entre comandos', () => {
    const seen = new Map();

    for (const c of inventory) {
      for (const name of c.names) {
        expect(seen.has(name), `"${name}" em ${c.id} e ${seen.get(name)}`).toBe(false);
        seen.set(name, c.id);
      }
    }
  });

  it('todo comando de página bate com routes.js (PT e EN)', () => {
    for (const route of routes.filter((r) => r.command && r.name)) {
      const cmd = findCommand(route.name as string);

      expect(cmd, route.name).toBeDefined();
      expect(findCommand(route.alias as string), route.alias).toBe(cmd);
    }
  });

  it('a ajuda lista só comandos que existem e não esconde nenhum visível', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ajuda');

    const listed = [...log().querySelectorAll('.t-help dl:first-of-type dt .t-cmd')].map(
      (el) => el.textContent,
    );
    const visible = inventory.filter((c) => !c.hidden);

    expect(listed).toHaveLength(visible.length);
    for (const name of listed) expect(findCommand(name), name).toBeDefined();
    // o esquema de seções é explicado
    expect(log()).toHaveTextContent('ls <página>');
    expect(log()).toHaveTextContent('<página> <seção>');
    expect(log()).toHaveTextContent('cd <página>/<seção>');
  });

  it('os atalhos clicáveis são comandos reais nos dois idiomas', async () => {
    const { quickCommands } = await import('./commands');

    for (const lang of ['pt', 'en'] as const) {
      for (const cmd of quickCommands[lang])
        expect(findCommand(cmd), `${lang}:${cmd}`).toBeDefined();
    }
  });
});

describe('argumentos e combinações', () => {
  it('parse trata espaços extras e aspas', () => {
    expect(parse('  cd   curriculo  ')).toEqual({ name: 'cd', args: ['curriculo'] });
    expect(parse('curriculo "competencias"')).toEqual({
      name: 'curriculo',
      args: ['competencias'],
    });
    expect(parse("echo 'a b'  c")).toEqual({ name: 'echo', args: ['a b', 'c'] });
  });

  it('resolveTarget aceita ~, ./, .., barra final, maiúsculas e acentos', () => {
    expect(resolveTarget(['~/curriculo/'])).toMatchObject({ route: { id: 'curriculo' } });
    expect(resolveTarget(['./Currículo', 'Competências'])).toMatchObject({
      route: { id: 'curriculo' },
      section: { id: 'competencias' },
    });
    expect(resolveTarget(['curriculo/competencias'])).toMatchObject({
      section: { id: 'competencias' },
    });
    expect(resolveTarget([])).toEqual({ home: true });
    expect(resolveTarget(['..'])).toEqual({ home: true });
    expect(resolveTarget(['xyz'])).toMatchObject({ error: 'page' });
    expect(resolveTarget(['curriculo', 'xyz'])).toMatchObject({ error: 'section' });
    expect(resolveTarget(['curriculo', 'resumo', 'extra'])).toMatchObject({ error: 'extra' });
  });

  it('erros são claros e nunca quebram', async () => {
    const user = userEvent.setup();

    renderApp();
    for (const [line, text] of [
      ['cd xyz', 'cd: xyz: página não encontrada'],
      ['cd curriculo/xyz', 'cd: xyz: seção não encontrada'],
      ['ls xyz', 'ls: xyz: página não encontrada'],
      ['curriculo xyz', 'seção "xyz" não existe; as seções são:'],
      ['sobre algo', 'esta página não tem seções'],
      ['', ''],
    ]) {
      if (!text) continue;
      await run(user, line);
      expect(log(), line).toHaveTextContent(text);
    }
  });

  it('runCommand devolve saída para entradas estranhas', () => {
    for (const line of [
      '',
      '   ',
      'cd',
      'cd ~',
      'cd ..',
      'cd /',
      'ls ..',
      'curriculo/',
      'cd "curriculo/ resumo"',
      '/',
      '//',
    ]) {
      const result = runCommand(line, {
        lang: 'pt',
        theme: 'dark',
        history: [],
        replay: true,
        toggleLang: () => {},
        toggleTheme: () => {},
        setTheme: () => {},
      });

      expect(typeof result.output, JSON.stringify(line)).toBe('function');
    }
  });
});

describe('índice das seções (um só renderizador)', () => {
  const indexOf = () => log().querySelector<HTMLElement>('.t-index')!;

  it('curriculo e ls curriculo produzem o mesmo índice [1]…[6] com instrução e dicas', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo');

    const first = await waitFor(() => {
      const el = indexOf();

      expect(el).toBeTruthy();

      return el;
    });
    const html = first.innerHTML;

    await run(user, 'ls curriculo');
    await waitFor(() => expect(log()).toHaveTextContent('ls curriculo'));
    expect(indexOf().innerHTML).toBe(html);
    expect(first.querySelectorAll('.t-index-list li')).toHaveLength(6);
    expect(first).toHaveTextContent('[1]');
    expect(first).toHaveTextContent('[6]');
    expect(first).toHaveTextContent('Digite o número ou o nome');
    for (const hint of ['ver uma seção', 'abrir a página', 'listar de novo', 'início']) {
      expect(first).toHaveTextContent(hint);
    }
  });

  it('o índice aparece em inglês e nas páginas com seções', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    await run(user, 'resume');
    expect(indexOf()).toHaveTextContent('Type the number or the name');
    for (const page of ['academico', 'servicos', 'projetos', 'experiencias']) {
      await run(user, page);
      expect(log().querySelectorAll('.t-index').length, page).toBeGreaterThan(0);
    }
  });

  it('clicar em [2] produz a mesma saída de "curriculo 2" e o botão é alcançável por Tab', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo 2');
    await waitFor(() => expect(log()).toHaveTextContent('Competências técnicas'));

    const typed = log().querySelector<HTMLElement>('.term-entry')!.textContent;

    await run(user, 'curriculo');

    const button = await waitFor(() => {
      const b = within(indexOf()).getAllByRole('button')[1];

      expect(b).toHaveTextContent('[2]');

      return b;
    });

    expect(button).not.toBeDisabled();
    expect(button.tabIndex).toBe(0);
    await user.click(button);
    await waitFor(() => expect(log()).toHaveTextContent('Competências técnicas'));
    expect(indexOf()).toBeNull();

    const clicked = log().querySelector<HTMLElement>('.term-entry')!.textContent;

    expect(clicked.replace(/^.*?Competências/s, 'Competências')).toBe(
      typed.replace(/^.*?Competências/s, 'Competências'),
    );
  });

  it('toda seção termina com próxima, anterior e índice; os extremos avisam', async () => {
    const user = userEvent.setup();

    renderApp();

    const nav = () => log().querySelector<HTMLElement>('.t-sectionnav')!;

    await run(user, 'curriculo 2');
    await waitFor(() => expect(nav()).toBeTruthy());
    expect(nav()).toHaveTextContent('próxima: curriculo 3 (experiencias)');
    expect(nav()).toHaveTextContent('anterior: curriculo 1 (resumo)');
    expect(nav()).toHaveTextContent('índice: curriculo');
    expect(within(nav()).getAllByRole('button')).toHaveLength(3);

    await run(user, 'curriculo 1');
    await waitFor(() => expect(nav()).toHaveTextContent('anterior: esta é a primeira seção'));
    await run(user, 'curriculo 6');
    await waitFor(() => expect(nav()).toHaveTextContent('próxima: esta é a última seção'));

    // clicar em "anterior" na última seção abre a quinta
    await user.click(within(nav()).getByRole('button', { name: /anterior/ }));
    await waitFor(() => expect(nav()).toHaveTextContent('próxima: curriculo 6 (reconhecimentos)'));
  });

  it('ls de página sem seções não mostra índice', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ls contato');
    expect(indexOf()).toBeNull();
    expect(log()).toHaveTextContent('esta página não tem seções');
  });
});

describe('contexto da última página (DS-05, DS-07)', () => {
  it('contextAfter acompanha página, seção, ls, cd ~ e limpar', () => {
    const c1 = contextAfter('curriculo');

    expect(c1).toEqual({ routeId: 'curriculo', sectionId: null });
    expect(contextAfter('academico disciplinas', c1)).toEqual({
      routeId: 'academico',
      sectionId: 'disciplinas',
    });
    expect(contextAfter('curriculo/competencias', null)).toEqual({
      routeId: 'curriculo',
      sectionId: 'competencias',
    });
    expect(contextAfter('ls servicos', c1)).toEqual({ routeId: 'servicos', sectionId: null });
    // argumento inválido mostra o índice da página: o contexto vira a página
    expect(contextAfter('curriculo 9', null)).toEqual({ routeId: 'curriculo', sectionId: null });
    // o que não abre índice não mexe no contexto
    for (const line of ['tema', 'ajuda', 'sobre', 'ls', 'ls xyz', 'cd curriculo', 'xpto', ''])
      expect(contextAfter(line, c1), line).toBe(c1);
    // limpar e cd ~ zeram
    expect(contextAfter('limpar', c1)).toBeNull();
    expect(contextAfter('cls', c1)).toBeNull();
    expect(contextAfter('cd ~', c1)).toBeNull();
  });

  it('o replay reconstrói o contexto do histórico sem efeitos', () => {
    expect(contextOfHistory(['curriculo', 'tema', 'academico', 'curriculo 2'])).toEqual({
      routeId: 'curriculo',
      sectionId: 'competencias',
    });
    expect(contextOfHistory(['curriculo', 'limpar'])).toBeNull();
    expect(contextOfHistory([])).toBeNull();
  });

  function Probe() {
    const s = useTerminalSession();

    return (
      <>
        <output data-testid="ctx">{JSON.stringify(s.context)}</output>
        {['curriculo', 'academico', 'limpar', 'cd ~'].map((c) => (
          <button key={c} onClick={() => s.execute(c)}>
            {c}
          </button>
        ))}
      </>
    );
  }
  const renderProbe = () => {
    window.history.replaceState(null, '', '/');

    return render(
      <RouterProvider>
        <LanguageProvider>
          <ThemeProvider>
            <TerminalProvider>
              <Probe />
            </TerminalProvider>
          </ThemeProvider>
        </LanguageProvider>
      </RouterProvider>,
    );
  };
  const ctx = () => JSON.parse(screen.getByTestId('ctx').textContent);

  it('a sessão muda o contexto ao abrir páginas e o zera com limpar e cd ~', async () => {
    const user = userEvent.setup();

    renderProbe();
    expect(ctx()).toBeNull();
    await user.click(screen.getByRole('button', { name: 'curriculo' }));
    expect(ctx()).toEqual({ routeId: 'curriculo', sectionId: null });
    await user.click(screen.getByRole('button', { name: 'academico' }));
    expect(ctx()).toEqual({ routeId: 'academico', sectionId: null });
    await user.click(screen.getByRole('button', { name: 'limpar' }));
    expect(ctx()).toBeNull();
    await user.click(screen.getByRole('button', { name: 'academico' }));
    await user.click(screen.getByRole('button', { name: 'cd ~' }));
    expect(ctx()).toBeNull();
  });

  it('a sessão restaurada do sessionStorage já nasce com o contexto', () => {
    sessionStorage.setItem(
      'portfolio-terminal',
      JSON.stringify(['curriculo', 'tema', 'academico disciplinas']),
    );
    renderProbe();
    expect(ctx()).toEqual({ routeId: 'academico', sectionId: 'disciplinas' });
    expect(window.location.pathname).toBe('/');
  });
});

describe('ajuda com exemplo de ponta a ponta (DS-11)', () => {
  it('traz o bloco "como navegar" com os três passos clicáveis, em PT e EN', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ajuda');
    await waitFor(() => expect(log()).toHaveTextContent('como navegar:'));
    expect(log()).toHaveTextContent('veja o índice → abra uma seção pelo número');

    const steps = [...log().querySelectorAll('.t-howto button')].map((b) => b.textContent);

    expect(steps).toEqual(['curriculo', '2', 'cd curriculo']);
    // os comandos do exemplo existem ("2" é o número do índice, tratado em runCommand)
    expect(findCommand('curriculo')).toBeDefined();
    expect(findCommand('cd')).toBeDefined();

    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    await run(user, 'help');
    await waitFor(() => expect(log()).toHaveTextContent('how to navigate:'));
    expect([...log().querySelectorAll('.t-howto button')].map((b) => b.textContent)).toEqual([
      'resume',
      '2',
      'cd resume',
    ]);
  });

  it('os passos funcionam na ordem do exemplo: curriculo → 2', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ajuda');
    await waitFor(() => expect(log().querySelector<HTMLElement>('.t-howto')!).toBeTruthy());
    await user.click(
      within(log().querySelector<HTMLElement>('.t-howto')!).getByRole('button', {
        name: 'curriculo',
      }),
    );
    await waitFor(() => expect(log().querySelector<HTMLElement>('.t-index')!).toBeTruthy());
    await user.click(
      within(log().querySelector<HTMLElement>('.t-index')!).getAllByRole('button')[1],
    );
    await waitFor(() => expect(log()).toHaveTextContent('Competências técnicas'));
  });
});

describe('erros que reensinam (DS-10)', () => {
  it('curriculo 9 e curriculo xpto mostram o erro e reimprimem o índice', async () => {
    const user = userEvent.setup();

    renderApp();
    for (const [line, bad] of [
      ['curriculo 9', '9'],
      ['curriculo xpto', 'xpto'],
      ['projetos xpto', 'xpto'],
      ['curriculo resumo sobra', 'sobra'],
    ]) {
      await run(user, line);
      await waitFor(() => expect(log().querySelector<HTMLElement>('.t-err')!).toBeTruthy());
      expect(log().querySelector<HTMLElement>('.t-err')!, line).toHaveTextContent(
        `seção "${bad}" não existe; as seções são:`,
      );
      expect(log().querySelector<HTMLElement>('.t-index .t-index-list li')!, line).toBeTruthy();
      expect(log()).toHaveTextContent('Digite o número ou o nome');
    }
  });

  it('um número fora do índice, depois de abrir a página, também reensina; em inglês', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    await run(user, 'resume');
    await run(user, '9');
    await waitFor(() => expect(log().querySelector<HTMLElement>('.t-err')!).toBeTruthy());
    expect(log().querySelector<HTMLElement>('.t-err')!).toHaveTextContent(
      'section "9" does not exist; the sections are:',
    );
    expect(log().querySelectorAll('.t-index-list li')).toHaveLength(6);
  });
});
