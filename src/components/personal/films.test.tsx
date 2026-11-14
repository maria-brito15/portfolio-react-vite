import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { filmsPerYear, posterWall } from '../../data/personal/stats';
import type { FilmDiaryEntry } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { FILMS_ENDPOINT, liveFilmsSource } from '../../services/integrations/letterboxd/live';
import { parseFilmFeed } from '../../services/integrations/letterboxd/parse';
import { MOCK_FETCHED_AT } from '../../services/integrations/source';
import FilmsDiary from './FilmsDiary';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

const film = (over: Partial<FilmDiaryEntry> = {}): FilmDiaryEntry => ({
  id: 'lb:watch-1',
  kind: 'movie',
  title: 'Filme de teste',
  year: 2026,
  watchedDate: '2026-11-07',
  rewatch: false,
  reviewUrl: 'https://letterboxd.com/dudapbrt/film/x/',
  provenance: {
    source: 'letterboxd',
    url: 'https://letterboxd.com/dudapbrt/film/x/',
    fetchedAt: MOCK_FETCHED_AT,
  },
  ...over,
});

const ready = (items: FilmDiaryEntry[], stale = false): PersonalState<FilmDiaryEntry> => ({
  status: 'ready',
  feed: { items, updatedAt: '2026-11-14T12:00:00.000Z', stale, source: 'letterboxd' },
});

const meta = {
  tmdbId: 1,
  directors: ['Fulana'],
  genres: { pt: ['Drama'], en: ['Drama EN'] },
  runtimeMin: 100,
  overview: { pt: 'Sinopse em português.', en: 'Synopsis in English.' },
};

afterEach(() => localStorage.removeItem('portfolio-lang'));

describe('estatísticas e parede de pôsteres (funções puras)', () => {
  it('exibições por ano: do mais recente ao mais antigo, sem as entradas sem data', () => {
    expect(
      filmsPerYear([
        film({ id: 'a', watchedDate: '2026-01-01' }),
        film({ id: 'b', watchedDate: '2025-05-05' }),
        film({ id: 'c', watchedDate: '2026-02-02' }),
        film({ id: 'd', watchedDate: undefined }),
      ]),
    ).toEqual([
      { year: 2026, count: 2 },
      { year: 2025, count: 1 },
    ]);
  });

  it('parede: só filmes com pôster, sem repetir o revisto, limitada', () => {
    const poster = 'https://image.tmdb.org/t/p/w342/a.jpg';
    const wall = posterWall(
      [
        film({ id: '1', tmdbId: 5, posterUrl: poster }),
        film({ id: '2', tmdbId: 5, posterUrl: poster, rewatch: true }),
        film({ id: '3', tmdbId: 6 }),
        film({ id: '4', tmdbId: 7, posterUrl: poster }),
      ],
      2,
    );

    expect(wall.map((f) => f.id)).toEqual(['1', '4']);
  });
});

describe('página de filmes com dados reais', () => {
  it('mostra pôster, créditos, sinopse, link do perfil, última sincronização e atribuição do TMDB', () => {
    const entry = film({
      tmdbId: 1,
      posterUrl: 'https://image.tmdb.org/t/p/w342/a.jpg',
      meta,
      rating: 3.5,
      review: 'Gostei.',
    });

    render(<FilmsDiary state={ready([entry])} retry={() => {}} />, { wrapper });

    expect(screen.getAllByRole('img', { name: 'Filme de teste (2026)' }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Direção: Fulana · Drama · 100 min/)).toBeInTheDocument();
    expect(screen.getByText('Sinopse')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver perfil no Letterboxd/ })).toHaveAttribute(
      'href',
      'https://letterboxd.com/dudapbrt/',
    );
    expect(screen.getByText(/Última sincronização/)).toBeInTheDocument();
    expect(screen.getByText(/via Letterboxd/)).toBeInTheDocument();
    expect(screen.getByText(/not endorsed or certified by TMDB/)).toBeInTheDocument();
  });

  it('sem pôster nem metadado: sem atribuição do TMDB, sem parede, sem créditos', () => {
    render(<FilmsDiary state={ready([film()])} retry={() => {}} />, { wrapper });

    expect(screen.queryByText(/TMDB/)).not.toBeInTheDocument();
    expect(screen.queryByText('Pôsteres recentes')).not.toBeInTheDocument();
    expect(screen.queryByText(/Direção:/)).not.toBeInTheDocument();
  });

  it('nunca afirma "assistido no cinema" nem "favorito" (a fonte não diz)', () => {
    const { container } = render(
      <FilmsDiary state={ready([film({ liked: true })])} retry={() => {}} />,
      { wrapper },
    );

    expect(container.textContent).not.toMatch(/cinema|theat|favorit/i);
  });

  it('resenha com spoiler leva o aviso; publish: false não mostra resenha', () => {
    render(
      <FilmsDiary
        state={ready([
          film({ id: 'a', title: 'Com spoiler', review: 'Texto A', spoiler: true }),
          film({ id: 'b', title: 'Escondido', review: 'Texto B', publish: false }),
        ])}
        retry={() => {}}
      />,
      { wrapper },
    );

    expect(screen.getByText(/pode conter spoilers/)).toBeInTheDocument();
    expect(screen.getByText('Texto A')).toBeInTheDocument();
    expect(screen.queryByText('Texto B')).not.toBeInTheDocument();
  });

  it('vencido mostra o aviso; vazio mostra a mensagem', () => {
    const { unmount } = render(<FilmsDiary state={ready([film()], true)} retry={() => {}} />, {
      wrapper,
    });

    expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível atualizar/);
    unmount();
    render(<FilmsDiary state={ready([])} retry={() => {}} />, { wrapper });
    expect(screen.getByText('Nenhum filme registrado ainda.')).toBeInTheDocument();
  });

  it('sinopse e gêneros seguem o idioma', () => {
    localStorage.setItem('portfolio-lang', 'en');
    render(<FilmsDiary state={ready([film({ meta })])} retry={() => {}} />, { wrapper });

    const row = screen.getByText('Filme de teste').closest('li')!;

    expect(within(row).getByText(/Directed by: Fulana · Drama EN · 100 min/)).toBeInTheDocument();
    expect(within(row).getByText('Synopsis')).toBeInTheDocument();
  });
});

describe('cliente do navegador', () => {
  const body = (items: unknown[], over: object = {}) => ({
    items,
    updatedAt: '2026-11-14T12:00:00.000Z',
    stale: false,
    source: 'letterboxd',
    ...over,
  });
  const valid = {
    id: 'lb:watch-1',
    kind: 'movie',
    title: 'Wildwood',
    year: 2026,
    watchedDate: '2026-11-07',
    rewatch: false,
    rating: 3.5,
    liked: false,
    reviewUrl: 'https://letterboxd.com/dudapbrt/film/wildwood-2026/',
    posterUrl: 'https://image.tmdb.org/t/p/w342/a.jpg',
    provenance: { source: 'letterboxd', fetchedAt: '2026-11-14T12:00:00Z' },
  };

  it('valida o contrato; descarta item ruim, pôster http e nota fora da escala', () => {
    const parsed = parseFilmFeed(
      body([
        valid,
        { ...valid, id: 'x', posterUrl: 'http://x.test/a.jpg', rating: 9 },
        { ...valid, id: 'y', reviewUrl: 'javascript:alert(1)' },
        { id: 'z' },
      ]),
    )!;

    expect(parsed.items.map((i) => i.id)).toEqual(['lb:watch-1', 'x']);
    expect(parsed.items[1]).toMatchObject({ posterUrl: undefined, rating: undefined });
    expect(parseFilmFeed({ items: 'x' })).toBeUndefined();
    expect(parseFilmFeed(body([], { stale: 'sim' }))).toBeUndefined();
  });

  it('publish: false descarta a resenha mesmo que o servidor a mande', () => {
    const parsed = parseFilmFeed(body([{ ...valid, review: 'segredo', publish: false }]))!;

    expect(parsed.items[0].review).toBeUndefined();
  });

  it('lê /api/personal/films; erro HTTP e corpo fora do contrato rejeitam', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockResolvedValueOnce(Response.json(body([valid])));
    expect((await liveFilmsSource.load()).items).toHaveLength(1);
    expect(fetchSpy.mock.calls[0][0]).toBe(FILMS_ENDPOINT);

    fetchSpy.mockResolvedValueOnce(new Response('', { status: 503 }));
    await expect(liveFilmsSource.load()).rejects.toThrow();
    fetchSpy.mockResolvedValueOnce(Response.json({ oi: 1 }));
    await expect(liveFilmsSource.load()).rejects.toThrow();
    fetchSpy.mockRestore();
  });
});
