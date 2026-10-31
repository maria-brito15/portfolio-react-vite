import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

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
