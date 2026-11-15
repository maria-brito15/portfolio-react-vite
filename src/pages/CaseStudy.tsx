import SiteShell from '../components/shell/SiteShell';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import WhatsAppDispatcherPt from './case-study/WhatsAppDispatcherPt';
import WhatsAppDispatcherEn from './case-study/WhatsAppDispatcherEn';
import '../styles/case-study.css';
import TitleCard from '../components/notebook/TitleCard';
import NextProduction from '../components/notebook/NextProduction';
import { CADERNO_V2 } from '../config';

const PROJECT_ID = 'whatsapp-dispatcher';

export default function CaseStudy() {
  const { lang } = useLanguage();

  useDocumentMeta('whatsapp-dispatcher');

  return (
    <SiteShell
      routeId="whatsapp-dispatcher"
      after={CADERNO_V2 ? <NextProduction projectId={PROJECT_ID} /> : undefined}
    >
      {CADERNO_V2 && <TitleCard projectId={PROJECT_ID} />}
      {lang === 'pt' ? <WhatsAppDispatcherPt /> : <WhatsAppDispatcherEn />}
    </SiteShell>
  );
}
