import ActionLink from '../ui/ActionLink';
import { useLanguage } from '../../i18n/LanguageContext';

// O par de ações presente em toda saída de terminal e em toda janela de página:
//   [ ver no terminal ]  [ abrir página própria ↗ ]   (visão em terminal)
//   [ ver no terminal ]  [ página própria ]           (página dedicada)
// `view` diz qual das duas visões está na tela (a ativa fica destacada).
// Cada ação recebe `to` (navega) ou `onClick`.
export default function ViewActions({ view, terminal, page, className = '' }) {
  const { t } = useLanguage();
  const onTerminal = view === 'terminal';
  return (
    <span className={`view-actions ${className}`.trim()} role="group" aria-label={t.win.views}>
      <ActionLink active={onTerminal} {...terminal}>
        {t.win.viewTerminal}
      </ActionLink>
      <ActionLink active={!onTerminal} {...page}>
        {onTerminal ? `${t.win.openPage} ↗` : t.win.ownPage}
      </ActionLink>
    </span>
  );
}
