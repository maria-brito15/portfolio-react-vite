import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Album, Book, FilmDiaryEntry, TheaterVisit } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { mockBooks } from '../../services/integrations/hardcover/mock';
import { mockFilms } from '../../services/integrations/letterboxd/mock';
import { mockAlbums, mockVisits } from '../../services/integrations/manual/mock';
import { MOCK_FETCHED_AT, MOCK_STALE_UPDATED_AT } from '../../services/integrations/source';
import { renderApp } from '../../test/helpers';
import AttributionFooter from './AttributionFooter';
import HubIndex from './HubIndex';
import MusicList from './MusicList';
import SectionIndex from './SectionIndex';
import TheaterTimeline from './TheaterTimeline';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

const ready = <T,>(
  items: T[],
  over: { stale?: boolean; source?: 'mock' | 'manual' | 'hardcover' } = {},
): PersonalState<T> => ({
  status: 'ready',
  feed: {
    items,
    updatedAt: over.stale ? MOCK_STALE_UPDATED_AT : MOCK_FETCHED_AT,
    stale: over.stale ?? false,
    source: over.source ?? 'mock',
  },
});

const noop = () => {};
const loading = { status: 'loading' } as const;

afterEach(() => localStorage.removeItem('portfolio-lang'));

describe('MusicList (CL-23)', () => {
  it('"Em rotação" primeiro e, depois, discos e artistas; sem repetir', () => {
    render(<MusicList state={ready(mockAlbums)} retry={noop} />, { wrapper });

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Em rotação',
      'Discos e artistas',
    ]);

    const [rotation, rest] = screen.getAllByRole('list');

    expect(rotation.querySelectorAll('li')).toHaveLength(2);
    expect(rest.querySelectorAll('li')).toHaveLength(3);
  });

  it('a numeração continua da primeira lista para a segunda', () => {
    const { container } = render(<MusicList state={ready(mockAlbums)} retry={noop} />, { wrapper });
    const numbers = [...container.querySelectorAll('.pe-num')].map((n) => n.textContent);

    expect(numbers).toEqual(['01', '02', '03', '04', '05']);
  });

  it('artista com ano, sem ano, e nota editorial só quando existe', () => {
    render(<MusicList state={ready(mockAlbums)} retry={noop} />, { wrapper });

    expect(screen.getByText('Artista de exemplo · 2024')).toBeInTheDocument();
    expect(screen.getByText('Artista solo de exemplo')).toBeInTheDocument();
    expect(screen.getAllByText('NOTA')).toHaveLength(2);
    expect(screen.getByText(/Nota editorial curta de exemplo/)).toBeInTheDocument();
  });

  it('título e artista muito longos aparecem inteiros', () => {
    render(<MusicList state={ready(mockAlbums)} retry={noop} />, { wrapper });

    expect(screen.getByText(/extremamente longo/)).toBeInTheDocument();
    expect(screen.getByText(/também muito longo/)).toBeInTheDocument();
  });

  it('sem player e sem terceiros: nenhum iframe, áudio ou imagem', () => {
    const { container } = render(<MusicList state={ready(mockAlbums)} retry={noop} />, {
      wrapper,
    });

    expect(container.querySelector('iframe, audio, video, img')).toBeNull();
  });

  it('sem nada em rotação, só a lista', () => {
    const none = mockAlbums.map((a) => ({ ...a, inRotation: undefined }));

    render(<MusicList state={ready(none)} retry={noop} />, { wrapper });

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Discos e artistas',
    ]);
  });

  it('selo e rodapé de dados fictícios', () => {
    render(<MusicList state={ready(mockAlbums)} retry={noop} />, { wrapper });

    expect(screen.getByRole('note')).toHaveTextContent('DADOS FICTÍCIOS');
    expect(screen.getAllByText('fictício')).toHaveLength(mockAlbums.length);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via dados fictícios');
  });

  it('carregando, erro com retry, vazio e vencido', () => {
    const retry = vi.fn();
    const { rerender } = render(<MusicList state={loading} retry={retry} />, { wrapper });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');

    rerender(<MusicList state={{ status: 'error' }} retry={retry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(retry).toHaveBeenCalledTimes(1);

    rerender(<MusicList state={ready<Album>([], { source: 'manual' })} retry={retry} />);
    expect(screen.getByText('Nenhum disco registrado ainda.')).toBeInTheDocument();

    rerender(<MusicList state={ready(mockAlbums, { stale: true })} retry={retry} />);
    expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível atualizar agora/);
  });
});

describe('TheaterTimeline (CL-24)', () => {
  it('anos do mais recente ao mais antigo, com "Sem data" por último', () => {
    render(<TheaterTimeline state={ready(mockVisits)} retry={noop} />, { wrapper });

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      '2026',
      '2025',
      'Sem data',
    ]);
    expect(screen.getAllByRole('listitem')).toHaveLength(mockVisits.length);
  });

  it('mostra só o que foi informado: companhia, local e cidade', () => {
    render(<TheaterTimeline state={ready(mockVisits)} retry={noop} />, { wrapper });

    expect(
      screen.getByText('Companhia de exemplo · Teatro de exemplo · Cidade de exemplo'),
    ).toBeInTheDocument();
    expect(screen.getByText('Teatro de exemplo')).toBeInTheDocument();
    expect(screen.getByText('Companhia de exemplo')).toBeInTheDocument();
  });

  it('data no formato do idioma e nota editorial', () => {
    render(<TheaterTimeline state={ready(mockVisits)} retry={noop} />, { wrapper });

    expect(screen.getByText(/^18.*out/)).toBeInTheDocument();
    expect(screen.getByText(/Nota de exemplo sobre a peça/)).toBeInTheDocument();
  });

  it('em inglês', () => {
    localStorage.setItem('portfolio-lang', 'en');
    render(<TheaterTimeline state={ready(mockVisits)} retry={noop} />, { wrapper });

    expect(screen.getByRole('heading', { name: 'No date' })).toBeInTheDocument();
    expect(screen.getByText(/Example note about the play/)).toBeInTheDocument();
  });

  it('carregando, erro, vazio e vencido', () => {
    const { rerender } = render(<TheaterTimeline state={loading} retry={noop} />, { wrapper });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');

    rerender(<TheaterTimeline state={{ status: 'error' }} retry={noop} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <TheaterTimeline state={ready<TheaterVisit>([], { source: 'manual' })} retry={noop} />,
    );
    expect(screen.getByText('Nenhuma peça registrada ainda.')).toBeInTheDocument();

    rerender(<TheaterTimeline state={ready(mockVisits, { stale: true })} retry={noop} />);
    expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível atualizar agora/);
  });
});

describe('HubIndex (CL-20)', () => {
  const mocks = {
    books: ready(mockBooks),
    films: ready(mockFilms),
    albums: ready(mockAlbums),
    plays: ready(mockVisits),
  };

  it('índice numerado das quatro seções, na ordem, com o caminho de cada uma', () => {
    render(<HubIndex {...mocks} />, { wrapper });

    const links = screen.getAllByRole('link');

    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/pessoal/livros',
      '/pessoal/filmes',
      '/pessoal/musica',
      '/pessoal/teatro',
    ]);
    ['01', '02', '03', '04'].forEach((n, i) => expect(links[i]).toHaveTextContent(n));
    expect(links[0]).toHaveTextContent('Livros');
    expect(links[2]).toHaveTextContent('Música');
  });

  it('um destaque de cada seção', () => {
    render(<HubIndex {...mocks} />, { wrapper });

    expect(screen.getByText('Lendo agora').parentElement).toHaveTextContent(
      'Lendo agora Livro de exemplo 1',
    );
    expect(screen.getByText('Último filme').parentElement).toHaveTextContent(
      'Filme de exemplo 1 (2026)',
    );
    expect(screen.getByText('Em rotação').parentElement).toHaveTextContent(
      'Disco de exemplo 1 — Artista de exemplo',
    );
    expect(screen.getByText('Última peça').parentElement).toHaveTextContent('Peça de exemplo 1');
  });

  it('um só selo de dados fictícios e um rodapé com a fonte de cada seção', () => {
    render(<HubIndex {...mocks} />, { wrapper });

    expect(screen.getAllByRole('note')).toHaveLength(1);

    const foot = screen.getByRole('contentinfo');

    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    for (const label of ['Livros', 'Filmes', 'Música', 'Teatro'])
      expect(foot).toHaveTextContent(`${label}: Última sincronização`);
    expect(foot).toHaveTextContent('via dados fictícios');
  });

  it('carregando: o índice já aparece, sem destaque, sem selo e sem rodapé', () => {
    render(<HubIndex books={loading} films={loading} albums={loading} plays={loading} />, {
      wrapper,
    });

    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.queryByText('Lendo agora')).not.toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('uma fonte com erro não derruba as outras: a seção fica, só sem destaque', () => {
    render(<HubIndex {...mocks} books={{ status: 'error' }} />, { wrapper });

    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.queryByText('Lendo agora')).not.toBeInTheDocument();
    expect(screen.getByText('Último filme')).toBeInTheDocument();
  });

  it('curadoria manual sem nenhum item sai do índice (não leva a página vazia)', () => {
    render(
      <HubIndex
        books={ready<Book>(mockBooks, { source: 'hardcover' })}
        films={ready<FilmDiaryEntry>(mockFilms, { source: 'hardcover' })}
        albums={ready<Album>([], { source: 'manual' })}
        plays={ready<TheaterVisit>([], { source: 'manual' })}
      />,
      { wrapper },
    );

    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/pessoal/livros',
      '/pessoal/filmes',
    ]);
    expect(screen.getAllByRole('link')[1]).toHaveTextContent('02');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('fonte real e vazia de mock, sem destaque quando não há o que destacar', () => {
    render(
      <HubIndex
        books={ready<Book>([], { source: 'hardcover' })}
        films={ready<FilmDiaryEntry>([], { source: 'hardcover' })}
        albums={loading}
        plays={loading}
      />,
      { wrapper },
    );

    expect(screen.queryByText('Lendo agora')).not.toBeInTheDocument();
    expect(screen.queryByText('Último filme')).not.toBeInTheDocument();
  });
});

describe('SectionIndex com destaque', () => {
  it('mostra o destaque quando existe e nada quando não existe', () => {
    render(
      <SectionIndex
        label="Seções"
        items={[
          { to: '/a', title: 'A', highlight: { label: 'Agora', text: 'Algo' } },
          { to: '/b', title: 'B' },
        ]}
      />,
      { wrapper },
    );

    expect(screen.getByText('Agora').parentElement).toHaveTextContent('Agora Algo');
    expect(document.querySelectorAll('.pe-index-highlight')).toHaveLength(1);
  });
});

describe('AttributionFooter com dado manual e várias fontes (CL-12)', () => {
  it('dado manual: "Atualizado em <dia>", sem hora', () => {
    render(<AttributionFooter feed={{ source: 'manual', updatedAt: '2026-11-11' }} />, {
      wrapper,
    });

    const foot = screen.getByRole('contentinfo');

    expect(foot).toHaveTextContent(/Atualizado em: 11.*nov.*2026/);
    expect(foot).toHaveTextContent('via curadoria da Duda');
    expect(foot).not.toHaveTextContent(/\d{1,2}:\d{2}/);
    expect(foot).not.toHaveTextContent(/Última sincronização/);
  });

  it('dado manual sem data: só a fonte', () => {
    render(<AttributionFooter feed={{ source: 'manual', updatedAt: '' }} />, { wrapper });

    expect(screen.getByRole('contentinfo')).toHaveTextContent(/^via curadoria da Duda$/);
  });

  it('várias fontes num só rodapé, cada uma com seu rótulo', () => {
    render(
      <AttributionFooter
        entries={[
          { label: 'Livros', feed: { source: 'hardcover', updatedAt: MOCK_FETCHED_AT } },
          { label: 'Música', feed: { source: 'manual', updatedAt: '' } },
        ]}
      />,
      { wrapper },
    );

    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Livros: Última sincronização');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Música: via curadoria da Duda');
  });
});

describe('modo live de música e teatro (D4, CL-02)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('lê a curadoria da Duda, hoje vazia: fonte "manual", sem data, sem itens', async () => {
    vi.stubEnv('VITE_PERSONAL_SOURCE', 'live');
    vi.resetModules();

    const { albumsSource, theaterSource } = await import('../../services/integrations/manual');

    for (const source of [albumsSource, theaterSource])
      expect(await source.load()).toEqual({
        items: [],
        updatedAt: '',
        stale: false,
        source: 'manual',
      });
  });

  it('sem conteúdo da Duda, as páginas de música e teatro continuam em construção', async () => {
    vi.stubEnv('VITE_PERSONAL_SOURCE', 'live');
    vi.resetModules();

    const live = await import('../../data/routes');

    expect(live.routeById('pessoal-musica')?.draft).toBe(true);
    expect(live.routeById('pessoal-teatro')?.draft).toBe(true);
    expect(live.routeById('pessoal-livros')?.draft).toBe(false);
    // Letterboxd + TMDB ainda sem integração (data/personal/integrations.ts): filmes em rascunho
    expect(live.routeById('pessoal-filmes')?.draft).toBe(true);
    expect(live.routeById('pessoal')?.draft).toBe(false);
  });
});

describe('páginas inteiras, com o mock real (CL-03, CL-20, CL-23, CL-24)', () => {
  it('/pessoal: hub com o índice das quatro seções e os destaques', async () => {
    renderApp('/pessoal');

    expect(await screen.findByText('Lendo agora')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Pessoal' })).toBeInTheDocument();
    expect(screen.getByText('Espaço cultural')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Seções do espaço pessoal' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('DADOS FICTÍCIOS');
  });

  it('/pessoal/musica', async () => {
    renderApp('/pessoal/musica');

    expect(await screen.findByRole('heading', { name: 'Em rotação' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Música' })).toBeInTheDocument();
  });

  it('/personal/theater em inglês', async () => {
    localStorage.setItem('portfolio-lang', 'en');
    renderApp('/personal/theater');

    expect(await screen.findByRole('heading', { name: '2026' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Theater' })).toBeInTheDocument();
  });
});
