import { Suspense, lazy } from 'react';
import { isCrawler } from '../utils/env';
import { useTrail } from './TrailProvider';

// O tour só é baixado e montado com a trilha aberta (TR-27), e nunca para robôs de
// busca (TR-26). Fica dentro do provedor do terminal, para poder rodar comandos.
const Tour = lazy(() => import('./Tour'));

export default function TourHost() {
  const { active } = useTrail();

  if (!active || isCrawler()) return null;

  return (
    <Suspense fallback={null}>
      <Tour />
    </Suspense>
  );
}
