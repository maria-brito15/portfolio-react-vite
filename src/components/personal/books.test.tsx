import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { favoriteBooks, readingActivity } from '../../data/personal/stats';
import type { Book } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { mockBooks } from '../../services/integrations/hardcover/mock';
import { MOCK_FETCHED_AT } from '../../services/integrations/source';
import BookCard from './BookCard';
import BooksShelves from './BooksShelves';
import ReviewBlock from './ReviewBlock';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

const ready = (
  items: Book[],
  source: 'mock' | 'hardcover' = 'hardcover',
  stale = false,
): PersonalState<Book> => ({
  status: 'ready',
  feed: { items, updatedAt: MOCK_FETCHED_AT, stale, source },
});

const book = (over: Partial<Book> = {}): Book => ({
  id: 'hc:1',
  title: 'Livro de teste',
  authors: ['Autora'],
  status: 'read',
  provenance: {
    source: 'hardcover',
    url: 'https://hardcover.app/books/x',
    fetchedAt: MOCK_FETCHED_AT,
  },
  ...over,
});

afterEach(() => localStorage.removeItem('portfolio-lang'));

describe('readingActivity e favoriteBooks (funções puras)', () => {
  it('atividade: livros terminados por mês, do mais recente ao mais antigo, com as páginas', () => {
    const months = readingActivity([
      book({ id: 'a', finishedAt: '2026-09-02', pages: 100 }),
      book({ id: 'b', finishedAt: '2026-09-20', pages: 50 }),
      book({ id: 'c', finishedAt: '2026-07-01' }),
      book({ id: 'd', finishedAt: '2025-12-31', pages: 10 }),
    ]);

    expect(months).toEqual([
      { month: '2026-09', books: 2, pages: 150 },
      { month: '2026-07', books: 1, pages: undefined },
      { month: '2025-12', books: 1, pages: 10 },
    ]);
  });

  it('atividade: só livro lido e com data; limita os meses; vazio dá vazio', () => {
    expect(
      readingActivity([
        book({ status: 'reading', finishedAt: '2026-01-01' }),
        book({ id: 'x' }),
        book({ id: 'y', status: 'dnf', finishedAt: '2026-02-01' }),
      ]),
    ).toEqual([]);

    const many = Array.from({ length: 10 }, (_, i) =>
      book({ id: `m${i}`, finishedAt: `2026-${String(i + 1).padStart(2, '0')}-10` }),
    );

    expect(readingActivity(many)).toHaveLength(6);
    expect(readingActivity(many, 3).map((m) => m.month)).toEqual(['2026-10', '2026-09', '2026-08']);
    expect(readingActivity([])).toEqual([]);
  });

  it('favoritos: só nota 5, o término mais recente primeiro, com limite', () => {
    const books = [
      book({ id: 'a', rating: 5, finishedAt: '2025-01-01' }),
      book({ id: 'b', rating: 4.5, finishedAt: '2026-01-01' }),
      book({ id: 'c', rating: 5, finishedAt: '2026-05-01' }),
      book({ id: 'd', rating: 5 }),
    ];

    expect(favoriteBooks(books).map((b) => b.id)).toEqual(['c', 'a', 'd']);
    expect(favoriteBooks(books, 1).map((b) => b.id)).toEqual(['c']);
    expect(favoriteBooks([book({ rating: 4 })])).toEqual([]);
  });
});

describe('BookCard: andamento e resenha', () => {
  it('lendo: barra de progresso e o texto com páginas e percentual', () => {
    render(<BookCard book={book({ status: 'reading', progress: { pages: 120, percent: 29 } })} />, {
      wrapper,
    });

    expect(screen.getByRole('progressbar', { name: '120 páginas lidas · 29%' })).toHaveAttribute(
      'value',
      '29',
    );
    expect(screen.getByText('120 páginas lidas · 29%')).toBeInTheDocument();
  });

  it('só páginas, sem percentual: texto, sem barra', () => {
    render(<BookCard book={book({ status: 'reading', progress: { pages: 50 } })} />, { wrapper });

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('50 páginas lidas')).toBeInTheDocument();
  });

  it('sem andamento, nada é mostrado', () => {
    const { container } = render(<BookCard book={book({ status: 'reading' })} />, { wrapper });

    expect(container.querySelector('.pe-progress')).toBeNull();
  });

  it('resenha curta inteira, sem link de continuação', () => {
    render(<BookCard book={book({ review: 'Gostei bastante.' })} />, { wrapper });

    expect(screen.getByText('RESENHA')).toBeInTheDocument();
    expect(screen.getByText('Gostei bastante.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Hardcover/ })).not.toBeInTheDocument();
  });

  it('resenha longa: truncada, com link ao livro no Hardcover', () => {
    render(<BookCard book={book({ review: 'palavra '.repeat(200) })} />, { wrapper });

    expect(screen.getByRole('link', { name: 'ler no Hardcover →' })).toHaveAttribute(
      'href',
      'https://hardcover.app/books/x',
    );
  });

  it('resenha longa sem endereço do livro: sem link (nunca um link quebrado)', () => {
    render(
      <BookCard
        book={book({
          review: 'palavra '.repeat(200),
          provenance: { source: 'hardcover', fetchedAt: MOCK_FETCHED_AT },
        })}
      />,
      { wrapper },
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('sem resenha, nenhum bloco de resenha', () => {
    render(<BookCard book={book()} />, { wrapper });

    expect(screen.queryByText('RESENHA')).not.toBeInTheDocument();
  });

  it('ReviewBlock sem url e sem rótulo continua funcionando (uso do Letterboxd intacto)', () => {
    render(<ReviewBlock review={'x '.repeat(400)} url="https://letterboxd.com/y" />, { wrapper });

    expect(screen.getByRole('link', { name: 'continuar no Letterboxd →' })).toBeInTheDocument();
  });
});

describe('BooksShelves: favoritos, atividade e perfil', () => {
  const noop = () => {};

  it('favoritos: livros com nota 5, em seção própria', () => {
    render(<BooksShelves state={ready(mockBooks, 'mock')} retry={noop} />, { wrapper });

    const section = screen.getByRole('region', { name: 'Favoritos · nota 5' });

    expect(within(section).getAllByRole('listitem')).toHaveLength(favoriteBooks(mockBooks).length);
    expect(within(section).getByRole('img', { name: '5 de 5' })).toBeInTheDocument();
  });

  it('sem nenhum livro nota 5, a seção de favoritos não aparece', () => {
    render(
      <BooksShelves state={ready([book({ rating: 4, finishedAt: '2026-01-01' })])} retry={noop} />,
      { wrapper },
    );

    expect(screen.queryByRole('region', { name: /Favoritos/ })).not.toBeInTheDocument();
  });

  it('atividade de leitura: um item por mês com livros e páginas', () => {
    render(<BooksShelves state={ready(mockBooks, 'mock')} retry={noop} />, { wrapper });

    const section = screen.getByRole('region', { name: 'Atividade de leitura' });
    const items = within(section)
      .getAllByRole('listitem')
      .map((li) => li.textContent);

    expect(items).toEqual([
      'setembro de 20261 livro · 288 páginas',
      'dezembro de 20251 livro · 176 páginas',
    ]);
  });

  it('sem nenhum livro lido com data, sem seção de atividade', () => {
    render(<BooksShelves state={ready([book({ status: 'want' })])} retry={noop} />, { wrapper });

    expect(screen.queryByRole('region', { name: 'Atividade de leitura' })).not.toBeInTheDocument();
  });

  it('em inglês: rótulos e contagem no singular e plural', () => {
    localStorage.setItem('portfolio-lang', 'en');
    render(
      <BooksShelves
        state={ready([
          book({ id: 'a', finishedAt: '2026-05-01', pages: 100 }),
          book({ id: 'b', finishedAt: '2026-05-09', pages: 1000 }),
          book({ id: 'c', finishedAt: '2026-04-09' }),
        ])}
        retry={noop}
      />,
      { wrapper },
    );

    const section = screen.getByRole('region', { name: 'Reading activity' });

    expect(section).toHaveTextContent('2 books · 1,100 pages');
    expect(section).toHaveTextContent('1 book');
    expect(screen.getByRole('link', { name: 'View profile on Hardcover →' })).toBeInTheDocument();
  });

  it('link do perfil do Hardcover só com dado real, abrindo fora do site', () => {
    const { rerender } = render(<BooksShelves state={ready([book()])} retry={noop} />, { wrapper });
    const link = screen.getByRole('link', { name: 'Ver perfil no Hardcover →' });

    expect(link).toHaveAttribute('href', 'https://hardcover.app/@dudapbrt');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    rerender(<BooksShelves state={ready([book()], 'mock')} retry={noop} />);
    expect(screen.queryByRole('link', { name: /perfil no Hardcover/ })).not.toBeInTheDocument();
  });

  it('os quatro estados continuam: carregando, erro, vazio e vencido (com a data)', () => {
    const { rerender } = render(<BooksShelves state={{ status: 'loading' }} retry={noop} />, {
      wrapper,
    });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');

    rerender(<BooksShelves state={{ status: 'error' }} retry={noop} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<BooksShelves state={ready([])} retry={noop} />);
    expect(screen.getByText('Nenhum livro registrado ainda.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /perfil/ })).toBeInTheDocument();

    rerender(<BooksShelves state={ready([book()], 'hardcover', true)} retry={noop} />);
    expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível atualizar agora/);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via Hardcover');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Última sincronização');
  });
});
