import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

const STORAGE_KEY = 'portfolio-mobile-notice-dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Sem armazenamento disponível, o aviso pode voltar na próxima visita.
  }
}

// Aviso de que o site é pensado para desktop, mostrado uma vez por
// navegador em telas estreitas. Não bloqueia o site: fechar sempre funciona
// e não há conteúdo escondido atrás do aviso.
export default function MobileNoticeModal() {
  const { t } = useLanguage();
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const [dismissed, setDismissed] = useState(readDismissed);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = isNarrow && !dismissed;

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  function dismiss() {
    writeDismissed();
    setDismissed(true);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') dismiss();
      else if (event.key === 'Tab') {
        // Único elemento focável: Tab não deve escapar do diálogo.
        event.preventDefault();
        closeRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="mobile-notice"
      role="dialog"
      aria-modal="true"
      aria-label={t.mobileNotice.title}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="mn-panel">
        <h2 className="mn-title">{t.mobileNotice.title}</h2>
        <p className="mn-body">{t.mobileNotice.body}</p>
        <button ref={closeRef} type="button" className="mn-dismiss" onClick={dismiss}>
          {t.mobileNotice.dismiss}
        </button>
      </div>
    </div>,
    document.body,
  );
}
