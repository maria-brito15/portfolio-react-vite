import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'portfolio-theme';
const ThemeContext = createContext(null);

// O script inline do index.html já aplica o tema salvo antes do React carregar
// (evita o "flash" do tema errado); aqui o estado parte desse valor.
function readInitialTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

// O tema fica num contexto porque agora dois lugares o alteram: o botão do
// cabeçalho e o comando `tema` do terminal.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Sem armazenamento disponível, o tema vale só para a visita atual.
    }
  }, [theme]);

  const value = useMemo(
    () => [theme, () => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))],
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
