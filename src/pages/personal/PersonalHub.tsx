import EditorialPage from '../../components/personal/EditorialPage';
import HubIndex from '../../components/personal/HubIndex';
import {
  usePersonalAlbums,
  usePersonalBooks,
  usePersonalFilms,
  usePersonalTheater,
} from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';

export default function PersonalHub() {
  const p = usePersonalText();
  const books = usePersonalBooks();
  const films = usePersonalFilms();
  const albums = usePersonalAlbums();
  const plays = usePersonalTheater();

  return (
    <EditorialPage routeId="pessoal" kicker={p.hub.kicker} deck={p.hub.deck}>
      <HubIndex books={books.state} films={films.state} albums={albums.state} plays={plays.state} />
    </EditorialPage>
  );
}
