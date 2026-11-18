import { useEffect, useState, useSyncExternalStore } from 'react';
import { languageOffer } from '../../boot/boot';
import { pathInLang } from '../../data/routes';
import { LANG_OFFER_KEY, storeLangChoice, useLanguage } from '../../i18n/LanguageContext';
import { Link, useRouter } from '../../router';

const ROOT_FLAG = 'data-lang-offer';

// A oferta vale para este endereço? Lê o armazenamento sob try/catch; bloqueado = `storageOk: false`
// e a faixa volta em toda visita em que o navegador prefere o inglês (FR-026).
function offerFor(path: string): boolean {
  let storageOk = true;
  let storedLang: string | null = null;
  let dismissed = false;

  try {
    storedLang = localStorage.getItem('portfolio-lang');
    dismissed = localStorage.getItem(LANG_OFFER_KEY) === 'dismissed';
  } catch {
    storageOk = false;
  }

  return languageOffer({
    path,
    storedLang,
    dismissed,
    navigatorLangs: navigator.languages?.length ? [...navigator.languages] : [navigator.language],
    storageOk,
  });
}

// Outra aba que grave a escolha ou a dispensa atualiza a faixa.
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);

  return () => window.removeEventListener('storage', onChange);
}

// Faixa que oferece o inglês na primeira visita (FR-025, FR-026, FR-034, FR-035, TD-012). Só no
// cliente: no servidor e na hidratação o valor é "não mostrar" (sem divergência de HTML) e a faixa
// entra depois. Nunca redireciona, não rouba o foco e fica `position: fixed` no topo; o espaço dela
// já foi reservado no primeiro desenho pelo CSS (`html[data-lang-offer]`, marcado pelo boot).
export default function LanguageOffer() {
  const { path } = useRouter();
  const { t } = useLanguage();
  const offer = useSyncExternalStore(
    subscribe,
    () => offerFor(path),
    () => false,
  );
  // Dispensada nesta visita (vale mesmo com o armazenamento bloqueado).
  const [closed, setClosed] = useState(false);
  const shown = offer && !closed;

  // O espaço reservado só existe enquanto a faixa pode aparecer.
  useEffect(() => {
    if (!shown) document.documentElement.removeAttribute(ROOT_FLAG);
  }, [shown]);

  if (!shown) return null;

  function dismiss() {
    try {
      localStorage.setItem(LANG_OFFER_KEY, 'dismissed');
    } catch {
      // sem armazenamento a faixa volta na próxima visita (FR-026); nesta, `closed` a esconde
    }
    setClosed(true);
  }

  return (
    <div className="lang-offer" role="region" aria-label={t.langOffer.label}>
      <p>
        {t.langOffer.text}{' '}
        <Link
          to={pathInLang(path, 'en')}
          hrefLang="en"
          lang="en"
          onClick={() => storeLangChoice('en')}
        >
          {t.langOffer.link}
        </Link>
      </p>
      <button type="button" onClick={dismiss}>
        {t.langOffer.dismiss}
      </button>
    </div>
  );
}
