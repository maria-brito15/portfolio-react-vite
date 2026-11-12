import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { findTheme, themes } from '../../data/themes';
import { openPalette } from './commandBarEvents';

// Header compacto em três zonas: menu (celular) e logo à esquerda, busca global
// no centro (abre a paleta, como `Ctrl K`) e, à direita, seletor de tema e
// idioma. A navegação em si mora na barra lateral (Sidebar).
export default function Header({
  menuOpen,
  menuId,
  onMenu,
}: {
  menuOpen: boolean;
  menuId: string;
  onMenu: () => void;
}) {
  const { lang, t, toggleLang } = useLanguage();
  const [theme, , setTheme] = useTheme();

  return (
    <header className="site-nav">
      <div className="nav-left">
        <button
          type="button"
          className="header-menu"
          aria-label={menuOpen ? t.ws.sidebar.close : t.ws.sidebar.open}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={onMenu}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>
        <Link to="/" className="logo" aria-label={t.nav.home}>
          mariab.dev
        </Link>
      </div>
      <div className="nav-center">
        <button
          type="button"
          className="header-cmd"
          aria-label={t.cmdbar.headerButton}
          title={t.cmdbar.shortcut}
          onClick={openPalette}
        >
          <span className="header-cmd-prompt" aria-hidden="true">
            &gt;_
          </span>
          <span className="header-cmd-text">{t.ws.header.search}</span>
          <kbd aria-hidden="true">Ctrl K</kbd>
        </button>
      </div>
      <div className="nav-right">
        <select
          className="theme-select"
          aria-label={t.ws.header.theme}
          value={theme}
          onChange={(event) => {
            const next = findTheme(event.target.value);

            if (next) setTheme(next.id);
          }}
        >
          {themes.map((th) => (
            <option key={th.id} value={th.id}>
              {th.names[lang]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="theme-toggle lang-toggle"
          onClick={toggleLang}
          aria-label={`${t.language.label} — ${t.language.switchTo}`}
        >
          <span aria-hidden="true">🌍</span>
          <span>{t.language.label}</span>
        </button>
      </div>
    </header>
  );
}
