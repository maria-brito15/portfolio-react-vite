import type { Book } from '../../data/personal/types';
import { useLanguage } from '../../i18n/LanguageContext';
import Chip from '../ui/Chip';
import CoverFigure from './CoverFigure';
import RatingStars from './RatingStars';
import SourceBadge from './SourceBadge';

// Grade de capas (CL-21). `lg` é a versão grande de "lendo agora". Sem capa, o placeholder
// tipográfico; a nota aparece nos lidos (inclusive "sem nota") e nos demais só quando existe.
export default function ShelfGrid({ books, size = 'md' }: { books: Book[]; size?: 'md' | 'lg' }) {
  const { lang, t } = useLanguage();
  const text = t.personal.books;

  return (
    <ul className={`pe-shelf${size === 'lg' ? ' pe-shelf--lg' : ''}`}>
      {books.map((book) => (
        <li key={book.id}>
          <CoverFigure
            src={book.coverUrl}
            alt={book.title}
            title={book.title}
            caption={
              <>
                <span className="pe-book-title">{book.title}</span>
                <span className="pe-book-by">
                  {text.by} {book.authors.join(', ')}
                </span>
                <span className="pe-book-meta">
                  {(book.status === 'read' || book.rating !== undefined) && (
                    <RatingStars rating={book.rating} />
                  )}
                  {book.pages !== undefined && <span>{text.pages(book.pages)}</span>}
                  {(book.status === 'paused' || book.status === 'dnf') && (
                    <Chip accent="coral">{text.status[book.status]}</Chip>
                  )}
                  <SourceBadge provenance={book.provenance} />
                </span>
                {book.note && (
                  <span className="pe-book-note">
                    <span className="pe-kicker">{text.note}</span> {book.note[lang]}
                  </span>
                )}
              </>
            }
          />
        </li>
      ))}
    </ul>
  );
}
