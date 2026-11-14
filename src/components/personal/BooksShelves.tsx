import type { Book } from '../../data/personal/types';
import { formatMonth, groupByYear } from '../../data/personal/review';
import { HARDCOVER_PROFILE } from '../../data/personal/profiles';
import {
  favoriteBooks,
  formatAverage,
  readingActivity,
  readingStats,
} from '../../data/personal/stats';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import AttributionFooter from './AttributionFooter';
import EditorialDivider from './EditorialDivider';
import EditorialSection from './EditorialSection';
import FeedState from './FeedState';
import PlaceholderBadge from './PlaceholderBadge';
import ShelfGrid from './ShelfGrid';
import SourceBadge from './SourceBadge';
import StaleNotice from './StaleNotice';
import StatTile, { StatRow } from './StatTile';
import { Empty } from './States';

// Os números do ano (derivados dos itens, `data/personal/stats.ts`).
function BookStatTiles({ books }: { books: Book[] }) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const stats = readingStats(books);
  const text = p.books.stats;

  return (
    <StatRow>
      <StatTile label={text.read(stats.year)} value={stats.booksRead} />
      <StatTile label={text.pages} value={stats.pagesRead?.toLocaleString(lang)} />
      <StatTile label={text.average} value={formatAverage(stats.averageRating, lang)} />
      <StatTile label={text.reading} value={stats.currentlyReading} />
    </StatRow>
  );
}

// Livros terminados por mês (derivado das datas de término, `data/personal/stats.ts`).
function ActivityBlock({ books }: { books: Book[] }) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const months = readingActivity(books);

  if (months.length === 0) return null;

  return (
    <EditorialSection title={p.books.sections.activity}>
      <ul className="pe-activity">
        {months.map((m) => (
          <li key={m.month}>
            <span>{formatMonth(m.month, lang)}</span>
            <span>{p.books.activity(m.books, m.pages)}</span>
          </li>
        ))}
      </ul>
    </EditorialSection>
  );
}

// Estante (CL-21): números do ano, "lendo agora" em destaque, lidos por ano de término, pausados
// e abandonados, e "quero ler" numa coluna ao lado (grade 7/5; uma coluna no celular). Recebe o
// estado pronto.
export default function BooksShelves({
  state,
  retry,
}: {
  state: PersonalState<Book>;
  retry: () => void;
}) {
  const p = usePersonalText();
  const text = p.books;

  return (
    <FeedState state={state} retry={retry}>
      {(feed) => {
        const by = (...status: Book['status'][]) =>
          feed.items.filter((b) => status.includes(b.status));
        const reading = by('reading');
        const read = groupByYear(by('read'));
        const other = by('paused', 'dnf');
        const want = by('want');
        const favorites = favoriteBooks(feed.items);

        return (
          <>
            <PlaceholderBadge source={feed.source} />
            <StaleNotice stale={feed.stale} updatedAt={feed.updatedAt} />
            {feed.items.length === 0 ? (
              <Empty>{text.empty}</Empty>
            ) : (
              <>
                <BookStatTiles books={feed.items} />
                <EditorialDivider />
                <ActivityBlock books={feed.items} />
                <div className={want.length > 0 ? 'pe-split' : undefined}>
                  <div>
                    {reading.length > 0 && (
                      <EditorialSection title={text.sections.reading}>
                        <ShelfGrid books={reading} size="lg" />
                      </EditorialSection>
                    )}
                    {read.map((group) => (
                      <EditorialSection
                        key={group.key}
                        title={`${text.sections.read} · ${group.key === 'undated' ? text.undated : group.key}`}
                      >
                        <ShelfGrid books={group.items} />
                      </EditorialSection>
                    ))}
                    {favorites.length > 0 && (
                      <EditorialSection title={text.sections.favorites}>
                        <ShelfGrid books={favorites} />
                      </EditorialSection>
                    )}
                    {other.length > 0 && (
                      <EditorialSection title={text.sections.other}>
                        <ShelfGrid books={other} />
                      </EditorialSection>
                    )}
                  </div>
                  {want.length > 0 && (
                    <EditorialSection as="aside" title={text.sections.want}>
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
                    </EditorialSection>
                  )}
                </div>
              </>
            )}
            {feed.source === 'hardcover' && (
              <a
                className="pe-profile-link"
                href={HARDCOVER_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
              >
                {text.profile}
              </a>
            )}
            <AttributionFooter feed={feed} />
          </>
        );
      }}
    </FeedState>
  );
}
