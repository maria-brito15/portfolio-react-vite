import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';

// Visualizador de imagens em tela cheia (lightbox do site original):
// Esc fecha, setas navegam, a rolagem da página fica bloqueada e o foco volta
// para a miniatura que abriu a galeria ao fechar.
export default function Lightbox({ images, index, onIndexChange, onClose }) {
  const { t } = useLanguage();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const count = images.length;
  const image = images[index];

  // Bloqueio de rolagem, foco inicial e devolução do foco ao fechar.
  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft' && count > 1) onIndexChange((index - 1 + count) % count);
      else if (event.key === 'ArrowRight' && count > 1) onIndexChange((index + 1) % count);
      else if (event.key === 'Tab') {
        // Mantém o foco dentro do diálogo.
        const focusable = dialogRef.current?.querySelectorAll('button');

        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [index, count, onIndexChange, onClose]);

  return createPortal(
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t.lightbox.dialog}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="lb-close"
        onClick={onClose}
        aria-label={t.lightbox.close}
      >
        ✕
      </button>
      {count > 1 && (
        <button
          type="button"
          className="lb-prev"
          onClick={() => onIndexChange((index - 1 + count) % count)}
          aria-label={t.lightbox.prev}
        >
          ‹
        </button>
      )}
      <img className="lb-img" src={image.src} alt={image.alt} />
      {count > 1 && (
        <button
          type="button"
          className="lb-next"
          onClick={() => onIndexChange((index + 1) % count)}
          aria-label={t.lightbox.next}
        >
          ›
        </button>
      )}
      <span className="lb-counter" aria-live="polite">
        {index + 1} / {count}
      </span>
    </div>,
    document.body,
  );
}
