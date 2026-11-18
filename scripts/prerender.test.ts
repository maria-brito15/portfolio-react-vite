// T4.1 (V-09, TD-008): o HTML de cada rota × idioma, gerado em memória por `renderRoute` e montado
// por `assembleDocument`, tem `<main>`, um só `<h1>`, a casca (menos o terminal), `lang`, `hreflang`
// recíproco (404 sem), o boot antes do CSS e síncrono, e `data-shell="bare"` só no terminal.
// Roda no projeto `unit` (Node, sem jsdom nem o setup.ts que troca `lazyPages`).
import { bootSource } from '../src/boot/boot';
import { assembleDocument, renderRoute, type RenderedRoute } from '../src/entry-server';
import { routes } from '../src/data/routes';

// O que o `vite build` entrega em `dist/index.html`: boot, marcadores do SEO, CSS e script do site.
const TEMPLATE = [
  '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8" />',
  `<script id="boot">\n${bootSource()}\n</script>`,
  '<!-- seo:head -->\n<!-- /seo:head -->',
  '<link rel="stylesheet" crossorigin href="/static/index-abc.css">',
  '<script type="module" crossorigin src="/static/index-abc.js"></script>',
  '</head><body><div id="root"></div><!-- seo:body --><noscript>x</noscript><!-- /seo:body --></body></html>',
].join('\n');

const PATHS = routes
  .filter((route) => !route.prova)
  .flatMap((route) => [
    {
      id: route.id,
      path: route.path,
      lang: 'pt' as const,
      enPath: route.enPath,
      ptPath: route.path,
    },
    {
      id: route.id,
      path: route.enPath,
      lang: 'en' as const,
      enPath: route.enPath,
      ptPath: route.path,
    },
  ]);

const rendered = new Map<string, { page: RenderedRoute; doc: string }>();

async function build(path: string) {
  const known = rendered.get(path);

  if (known) return known;

  const page = await renderRoute(path);
  const entry = { page, doc: assembleDocument({ template: TEMPLATE, rendered: page }) };

  rendered.set(path, entry);

  return entry;
}

const count = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].length;
const alternates = (doc: string) =>
  [...doc.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [
    m[1],
    m[2],
  ]);

describe('pré-render de cada rota × idioma (FR-028)', () => {
  it.each(PATHS)(
    '$path ($lang) tem main, um h1, lang e a casca certa',
    async ({ id, path, lang }) => {
      const { page, doc } = await build(path);
      const bare = id === 'terminal';

      expect(page.status).toBe(200);
      expect(page.routeId).toBe(id);
      expect(count(doc, /<main[ >]/g)).toBe(1);
      expect(count(doc, /<h1[ >]/g)).toBe(1);
      expect(doc).toMatch(new RegExp(`<html lang="${lang === 'pt' ? 'pt-BR' : 'en'}"`));
      expect(count(doc, /class="deco-stripe"/g)).toBe(1);
      // casca: cabeçalho, skip link e rodapé em toda rota, menos na sem casca
      expect(count(doc, /<header class="hdr"/g)).toBe(bare ? 0 : 1);
      expect(count(doc, /class="skip-link"/g)).toBe(bare ? 0 : 1);
      expect(count(doc, /<footer class="credits"/g)).toBe(bare ? 0 : 1);
      // a faixa de idioma só existe no cliente (depende do navegador): nunca no HTML gerado
      expect(doc).not.toMatch(/class="lang-offer"/);
    },
  );

  it.each(PATHS)(
    '$path ($lang): título, canonical e hreflang recíproco',
    async ({ path, lang, enPath, ptPath }) => {
      const { doc } = await build(path);
      const base = 'https://mariabdev.netlify.app';
      const own = lang === 'pt' ? ptPath : enPath;

      expect(doc).toMatch(/<title>[^<]+<\/title>/);
      expect(doc).toContain(`rel="canonical" href="${base}${own}"`);
      expect(alternates(doc)).toEqual([
        ['pt-BR', `${base}${ptPath}`],
        ['en', `${base}${enPath}`],
        ['x-default', `${base}${ptPath}`],
      ]);
    },
  );

  it.each(['/xyz', '/en/xyz'])(
    '%s é a 404: status 404, um h1, sem canonical nem hreflang',
    async (path) => {
      const { page, doc } = await build(path);

      expect(page.status).toBe(404);
      expect(page.routeId).toBe('notFound');
      expect(count(doc, /<h1[ >]/g)).toBe(1);
      expect(count(doc, /<main[ >]/g)).toBe(1);
      expect(alternates(doc)).toEqual([]);
      expect(doc).not.toContain('rel="canonical"');
      expect(doc).toContain('noindex');
      expect(doc).toMatch(new RegExp(`<html lang="${path.startsWith('/en') ? 'en' : 'pt-BR'}"`));
    },
  );

  it('data-shell="bare" só no HTML do terminal (nos dois idiomas)', async () => {
    for (const { path, id } of PATHS) {
      const { doc } = await build(path);

      expect(doc.includes('data-shell="bare"'), path).toBe(id === 'terminal');
    }
  });

  it('o script de boot vem antes do CSS e do script do site, e é síncrono', async () => {
    const { doc } = await build('/sobre');
    const boot = doc.indexOf('<script id="boot">');

    expect(boot).toBeGreaterThan(-1);
    expect(boot).toBeLessThan(doc.indexOf('<link rel="stylesheet"'));
    expect(boot).toBeLessThan(doc.indexOf('type="module"'));
    expect(doc.slice(boot, doc.indexOf('>', boot))).not.toMatch(/async|defer|module/);
  });

  it('o <noscript> antigo sai e o conteúdo vem dentro do #root', async () => {
    const { doc } = await build('/sobre');

    expect(doc).not.toContain('<noscript>');
    expect(doc).toMatch(/<div id="root"><[^]*<main/);
  });

  it('modulepreload entra no head quando o plugin passa os chunks', async () => {
    const { page } = await build('/sobre');
    const doc = assembleDocument({
      template: TEMPLATE,
      rendered: page,
      preload: ['/static/Sobre-1.js'],
    });

    expect(doc).toContain('<link rel="modulepreload" href="/static/Sobre-1.js" />');
  });

  it('sem #root no template, falha alto', async () => {
    const { page } = await build('/sobre');

    expect(() => assembleDocument({ template: '<html></html>', rendered: page })).toThrow(/root/);
  });
});
