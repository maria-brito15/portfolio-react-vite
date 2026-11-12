import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY, PersonaProvider, usePersona } from '../hooks/usePersona';
import { emitTrailEvent } from './events';
import { TRAIL_KEY, resetTrailMemory } from './storage';
import { TrailProvider, useTrail } from './TrailProvider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <PersonaProvider>
    <TrailProvider>{children}</TrailProvider>
  </PersonaProvider>
);

const useBoth = () => ({ trail: useTrail(), persona: usePersona() });
const saved = () => JSON.parse(localStorage.getItem(TRAIL_KEY) ?? 'null');

const setup = (persona?: string) => {
  if (persona) localStorage.setItem(PERSONA_KEY, persona);

  return renderHook(useBoth, { wrapper });
};

beforeEach(() => resetTrailMemory());

describe('estado das trilhas (TR-10, TR-18)', () => {
  it('sem persona não há trilha e nada acontece', () => {
    const { result } = setup();

    expect(result.current.trail.trail).toBeUndefined();
    act(() => result.current.trail.start());
    expect(result.current.trail.active).toBe(false);
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();
  });

  it('um visitante que não usa trilhas não escreve nada no navegador', () => {
    setup('rh');
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();
  });

  it('começar abre o tour no passo 0; sair guarda o passo; começar de novo retoma', () => {
    const { result } = setup('rh');

    act(() => result.current.trail.start());
    expect(result.current.trail.active).toBe(true);
    expect(result.current.trail.index).toBe(0);
    expect(result.current.trail.steps).toHaveLength(5);

    act(() => result.current.trail.next());
    act(() => result.current.trail.next());
    expect(result.current.trail.index).toBe(2);

    act(() => result.current.trail.exit());
    expect(result.current.trail.active).toBe(false);
    expect(result.current.trail.index).toBe(2);
    expect(saved().trails.rh.step).toBe(2);

    act(() => result.current.trail.start());
    expect(result.current.trail.index).toBe(2);
  });

  it('anterior para no primeiro passo; próximo no último conclui e fecha', () => {
    const { result } = setup('cliente');

    act(() => result.current.trail.start());
    act(() => result.current.trail.prev());
    expect(result.current.trail.index).toBe(0);

    for (let i = 0; i < 3; i++) act(() => result.current.trail.next());
    expect(result.current.trail.index).toBe(3);
    expect(result.current.trail.progress.finished).toBe(false);

    act(() => result.current.trail.next());
    expect(result.current.trail.progress.finished).toBe(true);
    expect(result.current.trail.active).toBe(false);
  });

  it('trilha concluída recomeça do zero ao começar; reiniciar zera tudo', () => {
    const { result } = setup('cliente');

    act(() => result.current.trail.start());
    for (let i = 0; i < 4; i++) act(() => result.current.trail.next());
    expect(result.current.trail.progress.finished).toBe(true);

    act(() => result.current.trail.start());
    expect(result.current.trail.progress.finished).toBe(false);
    expect(result.current.trail.index).toBe(0);

    act(() => result.current.trail.markDone('servicos'));
    act(() => result.current.trail.next());
    act(() => result.current.trail.restart());
    expect(result.current.trail.index).toBe(0);
    expect(result.current.trail.doneCount).toBe(0);
    expect(result.current.trail.active).toBe(true);
  });

  it('marcar um passo como feito conta uma vez só', () => {
    const { result } = setup('rh');

    act(() => result.current.trail.markDone('resumo'));
    act(() => result.current.trail.markDone('resumo'));
    act(() => result.current.trail.markDone('competencias'));

    expect(result.current.trail.doneCount).toBe(2);
    expect(saved().trails.rh.done).toEqual(['resumo', 'competencias']);
  });

  it('cada persona tem o seu progresso; trocar e voltar retoma', () => {
    const { result } = setup('rh');

    act(() => result.current.trail.start());
    act(() => result.current.trail.next());
    act(() => result.current.trail.exit());

    act(() => result.current.persona.choose('tech'));
    expect(result.current.trail.trail?.persona).toBe('tech');
    expect(result.current.trail.index).toBe(0);

    act(() => result.current.persona.choose('rh'));
    expect(result.current.trail.index).toBe(1);
  });

  it('"agora não" esconde o cartão e começar o traz de volta', () => {
    const { result } = setup('rh');

    act(() => result.current.trail.dismiss());
    expect(result.current.trail.progress.dismissed).toBe(true);

    act(() => result.current.trail.undismiss());
    expect(result.current.trail.progress.dismissed).toBe(false);

    act(() => result.current.trail.dismiss());
    act(() => result.current.trail.start());
    expect(result.current.trail.progress.dismissed).toBe(false);
  });

  it('o progresso sobrevive a uma nova visita e dado estragado é ignorado', () => {
    localStorage.setItem(PERSONA_KEY, 'rh');

    const first = renderHook(useBoth, { wrapper });

    act(() => first.result.current.trail.start());
    act(() => first.result.current.trail.next());
    first.unmount();
    expect(renderHook(useBoth, { wrapper }).result.current.trail.index).toBe(1);

    localStorage.setItem(TRAIL_KEY, '{"trails":{"rh":{"step":-5,"done":[1,2]}},"secrets":"x"}');
    resetTrailMemory();

    const broken = renderHook(useBoth, { wrapper });

    expect(broken.result.current.trail.index).toBe(0);
    expect(broken.result.current.trail.found).toEqual([]);
  });

  it('com o armazenamento bloqueado, funciona na sessão', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const { result } = setup();

    act(() => result.current.persona.choose('rh'));
    act(() => result.current.trail.start());
    act(() => result.current.trail.next());
    expect(result.current.trail.index).toBe(1);

    setItem.mockRestore();
  });
});

describe('conclusão dos passos por evento (TR-14 a TR-17)', () => {
  const goTo = (result: { current: ReturnType<typeof useBoth> }, index: number) => {
    act(() => result.current.trail.start());
    for (let i = 0; i < index; i++) act(() => result.current.trail.next());
  };

  it('"fazer": conclui quando o comando do passo roda, e só ele', () => {
    const { result } = setup('tech');

    goTo(result, 3); // stats
    expect(result.current.trail.step?.id).toBe('stats');

    act(() => emitTrailEvent({ type: 'command', name: 'fortune' }));
    expect(result.current.trail.doneCount).toBe(0);

    act(() => emitTrailEvent({ type: 'command', name: 'stats' }));
    expect(result.current.trail.doneCount).toBe(1);
  });

  it('com o tour fechado, o comando não conclui passo nenhum', () => {
    const { result } = setup('tech');

    act(() => emitTrailEvent({ type: 'command', name: 'stats' }));
    expect(result.current.trail.doneCount).toBe(0);
  });

  it('"fazer" com argumentos: `minas facil` conclui com qualquer partida de minas', () => {
    const { result } = setup('amigo');

    goTo(result, 2);
    expect(result.current.trail.step?.id).toBe('minas');
    act(() => emitTrailEvent({ type: 'command', name: 'minas' }));
    expect(result.current.trail.doneCount).toBe(1);
  });

  it('"achar": conclui com qualquer segredo, inclusive troca de tema ou idioma', () => {
    for (const event of [
      { type: 'command', name: 'matrix' },
      { type: 'theme' },
      { type: 'lang' },
    ] as const) {
      localStorage.clear();
      resetTrailMemory();

      const { result } = setup('amigo');

      goTo(result, 3);
      expect(result.current.trail.step?.kind).toBe('achar');
      act(() => emitTrailEvent(event));
      expect(result.current.trail.doneCount, JSON.stringify(event)).toBe(1);
    }
  });
});

describe('segredos (TR-20)', () => {
  it('são guardados a cada evento, mesmo sem trilha nem tour, sem repetir', () => {
    const { result } = setup();

    act(() => emitTrailEvent({ type: 'command', name: 'fortune' }));
    act(() => emitTrailEvent({ type: 'command', name: 'fortune' }));
    act(() => emitTrailEvent({ type: 'command', name: 'cowsay' }));
    act(() => emitTrailEvent({ type: 'command', name: 'ajuda' }));
    act(() => emitTrailEvent({ type: 'theme' }));
    act(() => emitTrailEvent({ type: 'lang' }));

    expect(result.current.trail.found).toEqual(['fortune', 'cowsay', 'tema', 'idioma']);
    expect(saved().secrets).toEqual(['fortune', 'cowsay', 'tema', 'idioma']);
  });
});

describe('emissores do site', () => {
  it('rodar um comando no terminal emite o evento; o replay do histórico não', async () => {
    const user = userEvent.setup();
    const first = renderApp();

    await user.type(
      screen.getByRole('textbox', { name: 'Linha de comando do terminal' }),
      'fortune{Enter}',
    );
    expect(saved().secrets).toEqual(['fortune']);
    first.unmount();

    // Recarrega a página com `cowsay` no histórico: o replay não desbloqueia nada.
    localStorage.removeItem(TRAIL_KEY);
    resetTrailMemory();
    sessionStorage.setItem('portfolio-terminal', JSON.stringify(['cowsay']));
    renderApp();
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();
  });

  it('comando que não existe não desbloqueia nada', async () => {
    const user = userEvent.setup();

    renderApp();
    await user.type(
      screen.getByRole('textbox', { name: 'Linha de comando do terminal' }),
      'xyz{Enter}',
    );
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();
  });

  it('trocar o tema e o idioma emite; a carga inicial não', async () => {
    const user = userEvent.setup();

    renderApp('/');
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'light');
    await user.click(screen.getByRole('button', { name: /EN|English/ }));
    expect(saved().secrets).toEqual(['tema', 'idioma']);
  });

  it('fora do provedor o hook é inofensivo', () => {
    render(<span />);

    const { result } = renderHook(() => useTrail());

    expect(result.current.trail).toBeUndefined();
    expect(() => result.current.start()).not.toThrow();
  });
});
