// T5.1 (TD-009): a página de prova, pré-renderizada com `__PROVA__` ligado, tem os elementos que a
// medição (T5.3) e os testes de acessibilidade e teclado (T5.2) precisam, nos dois idiomas, e sai com
// noindex e sem hreflang.
const count = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].length;

async function load() {
  vi.stubGlobal('__PROVA__', true);
  vi.resetModules();

  const server = await import('../src/entry-server');
  const seo = await import('../src/data/seoHead');

  return { ...server, ...seo };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('página /_prova', () => {
  it.each([
    ['/_prova', 'pt', 'Página de prova'],
    ['/en/_prova', 'en', 'Proof page'],
  ])(
    '%s (%s) tem h1, h2, h3, 3 parágrafos de exemplo, link, 2 botões, figura e 5 etiquetas',
    async (path, lang, title) => {
      const { renderRoute } = await load();
      const page = await renderRoute(path);
      const html = page.html;

      expect(page.routeId).toBe('prova');
      expect(page.status).toBe(200);
      expect(page.lang).toBe(lang);
      expect(count(html, /<h1[ >]/g)).toBe(1);
      expect(count(html, /<h2[ >]/g)).toBe(1);
      expect(count(html, /<h3[ >]/g)).toBe(1);
      expect(html).toContain(`<h1>${title}</h1>`);
      expect(count(html, /<p>(EXEMPLO|EXAMPLE):/g)).toBe(3);
      expect(count(html, /<button type="button" class="btn(-o)?">/g)).toBe(2);
      expect(html).toMatch(/<img[^>]*alt="[^"]{10,}"[^>]*width="48"[^>]*height="48"/);
      expect(count(html, /class="chip chip--default/g)).toBe(5);
      expect(html).toMatch(/<main[^>]*>[\s\S]*<h1[\s\S]*<\/main>/);
      // o rodapé da casca leva o link único para a home (no idioma da página)
      expect(html).toContain(`<footer class="credits"`);
    },
  );

  it('o <head> sai com noindex e sem hreflang', async () => {
    const { headTags } = await load();
    const { tags } = headTags('prova', 'pt');

    expect(tags.find((t) => t.attrs.name === 'robots')?.attrs.content).toMatch(/^noindex/);
    expect(tags.some((t) => t.attrs.hreflang)).toBe(false);
  });
});
