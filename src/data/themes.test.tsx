import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { bootSource, resolveTheme } from '../boot/boot';
import { renderApp } from '../test/helpers';
import { DEFAULT_THEME, findTheme, isTheme, themeName, themes } from './themes';

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
    expect(findTheme('ESCURO')?.id).toBe('dark');
    expect(findTheme('Dark')?.id).toBe('dark');
    expect(findTheme('claro')?.id).toBe('light');
    expect(findTheme('light')?.id).toBe('light');
    expect(findTheme('nada')).toBeUndefined();
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('rosa')).toBe(false);
  });

  it('só existem dois temas, e os três extras antigos não são mais temas (D-002)', () => {
    expect(themes.map((t) => t.id).sort()).toEqual(['dark', 'light']);
    for (const old of ['dracula', 'solarized', 'amber', 'ambar']) {
      expect(isTheme(old), old).toBe(false);
      expect(findTheme(old), old).toBeUndefined();
    }
    expect(DEFAULT_THEME).toBe('light');
  });

  it('o script de boot ignora um tema antigo salvo e aplica um válido', () => {
    const script = bootSource();

    expect(script).toContain('portfolio-theme');
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('portfolio-theme', 'dracula');
    new Function(script)();
    expect(attr()).toBe('light'); // `dracula` ignorado: segue o sistema (jsdom não tem matchMedia: claro)
    localStorage.setItem('portfolio-theme', 'dark');
    new Function(script)();
    expect(attr()).toBe('dark');
  });

  it('o boot conhece exatamente os mesmos ids da tabela de temas (TB-03)', () => {
    for (const { id } of themes) {
      // o sistema pede o outro tema: só a escolha gravada pode produzir o id
      expect(resolveTheme({ stored: id, systemDark: id === 'light' })).toBe(id);
    }
    expect(resolveTheme({ stored: 'rosa', systemDark: false })).toBe('light');
  });

  it('themeName devolve o nome no idioma e lança, sem reserva, para id desconhecido (T7.4)', () => {
    expect(themeName('dark', 'pt')).toBe('escuro');
    expect(themeName('light', 'en')).toBe('light');
    expect(() => themeName('rosa' as never, 'pt')).toThrow('tema desconhecido: rosa');
  });

  it('cada tema declara o esquema de cor certo', () => {
    expect(themes.find((t) => t.id === 'dark')?.scheme).toBe('dark');
    expect(themes.find((t) => t.id === 'light')?.scheme).toBe('light');
  });
});

describe('comando tema (TB-01, TB-02, TB-03)', () => {
  it('sem argumento continua alternando claro/escuro', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'tema');
    expect(attr()).toBe('light');
    await run(user, 'tema');
    expect(attr()).toBe('dark');
  });

  it('tema <nome> aplica e salva, em PT ou EN', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'tema claro');
    expect(attr()).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
    expect(log()).toHaveTextContent('tema: claro');
    await run(user, 'theme dark');
    expect(attr()).toBe('dark');
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');
  });

  it('nome inválido não muda o tema e lista só os dois válidos (erro que reensina)', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'tema rosa');
    expect(attr()).toBe('dark');
    expect(log()).toHaveTextContent('tema: rosa: tema não encontrado');
    for (const t of themes) expect(within(log()).getByText(t.names.pt)).toBeInTheDocument();
    expect(log().querySelectorAll('.t-index-list li')).toHaveLength(2);
    await run(user, 'tema dracula');
    expect(attr()).toBe('dark');
    expect(log()).toHaveTextContent('tema: dracula: tema não encontrado');
  });

  it('tema ls lista com o atual marcado, e cada nome é um botão que aplica', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'tema claro');
    await run(user, 'tema ls');

    const items = [...log().querySelectorAll('.t-index-list li')];

    expect(items).toHaveLength(themes.length);
    expect(items).toHaveLength(2);
    expect(log().querySelector('.t-index-list li:nth-child(2)')).toHaveTextContent(/●\s*claro/);
    expect(log()).toHaveTextContent('atual');
    await user.click(within(log()).getByRole('button', { name: /escuro/ }));
    expect(attr()).toBe('dark');
  });

  it('o replay do histórico não reaplica o tema', () => {
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['tema claro']));
    renderApp();
    expect(attr()).toBe('dark');
  });
});

describe('botão do cabeçalho (TB-05) e persistência (TB-03)', () => {
  it('o seletor do cabeçalho lista os dois temas, reflete o comando tema e aplica a escolha', async () => {
    const user = userEvent.setup();

    renderApp();

    const select = screen.getByRole('combobox', { name: 'Tema' });

    expect([...select.querySelectorAll('option')].map((o) => o.value)).toEqual(
      themes.map((t) => t.id),
    );
    expect(select.querySelectorAll('option')).toHaveLength(2);
    await run(user, 'tema claro');
    expect(attr()).toBe('light');
    expect(select).toHaveValue('light');
    await user.selectOptions(select, 'dark');
    expect(attr()).toBe('dark');
    await user.selectOptions(select, DEFAULT_THEME);
    expect(attr()).toBe(DEFAULT_THEME);
    expect(localStorage.getItem('portfolio-theme')).toBe(DEFAULT_THEME);
  });

  it('um valor desconhecido (inclusive um tema antigo) cai no tema padrão', () => {
    for (const unknown of ['rosa', 'dracula']) {
      document.documentElement.setAttribute('data-theme', unknown);
      renderApp();
      expect(attr()).toBe(DEFAULT_THEME);
    }
  });
});
