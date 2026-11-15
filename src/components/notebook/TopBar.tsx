import { useRef, useState } from 'react';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { openPalette } from '../shell/commandBarEvents';
import EditionPicker from './EditionPicker';
import IndexOverlay from './IndexOverlay';

// Barra superior única (CD-12): nome, ÍNDICE, edição (tema), idioma e buscar. O atalho da busca
// só aparece dentro da paleta, não aqui (CD-18).
export default function TopBar() {
  const { t, toggleLang } = useLanguage();
  const [indexOpen, setIndexOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);

  return (
    <header className="nb-top">
      <Link to="/" className="nb-brand">
        {t.nb.site}
      </Link>
      <nav className="nb-top-actions" aria-label={t.nb.nav}>
        <button
          type="button"
          ref={opener}
          className="nb-btn nb-btn--index"
          aria-haspopup="dialog"
          aria-expanded={indexOpen}
          onClick={() => setIndexOpen(true)}
        >
          {t.nb.index.toUpperCase()}
        </button>
        <button type="button" className="nb-btn" aria-label={t.nb.searchLabel} onClick={openPalette}>
          {t.nb.search}
        </button>
        <EditionPicker />
        <button
          type="button"
          className="nb-btn"
          onClick={toggleLang}
          aria-label={`${t.language.label} — ${t.language.switchTo}`}
        >
          {t.language.label}
        </button>
      </nav>
      {indexOpen && <IndexOverlay onClose={() => setIndexOpen(false)} />}
    </header>
  );
}
