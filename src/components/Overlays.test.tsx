import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { directories } from '../data/routes';
import { shortcuts } from '../data/shortcuts';
import { PALETTE_KINDS, filterItems, paletteItems } from './paletteItems';
import { projects } from '../data/projects';
import { commandInventory } from '../terminal/commands';

const palette = () => screen.findByRole('dialog', { name: 'Paleta de comandos' });
const terminalInput = () => screen.getByRole('textbox', { name: 'Linha de comando do terminal' });
const log = () => document.querySelector<HTMLElement>('.term-log')!;

const ctrlK = (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Control>}k{/Control}');

beforeEach(() => sessionStorage.clear());

describe('opções da paleta (JA-06)', () => {
  it('vêm de routes.ts e do inventário: todas as páginas, sem ocultos nem comandos com argumento', () => {
    const items = paletteItems('pt');
    const ids = items.map((i) => i.id);

    for (const d of directories) expect(ids).toContain(`page:${d.id}`);

    for (const hidden of ['cowsay', 'matrix', 'rm', 'boot', 'sudo', 'pwd'])
      expect(ids).not.toContain(`command:${hidden}`);
    expect(ids).not.toContain('command:cd');
    expect(ids).toContain('command:neofetch');
    expect(items.find((i) => i.id === 'page:projetos')?.run).toBe('cd projetos');
    expect(paletteItems('en').find((i) => i.id === 'page:projetos')?.run).toBe('cd projects');

    // todo comando listado existe e não está oculto
    const visible = commandInventory().filter((c) => !c.hidden);

    expect(items.filter((i) => i.kind === 'command').length).toBeLessThanOrEqual(visible.length);
  });

  it('a busca ignora acento e caixa, e todos os termos precisam casar', () => {
    const items = paletteItems('pt');

    expect(filterItems(items, 'CURRICULO').map((i) => i.id)).toContain('page:curriculo');
    expect(filterItems(items, 'acadêmico').map((i) => i.id)).toContain('page:academico');
    expect(filterItems(items, 'resume').map((i) => i.id)).toContain('page:curriculo');
    expect(filterItems(items, 'zzzz')).toEqual([]);
    // sem busca a lista é curta: habilidades só aparecem quando se digita
    expect(filterItems(items, '')).toHaveLength(items.filter((i) => i.kind !== 'skill').length);
    expect(filterItems(items, 'tema escuro').length).toBeGreaterThan(0);
  });

  it('cobre páginas, projetos, estudo de caso, jogos, habilidades e comandos, e agrupa nessa ordem', () => {
    const items = paletteItems('pt');
    const kinds = new Set(items.map((i) => i.kind));

    expect([...kinds].sort()).toEqual(['command', 'game', 'page', 'project', 'skill']);
    for (const p of projects) expect(items.map((i) => i.id)).toContain(`project:${p.id}`);
    expect(items.find((i) => i.id === 'case:whatsapp-dispatcher')?.to).toBe(
      '/estudos-de-caso/whatsapp-dispatcher',
    );
    expect(items.find((i) => i.id === 'page:terminal')?.to).toBe('/terminal');
    expect(items.find((i) => i.id === 'project:ecoshop')?.run).toBe('cd projetos/ecoshop');
    expect(paletteItems('en').find((i) => i.id === 'project:ecoshop')?.run).toBe(
      'cd projects/ecoshop',
    );

    const order = filterItems(items, 'e').map((i) => PALETTE_KINDS.indexOf(i.kind));

    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('o melhor casamento vem primeiro dentro do grupo', () => {
    const items = paletteItems('pt');

    expect(filterItems(items, 'java').find((i) => i.kind === 'skill')?.label).toBe('Java');
    expect(filterItems(items, 'minas').map((i) => i.kind)).toContain('game');
    expect(filterItems(items, 'github').map((i) => i.id)).toContain('page:github');
  });
});

describe('paleta de comandos (JA-06, JA-07)', () => {
  it('Ctrl+K abre, o foco vai ao campo, e Ctrl+K de novo ou Esc fecham devolvendo o foco', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.click(terminalInput());
    await ctrlK(user);

    const dialog = await palette();

    expect(within(dialog).getByRole('combobox')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(terminalInput()).toHaveFocus();
    await ctrlK(user);
    await palette();
    await ctrlK(user);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('filtra enquanto digita, anuncia a contagem e navega com as setas', async () => {
    const user = userEvent.setup();

    renderApp();
    await ctrlK(user);

    const dialog = await palette();
    const box = within(dialog).getByRole('combobox');

    await user.type(box, 'proj');
    // "projetos" é uma página (cd) e também um comando (mostra no terminal)
    expect(within(dialog).getAllByRole('option', { name: /projetos/ })).toHaveLength(2);
    expect(within(dialog).queryByRole('option', { name: /academico/ })).toBeNull();
    expect(within(dialog).getByRole('status')).toHaveTextContent(/resultado/);
    await user.clear(box);
    await user.keyboard('{ArrowDown}');

    const options = within(dialog).getAllByRole('option');

    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(box).toHaveAttribute('aria-activedescendant', options[1].id);
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(within(dialog).getAllByRole('option').at(-1)).toHaveAttribute('aria-selected', 'true');
    await user.type(box, 'zzzz');
    expect(within(dialog).getByRole('status')).toHaveTextContent('nada encontrado');
  });

  it('o foco fica preso no diálogo (Tab não escapa)', async () => {
    const user = userEvent.setup();

    renderApp();
    await ctrlK(user);

    const dialog = await palette();

    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('escolher uma página roda `cd` pela sessão e abre a página', async () => {
    const user = userEvent.setup();

    renderApp();
    await ctrlK(user);
    await palette();
    await user.keyboard('academ{Enter}');
    expect(screen.queryByRole('dialog')).toBeNull();
    // o mesmo carregamento do terminal ("abrindo /academico…") e depois a navegação
    await waitFor(() => expect(window.location.pathname).toBe('/academico'), { timeout: 4000 });
    expect(JSON.parse(sessionStorage.getItem('portfolio-terminal') as string)).toEqual([
      'cd academico',
    ]);
  });

  it('escolher um comando na home roda no terminal e mostra a saída lá', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.click(terminalInput());
    await ctrlK(user);
    await palette();
    await user.keyboard('neofetch{Enter}');
    expect(log().querySelector('.t-neofetch')).toBeInTheDocument();
    expect(terminalInput()).toHaveFocus();
  });

  it('fora da home, a saída aparece no painel da barra de comandos', async () => {
    const user = userEvent.setup();

    renderApp('/servicos');
    await ctrlK(user);
    await palette();
    await user.click(await screen.findByRole('option', { name: /stats/ }));
    await waitFor(() => {
      const panel = document.querySelector<HTMLElement>('.cmdbar-panel');

      expect(panel).not.toBeNull();
      expect(panel).toHaveTextContent('commits');
    });
    expect(window.location.pathname).toBe('/servicos');
  });

  it('não rouba Ctrl+K nem ? de campos de formulário que não são a linha de comando', async () => {
    const user = userEvent.setup();

    renderApp('/contato');

    const name = await screen.findByLabelText(/Nome/);

    await user.click(name);
    await ctrlK(user);
    await user.keyboard('?');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(name).toHaveValue('?');
  });
});

describe('lista de atalhos (JA-08, JA-09)', () => {
  it('? abre a lista da tabela única e Esc fecha', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.keyboard('?');

    const dialog = await screen.findByRole('dialog', { name: 'Atalhos de teclado' });

    for (const s of shortcuts) {
      expect(within(dialog).getByText(s.keys)).toBeInTheDocument();
      expect(within(dialog).getByText(s.desc.pt)).toBeInTheDocument();
    }
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('? digitado na linha de comando é só texto', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.click(terminalInput());
    await user.keyboard('a?b');
    expect(terminalInput()).toHaveValue('a?b');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('o comando atalhos e a dica da ajuda leem a mesma tabela', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.type(terminalInput(), 'atalhos{Enter}');
    for (const s of shortcuts) expect(within(log()).getByText(s.desc.pt)).toBeInTheDocument();
    await user.type(terminalInput(), 'ajuda{Enter}');
    expect(log()).toHaveTextContent('Dica: Ctrl+K abre a paleta de comandos, / foca a barra');
  });
});
