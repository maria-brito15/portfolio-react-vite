import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import { isHomeAnchor, normalizePath, routes } from '../data/routes';
import { findCommand, runCommand } from './commands';
import { SessionContext } from './sessionContext';

// Sessão única do terminal, compartilhada pelo terminal da página inicial e
// pela barra de comandos de todas as páginas: o mesmo histórico de comandos
// (↑/↓, `historico`), a mesma saída e o mesmo carregamento antes de redirecionar.
//
// A tela guarda só a ÚLTIMA entrada (comando + saída): cada comando limpa a
// anterior, como um `clear` automático. O histórico digitado continua inteiro.

const STORAGE_KEY = 'portfolio-terminal';
const MAX_INPUTS = 50;

// Carregamento: 16 passos de 50 ms (800 ms), mais ~100 ms mostrando "pronto ✓".
export const LOAD_STEPS = 16;
const LOAD_TICK_MS = 50;
const LOAD_DONE_TICKS = LOAD_STEPS + 2;
const REDUCED_MOTION_MS = 300;

export const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readStored() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved)
      ? saved.filter((s) => typeof s === 'string').slice(-MAX_INPUTS)
      : [];
  } catch {
    return [];
  }
}

function store(inputs) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inputs.slice(-MAX_INPUTS)));
  } catch {
    // Sem armazenamento, o histórico vale só enquanto a página estiver aberta.
  }
}

let nextId = 0; // ids únicos das entradas, para as chaves e o progresso

// Monta a entrada de um comando. No replay (histórico restaurado) os efeitos
// não rodam e um redirecionamento aparece já concluído, sem animação.
function buildEntry(id, input, ctx) {
  const result = runCommand(input, ctx);
  if (result.clear) return null;
  return {
    id,
    input,
    output: result.output,
    redirect: result.redirect
      ? {
          to: result.redirect,
          status: ctx.replay ? 'done' : 'idle',
          direct: isHomeAnchor(result.redirect),
        }
      : null,
  };
}

export function TerminalProvider({ children }) {
  const { lang, toggleLang } = useLanguage();
  const [theme, toggleTheme] = useTheme();
  const { path, search, navigate } = useRouter();

  const [inputs, setInputs] = useState(readStored);
  const [entry, setEntry] = useState(() => {
    const last = inputs.at(-1);
    return last
      ? buildEntry(nextId++, last, {
          lang,
          theme,
          history: inputs,
          toggleLang,
          toggleTheme,
          replay: true,
        })
      : null;
  });
  const [progress, setProgress] = useState(0);

  // Carregamento em andamento (um só por vez) e o timer que o move.
  const loadingRef = useRef(null);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  // Sem timers soltos: nada fica rodando depois que o provedor sai de cena.
  useEffect(() => stopTimer, [stopTimer]);

  const setRedirectStatus = useCallback((id, status, extra) => {
    setEntry((e) => (e?.id === id ? { ...e, redirect: { ...e.redirect, ...extra, status } } : e));
  }, []);

  const finish = useCallback(
    (to, id) => {
      stopTimer();
      loadingRef.current = null;
      setRedirectStatus(id, 'done');
      navigate(to);
    },
    [navigate, setRedirectStatus, stopTimer],
  );

  // Fluxo "abrindo /pagina… [■■■□□□□□] 48%" → "pronto ✓" → navigate().
  const startRedirect = useCallback(
    (to, id) => {
      if (loadingRef.current) return; // sem navegação duplicada
      stopTimer();
      loadingRef.current = { to, id };
      setProgress(0);
      if (prefersReducedMotion()) {
        setRedirectStatus(id, 'loading', { to, reduced: true });
        timerRef.current = setTimeout(() => finish(to, id), REDUCED_MOTION_MS);
        return;
      }
      setRedirectStatus(id, 'loading', { to, reduced: false });
      let tick = 0;
      timerRef.current = setInterval(() => {
        tick += 1;
        setProgress(Math.min(1, tick / LOAD_STEPS));
        if (tick >= LOAD_DONE_TICKS) finish(to, id);
      }, LOAD_TICK_MS);
    },
    [finish, setRedirectStatus, stopTimer],
  );

  const cancel = useCallback(() => {
    const current = loadingRef.current;
    if (!current) return;
    stopTimer();
    loadingRef.current = null;
    setRedirectStatus(current.id, 'cancelled');
  }, [setRedirectStatus, stopTimer]);

  const busy = entry?.redirect?.status === 'loading';

  // Esc ou Ctrl+C cancelam o carregamento de onde estiver o foco.
  useEffect(() => {
    if (!busy) return;
    const onKeyDown = (event) => {
      const copy = event.key.toLowerCase() === 'c' && event.ctrlKey;
      if (event.key === 'Escape' || (copy && !window.getSelection()?.toString())) {
        event.preventDefault();
        cancel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, cancel]);

  const execute = useCallback(
    (raw) => {
      const input = raw.trim();
      if (!input || loadingRef.current) return false;
      const history = [...inputs, input].slice(-MAX_INPUTS);
      setInputs(history);
      store(history);
      const id = nextId++;
      const next = buildEntry(id, input, {
        lang,
        theme,
        history,
        toggleLang,
        toggleTheme,
        replay: false,
      });
      setEntry(next);
      if (next?.redirect) {
        const { to } = next.redirect;
        // Âncoras da própria home (e "ir para a home" estando nela) não precisam
        // de carregamento; qualquer outra página passa pelo fluxo.
        if (isHomeAnchor(to) || (to === '/' && normalizePath(path) === '/')) {
          setEntry({ ...next, redirect: { ...next.redirect, status: 'done' } });
          navigate(to);
        } else {
          startRedirect(to, id);
        }
      }
      return true;
    },
    [inputs, lang, theme, toggleLang, toggleTheme, startRedirect, navigate, path],
  );

  // Ctrl+C digitando: mostra o texto com ^C, como um shell.
  const interrupt = useCallback((text) => {
    if (loadingRef.current) return;
    setEntry({ id: nextId++, input: `${text}^C`, output: () => null, redirect: null });
  }, []);

  // "abrir página própria": roda o mesmo fluxo de carregamento de `cd <página>`.
  const openPage = startRedirect;

  // /?cmd=academico: a home já abre com o comando executado (visão em terminal).
  // Só comandos que têm página dedicada; o parâmetro some da URL em seguida.
  const handled = useRef('');
  useEffect(() => {
    if (path !== '/' || !search || handled.current === search) return;
    handled.current = search;
    const cmd = new URLSearchParams(search).get('cmd');
    // A URL é um sistema externo: executar o comando é a reação a ela.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cmd && routes.some((r) => r.command === cmd) && findCommand(cmd)) execute(cmd);
    navigate('/', { replace: true });
  }, [path, search, execute, navigate]);

  const value = useMemo(
    () => ({ entry, inputs, progress, busy, execute, interrupt, openPage, cancel }),
    [entry, inputs, progress, busy, execute, interrupt, openPage, cancel],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
