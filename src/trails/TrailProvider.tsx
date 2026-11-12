import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePersona } from '../hooks/usePersona';
import { secrets, stepsOf, trailFor, type Trail, type TrailStep } from '../data/trails';
import { findCommand } from '../terminal/commands';
import { subscribeTrailEvents, type TrailEvent } from './events';
import {
  emptyProgress,
  loadStore,
  saveStore,
  type TrailProgress,
  type TrailStore,
} from './storage';

// Estado das trilhas (docs/specs/trilhas/design.md): a trilha da persona atual, o
// progresso dela, se o tour está aberto e os segredos achados. O tour aberto vale só
// para esta página; o progresso e os segredos ficam no navegador (storage.ts).
export interface TrailValue {
  trail: Trail | undefined;
  steps: TrailStep[];
  progress: TrailProgress;
  // Tour aberto.
  active: boolean;
  index: number;
  step: TrailStep | undefined;
  doneCount: number;
  found: string[];
  start: () => void;
  restart: () => void;
  next: () => void;
  prev: () => void;
  exit: () => void;
  dismiss: () => void;
  undismiss: () => void;
  markDone: (stepId: string) => void;
}

const noop = () => {};
const EMPTY = emptyProgress();

// Fora do provedor nada existe (os consumidores toleram isso).
const TrailContext = createContext<TrailValue>({
  trail: undefined,
  steps: [],
  progress: EMPTY,
  active: false,
  index: 0,
  step: undefined,
  doneCount: 0,
  found: [],
  start: noop,
  restart: noop,
  next: noop,
  prev: noop,
  exit: noop,
  dismiss: noop,
  undismiss: noop,
  markDone: noop,
});

const firstWord = (command: string) => command.split(/\s+/)[0];

// Segredo que o evento desbloqueia, se houver.
function secretOf(event: TrailEvent) {
  return secrets.find((secret) =>
    event.type === 'command'
      ? secret.trigger.kind === 'command' &&
        findCommand(secret.trigger.name)?.names[0] === event.name
      : secret.trigger.kind === event.type,
  );
}

export function TrailProvider({ children }: { children: ReactNode }) {
  const { persona } = usePersona();
  const [store, setStore] = useState<TrailStore>(loadStore);
  const [active, setActive] = useState(false);
  // Só grava quando algo mudou (um visitante que não usa trilhas não escreve nada).
  const dirty = useRef(false);

  const trail = trailFor(persona?.id);
  const steps = useMemo(() => (trail ? stepsOf(trail) : []), [trail]);
  const progress = (trail && store.trails[trail.persona]) || EMPTY;
  const index = Math.min(progress.step, Math.max(steps.length - 1, 0));
  const step = steps[index];

  useEffect(() => {
    if (!dirty.current) return;
    dirty.current = false;
    saveStore(store);
  }, [store]);

  const update = useCallback(
    (change: (current: TrailProgress) => TrailProgress) => {
      if (!trail) return;
      dirty.current = true;
      setStore((prev) => ({
        ...prev,
        trails: {
          ...prev.trails,
          [trail.persona]: change(prev.trails[trail.persona] ?? emptyProgress()),
        },
      }));
    },
    [trail],
  );

  const markDone = useCallback(
    (stepId: string) =>
      update((p) => (p.done.includes(stepId) ? p : { ...p, done: [...p.done, stepId] })),
    [update],
  );

  const start = useCallback(() => {
    if (!trail) return;
    // Trilha já concluída recomeça do zero; as outras retomam de onde pararam.
    update((p) => ({ ...(p.finished ? emptyProgress() : p), dismissed: false }));
    setActive(true);
  }, [trail, update]);

  const restart = useCallback(() => {
    if (!trail) return;
    update(() => emptyProgress());
    setActive(true);
  }, [trail, update]);

  const next = useCallback(() => {
    if (index < steps.length - 1) {
      update((p) => ({ ...p, step: index + 1 }));

      return;
    }
    // Último passo: concluir.
    update((p) => ({ ...p, finished: true }));
    setActive(false);
  }, [index, steps.length, update]);

  const prev = useCallback(() => {
    if (index > 0) update((p) => ({ ...p, step: index - 1 }));
  }, [index, update]);

  const exit = useCallback(() => setActive(false), []);
  const dismiss = useCallback(() => update((p) => ({ ...p, dismissed: true })), [update]);
  const undismiss = useCallback(() => update((p) => ({ ...p, dismissed: false })), [update]);

  // Eventos do site: segredos (sempre) e conclusão de passos (com o tour aberto).
  const latest = useRef({ active, step, markDone });

  useEffect(() => {
    latest.current = { active, step, markDone };
  });

  useEffect(
    () =>
      subscribeTrailEvents((event) => {
        const secret = secretOf(event);

        if (secret) {
          dirty.current = true;
          setStore((prev) =>
            prev.secrets.includes(secret.id)
              ? prev
              : { ...prev, secrets: [...prev.secrets, secret.id] },
          );
        }

        const { active: open, step: current, markDone: done } = latest.current;

        if (!open || !current) return;

        const ranIt =
          current.kind === 'fazer' &&
          event.type === 'command' &&
          current.command &&
          findCommand(firstWord(current.command))?.names[0] === event.name;

        if (ranIt || (current.kind === 'achar' && secret)) done(current.id);
      }),
    [],
  );

  const value = useMemo<TrailValue>(
    () => ({
      trail,
      steps,
      progress,
      active: active && Boolean(trail),
      index,
      step,
      doneCount: steps.filter((s) => progress.done.includes(s.id)).length,
      found: store.secrets,
      start,
      restart,
      next,
      prev,
      exit,
      dismiss,
      undismiss,
      markDone,
    }),
    [
      trail,
      steps,
      progress,
      active,
      index,
      step,
      store.secrets,
      start,
      restart,
      next,
      prev,
      exit,
      dismiss,
      undismiss,
      markDone,
    ],
  );

  return <TrailContext.Provider value={value}>{children}</TrailContext.Provider>;
}

export function useTrail() {
  return useContext(TrailContext);
}
