import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { TRAIL_KEY, resetTrailMemory } from './storage';

const card = () => screen.queryByRole('region', { name: 'Resumo em 60 segundos' });
const saved = () => JSON.parse(localStorage.getItem(TRAIL_KEY) ?? 'null');

beforeEach(() => resetTrailMemory());

describe('cartão da trilha na home (TR-06, TR-07, TR-08)', () => {
  it('sem persona não há cartão', () => {
    renderApp('/');

    expect(document.querySelector('.trail-card')).toBeNull();
  });

  it('com persona mostra título, número de passos, introdução e "Começar"', () => {
    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp('/');

    const section = card()!;

    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('5 passos');
    expect(section).toHaveTextContent(
      'Em cinco paradas, o que importa para avaliar uma candidatura',
    );
    expect(within(section).getByRole('button', { name: 'Começar' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('cada persona vê a sua trilha, e trocar a persona troca o cartão', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'trocar' }));
    await user.click(screen.getByRole('button', { name: 'Cliente' }));

    expect(screen.getByRole('region', { name: 'Do problema à entrega' })).toHaveTextContent(
      '4 passos',
    );
    expect(card()).toBeNull();
  });

  it('/r/tech convida com a trilha dela, sem iniciar o tour sozinho', async () => {
    renderApp('/r/tech');

    expect(await screen.findByRole('region', { name: 'Tour do código' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(saved()).toBeNull();
  });

  it('"Começar" abre o tour no primeiro passo, na página real, com o alvo destacado', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Começar' }));

    const dialog = await screen.findByRole('dialog');

    expect(dialog).toHaveTextContent('1 de 5');
    await waitFor(() => expect(window.location.pathname).toBe('/curriculo'));
    await waitFor(() => expect(document.querySelector('.tour-ring')).not.toBeNull());
    expect(document.getElementById('resumo')).not.toBeNull();
  });

  it('com progresso mostra "Continuar (x de n)"', () => {
    localStorage.setItem(PERSONA_KEY, 'rh');
    localStorage.setItem(
      TRAIL_KEY,
      JSON.stringify({
        trails: { rh: { step: 2, done: ['resumo', 'competencias'], finished: false } },
        secrets: [],
      }),
    );
    renderApp('/');

    expect(within(card()!).getByRole('button', { name: 'Continuar (2 de 5)' })).toBeInTheDocument();
  });

  it('concluída mostra o selo e "Refazer", que recomeça do zero', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');
    localStorage.setItem(
      TRAIL_KEY,
      JSON.stringify({
        trails: { rh: { step: 4, done: ['resumo'], finished: true } },
        secrets: [],
      }),
    );
    renderApp('/');

    expect(card()).toHaveTextContent('Trilha concluída');
    // a mensagem final aprovada substitui a introdução
    expect(card()).toHaveTextContent('Pronto. Se quiser conversar, o contato está a um clique.');
    expect(card()).not.toHaveTextContent('Em cinco paradas');
    await user.click(within(card()!).getByRole('button', { name: 'Refazer' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('1 de 5');
    expect(saved().trails.rh.finished).toBe(false);
  });

  it('"Agora não" esconde o cartão e fica lembrado', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'rh');

    const first = renderApp('/');

    await user.click(within(card()!).getByRole('button', { name: 'Agora não' }));
    expect(card()).toBeNull();
    expect(saved().trails.rh.dismissed).toBe(true);

    first.unmount();
    resetTrailMemory();
    renderApp('/');
    expect(card()).toBeNull();
  });

  it('em inglês, o cartão vem em inglês', () => {
    localStorage.setItem('portfolio-lang', 'en');
    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp('/');

    const section = screen.getByRole('region', { name: '60-second summary' });

    expect(section).toHaveTextContent('5 steps');
    expect(within(section).getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: 'Not now' })).toBeInTheDocument();
  });

  it('para robôs de busca o cartão não aparece (TR-26)', () => {
    const agent = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Googlebot/2.1');

    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp('/');
    expect(document.querySelector('.trail-card')).toBeNull();
    agent.mockRestore();
  });
});

describe('mensagem final (TR-21)', () => {
  it('o amigo vê quantos segredos achou na mensagem final', () => {
    localStorage.setItem(PERSONA_KEY, 'amigo');
    localStorage.setItem(
      TRAIL_KEY,
      JSON.stringify({
        trails: { amigo: { step: 4, done: ['sobre'], finished: true } },
        secrets: ['fortune', 'matrix', 'tema'],
      }),
    );
    renderApp('/');

    const section = screen.getByRole('region', { name: 'Caça aos segredos' });

    expect(section).toHaveTextContent('Você achou 3 de 8 segredos. Ainda dá para achar mais.');
    expect(section).toHaveTextContent('Trilha concluída');
  });
});
