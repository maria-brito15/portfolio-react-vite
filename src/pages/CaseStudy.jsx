import Header from '../components/Header';
import Footer from '../components/Footer';
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
  const { lang, t } = useLanguage();
  useDocumentMeta(META[lang]);
  const links = [
    { to: '/#sobre', label: t.nav.about },
    { to: '/#projetos', label: t.nav.projects },
    { to: '/#experiencias', label: t.nav.experience },
    { to: '/#contato', label: t.nav.contact },
  ];
  return (
    <>
      <Header links={links} />
      <main>{lang === 'pt' ? <WhatsAppDispatcherPt /> : <WhatsAppDispatcherEn />}</main>
      <Footer>{t.footer}</Footer>
    </>
  );
}
