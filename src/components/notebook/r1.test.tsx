// Caderno, revisão R1 (design.md §11): estrelas, grade de pôsteres, feed de atividade, /pessoal e a
// atividade recente na home. Flag ligada; dados do mock da Fase 1 (os testes rodam com ele).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { renderApp } from '../../test/helpers';
import { buildActivity, toHalf } from '../../data/notebook/activity';
import type { Book, FilmDiaryEntry } from '../../data/personal/types';
import { mockBooks } from '../../services/integrations/hardcover/mock';
import { mockFilms } from '../../services/integrations/letterboxd/mock';
import Stars from './Stars';
import PosterGrid from './PosterGrid';
import ActivityFeed from './ActivityFeed';
import { bookPosters, filmPosters } from './NotebookPersonal';

vi.mock('../../config', () => ({ CADERNO_V2: true }));

const css = readFileSync(join(process.cwd(), 'src/styles/notebook.css'), 'utf8');
const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);
const prov = { source: 'mock' as const, fetchedAt: '2026-11-01T00:00:00Z' };

afterEach(() => localStorage.removeItem('portfolio-lang'));

describe('estrelas (CD-91)', () => {
  it.each([
    [3.5, '3,5 de 5', '70%'],
    [0, '0 de 5', '0%'],
    [5, '5 de 5', '100%'],
    [4.26, '4,5 de 5', '90%'],
    [7, '5 de 5', '100%'],
  ])('nota %s → "%s" e preenchimento %s', (value, label, width) => {
    render(<Stars value={value} />, { wrapper });

    const img = screen.getByRole('img', { name: label });

    expect(img.querySelector<HTMLElement>('.nb-stars-fill')?.style.width).toBe(width);
  });

  it('sem nota mostra "sem nota", nunca zero presumido', () => {
    render(<Stars />, { wrapper });

    expect(screen.getByRole('img', { name: 'sem nota' })).toHaveTextContent('—');
  });

  it('meia estrela: arredonda à metade e limita a 0–5', () => {
    expect([0.2, 0.3, 2.74, 2.76, -1, 9].map(toHalf)).toEqual([0, 0.5, 2.5, 3, 0, 5]);
  });

  it('o preenchimento usa a cor quente e a base a cor de contorno (tokens)', () => {
    expect(css).toMatch(/\.nb-stars-fill \{[^}]*color: var\(--accent\)/);
    expect(css).toMatch(/\.nb-stars-base \{[^}]*color: var\(--border-ui\)/);
  });
});

describe('feed de atividade: dados (CD-92)', () => {
  const film = (over: Partial<FilmDiaryEntry>): FilmDiaryEntry => ({
    id: 'lb:x',
    kind: 'movie',
    title: 'X',
    rewatch: false,
    reviewUrl: 'https://letterboxd.com/x',
    provenance: prov,
    ...over,
  });
  const book = (over: Partial<Book>): Book => ({
    id: 'hc:x',
    title: 'Livro',
    authors: ['A'],
    status: 'read',
    provenance: prov,
    ...over,
  });

  it('só vira evento o que tem data; nada é presumido', () => {
    const items = buildActivity(
      [book({ id: 'hc:1', finishedAt: undefined, startedAt: undefined }), book({ id: 'hc:2', status: 'want' })],
      [film({ id: 'lb:1', watchedDate: undefined }), film({ id: 'lb:2', watchedDate: 'ontem' })],
    );

    expect(items).toEqual([]);
  });

  it('livro lido com início e fim gera dois eventos; a nota só vai no "terminou"', () => {
    const items = buildActivity(
      [book({ id: 'hc:1', rating: 4, startedAt: '2026-01-02', finishedAt: '2026-02-03' })],
      [],
    );

    expect(items.map((i) => [i.kind, i.date, i.rating])).toEqual([
      ['finished', '2026-02-03', 4],
      ['started', '2026-01-02', undefined],
    ]);
  });

  it('"terminou" só para status lido (dnf com data de fim não vira "terminou")', () => {
    const items = buildActivity([book({ status: 'dnf', finishedAt: '2026-02-03' })], []);

    expect(items).toEqual([]);
  });

  it('ordena do mais recente ao mais antigo; reassistir é seu próprio verbo; pôster do TMDB como reserva', () => {
    const items = buildActivity(
      [book({ id: 'hc:1', finishedAt: '2026-03-01' })],
      [
        film({ id: 'lb:a', watchedDate: '2026-01-10' }),
        film({
          id: 'lb:b',
          watchedDate: '2026-05-01T20:00:00Z',
          rewatch: true,
          meta: { tmdbId: 1, directors: [], genres: { pt: [], en: [] }, posterUrl: 'https://img/p.jpg' },
        }),
      ],
    );

    expect(items.map((i) => i.kind)).toEqual(['rewatched', 'finished', 'watched']);
    expect(items[0].date).toBe('2026-05-01');
    expect(items[0].image).toBe('https://img/p.jpg');
  });

  it('com o mock: todos os eventos têm data ISO e estão em ordem decrescente', () => {
    const items = buildActivity(mockBooks, mockFilms);
    const dates = items.map((i) => i.date);

    expect(items.length).toBeGreaterThan(0);
    expect(dates.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))).toBe(true);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe('feed de atividade: interface (CD-92)', () => {
  const items = buildActivity(mockBooks, mockFilms);

  it('cada linha diz "em [data], [ação] [título] — nota [estrelas]"', () => {
    render(<ActivityFeed items={items} />, { wrapper });

    const list = screen.getByRole('list', { name: /Atividade/ });
    const first = within(list).getAllByRole('listitem')[0];

    expect(first).toHaveTextContent(/^.*em \d{1,2} de \w+\.? de \d{4}, (assistiu|reassistiu|terminou de ler|começou a ler) /);
    expect(first.querySelector('time')).toHaveAttribute('dateTime', items[0].date);
  });

  it('concluído é verde (--ok) e "começou a ler" é quente (--accent)', () => {
    render(<ActivityFeed items={items} limit={100} />, { wrapper });

    expect(document.querySelector('[data-kind="watched"], [data-kind="finished"]')).toHaveClass('is-done');
    expect(document.querySelector('[data-kind="started"]')).toHaveClass('is-active');
    expect(css).toMatch(/\.nb-act\.is-done \.nb-act-verb \{\s*color: var\(--ok\)/);
    expect(css).toMatch(/\.nb-act\.is-active \.nb-act-verb \{\s*color: var\(--accent\)/);
  });

  it('"mostrar mais" revela o resto; vazio mostra a frase de vazio', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ActivityFeed items={items} limit={2} />, { wrapper });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: /mostrar mais/ }));
    expect(screen.getAllByRole('listitem')).toHaveLength(Math.min(4, items.length));
    unmount();

    render(<ActivityFeed items={[]} />, { wrapper });
    expect(screen.getByText('Nenhuma atividade com data nos feeds ainda.')).toBeInTheDocument();
  });

  it('em inglês: "on [date], watched …"', async () => {
    localStorage.setItem('portfolio-lang', 'en');
    render(<ActivityFeed items={items.filter((i) => i.kind === 'watched')} />, { wrapper });

    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(/^.*on \w+ \d{1,2}, \d{4}, watched /);
  });
});

describe('grade de pôsteres (CD-90)', () => {
  it('lista com rótulo; o nome do link traz título, linha e nota; sem imagem, cartaz tipográfico', () => {
    render(
      <PosterGrid
        label="Na tela: grade de capas"
        posters={[
          { id: 'a', title: 'Com pôster', sub: '2024', image: 'https://img/a.jpg', rating: 4.5, rated: true, href: 'https://x/a' },
          { id: 'b', title: 'Sem pôster', rated: true, href: '/pessoal/filmes' },
        ]}
      />,
      { wrapper },
    );

    const list = screen.getByRole('list', { name: 'Na tela: grade de capas' });
    const [a, b] = within(list).getAllByRole('link');

    expect(a).toHaveAccessibleName(/Com pôster.*2024.*4,5 de 5/);
    expect(a).toHaveAttribute('target', '_blank');
    expect(b).toHaveAccessibleName(/Sem pôster.*sem nota/);
    expect(b).toHaveAttribute('href', '/pessoal/filmes');
    expect(b).toHaveClass('is-typographic');
  });

  it('sem nenhum pôster, a grade não existe', () => {
    const { container } = render(<PosterGrid label="x" posters={[]} />, { wrapper });

    expect(container).toBeEmptyDOMElement();
  });

  it('o título aparece no hover e no foco, e sempre sem hover (toque); mosaico denso com destaque 2×2', () => {
    expect(css).toMatch(/\.nb-poster-link:hover \.nb-poster-info,\s*\.nb-poster-link:focus-visible \.nb-poster-info/);
    expect(css).toMatch(/@media \(hover: none\) \{\s*\.nb-poster-info \{\s*opacity: 1/);
    expect(css).toMatch(/grid-auto-flow: dense/);
    expect(css).toMatch(/\.nb-poster\.is-feature \{\s*grid-column: span 2;\s*grid-row: span 2/);
  });

  it('estante: lendo primeiro (em destaque, selo quente), depois lidos (selo verde, com nota); "quero ler" fica fora', () => {
    const posters = bookPosters(mockBooks, { reading: 'lendo', read: 'lido' });

    expect(posters[0]).toMatchObject({ feature: true, status: { tone: 'active', label: 'lendo' }, rated: false });
    expect(posters.slice(1).every((p) => p.status?.tone === 'done' && p.rated)).toBe(true);
    expect(posters.map((p) => p.id)).not.toContain('mock:book-5');
  });

  it('tela: do mais recente ao mais antigo, sem perder os sem data', () => {
    const posters = filmPosters(mockFilms);

    expect(posters).toHaveLength(Math.min(18, mockFilms.length));
    expect(posters[0].title).toMatch(/Filme de exemplo [12]/);
  });
});

describe('/pessoal no caderno (revisão R1)', () => {
  it('o feed é a visão principal e as grades substituem o índice em lista', async () => {
    const { container } = renderApp('/pessoal');

    expect(await screen.findByRole('heading', { level: 2, name: 'Atividade' })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll('.nb-act').length).toBeGreaterThan(0));
    expect(screen.getByRole('list', { name: 'Na estante: grade de capas' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Na tela: grade de capas' })).toBeInTheDocument();
    // O índice antigo (SectionIndex) não é montado.
    expect(container.querySelector('.pe-index')).toBeNull();
    // Um só h1 (o da cabeça editorial).
    expect(container.querySelectorAll('h1')).toHaveLength(1);

    // Feed antes das grades na ordem do DOM (no celular, o feed vem primeiro).
    const feed = container.querySelector('.nb-library-feed');
    const side = container.querySelector('.nb-library-side');

    expect(feed && side && feed.compareDocumentPosition(side) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('dados do mock continuam rotulados como fictícios', async () => {
    renderApp('/pessoal');

    expect(await screen.findAllByRole('note')).not.toHaveLength(0);
  });
});

describe('home (revisão R1)', () => {
  it('seções em tiles, sem números de capítulo, e a atividade recente com link para /pessoal', async () => {
    const { container } = renderApp('/');

    expect(container.querySelectorAll('.nb-tiles [data-row]')).toHaveLength(6);
    expect(container.querySelector('.nb-tiles')).not.toHaveTextContent(/\b0[1-6]\b/);

    const recent = await screen.findByRole('region', { name: 'Atividade recente' });

    expect(within(recent).getAllByRole('listitem').length).toBeLessThanOrEqual(4);
    expect(within(recent).getByText('dados de exemplo')).toBeInTheDocument();
    expect(within(recent).getByRole('link', { name: /toda a atividade/ })).toHaveAttribute('href', '/pessoal');
  });

  it('nenhum "Vol.", "Capítulo" ou "Sommaire" visível na home', () => {
    const { container } = renderApp('/');

    expect(container.querySelector('.nb-root')).not.toHaveTextContent(/VOL\.|CAPÍTULO|Sommaire/);
  });
});
