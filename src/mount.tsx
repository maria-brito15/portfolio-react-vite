// Monta o site no `#root` (spec 002, T4.3, TD-008). Com o HTML pré-renderizado dentro do `#root` o
// React hidrata (aproveita o que já está na tela); sem ele (`vite dev`) cria a árvore do zero.
import { StrictMode } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import App from './App';
import { RouterProvider } from './router';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './hooks/useTheme';

const tree = (
  <StrictMode>
    <RouterProvider>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </RouterProvider>
  </StrictMode>
);

export function mount(container: HTMLElement, onRecoverableError?: (error: unknown) => void): Root {
  if (container.hasChildNodes()) return hydrateRoot(container, tree, { onRecoverableError });

  const root = createRoot(container);

  root.render(tree);

  return root;
}
