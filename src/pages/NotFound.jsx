import Header from '../components/Header';
import { Link } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function NotFound() {
  const { t } = useLanguage();
  useDocumentMeta({ title: `${t.notFound.title} | Duda Brito`, description: t.notFound.text });
  return (
    <>
      <Header links={[]} />
      <main className="not-found">
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.text}</p>
        <Link to="/" className="btn">
          {t.notFound.back}
        </Link>
      </main>
    </>
  );
}
