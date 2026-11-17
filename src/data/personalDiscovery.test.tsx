import { screen } from '@testing-library/react';
import { filterItems, paletteItems } from '../components/paletteItems';
import { renderApp } from '../test/helpers';
import { HOME } from './homeLayout';
import { routeById, routes } from './routes';
import { routeStatus } from './routeStatus';
import { topicKeywords } from './searchRanking';

const PAGE_IDS = [
  'pessoal',
  'pessoal-livros',
  'pessoal-filmes',
  'pessoal-musica',
  'pessoal-teatro',
];

describe('o espaço pessoal (D6, CL-06)', () => {
  it('a rota existe', () => {
    expect(routeById('pessoal')).toBeDefined();
  });

  it('a composição da home não promove o espaço: ele nunca disputa a atenção da home', () => {
    expect(HOME.blocks.map((b) => b.id)).not.toContain('personal');
  });
});

describe('home com o espaço no ar (CL-02, CL-06)', () => {
  const pages = PAGE_IDS.map((id) => routeStatus(id));
  const original = pages.map((r) => r.draft);
  const hub = routeStatus('pessoal');
  const originalShowInNav = hub.showInNav;

  afterEach(() => {
    pages.forEach((r, i) => (r.draft = original[i]));
    hub.showInNav = originalShowInNav;
  });

  // "No ar": nenhuma rota é rascunho e o hub deixa de depender do `showInNav` da prévia.
  const publish = () => {
    pages.forEach((r) => (r.draft = false));
    hub.showInNav = false;
  };
  const block = () => document.querySelector('[aria-labelledby="personal-title"]');
  const personalLinks = () =>
    screen.queryAllByRole('link').filter((a) => a.getAttribute('href') === '/pessoal');

  it('na prévia com dados fictícios (mock) o atalho aparece nos acessos rápidos', () => {
    renderApp('/');

    expect(personalLinks().length).toBeGreaterThan(0);
    expect(block()).toBeNull();
  });

  it('no ar, o atalho existe e o bloco não', () => {
    publish();
    renderApp('/');

    expect(block()).toBeNull();
    expect(personalLinks().length).toBeGreaterThan(0);
  });
});

describe('busca (CL-06)', () => {
  const items = paletteItems('pt');
  const ids = (query: string, list = items) => filterItems(list, query).map((i) => i.id);

  it('as cinco páginas têm palavras-chave em PT e EN', () => {
    for (const id of PAGE_IDS) {
      expect(topicKeywords[id]?.pt.trim(), id).toBeTruthy();
      expect(topicKeywords[id]?.en.trim(), id).toBeTruthy();
    }
  });

  it('o hub e as quatro seções estão na paleta, nos dois idiomas, com destino', () => {
    for (const lang of ['pt', 'en'] as const) {
      const list = paletteItems(lang);

      for (const id of PAGE_IDS) {
        const item = list.find((i) => i.id === `page:${id}`);

        expect(item, `${lang}/${id}`).toBeDefined();
        expect(Boolean(item!.to || item!.run), `${lang}/${id}`).toBe(true);
      }
    }
  });

  it.each([
    ['livros', 'page:pessoal-livros'],
    ['leitura', 'page:pessoal-livros'],
    ['cinema', 'page:pessoal-filmes'],
    ['letterboxd', 'page:pessoal-filmes'],
    ['discos', 'page:pessoal-musica'],
    ['palco', 'page:pessoal-teatro'],
    ['hobbies', 'page:pessoal'],
  ])('"%s" acha %s', (query, id) => {
    expect(ids(query)).toContain(id);
  });

  it('em inglês: "movies", "theatre" e "books" acham as páginas certas', () => {
    expect(ids('movies')).toContain('page:pessoal-filmes');
    expect(ids('theatre')).toContain('page:pessoal-teatro');
    expect(ids('books')).toContain('page:pessoal-livros');
  });

  it('o hub aparece na busca por "pessoal"', () => {
    expect(ids('pessoal')).toContain('page:pessoal');
  });

  it('a busca por um tema pessoal não confunde com projetos nem com o terminal', () => {
    expect(ids('livros')).not.toContain('page:terminal');
    expect(routes.filter((r) => r.parent === 'pessoal')).toHaveLength(4);
  });
});
