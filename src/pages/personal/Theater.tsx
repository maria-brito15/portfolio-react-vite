import EditorialPage from '../../components/personal/EditorialPage';
import TheaterProfile from '../../components/personal/TheaterProfile';
import TheaterTimeline from '../../components/personal/TheaterTimeline';
import { theaterHasContent } from '../../data/personal/theater';
import { usePersonalTheater } from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';

export default function Theater() {
  const p = usePersonalText();
  const { state, retry } = usePersonalTheater();

  return (
    <EditorialPage routeId="pessoal-teatro" deck={p.theater.deck}>
      <TheaterProfile />
      <TheaterTimeline state={state} retry={retry} hideEmpty={theaterHasContent()} />
    </EditorialPage>
  );
}
