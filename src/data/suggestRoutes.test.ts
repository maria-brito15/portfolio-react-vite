// T3.6 (V-14): sugestões da 404, função pura.
import { routes } from './routes';
import { suggestRoutes } from './suggestRoutes';

const ids = (path: string, lang: 'pt' | 'en' = 'pt') =>
  suggestRoutes(path, lang).map((route) => route.id);
const menu = routes
  .filter((route) => route.menu)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((route) => route.id);

describe('suggestRoutes (FR-039)', () => {
  it('só sugere rotas do menu, no máximo 3', () => {
    for (const path of ['/projeto', '/xyz', '/', '/a/b/c', '/%', '/en/academcs'])
      expect(ids(path).length).toBeLessThanOrEqual(3);

    for (const id of [...ids('/projeto'), ...ids('/zzzz'), ...ids('/')]) expect(menu).toContain(id);
  });

  it('acha a rota parecida pelo último segmento, com erro de digitação', () => {
    expect(ids('/projeto')[0]).toBe('projetos');
    expect(ids('/Curriculu')[0]).toBe('curriculo');
    expect(ids('/contatos')[0]).toBe('contato');
    expect(ids('/en/academcs', 'en')[0]).toBe('academico');
  });

  it('acha pelo nome em inglês mesmo numa página em português', () => {
    expect(ids('/projects')[0]).toBe('projetos');
  });

  it('sem semelhança (ou sem endereço), as 3 primeiras do menu, na ordem', () => {
    expect(ids('/zzzzzzzz')).toEqual(menu.slice(0, 3));
    expect(ids('/')).toEqual(menu.slice(0, 3));
    expect(ids('')).toEqual(menu.slice(0, 3));
  });

  it('é pura e determinística', () => {
    expect(ids('/projeto')).toEqual(ids('/projeto'));
  });

  it('endereço malformado não lança', () => {
    expect(() => suggestRoutes('/%', 'pt')).not.toThrow();
    expect(() => suggestRoutes('/%E0%A4%A', 'en')).not.toThrow();
  });
});
