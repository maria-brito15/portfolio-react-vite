import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { routes } from '../data/routes';
import { resolveTarget, sectionsOf } from '../data/sections';
import { commandInventory, complete, findCommand, parse, runCommand } from './commands';

const terminalInput = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
const log = () => document.querySelector('.term-log');

async function run(user, line) {
  await user.type(terminalInput(), `${line}{Enter}`);
}

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
      const cmd = findCommand(route.name);
      expect(cmd, route.name).toBeDefined();
      expect(findCommand(route.alias), route.alias).toBe(cmd);
    }
  });

  it('a ajuda lista só comandos que existem e não esconde nenhum visível', async () => {
    const user = userEvent.setup();
    renderApp('/');
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
    for (const lang of ['pt', 'en']) {
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
    renderApp('/');
    for (const [line, text] of [
      ['cd xyz', 'cd: xyz: página não encontrada'],
      ['cd curriculo/xyz', 'cd: xyz: seção não encontrada'],
      ['ls xyz', 'ls: xyz: página não encontrada'],
      ['curriculo xyz', '"xyz": seção não encontrada'],
      ['sobre algo', 'esta página não tem seções'],
      ['', null],
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
      const result = runCommand(line, { lang: 'pt', history: [], replay: true });
      expect(typeof result.output, JSON.stringify(line)).toBe('function');
    }
  });
});

describe('índice das seções (um só renderizador)', () => {
  const indexOf = () => log().querySelector('.t-index');

  it('curriculo e ls curriculo produzem o mesmo índice [1]…[6] com instrução e dicas', async () => {
    const user = userEvent.setup();
    renderApp('/');
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
    renderApp('/');
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
    renderApp('/');
    await run(user, 'curriculo 2');
    await waitFor(() => expect(log()).toHaveTextContent('Competências técnicas'));
    const typed = log().querySelector('.term-entry').textContent;
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
    const clicked = log().querySelector('.term-entry').textContent;
    expect(clicked.replace(/^.*?Competências/s, 'Competências')).toBe(
      typed.replace(/^.*?Competências/s, 'Competências'),
    );
  });

  it('toda seção termina com próxima, anterior e índice; os extremos avisam', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const nav = () => log().querySelector('.t-sectionnav');
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
    renderApp('/');
    await run(user, 'ls contato');
    expect(indexOf()).toBeNull();
    expect(log()).toHaveTextContent('esta página não tem seções');
  });
});

describe('ls <página> e <página> <seção>', () => {

  it('ls sem argumento lista as páginas com o número de seções', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await run(user, 'ls');
    expect(log()).toHaveTextContent('curriculo');
    expect(log()).toHaveTextContent('6 seções');
  });

  it('curriculo competencias imprime o conteúdo da seção, sem navegar', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await run(user, 'curriculo competencias');
    expect(window.location.pathname).toBe('/');
    expect(log()).toHaveTextContent('Competências técnicas');
    expect(log()).toHaveTextContent('Java');
    expect(log()).toHaveTextContent('desde 2025');
    expect(within(log()).getByRole('button', { name: /abrir página própria/ })).toBeInTheDocument();
  });

  it('funciona com barra, maiúsculas e em inglês', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await run(user, 'CURRICULO/Competencias');
    expect(log()).toHaveTextContent('Competências técnicas');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    await run(user, 'resume skills');
    expect(log()).toHaveTextContent('Technical skills');
  });

  it('academico disciplinas mostra os semestres como placeholder', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await run(user, 'academico disciplinas');
    expect(log()).toHaveTextContent('02/2026');
    expect(log()).toHaveTextContent('sem disciplinas lançadas');
  });

  it('projetos ecoshop mostra detalhes e versões', async () => {
    const user = userEvent.setup();
    renderApp('/');
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
      renderApp('/');
      for (const route of routes.filter((r) => sectionsOf(r.id).length)) {
        for (const section of sectionsOf(route.id)) {
          await run(user, `${route.name} ${section.name}`);
          const entry = log().querySelector('.term-entry');
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
    delete globalThis.jest;
  });

  it('abre a página própria na seção certa', async () => {
    vi.useFakeTimers();
    globalThis.jest = { advanceTimersByTime: vi.advanceTimersByTime };
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderApp('/');
    await run(user, 'cd curriculo/competencias');
    expect(log()).toHaveTextContent('abrindo /curriculo#competencias…');
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
    expect(window.location.pathname).toBe('/curriculo');
    expect(window.location.hash).toBe('#competencias');
    expect(document.getElementById('competencias')).toBeInTheDocument();
  });

  it('"abrir página própria" de uma seção leva à âncora', async () => {
    vi.useFakeTimers();
    globalThis.jest = { advanceTimersByTime: vi.advanceTimersByTime };
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderApp('/');
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
