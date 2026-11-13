import PageHead from '../../components/personal/PageHead';
import TheaterTimeline from '../../components/personal/TheaterTimeline';
import SiteShell from '../../components/shell/SiteShell';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { usePersonalTheater } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Theater() {
  const { t } = useLanguage();
  const { state, retry } = usePersonalTheater();

  useDocumentMeta('pessoal-teatro');

  return (
    <SiteShell routeId="pessoal-teatro">
      <section className="sec info-page">
        <PageHead routeId="pessoal-teatro" deck={t.personal.theater.deck} />
        <TheaterTimeline state={state} retry={retry} />
      </section>
    </SiteShell>
  );
}
