# Espaço cultural: auditoria do estado real (14/11/2026)

Feita só lendo o repositório, o `git log` e os documentos; nada foi inventado. O pedido citava
`docs/specs/pessoal/`, mas a spec vive em **`docs/specs/personal/`**. Fonte da numeração de fases:
os pedidos de trabalho (0 decisões · 1 base com dados fictícios · 2 filmes · 3 livros · 4 música e
teatro · 5 hub · 6 QA). O `README.md`/`CHECKLIST.md` do repositório usam outra numeração
(a sincronização é a "Fase 4" lá); onde difere, está dito.

## 0. Aviso sobre a árvore de trabalho

Estão **commitadas** as Fases 0 e 1 e os livros (8 commits na `feat/espaco-cultural`). **Filmes,
música/teatro, hub novo, QA e a documentação deles ainda não foram commitados**: 30 arquivos
modificados + 26 novos. Se o computador falhar, isso se perde.

## 1. Fases

| Fase | Estado | Por quê |
| --- | --- | --- |
| 0 Decisões e preparo | **DONE** | D1–D9 registradas (13/11), PRD, requisitos `CL-xx`, design e tarefas aprovados; `.env.zip` ignorado. Em aberto só o item "Mock fora do snapshot/pré-renderização", que depende da sincronização |
| 1 Base com dados fictícios | **DONE** | Rotas, casca, SEO, terminal, personas, sistema editorial, estados e selo `DADOS FICTÍCIOS`; trava de build em produção |
| 2 Filmes reais | **PARTIAL** | RSS, CSV, TMDB e função prontos e testados **sem rede/contas reais**; faltam o export do CSV (histórico está vazio), a chave do TMDB e a execução na Netlify |
| 3 Livros reais | **PARTIAL** | Cliente, cache, função e página prontos, testados sem rede; **esquema do Hardcover é suposição** até rodar `personal:probe` com token |
| 4 Música e Teatro | **PARTIAL** | Estrutura e páginas prontas; música só com a lista de instrumentos dela; teatro **sem nenhum conteúdo** (segue rascunho) |
| 5 Hub | **PARTIAL** | Hub, cartões e destaques prontos; falta `/verify-site` (capturas 1440×900 e 390×844, claro/escuro) |
| 6 QA | **PARTIAL** | `QA.md`: testes de falha, dedupe, segredos, estrutura/idioma/perfis. Abertos: teclado e leitor de tela à mão, Lighthouse, deploy real |
| (repo "Fase 4") Sincronização agendada + HTML estático | **NOT STARTED** | Não há função agendada, build hook nem pré-renderização das listas (CL-33, CL-34) |

## 2. Arquivos por fase

**0 (commit `f44a713`…)**: `docs/specs/personal/{README,prd,requirements,design,tasks,CHECKLIST,status}.md`, `.gitignore`.

**1 (commits T-CL1…T-CL9, `045d7d1`)**: `src/data/personal/{types,review,stats,highlights,profiles,integrations}.ts`,
`src/services/integrations/{mode,parseMode,source}.ts` e `*/mock.ts`, `src/hooks/usePersonal.ts`,
`src/components/personal/{CoverFigure,EditorialHeader,EditorialPage,EditorialSection,EditorialDivider,RatingStars,StaleNotice,FeedState,AttributionFooter,ShelfGrid,StatTile,PlaceholderBadge,SectionIndex,…}.tsx`,
`src/pages/personal/{PersonalHub,Books,Films,Music,Theater,PersonalSkeleton}.tsx`, `src/styles/personal.css`,
`src/i18n/personal.ts`, `src/data/{routes,seo,personas,personaHome,searchRanking,tones}.ts`,
`src/terminal/{commands.tsx,catalog.ts,extras/personal*.tsx}`, `src/components/dashboard/PersonalSpace.tsx`,
`scripts/personalGuard.ts`, `.env.example`, `scripts/envExample.test.ts`.

**2 (não commitado)**: `netlify/functions/personal-films.mts`, `netlify/personal/{films,letterboxd,letterboxdCsv,tmdb}.ts`
(+ testes, `fixtures/letterboxd-rss.xml`, `data/letterboxd-history.json` **vazio**), `scripts/importLetterboxd.mjs`,
`src/services/integrations/letterboxd/{live,parse,index}.ts`, `src/components/personal/{FilmsDiary,DiaryEntry,FilmPoster}.tsx`,
`films.test.tsx`, `docs/specs/personal/films.md`.

**3 (commit `4749b8d`)**: `netlify/functions/personal-books.mts`, `netlify/personal/{books,hardcover,cache}.ts` (+ testes),
`scripts/hardcoverProbe.mjs`, `src/components/personal/{BookCard,BooksShelves}.tsx`, `docs/specs/personal/hardcover.md`.

**4 (não commitado)**: `src/data/personal/{music,theater}.ts`, `src/components/personal/{CuratedEntry,InstrumentCard,MusicProfile,TheaterProfile}.tsx`, `curated.test.tsx`.

**5 (não commitado)**: `HubIndex.tsx`, `highlights.ts`, `hubCards.test.tsx`, ajustes em `personal.css`.

**6 (não commitado)**: `netlify/personal/qa.test.ts`, `src/components/personal/qa.test.tsx`, `docs/specs/personal/QA.md`.

## 3. Marcadores no código

| Onde | O quê |
| --- | --- |
| `src/data/personal/music.ts:20` | TODO: nível, `since`, `note` dos instrumentos (opcional) |
| `src/data/personal/music.ts:31,34,37,40` | TODO (Duda): prática atual, artistas, músicas, discos (listas vazias) |
| `src/data/personal/theater.ts:26,30,33,36,39` | TODO (Duda): peças, vivências, produções favoritas, observações, referências visuais (tudo vazio) |
| `src/i18n/personal.ts:6` e `:139` | Texto do selo `DADOS FICTÍCIOS` / `PLACEHOLDER DATA` (intencional; só aparece em modo `mock`) |
| `src/services/integrations/{hardcover,letterboxd,manual,tmdb}/mock.ts:1` | Cabeçalho "DADOS FICTÍCIOS": mocks inteiros, usados só em `VITE_PERSONAL_SOURCE=mock` e testes |
| `netlify/personal/data/letterboxd-history.json` | Esqueleto vazio `{ "entries": [] }`: aguarda o CSV |
| Sem `FIXME` nem `stub` com esse nome em `src/`, `netlify/` ou `scripts/` | |

## 4. Decisões ainda abertas ou condicionais

D1–D9 estão **decididas**. O que ficou em aberto, de fato:

1. **D7, cadência do rebuild**: a decisão diz "listas no HTML estático"; o §11.1 deixa "a cada 6 h/1 h ou 1x/dia" em aberto, e depende do plano da Netlify permitir função agendada e build hook.
2. **D2, itálico verdadeiro**: hoje peso 700; itálico real exigiria hospedar outra fonte. Opcional.
3. **D3 / TMDB**: termos de reuso e limites do TMDB "a confirmar" (README §4.3, [A]).
4. **Hardcover**: se a capa vem no payload é [A] até o `probe`; listas e metas não feitas.
5. **Persona no lede do hub**: opcional, não feito (precisa de texto novo).
6. **Teatro**: sai do rascunho quando houver conteúdo; hoje não há.
7. **Lighthouse/web vitals**: o pedido cita "limites documentados na Fase 0", mas **não encontrei esses limites em nenhum documento**. Preciso que você defina.

## 5. Integrações

| Integração | Estado |
| --- | --- |
| Hardcover (livros) | **Wired, não validada**: cliente + função + cache + página; modo `live` chama `/api/personal/books`; nunca falou com o Hardcover real (sem token) |
| Letterboxd RSS | **Wired e validada contra o feed real** (50 itens, 14/11) por fixture; função não executada na Netlify |
| Letterboxd CSV | **Wired, só com CSV sintético**; JSON de histórico vazio |
| TMDB | **Wired, não validada**: testes sem rede; forma da resposta assumida da documentação |
| Música / Teatro | Manual (sem integração); conteúdo majoritariamente vazio |
| Sincronização agendada / build hook | **Not wired** |

## 6. Variáveis de ambiente

| Variável | Onde é usada | No `.env.example`? |
| --- | --- | --- |
| `VITE_PERSONAL_SOURCE` | `mode.ts`, `personalGuard.ts` | sim |
| `HARDCOVER_API_TOKEN` | `hardcover.ts`, `personal-books.mts`, probe | sim (vazio) |
| `HARDCOVER_USERNAME` | `books.ts` | sim |
| `PERSONAL_HARDCOVER_TTL_MIN` | `books.ts` | sim |
| `TMDB_API_KEY` | `tmdb.ts`, `films.ts`, importador | sim (vazio) |
| `LETTERBOXD_USERNAME` | `films.ts` | sim |
| `PERSONAL_LETTERBOXD_TTL_MIN` | `films.ts` | sim |
| `PERSONAL_REFRESH_SECRET` | **nenhum código** | sim, mas **sem uso** (reservada à Fase 4) |
| `PERSONAL_BUILD_HOOK_URL` | **nenhum código** | sim, mas **sem uso** (reservada à Fase 4) |
| `CONTEXT` (Netlify) | `personalGuard.ts` | não (é da plataforma) |
| `VITE_EMAILJS_*` (3) | contato | sim |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `ASK_SALT`, `VITE_ASK_ENABLED`, `ASK_EVAL` | assistente (`ask.mts`, `trails.ts`) | **não documentadas** (fora do espaço cultural, mas faltam no `.env.example`) |

Constantes que parecem variáveis mas são só código (`HARDCOVER_ENDPOINT`, `HARDCOVER_SITE`,
`TMDB_CACHE_KEY`, `HARDCOVER_PROFILE`, `LETTERBOXD_PROFILE`): não precisam de entrada.
