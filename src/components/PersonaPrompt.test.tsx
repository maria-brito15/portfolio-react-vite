import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { PERSONA_ASKED_KEY, PERSONA_KEY } from '../hooks/usePersona';

const ask = () => screen.queryByRole('region', { name: /Quem está visitando/ });

beforeEach(() => localStorage.removeItem(PERSONA_ASKED_KEY));

describe('faixa de persona na home (PR-02, PR-03, PR-11, PR-15)', () => {
  it('na 1ª visita pergunta, com as cinco opções e "pular"', () => {
    renderApp('/');

    const bar = ask()!;

    expect(bar).toBeInTheDocument();
    expect(within(bar).getAllByRole('button')).toHaveLength(6);
    expect(within(bar).getByRole('button', { name: 'pular' })).toBeInTheDocument();
  });

  it('pular some com a pergunta, sem persona, e não volta', async () => {
    const user = userEvent.setup();
    const first = renderApp('/');

    await user.click(screen.getByRole('button', { name: 'pular' }));
    expect(ask()).toBeNull();
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();

    first.unmount();
    renderApp('/');
    expect(ask()).toBeNull();
    expect(screen.getByRole('button', { name: 'Escolher visitante' })).toBeInTheDocument();
  });

  it('escolher grava, mostra a persona atual e o chamado para ação dela', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Recrutador(a) / RH' }));

    expect(localStorage.getItem(PERSONA_KEY)).toBe('rh');

    const slot = document.querySelector<HTMLElement>('.persona-slot')!;

    expect(slot).toHaveAttribute('aria-live', 'polite');
    expect(slot).toHaveTextContent('Vendo como: Recrutador(a) / RH');
    expect(within(slot).getByRole('link', { name: 'Ver o currículo' })).toHaveAttribute(
      'href',
      '/curriculo',
    );
  });

  it('trocar abre as opções, e remover volta ao padrão', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_ASKED_KEY, '1');
    localStorage.setItem(PERSONA_KEY, 'tech');
    renderApp('/');

    await user.click(screen.getByRole('button', { name: 'trocar' }));
    await user.click(screen.getByRole('button', { name: 'Cliente' }));
    expect(localStorage.getItem(PERSONA_KEY)).toBe('cliente');

    await user.click(screen.getByRole('button', { name: 'remover' }));
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
    expect(screen.getByRole('button', { name: 'Escolher visitante' })).toBeInTheDocument();
  });

  it('/r/tech não pergunta e já mostra a persona do link', async () => {
    renderApp('/r/tech');

    expect(ask()).toBeNull();
    expect(
      await screen.findByText('Recrutador(a) técnico(a) / engenheiro(a)', { selector: 'strong' }),
    ).toBeInTheDocument();
  });
});

describe('idioma (PR-13)', () => {
  it('trocar o idioma troca os textos da persona sem perder a escolha', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_ASKED_KEY, '1');
    localStorage.setItem(PERSONA_KEY, 'cliente');
    renderApp('/');

    expect(document.querySelector('.persona-slot')).toHaveTextContent('Vendo como: Cliente');
    await user.click(screen.getByRole('button', { name: /EN|English/ }));
    expect(document.querySelector('.persona-slot')).toHaveTextContent('Viewing as: Client');
    expect(screen.getByRole('link', { name: 'See the services' })).toBeInTheDocument();
    expect(localStorage.getItem(PERSONA_KEY)).toBe('cliente');
  });
});
