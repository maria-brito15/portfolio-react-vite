import type { Album, Book, FilmDiaryEntry, TheaterVisit } from '../../data/personal/types';
import {
  currentBook,
  featuredAlbum,
  lastFinishedBook,
  latestFilm,
  latestPlay,
  recentFilms,
} from '../../data/personal/highlights';
import { routeById } from '../../data/routes';
import type { Tone } from '../../data/tones';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import AttributionFooter from './AttributionFooter';
import FilmPoster from './FilmPoster';
import PlaceholderBadge from './PlaceholderBadge';
import SectionIndex, { type SectionIndexItem } from './SectionIndex';

type Highlight = SectionIndexItem['highlight'];

// Cor de cada seção; a do hub (âmbar) vem do grupo "personal".
const SECTION_TONE: Record<string, Tone> = {
  'pessoal-livros': 'violet',
  'pessoal-filmes': 'coral',
  'pessoal-musica': 'cyan',
  'pessoal-teatro': 'pink',
};

// Uma seção de curadoria manual sem nenhum item não tem o que mostrar: sai do índice, em vez de
// levar a uma página vazia.
const isEmptyManual = <T,>(state: PersonalState<T>) =>
  state.status === 'ready' && state.feed.items.length === 0 && state.feed.source === 'manual';

// Hub (CL-20): índice numerado das seções, com o destaque de cada uma (livro de agora, último
// filme, disco em rotação, última peça) e, no rodapé, a fonte e a data de cada seção.
export default function HubIndex({
  books,
  films,
  albums,
  plays,
}: {
  books: PersonalState<Book>;
  films: PersonalState<FilmDiaryEntry>;
  albums: PersonalState<Album>;
  plays: PersonalState<TheaterVisit>;
}) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const text = p.hub;

  // Uma entrada do índice: rota, feed (se já carregou) e o destaque calculado dele.
  function entry<T>(
    routeId: string,
    state: PersonalState<T>,
    pick: (items: T[]) => Highlight,
    extra?: (items: T[]) => SectionIndexItem['extra'],
  ) {
    const route = routeById(routeId)!;

    // Fora do índice: curadoria manual vazia e, no ar, seção em rascunho (sem conteúdo ou sem
    // integração). Na prévia com dados fictícios (`showInNav` do hub), todas aparecem.
    if (isEmptyManual(state)) return undefined;
    if (route.draft && !routeById('pessoal')?.showInNav) return undefined;

    const feed = state.status === 'ready' ? state.feed : undefined;

    return {
      feed,
      label: route.label[lang],
      item: {
        to: route.path,
        title: route.label[lang],
        hint: route.desc?.[lang],
        tone: SECTION_TONE[routeId],
        highlight: feed ? pick(feed.items) : undefined,
        extra: feed ? extra?.(feed.items) : undefined,
      } satisfies SectionIndexItem,
    };
  }

  const entries = [
    entry(
      'pessoal-livros',
      books,
      (items) => {
        const book = currentBook(items);

        return book && { label: text.highlight.books, text: book.title };
      },
      (items) => {
        const book = lastFinishedBook(items);

        return (
          book && (
            <span className="pe-index-highlight">
              <span className="pe-kicker">{text.highlight.lastRead}</span> {book.title}
            </span>
          )
        );
      },
    ),
    entry(
      'pessoal-filmes',
      films,
      (items) => {
        const film = latestFilm(items);

        return (
          film && {
            label: text.highlight.films,
            text: film.year === undefined ? film.title : `${film.title} (${film.year})`,
          }
        );
      },
      (items) => {
        const films = recentFilms(items);

        return (
          films.length > 0 && (
            <div className="pe-index-posters">
              {films.map((film) => (
                <FilmPoster key={film.id} entry={film} width={60} height={90} />
              ))}
            </div>
          )
        );
      },
    ),
    entry('pessoal-musica', albums, (items) => {
      const album = featuredAlbum(items);

      return (
        album && {
          label: album.inRotation ? text.highlight.music : p.music.all,
          text: `${album.title} — ${album.artist}`,
        }
      );
    }),
    entry('pessoal-teatro', plays, (items) => {
      const play = latestPlay(items);

      return play && { label: text.highlight.theater, text: play.title };
    }),
  ].filter((e) => e !== undefined);

  const feeds = entries.flatMap((e) => (e.feed ? [{ label: e.label, feed: e.feed }] : []));

  return (
    <>
      <PlaceholderBadge source={feeds.some((f) => f.feed.source === 'mock') ? 'mock' : undefined} />
      <SectionIndex label={text.indexLabel} items={entries.map((e) => e.item)} />
      <AttributionFooter entries={feeds} />
    </>
  );
}
