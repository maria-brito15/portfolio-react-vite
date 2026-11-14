import EditorialPage from '../../components/personal/EditorialPage';
import MusicList from '../../components/personal/MusicList';
import { usePersonalAlbums } from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';

export default function Music() {
  const p = usePersonalText();
  const { state, retry } = usePersonalAlbums();

  return (
    <EditorialPage routeId="pessoal-musica" deck={p.music.deck}>
      <MusicList state={state} retry={retry} />
    </EditorialPage>
  );
}
