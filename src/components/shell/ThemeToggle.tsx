import { useSyncExternalStore } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { DEFAULT_THEME, themeName } from '../../data/themes';
import type { Theme } from '../../types';

// Botão de tema (TD-010, DQ-027): o texto visível é o tema de DESTINO e quem o escolhe é o CSS
// (`html[data-theme]`), então o HTML pré-renderizado serve aos dois temas sem piscar. O nome
// acessível traz o mesmo destino ("Alternar tema: escuro"), senão o axe reprova (WCAG 2.5.3).
// `aria-pressed` (escuro ligado) só entra depois de montar, para o HTML gerado e o primeiro
// desenho do cliente serem iguais.
export default function ThemeToggle() {
  const { lang, t } = useLanguage();
  const [theme, toggle] = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Antes de montar vale o tema padrão, como no HTML gerado (o React não corrige atributo divergente
  // na hidratação); depois, o tema real. O texto visível já segue o `data-theme` pelo CSS.
  const target: Theme = (mounted ? theme : DEFAULT_THEME) === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="theme-btn"
      aria-label={`${t.themeToggle.label}: ${themeName(target, lang)}`}
      aria-pressed={mounted ? theme === 'dark' : undefined}
      onClick={toggle}
    >
      <span className="theme-btn-to-dark">{themeName('dark', lang)}</span>
      <span className="theme-btn-to-light">{themeName('light', lang)}</span>
    </button>
  );
}
