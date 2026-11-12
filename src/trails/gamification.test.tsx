import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { secrets } from '../data/trails';
import { emitTrailEvent } from './events';
import { TRAIL_KEY, resetTrailMemory } from './storage';

const card = () => document.querySelector<HTMLElement>('.trail-card')!;
const progress = (persona: string, done: string[], secretsFound: string[] = []) => {
  localStorage.setItem(PERSONA_KEY, persona);
  localStorage.setItem(
    TRAIL_KEY,
    JSON.stringify({
      trails: { [persona]: { step: done.length, done, finished: false } },
      secrets: secretsFound,
    }),
  );
};

beforeEach(() => resetTrailMemory());

describe('gamificação graduada por persona (TR-19)', () => {
  it('rh e tech: só o checklist "você viu N de M", sem barra, pontos nem conquistas', () => {
    for (const [persona, done, total] of [
      ['rh', ['resumo', 'competencias'], 5],
      ['tech', ['projetos', 'ecoshop'], 5],
    ] as const) {
      localStorage.clear();
      resetTrailMemory();
      progress(persona, [...done], ['fortune', 'matrix']);

      const { unmount } = renderApp('/');

      expect(card(), persona).toHaveTextContent(`Você viu 2 de ${total}`);
      expect(card().querySelector('progress'), persona).toBeNull();
      expect(card().querySelector('.trail-secrets'), persona).toBeNull();
      expect(card()).not.toHaveTextContent(/Segredos|ponto|nível/i);
      unmount();
    }
  });

  it('professor e cliente: barra de progresso, sem conquistas', () => {
    for (const [persona, done, total] of [
      ['professor', ['linha-do-tempo', 'formacao'], 5],
      ['cliente', ['servicos'], 4],
    ] as const) {
      localStorage.clear();
      resetTrailMemory();
      progress(persona, [...done], ['fortune']);

      const { unmount } = renderApp('/');
      const bar = card().querySelector('progress') as HTMLProgressElement;

      expect(bar, persona).not.toBeNull();
      expect(bar.value).toBe(done.length);
      expect(bar.max).toBe(total);
      expect(bar).toHaveAccessibleName(`Você viu ${done.length} de ${total}`);
      expect(card().querySelector('.trail-secrets'), persona).toBeNull();
      unmount();
    }
  });

  it('amigo: conquistas e contador de segredos; os não achados aparecem como "?"', () => {
    progress('amigo', [], ['fortune', 'tema']);
    renderApp('/');

    const list = within(card()).getByRole('list', { name: `Segredos: 2 de ${secrets.length}` });

    expect(card()).toHaveTextContent(`Segredos: 2 de ${secrets.length}`);
    expect(within(list).getAllByRole('listitem')).toHaveLength(secrets.length);
    expect(list).toHaveTextContent('✓ fortune');
    expect(list).toHaveTextContent('✓ tema');
    expect(list).not.toHaveTextContent('matrix');
    expect(list.querySelectorAll('li:not([data-found])')).toHaveLength(secrets.length - 2);
    expect(card().querySelector('progress')).toBeNull();
  });

  it('sem progresso, rh/tech/professor/cliente não mostram contador nenhum', () => {
    for (const persona of ['rh', 'tech', 'professor', 'cliente']) {
      localStorage.clear();
      resetTrailMemory();
      localStorage.setItem(PERSONA_KEY, persona);

      const { unmount } = renderApp('/');

      expect(
        card().querySelector('.trail-progress, .trail-bar, .trail-secrets'),
        persona,
      ).toBeNull();
      unmount();
    }
  });

  it('o tour mostra o mesmo progresso, só o contador de segredos para o amigo', async () => {
    const user = userEvent.setup();

    progress('amigo', [], ['fortune']);
    renderApp('/');
    await user.click(within(card()).getByRole('button', { name: /Começar|Continuar/ }));

    const dialog = await screen.findByRole('dialog');

    expect(dialog).toHaveTextContent(`Segredos: 1 de ${secrets.length}`);
    expect(dialog.querySelector('.trail-secrets ul')).toBeNull();
  });
});

describe('segredo encontrado (TR-20)', () => {
  const toast = () => document.querySelector('.secret-toast-slot') as HTMLElement;

  it('o amigo recebe um aviso discreto, em região aria-live, com o contador', async () => {
    localStorage.setItem(PERSONA_KEY, 'amigo');
    renderApp('/');

    expect(toast()).toHaveAttribute('aria-live', 'polite');
    expect(toast()).toHaveAttribute('role', 'status');
    expect(toast()).toBeEmptyDOMElement();

    act(() => emitTrailEvent({ type: 'command', name: 'fortune' }));
    expect(
      await within(toast()).findByText(`Segredo encontrado: fortune (1 de ${secrets.length})`),
    ).toBeInTheDocument();

    act(() => emitTrailEvent({ type: 'theme' }));
    expect(
      await within(toast()).findByText(`Segredo encontrado: tema (2 de ${secrets.length})`),
    ).toBeInTheDocument();
  });

  it('segredo repetido não avisa de novo, e a carga inicial não avisa', async () => {
    progress('amigo', [], ['fortune']);
    renderApp('/');
    expect(toast()).toBeEmptyDOMElement();

    act(() => emitTrailEvent({ type: 'command', name: 'fortune' }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(toast()).toBeEmptyDOMElement();
  });

  it('as outras personas não têm nem a região de aviso, e nada é anunciado', async () => {
    localStorage.setItem(PERSONA_KEY, 'rh');
    renderApp('/');

    act(() => emitTrailEvent({ type: 'command', name: 'fortune' }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(document.querySelector('.secret-toast-slot')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('rodar o comando no terminal desbloqueia e avisa, e o aviso some sozinho', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'amigo');
    renderApp();
    await user.type(
      screen.getByRole('textbox', { name: 'Linha de comando do terminal' }),
      'cowsay oi{Enter}',
    );

    expect(await within(toast()).findByText(/Segredo encontrado: cowsay/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(TRAIL_KEY) as string).secrets).toEqual(['cowsay']);
    await waitFor(() => expect(toast()).toBeEmptyDOMElement(), { timeout: 6000 });
  }, 15000);

  it('em inglês, o aviso e o contador vêm em inglês', async () => {
    localStorage.setItem('portfolio-lang', 'en');
    localStorage.setItem(PERSONA_KEY, 'amigo');
    renderApp('/');

    expect(card()).toHaveTextContent(`Secrets: 0 of ${secrets.length}`);
    act(() => emitTrailEvent({ type: 'command', name: 'matrix' }));
    expect(
      await within(toast()).findByText(`Secret found: matrix (1 of ${secrets.length})`),
    ).toBeInTheDocument();
  });
});
