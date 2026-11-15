import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { RouterProvider } from './router';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './hooks/useTheme';
import './styles/tokens.css';
import './styles/ui.css';
import './styles/base.css';
import './styles/services.css';
import './styles/sections.css';
import './styles/responsive.css';
import './styles/terminal.css';
import './styles/shell.css';
import './styles/workspace.css';
import './styles/experiences.css';
import './styles/personal.css';
import './styles/resume.css';
import './styles/notebook.css';
import { announceInConsole } from './utils/consoleMessage';
import { CADERNO_V2 } from './config';

announceInConsole();

// Paleta do caderno (tokens.css, revisão R1). O `index.html` já marca antes do primeiro desenho;
// aqui é a garantia para builds em que o marcador do Vite não foi substituído.
if (CADERNO_V2) document.documentElement.setAttribute('data-caderno', '');

createRoot(document.getElementById('root') as HTMLElement).render(
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
