import BooksShelves from '../../components/personal/BooksShelves';
import PageHead from '../../components/personal/PageHead';
import SiteShell from '../../components/shell/SiteShell';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { usePersonalBooks } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Books() {
  const { t } = useLanguage();
  const { state, retry } = usePersonalBooks();

  useDocumentMeta('pessoal-livros');

  return (
    <SiteShell routeId="pessoal-livros">
      <section className="sec info-page">
        <PageHead routeId="pessoal-livros" deck={t.personal.books.deck} />
        <BooksShelves state={state} retry={retry} />
      </section>
    </SiteShell>
  );
}
