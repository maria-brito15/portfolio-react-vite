import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import { Link } from '../../router';

// Ação em "colchetes" — `[ ver no terminal ]` — usada na barra de título da
// Window e no fim das saídas do terminal. Com `to` é um link (navega);
// sem `to` é um botão. `active` marca a visão que já está na tela.
interface ActionLinkProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  to?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  active?: boolean;
  children?: ReactNode;
}

export default function ActionLink({
  to,
  onClick,
  active = false,
  className = '',
  ...rest
}: ActionLinkProps) {
  const cls = ['action-link', active && 'is-active', className].filter(Boolean).join(' ');

  if (to) {
    return <Link to={to} className={cls} onClick={onClick} {...(rest as object)} />;
  }

  return <button type="button" className={cls} aria-pressed={active} onClick={onClick} {...rest} />;
}
