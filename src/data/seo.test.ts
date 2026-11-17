import { routes } from './routes';
import { projects } from './projects';
import { profile } from './profile';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NOT_FOUND_ID, SITE_URL, absoluteUrl, metaFor } from './seo';
import { headTags, jsonLdFor, tagSelector } from './seoHead';
import { isDraft } from './routeStatus';
import type { Lang } from '../types';

const LANGS: Lang[] = ['pt', 'en'];

describe('metadados por página', () => {
  it('toda rota (e o 404) tem título e descrição nos dois idiomas', () => {
    for (const id of [...routes.map((r) => r.id), NOT_FOUND_ID])
      for (const lang of LANGS) {
        const { title, description } = metaFor(id, lang);

        expect(title.length, `${id}/${lang} título`).toBeGreaterThan(10);
        expect(description.length, `${id}/${lang} descrição`).toBeGreaterThan(40);
      }
  });

  it('títulos curtos o bastante para não serem cortados; descrições entre 70 e 165 caracteres', () => {
    for (const id of [...routes.map((r) => r.id), NOT_FOUND_ID])
      for (const lang of LANGS) {
        const meta = metaFor(id, lang);

        expect(meta.title.length, `${id}/${lang} título`).toBeLessThanOrEqual(66);
        if (id === NOT_FOUND_ID) continue;
        expect(meta.description.length, `${id}/${lang} descrição`).toBeGreaterThanOrEqual(70);
        expect(meta.description.length, `${id}/${lang} descrição`).toBeLessThanOrEqual(165);
      }
  });

  it('títulos e descrições são únicos em cada idioma (sem conteúdo duplicado)', () => {
    for (const lang of LANGS) {
      const ids = [...routes.map((r) => r.id), NOT_FOUND_ID];
      const titles = ids.map((id) => metaFor(id, lang).title);
      const descriptions = ids.map((id) => metaFor(id, lang).description);

      expect(new Set(titles).size).toBe(titles.length);
      expect(new Set(descriptions).size).toBe(descriptions.length);
    }
  });
});

describe('título e descrição vêm da tabela de rotas (FR-009, TD-006)', () => {
  it('metaFor devolve exatamente o title e a description da rota, nos dois idiomas', () => {
    for (const r of routes)
      for (const lang of LANGS)
        expect(metaFor(r.id, lang), `${r.id}/${lang}`).toEqual({
          title: r.title[lang],
          description: r.description[lang],
        });
  });

  it('seo.ts não guarda texto de página: só o meta da 404 (que não é rota)', () => {
    const source = readFileSync(join(process.cwd(), 'src/data/seo.ts'), 'utf8');

    expect(source).not.toMatch(/pageMeta/);
    // nenhum título de rota aparece no arquivo
    for (const r of routes) expect(source, r.id).not.toContain(r.title.pt);
    expect(metaFor('qualquer-coisa', 'pt').title).toBe(metaFor(NOT_FOUND_ID, 'pt').title);
  });
});

const findTag = (tags: ReturnType<typeof headTags>['tags'], key: string) =>
  tags.find((t) => Object.values(t.attrs).includes(key));

describe('hreflang (FR-023, FR-024, TD-013)', () => {
  const alternates = (id: string, lang: Lang) =>
    headTags(id, lang).tags.filter((t) => t.attrs.rel === 'alternate');
  const hrefOf = (id: string, lang: Lang, hreflang: string) =>
    alternates(id, lang).find((t) => t.attrs.hreflang === hreflang)?.attrs.href;

  it('toda rota emite os três alternates: pt-BR, en e x-default (o PT)', () => {
    for (const r of routes)
      for (const lang of LANGS) {
        const tags = alternates(r.id, lang);

        expect(tags.map((t) => t.attrs.hreflang).sort(), `${r.id}/${lang}`).toEqual([
          'en',
          'pt-BR',
          'x-default',
        ]);
        expect(hrefOf(r.id, lang, 'pt-BR')).toBe(absoluteUrl(r.path));
        expect(hrefOf(r.id, lang, 'en')).toBe(absoluteUrl(r.enPath));
        expect(hrefOf(r.id, lang, 'x-default')).toBe(absoluteUrl(r.path));
      }
  });

  it('é recíproco: a página em PT e a em EN declaram o mesmo par, e cada uma é o próprio canonical', () => {
    for (const r of routes) {
      const pt = headTags(r.id, 'pt').tags;
      const en = headTags(r.id, 'en').tags;

      expect(alternates(r.id, 'pt')).toEqual(alternates(r.id, 'en'));
      expect(findTag(pt, 'canonical')?.attrs.href, r.id).toBe(hrefOf(r.id, 'pt', 'pt-BR'));
      expect(findTag(en, 'canonical')?.attrs.href, r.id).toBe(hrefOf(r.id, 'en', 'en'));
      expect(findTag(en, 'og:url')?.attrs.content, r.id).toBe(hrefOf(r.id, 'en', 'en'));
    }
  });

  it('a home em inglês é /en e a home em português é a raiz', () => {
    expect(hrefOf('home', 'pt', 'en')).toBe(`${SITE_URL}/en`);
    expect(hrefOf('home', 'pt', 'pt-BR')).toBe(`${SITE_URL}/`);
  });

  it('a 404 não emite hreflang nem canonical', () => {
    for (const lang of LANGS) {
      const tags = headTags(NOT_FOUND_ID, lang).tags;

      expect(tags.filter((t) => t.attrs.rel === 'alternate')).toEqual([]);
      expect(findTag(tags, 'canonical')).toBeUndefined();
    }
  });

  it('uma rota de prova (quando existir) não emite hreflang nem canonical', () => {
    // a rota entra só na T5.1; aqui se prova a regra com a tabela real quando ela existir
    for (const r of routes.filter((x) => x.prova)) {
      const tags = headTags(r.id, 'pt').tags;

      expect(tags.filter((t) => t.attrs.rel === 'alternate')).toEqual([]);
    }
  });

  it('o cliente atualiza cada alternate pelo próprio hreflang, sem duplicar (tagSelector)', () => {
    const selectors = alternates('projetos', 'pt').map(tagSelector);

    expect(new Set(selectors).size).toBe(3);
    expect(selectors).toContain('link[rel="alternate"][hreflang="en"]');
    expect(tagSelector({ tag: 'link', attrs: { rel: 'canonical', href: 'x' } })).toBe(
      'link[rel="canonical"]',
    );
  });
});

describe('tags do <head>', () => {
  const find = (tags: ReturnType<typeof headTags>['tags'], key: string) =>
    tags.find((t) => Object.values(t.attrs).includes(key));

  it('canonical absoluto, sem barra final (exceto a home), e og:url igual a ele', () => {
    expect(find(headTags('home', 'pt').tags, 'canonical')?.attrs.href).toBe(`${SITE_URL}/`);

    for (const r of routes.filter((r) => r.id !== 'home')) {
      const { tags } = headTags(r.id, 'pt');
      const canonical = find(tags, 'canonical')?.attrs.href;

      expect(canonical).toBe(`${SITE_URL}${r.path}`);
      expect(canonical?.endsWith('/')).toBe(false);
      expect(find(tags, 'og:url')?.attrs.content).toBe(canonical);
    }
  });

  it('Open Graph e Twitter Card completos, com imagem absoluta 1200×630', () => {
    const { tags } = headTags('projetos', 'en');

    for (const key of [
      'og:title',
      'og:description',
      'og:image',
      'og:image:alt',
      'twitter:card',
      'twitter:title',
      'twitter:description',
      'twitter:image',
    ])
      expect(find(tags, key), key).toBeDefined();

    expect(find(tags, 'og:image')?.attrs.content).toMatch(/^https:\/\/.+\.png$/);
    expect(find(tags, 'og:image:width')?.attrs.content).toBe('1200');
    expect(find(tags, 'og:image:height')?.attrs.content).toBe('630');
    expect(find(tags, 'og:locale')?.attrs.content).toBe('en_US');
    expect(find(tags, 'og:title')?.attrs.content).toBe(metaFor('projetos', 'en').title);
  });

  it('só o 404 fica fora do índice e sem canonical', () => {
    const notFound = headTags(NOT_FOUND_ID, 'pt').tags;

    expect(find(notFound, 'robots')?.attrs.content).toContain('noindex');
    expect(find(notFound, 'canonical')).toBeUndefined();

    // fora o 404, só as páginas em construção (draft) ficam de fora do índice
    for (const r of routes)
      expect(find(headTags(r.id, 'pt').tags, 'robots')?.attrs.content, r.id).toContain(
        isDraft(r.id) ? 'noindex' : 'index, follow',
      );
  });

  it('páginas em construção têm metadados, mas não entram no sitemap', () => {
    const drafts = routes.filter((r) => isDraft(r.id));

    // só as páginas sem conteúdo (hoje /setup; /agora já tem texto da Duda) e, enquanto a fonte
    // for mock, o espaço cultural (docs/specs/personal/, CL-02)
    expect(drafts.filter((r) => !r.id.startsWith('pessoal')).map((r) => r.id)).toEqual(['setup']);
    for (const r of drafts) {
      expect(metaFor(r.id, 'pt').title, r.id).not.toBe(metaFor(NOT_FOUND_ID, 'pt').title);
      expect(metaFor(r.id, 'en').description.length, r.id).toBeGreaterThan(20);
    }
  });
});

describe('JSON-LD', () => {
  const graph = (id: string, lang: Lang = 'pt') =>
    (jsonLdFor(id, lang)?.['@graph'] ?? []) as Record<string, unknown>[];
  const ofType = (id: string, type: string, lang: Lang = 'pt') =>
    graph(id, lang).find((n) => n['@type'] === type);

  it('é JSON válido e não existe para o 404', () => {
    for (const r of routes)
      expect(() => JSON.parse(JSON.stringify(jsonLdFor(r.id, 'pt'))), r.id).not.toThrow();

    expect(jsonLdFor(NOT_FOUND_ID, 'pt')).toBeNull();
  });

  it('Person com os perfis reais (GitHub e LinkedIn) e papel de estudante, sem cargo inventado', () => {
    const person = ofType('home', 'Person', 'en');

    expect(person?.sameAs).toEqual([profile.github, profile.linkedin]);
    expect(person?.jobTitle).toBe('Software Engineering Student');
    expect(person?.image).toBe(`${SITE_URL}${profile.photo}`);
    expect(ofType('home', 'Person', 'pt')?.jobTitle).toBe('Estudante de Engenharia de Software');
  });

  it('home e Sobre são ProfilePage; ProfilePage aponta para a Person', () => {
    for (const id of ['home', 'sobre']) {
      const page = ofType(id, 'ProfilePage');

      expect(page?.mainEntity).toEqual({ '@id': `${SITE_URL}/#person` });
    }
  });

  it('toda página, exceto a home, tem BreadcrumbList terminando na própria URL', () => {
    expect(ofType('home', 'BreadcrumbList')).toBeUndefined();

    for (const r of routes.filter((r) => r.id !== 'home')) {
      const items = (ofType(r.id, 'BreadcrumbList')?.itemListElement ?? []) as {
        position: number;
        item: string;
      }[];

      expect(items[0].item, r.id).toBe(`${SITE_URL}/`);
      expect(items.at(-1)?.item, r.id).toBe(absoluteUrl(r.path));
      expect(items.map((i) => i.position)).toEqual(items.map((_, i) => i + 1));
    }
  });

  it('o estudo de caso tem trilha Início › Projetos › WhatsApp Dispatcher', () => {
    const items = (ofType('whatsapp-dispatcher', 'BreadcrumbList')?.itemListElement ?? []) as {
      name: string;
    }[];

    expect(items.map((i) => i.name)).toEqual(['Início', 'Projetos', 'whatsapp-dispatcher']);
  });

  it('Projetos lista todos os projetos; repositório só onde existe', () => {
    const list = (ofType('projetos', 'CollectionPage')?.mainEntity as Record<string, unknown>)
      .itemListElement as { item: Record<string, unknown> }[];

    expect(list).toHaveLength(projects.length);

    for (const [i, { item }] of list.entries()) {
      const p = projects[i];

      expect(item.name).toBe(p.name);
      expect(item['@type']).toBe(p.repo ? 'SoftwareSourceCode' : 'CreativeWork');
      expect(item.codeRepository).toBe(p.repo ?? undefined);
    }
  });

  it('todo "@id" referenciado existe no grafo', () => {
    const nodes = graph('projetos');
    const defined = new Set(nodes.map((n) => n['@id']).filter(Boolean));
    const refs = [...JSON.stringify(nodes).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);

    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(defined.has(ref), ref).toBe(true);
  });
});
