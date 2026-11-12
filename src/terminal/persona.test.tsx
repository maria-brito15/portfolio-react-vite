import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { PERSONA_ASKED_KEY, PERSONA_KEY } from '../hooks/usePersona';
import { commandCatalog } from './catalog';
import { complete, findCommand } from './commands';

const terminalInput = () => screen.getByRole('textbox', { name: 'Linha de comando do terminal' });
const log = () => document.querySelector<HTMLElement>('.term-log')!;
const question = () => screen.queryByRole('region', { name: 'Escolha de visitante' });

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(terminalInput(), `${line}{Enter}`);
}

// Primeira visita: nada respondido nem pulado.
beforeEach(() => {
  sessionStorage.clear();
  localStorage.removeItem(PERSONA_ASKED_KEY);
});

describe('pergunta de persona no terminal (PR-02, PR-03, PR-04)', () => {
  it('na 1ª visita mostra as cinco opções e a dica de pular', () => {
    renderApp();

    expect(question()).toBeInTheDocument();
    expect(screen.getByText(/Digite o número ou o nome, ou Enter para pular/)).toBeInTheDocument();
    expect(question()!.querySelectorAll('.t-run')).toHaveLength(5);
  });

  it('Enter vazio pula: a pergunta some, não grava persona e não volta', async () => {
    const user = userEvent.setup();
    const first = renderApp();

    await user.type(terminalInput(), '{Enter}');
    expect(question()).toBeNull();
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
    expect(localStorage.getItem(PERSONA_ASKED_KEY)).toBe('1');

    first.unmount();
    sessionStorage.clear();
    renderApp();
    expect(question()).toBeNull();
  });

  it('número escolhe a persona e sugere comandos', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, '2');

    expect(localStorage.getItem(PERSONA_KEY)).toBe('tech');
    expect(log()).toHaveTextContent('vendo como Recrutador(a) técnico(a)');
    expect(log().querySelectorAll('.t-run').length).toBeGreaterThan(0);
    expect(question()).toBeNull();
  });

  it('o nome ou apelido sozinho também escolhe', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'professora');

    expect(localStorage.getItem(PERSONA_KEY)).toBe('professor');
  });

  it('clicar numa opção escolhe a persona', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.click(screen.getByRole('button', { name: /5\) Cliente/ }));

    expect(localStorage.getItem(PERSONA_KEY)).toBe('cliente');
  });

  it('qualquer outro comando dispensa a pergunta sem escolher persona', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'ajuda');

    expect(question()).toBeNull();
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
    expect(localStorage.getItem(PERSONA_ASKED_KEY)).toBe('1');
  });

  it('depois de dispensada, número sozinho volta a ser seção da última página', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'curriculo');
    await run(user, '2');

    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
    expect(log()).not.toHaveTextContent('vendo como');
  });

  it('número sem página aberta e sem pergunta pendente continua dando o aviso de sempre', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_ASKED_KEY, '1');
    renderApp();
    await run(user, '3');

    expect(log()).toHaveTextContent('nenhum índice aberto');
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
  });
});

describe('comando visitante (PR-06)', () => {
  beforeEach(() => localStorage.setItem(PERSONA_ASKED_KEY, '1'));

  it('existe em PT, EN e como "persona", sem tomar o lugar de whoami (sobre)', () => {
    expect(findCommand('visitante')?.names).toEqual(['visitante', 'visitor']);
    expect(findCommand('visitor')).toBe(findCommand('visitante'));
    expect(findCommand('persona')).toBe(findCommand('visitante'));
    expect(findCommand('whoami')?.names[0]).toBe('sobre');
  });

  it('aparece no autocompletar, na ajuda e no catálogo', async () => {
    const user = userEvent.setup();

    expect(complete('visi', 'pt')).toBe('visitante ');
    expect(complete('visi', 'en')).toBe('visitor ');
    expect(commandCatalog().some((c) => c.id === 'visitante')).toBe(true);

    renderApp();
    await run(user, 'ajuda');
    expect(log()).toHaveTextContent(/visitante/);
  });

  it('sem argumento mostra a atual e as opções; com argumento troca; "limpar" remove', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'visitante');
    expect(log()).toHaveTextContent('nenhuma escolha feita');
    expect(log().querySelectorAll('.t-persona .t-run')).toHaveLength(5);

    await run(user, 'visitante rh');
    expect(localStorage.getItem(PERSONA_KEY)).toBe('rh');

    await run(user, 'visitante');
    expect(log()).toHaveTextContent('visitante: Recrutador(a) / RH');

    await run(user, 'visitante limpar');
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
    expect(log()).toHaveTextContent('escolha removida');
  });

  it('opção inexistente reensina as opções, sem erro quebrado', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'visitante xyz');

    expect(log()).toHaveTextContent('visitante "xyz" não existe');
    expect(log().querySelectorAll('.t-persona .t-run')).toHaveLength(5);
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
  });
});
