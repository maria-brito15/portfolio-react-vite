import type { PersonalFeed } from '../../data/personal/types';
import { formatSyncDate } from '../../data/personal/review';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';

type FeedInfo = Pick<PersonalFeed<unknown>, 'updatedAt' | 'source'>;

// Rodapé das páginas do espaço (CL-12): fonte e "última sincronização", mais o aviso de
// atribuição do TMDB quando a página usa dados dele. Transparência acima de parecer tempo real.
// Dado manual não sincroniza: mostra "Atualizado em <dia>", sem hora. `entries` serve o hub, que
// reúne a fonte de cada seção num só rodapé.
export default function AttributionFooter({
  feed,
  entries,
  tmdb = false,
}: {
  feed?: FeedInfo;
  entries?: { label: string; feed: FeedInfo }[];
  tmdb?: boolean;
}) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const text = p.footer;
  const lines = [...(feed ? [{ label: '', feed }] : []), ...(entries ?? [])];

  if (lines.length === 0 && !tmdb) return null;

  return (
    <footer className="pe-foot">
      {lines.map(({ label, feed: info }) => {
        const manual = info.source === 'manual';
        const when = formatSyncDate(info.updatedAt, lang, manual ? 'UTC' : undefined, !manual);

        return (
          <p key={label || info.source}>
            {label && `${label}: `}
            {when && `${manual ? text.updated : text.synced}: ${when} · `}
            {text.via} {text.sources[info.source]}
          </p>
        );
      })}
      {tmdb && <p>{text.tmdb}</p>}
    </footer>
  );
}
