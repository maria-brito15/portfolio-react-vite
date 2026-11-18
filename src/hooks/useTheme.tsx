import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Theme } from '../types';
import { DEFAULT_THEME, isTheme } from '../data/themes';

const STORAGE_KEY = 'portfolio-theme';
// [tema atual, alternar claro/escuro, escolher um tema pelo id]
type ThemeValue = [Theme, () => void, (theme: Theme) => void];

const ThemeContext = createContext<ThemeValue>([DEFAULT_THEME, () => {}, () => {}]);

// O script de boot (src/boot/boot.ts, injetado no <head>) já aplica o tema antes do React
// carregar (evita o "flash" do tema errado); aqui o estado parte desse valor. Valor
// desconhecido cai no tema padrão. No pré-render (sem `document`) vale o padrão: nada do HTML depende
// do tema (o texto do botão de tema é escolhido por CSS), então a hidratação não diverge.
function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return DEFAULT_THEME;

  const applied = document.documentElement.getAttribute('data-theme');

  return isTheme(applied) ? applied : DEFAULT_THEME;
}

// O tema fica num contexto porque agora dois lugares o alteram: o botão do
// cabeçalho e o comando `tema` do terminal.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // O boot já marcou `data-theme`; aqui só se garante o atributo (sem gravar nada).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Só uma escolha do visitante é gravada (FR-004); montar o provedor não grava nada.
  const value = useMemo<ThemeValue>(() => {
    const choose = (next: Theme) => {
      setTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Sem armazenamento disponível, o tema vale só para a visita atual (FR-006).
      }
    };

    return [theme, () => choose(theme === 'dark' ? 'light' : 'dark'), choose];
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
