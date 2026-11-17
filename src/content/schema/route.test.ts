// T2.2 (V-05): cada mensagem de erro do Data Model do design é provada por uma tabela quebrada de
// propósito; a tabela real passa.
import { routes } from '../../data/routes';
import { RouteTableSchema, routeTableProblems } from './route';

const L = (pt: string, en: string) => ({ pt, en });
const route = (over: Record<string, unknown> = {}) => ({
  id: 'a',
  kind: 'page',
  path: '/a',
  enPath: '/en/a',
  title: L('Título', 'Title'),
  description: L('Descrição', 'Description'),
  label: L('Rótulo', 'Label'),
  ...over,
});
const other = (id: string, over: Record<string, unknown> = {}) =>
  route({ id, path: `/${id}`, enPath: `/en/${id}`, ...over });

describe('tabela de rotas: o que vale', () => {
  it('a tabela real passa, sem nenhum problema', () => {
    expect(routeTableProblems(routes)).toEqual([]);
  });

  it('uma rota mínima válida passa', () => {
    expect(routeTableProblems([route()])).toEqual([]);
    expect(RouteTableSchema.safeParse([route(), other('b')]).success).toBe(true);
  });

  it('a home em inglês é /en e uma rota de menu com ordem passa', () => {
    expect(
      routeTableProblems([
        route({ id: 'home', path: '/', enPath: '/en' }),
        other('b', { menu: true, order: 1 }),
      ]),
    ).toEqual([]);
  });

  it('o que não é uma lista de rotas é recusado, em português', () => {
    expect(routeTableProblems(undefined)).toEqual(['esperada lista de rotas, recebido valor']);
    expect(routeTableProblems({})).toEqual(['esperada lista de rotas, recebido objeto']);
    expect(routeTableProblems([42])).toEqual(['esperado objeto, recebido número']);
  });
});

describe('tabela de rotas: endereços (FR-019, FR-020)', () => {
  it('endereço em português que começa com /en', () => {
    expect(routeTableProblems([route({ path: '/en/a', enPath: '/en/x' })])).toEqual([
      'rota a: endereço em português /en/a começa com /en ou repete',
    ]);
    expect(routeTableProblems([route({ path: '/en', enPath: '/en/x' })])).toEqual([
      'rota a: endereço em português /en começa com /en ou repete',
    ]);
  });

  it('endereço em português repetido ou sem barra', () => {
    expect(routeTableProblems([route(), other('b', { path: '/a' })])).toEqual([
      'rota b: endereço em português /a começa com /en ou repete',
    ]);
    expect(routeTableProblems([route({ path: 'a' })])).toEqual([
      'rota a: endereço em português a começa com /en ou repete',
    ]);
  });

  it('endereço em inglês fora de /en, repetido ou que colide com um endereço em português', () => {
    expect(routeTableProblems([route({ enPath: '/about' })])).toEqual([
      'rota a: endereço em inglês /about repetido ou fora de /en',
    ]);
    expect(routeTableProblems([route({ enPath: '/english' })])).toEqual([
      'rota a: endereço em inglês /english repetido ou fora de /en',
    ]);
    expect(routeTableProblems([route(), other('b', { enPath: '/en/a' })])).toEqual([
      'rota b: endereço em inglês /en/a repetido ou fora de /en',
    ]);
    expect(routeTableProblems([route({ enPath: undefined })])).toEqual([
      'rota a: endereço em inglês undefined repetido ou fora de /en',
    ]);
  });
});

describe('tabela de rotas: textos nos dois idiomas (FR-011)', () => {
  it('título, descrição e rótulo sem idioma, ou com texto vazio', () => {
    expect(routeTableProblems([route({ title: { pt: 'x' } })])).toEqual(['rota a: título sem en']);
    expect(routeTableProblems([route({ title: L('x', '   ') })])).toEqual([
      'rota a: título sem en',
    ]);
    expect(routeTableProblems([route({ title: undefined })])).toEqual([
      'rota a: título sem pt',
      'rota a: título sem en',
    ]);
    expect(routeTableProblems([route({ description: { en: 'x' } })])).toEqual([
      'rota a: descrição sem pt',
    ]);
    expect(routeTableProblems([route({ label: L('', 'x') })])).toEqual(['rota a: rótulo sem pt']);
  });

  it('a dica curta (desc) é opcional, mas quando existe vale nos dois idiomas', () => {
    expect(routeTableProblems([route({ desc: L('quem sou', 'who I am') })])).toEqual([]);
    expect(routeTableProblems([route({ desc: { pt: 'quem sou' } })])).toEqual([
      'rota a: dica sem en',
    ]);
  });
});

describe('tabela de rotas: menu e rota sem casca', () => {
  it('ordem do menu repetida ou ausente', () => {
    expect(
      routeTableProblems([route({ menu: true, order: 1 }), other('b', { menu: true, order: 1 })]),
    ).toEqual(['menu: ordem 1 repetida']);
    expect(routeTableProblems([route({ menu: true })])).toEqual(['rota a: menu sem ordem']);
  });

  it('bare e menu juntos', () => {
    expect(routeTableProblems([route({ bare: true, menu: true, order: 1 })])).toEqual([
      'rota a: bare e menu juntos',
    ]);
  });

  it('só uma rota pode ser bare', () => {
    expect(routeTableProblems([route({ bare: true }), other('b', { bare: true })])).toEqual([
      'só uma rota pode ser bare, achei 2: a, b',
    ]);
    expect(routeTableProblems([route({ bare: true }), other('b')])).toEqual([]);
  });

  it('a rota de prova não entra no menu', () => {
    expect(routeTableProblems([route({ prova: true, menu: true, order: 1 })])).toEqual([
      'rota a: prova e menu juntos',
    ]);
  });

  it('todos os problemas saem de uma vez (um erro não esconde o outro)', () => {
    expect(
      routeTableProblems([route({ path: '/en/a', enPath: '/a', title: undefined })]).length,
    ).toBeGreaterThanOrEqual(4);
  });
});
