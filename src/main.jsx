import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { RouterProvider } from './router';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './hooks/useTheme';
import './styles/tokens.css';
import './styles/original.css';
import './styles/portfolio.css';
import './styles/terminal.css';
import './styles/shell.css';
import './styles/resume.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </RouterProvider>
  </StrictMode>,
);
