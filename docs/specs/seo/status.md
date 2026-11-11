# Status — SEO e descoberta em buscadores

| ID | Requisito | Estado | Evidência |
| --- | --- | --- | --- |
| SE-01 | Metadados por página | ✅ | `src/data/seo.test.ts` — "metadados por página" |
| SE-02 | HTML estático por rota | ✅ | `scripts/seoPlugin.test.ts`; `npm run build` gera `dist/*.html` (conferido) |
| SE-03 | Canonical | ✅ | `src/data/seo.test.ts` — "canonical absoluto…" |
| SE-04 | Robots e sitemap | ✅ | `dist/robots.txt` e `dist/sitemap.xml` conferidos após o build |
| SE-05 | Status HTTP | ◐ | 404 verificado em servidor local que imita a Netlify; **confirmar em produção** |
| SE-06 | Dados estruturados | ✅ | `src/data/seo.test.ts` — "JSON-LD"; validar no Rich Results Test após o deploy |
| SE-07 | Compartilhamento | ✅ | `src/data/seo.test.ts` — "Open Graph e Twitter Card"; conferir com os depuradores das redes após o deploy |
| SE-08 | Meta em tempo de execução | ✅ | `src/hooks/useDocumentMeta.test.tsx` |
| SE-09 | Idioma | ✅ | `src/i18n/LanguageContext.tsx` (`lang`); hreflang descartado por decisão |
| SE-10 | Hierarquia de títulos | ✅ | `src/App.test.tsx`, `src/sections/portfolio/Projects.test.tsx`; Lighthouse acessibilidade 100 |
| SE-11 | Desempenho | ◐ | JS da home 151 → 109 kB gzip; Lighthouse local (mobile, sem compressão) conferido; medir de novo em produção |
| SE-12 | Sem intersticial para robôs | ✅ | `src/components/MobileNoticeModal.test.tsx` — "não aparece para robôs de busca" |

Resumo: ✅ 10 · ◐ 2 · ❌ 0 · ❔ 0

## Pendências

- Inglês indexável: exigiria URLs por idioma (ex.: `/en/...`) e então `hreflang`; é uma
  mudança de roteador e de produto, não feita aqui.
- Domínio próprio: trocar `SITE_URL` em `src/data/seo.ts` (única ocorrência).
- Cadastrar o site no Google Search Console e enviar o `sitemap.xml`.
