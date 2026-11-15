import { useLanguage } from '../../i18n/LanguageContext';

// Ponto verde de 6 px (CD-34): sinal de que a autora está por aqui. Pulsa num ciclo de 2 s;
// fica estático com `prefers-reduced-motion` (regra em notebook.css). Decorativo.
export default function PresencePulse() {
  const { t } = useLanguage();

  return <span className="nb-pulse" role="img" aria-label={t.nb.presence} />;
}
