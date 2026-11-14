import type { Book } from '../../data/personal/types';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import Chip from '../ui/Chip';
import CoverFigure from './CoverFigure';
import RatingStars from './RatingStars';
import SourceBadge from './SourceBadge';

// Um livro da estante: capa (ou placeholder tipográfico) e legenda com título, autores, nota,
// páginas, estado e nota editorial. A nota aparece nos lidos (inclusive "sem nota") e nos demais
// só quando existe. Visual apenas: recebe o livro pronto.
export default function BookCard({ book }: { book: Book }) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const text = p.books;

  return (
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
  );
}
