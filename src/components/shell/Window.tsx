// A "janelinha" de todo o site: barra de título (três bolinhas, caminho do
// tipo `visitante@mariab.dev: ~/academico`, ações opcionais e badge) e o
// conteúdo. O terminal da home e as páginas dedicadas usam o mesmo componente.
import type { MouseEvent, ReactNode } from 'react';

interface WindowProps {
  title?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  variant?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}

export default function Window({
  title,
  badge,
  actions,
  variant,
  className = '',
  onClick, // usado pelo terminal: clicar na janela foca a linha de comando
  children,
}: WindowProps) {
  const cls = ['win', variant && `win--${variant}`, variant === 'terminal' && 'term', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} onClick={onClick}>
      <div className="win-bar">
        <span className="win-dots" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </span>
        <span className="win-title">{title}</span>
        {actions}
        {badge && <span className="win-badge">{badge}</span>}
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}
