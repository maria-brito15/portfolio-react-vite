import { readFileSync } from 'node:fs';
import { seoPlugin } from './seoPlugin';
import { routes } from '../src/data/routes';
import { metaFor } from '../src/data/seo';

const template = readFileSync('index.html', 'utf8');
const transform = (seoPlugin().transformIndexHtml as (html: string) => string).bind(null);

describe('plugin de SEO estático', () => {
  it('o index.html tem os marcadores que o plugin preenche', () => {
    expect(template).toContain('<!-- seo:head -->');
    expect(template).toContain('<!-- seo:body -->');
  });

  it('injeta o <head> da home e o <noscript> com um link por página', () => {
    const html = transform(template);

    expect(html).toContain(`<title>${metaFor('home', 'pt').title}</title>`);
    expect(html).toContain('rel="canonical" href="https://mariabdev.netlify.app/"');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('<noscript>');

    for (const r of routes.filter((r) => r.id !== 'home' && !r.hidden && !r.draft))
      expect(html, r.path).toContain(`<a href="${r.path}">`);

    // páginas em construção não são anunciadas
    for (const r of routes.filter((r) => r.draft))
      expect(html, r.path).not.toContain(`href="${r.path}"`);
  });

  it('não deixa o título nem a descrição fecharem a tag por engano', () => {
    const html = transform(template);
    const json = html.match(/<script id="ld-json"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';

    expect(() => JSON.parse(json)).not.toThrow();
  });
});
