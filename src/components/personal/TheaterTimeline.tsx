import type { TheaterVisit } from '../../data/personal/types';
import { formatDay, groupByYearOf } from '../../data/personal/review';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import AttributionFooter from './AttributionFooter';
import FeedState from './FeedState';
import PlaceholderBadge from './PlaceholderBadge';
import SourceBadge from './SourceBadge';
import StaleNotice from './StaleNotice';

// Teatro (CL-24): linha do tempo por ano, da peça mais recente à mais antiga, com a data, o
// título, companhia, local e cidade (só o que a Duda informou) e uma nota curta. Peça sem data
// vai ao fim, no grupo "Sem data".
export default function TheaterTimeline({
  state,
  retry,
}: {
  state: PersonalState<TheaterVisit>;
  retry: () => void;
}) {
  const { lang, t } = useLanguage();
  const text = t.personal.theater;

  return (
    <FeedState state={state} retry={retry}>
      {(feed) => (
        <>
          <PlaceholderBadge source={feed.source} />
          <StaleNotice stale={feed.stale} updatedAt={feed.updatedAt} />
          {feed.items.length === 0 ? (
            <p className="pe-state">{text.empty}</p>
          ) : (
            groupByYearOf(feed.items, (v) => v.date).map((group) => (
              <section key={group.key} className="pe-month" aria-labelledby={`pe-y-${group.key}`}>
                <h2 id={`pe-y-${group.key}`} className="pe-month-title">
                  {group.key === 'undated' ? text.undated : group.key}
                </h2>
                <ol className="pe-entries pe-entries--dated">
                  {group.items.map((visit) => {
                    const where = [visit.company, visit.venue, visit.city].filter(Boolean);

                    return (
                      <li key={visit.id}>
                        <span className="pe-num">
                          {visit.date ? formatDay(visit.date, lang) : ''}
                        </span>
                        <div>
                          <p className="pe-entry-title">{visit.title}</p>
                          <p className="pe-entry-meta">
                            {where.length > 0 && <span>{where.join(' · ')}</span>}
                            <SourceBadge provenance={visit.provenance} />
                          </p>
                          {visit.note && (
                            <p className="pe-entry-note">
                              <span className="pe-kicker">{text.note}</span> {visit.note[lang]}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))
          )}
          <AttributionFooter feed={feed} />
        </>
      )}
    </FeedState>
  );
}
