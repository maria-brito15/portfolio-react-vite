import type { Book } from '../../data/personal/types';
import BookCard from './BookCard';

// Grade de capas (CL-21). `lg` é a versão grande de "lendo agora".
export default function ShelfGrid({ books, size = 'md' }: { books: Book[]; size?: 'md' | 'lg' }) {
  return (
    <ul className={`pe-shelf${size === 'lg' ? ' pe-shelf--lg' : ''}`}>
      {books.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
