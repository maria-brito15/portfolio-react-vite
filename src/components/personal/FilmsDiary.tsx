import type { FilmDiaryEntry } from '../../data/personal/types';
import { formatMonth, groupByMonth } from '../../data/personal/review';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import AttributionFooter from './AttributionFooter';
import DiaryRow from './DiaryRow';
import FeedState from './FeedState';
import PlaceholderBadge from './PlaceholderBadge';
import StaleNotice from './StaleNotice';

// Diário de filmes (CL-22): agrupado por mês, com o grupo "sem data" no fim, e todos os
// estados (carregando, erro, vazio, vencido). Recebe o estado pronto: quem carrega é a página.
export default function FilmsDiary({
  state,
  retry,
}: {
  state: PersonalState<FilmDiaryEntry>;
  retry: () => void;
}) {
  const { lang, t } = useLanguage();

  return (
    <FeedState state={state} retry={retry}>
      {(feed) => (
        <>
          <PlaceholderBadge source={feed.source} />
          <StaleNotice stale={feed.stale} updatedAt={feed.updatedAt} />
          {feed.items.length === 0 ? (
            <p className="pe-state">{t.personal.films.empty}</p>
          ) : (
            groupByMonth(feed.items).map((group) => (
              <section key={group.key} className="pe-month" aria-labelledby={`pe-m-${group.key}`}>
                <h2 id={`pe-m-${group.key}`} className="pe-month-title">
                  {group.key === 'undated'
                    ? t.personal.films.undated
                    : formatMonth(group.key, lang)}
                </h2>
                <ul className="pe-diary">
                  {group.items.map((entry) => (
                    <DiaryRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              </section>
            ))
          )}
          <AttributionFooter feed={feed} tmdb={feed.items.some((f) => f.posterUrl)} />
        </>
      )}
    </FeedState>
  );
}
