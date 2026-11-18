import { useSyncExternalStore } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { themeName } from '../../data/themes';

// Botão de tema (TD-010): o nome acessível é fixo; o texto visível é o tema de DESTINO e quem o
// escolhe é o CSS (`html[data-theme]`), então o HTML pré-renderizado serve aos dois temas sem
// piscar. `aria-pressed` (escuro ligado) só entra depois de montar, para o HTML gerado e o primeiro
// desenho do cliente serem iguais.
export default function ThemeToggle() {
  const { lang, t } = useLanguage();
  const [theme, toggle] = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <button
      type="button"
      className="theme-btn"
      aria-label={t.themeToggle.label}
      aria-pressed={mounted ? theme === 'dark' : undefined}
      onClick={toggle}
    >
      <span className="theme-btn-to-dark">{themeName('dark', lang)}</span>
      <span className="theme-btn-to-light">{themeName('light', lang)}</span>
    </button>
  );
}
