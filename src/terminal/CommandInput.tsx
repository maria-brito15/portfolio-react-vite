import { useId, type RefObject } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Prompt from './Prompt';
import { useTerminal } from './useTerminal';

// Linha de comando única do site: usada pelo terminal da página inicial
// (variant="terminal") e pela barra de comandos fixa (variant="bar").
// Mesmas teclas, mesmas sugestões, mesma sessão.
export default function CommandInput({
  label,
  placeholder,
  variant = 'terminal',
  inputRef,
  onSubmit,
}: {
  label: string;
  placeholder?: string;
  variant?: 'terminal' | 'bar';
  inputRef?: RefObject<HTMLInputElement | null>;
  onSubmit?: (input: string) => void;
}) {
  const { t } = useLanguage();
  const inputId = useId();
  const term = useTerminal({ onSubmit });

  return (
    <form
      className={`term-line cmd-input cmd-input--${variant}`}
      onSubmit={(event) => {
        event.preventDefault();
        term.submit();
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Prompt />
      <input
        id={inputId}
        ref={inputRef}
        className="term-input"
        {...term.inputProps}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        enterKeyHint="send"
        placeholder={placeholder}
      />
      {term.suggestions && (
        <ul className="t-suggest cmd-suggest" aria-label={t.cmdbar.suggestions}>
          {term.suggestions.map((option) => (
            <li key={option}>
              <button type="button" onClick={() => term.pick(option)}>
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
