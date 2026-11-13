import FilmsDiary from '../../components/personal/FilmsDiary';
import PageHead from '../../components/personal/PageHead';
import SiteShell from '../../components/shell/SiteShell';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { usePersonalFilms } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Films() {
  const { t } = useLanguage();
  const { state, retry } = usePersonalFilms();

  useDocumentMeta('pessoal-filmes');

  return (
    <SiteShell routeId="pessoal-filmes">
      <section className="sec info-page">
        <PageHead routeId="pessoal-filmes" deck={t.personal.films.deck} />
        <FilmsDiary state={state} retry={retry} />
      </section>
    </SiteShell>
  );
}
