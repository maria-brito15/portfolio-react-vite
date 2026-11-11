import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

// Páginas carregadas sob demanda no app (React.lazy) entram direto nos testes.
vi.mock('../pages/lazyPages', async () => ({
  Services: (await import('../pages/Services')).default,
  CaseStudy: (await import('../pages/CaseStudy')).default,
  Resume: (await import('../pages/Resume')).default,
  Academics: (await import('../pages/Academics')).default,
  SectionPage: (await import('../pages/SectionPage')).default,
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.style.overflow = '';
  window.history.replaceState(null, '', '/');
});

// jsdom não implementa estas APIs.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
