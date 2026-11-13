import type { Book } from '../../data/personal/types';
import { groupByYear } from '../../data/personal/review';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import AttributionFooter from './AttributionFooter';
import FeedState from './FeedState';
import PlaceholderBadge from './PlaceholderBadge';
import ShelfGrid from './ShelfGrid';
import SourceBadge from './SourceBadge';
import StaleNotice from './StaleNotice';

// Estante (CL-21): "lendo agora" em destaque, lidos por ano de término, pausados e abandonados,
// e "quero ler" numa coluna ao lado (grade 7/5; uma coluna no celular). Recebe o estado pronto.
export default function BooksShelves({
  state,
  retry,
}: {
  state: PersonalState<Book>;
  retry: () => void;
}) {
  const { t } = useLanguage();
  const text = t.personal.books;

  return (
    <FeedState state={state} retry={retry}>
      {(feed) => {
        const by = (...status: Book['status'][]) =>
          feed.items.filter((b) => status.includes(b.status));
        const reading = by('reading');
        const read = groupByYear(by('read'));
        const other = by('paused', 'dnf');
        const want = by('want');

        return (
          <>
            <PlaceholderBadge source={feed.source} />
            <StaleNotice stale={feed.stale} updatedAt={feed.updatedAt} />
            {feed.items.length === 0 ? (
              <p className="pe-state">{text.empty}</p>
            ) : (
              <div className={want.length > 0 ? 'pe-split' : undefined}>
                <div>
                  {reading.length > 0 && (
                    <section className="pe-month">
                      <h2 className="pe-month-title">{text.sections.reading}</h2>
                      <ShelfGrid books={reading} size="lg" />
                    </section>
                  )}
                  {read.map((group) => (
                    <section key={group.key} className="pe-month">
                      <h2 className="pe-month-title">
                        {text.sections.read} · {group.key === 'undated' ? text.undated : group.key}
                      </h2>
                      <ShelfGrid books={group.items} />
                    </section>
                  ))}
                  {other.length > 0 && (
                    <section className="pe-month">
                      <h2 className="pe-month-title">{text.sections.other}</h2>
                      <ShelfGrid books={other} />
                    </section>
                  )}
                </div>
                {want.length > 0 && (
                  <aside className="pe-month">
                    <h2 className="pe-month-title">{text.sections.want}</h2>
                    <ul className="pe-want">
                      {want.map((book) => (
                        <li key={book.id}>
                          <span className="pe-book-title">{book.title}</span>
                          <span className="pe-book-by">
                            {text.by} {book.authors.join(', ')}
                          </span>
                          <SourceBadge provenance={book.provenance} />
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
              </div>
            )}
            <AttributionFooter feed={feed} />
          </>
        );
      }}
    </FeedState>
  );
}
