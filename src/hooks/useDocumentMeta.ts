import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { headTags, jsonLdFor, tagSelector } from '../data/seo';

const JSON_LD_ID = 'ld-json';

// Atualiza o <head> (título, descrição, canonical, Open Graph, Twitter e JSON-LD)
// conforme a página e o idioma. Os valores vêm de src/data/seo.ts, o mesmo módulo
// que gera o HTML estático no build; aqui só se corrige o que já veio da rota.
export function useDocumentMeta(routeId: string) {
  const { lang } = useLanguage();

  useEffect(() => {
    const { title, tags } = headTags(routeId, lang);

    document.title = title;

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
  }, [routeId, lang]);
}
