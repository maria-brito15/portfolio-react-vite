import { render } from '@testing-library/react';
import { RouterProvider } from '../router';
import { LanguageProvider } from '../i18n/LanguageContext';
import App from '../App';

export function renderApp(path = '/') {
  window.history.replaceState(null, '', path);
  return render(
    <RouterProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </RouterProvider>,
  );
}
