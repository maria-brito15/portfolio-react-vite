// Paleta de comandos (Ctrl+K): busca páginas e comandos e roda a opção na
// sessão do terminal. Combobox acessível: o foco fica no campo e a opção ativa
// vai em `aria-activedescendant`.
import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTerminalSession } from '../terminal/sessionContext';
import { showCommandOutput } from './shell/commandBarEvents';
import { filterItems, paletteItems, type PaletteItem } from './paletteItems';
import Overlay from './Overlay';

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLanguage();
  const session = useTerminalSession();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo(() => paletteItems(lang), [lang]);
  const results = useMemo(() => filterItems(items, query), [items, query]);
  const current = Math.min(active, results.length - 1);
  const optionId = (item: PaletteItem) => `${listId}-${item.id}`;

  // Fecha primeiro (o foco volta a quem abriu) e roda o mesmo comando do terminal.
  function choose(item: PaletteItem) {
    onClose();
    if (session.execute(item.run)) showCommandOutput();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!results.length) return;
      setActive((current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
    } else if (event.key === 'Enter' && results[current]) {
      event.preventDefault();
      choose(results[current]);
    }
  }

  return (
    <Overlay label={t.overlay.palette} onClose={onClose}>
      <div className="palette">
        <input
          data-autofocus
          type="text"
          className="palette-input"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[current] ? optionId(results[current]) : undefined}
          aria-label={t.overlay.paletteInput}
          placeholder={t.overlay.palettePlaceholder}
          value={query}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        <ul className="palette-list" id={listId} role="listbox" aria-label={t.overlay.palette}>
          {results.map((item, i) => (
            <li
              key={item.id}
              id={optionId(item)}
              role="option"
              aria-selected={i === current}
              className={`palette-item${i === current ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(item)}
            >
              <span className="palette-kind t-dim">
                {item.kind === 'page' ? t.overlay.kindPage : t.overlay.kindCommand}
              </span>
              <span className="t-accent">{item.label}</span>
              <span className="t-dim palette-hint">{item.hint}</span>
            </li>
          ))}
        </ul>
        <p className="palette-foot t-dim" role="status">
          {results.length ? t.overlay.results(results.length) : t.overlay.none}
          <span aria-hidden="true"> · {t.overlay.paletteHint}</span>
        </p>
      </div>
    </Overlay>
  );
}
