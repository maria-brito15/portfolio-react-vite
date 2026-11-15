import { useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { prefersReducedMotion } from '../../utils/env';
import { useOpener } from './useOpener';

// Cartão de abertura da primeira visita de cada volume (CD-44): 2,5 s, ou 1 s estático com
// movimento reduzido. O texto é `aria-hidden` (o conteúdo já está no DOM por baixo, então não
// há nada a anunciar), mas o botão "pular" fica acessível por teclado. Não é `h1` e não monta
// para robôs nem para quem já viu este volume.
export default function OpeningCard() {
  const { t } = useLanguage();
  const { show, done } = useOpener();
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!show) return;

    const timer = window.setTimeout(done, reduced ? 1000 : 2500);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') done();
    };

    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
    };
    // `done` só muda o estado `show`; recriá-lo a cada render não deve reiniciar o relógio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced]);

  if (!show) return null;

  return (
    <div className={`nb-opener${reduced ? ' is-static' : ''}`} data-testid="opening-card">
      <div aria-hidden="true">
        <p className="nb-opener-name">{t.nb.coverName.toUpperCase()}</p>
        <p className="nb-opener-line">
          {t.nb.opener.line}
        </p>
      </div>
      <button
        type="button"
        className="nb-opener-skip"
        aria-label={t.nb.opener.skipLabel}
        onClick={done}
      >
        {t.nb.opener.skip}
      </button>
    </div>
  );
}
