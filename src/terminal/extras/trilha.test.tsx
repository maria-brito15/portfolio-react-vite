import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { PERSONA_KEY } from '../../hooks/usePersona';
import { TRAIL_KEY, resetTrailMemory } from '../../trails/storage';
import { commandCatalog } from '../catalog';
import { complete, findCommand } from '../commands';

const log = () => document.querySelector<HTMLElement>('.term-log')!;
// No terminal a linha tem um nome; nas outras páginas (o tour navega) é a barra de comandos.
const input = () =>
  screen.queryByRole('textbox', { name: 'Linha de comando do terminal' }) ??
  screen.getByRole('textbox', { name: 'Barra de comandos do site' });
const saved = () => JSON.parse(localStorage.getItem(TRAIL_KEY) ?? 'null');

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(input(), `${line}{Enter}`);
}

beforeEach(() => {
  sessionStorage.clear();
  resetTrailMemory();
});

describe('comando trilha (TR-09)', () => {
  it('existe em PT e EN, aparece no Tab, na ajuda e no catálogo', async () => {
    const user = userEvent.setup();

    expect(findCommand('trilha')?.names).toEqual(['trilha', 'trail']);
    expect(findCommand('trail')).toBe(findCommand('trilha'));
    expect(complete('tri', 'pt')).toBe('trilha ');
    expect(complete('tra', 'en')).toBe('trail ');
    expect(commandCatalog().some((c) => c.id === 'trilha')).toBe(true);

    renderApp();
    await run(user, 'ajuda');
    expect(log()).toHaveTextContent(/trilha/);
  });

  it('sem persona explica como escolher', async () => {
    const user = userEvent.setup();

    renderApp();
    await run(user, 'trilha');

    expect(log()).toHaveTextContent(
      'Escolha quem está visitando com visitante e a trilha aparece.',
    );
    expect(log().querySelector('.t-cmd')).toHaveTextContent('visitante');
    await run(user, 'trilha iniciar');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();
  });

  it('sem argumento mostra a trilha, o título e como começar, sem abrir o tour', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'tech');
    renderApp();
    await run(user, 'trilha');

    expect(log()).toHaveTextContent('Tour do código');
    expect(log()).toHaveTextContent('5 passos');
    expect(log()).toHaveTextContent('trilha iniciar · continuar · reiniciar · sair');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('`trilha iniciar` abre o tour, e o botão do estado faz o mesmo', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp();
    await run(user, 'trilha iniciar');

    expect(log()).toHaveTextContent('trilha aberta: Resumo em 60 segundos');
    expect(await screen.findByRole('dialog')).toHaveTextContent('1 de 5');
    await waitFor(() => expect(window.location.pathname).toBe('/curriculo'));
  });

  it('`trilha sair` fecha o tour e mantém o passo; `continuar` retoma de onde parou', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp();
    await run(user, 'trilha iniciar');
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await user.click(screen.getByRole('button', { name: 'Próximo' }));

    await run(user, 'trilha sair');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(saved().trails.rh.step).toBe(2);

    await run(user, 'trilha continuar');
    expect(await screen.findByRole('dialog')).toHaveTextContent('3 de 5');
  });

  it('sair sem tour aberto avisa; reiniciar volta ao primeiro passo', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    localStorage.setItem(
      TRAIL_KEY,
      JSON.stringify({ trails: { rh: { step: 3, done: ['resumo'] } }, secrets: [] }),
    );
    renderApp();

    await run(user, 'trilha sair');
    expect(log()).toHaveTextContent('nenhuma trilha aberta.');

    await run(user, 'trilha reiniciar');
    expect(await screen.findByRole('dialog')).toHaveTextContent('1 de 5');
    expect(saved().trails.rh.step).toBe(0);
    // o passo 1 ("ver") se conclui ao chegar; nenhum dos outros foi feito
    expect(saved().trails.rh.done).toEqual(['resumo']);
  });

  it('mostra o passo atual quando há progresso', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    localStorage.setItem(
      TRAIL_KEY,
      JSON.stringify({ trails: { rh: { step: 1, done: ['resumo'] } }, secrets: [] }),
    );
    renderApp();
    await run(user, 'trilha');

    expect(log()).toHaveTextContent('Você viu 1 de 5');
    expect(log()).toHaveTextContent('passo 2 de 5: Aqui estão as competências técnicas');
  });

  it('traz de volta o cartão dispensado na home (TR-08)', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    localStorage.setItem(
      TRAIL_KEY,
      JSON.stringify({ trails: { rh: { step: 0, done: [], dismissed: true } }, secrets: [] }),
    );
    renderApp();

    await run(user, 'trilha iniciar');
    await screen.findByRole('dialog');
    expect(saved().trails.rh.dismissed).toBe(false);
  });

  it('em inglês, tudo vem em inglês', async () => {
    const user = userEvent.setup();

    localStorage.setItem('portfolio-lang', 'en');
    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp();
    await user.type(
      screen.getByRole('textbox', { name: /terminal command line/i }),
      'trail{Enter}',
    );

    expect(log()).toHaveTextContent('60-second summary');
    expect(log()).toHaveTextContent('5 steps');
    expect(log()).toHaveTextContent('trail start · resume · restart · exit');
  });

  it('o histórico restaurado não abre o tour sozinho (replay)', () => {
    localStorage.setItem(PERSONA_KEY, 'rh');
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['trilha iniciar']));
    renderApp();

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();
  });
});
