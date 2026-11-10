import type { ComponentProps } from 'react';
import ActionLink from '../ui/ActionLink';
import { useLanguage } from '../../i18n/LanguageContext';

// O par de ações presente em toda saída de terminal e em toda janela de página:
//   [ ver no terminal ]  [ abrir página própria ↗ ]   (visão em terminal)
//   [ ver no terminal ]  [ página própria ]           (página dedicada)
// `view` escolhe os rótulos; `active` diz qual visão está na tela (a ativa fica
// destacada) e, por padrão, é a própria `view`. Num painel fora da home, nenhuma
// das duas está "na tela": `active={null}`.
// Cada ação recebe `to` (navega) ou `onClick`.
type Action = Omit<ComponentProps<typeof ActionLink>, 'active' | 'children'>;
type View = 'terminal' | 'page';

interface ViewActionsProps {
  view: View;
  active?: View | null;
  terminal?: Action;
  page?: Action;
  className?: string;
}

export default function ViewActions({
  view,
  active = view,
  terminal,
  page,
  className = '',
}: ViewActionsProps) {
  const { t } = useLanguage();
  const onTerminal = view === 'terminal';

  return (
    <span className={`view-actions ${className}`.trim()} role="group" aria-label={t.win.views}>
      <ActionLink active={active === 'terminal'} {...terminal}>
        {t.win.viewTerminal}
      </ActionLink>
      <ActionLink active={active === 'page'} {...page}>
        {onTerminal ? `${t.win.openPage} ↗` : t.win.ownPage}
      </ActionLink>
    </span>
  );
}
