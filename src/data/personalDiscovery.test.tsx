import { screen } from '@testing-library/react';
import { filterItems, paletteItems } from '../components/paletteItems';
import { PERSONA_KEY } from '../hooks/usePersona';
import { renderApp } from '../test/helpers';
import { PERSONA_IDS, isPick, personaById, type PersonaId } from './personas';
import { DEFAULT_HOME, personaHome } from './personaHome';
import { routeById, routes } from './routes';
import { personaTopics, topicKeywords } from './searchRanking';

const HIGHLIGHT: PersonaId[] = ['amigo', 'professor'];
const MENU_ONLY = PERSONA_IDS.filter((id) => !HIGHLIGHT.includes(id));
const PAGE_IDS = [
  'pessoal',
  'pessoal-livros',
  'pessoal-filmes',
  'pessoal-musica',
  'pessoal-teatro',
];

describe('personas: quem destaca o espaço (D6, CL-06)', () => {
  it.each(HIGHLIGHT)('%s tem o espaço na ordem de destaque', (id) => {
    expect(personaById(id)!.order).toContain('pessoal');
    expect(isPick(personaById(id), 'pessoal')).toBe(true);
  });

  it.each(MENU_ONLY)('%s não o promove', (id) => {
    expect(personaById(id)!.order).not.toContain('pessoal');
    expect(isPick(personaById(id), 'pessoal')).toBe(false);
  });

  it('o amigo o põe logo depois de "sobre"; o professor, depois da trajetória acadêmica', () => {
    const amigo = personaById('amigo')!.order;
    const professor = personaById('professor')!.order;

    expect(amigo.indexOf('pessoal')).toBe(amigo.indexOf('sobre') + 1);
    expect(professor.indexOf('pessoal')).toBeGreaterThan(professor.indexOf('academico'));
  });

  it('a rota existe e o destaque não muda o chamado (cta) de nenhuma persona', () => {
    expect(routeById('pessoal')).toBeDefined();

    for (const id of PERSONA_IDS) expect(personaById(id)!.cta.route).not.toBe('pessoal');
  });
});

describe('composição da home (D6)', () => {
  const hasBlock = (blocks: { id: string }[]) => blocks.some((b) => b.id === 'personal');

  it.each(HIGHLIGHT)('%s traz o bloco do espaço pessoal, com textos em PT e EN', (id) => {
    const block = personaHome[id].blocks.find((b) => b.id === 'personal')!;

    expect(block).toBeDefined();
    for (const text of [block.title, block.lead]) {
      expect(text!.pt.trim()).not.toBe('');
      expect(text!.en.trim()).not.toBe('');
    }
  });

  it.each(MENU_ONLY)('%s não traz o bloco, mas mantém todos os atalhos', (id) => {
    expect(hasBlock(personaHome[id].blocks)).toBe(false);
    expect(personaHome[id].blocks.map((b) => b.id)).toContain('quick');
  });

  it('a composição padrão (sem persona) não o promove', () => {
    expect(hasBlock(DEFAULT_HOME.blocks)).toBe(false);
  });

  it('o bloco vem depois do conteúdo principal da persona, nunca na frente', () => {
    for (const id of HIGHLIGHT) expect(personaHome[id].blocks[0].id).not.toBe('personal');
  });
});

describe('home com o espaço no ar (CL-02, CL-06)', () => {
  const pages = PAGE_IDS.map((id) => routeById(id)!);
  const original = pages.map((r) => r.draft);

  afterEach(() => {
    pages.forEach((r, i) => (r.draft = original[i]));
    localStorage.removeItem(PERSONA_KEY);
  });

  const publish = () => pages.forEach((r) => (r.draft = false));
  const block = () => document.querySelector('[aria-labelledby="personal-title"]');
  const personalLinks = () =>
    screen.queryAllByRole('link').filter((a) => a.getAttribute('href') === '/pessoal');

  it('enquanto o espaço é rascunho (mock), a home não o anuncia para ninguém', () => {
    for (const id of PERSONA_IDS) {
      localStorage.setItem(PERSONA_KEY, id);

      const { unmount } = renderApp('/');

      expect(block(), id).toBeNull();
      expect(personalLinks(), id).toHaveLength(0);
      unmount();
    }
  });

  it.each(HIGHLIGHT)('no ar, %s vê o bloco com o hub e as seções com conteúdo', (id) => {
    publish();
    localStorage.setItem(PERSONA_KEY, id);
    renderApp('/');

    expect(block()).not.toBeNull();
    expect(block()!.querySelector('a[href="/pessoal"]')).not.toBeNull();
    expect(block()!.querySelector('a[href="/pessoal/livros"]')).not.toBeNull();
    expect(block()!.querySelector('a[href="/pessoal/teatro"]')).not.toBeNull();
  });

  it('o bloco só lista seções que não são rascunho (música e teatro vazios ficam de fora)', () => {
    publish();
    routeById('pessoal-musica')!.draft = true;
    routeById('pessoal-teatro')!.draft = true;
    localStorage.setItem(PERSONA_KEY, 'amigo');
    renderApp('/');

    expect(block()!.querySelector('a[href="/pessoal/livros"]')).not.toBeNull();
    expect(block()!.querySelector('a[href="/pessoal/musica"]')).toBeNull();
    expect(block()!.querySelector('a[href="/pessoal/teatro"]')).toBeNull();
  });

  it.each(MENU_ONLY)(
    'no ar, %s não vê o bloco, mas o atalho continua nos acessos rápidos',
    (id) => {
      publish();
      localStorage.setItem(PERSONA_KEY, id);
      renderApp('/');

      expect(block()).toBeNull();
      expect(personalLinks().length).toBeGreaterThan(0);
    },
  );

  it('sem persona, no ar, o atalho existe e o bloco não', () => {
    publish();
    renderApp('/');

    expect(block()).toBeNull();
    expect(personalLinks().length).toBeGreaterThan(0);
  });
});

describe('busca (CL-06): só ordena, nunca esconde', () => {
  const items = paletteItems('pt');
  const ids = (query: string, persona?: PersonaId, list = items) =>
    filterItems(list, query, persona).map((i) => i.id);

  it('amigo e professor priorizam o espaço pessoal; os outros não', () => {
    for (const id of HIGHLIGHT) expect(personaTopics[id]).toContain('pessoal');

    for (const id of MENU_ONLY) expect(personaTopics[id]).not.toContain('pessoal');
  });

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

  it.each(['pessoal', 'livros', 'cinema', 'music', 'teatro', 'personal'])(
    'mesmo conjunto de resultados com e sem persona para "%s"',
    (query) => {
      const plain = ids(query).sort();

      for (const persona of PERSONA_IDS) expect(ids(query, persona).sort()).toEqual(plain);
    },
  );

  it('nenhuma persona perde o acesso: o hub sempre aparece na busca por "pessoal"', () => {
    for (const persona of PERSONA_IDS) expect(ids('pessoal', persona)).toContain('page:pessoal');
  });

  it('a busca por um tema pessoal não confunde com projetos nem com o terminal', () => {
    expect(ids('livros')).not.toContain('page:terminal');
    expect(routes.filter((r) => r.parent === 'pessoal')).toHaveLength(4);
  });
});
