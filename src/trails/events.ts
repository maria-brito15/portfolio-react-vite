// Barramento mínimo entre o resto do site e o motor das trilhas (D5): quem faz algo
// "emite", o motor "ouve". Assim o tour e as conquistas não dependem do formato do
// histórico do terminal nem de quem alterou o tema ou o idioma.
export type TrailEvent =
  // `name` é o nome do comando em português (names[0] em commands.tsx).
  { type: 'command'; name: string } | { type: 'theme' } | { type: 'lang' };

type Listener = (event: TrailEvent) => void;

const listeners = new Set<Listener>();

export function emitTrailEvent(event: TrailEvent) {
  for (const listener of [...listeners]) listener(event);
}

export function subscribeTrailEvents(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
