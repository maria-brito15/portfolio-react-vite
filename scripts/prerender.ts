// Pré-render dentro do `vite build` (spec 002, TD-008, TD-014, T4.2). O plugin de SEO chama
// `prerenderSite` em `closeBundle`: ele monta um build de servidor aninhado do `entry-server`, importa
// o resultado, renderiza cada rota × idioma e grava um HTML por endereço em `dist/`. Falha o build
// se uma página sai sem `<main>` ou sem `<h1>`, e apaga `.prerender/` e `dist/.vite/` sempre.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import react from '@vitejs/plugin-react';
import { build, type InlineConfig } from 'vite';
import { allRoutes } from '../src/data/routes';
import type { AssembleInput, RenderedRoute } from '../src/entry-server';

export interface EntryServer {
  renderRoute: (path: string) => Promise<RenderedRoute>;
  assembleDocument: (input: AssembleInput) => string;
}

interface ManifestChunk {
  file: string;
  src?: string;
  isEntry?: boolean;
  imports?: string[];
  css?: string[];
}
export type Manifest = Record<string, ManifestChunk>;

/** Onde cada endereço vira arquivo: `/` → `index.html`, `/en` → `en.html`, `/en/about` → `en/about.html`. */
export function outputFileFor(path: string): string {
  const clean = path.replace(/\/+$/, '');

  return clean === '' ? 'index.html' : `${clean.slice(1)}.html`;
}

// Fonte da página carregada sob demanda de cada rota (a tabela de `src/pages/lazyPages.ts`).
// Rota que não está aqui (home, agora, setup) vai no chunk de entrada.
const LAZY_SOURCE: Record<string, string> = {
  sobre: 'src/pages/SectionPage.tsx',
  habilidades: 'src/pages/SectionPage.tsx',
  projetos: 'src/pages/SectionPage.tsx',
  experiencias: 'src/pages/SectionPage.tsx',
  contato: 'src/pages/SectionPage.tsx',
  curriculo: 'src/pages/Resume.tsx',
  academico: 'src/pages/Academics.tsx',
  servicos: 'src/pages/Services.tsx',
  terminal: 'src/pages/TerminalPage.tsx',
  github: 'src/pages/GithubPage.tsx',
  pessoal: 'src/pages/personal/PersonalHub.tsx',
  'pessoal-livros': 'src/pages/personal/Books.tsx',
  'pessoal-filmes': 'src/pages/personal/Films.tsx',
  'pessoal-musica': 'src/pages/personal/Music.tsx',
  'pessoal-teatro': 'src/pages/personal/Theater.tsx',
  'whatsapp-dispatcher': 'src/pages/CaseStudy.tsx',
  prova: 'src/pages/Prova.tsx',
};

export const lazySourceOf = (routeId: string): string | undefined => LAZY_SOURCE[routeId];

/** JS e CSS do chunk da rota e dos que ele importa, sem o que o chunk de entrada já carrega. */
export function chunkAssets(manifest: Manifest, routeId: string) {
  const start = lazySourceOf(routeId);
  const js: string[] = [];
  const css: string[] = [];

  if (!start || !manifest[start]) return { js, css };

  const inEntry = new Set<string>();
  const walk = (key: string, into: Set<string>) => {
    if (into.has(key) || !manifest[key]) return;
    into.add(key);
    for (const next of manifest[key].imports ?? []) walk(next, into);
  };

  for (const [key, chunk] of Object.entries(manifest)) if (chunk.isEntry) walk(key, inEntry);

  const wanted = new Set<string>();

  walk(start, wanted);

  for (const key of wanted) {
    if (inEntry.has(key)) continue;
    js.push(`/${manifest[key].file}`);
    css.push(...(manifest[key].css ?? []).map((file) => `/${file}`));
  }

  return { js, css };
}

/** Falha se a página renderizada não tem `<main>` ou não tem `<h1>` (FR-028). */
export function assertRendered(path: string, html: string) {
  if (!/<main[ >]/.test(html)) throw new Error(`pré-render de ${path}: sem <main>`);
  if (!/<h1[ >]/.test(html)) throw new Error(`pré-render de ${path}: sem <h1>`);
}

/** Todos os endereços a gerar: cada rota (de verdade) nos dois idiomas e a 404 nos dois. */
export function prerenderPaths(prova = false): { path: string; routeId?: string }[] {
  return [
    ...allRoutes
      .filter((route) => !route.prova || prova)
      .flatMap((route) => [
        { path: route.path, routeId: route.id },
        { path: route.enPath, routeId: route.id },
      ]),
    { path: '/404' },
    { path: '/en/404' },
  ];
}

const NOT_FOUND_FILE: Record<string, string> = { '/404': '404.html', '/en/404': 'en/404.html' };

/** Config do build de servidor aninhado: sem arquivo de config e sem o plugin de SEO (sem recursão). */
export function nestedConfig(root: string, define: Record<string, unknown>): InlineConfig {
  return {
    root,
    configFile: false,
    logLevel: 'warn',
    plugins: [react()],
    define,
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: '.prerender',
      emptyOutDir: true,
      copyPublicDir: false,
      rollupOptions: { output: { entryFileNames: 'entry-server.js' } },
    },
  };
}

export interface PrerenderOptions {
  root: string;
  outDir: string;
  define: Record<string, unknown>;
  /** Inclui a rota de prova (`/_prova`): só o `vite build --mode prova` liga (T5.1). */
  prova?: boolean;
  /** Costura de teste: por padrão faz o build aninhado e importa o `entry-server`. */
  loadEntry?: (root: string, define: Record<string, unknown>) => Promise<EntryServer>;
}

async function buildAndImport(root: string, define: Record<string, unknown>): Promise<EntryServer> {
  await build(nestedConfig(root, define));

  return (await import(
    /* @vite-ignore */ pathToFileURL(join(root, '.prerender', 'entry-server.js')).href
  )) as EntryServer;
}

export async function prerenderSite({
  root,
  outDir,
  define,
  prova = false,
  loadEntry = buildAndImport,
}: PrerenderOptions): Promise<string[]> {
  const written: string[] = [];

  try {
    const template = readFileSync(join(outDir, 'index.html'), 'utf8');
    const manifestFile = join(outDir, '.vite', 'manifest.json');
    const manifest: Manifest = existsSync(manifestFile)
      ? JSON.parse(readFileSync(manifestFile, 'utf8'))
      : {};
    const entry = await loadEntry(root, define);

    for (const { path, routeId } of prerenderPaths(prova)) {
      const isError = routeId === undefined;
      const rendered = await entry.renderRoute(path);

      assertRendered(path, rendered.html);

      const assets = chunkAssets(manifest, rendered.routeId);
      const html = entry.assembleDocument({
        template,
        rendered,
        preload: assets.js,
        styles: assets.css,
      });
      const file = isError ? NOT_FOUND_FILE[path] : outputFileFor(path);

      mkdirSync(dirname(join(outDir, file)), { recursive: true });
      writeFileSync(join(outDir, file), html);
      written.push(file);
    }

    return written;
  } finally {
    rmSync(join(root, '.prerender'), { recursive: true, force: true });
    rmSync(join(outDir, '.vite'), { recursive: true, force: true });
  }
}
