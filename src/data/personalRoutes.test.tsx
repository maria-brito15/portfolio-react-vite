import { screen } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import {
  crumbsFor,
  directories,
  findPageByPath,
  navRoutes,
  routeById,
  routes,
  windowPath,
} from './routes';
import { SITE_URL, headTags, metaFor } from './seo';

const PAGES = [
  { id: 'pessoal', pt: '/pessoal', en: '/personal', h1: ['Pessoal', 'Personal'] },
  { id: 'pessoal-livros', pt: '/pessoal/livros', en: '/personal/books', h1: ['Livros', 'Books'] },
  { id: 'pessoal-filmes', pt: '/pessoal/filmes', en: '/personal/films', h1: ['Filmes', 'Films'] },
  { id: 'pessoal-musica', pt: '/pessoal/musica', en: '/personal/music', h1: ['Música', 'Music'] },
  {
    id: 'pessoal-teatro',
    pt: '/pessoal/teatro',
    en: '/personal/theater',
    h1: ['Teatro', 'Theater'],
  },
];

afterEach(() => {
  localStorage.removeItem('portfolio-lang');
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('rotas do espaço cultural (CL-01)', () => {
  it('cinco rotas, em um só lugar, com caminho em PT e alias em EN', () => {
    for (const p of PAGES) {
      expect(findPageByPath(p.pt)?.id, p.pt).toBe(p.id);
      expect(findPageByPath(p.en)?.id, p.en).toBe(p.id);
      expect(findPageByPath(`${p.pt}/`)?.id, `${p.pt}/`).toBe(p.id);
    }

    expect(routes.filter((r) => r.id.startsWith('pessoal'))).toHaveLength(PAGES.length);
  });

  it('as quatro subpáginas ficam sob o hub e fora da barra lateral e do ls', () => {
    for (const p of PAGES.slice(1)) {
      const route = routeById(p.id)!;

      expect(route.parent, p.id).toBe('pessoal');
      expect(route.hidden, p.id).toBe(true);
      expect(route.group, p.id).toBeUndefined();
      expect(directories.some((d) => d.id === p.id)).toBe(false);
    }
  });

  it('o hub é do grupo "personal" da barra lateral', () => {
    expect(routeById('pessoal')?.group).toBe('personal');
  });

  it('caminho inexistente dentro do espaço cai no 404', () => {
    expect(findPageByPath('/pessoal/xyz')).toBeUndefined();
    expect(findPageByPath('/personal/livros')).toBeUndefined();
  });
});

describe('rascunho enquanto houver mock (CL-02)', () => {
  it('nos testes (modo mock) as cinco rotas são rascunho, mas só o hub aparece no menu', () => {
    for (const p of PAGES) expect(routeById(p.id)?.draft, p.id).toBe(true);

    // o hub tem `showInNav`: entra na barra lateral mesmo como rascunho (prévia com dados fictícios)
    expect(routeById('pessoal')?.showInNav).toBe(true);
    expect(navRoutes('personal').map((r) => r.id)).toContain('pessoal');
    // as subpáginas são ocultas: nunca entram na barra
    expect(navRoutes('personal').some((r) => r.id.startsWith('pessoal-'))).toBe(false);
  });

  it('rascunho sai com noindex, e o alias aponta o canonical para o caminho principal', () => {
    for (const p of PAGES) {
      const { tags } = headTags(p.id, 'pt');
      const get = (key: string) => tags.find((t) => Object.values(t.attrs).includes(key));

      expect(get('robots')?.attrs.content, p.id).toContain('noindex');
      expect(get('canonical')?.attrs.href, p.id).toBe(`${SITE_URL}${p.pt}`);
    }
  });

  it('com a fonte em "live" saem do rascunho as rotas com conteúdo; música e teatro (manuais e vazios) não', async () => {
    vi.stubEnv('VITE_PERSONAL_SOURCE', 'live');
    vi.resetModules();

    const live = await import('./routes');

    // música e teatro são curadoria manual da Duda: sem itens, continuam em construção
    const manual = ['pessoal-musica', 'pessoal-teatro'];

    for (const p of PAGES) expect(live.routeById(p.id)?.draft, p.id).toBe(manual.includes(p.id));
    expect(live.navRoutes('personal').map((r) => r.id)).toContain('pessoal');
    expect(live.navRoutes('personal').some((r) => r.id.startsWith('pessoal-'))).toBe(false);
  });
});

describe('breadcrumb e título da janela (CL-03)', () => {
  it('usa o vocabulário do idioma em todas as páginas', () => {
    expect(windowPath(routeById('pessoal'), 'pt')).toBe('~/pessoal');
    expect(windowPath(routeById('pessoal'), 'en')).toBe('~/personal');
    expect(windowPath(routeById('pessoal-livros'), 'pt')).toBe('~/pessoal/livros');
    expect(windowPath(routeById('pessoal-livros'), 'en')).toBe('~/personal/books');
    expect(windowPath(routeById('pessoal-musica'), 'en')).toBe('~/personal/music');
  });

  it('o breadcrumb da subpágina leva ao hub', () => {
    expect(crumbsFor(routeById('pessoal-teatro'), 'en')).toEqual([
      { label: 'personal', to: '/pessoal' },
      { label: 'theater', to: '/pessoal/teatro' },
    ]);
  });

  it('o breadcrumb dos estudos de caso continua igual', () => {
    expect(crumbsFor(routeById('whatsapp-dispatcher'), 'en').map((c) => c.label)).toEqual([
      'projects',
      'whatsapp-dispatcher',
    ]);
  });
});

describe('SEO por rota (CL-04)', () => {
  it('título e descrição próprios em PT e EN', () => {
    for (const p of PAGES) {
      expect(metaFor(p.id, 'pt').title, p.id).not.toBe(metaFor('notFound', 'pt').title);
      expect(metaFor(p.id, 'en').title, p.id).not.toBe(metaFor(p.id, 'pt').title);
    }
  });
});

describe('páginas abrem pelos dois caminhos (CL-03)', () => {
  it.each(PAGES.flatMap((p) => [[p.id, p.pt, p.h1[0]] as const, [p.id, p.en, p.h1[0]] as const]))(
    '%s em %s',
    (_id, path, h1) => {
      renderApp(path);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(h1);
    },
  );

  it('em inglês, o título vem do idioma', () => {
    localStorage.setItem('portfolio-lang', 'en');
    renderApp('/pessoal/livros');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Books');
  });

  it('o 404 continua valendo para o que não existe', () => {
    renderApp('/pessoal/xyz');

    expect(screen.queryByRole('heading', { name: 'Livros' })).not.toBeInTheDocument();
  });
});
