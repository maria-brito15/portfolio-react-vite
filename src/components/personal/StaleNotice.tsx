import { formatSyncDate } from '../../data/personal/review';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';

// Aviso de dado vencido (CL-11): a fonte falhou e a página mostra o último dado conhecido, com
// a data. Só existe quando `stale` é verdadeiro; `role="status"` o anuncia quando aparece.
export default function StaleNotice({ stale, updatedAt }: { stale: boolean; updatedAt: string }) {
  const { lang } = useLanguage();
  const p = usePersonalText();

  if (!stale) return null;

  return (
    <p className="pe-stale" role="status">
      {p.stale.notice(formatSyncDate(updatedAt, lang) || '—')}
    </p>
  );
}
