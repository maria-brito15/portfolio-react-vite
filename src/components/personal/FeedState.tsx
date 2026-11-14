import type { ReactNode } from 'react';
import type { PersonalFeed } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { ErrorState, Loading } from './States';

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
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <ErrorState onRetry={retry} />;

  return <>{children(state.feed)}</>;
}
