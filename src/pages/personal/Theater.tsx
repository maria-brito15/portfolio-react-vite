import EditorialPage from '../../components/personal/EditorialPage';
import TheaterTimeline from '../../components/personal/TheaterTimeline';
import { usePersonalTheater } from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';

export default function Theater() {
  const p = usePersonalText();
  const { state, retry } = usePersonalTheater();

  return (
    <EditorialPage routeId="pessoal-teatro" deck={p.theater.deck}>
      <TheaterTimeline state={state} retry={retry} />
    </EditorialPage>
  );
}
