import EditorialHeader from '../../components/personal/EditorialHeader';
import HubIndex from '../../components/personal/HubIndex';
import SiteShell from '../../components/shell/SiteShell';
import { routeById } from '../../data/routes';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import {
  usePersonalAlbums,
  usePersonalBooks,
  usePersonalFilms,
  usePersonalTheater,
} from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PersonalHub() {
  const { lang, t } = useLanguage();
  const books = usePersonalBooks();
  const films = usePersonalFilms();
  const albums = usePersonalAlbums();
  const plays = usePersonalTheater();

  useDocumentMeta('pessoal');

  return (
    <SiteShell routeId="pessoal">
      <section className="sec info-page">
        <EditorialHeader
          kicker={t.personal.hub.kicker}
          title={routeById('pessoal')?.label[lang] ?? ''}
          deck={t.personal.hub.deck}
          tone="amber"
        />
        <HubIndex
          books={books.state}
          films={films.state}
          albums={albums.state}
          plays={plays.state}
        />
      </section>
    </SiteShell>
  );
}
