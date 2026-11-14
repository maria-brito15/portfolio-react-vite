import type { FilmDiaryEntry } from '../../data/personal/types';
import { formatMonth, groupByMonth } from '../../data/personal/review';
import { filmStats, formatAverage } from '../../data/personal/stats';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import AttributionFooter from './AttributionFooter';
import DiaryEntry from './DiaryEntry';
import FeedState from './FeedState';
import PlaceholderBadge from './PlaceholderBadge';
import EditorialDivider from './EditorialDivider';
import EditorialSection from './EditorialSection';
import StaleNotice from './StaleNotice';
import StatTile, { StatRow } from './StatTile';
import { Empty } from './States';

// Os números do ano (derivados dos itens, `data/personal/stats.ts`).
function FilmStatTiles({ films }: { films: FilmDiaryEntry[] }) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const stats = filmStats(films);
  const text = p.films.stats;

  return (
    <StatRow>
      <StatTile label={text.watched(stats.year)} value={stats.filmsWatched} />
      <StatTile label={text.rewatches} value={stats.rewatches} />
      <StatTile label={text.liked} value={stats.liked} />
      <StatTile label={text.average} value={formatAverage(stats.averageRating, lang)} />
    </StatRow>
  );
}

// Diário de filmes (CL-22): agrupado por mês, com o grupo "sem data" no fim, e todos os
// estados (carregando, erro, vazio, vencido). Recebe o estado pronto: quem carrega é a página.
export default function FilmsDiary({
  state,
  retry,
}: {
  state: PersonalState<FilmDiaryEntry>;
  retry: () => void;
}) {
  const { lang } = useLanguage();
  const p = usePersonalText();

  return (
    <FeedState state={state} retry={retry}>
      {(feed) => (
        <>
          <PlaceholderBadge source={feed.source} />
          <StaleNotice stale={feed.stale} updatedAt={feed.updatedAt} />
          {feed.items.length === 0 ? (
            <Empty>{p.films.empty}</Empty>
          ) : (
            <>
              <FilmStatTiles films={feed.items} />
              <EditorialDivider />
              {groupByMonth(feed.items).map((group) => (
                <EditorialSection
                  key={group.key}
                  title={group.key === 'undated' ? p.films.undated : formatMonth(group.key, lang)}
                >
                  <ul className="pe-diary">
                    {group.items.map((entry) => (
                      <DiaryEntry key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </EditorialSection>
              ))}
            </>
          )}
          <AttributionFooter feed={feed} tmdb={feed.items.some((f) => f.posterUrl)} />
        </>
      )}
    </FeedState>
  );
}
