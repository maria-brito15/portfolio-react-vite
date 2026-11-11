import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { openPalette } from './commandBarEvents';

// Header em três zonas: acesso a comandos (esquerda), logo centralizado e os
// dois controles (tema e idioma, direita). Não há menu de links: o "menu" do
// site é o terminal. O botão da esquerda abre a paleta de comandos, como `Ctrl K`.
export default function Header() {
  const { t, toggleLang } = useLanguage();
  const [theme, toggleTheme] = useTheme();
  const dark = theme === 'dark';

  return (
    <header className="site-nav">
      <div className="nav-left">
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
          <kbd aria-hidden="true">Ctrl K</kbd>
        </button>
      </div>
      <Link to="/" className="logo" aria-label={t.nav.home}>
        mariab.dev
      </Link>
      <div className="nav-right">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={dark ? t.theme.toLight : t.theme.toDark}
        >
          <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
          <span>{dark ? t.theme.toLight : t.theme.toDark}</span>
        </button>
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
