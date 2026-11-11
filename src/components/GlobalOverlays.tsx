// Atalhos globais que abrem diálogos: Ctrl+K (paleta de comandos) e ? (lista de
// atalhos). Não roubam o que a pessoa digita em campos de formulário; a única
// exceção é Ctrl+K na linha de comando do próprio terminal (é onde a pessoa
// está quase sempre).
import { lazy, Suspense, useEffect, useState } from 'react';
import { OPEN_PALETTE } from './shell/commandBarEvents';

const CommandPalette = lazy(() => import('./CommandPalette'));
const ShortcutsHelp = lazy(() => import('./ShortcutsHelp'));

const isFormField = (el: EventTarget | null) =>
  el instanceof Element &&
  el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !== null;

// Onde Ctrl+K continua valendo mesmo dentro de um campo: a linha de comando e a
// própria paleta (para fechá-la com o mesmo atalho).
const isCommandLine = (el: EventTarget | null) =>
  el instanceof Element && el.closest('.term-input, .overlay-box') !== null;

type Open = 'palette' | 'shortcuts' | null;

export default function GlobalOverlays() {
  const [open, setOpen] = useState<Open>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey) return;

      const modifier = event.ctrlKey || event.metaKey;

      if (event.key.toLowerCase() === 'k' && modifier) {
        if (isFormField(event.target) && !isCommandLine(event.target)) return;
        event.preventDefault();
        setOpen((current) => (current === 'palette' ? null : 'palette'));
      } else if (event.key === '?' && !modifier && !isFormField(event.target)) {
        event.preventDefault();
        setOpen((current) => (current === 'shortcuts' ? null : 'shortcuts'));
      }
    };

    // O botão `>_` do Header faz o mesmo que Ctrl+K (só abre; fechar é com Esc ou Ctrl+K).
    const onOpenRequest = () => setOpen('palette');

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_PALETTE, onOpenRequest);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_PALETTE, onOpenRequest);
    };
  }, []);

  if (!open) return null;

  const close = () => setOpen(null);

  return (
    <Suspense fallback={null}>
      {open === 'palette' ? <CommandPalette onClose={close} /> : <ShortcutsHelp onClose={close} />}
    </Suspense>
  );
}
