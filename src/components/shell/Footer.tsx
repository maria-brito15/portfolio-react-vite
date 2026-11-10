import { useLanguage } from '../../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer>
      <p>{t.footer}</p>
    </footer>
  );
}
