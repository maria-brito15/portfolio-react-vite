import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import { TERMINAL_PATH, normalizePath, routes } from '../data/routes';
import { prefersReducedMotion } from '../utils/env';
import {
  contextAfter,
  contextOfHistory,
  findCommand,
  runCommand,
  type CommandContext,
  type NavContext,
} from './commands';
import {
  SessionContext,
  type Entry,
  type RedirectState,
  type TerminalSessionValue,
} from './sessionContext';

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

function readStored(): string[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');

    return Array.isArray(saved)
      ? saved.filter((s): s is string => typeof s === 'string').slice(-MAX_INPUTS)
      : [];
  } catch {
    return [];
  }
}

function store(inputs: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inputs.slice(-MAX_INPUTS)));
  } catch {
    // Sem armazenamento, o histórico vale só enquanto a página estiver aberta.
  }
}

let nextId = 0; // ids únicos das entradas, para as chaves e o progresso

// Monta a entrada de um comando. No replay (histórico restaurado) os efeitos
// não rodam e um redirecionamento aparece já concluído, sem animação.
function buildEntry(id: number, input: string, ctx: CommandContext): Entry | null {
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
        }
      : null,
  };
}

export function TerminalProvider({ children }: { children: ReactNode }) {
  const { lang, toggleLang } = useLanguage();
  const [theme, toggleTheme, setTheme] = useTheme();
  const { path, search, navigate } = useRouter();

  const [inputs, setInputs] = useState<string[]>(readStored);
  const [entry, setEntry] = useState<Entry | null>(() => {
    const last = inputs.at(-1);

    return last
      ? buildEntry(nextId++, last, {
          lang,
          theme,
          history: inputs,
          toggleLang,
          toggleTheme,
          setTheme,
          replay: true,
        })
      : null;
  });
  const [progress, setProgress] = useState(0);
  // Última página com índice aberta (alimenta `2`, `proximo`, `anterior`).
  // Restaurada do histórico sem rodar efeitos.
  const [context, setContext] = useState<NavContext | null>(() => contextOfHistory(inputs));

  // Carregamento em andamento (um só por vez) e o timer que o move.
  const loadingRef = useRef<{ to: string; id: number | null } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  // Sem timers soltos: nada fica rodando depois que o provedor sai de cena.
  useEffect(() => stopTimer, [stopTimer]);

  const setRedirectStatus = useCallback(
    (id: number | null, status: RedirectState['status'], extra?: Partial<RedirectState>) => {
      setEntry((e) =>
        e?.id === id ? { ...e, redirect: { ...e.redirect, ...extra, status } as RedirectState } : e,
      );
    },
    [],
  );

  const finish = useCallback(
    (to: string, id: number | null) => {
      stopTimer();
      loadingRef.current = null;
      setRedirectStatus(id, 'done');
      navigate(to);
    },
    [navigate, setRedirectStatus, stopTimer],
  );

  // Fluxo "abrindo /pagina… [■■■□□□□□] 48%" → "pronto ✓" → navigate().
  const startRedirect = useCallback(
    (to: string, id: number | null) => {
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

    const onKeyDown = (event: KeyboardEvent) => {
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
    (raw: string) => {
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
        context,
        toggleLang,
        toggleTheme,
        setTheme,
        replay: false,
      });

      setContext(contextAfter(input, context));
      setEntry(next);
      if (next?.redirect) {
        const { to } = next.redirect;

        // Ir para a página em que já está não precisa de carregamento.
        if (normalizePath(to) === normalizePath(path) && !to.includes('#')) {
          setEntry({ ...next, redirect: { ...next.redirect, status: 'done', direct: true } });
          navigate(to);
        } else {
          startRedirect(to, id);
        }
      }

      return true;
    },
    [
      inputs,
      context,
      lang,
      theme,
      toggleLang,
      toggleTheme,
      setTheme,
      startRedirect,
      navigate,
      path,
    ],
  );

  // Ctrl+C digitando: mostra o texto com ^C, como um shell.
  const interrupt = useCallback((text: string) => {
    if (loadingRef.current) return;
    setEntry({ id: nextId++, input: `${text}^C`, output: () => null, redirect: null });
  }, []);

  // "abrir página própria": roda o mesmo fluxo de carregamento de `cd <página>`.
  const openPage = startRedirect;

  // /terminal?cmd=academico: o terminal já abre com o comando executado (visão em
  // terminal). Só comandos que têm página dedicada; o parâmetro some da URL em
  // seguida. O endereço antigo /?cmd=academico (quando a home era o terminal)
  // continua valendo: é redirecionado para /terminal?cmd=academico.
  const handled = useRef('');

  useEffect(() => {
    if (!search || !new URLSearchParams(search).has('cmd')) return;
    if (normalizePath(path) === '/') {
      navigate(TERMINAL_PATH + search, { replace: true });

      return;
    }
    if (normalizePath(path) !== TERMINAL_PATH || handled.current === search) return;
    handled.current = search;

    const cmd = new URLSearchParams(search).get('cmd');
    // A URL é um sistema externo: executar o comando é a reação a ela.
    // "curriculo competencias": o 1º termo precisa ser o comando de uma página.
    const first = cmd?.split(/\s+/)[0];

    if (first && routes.some((r) => r.command === first) && findCommand(first)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      execute(cmd as string);
    }
    navigate(TERMINAL_PATH, { replace: true });
  }, [path, search, execute, navigate]);

  const value = useMemo<TerminalSessionValue>(
    () => ({ entry, inputs, context, progress, busy, execute, interrupt, openPage, cancel }),
    [entry, inputs, context, progress, busy, execute, interrupt, openPage, cancel],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
