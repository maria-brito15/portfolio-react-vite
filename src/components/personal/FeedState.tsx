import type { ReactNode } from 'react';
import type { PersonalFeed } from '../../data/personal/types';
import { useLanguage } from '../../i18n/LanguageContext';
import type { PersonalState } from '../../hooks/usePersonal';

// Carregando e erro (com "tentar de novo") de qualquer fonte (CL-11). Pronto entrega o feed a
// quem chamou; "vazio" e "vencido" ficam com a página, que os mostra junto do resto.
export default function FeedState<T>({
  state,
  retry,
  children,
}: {
  state: PersonalState<T>;
  retry: () => void;
  children: (feed: PersonalFeed<T>) => ReactNode;
}) {
  const { t } = useLanguage();
  const text = t.personal.state;

  if (state.status === 'loading')
    return (
      <p className="pe-state" role="status">
        {text.loading}
      </p>
    );

  if (state.status === 'error')
    return (
      <p className="pe-state" role="alert">
        {text.error}{' '}
        <button type="button" className="btn-o" onClick={retry}>
          {text.retry}
        </button>
      </p>
    );

  return <>{children(state.feed)}</>;
}
