import type { PersonalFeed } from '../../data/personal/types';
import { formatSyncDate } from '../../data/personal/review';
import { useLanguage } from '../../i18n/LanguageContext';

// Rodapé das páginas do espaço (CL-12): fonte e "última sincronização", mais o aviso de
// atribuição do TMDB quando a página usa dados dele. Transparência acima de parecer tempo real.
export default function AttributionFooter({
  feed,
  tmdb = false,
}: {
  feed?: Pick<PersonalFeed<unknown>, 'updatedAt' | 'source'>;
  tmdb?: boolean;
}) {
  const { lang, t } = useLanguage();
  const text = t.personal.footer;

  if (!feed && !tmdb) return null;

  const synced = feed ? formatSyncDate(feed.updatedAt, lang) : '';

  return (
    <footer className="pe-foot">
      {feed && (
        <p>
          {synced && `${text.synced}: ${synced} · `}
          {text.via} {text.sources[feed.source]}
        </p>
      )}
      {tmdb && <p>{text.tmdb}</p>}
    </footer>
  );
}
