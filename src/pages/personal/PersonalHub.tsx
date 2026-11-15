import EditorialPage from '../../components/personal/EditorialPage';
import HubIndex from '../../components/personal/HubIndex';
import {
  usePersonalAlbums,
  usePersonalBooks,
  usePersonalFilms,
  usePersonalTheater,
} from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';
import NotebookPersonal from '../../components/notebook/NotebookPersonal';
import { CADERNO_V2 } from '../../config';

export default function PersonalHub() {
  return CADERNO_V2 ? <NotebookHub /> : <LegacyHub />;
}

// Caderno, revisão R1: feed de atividade + grades de pôsteres no lugar do índice em lista. A moldura
// (cabeça editorial, h1 e título do documento) é a mesma.
function NotebookHub() {
  const p = usePersonalText();

  return (
    <EditorialPage routeId="pessoal" kicker={p.hub.kicker} deck={p.hub.deck}>
      <NotebookPersonal />
    </EditorialPage>
  );
}

function LegacyHub() {
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
