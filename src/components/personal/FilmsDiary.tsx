import type { FilmDiaryEntry } from '../../data/personal/types';
import { formatMonth, groupByMonth } from '../../data/personal/review';
import { LETTERBOXD_PROFILE } from '../../data/personal/profiles';
import { filmStats, filmsPerYear, formatAverage, posterWall } from '../../data/personal/stats';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import AttributionFooter from './AttributionFooter';
import DiaryEntry from './DiaryEntry';
import FilmPoster from './FilmPoster';
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

// Pôsteres do TMDB dos filmes mais recentes; sem pôster, a entrada só aparece no diário.
function PosterWall({ films }: { films: FilmDiaryEntry[] }) {
  const p = usePersonalText();
  const wall = posterWall(films);

  if (wall.length === 0) return null;

  return (
    <EditorialSection title={p.films.sections.recent}>
      <ul className="pe-wall">
        {wall.map((film) => (
          <li key={film.id}>
            <FilmPoster entry={film} width={120} height={180} />
          </li>
        ))}
      </ul>
    </EditorialSection>
  );
}

function YearBlock({ films }: { films: FilmDiaryEntry[] }) {
  const p = usePersonalText();
  const years = filmsPerYear(films);

  if (years.length < 2) return null;

  return (
    <EditorialSection title={p.films.sections.perYear}>
      <ul className="pe-activity">
        {years.map(({ year, count }) => (
          <li key={year}>
            <span>{year}</span>
            <span>{p.films.perYear(count)}</span>
          </li>
        ))}
      </ul>
    </EditorialSection>
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
              <PosterWall films={feed.items} />
              <YearBlock films={feed.items} />
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
          {feed.source === 'letterboxd' && (
            <a
              className="pe-profile-link"
              href={LETTERBOXD_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
            >
              {p.films.profile}
            </a>
          )}
          <AttributionFooter feed={feed} tmdb={feed.items.some((f) => f.posterUrl || f.meta)} />
        </>
      )}
    </FeedState>
  );
}
