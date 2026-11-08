import { useEffect, useId, useState } from 'react';
import { Link, useRouter } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { activeMenuId, menu } from '../../data/routes';

// Barra de navegação única do site: os mesmos links em todas as páginas,
// vindos da tabela de rotas (src/data/routes.js). O item da página atual leva
// aria-current="page". Em telas pequenas os links ficam num menu recolhível.
export default function Header() {
  const { lang, t, toggleLang } = useLanguage();
  const [theme, toggleTheme] = useTheme();
  const { path, hash } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const activeId = activeMenuId(path);

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
    <nav className="site-nav" aria-label={t.nav.main}>
      <Link to="/" className="logo" aria-label={t.nav.home}>
        mariab.dev
      </Link>
      <ul id={menuId} className={`nav-links${menuOpen ? ' open' : ''}`}>
        {menu.map((item) => (
          <li key={item.id}>
            <Link
              to={item.path}
              aria-current={item.id === activeId ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label[lang]}
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
