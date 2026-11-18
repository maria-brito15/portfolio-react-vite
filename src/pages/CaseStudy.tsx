import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import WhatsAppDispatcherPt from './case-study/WhatsAppDispatcherPt';
import WhatsAppDispatcherEn from './case-study/WhatsAppDispatcherEn';
import '../styles/case-study.css';

export default function CaseStudy() {
  const { lang } = useLanguage();

  useDocumentMeta('whatsapp-dispatcher');

  return <>{lang === 'pt' ? <WhatsAppDispatcherPt /> : <WhatsAppDispatcherEn />}</>;
}
