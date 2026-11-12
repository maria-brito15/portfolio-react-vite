import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Theme } from '../types';
import { DEFAULT_THEME, isTheme } from '../data/themes';
import { emitTrailEvent } from '../trails/events';

const STORAGE_KEY = 'portfolio-theme';
// [tema atual, alternar claro/escuro, escolher um tema pelo id]
type ThemeValue = [Theme, () => void, (theme: Theme) => void];

const ThemeContext = createContext<ThemeValue>([DEFAULT_THEME, () => {}, () => {}]);

// O script inline do index.html já aplica o tema salvo antes do React carregar
// (evita o "flash" do tema errado); aqui o estado parte desse valor. Valor
// desconhecido cai no tema padrão.
function readInitialTheme(): Theme {
  const applied = document.documentElement.getAttribute('data-theme');

  return isTheme(applied) ? applied : DEFAULT_THEME;
}

// O tema fica num contexto porque agora dois lugares o alteram: o botão do
// cabeçalho e o comando `tema` do terminal.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const previous = useRef(theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Troca de tema (não a carga inicial) conta como segredo achado nas trilhas.
    if (previous.current !== theme) emitTrailEvent({ type: 'theme' });
    previous.current = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Sem armazenamento disponível, o tema vale só para a visita atual.
    }
  }, [theme]);

  // O botão do cabeçalho alterna claro/escuro; a partir de um tema extra, vai para o escuro.
  const value = useMemo<ThemeValue>(
    () => [theme, () => setTheme((v) => (v === 'dark' ? 'light' : 'dark')), setTheme],
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
