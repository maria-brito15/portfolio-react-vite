import BooksShelves from '../../components/personal/BooksShelves';
import EditorialPage from '../../components/personal/EditorialPage';
import { usePersonalBooks } from '../../hooks/usePersonal';
import { usePersonalText } from '../../i18n/usePersonalText';

export default function Books() {
  const p = usePersonalText();
  const { state, retry } = usePersonalBooks();

  return (
    <EditorialPage routeId="pessoal-livros" deck={p.books.deck}>
      <BooksShelves state={state} retry={retry} />
    </EditorialPage>
  );
}
