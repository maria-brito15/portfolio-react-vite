import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);
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
