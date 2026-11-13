import { useEffect, useState } from 'react';

// As perspectivas por persona (`projectPerspectives.ts`, ~11 kB) só importam para quem escolheu
// uma persona: ficam fora do JS inicial e são baixadas na primeira vez que alguém precisa delas.
// Sem persona, nada é baixado e os cartões usam o texto padrão. Depois de carregado o módulo fica
// em memória e a leitura é síncrona.
type Perspectives = typeof import('../data/projectPerspectives');

let loaded: Perspectives | undefined;

export function usePerspectives(enabled: boolean): Perspectives | undefined {
  const [mod, setMod] = useState(loaded);

  useEffect(() => {
    if (!enabled || loaded) return;

    let live = true;

    import('../data/projectPerspectives').then((m) => {
      loaded = m;
      if (live) setMod(m);
    });

    return () => {
      live = false;
    };
  }, [enabled]);

  return enabled ? mod : undefined;
}
