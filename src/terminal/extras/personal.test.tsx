import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { findDirectory, routeById, terminalUrl } from '../../data/routes';
import { commandCatalog } from '../catalog';
import { complete, findCommand } from '../commands';

const input = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
const log = () => document.querySelector<HTMLElement>('.term-log')!;

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(input(), `${line}{Enter}`);
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.removeItem('portfolio-lang');
});

describe('comando pessoal: inventário, Tab, ajuda e catálogo (CL-05)', () => {
  it('existe em PT e EN e é o mesmo comando', () => {
    expect(findCommand('pessoal')).toBeDefined();
    expect(findCommand('personal')).toBe(findCommand('pessoal'));
    expect(findCommand('Pessoal')).toBe(findCommand('personal'));
  });

  it('descrição e uso nos dois idiomas', () => {
    const cmd = findCommand('pessoal')!;

    for (const text of [cmd.desc, cmd.usage]) {
      expect(text!.pt.trim()).not.toBe('');
      expect(text!.en.trim()).not.toBe('');
    }
    expect(cmd.hidden).toBeFalsy();
  });

  it('o Tab completa o nome do comando', () => {
    expect(complete('pess', 'pt')).toBe('pessoal ');
    expect(complete('perso', 'en')).toBe('personal ');
  });

  it('o Tab completa a seção, em PT e EN, e lista as opções', () => {
    expect(complete('pessoal li', 'pt')).toBe('pessoal livros');
    expect(complete('pessoal fil', 'pt')).toBe('pessoal filmes');
    expect(complete('pessoal mu', 'pt')).toBe('pessoal musica');
    expect(complete('personal th', 'en')).toBe('personal theater');
    expect(complete('personal bo', 'en')).toBe('personal books');
    expect(complete('pessoal ', 'pt')).toEqual(['livros', 'filmes', 'musica', 'teatro']);
    expect(complete('personal ', 'en')).toEqual(['books', 'films', 'music', 'theater']);
  });

  it('aceita o nome da outra língua e não completa o que não existe', () => {
    expect(complete('pessoal bo', 'pt')).toBe('pessoal books');
    expect(complete('pessoal zz', 'pt')).toBe('pessoal zz');
  });

  it('depois de uma seção já completa, o Tab não inventa argumento', () => {
    expect(complete('pessoal livros ', 'pt')).toBe('pessoal livros ');
  });

  it('aparece no catálogo, na categoria de páginas', () => {
    const entry = commandCatalog().find((c) => c.id === 'pessoal');

    expect(entry?.category).toBe('pages');
    expect(entry?.names).toEqual(expect.arrayContaining(['pessoal', 'personal']));
    expect(entry?.needsArg).toBe(false);
  });

  it('a página é um diretório: cd pessoal / cd personal', () => {
    expect(findDirectory('pessoal')?.id).toBe('pessoal');
    expect(findDirectory('personal')?.id).toBe('pessoal');
    expect(findDirectory('~/personal/')?.id).toBe('pessoal');
  });

  it('"ver no terminal" das páginas leva ao comando certo', () => {
    expect(terminalUrl(routeById('pessoal')!)).toBe('/terminal?cmd=pessoal');
    expect(terminalUrl(routeById('pessoal-livros')!)).toBe('/terminal?cmd=pessoal%20livros');
    expect(terminalUrl(routeById('pessoal-teatro')!)).toBe('/terminal?cmd=pessoal%20teatro');
  });
});

describe('saída do terminal (CL-05)', () => {
  it('a ajuda lista o comando', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ajuda');

    expect(log()).toHaveTextContent('pessoal');
    expect(log()).toHaveTextContent('livros, filmes, música e teatro');
  });

  it('sem argumento: as quatro seções como atalhos, e o par ver/abrir página', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'pessoal');

    expect(log()).toHaveTextContent('escolha uma seção');

    const buttons = [...log().querySelectorAll('.t-index-list .t-run')].map((b) => b.textContent);

    expect(buttons).toHaveLength(4);
    expect(buttons[0]).toMatch(/\[1\].*livros/);
    expect(buttons[3]).toMatch(/\[4\].*teatro/);
    expect(log().querySelector('.t-actions')).not.toBeNull();
  });

  it('clicar numa seção roda o comando dela', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'pessoal');
    await user.click(screen.getAllByRole('button', { name: /livros/ })[0]);

    expect(await screen.findByText(/Livro de exemplo 1/)).toBeInTheDocument();
  });

  it.each([
    ['livros', 'Livro de exemplo 1'],
    ['filmes', 'Filme de exemplo 1'],
    ['musica', 'Disco de exemplo 1'],
    ['teatro', 'Peça de exemplo 1'],
  ])(
    'pessoal %s mostra as primeiras linhas, com o selo de dados fictícios',
    async (section, text) => {
      const user = userEvent.setup();

      renderApp();
      await run(user, `pessoal ${section}`);

      expect(await screen.findByText(new RegExp(text))).toBeInTheDocument();
      expect(log()).toHaveTextContent('DADOS FICTÍCIOS');
      expect(log()).toHaveTextContent(/mostrando \d+ de \d+/);
      expect(log().querySelector('.t-actions')).not.toBeNull();
    },
  );

  it('o número de linhas é limitado e diz quantas há no total', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'pessoal teatro');

    // 5 peças no mock: cabem todas
    await screen.findByText(/Peça de exemplo 1/);
    expect(log()).toHaveTextContent('mostrando 5 de 5');
  });

  it('em inglês: nome do comando, seções e textos no idioma', async () => {
    localStorage.setItem('portfolio-lang', 'en');

    const user = userEvent.setup();

    renderApp();
    await run(user, 'personal films');

    expect(await screen.findByText(/Filme de exemplo 1/)).toBeInTheDocument();
    expect(log()).toHaveTextContent(/showing \d+ of \d+/);
    expect(log()).toHaveTextContent('PLACEHOLDER DATA');
  });

  it('aceita o nome da seção na outra língua e sem acento', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'pessoal MUSIC');

    expect(await screen.findByText(/Disco de exemplo 1/)).toBeInTheDocument();
  });

  it('seção desconhecida: diz o que não existe e reimprime as seções (erro que reensina)', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'pessoal xyz');

    expect(log()).toHaveTextContent('seção "xyz" não existe');
    expect(log().querySelectorAll('.t-index-list .t-run')).toHaveLength(4);
  });

  it('argumento a mais também é erro, sem exceção', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'pessoal livros extra');

    expect(log()).toHaveTextContent('não existe');
    expect(log().querySelectorAll('.t-index-list .t-run')).toHaveLength(4);
  });

  it('a URL /terminal?cmd=pessoal livros executa o comando (ver no terminal)', async () => {
    renderApp('/terminal?cmd=pessoal%20livros');

    expect(await screen.findByText(/Livro de exemplo 1/)).toBeInTheDocument();
  });
});
