// T5.1 (TD-009): `vite build` e `vite build --mode prova` têm a mesma configuração, salvo o modo, a
// pasta de saída, o `__PROVA__` e o que o plugin faz com a rota de prova. O publicado nunca a contém.
import config from '../vite.config';
import { allRoutes } from '../src/data/routes';
import { prerenderPaths } from './prerender';

type Mode = 'production' | 'prova';

const resolve = (mode: Mode) =>
  (config as unknown as (env: { command: string; mode: string }) => Record<string, unknown>)({
    command: 'build',
    mode,
  });

const pluginNames = (cfg: Record<string, unknown>) =>
  (cfg.plugins as unknown[]).flat().map((p) => (p as { name?: string }).name);

// `builtAt` (hora do build) muda a cada chamada; o resto de __BUILD__ não.
const comparable = (define: Record<string, string>) => {
  const { __PROVA__, __BUILD__, ...rest } = define;

  return { rest, build: { ...JSON.parse(__BUILD__), builtAt: null }, prova: __PROVA__ };
};

describe('configuração do build normal e do build de prova', () => {
  const normal = resolve('production');
  const prova = resolve('prova');

  it('mesmos plugins, na mesma ordem', () => {
    expect(pluginNames(prova)).toEqual(pluginNames(normal));
  });

  it('o define só difere em __PROVA__ (false no publicado, true na prova)', () => {
    const a = comparable(normal.define as Record<string, string>);
    const b = comparable(prova.define as Record<string, string>);

    expect(b.rest).toEqual(a.rest);
    expect(b.build).toEqual(a.build);
    expect(a.prova).toBe('false');
    expect(b.prova).toBe('true');
  });

  it('o build só difere na pasta de saída (dist x dist-prova)', () => {
    const { outDir: outNormal, ...restNormal } = normal.build as Record<string, unknown>;
    const { outDir: outProva, ...restProva } = prova.build as Record<string, unknown>;

    expect(outNormal).toBe('dist');
    expect(outProva).toBe('dist-prova');
    expect(restProva).toEqual(restNormal);
  });

  it('as demais chaves da configuração são as mesmas', () => {
    const strip = (cfg: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(cfg).filter(([key]) => !['plugins', 'define', 'build'].includes(key)),
      );

    expect(strip(prova)).toEqual(strip(normal));
    expect(Object.keys(prova).sort()).toEqual(Object.keys(normal).sort());
  });
});

describe('a rota /_prova só existe no build de prova', () => {
  it('está na tabela completa, fora do menu, oculta e marcada como prova', () => {
    const route = allRoutes.find((r) => r.id === 'prova');

    expect(route).toMatchObject({
      path: '/_prova',
      enPath: '/en/_prova',
      prova: true,
      hidden: true,
    });
    expect(route?.menu).toBeUndefined();
  });

  it('o plugin só a pré-renderiza com a opção (e a 404 e as demais ficam iguais)', () => {
    const without = prerenderPaths().map((p) => p.path);
    const withProva = prerenderPaths(true).map((p) => p.path);

    expect(without).not.toContain('/_prova');
    expect(without).not.toContain('/en/_prova');
    expect(withProva).toEqual(expect.arrayContaining(['/_prova', '/en/_prova']));
    expect(withProva).toHaveLength(without.length + 2);
  });
});
