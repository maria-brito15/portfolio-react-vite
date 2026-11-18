// T5.1: sem `__PROVA__` a rota de prova é filtrada da tabela; com ele, entra (e continua fora de
// `directories`, do menu e do sitemap).
describe('rota /_prova (T5.1)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('sem __PROVA__ a rota não existe (nem em routeById nem em findPageByPath)', async () => {
    const m = await import('./routes');

    expect(m.provaEnabled).toBe(false);
    expect(m.routes.some((r) => r.id === 'prova')).toBe(false);
    expect(m.routeById('prova')).toBeUndefined();
    expect(m.findPageByPath('/_prova')).toBeUndefined();
    expect(m.findPageByPath('/en/_prova')).toBeUndefined();
  });

  it('com __PROVA__ a rota entra na tabela, nos dois idiomas, mas não no menu nem em `ls`', async () => {
    vi.stubGlobal('__PROVA__', true);
    vi.resetModules();

    const m = await import('./routes');

    expect(m.provaEnabled).toBe(true);
    expect(m.findPageByPath('/_prova')?.id).toBe('prova');
    expect(m.findPageByPath('/en/_prova')?.id).toBe('prova');
    expect(m.routes.filter((r) => r.menu).some((r) => r.id === 'prova')).toBe(false);
    expect(m.directories.some((r) => r.id === 'prova')).toBe(false);
  });

  it('__PROVA__ falso (o define do build publicado) também a esconde', async () => {
    vi.stubGlobal('__PROVA__', false);
    vi.resetModules();

    const m = await import('./routes');

    expect(m.routeById('prova')).toBeUndefined();
  });
});
