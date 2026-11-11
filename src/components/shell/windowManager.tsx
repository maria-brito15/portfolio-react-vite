// Estado das janelas: posição (arrasto), maximizada e recolhida (JA-01 a JA-05).
// Vive na sessão (memória): a posição de cada janela sobrevive à troca de
// página, mas nunca é gravada no navegador. Só funciona em tela larga com
// mouse; no celular e sem ponteiro fino as janelas ficam fixas (JA-03) e
// nenhuma janela pode ser recolhida sem ter como reabri-la.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { Pos } from './windowGeometry';

export const MANAGED_QUERY = '(min-width: 761px) and (pointer: fine)';

const ORIGIN: Pos = { x: 0, y: 0 };

export interface MinimizedWindow {
  id: string;
  title: string;
}

export interface WindowManager {
  managed: boolean;
  position: (id: string) => Pos;
  moveTo: (id: string, pos: Pos) => void;
  resetPosition: (id: string) => void;
  maximized: (id: string) => boolean;
  toggleMaximized: (id: string) => void;
  minimized: MinimizedWindow | null;
  minimize: (id: string, title: string) => void;
  restore: () => void;
  // Janela desmontada (mudou de página): sai da barra de tarefas.
  forget: (id: string) => void;
}

const noop = () => {};

// Fora do provedor tudo é inerte: a janela se comporta como a de antes.
const WindowContext = createContext<WindowManager>({
  managed: false,
  position: () => ORIGIN,
  moveTo: noop,
  resetPosition: noop,
  maximized: () => false,
  toggleMaximized: noop,
  minimized: null,
  minimize: noop,
  restore: noop,
  forget: noop,
});

export function WindowProvider({ children }: { children: ReactNode }) {
  const managed = useMediaQuery(MANAGED_QUERY);
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [maximizedIds, setMaximizedIds] = useState<Record<string, boolean>>({});
  const [minimized, setMinimized] = useState<MinimizedWindow | null>(null);

  const moveTo = useCallback(
    (id: string, pos: Pos) => setPositions((all) => ({ ...all, [id]: pos })),
    [],
  );
  const resetPosition = useCallback(
    (id: string) =>
      setPositions((all) => {
        const rest = { ...all };

        delete rest[id];

        return rest;
      }),
    [],
  );
  const toggleMaximized = useCallback(
    (id: string) => setMaximizedIds((all) => ({ ...all, [id]: !all[id] })),
    [],
  );
  const minimize = useCallback((id: string, title: string) => setMinimized({ id, title }), []);
  const restore = useCallback(() => setMinimized(null), []);
  const forget = useCallback(
    (id: string) => setMinimized((current) => (current?.id === id ? null : current)),
    [],
  );

  const value = useMemo<WindowManager>(
    () => ({
      managed,
      position: (id) => positions[id] ?? ORIGIN,
      moveTo,
      resetPosition,
      maximized: (id) => Boolean(maximizedIds[id]),
      toggleMaximized,
      minimized,
      minimize,
      restore,
      forget,
    }),
    [
      managed,
      positions,
      maximizedIds,
      minimized,
      moveTo,
      resetPosition,
      toggleMaximized,
      minimize,
      restore,
      forget,
    ],
  );

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>;
}

export function useWindowManager() {
  return useContext(WindowContext);
}
