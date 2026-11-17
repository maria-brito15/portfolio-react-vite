import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Lang } from '../types';

const JSON_LD_ID = 'ld-json';

// Atualiza o <head> (`lang`, título, descrição, canonical, `hreflang`, Open Graph, Twitter e JSON-LD)
// conforme a página e o idioma. Os valores vêm de src/data/seo.ts e seoHead.ts, os mesmos módulos
// que gera o HTML estático no build; aqui só se corrige o que já veio da rota. O módulo
// (~10 kB) é carregado sob demanda: o HTML de cada rota já nasce com o <head> certo, então a
// primeira pintura não depende dele.
export function useDocumentMeta(routeId: string) {
  const { lang } = useLanguage();

  useEffect(() => {
    let live = true;

    import('../data/seoHead').then(({ headTags, jsonLdFor, tagSelector }) => {
      if (live) apply(routeId, lang, headTags, jsonLdFor, tagSelector);
    });

    return () => {
      live = false;
    };
  }, [routeId, lang]);
}

type Seo = typeof import('../data/seoHead');

function apply(
  routeId: string,
  lang: Lang,
  headTags: Seo['headTags'],
  jsonLdFor: Seo['jsonLdFor'],
  tagSelector: Seo['tagSelector'],
) {
  const { title, tags } = headTags(routeId, lang);

  document.title = title;
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  for (const tag of tags) {
    let el = document.head.querySelector(tagSelector(tag));

    if (!el) {
      el = document.createElement(tag.tag);
      document.head.append(el);
    }
    for (const [name, value] of Object.entries(tag.attrs)) el.setAttribute(name, value);
  }

  // Sem canonical (404), remove o que a página anterior deixou.
  if (!tags.some((t) => t.attrs.rel === 'canonical'))
    document.head.querySelector('link[rel="canonical"]')?.remove();

  const graph = jsonLdFor(routeId, lang);
  let script = document.getElementById(JSON_LD_ID);

  if (!graph) {
    script?.remove();

    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = JSON_LD_ID;
    script.setAttribute('type', 'application/ld+json');
    document.head.append(script);
  }
  script.textContent = JSON.stringify(graph);
}
