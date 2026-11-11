// Páginas /agora e /setup: título, descrição e o corpo (ou o aviso "em
// construção"). Rota, rótulo e descrição vêm de routes.ts.
import type { ReactNode } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { routeById } from '../data/routes';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import { NowBody, UsesBody } from '../components/InfoBodies';

function InfoPage({ routeId, body }: { routeId: string; body: (lang: 'pt' | 'en') => ReactNode }) {
  const { lang } = useLanguage();
  const route = routeById(routeId);

  useDocumentMeta(routeId);

  return (
    <SiteShell routeId={routeId}>
      <section className="sec info-page">
        <h1>{route?.label[lang]}</h1>
        <p className="t-dim">{route?.desc?.[lang]}</p>
        {body(lang)}
      </section>
    </SiteShell>
  );
}

export const Now = () => <InfoPage routeId="agora" body={(lang) => <NowBody lang={lang} />} />;
export const Uses = () => <InfoPage routeId="setup" body={(lang) => <UsesBody lang={lang} />} />;
