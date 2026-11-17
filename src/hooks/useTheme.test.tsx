// T1.5 (V-03): o provedor de tema só grava a escolha do visitante; montar não grava nada.
import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from './useTheme';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ThemeProvider (FR-004, FR-006)', () => {
  it('montar sem clicar não grava nada', () => {
    const set = vi.spyOn(Storage.prototype, 'setItem');

    document.documentElement.setAttribute('data-theme', 'dark');
    renderHook(() => useTheme(), { wrapper });

    expect(set).not.toHaveBeenCalled();
    expect(localStorage.getItem('portfolio-theme')).toBeNull();
  });

  it('parte do tema que o boot já aplicou', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('o clique (alternar) grava a escolha', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current[1]());
    expect(result.current[0]).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
  });

  it('escolher um tema pelo id grava a escolha', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current[2]('dark'));
    expect(result.current[0]).toBe('dark');
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');
  });

  it('armazenamento bloqueado: a escolha vale na visita, sem erro (FR-006)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(() => act(() => result.current[2]('dark'))).not.toThrow();
    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
