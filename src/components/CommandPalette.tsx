// Paleta de comandos (Ctrl+K): busca páginas, projetos, jogos, habilidades e
// comandos, agrupados por categoria. Páginas, projetos e comandos rodam na
// sessão do terminal (o mesmo interpretador); os demais destinos abrem direto.
// Combobox acessível: o foco fica no campo e a opção ativa vai em
// `aria-activedescendant`.
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useRouter } from '../router';
import { useTerminalSession } from '../terminal/sessionContext';
import { showCommandOutput } from './shell/commandBarEvents';
import { filterItems, matchRanges, paletteItems, type PaletteItem } from './paletteItems';
import { usePersona } from '../hooks/usePersona';
import Overlay from './Overlay';

// Destaca no nome o que a busca casou (sem acento nem caixa).
function highlight(text: string, query: string) {
  const parts: ReactNode[] = [];
  let at = 0;

  for (const [start, end] of matchRanges(text, query)) {
    if (start < at) continue;
    parts.push(text.slice(at, start), <mark key={start}>{text.slice(start, end)}</mark>);
    at = end;
  }

  parts.push(text.slice(at));

  return parts;
}

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLanguage();
  const session = useTerminalSession();
  const { navigate } = useRouter();
  const { persona } = usePersona();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo(() => paletteItems(lang), [lang]);
  const results = useMemo(() => filterItems(items, query, persona?.id), [items, query, persona]);
  const current = Math.min(active, results.length - 1);
  const optionId = (item: PaletteItem) => `${listId}-${item.id}`;

  // A opção ativa (setas) acompanha a rolagem da lista.
  const activeId = results[current] ? optionId(results[current]) : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  // Fecha primeiro (o foco volta a quem abriu); depois vai ao destino ou roda o
  // mesmo comando do terminal.
  function choose(item: PaletteItem) {
    onClose();
    if (item.to) navigate(item.to);
    else if (item.run && session.execute(item.run)) showCommandOutput();
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
            <Fragment key={item.id}>
              {item.kind !== results[i - 1]?.kind && (
                <li role="presentation" className="palette-group t-dim">
                  {t.ws.palette.groups[item.kind]}
                </li>
              )}
              <li
                id={optionId(item)}
                role="option"
                aria-selected={i === current}
                className={`palette-item${i === current ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
              >
                <span className="t-accent">{highlight(item.label, query)}</span>
                <span className="t-dim palette-hint">{item.hint}</span>
              </li>
            </Fragment>
          ))}
        </ul>
        <p className="palette-foot t-dim" role="status">
          {results.length ? t.overlay.results(results.length) : t.overlay.none}
          {!results.length && <span> · {t.ws.palette.emptyHint}</span>}
          {persona && results.length > 0 && (
            <span> · {t.ws.palette.sortedFor(persona.label[lang])}</span>
          )}
          <span aria-hidden="true"> · {t.overlay.paletteHint}</span>
        </p>
      </div>
    </Overlay>
  );
}
