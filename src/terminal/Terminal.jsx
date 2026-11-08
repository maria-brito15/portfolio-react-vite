import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import { complete, quickCommands, runCommand } from './commands';

const STORAGE_KEY = 'portfolio-terminal';
const MAX_ENTRIES = 50;

function readStored() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved)
      ? saved.filter((s) => typeof s === 'string').slice(-MAX_ENTRIES)
      : [];
  } catch {
    return [];
  }
}

function store(inputs) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inputs.slice(-MAX_ENTRIES)));
  } catch {
    // Sem armazenamento, o histórico vale só enquanto a página estiver aberta.
  }
}

let nextId = 0;

// Refaz a saída do histórico salvo sem repetir efeitos (navegar, trocar tema…).
function replay(inputs, ctx) {
  let entries = [];
  inputs.forEach((input, i) => {
    const result = runCommand(input, { ...ctx, replay: true, history: inputs.slice(0, i + 1) });
    entries = result.clear ? [] : [...entries, { id: nextId++, input, output: result.output }];
  });
  return entries;
}

export function Prompt() {
  return (
    <span className="t-prompt" aria-hidden="true">
      <span className="t-user">visitante@mariab.dev</span>
      <span className="t-dim">:</span>
      <span className="t-path">~</span>
      <span className="t-dim">$</span>
    </span>
  );
}

export default function Terminal({ content }) {
  const { lang, toggleLang } = useLanguage();
  const [theme, toggleTheme] = useTheme();
  const { navigate } = useRouter();
  const inputId = useId();
  const inputRef = useRef(null);
  const screenRef = useRef(null);

  const [inputs, setInputs] = useState(readStored);
  const [entries, setEntries] = useState(() =>
    replay(inputs, { lang, theme, navigate, toggleLang, toggleTheme }),
  );
  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState(null); // posição ao navegar no histórico
  const [suggestions, setSuggestions] = useState(null);

  // Mantém a última linha visível dentro do terminal (sem rolar a página).
  useEffect(() => {
    const screen = screenRef.current;
    if (screen) screen.scrollTop = screen.scrollHeight;
  }, [entries, suggestions]);

  function execute(raw) {
    const input = raw.trim();
    setValue('');
    setCursor(null);
    setSuggestions(null);
    if (!input) {
      setEntries((list) => [...list, { id: nextId++, input: '', output: () => null }]);
      return;
    }
    const history = [...inputs, input];
    setInputs(history);
    store(history);
    const result = runCommand(input, {
      lang,
      theme,
      history,
      navigate,
      toggleLang,
      toggleTheme,
      replay: false,
    });
    setEntries((list) =>
      result.clear ? [] : [...list, { id: nextId++, input, output: result.output }],
    );
  }

  function onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      execute(value);
    } else if (event.key === 'Tab') {
      if (!value) return; // Tab sem texto mantém a navegação por teclado
      event.preventDefault();
      const result = complete(value, lang);
      if (Array.isArray(result)) setSuggestions(result);
      else {
        setValue(result);
        setSuggestions(null);
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (!inputs.length) return;
      event.preventDefault();
      const up = event.key === 'ArrowUp';
      let next = cursor ?? inputs.length;
      next = up ? Math.max(0, next - 1) : next + 1;
      if (next >= inputs.length) {
        setCursor(null);
        setValue('');
      } else {
        setCursor(next);
        setValue(inputs[next]);
      }
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      execute('clear');
    } else if (event.key === 'c' && event.ctrlKey && !window.getSelection()?.toString()) {
      event.preventDefault();
      setEntries((list) => [...list, { id: nextId++, input: `${value}^C`, output: () => null }]);
      setValue('');
    }
  }

  // Clicar em qualquer ponto vazio do terminal foca a linha de comando,
  // sem atrapalhar a seleção de texto nem os links.
  function focusInput(event) {
    if (event.target.closest('a, button, input')) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <section className="hero hero-terminal" id="inicio" aria-labelledby="inicio-title">
      <div className="glow" aria-hidden="true"></div>
      <div className="term-wrap">
        <div className="term" onClick={focusInput}>
          <div className="term-bar">
            <span className="term-dots" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
            <span className="term-title">visitante@mariab.dev: ~</span>
            <span className="term-badge">{content.tag}</span>
          </div>
          <div className="term-screen" ref={screenRef}>
            <header className="term-banner">
              <p className="t-dim">{content.terminal.boot}</p>
              <h1 id="inicio-title" className="term-name">
                <span className="t-gradient">{content.terminal.name}</span>
              </h1>
              <p className="term-roles">
                {content.terminal.roles.map((role, i) => (
                  <span key={role}>
                    {i > 0 && <span className="t-dim"> · </span>}
                    {role}
                  </span>
                ))}
              </p>
              <p className="term-sub">{content.sub}</p>
              <p className="t-dim">{content.terminal.hint}</p>
            </header>

            <div className="term-log" aria-live="polite">
              {entries.map((entry) => (
                <div className="term-entry" key={entry.id}>
                  <p className="term-line">
                    <Prompt />
                    <span className="t-input">{entry.input}</span>
                  </p>
                  {entry.output(lang)}
                </div>
              ))}
              {suggestions && (
                <p className="t-suggest">
                  {suggestions.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </p>
              )}
            </div>

            <form
              className="term-line term-input-line"
              onSubmit={(event) => {
                event.preventDefault();
                execute(value);
              }}
            >
              <label htmlFor={inputId} className="sr-only">
                {content.terminal.inputLabel}
              </label>
              <Prompt />
              <input
                id={inputId}
                ref={inputRef}
                className="term-input"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setSuggestions(null);
                }}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="send"
                placeholder={entries.length ? '' : content.terminal.placeholder}
              />
            </form>
          </div>
        </div>

        <div className="term-quick" role="group" aria-label={content.terminal.quickLabel}>
          {quickCommands[lang].map((cmd) => (
            <button type="button" key={cmd} onClick={() => execute(cmd)}>
              <span aria-hidden="true">$ </span>
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
