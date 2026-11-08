import {
  activeMenuId,
  crumbsFor,
  directories,
  findDirectory,
  findPageByPath,
  menu,
  routeById,
  terminalUrl,
  windowPath,
} from './routes';

describe('tabela de rotas', () => {
  it('o menu é único e na ordem pedida', () => {
    expect(menu.map((r) => r.label.pt)).toEqual([
      'Início',
      'Currículo',
      'Acadêmico',
      'Projetos',
      'Serviços',
      'Contato',
    ]);
    expect(menu.map((r) => r.label.en)).toEqual([
      'Home',
      'Resume',
      'Academics',
      'Projects',
      'Services',
      'Contact',
    ]);
  });

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
    // seções da home não são páginas próprias
    expect(findPageByPath('/#sobre')).toBeUndefined();
  });

  it('cd aceita PT e EN, ./ ~/ e barras', () => {
    expect(findDirectory('academico')?.id).toBe('academico');
    expect(findDirectory('Academics')?.id).toBe('academico');
    expect(findDirectory('~/projetos/')?.id).toBe('projetos');
    expect(findDirectory('./contact')?.id).toBe('contato');
    expect(findDirectory('inexistente')).toBeUndefined();
  });

  it('o item ativo do menu acompanha caminho e âncora', () => {
    expect(activeMenuId('/', '')).toBe('home');
    expect(activeMenuId('/', '#projetos')).toBe('projetos');
    expect(activeMenuId('/', '#sobre')).toBe('home');
    expect(activeMenuId('/academics', '')).toBe('academico');
    expect(activeMenuId('/estudos-de-caso/whatsapp-dispatcher', '')).toBeUndefined();
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
    expect(terminalUrl(routeById('academico'))).toBe('/?cmd=academico');
    expect(terminalUrl(routeById('whatsapp-dispatcher'))).toBe('/?cmd=projetos');
  });
});
