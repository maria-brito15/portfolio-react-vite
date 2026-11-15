// Estado da sala de montagem (o terminal em overlay, CD-41). Vive num store de módulo: abrir ou fechar
// não passa por Context nem altera a URL.
import { useSyncExternalStore } from 'react';

let isOpen = false;
const listeners = new Set<() => void>();

function set(next: boolean) {
  if (isOpen === next) return;
  isOpen = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const cuttingRoom = {
  show: () => set(true),
  close: () => set(false),
  toggle: () => set(!isOpen),
};

export function useCuttingRoom() {
  const open = useSyncExternalStore(
    subscribe,
    () => isOpen,
    () => false,
  );

  return { open, ...cuttingRoom };
}
