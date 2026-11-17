import { readFileSync } from 'node:fs';
import { routeTableProblems } from '../content/schema/route';
import { join } from 'node:path';
import {
  crumbsFor,
  directories,
  equivalentPath,
  findDirectory,
  findPageByPath,
  langOfPath,
  normalizePath,
  routeById,
  routeName,
  routeSegment,
  routes,
  terminalUrl,
  windowPath,
} from './routes';

describe('texto da rota sem reserva (T7.4, FR-015)', () => {
  it('toda rota que aparece no breadcrumb tem rótulo nos dois idiomas', () => {
    for (const r of routes.filter((x) => x.id !== 'home'))
      for (const lang of ['pt', 'en'] as const)
        expect(() => crumbsFor(r, lang), `${r.id}/${lang}`).not.toThrow();
  });

  it('as filhas de projetos e de pessoal têm segmento nos dois idiomas', () => {
    for (const r of routes.filter((x) => x.parent === 'projetos' || x.parent === 'pessoal'))
      for (const lang of ['pt', 'en'] as const)
        expect(routeSegment(r, lang), `${r.id}/${lang}`).toBeTruthy();
  });

  it('routeSegment e routeName lançam, nomeando a rota, quando falta o texto', () => {
    const sem = { id: 'sem-texto', kind: 'page', path: '/x', label: { pt: 'x', en: 'x' } } as never;

    expect(() => routeSegment(sem, 'pt')).toThrow('rota sem-texto: segmento sem pt');
    expect(() => routeName(sem, 'en')).toThrow('rota sem-texto: alias ausente');
    expect(() => routeName(sem, 'pt')).toThrow('rota sem-texto: name ausente');
  });
});

describe('tabela de rotas', () => {
  it('todos os caminhos e nomes de comando são únicos', () => {
    const paths = new Set();

    for (const r of directories) {
      expect(paths.has(r.path), r.path).toBe(false);
      paths.add(r.path);
    }

    const names = directories.flatMap((d) => [d.name, d.alias]);

    expect(new Set(names).size).toBe(names.length);
  });

  it('encontra páginas pelo caminho em português e em inglês, inclusive com barra final', () => {
    expect(findPageByPath('/en/resume')?.id).toBe('curriculo');
    expect(findPageByPath('/en/academics/')?.id).toBe('academico');
    expect(findPageByPath('/estudos-de-caso/whatsapp-dispatcher')?.id).toBe('whatsapp-dispatcher');
    expect(findPageByPath('/nada')).toBeUndefined();
    expect(findPageByPath('/en/about')?.id).toBe('sobre');
    // âncoras antigas da home não existem mais
    expect(findPageByPath('/#sobre')).toBeUndefined();
  });

  it('cd aceita PT e EN, ./ ~/ e barras', () => {
    expect(findDirectory('academico')?.id).toBe('academico');
    expect(findDirectory('Academics')?.id).toBe('academico');
    expect(findDirectory('~/projetos/')?.id).toBe('projetos');
    expect(findDirectory('./contact')?.id).toBe('contato');
    expect(findDirectory('inexistente')).toBeUndefined();
  });

  it('breadcrumb e título da janela usam o vocabulário do idioma', () => {
    const academics = routeById('academico');

    expect(windowPath(academics, 'pt')).toBe('~/academico');
    expect(windowPath(academics, 'en')).toBe('~/academics');

    const study = routeById('whatsapp-dispatcher');

    expect(crumbsFor(study, 'pt').map((c) => c.label)).toEqual(['projetos', 'whatsapp-dispatcher']);
    expect(crumbsFor(study, 'en').map((c) => c.label)).toEqual(['projects', 'whatsapp-dispatcher']);
    expect(windowPath(routeById('home'), 'pt')).toBe('~');
  });

  it('"ver no terminal" aponta para o terminal com o comando da página', () => {
    expect(terminalUrl(routeById('academico')!)).toBe('/terminal?cmd=academico');
    expect(terminalUrl(routeById('whatsapp-dispatcher')!)).toBe('/terminal?cmd=projetos');
  });
});

// T2.1 (TD-025 (b), DQ-017): a tabela de rotas não importa dados da 008 nem o modo de integração;
// o estado de rascunho mora em routeStatus.ts.
describe('routes.ts sem dados da 008 (TD-025 (b))', () => {
  it('não importa now, uses, personal/* nem integrations/mode, e não declara draft', () => {
    const source = readFileSync(join(process.cwd(), 'src/data/routes.ts'), 'utf8');
    const imports = [...source.matchAll(/^import .*from '([^']+)';/gm)].map((m) => m[1]);

    expect(imports).toEqual(['../types']);
    expect(source).not.toMatch(/\bdraft\s*:/);
    expect(source).not.toMatch(/\bshowInNav\s*:/);
    expect(routes.every((r) => !('draft' in r) && !('showInNav' in r))).toBe(true);
  });

  it('o estado de rascunho sai de routeStatus: agora/setup por conteúdo, pessoal por dado fictício', async () => {
    const { routeStatus, isDraft, isListed, navRoutes } = await import('./routeStatus');

    expect(isDraft('home')).toBe(false);
    expect(isDraft('notFound')).toBe(false);
    expect(routeStatus('pessoal')).toEqual({ draft: true, showInNav: true });
    expect(isListed(routeById('pessoal')!)).toBe(true);
    expect(isListed(routeById('pessoal-livros')!)).toBe(false);
    expect(navRoutes('personal').map((r) => r.id)).toContain('pessoal');
  });
});

// T2.2 (V-05): a tabela estendida (enPath, title, description, menu, order, bare).
describe('tabela de rotas estendida (TD-006, DQ-016, DQ-019)', () => {
  it('passa no schema da tabela', () => {
    expect(routeTableProblems(routes)).toEqual([]);
  });

  it('o enPath das rotas com apelido em inglês é /en + o apelido (nome em inglês); os confirmados pela Duda', () => {
    const expected: Record<string, string> = {
      sobre: '/en/about',
      habilidades: '/en/skills',
      projetos: '/en/projects',
      experiencias: '/en/experience',
      contato: '/en/contact',
      curriculo: '/en/resume',
      academico: '/en/academics',
      servicos: '/en/services',
      agora: '/en/now',
      setup: '/en/uses',
      pessoal: '/en/personal',
      'pessoal-livros': '/en/personal/books',
      'pessoal-filmes': '/en/personal/films',
      'pessoal-musica': '/en/personal/music',
      'pessoal-teatro': '/en/personal/theater',
    };

    for (const [id, enPath] of Object.entries(expected))
      expect(routeById(id)?.enPath, id).toBe(enPath);

    expect(routeById('home')?.enPath).toBe('/en');
    expect(routeById('terminal')?.enPath).toBe('/en/terminal');
    expect(routeById('github')?.enPath).toBe('/en/github');
    expect(routeById('whatsapp-dispatcher')?.enPath).toBe('/en/case-studies/whatsapp-dispatcher');
  });

  it('title e description estão completos nos dois idiomas e o desc curto não mudou', () => {
    for (const r of routes) {
      for (const lang of ['pt', 'en'] as const) {
        expect(r.title[lang].trim(), `${r.id}/${lang}`).not.toBe('');
        expect(r.description[lang].trim(), `${r.id}/${lang}`).not.toBe('');
      }
    }
    // o desc curto (terminal, paleta, barra lateral) segue sendo o de antes, e não o texto de SEO
    expect(routeById('sobre')?.desc).toEqual({ pt: 'quem sou', en: 'who I am' });
    expect(routeById('projetos')?.desc?.pt).toBe('linha do tempo de projetos');
  });

  it('o menu: Projetos, Currículo, Acadêmico, Contato, Pessoal, na ordem 1 a 5 (DQ-011, DQ-019)', () => {
    const menu = routes
      .filter((r) => r.menu)
      .sort((a, b) => (a.order as number) - (b.order as number));

    expect(menu.map((r) => [r.id, r.order])).toEqual([
      ['projetos', 1],
      ['curriculo', 2],
      ['academico', 3],
      ['contato', 4],
      ['pessoal', 5],
    ]);
  });

  it('regra de 2 interações: projetos, currículo e contato estão no menu, que vale em toda rota', () => {
    const inMenu = new Set(routes.filter((r) => r.menu).map((r) => r.id));

    for (const id of ['projetos', 'curriculo', 'contato']) expect(inMenu.has(id), id).toBe(true);
    // rota sem casca não entra no menu (FR-041), então o terminal sai da regra
    expect(routes.filter((r) => r.bare).every((r) => !r.menu)).toBe(true);
  });

  it('só o terminal é bare, e a rota de prova ainda não existe (nasce na T5.1)', () => {
    expect(routes.filter((r) => r.bare).map((r) => r.id)).toEqual(['terminal']);
    expect(routes.some((r) => r.prova)).toBe(false);
    expect(routes.some((r) => r.path === '/_prova' || r.enPath === '/en/_prova')).toBe(false);
  });

  it('nenhum endereço em português começa com /en e nenhum enPath repete', () => {
    expect(routes.filter((r) => r.path === '/en' || r.path.startsWith('/en/'))).toEqual([]);
    expect(new Set(routes.map((r) => r.enPath)).size).toBe(routes.length);
    for (const r of routes)
      expect(r.enPath === '/en' || r.enPath.startsWith('/en/'), r.id).toBe(true);
  });
});

// T2.4 (TD-007): endereços por idioma, sem os apelidos antigos.
describe('endereços por idioma (FR-019 a FR-021)', () => {
  it('/en/projects e /projetos abrem a mesma rota', () => {
    expect(findPageByPath('/en/projects')?.id).toBe('projetos');
    expect(findPageByPath('/projetos')?.id).toBe('projetos');
    expect(findPageByPath('/en/projects')).toBe(findPageByPath('/projetos'));
  });

  it('/en/ (com barra final) equivale a /en e é a home em inglês', () => {
    expect(normalizePath('/en/')).toBe('/en');
    expect(normalizePath('/projetos/')).toBe('/projetos');
    expect(normalizePath('/')).toBe('/');
    expect(findPageByPath('/en/')?.id).toBe('home');
    expect(findPageByPath('/en')?.id).toBe('home');
    expect(findPageByPath('/')?.id).toBe('home');
    expect(findPageByPath('/en/projects/')?.id).toBe('projetos');
  });

  it('o terminal, o GitHub e o estudo de caso abrem pelos endereços em inglês confirmados', () => {
    expect(findPageByPath('/en/terminal')?.id).toBe('terminal');
    expect(findPageByPath('/en/github')?.id).toBe('github');
    expect(findPageByPath('/en/case-studies/whatsapp-dispatcher')?.id).toBe('whatsapp-dispatcher');
  });

  it('rota desconhecida (nos dois idiomas) é undefined, para a página 404', () => {
    expect(findPageByPath('/xyz')).toBeUndefined();
    expect(findPageByPath('/en/xyz')).toBeUndefined();
    expect(findPageByPath('/en/en')).toBeUndefined();
  });

  it('os apelidos em inglês antigos (/about, /projects) saem: não abrem mais nada', () => {
    for (const old of ['/about', '/skills', '/projects', '/experience', '/contact', '/resume'])
      expect(findPageByPath(old), old).toBeUndefined();
    expect(findPageByPath('/personal')).toBeUndefined();
    expect(routes.every((r) => !('aliases' in r))).toBe(true);
  });

  it('langOfPath: /en e /en/... são inglês; o resto, português, inclusive endereço desconhecido', () => {
    expect(langOfPath('/en')).toBe('en');
    expect(langOfPath('/en/')).toBe('en');
    expect(langOfPath('/en/projects')).toBe('en');
    expect(langOfPath('/en/xyz')).toBe('en');
    expect(langOfPath('/')).toBe('pt');
    expect(langOfPath('/projetos')).toBe('pt');
    expect(langOfPath('/entrada')).toBe('pt');
    expect(langOfPath('/xyz')).toBe('pt');
  });

  it('equivalentPath leva a página ao outro idioma e de volta', () => {
    for (const r of routes) {
      expect(equivalentPath(r, 'pt'), r.id).toBe(r.path);
      expect(equivalentPath(r, 'en'), r.id).toBe(r.enPath);
      expect(findPageByPath(equivalentPath(r, 'en'))?.id, r.id).toBe(r.id);
      expect(langOfPath(equivalentPath(r, 'en')), r.id).toBe('en');
      expect(langOfPath(equivalentPath(r, 'pt')), r.id).toBe('pt');
    }
  });
});
