import { routes } from './routes';
import { projects } from './projects';
import { profile } from './profile';
import { NOT_FOUND_ID, SITE_URL, absoluteUrl, headTags, jsonLdFor, metaFor, pageMeta } from './seo';
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
    for (const [id, meta] of Object.entries(pageMeta))
      for (const lang of LANGS) {
        expect(meta[lang].title.length, `${id}/${lang} título`).toBeLessThanOrEqual(66);
        if (id === NOT_FOUND_ID) continue;
        expect(meta[lang].description.length, `${id}/${lang} descrição`).toBeGreaterThanOrEqual(70);
        expect(meta[lang].description.length, `${id}/${lang} descrição`).toBeLessThanOrEqual(165);
      }
  });

  it('títulos e descrições são únicos em cada idioma (sem conteúdo duplicado)', () => {
    for (const lang of LANGS) {
      const titles = Object.values(pageMeta).map((m) => m[lang].title);
      const descriptions = Object.values(pageMeta).map((m) => m[lang].description);

      expect(new Set(titles).size).toBe(titles.length);
      expect(new Set(descriptions).size).toBe(descriptions.length);
    }
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

    for (const r of routes)
      expect(find(headTags(r.id, 'pt').tags, 'robots')?.attrs.content, r.id).not.toContain(
        'noindex',
      );
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
