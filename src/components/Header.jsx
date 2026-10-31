import { useEffect, useId, useState } from 'react';
import { Link, useRouter } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../hooks/useTheme';

// Barra de navegação do site original. Cada página informa seus links;
// em telas pequenas eles ficam num menu recolhível (antes simplesmente sumiam).
export default function Header({ links }) {
  const { t, toggleLang } = useLanguage();
  const [theme, toggleTheme] = useTheme();
  const { path, hash } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  // Fecha o menu ao trocar de rota ou âncora.
  const [lastLocation, setLastLocation] = useState(path + hash);
  if (lastLocation !== path + hash) {
    setLastLocation(path + hash);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const dark = theme === 'dark';

  return (
    <nav aria-label={t.nav.main}>
      <Link to="/" className="logo" aria-label={t.nav.home}>
        mariab.dev
      </Link>
      <ul id={menuId} className={`nav-links${menuOpen ? ' open' : ''}`}>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
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
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>
    </nav>
  );
}
