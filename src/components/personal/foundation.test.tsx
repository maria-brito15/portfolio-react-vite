import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Book, FilmDiaryEntry } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { mockBooks } from '../../services/integrations/hardcover/mock';
import { mockFilms } from '../../services/integrations/letterboxd/mock';
import { MOCK_FETCHED_AT } from '../../services/integrations/source';
import { renderApp } from '../../test/helpers';
import BookCard from './BookCard';
import BooksShelves from './BooksShelves';
import EditorialDivider from './EditorialDivider';
import EditorialHeader from './EditorialHeader';
import EditorialSection from './EditorialSection';
import FilmPoster from './FilmPoster';
import FilmsDiary from './FilmsDiary';
import StaleNotice from './StaleNotice';
import StatTile, { StatRow } from './StatTile';
import { Empty, ErrorState, Loading } from './States';

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

describe('os quatro estados, com a mesma aparência', () => {
  it('carregando, vazio, erro e vencido usam a mesma base visual (pe-state / pe-stale)', () => {
    const { container } = render(
      <>
        <Loading />
        <Empty>Nada.</Empty>
        <ErrorState onRetry={() => {}} />
        <StaleNotice stale updatedAt="2026-11-12T06:00:00Z" />
      </>,
      { wrapper },
    );
    const classes = [...container.querySelectorAll('p')].map((p) => p.className);

    expect(classes).toHaveLength(4);
    expect(classes.slice(0, 3).every((c) => c.startsWith('pe-state'))).toBe(true);
    expect(classes[3]).toBe('pe-stale');
  });

  it('o CSS dá aos quatro a mesma geometria (um só bloco de regras)', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/personal.css'), 'utf8');

    expect(css).toMatch(/\.pe-state,\s*\.pe-stale\s*\{[^}]*border-left:/);
  });

  it('papéis certos: carregando e vencido são "status"; erro é "alert"; vazio é só texto', () => {
    render(
      <>
        <Loading />
        <Empty>Nada.</Empty>
        <ErrorState onRetry={() => {}} />
        <StaleNotice stale updatedAt="2026-11-12T06:00:00Z" />
      </>,
      { wrapper },
    );

    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByText('Nada.')).not.toHaveAttribute('role');
  });

  it('o erro oferece "Tentar de novo"', () => {
    const retry = vi.fn();

    render(<ErrorState onRetry={retry} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('em inglês', () => {
    window.history.replaceState(null, '', '/en');
    render(
      <>
        <Loading />
        <ErrorState onRetry={() => {}} />
      </>,
      { wrapper },
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});

describe('StatTile e StatRow', () => {
  it('rótulo, valor e dica numa lista de definição', () => {
    const { container } = render(
      <StatRow>
        <StatTile label="Lidos em 2026" value={12} hint="até agora" />
      </StatRow>,
    );

    expect(container.querySelector('dl.pe-stats')).not.toBeNull();
    expect(container.querySelector('dt')).toHaveTextContent('Lidos em 2026');
    expect(container.querySelector('dd.pe-stat-value')).toHaveTextContent('12');
    expect(container.querySelector('dd.pe-stat-hint')).toHaveTextContent('até agora');
  });

  it('sem valor mostra travessão, e o zero continua zero', () => {
    const { container } = render(
      <StatRow>
        <StatTile label="A" />
        <StatTile label="B" value={0} />
      </StatRow>,
    );
    const values = [...container.querySelectorAll('.pe-stat-value')].map((v) => v.textContent);

    expect(values).toEqual(['—', '0']);
  });
});

describe('EditorialSection, EditorialDivider e EditorialHeader', () => {
  it('a seção é nomeada pelo próprio título', () => {
    render(
      <EditorialSection title="Em rotação">
        <p>Conteúdo</p>
      </EditorialSection>,
    );

    const region = screen.getByRole('region', { name: 'Em rotação' });

    expect(
      within(region).getByRole('heading', { level: 2, name: 'Em rotação' }),
    ).toBeInTheDocument();
    expect(within(region).getByText('Conteúdo')).toBeInTheDocument();
  });

  it('duas seções não repetem o id do título', () => {
    const { container } = render(
      <>
        <EditorialSection title="A">x</EditorialSection>
        <EditorialSection title="B">y</EditorialSection>
      </>,
    );
    const ids = [...container.querySelectorAll('h2')].map((h) => h.id);

    expect(new Set(ids).size).toBe(2);
  });

  it('a seção pode ser lateral (aside)', () => {
    const { container } = render(
      <EditorialSection as="aside" title="Quero ler">
        x
      </EditorialSection>,
    );

    expect(container.querySelector('aside.pe-month')).not.toBeNull();
  });

  it('o divisor é decorativo', () => {
    const { container } = render(<EditorialDivider />);

    expect(container.querySelector('hr')).toHaveAttribute('aria-hidden', 'true');
  });

  it('o número editorial é decorativo e fica fora do título', () => {
    render(<EditorialHeader number="003" kicker="Pessoal / Filmes" title="Filmes" deck="lede" />);

    expect(screen.getByText('003')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Filmes$/);
  });

  it('sem número, nada é renderizado no lugar', () => {
    const { container } = render(<EditorialHeader kicker="K" title="T" />);

    expect(container.querySelector('.pe-number')).toBeNull();
  });
});

describe('BookCard e FilmPoster', () => {
  const book: Book = {
    id: 'x',
    title: 'Livro de teste',
    authors: ['Autora A', 'Autor B'],
    status: 'read',
    pages: 200,
    rating: 4,
    provenance: { source: 'hardcover', fetchedAt: MOCK_FETCHED_AT },
  };

  it('BookCard: título, autores, nota, páginas; sem capa usa o placeholder tipográfico', () => {
    const { container } = render(<BookCard book={book} />, { wrapper });

    expect(screen.getAllByText('Livro de teste')).toHaveLength(2);
    expect(screen.getByText('de Autora A, Autor B')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '4 de 5' })).toBeInTheDocument();
    expect(screen.getByText('200 páginas')).toBeInTheDocument();
    expect(container.querySelector('.pe-cover-ph')).not.toBeNull();
  });

  it('BookCard: com capa mostra a imagem, com dimensões e carregamento preguiçoso', () => {
    render(<BookCard book={{ ...book, coverUrl: '/capa.jpg' }} />, { wrapper });

    const img = screen.getByRole('img', { name: 'Livro de teste' });

    expect(img).toHaveAttribute('src', '/capa.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('BookCard: só o dado de fonte real fica sem a marca de fictício', () => {
    render(<BookCard book={book} />, { wrapper });

    expect(screen.queryByText('fictício')).not.toBeInTheDocument();
  });

  const film = { title: 'Filme de teste', year: 2020, posterUrl: '/p.jpg' };

  it('FilmPoster: imagem com título e ano no alt', () => {
    render(<FilmPoster entry={film} />, { wrapper });

    expect(screen.getByRole('img', { name: 'Filme de teste (2020)' })).toHaveAttribute(
      'src',
      '/p.jpg',
    );
  });

  it('FilmPoster: sem imagem, placeholder; sem ano, alt só com o título', () => {
    render(<FilmPoster entry={{ title: 'Sem ano' }} />, { wrapper });

    expect(screen.getByRole('img', { name: 'Sem ano' })).toHaveClass('pe-cover-ph');
  });
});

describe('estatísticas nas páginas (ReadingStats, FilmStats)', () => {
  it('Filmes: assistidos no ano, revistos, curtidos e nota média, calculados dos itens', () => {
    const { container } = render(<FilmsDiary state={ready(mockFilms)} retry={() => {}} />, {
      wrapper,
    });
    const tiles = Object.fromEntries(
      [...container.querySelectorAll('.pe-stat')].map((t) => [
        t.querySelector('dt')!.textContent,
        t.querySelector('dd')!.textContent,
      ]),
    );

    expect(tiles).toEqual({
      'Assistidos em 2026': '6',
      Revistos: '2',
      Curtidos: '3',
      'Nota média': '3,8',
    });
  });

  it('Livros: lidos no ano, páginas, nota média e lendo agora', () => {
    const { container } = render(<BooksShelves state={ready(mockBooks)} retry={() => {}} />, {
      wrapper,
    });
    const tiles = Object.fromEntries(
      [...container.querySelectorAll('.pe-stat')].map((t) => [
        t.querySelector('dt')!.textContent,
        t.querySelector('dd')!.textContent,
      ]),
    );

    expect(tiles).toEqual({
      'Lidos em 2026': '1',
      'Páginas lidas': '288',
      'Nota média': '4,5',
      'Lendo agora': '1',
    });
  });

  it('em inglês: rótulos e média com ponto', () => {
    window.history.replaceState(null, '', '/en');

    const { container } = render(<FilmsDiary state={ready(mockFilms)} retry={() => {}} />, {
      wrapper,
    });

    expect(container.querySelector('.pe-stats')).toHaveTextContent('Watched in 2026');
    expect(container.querySelector('.pe-stats')).toHaveTextContent('3.8');
  });

  it('sem itens, nenhum número é mostrado (só o estado vazio)', () => {
    const { container } = render(
      <>
        <FilmsDiary state={ready<FilmDiaryEntry>([])} retry={() => {}} />
        <BooksShelves state={ready<Book>([])} retry={() => {}} />
      </>,
      { wrapper },
    );

    expect(container.querySelector('.pe-stats')).toBeNull();
    expect(screen.getByText('Nenhum filme registrado ainda.')).toBeInTheDocument();
  });

  it('livros lidos sem páginas: o número fica "—", não zero', () => {
    const books: Book[] = [
      {
        id: 'a',
        title: 'A',
        authors: ['X'],
        status: 'read',
        finishedAt: '2026-01-01',
        provenance: { source: 'hardcover', fetchedAt: MOCK_FETCHED_AT },
      },
    ];
    const { container } = render(<BooksShelves state={ready(books)} retry={() => {}} />, {
      wrapper,
    });
    const tile = [...container.querySelectorAll('.pe-stat')].find((t) =>
      t.textContent?.includes('Páginas lidas'),
    )!;

    expect(tile.querySelector('dd')).toHaveTextContent('—');
  });
});

describe('numeração editorial nas páginas (001 a 005)', () => {
  it.each([
    ['/pessoal', '001'],
    ['/pessoal/livros', '002'],
    ['/pessoal/filmes', '003'],
    ['/pessoal/musica', '004'],
    ['/pessoal/teatro', '005'],
  ])('%s mostra %s', async (path, number) => {
    renderApp(path);

    expect(await screen.findByText(number)).toHaveClass('pe-number');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});

describe('entrada no menu, nos dois idiomas (Navegação)', () => {
  const sidebarLink = () =>
    screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/pessoal' && a.closest('nav, aside'))
      .map((a) => a.textContent);

  it('PT: "Pessoal" aparece no menu lateral, em qualquer página', () => {
    renderApp('/sobre');

    expect(sidebarLink().some((text) => /Pessoal/.test(text ?? ''))).toBe(true);
  });

  it('EN: "Personal" aparece no menu lateral', () => {
    window.history.replaceState(null, '', '/en');
    renderApp('/en/about');

    expect(sidebarLink().some((text) => /Personal/.test(text ?? ''))).toBe(true);
  });

  it('as subpáginas não entram no menu (vivem dentro do hub)', () => {
    renderApp('/sobre');

    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));

    expect(hrefs.some((h) => h?.startsWith('/pessoal/'))).toBe(false);
  });
});
