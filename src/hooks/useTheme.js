import { useEffect, useState } from 'react';

const STORAGE_KEY = 'portfolio-theme';

// O script inline do index.html já aplica o tema salvo antes do React carregar
// (evita o "flash" do tema errado); aqui o estado parte desse valor.
function readInitialTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Sem armazenamento disponível, o tema vale só para a visita atual.
    }
  }, [theme]);

  return [theme, () => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))];
}
