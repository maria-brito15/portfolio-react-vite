// Botão que roda um comando na sessão do terminal (a MESMA do terminal e da
// paleta: nenhum interpretador novo). Com `go`, abre a página do terminal em
// seguida para a saída aparecer lá.
import type { ReactNode } from 'react';
import { useRouter } from '../router';
import { TERMINAL_PATH } from '../data/routes';
import { useTerminalSession } from '../terminal/sessionContext';

export default function RunButton({
  command,
  go = false,
  className = 'run-btn',
  children,
}: {
  command: string;
  go?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const { execute, busy } = useTerminalSession();
  const { navigate } = useRouter();

  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={() => {
        if (execute(command) && go) navigate(TERMINAL_PATH);
      }}
    >
      {children ?? (
        <>
          <span aria-hidden="true">$ </span>
          {command}
        </>
      )}
    </button>
  );
}
