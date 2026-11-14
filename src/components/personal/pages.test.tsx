import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Book, FilmDiaryEntry } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { mockBooks } from '../../services/integrations/hardcover/mock';
import { mockFilms } from '../../services/integrations/letterboxd/mock';
import { MOCK_FETCHED_AT, MOCK_STALE_UPDATED_AT } from '../../services/integrations/source';
import { renderApp } from '../../test/helpers';
import BooksShelves from './BooksShelves';
import DiaryEntry from './DiaryEntry';
import FilmsDiary from './FilmsDiary';
import ReviewBlock from './ReviewBlock';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

const ready = <T,>(
  items: T[],
  over: { stale?: boolean; source?: 'mock' | 'letterboxd' | 'hardcover' } = {},
): PersonalState<T> => ({
  status: 'ready',
  feed: {
    items,
    updatedAt: over.stale ? MOCK_STALE_UPDATED_AT : MOCK_FETCHED_AT,
    stale: over.stale ?? false,
    source: over.source ?? 'mock',
  },
});

const film = (over: Partial<FilmDiaryEntry> = {}): FilmDiaryEntry => ({
  id: 'x:1',
  kind: 'movie',
  title: 'Filme de teste',
  rewatch: false,
  liked: false,
  reviewUrl: 'https://letterboxd.com/',
  provenance: { source: 'letterboxd', fetchedAt: MOCK_FETCHED_AT },
  ...over,
});

const book = (over: Partial<Book> = {}): Book => ({
  id: 'x:b1',
  title: 'Livro de teste',
  authors: ['Autora'],
  status: 'read',
  provenance: { source: 'hardcover', fetchedAt: MOCK_FETCHED_AT },
  ...over,
});

afterEach(() => localStorage.removeItem('portfolio-lang'));

describe('FilmsDiary com o mock (CL-22, CL-25, CL-13)', () => {
  const noop = () => {};

  it('agrupa por mês, do mais recente ao mais antigo, e o "sem data" fica por último', () => {
    render(<FilmsDiary state={ready(mockFilms)} retry={noop} />, { wrapper });

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'novembro de 2026',
      'setembro de 2026',
      'agosto de 2026',
      'dezembro de 2025',
      'Sem data de exibição',
    ]);
    expect(screen.getAllByRole('listitem')).toHaveLength(mockFilms.length);
  });

  it('em inglês, meses e rótulos no idioma', () => {
    localStorage.setItem('portfolio-lang', 'en');
    render(<FilmsDiary state={ready(mockFilms)} retry={noop} />, { wrapper });

    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No watched date' })).toBeInTheDocument();
    expect(screen.getByText('PLACEHOLDER DATA')).toBeInTheDocument();
  });

  it('filme sem nota mostra "sem nota"; com nota, o texto acessível', () => {
    render(<FilmsDiary state={ready(mockFilms)} retry={noop} />, { wrapper });

    expect(screen.getAllByRole('img', { name: 'sem nota' })).toHaveLength(1);
    expect(screen.getByRole('img', { name: '3,5 de 5' })).toHaveTextContent('★★★½');
  });

  it('marcas de série, revisto e curtido', () => {
    render(<FilmsDiary state={ready(mockFilms)} retry={noop} />, { wrapper });

    expect(screen.getAllByText('série')).toHaveLength(
      mockFilms.filter((f) => f.kind === 'tv').length,
    );
    expect(screen.getAllByText('revisto')).toHaveLength(mockFilms.filter((f) => f.rewatch).length);
    expect(screen.getAllByText(/curtido/)).toHaveLength(mockFilms.filter((f) => f.liked).length);
  });

  it('resenha só ao expandir: curta inteira, longa truncada com link; publish:false some', () => {
    render(<FilmsDiary state={ready(mockFilms)} retry={noop} />, { wrapper });

    // film-1 (curta) e film-3 (longa); film-6 tem publish:false
    expect(screen.getAllByText('Ler resenha')).toHaveLength(2);
    expect(screen.queryByText(/decidiu não publicar/)).not.toBeInTheDocument();

    const more = screen.getAllByRole('link', { name: 'continuar no Letterboxd →' });

    expect(more).toHaveLength(1);
    expect(more[0]).toHaveAttribute('href', 'https://letterboxd.com/');
    expect(more[0]).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(/Resenha curta de exemplo/)).toBeInTheDocument();
  });

  it('todo item e a página são marcados como fictícios; o rodapé diz a fonte', () => {
    render(<FilmsDiary state={ready(mockFilms)} retry={noop} />, { wrapper });

    expect(screen.getByRole('note')).toHaveTextContent('DADOS FICTÍCIOS');
    expect(screen.getAllByText('fictício')).toHaveLength(mockFilms.length);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via dados fictícios');
    expect(screen.queryByText(/endorsed or certified by TMDB/)).not.toBeInTheDocument();
  });

  it('cada filme leva ao Letterboxd', () => {
    render(<FilmsDiary state={ready(mockFilms)} retry={noop} />, { wrapper });

    expect(screen.getAllByRole('link', { name: 'ver no Letterboxd →' })).toHaveLength(
      mockFilms.length,
    );
  });
});

describe('estados do diário (CL-11, CL-12)', () => {
  it('carregando', () => {
    render(<FilmsDiary state={{ status: 'loading' }} retry={() => {}} />, { wrapper });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
  });

  it('erro, com "Tentar de novo" que chama retry', () => {
    const retry = vi.fn();

    render(<FilmsDiary state={{ status: 'error' }} retry={retry} />, { wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar agora.');

    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('vazio: mensagem e o rodapé de sincronização continuam', () => {
    render(<FilmsDiary state={ready<FilmDiaryEntry>([])} retry={() => {}} />, { wrapper });

    expect(screen.getByText('Nenhum filme registrado ainda.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('vencido: avisa, mostra os itens e a data da última sincronização', () => {
    render(<FilmsDiary state={ready(mockFilms, { stale: true })} retry={() => {}} />, { wrapper });

    expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível atualizar agora/);
    expect(screen.getAllByRole('listitem')).toHaveLength(mockFilms.length);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/Última sincronização/);
  });

  it('fonte real: sem selo de dados fictícios', () => {
    render(
      <FilmsDiary
        state={ready([film({ watchedDate: '2026-05-02' })], { source: 'letterboxd' })}
        retry={() => {}}
      />,
      { wrapper },
    );

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.queryByText('fictício')).not.toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via Letterboxd');
  });
});

describe('DiaryEntry', () => {
  it('com pôster: imagem com alt de título e ano, e a atribuição do TMDB no diário', () => {
    render(
      <FilmsDiary
        state={ready([film({ year: 2020, posterUrl: '/p.jpg', watchedDate: '2026-05-02' })], {
          source: 'letterboxd',
        })}
        retry={() => {}}
      />,
      { wrapper },
    );

    expect(screen.getByRole('img', { name: 'Filme de teste (2020)' })).toHaveAttribute(
      'src',
      '/p.jpg',
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/not endorsed or certified by TMDB/);
  });

  it('sem pôster: não repete o título num placeholder', () => {
    const { container } = render(
      <ul>
        <DiaryEntry entry={film()} />
      </ul>,
      { wrapper },
    );

    expect(container.querySelector('.pe-row-poster')).toBeNull();
  });

  it('sem data de exibição e sem ano: só o título e a nota', () => {
    render(
      <ul>
        <DiaryEntry entry={film({ rating: 4 })} />
      </ul>,
      { wrapper },
    );

    expect(screen.getByText('Filme de teste')).toBeInTheDocument();
    expect(screen.queryByText(/\(\d{4}\)/)).not.toBeInTheDocument();
  });

  it('publish:false esconde a resenha; omitido (padrão) publica', () => {
    const { rerender } = render(
      <ul>
        <DiaryEntry entry={film({ review: 'Segredo', publish: false })} />
      </ul>,
      { wrapper },
    );

    expect(screen.queryByText('Ler resenha')).not.toBeInTheDocument();

    rerender(
      <ul>
        <DiaryEntry entry={film({ review: 'Aberta' })} />
      </ul>,
    );
    expect(screen.getByText('Ler resenha')).toBeInTheDocument();
  });
});

describe('ReviewBlock (CL-25)', () => {
  it('resenha curta: inteira e sem link de continuação', () => {
    render(<ReviewBlock review="Curta." url="https://letterboxd.com/x" />, { wrapper });

    expect(screen.getByText('RESENHA')).toBeInTheDocument();
    expect(screen.getByText('Curta.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('resenha longa: truncada, com reticências e o link canônico', () => {
    render(<ReviewBlock review={'palavra '.repeat(100)} url="https://letterboxd.com/x" />, {
      wrapper,
    });

    expect(screen.getByRole('link', { name: 'continuar no Letterboxd →' })).toHaveAttribute(
      'href',
      'https://letterboxd.com/x',
    );
    expect(screen.getByText(/…$/)).toBeInTheDocument();
  });
});

describe('BooksShelves com o mock (CL-21)', () => {
  const noop = () => {};

  it('seções: lendo agora, lidos por ano (com "sem data" no fim), pausados e quero ler', () => {
    render(<BooksShelves state={ready(mockBooks)} retry={noop} />, { wrapper });

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Lendo agora',
      'Lidos · 2026',
      'Lidos · 2025',
      'Lidos · Sem data de término',
      'Pausados e abandonados',
      'Quero ler',
    ]);
  });

  it('livro sem capa mostra o placeholder tipográfico; nenhum tenta carregar imagem', () => {
    const { container } = render(<BooksShelves state={ready(mockBooks)} retry={noop} />, {
      wrapper,
    });

    // 6 livros nas estantes (os 2 "quero ler" não têm capa, só texto)
    expect(container.querySelectorAll('.pe-cover-ph')).toHaveLength(6);
    expect(container.querySelector('img')).toBeNull();
  });

  it('nota, páginas, estado e nota editorial', () => {
    render(<BooksShelves state={ready(mockBooks)} retry={noop} />, { wrapper });

    expect(screen.getByRole('img', { name: '4,5 de 5' })).toBeInTheDocument();
    expect(screen.getByText('412 páginas')).toBeInTheDocument();
    expect(screen.getByText('pausado')).toBeInTheDocument();
    expect(screen.getByText('abandonado')).toBeInTheDocument();
    expect(screen.getByText(/Nota editorial de exemplo/)).toBeInTheDocument();
  });

  it('vários autores e título longo aparecem inteiros', () => {
    render(<BooksShelves state={ready(mockBooks)} retry={noop} />, { wrapper });

    expect(
      screen.getByText(
        'de Primeira autora de exemplo, Segundo autor de exemplo, Terceira autora de exemplo',
        { normalizer: (s) => s.replace(/\s+/g, ' ').trim() },
      ),
    ).toBeInTheDocument();
    // o título aparece na capa-placeholder e na legenda
    expect(screen.getAllByText(/extremamente longo/)).toHaveLength(2);
  });

  it('quero ler: lista ao lado, em grade 7/5', () => {
    const { container } = render(<BooksShelves state={ready(mockBooks)} retry={noop} />, {
      wrapper,
    });
    const aside = container.querySelector('aside')!;

    expect(container.querySelector('.pe-split')).not.toBeNull();
    expect(within(aside).getAllByRole('listitem')).toHaveLength(2);
  });

  it('sem "quero ler", a grade 7/5 não é usada', () => {
    const { container } = render(
      <BooksShelves state={ready([book({ finishedAt: '2026-01-01' })])} retry={noop} />,
      { wrapper },
    );

    expect(container.querySelector('.pe-split')).toBeNull();
    expect(container.querySelector('aside')).toBeNull();
  });

  it('livro lido sem nota diz "sem nota"; lendo sem nota não mostra nada', () => {
    render(
      <BooksShelves
        state={ready([
          book({ id: 'a', status: 'read', finishedAt: '2026-01-01' }),
          book({ id: 'b', status: 'reading', title: 'Em andamento' }),
        ])}
        retry={noop}
      />,
      { wrapper },
    );

    expect(screen.getAllByRole('img', { name: 'sem nota' })).toHaveLength(1);
  });

  it('selo de dados fictícios e rodapé', () => {
    render(<BooksShelves state={ready(mockBooks)} retry={noop} />, { wrapper });

    expect(screen.getByRole('note')).toHaveTextContent('DADOS FICTÍCIOS');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via dados fictícios');
  });
});

describe('estados da estante (CL-11)', () => {
  it('carregando, erro com retry, vazio e vencido', () => {
    const retry = vi.fn();
    const { rerender } = render(<BooksShelves state={{ status: 'loading' }} retry={retry} />, {
      wrapper,
    });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');

    rerender(<BooksShelves state={{ status: 'error' }} retry={retry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(retry).toHaveBeenCalledTimes(1);

    rerender(<BooksShelves state={ready<Book>([])} retry={retry} />);
    expect(screen.getByText('Nenhum livro registrado ainda.')).toBeInTheDocument();

    rerender(<BooksShelves state={ready(mockBooks, { stale: true })} retry={retry} />);
    expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível atualizar agora/);
  });
});

describe('páginas inteiras, com o mock real (CL-03, CL-20)', () => {
  it('/pessoal/filmes carrega o diário e mostra o selo de dados fictícios', async () => {
    renderApp('/pessoal/filmes');

    expect(await screen.findByRole('heading', { name: 'novembro de 2026' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Filmes' })).toBeInTheDocument();
    expect(screen.getByText('Pessoal / Filmes')).toHaveClass('pe-kicker');
    expect(screen.getByRole('note')).toHaveTextContent('DADOS FICTÍCIOS');
  });

  it('/personal/books em inglês', async () => {
    localStorage.setItem('portfolio-lang', 'en');
    renderApp('/personal/books');

    expect(await screen.findByRole('heading', { name: 'Reading now' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Books' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Want to read' })).toBeInTheDocument();
  });

  it('/pessoal/livros', async () => {
    renderApp('/pessoal/livros');

    expect(await screen.findByRole('heading', { name: 'Lendo agora' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('DADOS FICTÍCIOS');
  });
});
