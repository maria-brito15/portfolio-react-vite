import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { lastFinishedBook, recentFilms } from '../../data/personal/highlights';
import type { Book, FilmDiaryEntry } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { mockBooks } from '../../services/integrations/hardcover/mock';
import { mockFilms } from '../../services/integrations/letterboxd/mock';
import { mockAlbums, mockVisits } from '../../services/integrations/manual/mock';
import { MOCK_FETCHED_AT } from '../../services/integrations/source';
import CoverFigure from './CoverFigure';
import HubIndex from './HubIndex';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

const ready = <T,>(items: T[]): PersonalState<T> => ({
  status: 'ready',
  feed: { items, updatedAt: MOCK_FETCHED_AT, stale: false, source: 'mock' },
});

afterEach(() => window.history.replaceState(null, '', '/'));

describe('destaques do hub', () => {
  it('recentFilms: só com data, do mais recente ao mais antigo, no máximo 3', () => {
    const films = recentFilms(mockFilms);

    expect(films.length).toBeLessThanOrEqual(3);
    expect(films.every((f) => f.watchedDate)).toBe(true);
    expect(films.map((f) => f.watchedDate)).toEqual(
      [...films.map((f) => f.watchedDate)].sort().reverse(),
    );
    expect(recentFilms([])).toEqual([]);
  });

  it('lastFinishedBook: o término mais recente; sem data de término, nenhum', () => {
    const book = (id: string, over: Partial<Book>): Book => ({
      id,
      title: id,
      authors: [],
      status: 'read',
      provenance: { source: 'mock', fetchedAt: MOCK_FETCHED_AT },
      ...over,
    });

    expect(
      lastFinishedBook([
        book('a', { finishedAt: '2026-01-05' }),
        book('b', { finishedAt: '2026-03-01' }),
        book('c', {}),
        book('d', { status: 'reading', finishedAt: '2026-09-01' }),
      ])?.id,
    ).toBe('b');
    expect(lastFinishedBook([book('c', {})])).toBeUndefined();
  });
});

describe('HubIndex: cartões', () => {
  const mocks = {
    books: ready(mockBooks),
    films: ready(mockFilms),
    albums: ready(mockAlbums),
    plays: ready(mockVisits),
  };

  it('cada seção tem a sua cor; o cartão todo é um só link', () => {
    const { container } = render(<HubIndex {...mocks} />, { wrapper });

    expect(
      [...container.querySelectorAll('.pe-index > li')].map((li) => li.getAttribute('data-tone')),
    ).toEqual(['violet', 'coral', 'cyan', 'pink']);
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('filmes: pôsteres dos últimos filmes dentro do link de Filmes', () => {
    const { container } = render(<HubIndex {...mocks} />, { wrapper });
    const posters = container.querySelectorAll('.pe-index-posters .pe-cover');

    expect(posters).toHaveLength(recentFilms(mockFilms).length);
    expect(screen.getAllByRole('link')[1]).toContainElement(posters[0] as HTMLElement);
  });

  it('livros: "Último lido" junto de "Lendo agora"', () => {
    render(<HubIndex {...mocks} />, { wrapper });

    expect(screen.getByText('Último lido')).toBeInTheDocument();
  });

  it('em inglês', () => {
    window.history.replaceState(null, '', '/en');
    render(<HubIndex {...mocks} />, { wrapper });

    expect(screen.getByText('Last finished')).toBeInTheDocument();
  });

  it('sem filmes datados, sem faixa de pôsteres', () => {
    const undated: FilmDiaryEntry[] = mockFilms.map((f) => ({ ...f, watchedDate: undefined }));
    const { container } = render(<HubIndex {...mocks} films={ready(undated)} />, { wrapper });

    expect(container.querySelector('.pe-index-posters')).toBeNull();
  });
});

describe('CoverFigure: imagem otimizada', () => {
  it('pôster do TMDB em w342 ganha srcset com w185; carregamento preguiçoso e assíncrono', () => {
    render(
      <CoverFigure
        src="https://image.tmdb.org/t/p/w342/abc.jpg"
        alt="x"
        title="x"
        width={60}
        height={90}
      />,
    );

    const img = screen.getByRole('img');

    expect(img).toHaveAttribute(
      'srcset',
      'https://image.tmdb.org/t/p/w185/abc.jpg 185w, https://image.tmdb.org/t/p/w342/abc.jpg 342w',
    );
    expect(img).toHaveAttribute('sizes', '60px');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('outra fonte (capa do Hardcover): sem srcset', () => {
    render(<CoverFigure src="https://example.org/c.jpg" alt="x" title="x" />);

    expect(screen.getByRole('img')).not.toHaveAttribute('srcset');
  });
});
