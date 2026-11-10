import { render } from '@testing-library/react';
import { RouterProvider } from '../router';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ThemeProvider } from '../hooks/useTheme';
import App from '../App';

export function renderApp(path = '/') {
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
