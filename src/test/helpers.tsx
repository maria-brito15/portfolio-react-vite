import { render } from '@testing-library/react';
import { RouterProvider } from '../router';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ThemeProvider } from '../hooks/useTheme';
import App from '../App';

// O padrão é o terminal (`/terminal`), onde moram a linha de comando e as saídas;
// a home (`/`) é o painel e é pedida explicitamente.
export function renderApp(path = '/terminal') {
  window.history.replaceState(null, '', path);

  return render(
    <RouterProvider>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </RouterProvider>,
  );
}
