// T4.2 (TD-008, TD-014): o plugin de pré-render. Recursão evitada, limpeza com sucesso ou falha,
// falha sem <h1>/<main>, mapa endereço → arquivo, chunks e CSS da rota pelo manifesto.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  assertRendered,
  chunkAssets,
  lazySourceOf,
  nestedConfig,
  outputFileFor,
  prerenderPaths,
  prerenderSite,
  type EntryServer,
  type Manifest,
} from './prerender';
import { seoPlugin } from './seoPlugin';
import { routes } from '../src/data/routes';

describe('endereço → arquivo', () => {
  it.each([
    ['/', 'index.html'],
    ['/en', 'en.html'],
    ['/en/', 'en.html'],
    ['/sobre', 'sobre.html'],
    ['/en/about', 'en/about.html'],
    ['/estudos-de-caso/whatsapp-dispatcher', 'estudos-de-caso/whatsapp-dispatcher.html'],
  ])('%s → %s', (path, file) => {
    expect(outputFileFor(path)).toBe(file);
  });

  it('cada rota gera 2 arquivos diferentes e há 2 de 404', () => {
    const files = prerenderPaths().map((p) => p.path);

    expect(new Set(files).size).toBe(files.length);
    expect(files).toHaveLength(routes.length * 2 + 2);
  });
});

describe('build aninhado sem recursão', () => {
  it('não lê arquivo de config, não usa o plugin de SEO, não copia public/ e limpa a saída', () => {
    const cfg = nestedConfig('/raiz', { __CAST__: {} });
    const names = (cfg.plugins ?? []).flat().map((p) => (p as { name?: string })?.name);

    expect(cfg.configFile).toBe(false);
    expect(names).not.toContain('portfolio-seo');
    expect(cfg.build?.ssr).toBe('src/entry-server.tsx');
    expect(cfg.build?.copyPublicDir).toBe(false);
    expect(cfg.build?.emptyOutDir).toBe(true);
    expect(cfg.build?.outDir).toBe('.prerender');
  });

  it('o plugin de SEO ignora o closeBundle de um build de servidor', async () => {
    const plugin = seoPlugin();
    const close = plugin.closeBundle as (this: unknown) => Promise<void>;

    await expect(
      close.call({ environment: { config: { build: { ssr: true } } } }),
    ).resolves.toBeUndefined();
  });
});

describe('chunks da rota pelo manifesto', () => {
  const manifest: Manifest = {
    'src/main.tsx': { file: 'static/index-1.js', isEntry: true, imports: ['_shared'] },
    _shared: { file: 'static/shared-1.js' },
    _extra: { file: 'static/extra-1.js' },
    'src/pages/Services.tsx': {
      file: 'static/Services-1.js',
      imports: ['_shared', '_extra'],
      css: ['static/Services-1.css'],
    },
  };

  it('devolve o JS e o CSS do chunk e dos que ele importa, sem o que a entrada já carrega', () => {
    expect(chunkAssets(manifest, 'servicos')).toEqual({
      js: ['/static/Services-1.js', '/static/extra-1.js'],
      css: ['/static/Services-1.css'],
    });
  });

  it('rota que vai no chunk de entrada (home) ou sem chave no manifesto não tem extras', () => {
    expect(chunkAssets(manifest, 'home')).toEqual({ js: [], css: [] });
    expect(chunkAssets(manifest, 'terminal')).toEqual({ js: [], css: [] });
  });

  it('toda rota carregada sob demanda no App tem a fonte mapeada, e só elas', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const lazy = readFileSync('src/pages/lazyPages.ts', 'utf8');
    const lazyFiles = [...lazy.matchAll(/import\('\.\/([^']+)'\)/g)].map(
      (m) => `src/pages/${m[1]}.tsx`,
    );

    expect(app).toContain('lazyPages');
    for (const route of routes) {
      const source = lazySourceOf(route.id);

      if (source) expect(lazyFiles, `${route.id} → ${source}`).toContain(source);
    }

    for (const file of lazyFiles) {
      expect(
        routes.some((route) => lazySourceOf(route.id) === file),
        file,
      ).toBe(true);
    }
  });
});

describe('falha o build sem <main> ou sem <h1>', () => {
  it('assertRendered', () => {
    expect(() => assertRendered('/x', '<main><h1>a</h1></main>')).not.toThrow();
    expect(() => assertRendered('/x', '<div><h1>a</h1></div>')).toThrow(/sem <main>/);
    expect(() => assertRendered('/x', '<main><h2>a</h2></main>')).toThrow(/sem <h1>/);
  });
});

describe('prerenderSite (com entrada falsa)', () => {
  const made: string[] = [];

  function setup() {
    const root = mkdtempSync(join(tmpdir(), 'prerender-'));
    const outDir = join(root, 'dist');

    made.push(root);
    mkdirSync(join(outDir, '.vite'), { recursive: true });
    mkdirSync(join(root, '.prerender'), { recursive: true });
    writeFileSync(join(outDir, 'index.html'), '<html><div id="root"></div></html>');
    writeFileSync(join(outDir, '.vite', 'manifest.json'), '{}');

    return { root, outDir };
  }

  const entry = (html: (path: string) => string): EntryServer => ({
    renderRoute: async (path) => ({
      routeId: path === '/' ? 'home' : 'x',
      lang: 'pt',
      status: 200,
      bare: false,
      html: html(path),
    }),
    assembleDocument: ({ rendered }) => `<doc>${rendered.html}</doc>`,
  });

  afterAll(() => made.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

  it('grava um HTML por endereço e apaga .prerender/ e dist/.vite/', async () => {
    const { root, outDir } = setup();
    const written = await prerenderSite({
      root,
      outDir,
      define: {},
      loadEntry: async () => entry(() => '<main><h1>ok</h1></main>'),
    });

    expect(written).toHaveLength(prerenderPaths().length);
    expect(written).toContain('index.html');
    expect(written).toContain('en.html');
    expect(written).toContain('404.html');
    expect(written).toContain('en/404.html');
    expect(readFileSync(join(outDir, 'sobre.html'), 'utf8')).toContain('<h1>ok</h1>');
    expect(existsSync(join(root, '.prerender'))).toBe(false);
    expect(existsSync(join(outDir, '.vite'))).toBe(false);
  });

  it('falha (e limpa mesmo assim) quando uma página sai sem <h1>', async () => {
    const { root, outDir } = setup();

    await expect(
      prerenderSite({
        root,
        outDir,
        define: {},
        loadEntry: async () =>
          entry((path) => (path === '/sobre' ? '<main></main>' : '<main><h1>a</h1></main>')),
      }),
    ).rejects.toThrow(/\/sobre: sem <h1>/);
    expect(existsSync(join(root, '.prerender'))).toBe(false);
    expect(existsSync(join(outDir, '.vite'))).toBe(false);
  });

  it('falha (e limpa) quando o build aninhado não carrega', async () => {
    const { root, outDir } = setup();

    await expect(
      prerenderSite({
        root,
        outDir,
        define: {},
        loadEntry: async () => {
          throw new Error('build aninhado quebrou');
        },
      }),
    ).rejects.toThrow(/quebrou/);
    expect(existsSync(join(root, '.prerender'))).toBe(false);
    expect(existsSync(join(outDir, '.vite'))).toBe(false);
  });
});
