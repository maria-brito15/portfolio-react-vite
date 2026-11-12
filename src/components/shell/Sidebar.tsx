import { useEffect, useRef } from 'react';
import { Link, useRouter } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { NAV_GROUPS, findPageByPath, navRoutes } from '../../data/routes';
import { byPersona, isPick } from '../../data/personas';
import { usePersona } from '../../hooks/usePersona';
import { GROUP_TONE } from '../../data/tones';
import { openShortcuts } from './commandBarEvents';

// Navegação principal do site: grupos recolhíveis montados de routes.ts (uma
// rota com `group` aparece aqui; nada é repetido à mão). Em tela larga é uma
// coluna fixa; em tela estreita vira uma gaveta aberta pelo botão do Header.
// Todos os links são links comuns (teclado e leitores de tela), nunca janelas.
export default function Sidebar({
  id,
  open,
  onClose,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
}) {
  const { lang, t } = useLanguage();
  const { path } = useRouter();
  const ref = useRef<HTMLElement>(null);
  const { persona } = usePersona();
  const page = findPageByPath(path);
  // O estudo de caso (rota oculta) ilumina "Projetos", a rota-mãe; `/r/<persona>` é a home.
  const activeId = page?.persona ? 'home' : (page?.parent ?? page?.id);

  // Gaveta aberta: o foco vai para o primeiro link, Tab circula só dentro dela, Esc fecha
  // e o foco volta ao botão que a abriu.
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement;

    ref.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();

        return;
      }
      if (event.key !== 'Tab') return;

      const items = [...(ref.current?.querySelectorAll<HTMLElement>('a[href], summary') ?? [])];

      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !ref.current?.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !ref.current?.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <>
      {open && <div className="sidebar-scrim" aria-hidden="true" onClick={onClose} />}
      <nav
        ref={ref}
        id={id}
        className={`sidebar${open ? ' is-open' : ''}`}
        aria-label={t.ws.sidebar.label}
      >
        {NAV_GROUPS.map((group) => {
          // A lente da persona só reordena dentro do grupo e marca; nada some.
          const items = byPersona(navRoutes(group), persona, (r) => r.id);

          if (!items.length) return null;

          return (
            <details key={group} className="sidebar-group" data-tone={GROUP_TONE[group]} open>
              <summary>{t.ws.groups[group]}</summary>
              <ul>
                {items.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={r.path}
                      className={`sidebar-link${r.id === activeId ? ' is-active' : ''}`}
                      aria-current={r.id === activeId ? 'page' : undefined}
                      title={r.desc?.[lang]}
                      data-pick={isPick(persona, r.id) || undefined}
                    >
                      {r.label[lang]}
                      {isPick(persona, r.id) && (
                        <span className="sr-only"> ({t.persona.highlight})</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
        <button type="button" className="sidebar-shortcuts" onClick={openShortcuts}>
          <kbd aria-hidden="true">?</kbd> {t.ws.sidebar.shortcuts}
        </button>
      </nav>
    </>
  );
}
