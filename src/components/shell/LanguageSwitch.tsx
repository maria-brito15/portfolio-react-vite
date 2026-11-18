import { pathInLang } from '../../data/routes';
import { storeLangChoice, useLanguage } from '../../i18n/LanguageContext';
import { Link, useRouter } from '../../router';
import type { Lang } from '../../types';

// Seletor PT | EN (FR-021, FR-022): dois links reais para a mesma página em cada idioma, então
// funcionam também com clique do meio e sem JavaScript no HTML pré-renderizado. O clique grava a
// escolha (que apaga a faixa de oferta) e navega.
const OPTIONS: { code: Lang; hrefLang: string; label: string }[] = [
  { code: 'pt', hrefLang: 'pt-BR', label: 'PT' },
  { code: 'en', hrefLang: 'en', label: 'EN' },
];

export default function LanguageSwitch() {
  const { path } = useRouter();
  const { lang, t } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label={t.langSwitch.label}>
      {OPTIONS.map(({ code, hrefLang, label }) => (
        <Link
          key={code}
          to={pathInLang(path, code)}
          hrefLang={hrefLang}
          lang={hrefLang}
          title={t.langSwitch[code]}
          aria-current={code === lang ? 'true' : undefined}
          onClick={() => storeLangChoice(code)}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
