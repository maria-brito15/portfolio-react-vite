import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { routeById } from '../../data/routes';
import { groupByMonth } from '../../data/personal/review';
import type { Book, FilmDiaryEntry, PersonalFeed } from '../../data/personal/types';
import { buildActivity } from '../../data/notebook/activity';
import {
  usePersonalAlbums,
  usePersonalBooks,
  usePersonalFilms,
  usePersonalTheater,
  type PersonalState,
} from '../../hooks/usePersonal';
import AttributionFooter from '../personal/AttributionFooter';
import PlaceholderBadge from '../personal/PlaceholderBadge';
import { ErrorState, Loading } from '../personal/States';
import ActivityFeed from './ActivityFeed';
import PosterGrid, { type Poster } from './PosterGrid';

const GRID_MAX = 18;

const ready = <T,>(state: PersonalState<T>) => (state.status === 'ready' ? state.feed : undefined);

// Estante: quem está sendo lido primeiro (o primeiro em destaque 2×2), depois os lidos do término
// mais recente ao mais antigo. "Quero ler", pausados e abandonados ficam na página de livros.
export function bookPosters(books: Book[], labels: { reading: string; read: string }, fallback?: string): Poster[] {
  const reading = books.filter((b) => b.status === 'reading');
  const read = books
    .filter((b) => b.status === 'read')
    .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));

  return [...reading, ...read].slice(0, GRID_MAX).map((book, index) => ({
    id: book.id,
    title: book.title,
    sub: book.authors.join(', ') || undefined,
    image: book.coverUrl,
    rating: book.rating,
    rated: book.status === 'read',
    status:
      book.status === 'reading'
        ? { tone: 'active', label: labels.reading }
        : { tone: 'done', label: labels.read },
    feature: index === 0 && book.status === 'reading',
    href: book.provenance.url ?? fallback,
  }));
}

// Na tela: o diário do mais recente ao mais antigo (sem data por último, nunca some).
export function filmPosters(films: FilmDiaryEntry[]): Poster[] {
  return groupByMonth(films)
    .flatMap((g) => g.items)
    .slice(0, GRID_MAX)
    .map((film) => ({
      id: film.id,
      title: film.title,
      sub: film.year === undefined ? undefined : String(film.year),
      image: film.posterUrl ?? film.meta?.posterUrl,
      rating: film.rating,
      rated: true,
      href: film.reviewUrl,
    }));
}

// Curadoria manual sem item, ou seção em rascunho no ar: fora da lista (como no hub antigo).
function listed<T>(routeId: string, state: PersonalState<T>) {
  const route = routeById(routeId);

  if (!route) return undefined;
  if (state.status === 'ready' && !state.feed.items.length && state.feed.source === 'manual') return undefined;
  if (route.draft && !routeById('pessoal')?.showInNav) return undefined;

  return route;
}

// `/pessoal` no caderno (revisão R1): o feed de atividade é a visão principal; ao lado, as grades de
// capas e pôsteres no lugar do índice em lista; abaixo, as outras seções e as fontes.
export default function NotebookPersonal() {
  const { lang, t } = useLanguage();
  const books = usePersonalBooks();
  const films = usePersonalFilms();
  const albums = usePersonalAlbums();
  const plays = usePersonalTheater();
  const s = t.nb.shelf;
  const bookFeed = ready(books.state);
  const filmFeed = ready(films.state);
  const booksRoute = routeById('pessoal-livros');
  const filmsRoute = routeById('pessoal-filmes');
  const activity = buildActivity(bookFeed?.items ?? [], filmFeed?.items ?? []);
  const loading = books.state.status === 'loading' || films.state.status === 'loading';
  const failed = books.state.status === 'error' && films.state.status === 'error';
  const others = [listed('pessoal-musica', albums.state), listed('pessoal-teatro', plays.state)].filter(
    (r) => r !== undefined,
  );
  const feeds: { label: string; feed: PersonalFeed<unknown> }[] = [];

  if (bookFeed && booksRoute) feeds.push({ label: booksRoute.label[lang], feed: bookFeed });
  if (filmFeed && filmsRoute) feeds.push({ label: filmsRoute.label[lang], feed: filmFeed });

  const sample = feeds.some((f) => f.feed.source === 'mock');

  return (
    <div className="nb-library">
      <PlaceholderBadge source={sample ? 'mock' : undefined} />
      <section className="nb-library-feed" aria-labelledby="nb-activity-title">
        <h2 className="nb-library-title" id="nb-activity-title">
          {t.nb.activity.title}
        </h2>
        {failed ? (
          <ErrorState
            onRetry={() => {
              books.retry();
              films.retry();
            }}
          />
        ) : (
          <>
            <ActivityFeed items={activity} />
            {loading && <Loading />}
          </>
        )}
      </section>
      <div className="nb-library-side">
        <section aria-labelledby="nb-shelf-books">
          <h2 className="nb-library-title" id="nb-shelf-books">
            {s.books}
          </h2>
          {books.state.status === 'loading' && <Loading />}
          {books.state.status === 'error' && <ErrorState onRetry={books.retry} />}
          {bookFeed && (
            <PosterGrid
              size="sm"
              label={s.gridLabel(s.books)}
              posters={bookPosters(bookFeed.items, s.status, booksRoute?.path)}
            />
          )}
          {booksRoute && (
            <Link to={booksRoute.path} className="nb-library-all">
              {s.all(booksRoute.label[lang])}
            </Link>
          )}
        </section>
        <section aria-labelledby="nb-shelf-films">
          <h2 className="nb-library-title" id="nb-shelf-films">
            {s.films}
          </h2>
          {films.state.status === 'loading' && <Loading />}
          {films.state.status === 'error' && <ErrorState onRetry={films.retry} />}
          {filmFeed && (
            <PosterGrid size="sm" label={s.gridLabel(s.films)} posters={filmPosters(filmFeed.items)} />
          )}
          {filmsRoute && (
            <Link to={filmsRoute.path} className="nb-library-all">
              {s.all(filmsRoute.label[lang])}
            </Link>
          )}
        </section>
        {others.length > 0 && (
          <nav aria-labelledby="nb-shelf-also">
            <h2 className="nb-library-title" id="nb-shelf-also">
              {s.also}
            </h2>
            <ul className="nb-library-others">
              {others.map((route) => (
                <li key={route.id}>
                  <Link to={route.path}>
                    <span className="nb-library-other-name">{route.label[lang]}</span>
                    {route.desc && <span className="nb-library-other-desc">{route.desc[lang]}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      {/* A atribuição da TMDB já está nos créditos de toda página (CD-51). */}
      <AttributionFooter entries={feeds} />
    </div>
  );
}
