# Espaço cultural: tarefas

Uma tarefa por commit; a mensagem leva o ID. Plano em `design.md`.

## Fase 1: Foundation com dados fictícios

**Concluída em 14/11/2026** (T-CL1 a T-CL9, um commit cada na branch `feat/espaco-cultural`). Estado por requisito em `status.md`.

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-CL1 | `types.ts`, `review.ts` (`truncateReview`, `groupByMonth`, `formatRating`) e testes | CL-07, CL-10, CL-22, CL-25 | — | Testes: truncamento em limite de palavra; mês sem data vai ao fim; nota `3.5` vira `★★★½` com rótulo PT/EN; tipos compilam |
| T-CL2 | `PersonalSource<T>`, `mode.ts`, mocks de Hardcover, Letterboxd e TMDB com os casos chatos, `index.ts` por fonte, `usePersonal.ts` | CL-08, CL-09, CL-10, CL-11, CL-15 | T-CL1 | Testes: cada caso chato existe; títulos fictícios; todo item `provenance.source: 'mock'`; hook cobre loading, erro, vazio e `stale`; páginas não importam `mock.ts` |
| T-CL3 | Trava: `assertSourceMode`, plugin `personalGuard`, `PlaceholderBadge`, `SourceBadge` | CL-13, CL-14, CL-15 | T-CL2 | Testes: `assertSourceMode` lança em `mock` + produção e passa nos outros casos; badge renderiza nos dois idiomas; `npm run build` com `CONTEXT=production` falha |
| T-CL4 | Rotas e casca: `routes.ts` (5 rotas, `draft` por modo), `App.tsx`, `lazyPages.ts` + `setup.js`, `seo.ts`, textos `ui.personal` PT/EN, página-esqueleto por rota | CL-01 a CL-04, CL-26 | T-CL3 | Testes: caminhos e aliases abrem; `draft` fora do sitemap; breadcrumb `~/pessoal/livros`; meta PT/EN; paridade de `ui`; suíte inteira verde |
| T-CL5 | `personal.css` e componentes base (`EditorialHeader`, `SectionIndex`, `CoverFigure`, `RatingStars`, `StaleNotice`, `AttributionFooter`) | CL-16 a CL-19, CL-37 | T-CL4 | Testes de componente; `contrast.test.ts` e `styles.test.ts` verdes; sem hex fora de `tokens.css`; placeholder tipográfico sem imagem |
| T-CL6 | Páginas Filmes e Livros: `DiaryRow`, `ReviewBlock`, `ShelfGrid`, estados e rodapé de sincronização | CL-11, CL-12, CL-21, CL-22, CL-25 | T-CL5 | Testes: diário por mês; filme sem nota/data; resenha longa truncada; `publish: false` oculta; vazio e erro; "última sincronização" |
| T-CL7 | Páginas Música e Teatro (mock) e Hub (índice e destaques) | CL-20, CL-23, CL-24 | T-CL6 | Testes: hub lista as 4 seções com destaque; música e teatro com mock e selo |
| T-CL8 | Comando `pessoal`/`personal`, `personas.ts` e `personaHome.ts` (amigo e professor), `searchRanking.ts` | CL-05, CL-06 | T-CL7 | Testes: Tab, ajuda e catálogo; `amigo` e `professor` destacam, os outros não; ninguém perde acesso; busca acha as páginas |
| T-CL9 | Verificação da Fase 1: lint, testes, build, peso do JS inicial, `/verify-site` (1440×900 e 390×844, claro e escuro), `status.md`, índice das specs | CL-35, CL-36, CL-37 | T-CL8 | Evidência no `status.md`; páginas em `lazy` sem aumentar o JS inicial |

## Fase 2: filmes reais (precisa da chave do TMDB; o RSS não precisa de credencial)

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-CL10 | Fixture real do RSS e normalizador puro do Letterboxd | CL-27 | T-CL9 | Testes com os 50 itens: sem data, sem nota, série; ordem por `watchedDate` |
| T-CL11 | Cliente TMDB, cache por filme, atribuição | CL-28 | T-CL10 | Testes sem rede; pôster e metadados PT/EN; sem pôster = placeholder |
| T-CL12 | Função `/api/personal/films`, cache em Blobs, `live.ts`, troca no `index.ts`, `.env.example` | CL-31, CL-32 | T-CL11 | Testes de erro (fonte fora, 401, 429) e de cache; páginas inalteradas; sem segredo em `dist/` |

## Fase 3: livros reais (precisa do token do Hardcover)

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-CL13 | Prova de conceito: consulta real ao Hardcover; ajustar `Book` ao que a API entrega; anotar divergências no `README.md` | CL-29 | T-CL9 | Resposta real das estantes de `@dudapbrt` salva como fixture (sem token) |
| T-CL14 | Normalizador, função `/api/personal/books`, cache de 6 h, `live.ts` | CL-29, CL-31 | T-CL13 | Testes com a fixture; limite da API respeitado; páginas inalteradas |
| T-CL15 | Importador do CSV do Letterboxd → JSON versionado, com `publish` | CL-30 | T-CL10 | Testes com CSV de exemplo sintético; CSV bruto fora do repositório |

## Fase 4: sincronização e HTML estático

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-CL16 | Função agendada e build hook | CL-33 | T-CL12, T-CL14 | Repopula o cache nas frequências; falha isolada por fonte |
| T-CL17 | Snapshot (`npm run personal:snapshot`) e pré-renderização das listas no `seoPlugin` | CL-34 | T-CL16 | Teste: HTML de `/pessoal/filmes` contém a lista; snapshot sem item `mock`; falha de fonte usa o snapshot |

## Fase 5: qualidade e publicação

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-CL18 | Conteúdo manual de música e teatro fornecido pela Duda; remover todos os mocks; tirar `draft` onde há conteúdo real | CL-10, CL-15 | T-CL17 | Nenhum `mock` no código de produção; teste que varre `src/` |
| T-CL19 | Revisão de busca, assistente e trilhas; atribuição TMDB; `/verify-site` completo; variáveis no painel da Netlify; `status.md` e índice | CL-35 a CL-38 | T-CL18 | Evidência no `status.md`; `SECRETS_SCAN` sem alarme |

Ordem: T-CL1 → … → T-CL9 (Fase 1, sem credenciais) → T-CL10 → T-CL12 → T-CL13 → T-CL15 →
T-CL16 → T-CL17 → T-CL18 → T-CL19. T-CL10 a T-CL12 e T-CL13 a T-CL15 podem andar em paralelo.
