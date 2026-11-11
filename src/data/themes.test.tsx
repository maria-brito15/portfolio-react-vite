import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { DEFAULT_THEME, findTheme, isTheme, themes } from './themes';

const input = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
const log = () => document.querySelector<HTMLElement>('.term-log')!;
const attr = () => document.documentElement.getAttribute('data-theme');

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(input(), `${line}{Enter}`);
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'dark');
});

describe('tabela de temas', () => {
  it('encontra por id e por nome em PT/EN, sem acento e sem caixa', () => {
    expect(findTheme('ÂMBAR')?.id).toBe('amber');
    expect(findTheme('Amber')?.id).toBe('amber');
    expect(findTheme('escuro')?.id).toBe('dark');
    expect(findTheme('light')?.id).toBe('light');
    expect(findTheme('nada')).toBeUndefined();
    expect(isTheme('dracula')).toBe(true);
    expect(isTheme('rosa')).toBe(false);
  });

  it('o script do index.html conhece exatamente os mesmos ids (TB-03)', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    const listed = html.match(/\[((?:'[a-z]+',?\s*)+)\]\.indexOf\(theme\)/)?.[1] ?? '';
    const ids = [...listed.matchAll(/'([a-z]+)'/g)].map((m) => m[1]);

    expect(ids.sort()).toEqual(themes.map((t) => t.id).sort());
  });

  it('os temas extras são escuros', () => {
    for (const t of themes.filter((x) => !['dark', 'light'].includes(x.id)))
      expect(t.scheme, t.id).toBe('dark');
  });
});

describe('comando tema (TB-01, TB-02, TB-03)', () => {
  it('sem argumento continua alternando claro/escuro', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'tema');
    expect(attr()).toBe('light');
    await run(user, 'tema');
    expect(attr()).toBe('dark');
  });

  it('tema <nome> aplica e salva, em PT ou EN', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'tema dracula');
    expect(attr()).toBe('dracula');
    expect(localStorage.getItem('portfolio-theme')).toBe('dracula');
    expect(log()).toHaveTextContent('tema: dracula');
    await run(user, 'theme ambar');
    expect(attr()).toBe('amber');
    expect(localStorage.getItem('portfolio-theme')).toBe('amber');
  });

  it('nome inválido não muda o tema e lista os válidos (erro que reensina)', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'tema rosa');
    expect(attr()).toBe('dark');
    expect(log()).toHaveTextContent('tema: rosa: tema não encontrado');
    for (const t of themes) expect(within(log()).getByText(t.names.pt)).toBeInTheDocument();
    await run(user, 'tema dracula solarized');
    expect(attr()).toBe('dark');
  });

  it('tema ls lista com o atual marcado, e cada nome é um botão que aplica', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'tema dracula');
    await run(user, 'tema ls');

    const items = [...log().querySelectorAll('.t-index-list li')];

    expect(items).toHaveLength(themes.length);
    expect(log().querySelector('.t-index-list li:nth-child(3)')).toHaveTextContent(/●\s*dracula/);
    expect(log()).toHaveTextContent('atual');
    await user.click(within(log()).getByRole('button', { name: /solarized/ }));
    expect(attr()).toBe('solarized');
  });

  it('o replay do histórico não reaplica o tema', () => {
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['tema amber']));
    renderApp('/');
    expect(attr()).toBe('dark');
  });
});

describe('botão do cabeçalho (TB-05) e persistência (TB-03)', () => {
  it('a partir de um tema extra, o botão volta ao escuro', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await run(user, 'tema solarized');
    expect(attr()).toBe('solarized');
    await user.click(screen.getByRole('button', { name: /Modo escuro/ }));
    expect(attr()).toBe(DEFAULT_THEME);
    await user.click(screen.getByRole('button', { name: /Modo claro/ }));
    expect(attr()).toBe('light');
  });

  it('um valor salvo desconhecido cai no tema padrão', () => {
    document.documentElement.setAttribute('data-theme', 'rosa');
    renderApp('/');
    expect(attr()).toBe('dark');
  });
});
