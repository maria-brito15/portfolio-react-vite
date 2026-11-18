import { Link, useRouter } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { normalizePath, pathInLang, routes } from '../../data/routes';
import Menu from './Menu';
import ThemeToggle from './ThemeToggle';
import LanguageSwitch from './LanguageSwitch';

const items = routes.filter((route) => route.menu).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// Cabeçalho (FR-008, TD-010): marca, `<nav>` com os itens `menu: true` na ordem de `order`, tema e
// idioma. A ordem do DOM é a do foco (FR-016): itens, tema, idioma. Em tela estreita tudo isso fica
// no painel do Menu. Provisório (`.next`): a T3.3 faz `git mv` para Header.tsx.
export default function HeaderNext() {
  const { lang, t } = useLanguage();
  const { path } = useRouter();
  const here = normalizePath(path);

  return (
    <header className="hdr">
      <Link to={pathInLang('/', lang)} className="hdr-brand">
        {t.header.brand}
      </Link>
      <Menu>
        <nav aria-label={t.header.nav} className="hdr-nav">
          <ul>
            {items.map((route) => {
              const to = pathInLang(route.path, lang);

              return (
                <li key={route.id}>
                  <Link to={to} aria-current={here === normalizePath(to) ? 'page' : undefined}>
                    {route.label[lang]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <ThemeToggle />
        <LanguageSwitch />
      </Menu>
    </header>
  );
}
