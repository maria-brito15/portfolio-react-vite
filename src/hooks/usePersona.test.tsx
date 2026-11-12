import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PERSONA_ASKED_KEY, PERSONA_KEY, PersonaProvider, usePersona } from './usePersona';

const wrapper = ({ children }: { children: ReactNode }) => (
  <PersonaProvider>{children}</PersonaProvider>
);

// A pergunta só aparece quando nada foi respondido nem pulado.
beforeEach(() => localStorage.removeItem(PERSONA_ASKED_KEY));

describe('usePersona (PR-05)', () => {
  it('1ª visita: sem persona e a pergunta pendente', () => {
    const { result } = renderHook(() => usePersona(), { wrapper });

    expect(result.current.persona).toBeUndefined();
    expect(result.current.asked).toBe(false);
  });

  it('escolher grava a persona e encerra a pergunta', () => {
    const { result } = renderHook(() => usePersona(), { wrapper });

    act(() => result.current.choose('tech'));

    expect(result.current.persona?.id).toBe('tech');
    expect(result.current.asked).toBe(true);
    expect(localStorage.getItem(PERSONA_KEY)).toBe('tech');
    expect(localStorage.getItem(PERSONA_ASKED_KEY)).toBe('1');
  });

  it('pular encerra a pergunta sem persona e é lembrado', () => {
    const first = renderHook(() => usePersona(), { wrapper });

    act(() => first.result.current.skip());
    first.unmount();

    const again = renderHook(() => usePersona(), { wrapper });

    expect(again.result.current.persona).toBeUndefined();
    expect(again.result.current.asked).toBe(true);
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
  });

  it('a escolha sobrevive a uma nova visita', () => {
    const first = renderHook(() => usePersona(), { wrapper });

    act(() => first.result.current.choose('professor'));
    first.unmount();

    expect(renderHook(() => usePersona(), { wrapper }).result.current.persona?.id).toBe(
      'professor',
    );
  });

  it('limpar remove a persona e não volta a perguntar', () => {
    const { result } = renderHook(() => usePersona(), { wrapper });

    act(() => result.current.choose('rh'));
    act(() => result.current.clear());

    expect(result.current.persona).toBeUndefined();
    expect(result.current.asked).toBe(true);
    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
  });

  it('id salvo que não existe mais é ignorado', () => {
    localStorage.setItem(PERSONA_KEY, 'extinta');

    const { result } = renderHook(() => usePersona(), { wrapper });

    expect(result.current.persona).toBeUndefined();
  });

  it('sem localStorage a escolha vale na sessão', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const { result } = renderHook(() => usePersona(), { wrapper });

    expect(result.current.asked).toBe(false);
    act(() => result.current.choose('cliente'));
    expect(result.current.persona?.id).toBe('cliente');
    expect(result.current.asked).toBe(true);

    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('fora do provedor nada pergunta nem muda', () => {
    const { result } = renderHook(() => usePersona());

    expect(result.current.persona).toBeUndefined();
    expect(result.current.asked).toBe(true);
  });
});
