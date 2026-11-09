import { useSyncExternalStore } from 'react';

// Resultado de uma media query, atualizado quando a janela muda de tamanho.
// Onde `matchMedia` não existe (jsdom), vale `false`.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window.matchMedia !== 'function') return () => {};

      const list = window.matchMedia(query);

      list.addEventListener('change', notify);

      return () => list.removeEventListener('change', notify);
    },
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false,
  );
}
