import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { findTheme, themes } from '../../data/themes';

// Seletor de "edição" (tema), CD-43: botão + listbox, no padrão da paleta de comandos
// (setas, Home/End, Esc, `aria-activedescendant`). Os nomes continuam em `themes.ts`.
export default function EditionPicker() {
  const { lang, t } = useLanguage();
  const [theme, , setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = findTheme(theme) ?? themes[0];

  const optionId = (index: number) => `${listId}-${themes[index].id}`;

  function openList() {
    setActive(Math.max(0, themes.findIndex((th) => th.id === theme)));
    setOpen(true);
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }

  function choose(index: number) {
    setTheme(themes[index].id);
    close();
  }

  // Clicar fora fecha.
  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', onDown);

    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const last = themes.length - 1;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      }

      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActive((active + 1) % themes.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActive((active - 1 + themes.length) % themes.length);
        break;
      case 'Home':
        event.preventDefault();
        setActive(0);
        break;
      case 'End':
        event.preventDefault();
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(active);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        // Pesquisa pela inicial do nome.
        if (event.key.length === 1) {
          const letter = event.key.toLowerCase();
          const from = themes.findIndex(
            (th, i) => i > active && th.names[lang].toLowerCase().startsWith(letter),
          );
          const wrap = themes.findIndex((th) => th.names[lang].toLowerCase().startsWith(letter));
          const next = from >= 0 ? from : wrap;

          if (next >= 0) setActive(next);
        }
    }
  }

  return (
    <div className="nb-edition" ref={root}>
      <button
        type="button"
        ref={button}
        className="nb-btn nb-edition-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${t.nb.editionLabel}: ${current.names[lang]}`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="nb-edition-label">{t.nb.edition}</span>
        <span className="nb-edition-name">{current.names[lang]}</span>
      </button>
      {open && (
        <ul
          className="nb-edition-list"
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={t.nb.editionLabel}
          aria-activedescendant={optionId(active)}
          ref={(el) => el?.focus({ preventScroll: true })}
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            if (!root.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
          }}
        >
          {themes.map((th, i) => (
            <li
              key={th.id}
              id={optionId(i)}
              role="option"
              aria-selected={th.id === theme}
              className={`nb-edition-opt${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(i)}
            >
              {th.names[lang]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
