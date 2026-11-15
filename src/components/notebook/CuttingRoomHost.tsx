import { lazy, Suspense, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useRouter } from '../../router';
import { TERMINAL_PATH } from '../../data/routes';
import Overlay from '../Overlay';
import { useCuttingRoom } from './useCuttingRoom';

const CuttingRoom = lazy(() => import('./CuttingRoom'));

const isFormField = (el: EventTarget | null) =>
  el instanceof Element &&
  el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !== null;

// Onde o atalho continua valendo mesmo dentro de um campo: a linha de comando do terminal e o
// próprio overlay (para fechar com o mesmo atalho).
const isTerminalField = (el: EventTarget | null) =>
  el instanceof Element && el.closest('.term-input, .overlay-box') !== null;

// Sala de montagem em overlay (CD-41, CD-42): botão visível no rodapé (obrigatório) e `Ctrl+\``
// (bônus: em teclado ABNT o acento grave pede tecla morta). Não altera a URL; Esc fecha (pelo
// `Overlay`); navegar para outra página fecha; em `/terminal` não abre (a página já é a sala).
export default function CuttingRoomHost() {
  const { t } = useLanguage();
  const { path } = useRouter();
  const { open, toggle, close } = useCuttingRoom();
  const onTerminal = path === TERMINAL_PATH;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || !event.ctrlKey) return;
      if (event.key !== '`' && event.code !== 'Backquote') return;
      if (isFormField(event.target) && !isTerminalField(event.target)) return;
      event.preventDefault();
      toggle();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  // Mudar de página fecha a sala (comandos do terminal que navegam, por exemplo).
  useEffect(() => {
    close();
  }, [path, close]);

  if (!open || onTerminal) return null;

  return (
    <Overlay label={t.nb.cuttingRoom.title} onClose={close}>
      <Suspense fallback={null}>
        <CuttingRoom />
      </Suspense>
    </Overlay>
  );
}
