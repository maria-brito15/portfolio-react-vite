import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { RouterProvider } from './router';
import { LanguageProvider } from './i18n/LanguageContext';
import './styles/original.css';
import './styles/portfolio.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </RouterProvider>
  </StrictMode>,
);
