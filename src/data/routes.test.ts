import {
  crumbsFor,
  directories,
  findDirectory,
  findPageByPath,
  routeById,
  terminalUrl,
  windowPath,
} from './routes';

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

  it('"ver no terminal" aponta para a home com o comando da página', () => {
    expect(terminalUrl(routeById('academico')!)).toBe('/?cmd=academico');
    expect(terminalUrl(routeById('whatsapp-dispatcher')!)).toBe('/?cmd=projetos');
  });
});
