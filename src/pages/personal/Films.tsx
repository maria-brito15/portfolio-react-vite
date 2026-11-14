import EditorialPage from '../../components/personal/EditorialPage';
import FilmsDiary from '../../components/personal/FilmsDiary';
import { usePersonalFilms } from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';

export default function Films() {
  const p = usePersonalText();
  const { state, retry } = usePersonalFilms();

  return (
    <EditorialPage routeId="pessoal-filmes" deck={p.films.deck}>
      <FilmsDiary state={state} retry={retry} />
    </EditorialPage>
  );
}
