import SiteShell from '../components/shell/SiteShell';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import WhatsAppDispatcherPt from './case-study/WhatsAppDispatcherPt';
import WhatsAppDispatcherEn from './case-study/WhatsAppDispatcherEn';
import '../styles/case-study.css';

// O estudo de caso foi escrito nos dois idiomas; cada texto é o original.
const META = {
  pt: {
    title: 'WhatsApp Dispatcher — Estudo de Caso | Duda Brito',
    description:
      'Registro do raciocínio de arquitetura por trás de um sistema de disparo de mensagens no WhatsApp.',
  },
  en: {
    title: 'WhatsApp Dispatcher — Case Study | Duda Brito',
    description: 'Record of the architectural reasoning behind a WhatsApp message dispatch system.',
  },
};

export default function CaseStudy() {
  const { lang } = useLanguage();
  useDocumentMeta(META[lang]);
  return (
    <SiteShell routeId="whatsapp-dispatcher">
      {lang === 'pt' ? <WhatsAppDispatcherPt /> : <WhatsAppDispatcherEn />}
    </SiteShell>
  );
}
