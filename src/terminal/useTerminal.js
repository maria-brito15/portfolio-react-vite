import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { complete } from './commands';
import { useTerminalSession } from './sessionContext';

// Estado de UMA linha de comando (texto, posição no histórico, sugestões) e
// suas teclas: Enter executa, Tab completa, ↑/↓ percorrem o histórico, Ctrl+L
// limpa, Ctrl+C interrompe, Esc fecha as sugestões. Quem executa e guarda o
// histórico é a sessão compartilhada, então o terminal da home e a barra de
// comandos das outras páginas se comportam exatamente igual.
export function useTerminal({ onSubmit } = {}) {
  const session = useTerminalSession();
  const { lang } = useLanguage();
  const { inputs, busy } = session;

  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState(null); // posição ao navegar no histórico
  const [suggestions, setSuggestions] = useState(null);

  function reset() {
    setValue('');
    setCursor(null);
    setSuggestions(null);
  }

  function submit(raw = value) {
    const ran = session.execute(raw);
    reset();
    if (ran) onSubmit?.(raw.trim());
  }

  function pick(option) {
    setValue((current) => {
      const hasArgument = /\s/.test(current.trim());
      return hasArgument ? current.replace(/\S*$/, option) : `${option} `;
    });
    setSuggestions(null);
  }

  function onKeyDown(event) {
    if (busy) return; // Esc / Ctrl+C são tratados pela sessão
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    } else if (event.key === 'Tab') {
      if (!value) return; // Tab sem texto mantém a navegação por teclado
      event.preventDefault();
      const result = complete(value, lang);
      if (Array.isArray(result)) setSuggestions(result);
      else {
        setValue(result);
        setSuggestions(null);
      }
    } else if (event.key === 'Escape' && suggestions) {
      event.stopPropagation();
      setSuggestions(null);
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
      submit('clear');
    } else if (event.key === 'c' && event.ctrlKey && !window.getSelection()?.toString()) {
      event.preventDefault();
      session.interrupt(value);
      reset();
    }
  }

  return {
    value,
    suggestions,
    busy,
    submit,
    pick,
    inputProps: {
      value,
      readOnly: busy,
      'aria-busy': busy || undefined,
      onChange: (event) => {
        setValue(event.target.value);
        setSuggestions(null);
      },
      onKeyDown,
    },
  };
}
