import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, configure } from '@testing-library/react';

expect.extend(matchers);

// Diálogos e jogos carregam por import() sob demanda; com a máquina ocupada o
// padrão de 1 s das consultas assíncronas (findBy, waitFor) não basta.
configure({ asyncUtilTimeout: 5000 });

// Páginas carregadas sob demanda no app (React.lazy) entram direto nos testes.
vi.mock('../pages/lazyPages', async () => ({
  Services: (await import('../pages/Services')).default,
  CaseStudy: (await import('../pages/CaseStudy')).default,
  Resume: (await import('../pages/Resume')).default,
  Academics: (await import('../pages/Academics')).default,
  SectionPage: (await import('../pages/SectionPage')).default,
}));

// O boot da primeira visita fica desligado nos testes (quem o testa limpa a marca).
beforeEach(() => localStorage.setItem('portfolio-booted', '1'));

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.style.overflow = '';
  window.history.replaceState(null, '', '/');
});

// Nenhum teste vai à rede: o GitHub responde como indisponível, salvo mock próprio.
beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
});

// jsdom não implementa estas APIs.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
