import EditorialPage from '../../components/personal/EditorialPage';
import MusicList from '../../components/personal/MusicList';
import MusicProfile from '../../components/personal/MusicProfile';
import { usePersonalAlbums } from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';

export default function Music() {
  const p = usePersonalText();
  const { state, retry } = usePersonalAlbums();

  return (
    <EditorialPage routeId="pessoal-musica" deck={p.music.deck}>
      <MusicProfile />
      <MusicList state={state} retry={retry} hideEmpty />
    </EditorialPage>
  );
}
