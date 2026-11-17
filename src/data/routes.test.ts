import {
  crumbsFor,
  directories,
  findDirectory,
  findPageByPath,
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

  it('encontra páginas pelo caminho, inclusive apelidos e barra final', () => {
    expect(findPageByPath('/resume')?.id).toBe('curriculo');
    expect(findPageByPath('/academics/')?.id).toBe('academico');
    expect(findPageByPath('/estudos-de-caso/whatsapp-dispatcher')?.id).toBe('whatsapp-dispatcher');
    expect(findPageByPath('/nada')).toBeUndefined();
    expect(findPageByPath('/about')?.id).toBe('sobre');
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
