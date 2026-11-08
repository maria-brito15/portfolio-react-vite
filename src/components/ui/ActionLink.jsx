import { Link } from '../../router';

// Ação em "colchetes" — `[ ver no terminal ]` — usada na barra de título da
// Window e no fim das saídas do terminal. Com `to` é um link (navega);
// sem `to` é um botão. `active` marca a visão que já está na tela.
export default function ActionLink({ to, onClick, active = false, className = '', ...rest }) {
  const cls = ['action-link', active && 'is-active', className].filter(Boolean).join(' ');
  if (to) {
    return <Link to={to} className={cls} onClick={onClick} {...rest} />;
  }
  return <button type="button" className={cls} aria-pressed={active} onClick={onClick} {...rest} />;
}
