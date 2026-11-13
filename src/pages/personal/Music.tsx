import MusicList from '../../components/personal/MusicList';
import PageHead from '../../components/personal/PageHead';
import SiteShell from '../../components/shell/SiteShell';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { usePersonalAlbums } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Music() {
  const { t } = useLanguage();
  const { state, retry } = usePersonalAlbums();

  useDocumentMeta('pessoal-musica');

  return (
    <SiteShell routeId="pessoal-musica">
      <section className="sec info-page">
        <PageHead routeId="pessoal-musica" deck={t.personal.music.deck} />
        <MusicList state={state} retry={retry} />
      </section>
    </SiteShell>
  );
}
