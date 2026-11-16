import SiteShell from '../components/shell/SiteShell';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import WhatsAppDispatcherPt from './case-study/WhatsAppDispatcherPt';
import WhatsAppDispatcherEn from './case-study/WhatsAppDispatcherEn';
import '../styles/case-study.css';

export default function CaseStudy() {
  const { lang } = useLanguage();

  useDocumentMeta('whatsapp-dispatcher');

  return (
    <SiteShell routeId="whatsapp-dispatcher">
      {lang === 'pt' ? <WhatsAppDispatcherPt /> : <WhatsAppDispatcherEn />}
    </SiteShell>
  );
}
