// Casca provisória das páginas do espaço cultural (T-CL4): título e descrição vindos de
// `routes.ts`, dentro do `SiteShell`. O conteúdo de cada página entra nas T-CL6 e T-CL7.
import { useLanguage } from '../../i18n/LanguageContext';
import { routeById } from '../../data/routes';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import SiteShell from '../../components/shell/SiteShell';

export default function PersonalSkeleton({ routeId }: { routeId: string }) {
  const { lang } = useLanguage();
  const route = routeById(routeId);

  useDocumentMeta(routeId);

  return (
    <SiteShell routeId={routeId}>
      <section className="sec info-page">
        <h1>{route?.label[lang]}</h1>
        <p className="t-dim">{route?.desc?.[lang]}</p>
      </section>
    </SiteShell>
  );
}
