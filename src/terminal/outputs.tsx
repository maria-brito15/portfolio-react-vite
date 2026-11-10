// Peças compartilhadas pelas saídas dos comandos: links externos, links de
// página (que passam pelo carregamento), o par de ações "ver no terminal /
// abrir página própria" e a linha de progresso do redirecionamento.
import { createContext, useContext, type ReactNode } from 'react';
import { Link, useRouter, type LinkProps } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { normalizePath, routeById, terminalUrl, type Route } from '../data/routes';
import { sectionCommand, targetPath, type Section } from '../data/sections';
import ViewActions from '../components/shell/ViewActions';
import { useTerminalSession, type RedirectState } from './sessionContext';

export const Ext = ({ href, children }: { href: string; children?: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export const Cmd = ({ children }: { children?: ReactNode }) => (
  <span className="t-cmd">{children}</span>
);

// Id da entrada que está sendo desenhada: o link de página e o botão "abrir
// página própria" precisam dele para mostrar o progresso na própria saída.
export const EntryContext = createContext<number | null>(null);

// Link para outra página dentro de uma saída: mostra o carregamento antes de
// navegar.
export function TermLink({ to, onClick, ...rest }: LinkProps) {
  const session = useTerminalSession();
  const entryId = useContext(EntryContext);

  if (!session || entryId == null) return <Link to={to} {...rest} />;

  return (
    <Link
      to={to}
      onClick={(event) => {
        onClick?.(event);

        const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

        if (event.defaultPrevented || event.button !== 0 || modified) return;
        event.preventDefault();
        session.openPage(to, entryId);
      }}
      {...rest}
    />
  );
}

// `[ ver no terminal ]  [ abrir página própria ↗ ]` no fim da saída de um
// comando que tem página dedicada. Na home, "ver no terminal" é a visão atual;
// em outra página ele leva à home com o comando já executado (/?cmd=…).
export function ActionLine({ routeId, section }: { routeId: string; section?: Section }) {
  const route = routeById(routeId) as Route;
  const { path } = useRouter();
  const session = useTerminalSession();
  const entryId = useContext(EntryContext);
  const onHome = normalizePath(path) === '/';

  const terminal = onHome
    ? { onClick: () => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' }) }
    : { to: terminalUrl(route, sectionCommand(route, section)) };
  const page = { onClick: () => session.openPage(targetPath(route, section), entryId) };

  return (
    <p className="t-actions">
      <ViewActions
        view="terminal"
        active={onHome ? 'terminal' : null}
        terminal={terminal}
        page={page}
      />
    </p>
  );
}

const BAR_CELLS = 8;

export const progressBar = (progress: number) => {
  const filled = Math.round(progress * BAR_CELLS);

  return `[${'■'.repeat(filled)}${'□'.repeat(BAR_CELLS - filled)}] ${Math.round(progress * 100)}%`;
};

// Estado do redirecionamento da entrada: carregando, concluído ou cancelado.
// O texto animado é `aria-hidden`; leitores de tela recebem só o texto fixo,
// em vez de dezenas de atualizações por segundo.
export function RedirectLine({
  redirect,
  progress,
}: {
  redirect: RedirectState | null;
  progress: number;
}) {
  const { t } = useLanguage();

  if (!redirect || redirect.status === 'idle') return null;

  const { to, status, reduced, direct } = redirect;

  if (status === 'cancelled') {
    return (
      <>
        <p className="t-dim">^C</p>
        <p className="t-err">{t.term.cancelled}</p>
      </>
    );
  }
  if (status === 'loading') {
    return reduced ? (
      <p className="t-dim">{t.term.loading}</p>
    ) : (
      <p className="t-dim t-progress">
        <span aria-hidden="true">
          {t.term.opening(to)} {progressBar(progress)}
          {progress >= 1 && <span className="t-ok"> {t.term.ready}</span>}
        </span>
        <span className="sr-only">{t.term.opening(to)}</span>
        <span className="t-hint"> · {t.term.cancelHint}</span>
      </p>
    );
  }
  if (direct) return <p className="t-dim">{t.term.going(to)}</p>;

  return (
    <p className="t-dim">
      {t.term.opening(to)} <span className="t-ok">{t.term.ready}</span>
    </p>
  );
}
