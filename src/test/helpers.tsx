import { act, render } from '@testing-library/react';
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

// Troca o idioma como quem abre o mesmo endereço em inglês (o endereço manda no idioma, FR-019).
// A rota do terminal não tem casca (FR-041), então não há seletor para clicar.
export function goToEnglish() {
  const here = window.location.pathname;

  act(() => {
    window.history.pushState(null, '', here === '/' ? '/en' : `/en${here}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}
