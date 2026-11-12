// Progresso das trilhas no navegador (TR-18): uma entrada por persona e a lista de
// segredos achados (vale para qualquer trilha). Fica só em `localStorage`; sem
// armazenamento (navegação privada), o estado vale enquanto a página estiver aberta.
export const TRAIL_KEY = 'portfolio-trail';

export interface TrailProgress {
  // Passo atual (índice na lista de passos visíveis).
  step: number;
  // Ids dos passos já feitos.
  done: string[];
  finished: boolean;
  // "Agora não": o cartão da home fica escondido.
  dismissed: boolean;
}

export interface TrailStore {
  trails: Record<string, TrailProgress>;
  secrets: string[];
}

export const emptyProgress = (): TrailProgress => ({
  step: 0,
  done: [],
  finished: false,
  dismissed: false,
});

const isStrings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

function cleanProgress(value: unknown): TrailProgress {
  const v = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;

  return {
    step: Number.isInteger(v.step) && (v.step as number) >= 0 ? (v.step as number) : 0,
    done: isStrings(v.done) ? v.done : [],
    finished: v.finished === true,
    dismissed: v.dismissed === true,
  };
}

let memory: TrailStore | null = null;

export function loadStore(): TrailStore {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(TRAIL_KEY) ?? 'null');
    const data = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
    const trails = typeof data.trails === 'object' && data.trails !== null ? data.trails : {};

    return {
      trails: Object.fromEntries(
        Object.entries(trails).map(([persona, progress]) => [persona, cleanProgress(progress)]),
      ),
      secrets: isStrings(data.secrets) ? data.secrets : [],
    };
  } catch {
    // Armazenamento bloqueado: usa o que ficou na memória desta página.
    return memory ?? { trails: {}, secrets: [] };
  }
}

export function saveStore(store: TrailStore) {
  memory = store;

  try {
    localStorage.setItem(TRAIL_KEY, JSON.stringify(store));
  } catch {
    // Sem armazenamento: o estado fica na memória desta página.
  }
}

// Só para os testes: esquece o que ficou na memória.
export function resetTrailMemory() {
  memory = null;
}
