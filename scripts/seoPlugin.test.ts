import { readFileSync } from 'node:fs';
import { bootSource } from '../src/boot/boot';
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

  it('o index.html não fixa o tema nem guarda o script antigo (FR-005)', () => {
    expect(template).not.toContain('data-theme="dark"');
    expect(template).not.toMatch(/<html[^>]*data-theme/);
    expect(template).not.toContain("localStorage.getItem('portfolio-theme')");
    expect(template).toContain('<!-- boot:script -->');
  });

  it('injeta o script de boot síncrono no <head>, antes de qualquer CSS ou script de módulo', () => {
    const html = transform(template);
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
    const boot = head.indexOf('<script id="boot">');

    expect(boot).toBeGreaterThan(-1);
    expect(head).not.toContain('<!-- boot:script -->');
    expect(html.match(/<script id="boot"/g)).toHaveLength(1);
    // síncrono: sem `type="module"`, `async` nem `defer`
    expect(head.slice(boot, boot + 40)).not.toMatch(/module|async|defer/);
    // o `meta charset` vem nos primeiros 1024 bytes, antes do script
    expect(html.indexOf('<meta charset')).toBeLessThan(1024);
    expect(html.indexOf('<meta charset')).toBeLessThan(html.indexOf('<script id="boot"'));
    // nenhuma folha de estilo nem módulo no <head> do fonte: o Vite os acrescenta depois do script
    expect(head.indexOf('rel="stylesheet"')).toBe(-1);
    expect(head.indexOf('type="module"')).toBe(-1);
    // o texto é o do módulo de boot, inteiro e sem helpers do esbuild
    expect(html).toContain(bootSource());
    expect(html).not.toMatch(/__name\(|__publicField|__defProp/);
  });

  it('tem dois <meta theme-color> com `media`, um por tema', () => {
    const metas = [...template.matchAll(/<meta name="theme-color"[^>]*>/g)].map((m) => m[0]);

    expect(metas).toHaveLength(2);
    expect(
      metas.some((m) => /content="#fff7ea"/i.test(m) && /prefers-color-scheme: light/.test(m)),
    ).toBe(true);
    expect(
      metas.some((m) => /content="#0e0e10"/i.test(m) && /prefers-color-scheme: dark/.test(m)),
    ).toBe(true);
  });

  it('pré-carrega as três fontes (e só elas), com crossorigin', () => {
    const preloads = [...template.matchAll(/<link\s+rel="preload"[^>]*>/g)].map((m) => m[0]);
    const hrefs = preloads.map((p) => p.match(/href="([^"]+)"/)?.[1]).sort();

    expect(hrefs).toEqual([
      '/fonts/ibm-plex-mono-latin-400.woff2',
      '/fonts/ibm-plex-sans-latin-400.woff2',
      '/fonts/ibm-plex-sans-latin-600.woff2',
    ]);

    for (const p of preloads) {
      expect(p).toMatch(/as="font"/);
      expect(p).toMatch(/type="font\/woff2"/);
      expect(p).toMatch(/crossorigin/);
    }
  });

  it('não deixa o título nem a descrição fecharem a tag por engano', () => {
    const html = transform(template);
    const json = html.match(/<script id="ld-json"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';

    expect(() => JSON.parse(json)).not.toThrow();
  });
});
