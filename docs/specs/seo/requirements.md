# SEO e descoberta em buscadores

O portfólio é uma SPA: o `index.html` chegava vazio e título, descrição e imagem de
compartilhamento só existiam depois do JavaScript. Esta feature faz buscadores e
pré-visualizações de link entenderem cada página, sem mudar o visual.

Grupo de requisitos **SE-xx**. Fonte única: `src/data/seo.ts` (dados) e
`scripts/seoPlugin.ts` (HTML estático no build).

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| SE-01 | Metadados por página | Toda rota de `routes.ts` (e o 404) tem título (≤ 66 car.) e descrição (70–165 car.) nos dois idiomas, únicos entre páginas | P0 | AUT |
| SE-02 | HTML estático por rota | `npm run build` grava `dist/<rota>.html` (e os alias EN) com título, descrição, canonical, Open Graph, Twitter Card e JSON-LD da página, sem depender de JavaScript | P0 | AUT/MAN |
| SE-03 | Canonical | Absoluto, sem barra final (exceto `/`); alias (`/about`) aponta para o caminho principal; 404 não tem canonical | P0 | AUT |
| SE-04 | Robots e sitemap | `robots.txt` libera tudo e aponta o sitemap; `sitemap.xml` lista as 10 URLs canônicas (sem alias); 404 com `noindex` | P0 | AUT/MAN |
| SE-05 | Status HTTP | URL inexistente responde 404 de verdade (`404.html`), sem regra `/* → /index.html 200` | P0 | MAN |
| SE-06 | Dados estruturados | JSON-LD com `WebSite`, `Person` (perfis reais, papel de estudante), `ProfilePage` (home e Sobre), `BreadcrumbList`, e projetos como `SoftwareSourceCode`/`CreativeWork`; só fatos presentes no site | P0 | AUT |
| SE-07 | Compartilhamento | Open Graph e Twitter Card completos; imagem 1200×630 absoluta; `og:locale` acompanha o idioma | P0 | AUT |
| SE-08 | Meta em tempo de execução | `useDocumentMeta(routeId)` atualiza `<head>` e JSON-LD a cada rota/idioma, sem duplicar tags e limpando canonical/JSON-LD no 404 | P0 | AUT |
| SE-09 | Idioma | `<html lang>` acompanha o idioma. **Sem hreflang**: o idioma é estado do cliente e não há URL por idioma | P1 | AUT |
| SE-10 | Hierarquia de títulos | Cada página tem um único `h1`; os níveis abaixo não pulam | P1 | AUT |
| SE-11 | Desempenho | Fonte própria (sem Google Fonts), páginas pesadas com `React.lazy`, imagens otimizadas, cache imutável em `/static` e `/fonts` | P1 | MAN |
| SE-12 | Sem intersticial para robôs | O aviso de celular não é montado para robôs de busca (ver MB-09) | P1 | AUT |

## Decisões

- **Sem hreflang.** Anunciar `hreflang` exige uma URL por idioma. Aqui as duas línguas
  usam a mesma URL; declarar alternativas falsas prejudicaria mais do que ajudaria. O HTML
  estático sai em pt-BR. Caminho para o inglês indexável: URLs por idioma (ver `status.md`).
- **`.html` por rota, não pasta/index.html.** A Netlify serve `/sobre` sem redirecionar
  para `/sobre/`, mantendo a URL igual ao canonical.
- **HTML estático gerado por plugin, não SSR.** O app usa `window`/`localStorage`; um plugin
  de ~100 linhas, sem dependência, entrega o que os crawlers sem JavaScript precisam (o
  `<head>` e um `<noscript>` com texto e links). O Google renderiza o app normalmente.
- **Meta num lugar só.** Os textos de título/descrição saíram de `portfolio.tsx`,
  `resume.ts`, `services.tsx`, `Academics.tsx` e `CaseStudy.tsx` e moram em `seo.ts`.
