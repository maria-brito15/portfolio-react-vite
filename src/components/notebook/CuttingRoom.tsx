import { useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { portfolio } from '../../data/portfolio';
import Window from '../shell/Window';
import Terminal from '../../terminal/Terminal';
import { cuttingRoom } from './useCuttingRoom';

// Conteúdo do overlay da sala de montagem (CD-41): o terminal existente dentro de uma janela,
// com cabeçalho e botão de fechar visíveis. Carregado sob demanda por `CuttingRoomHost`.
export default function CuttingRoom() {
  const { lang, t } = useLanguage();
  const closeButton = useRef<HTMLButtonElement>(null);

  // O conteúdo carrega sob demanda, depois de o Overlay montar: o foco entra aqui para o Esc e a
  // navegação por teclado valerem dentro do diálogo.
  useEffect(() => closeButton.current?.focus(), []);

  return (
    <div className="nb-cutting">
      <header className="nb-cutting-head">
        <div>
          <p className="nb-chapter-line">
            <span className="nb-chapter-name">{t.nb.cuttingRoom.title}</span>
          </p>
          <p className="nb-kicker">{t.nb.cuttingRoom.sub}</p>
        </div>
        <button
          type="button"
          ref={closeButton}
          className="nb-btn"
          aria-label={t.nb.cuttingRoom.close}
          onClick={cuttingRoom.close}
        >
          ✕
        </button>
      </header>
      <Window variant="terminal" title="visitante@mariab.dev: ~">
        <Terminal content={portfolio[lang].hero} />
      </Window>
      <p className="nb-cutting-hint">{t.nb.cuttingRoom.hint}</p>
    </div>
  );
}
