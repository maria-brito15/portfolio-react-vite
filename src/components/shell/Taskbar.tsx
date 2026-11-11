// Barra de tarefas mínima (JA-05): só aparece quando há uma janela recolhida
// e só em tela larga com mouse. Clicar restaura a janela.
import { useLanguage } from '../../i18n/LanguageContext';
import { useWindowManager } from './windowManager';

export default function Taskbar() {
  const { t } = useLanguage();
  const { managed, minimized, restore } = useWindowManager();

  if (!managed || !minimized) return null;

  return (
    <nav className="taskbar" aria-label={t.win.taskbar}>
      <button type="button" className="taskbar-item" onClick={restore}>
        <span aria-hidden="true">▢ </span>
        {minimized.title}
      </button>
    </nav>
  );
}
