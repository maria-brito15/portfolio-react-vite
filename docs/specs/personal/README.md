# Espaço cultural (`/pessoal`): descoberta e planejamento técnico

Estado: **decisões D1–D9 registradas em 13/11/2026** (seção 11); nenhum código foi escrito.
Pendente: credenciais (D5) e a adaptação da D7 ao deploy atual. Data da auditoria: 13/11/2026.
Fluxo do projeto: PRD → especificação → plano → tarefas → código. Este documento cobre a
descoberta e o plano; PRD, requisitos (`CL-xx` a definir) e tarefas saem dele **depois** das
decisões da seção 11.

Legenda: **[V]** verificado nesta auditoria (arquivo lido ou requisição feita) ·
**[A]** assunção (conhecimento prévio ou fonte de terceiros, a confirmar antes de codar).

---

## 1. Auditoria da arquitetura atual

| Tema | Achado |
| --- | --- |
| Framework | React 19 + Vite 6, TypeScript strict, `"type": "module"`, Node >= 20.19 (`.nvmrc` 22, Netlify `NODE_VERSION=22`) [V] |
| Renderização | **SPA só no cliente**. Não há SSR nem ISR. O plugin `scripts/seoPlugin.ts` grava, no build, **um HTML por rota** (`dist/sobre.html`…) só com `<head>` (título, OG, JSON-LD), `<noscript>` e `sitemap.xml`; o React assume depois [V] |
| Roteador | Próprio, na History API (`src/router.tsx`). Rotas em tabela única `src/data/routes.ts`; `App.tsx` faz `switch` do `id` da rota para a página; páginas pesadas em `React.lazy` (`src/pages/lazyPages.ts`) [V] |
| Caminhos | Em português, com alias em inglês (`/sobre` + `/about`). Rotas aninhadas já existem (`/estudos-de-caso/whatsapp-dispatcher`, `parent`/`segment`) [V]. O seoPlugin usa `mkdirSync(dirname)`, então `pessoal/livros.html` funciona [V, leitura do código] |
| Estilo | CSS puro por arquivo (`src/styles/*.css`), tokens em `tokens.css`, 5 temas (claro, escuro, dracula, solarized, amber), fonte única JetBrains Mono hospedada, teste de contraste AA (`contrast.test.ts`) [V]. Regra do projeto: **um só estilo visual, sem degradê** (`CLAUDE.md`) [V] |
| Componentes | `SiteShell` (Window + barra lateral + breadcrumb), `DocPage`, `components/ui/{Card,Chip,DataTable,SectionTitle,ActionLink}`; páginas leem `routeById(id)` e chamam `useDocumentMeta(id)` [V] |
| Deploy | **Netlify** (`netlify.toml`, `SITE_URL = https://mariabdev.netlify.app`) [V]. Há também um `vercel.json` (`cleanUrls`), provavelmente legado [A] |
| Servidor | Netlify Functions v2: `netlify/functions/ask.mts` (`/api/ask`, Gemini), núcleo testável em `netlify/assistant/*`, limitador com `@netlify/blobs` [V] |
| Dados | `src/data/*.ts(x)`, tipados, bilíngues com `Localized<T>`, testes ao lado. GitHub é lido **no navegador** (`src/services/github.ts`, cache em `sessionStorage` por 1 h, sem token) [V] |
| Variáveis de ambiente | Cliente: `VITE_*` (EmailJS, `VITE_ASK_ENABLED`). Servidor: `process.env` na função (`GEMINI_API_KEY`…) definidas no painel da Netlify, nunca no `netlify.toml`. `.env` ignorado pelo git; `.env.example` só lista as 3 do EmailJS [V] |
| i18n | `LanguageProvider`, `localStorage` `portfolio-lang`, textos de interface em `src/i18n/ui.ts` (+ `ws.ts`), conteúdo em `Localized`. Sem URL por idioma e **sem hreflang** de propósito [V] |
| Personas | `src/data/personas.ts`: `rh`, `tech`, `professor`, `amigo`, `cliente`. Cada uma tem `order` (ids de rota), `commands`, `cta`; teste confere que os ids existem. Lente sobre o mesmo conteúdo (nunca muda o que se diz da Duda). Há ainda trilhas (`trails.ts`), busca contextual (`searchRanking.ts`), próximas ações (`nextActions.ts`) [V] |
| Navegação | Barra lateral por **grupos** (`NAV_GROUPS`). **O grupo `personal` já existe** (hoje: Contato, Agora, Setup) [V]. Nova rota de topo = entrada em `routes.ts` + `Page` em `App.tsx` + `pageMeta` em `seo.ts` + (se lazy) `lazyPages.ts` **e** o mock em `src/test/setup.js` [V] |
| Comandos | `npm run dev` · `typecheck` · `lint` · `test` (Vitest, jsdom) · `build` (`tsc --noEmit && vite build`) · `e2e` (Playwright) · `ask:eval`. **Não os executei nesta etapa** [V: scripts lidos] |
| Dependências | Só `react`, `react-dom`, `@emailjs/browser`, `@netlify/blobs`. **Não há** cliente GraphQL, parser de RSS, camada de cache própria nem lib de imagens. `@netlify/blobs` é reaproveitável como cache [V] |

Pontos de atenção encontrados:

1. `.env.zip` está na raiz e **não** está no `.gitignore` (hoje não é rastreado). Risco de commit acidental de segredos: ignorar (`*.zip` ou o nome) antes de criar qualquer `.env` novo. [V]
2. `docs/DEPLOY.md` é citado pelo `netlify.toml`, mas está no `.gitignore` e não existe no clone. [V]
3. `netlify/assistant/context.json` é gerado no build a partir de `src/data/*`; dados culturais só entrarão no assistente se forem dado estático (snapshot). [V]
4. Há muito trabalho não commitado na árvore (personas, trilhas, busca). O plano abaixo evita editar esses arquivos até a Fase 1. [V: `git status`]

## 2. Estrutura de rotas recomendada

O projeto usa **caminho em PT e alias em EN**. Proposta (decisão D1):

| id | path (principal) | alias | Observação |
| --- | --- | --- | --- |
| `pessoal` | `/pessoal` | `/personal` | hub editorial |
| `pessoal-livros` | `/pessoal/livros` | `/personal/books` | `parent: 'pessoal'` |
| `pessoal-filmes` | `/pessoal/filmes` | `/personal/films` | |
| `pessoal-musica` | `/pessoal/musica` | `/personal/music` | |
| `pessoal-teatro` | `/pessoal/teatro` | `/personal/theater` | |

- Grupo de navegação: `personal` (já existe). Só o hub entra na barra lateral; as 4 páginas entram como sub-itens/`hidden` com `parent`, como o estudo de caso.
- Terminal: comando `pessoal`/`personal` (+ subcomandos `livros`, `filmes`…) via `name/alias/command` (skill `terminal-command`).
- SEO: `pageMeta` PT/EN por rota; HTML estático por rota sai de graça do seoPlugin; sitemap idem. Enquanto uma página não tiver conteúdo, `draft: true` (some do sitemap e da barra), o mesmo padrão de `/agora`.
- Persona: `amigo` ganha `pessoal` na `order`; as demais não mudam (decisão D6).
- **Sem placeholders de rota agora.** Adicionar rota em `routes.ts` muda sitemap, busca, testes de persona/trilhas e `lazyPages` e há alterações pendentes nesses arquivos; não é seguro nesta etapa.

## 3. Arquitetura proposta (componentes e dados)

Princípio: **sem backend novo**. Reusar o padrão que já existe: Netlify Functions v2 + `@netlify/blobs`.

```
Fontes                      Servidor (Netlify)                    Cliente (SPA)
Hardcover GraphQL  ─┐
Letterboxd RSS     ─┼─► netlify/personal/*  (núcleo testável)    src/services/personal.ts
TMDB (metadados)   ─┘      │  normaliza → tipos canônicos         │ fetch('/api/personal/<fonte>')
                           ▼                                       ▼
                     Blobs "personal-cache"  ◄── função agendada   hooks usePersonalBooks/Films
                     (stale-while-revalidate)                      │ fallback: src/data/personal/*.snapshot.json
Curadoria manual (música, teatro, resenhas)  ──────────────────────► src/data/personal/*.ts (Localized)
```

Arquivos propostos (nomes indicativos):

- `netlify/functions/personal.mts` (`/api/personal/books|films`) e `netlify/personal/{hardcover,letterboxd,tmdb,normalize,cache}.ts`, espelhando `netlify/assistant/*` (núcleo puro, testado sem rede).
- `netlify/functions/personal-refresh.mts`, função **agendada** que repopula o cache [A: `config.schedule` das Scheduled Functions da Netlify; confirmar no plano de conta].
- `src/services/personal.ts` + `src/hooks/usePersonal.ts` (padrão de `github.ts`/`useGithubStats.ts`: estados `loading|error|ready`).
- `src/data/personal/` : `types.ts`, `music.ts`, `theater.ts`, `editorial.ts` (textos PT/EN), `*.snapshot.json` (último retrato conhecido, gerado por script, versionado).
- `src/pages/personal/{PersonalHub,Books,Films,Music,Theater}.tsx` (lazy) e `src/components/personal/*` (ver seção 8).
- `src/i18n/ui.ts`: textos de interface PT/EN; **dados externos (títulos, sinopses) não são traduzidos**.

**Por que função e não chamada direta do navegador:** o token do Hardcover e o do TMDB não podem ir ao bundle [V: regra do projeto, `SECRETS_SCAN`]; o RSS do Letterboxd respondeu 200 **sem cabeçalho CORS** e com `Cache-Control: no-store` [V: curl], então o navegador provavelmente não consegue lê-lo [A].

**Estratégia de renderização:** continua SPA. Primeira pintura com o snapshot versionado (sem flash vazio, vale para crawlers com JS), depois atualização com o dado vivo. Conteúdo para SEO/`<noscript>` vem do `pageMeta`, como hoje (decisão D7 se quiser listas no HTML estático).

## 4. Viabilidade das integrações

### 4.1 Letterboxd RSS: **funciona** [V]

- `GET https://letterboxd.com/dudapbrt/rss/` → **HTTP 200**, `application/rss+xml`, atrás da Cloudflare, **50 itens** (curl direto, bruto).
- Campos por item: `title`, `link`, `guid`, `pubDate`, `description` (HTML com `<img>` do pôster), `dc:creator`, `letterboxd:watchedDate`, `letterboxd:rewatch`, `letterboxd:filmTitle`, `letterboxd:filmYear`, `letterboxd:memberRating`, `letterboxd:memberLike`, `tmdb:movieId`.
- Irregularidades que o normalizador **precisa** tratar (observadas no feed real): itens sem `watchedDate`; itens sem `memberRating`; série com `tmdb:tvId` no lugar de `tmdb:movieId`; ordem por `pubDate` **não é estritamente decrescente** (ordenar por `watchedDate`).
- Limite estrutural: o feed traz só as **últimas ~50 entradas**. Histórico completo exige o **CSV de exportação**, que é manual (Configurações > Importar e exportar) [A]. Proposta: script de importação do CSV para um JSON versionado (histórico) + RSS para o recente.
- O feed do diário (`/rss/`) cobre diário/avaliações. Lista de desejos, listas e favoritos **não** estão nele [A].
- Letterboxd tem API oficial, mas por solicitação e sem uso garantido para sites pessoais [A]. **Não usar.**
- Não foi feito scraping: só o endpoint RSS público. A página do perfil respondeu 403 a robôs e não foi usada.

### 4.2 Hardcover GraphQL: **endpoint ativo, depende de token** [V parcial]

> **Atualização (14/11/2026):** a integração foi implementada e testada sem rede; decisões, mapeamento
> de campos, limites e o roteiro de validação com o token estão em `hardcover.md`. Status dos campos:
> `status_id` 1–6, endpoint, Bearer, ~60 req/min, timeout de 30 s e profundidade 3 vieram da
> documentação oficial (página User Books) por busca; `finished_at`, `cached_image`,
> `cached_contributors`, listas e metas **continuam não confirmados**.

- `POST https://api.hardcover.app/v1/graphql` respondeu `{"error":"invalid_request","error_description":"No Authorization header"}` sem token [V]. Ou seja, o endpoint existe e exige autenticação.
- A documentação oficial (`docs.hardcover.app`) devolveu 403 à ferramenta de leitura; os detalhes abaixo vêm de **fontes de terceiros** e ficam como [A]: token pessoal gerado na conta (há divergência sobre a página: `/settings` ou `/account/api`), cabeçalho `Authorization: Bearer <token>`, ~60 req/min, timeout de 30 s, profundidade máxima de consulta baixa (~3), **API ainda em evolução/beta** (campos podem mudar), token com validade (renovar periodicamente).
- Consequência: **não foi possível verificar o perfil `@dudapbrt` sem o token.** Dependência: a Duda gerar o token e confirmar que o perfil e as estantes estão públicos. Os campos exatos (`user_books`, status “lendo/lido/quero ler”, avaliação, `date_read`) serão fixados na Fase 1 com uma consulta real.
- Capacidades esperadas [A]: estantes por status, avaliação, datas de leitura, capa, autores, páginas, séries.
- Sem token, há **fallback** possível: curadoria manual em `books.ts`.

### 4.3 TMDB: **viável, opcional, exige chave** [V parcial]

- `https://api.themoviedb.org/3/configuration` sem credencial → **HTTP 401** [V]. A documentação confirma API key obtida na conta e termos de uso a aceitar; base URL, limites e atribuição não constavam na página lida [V: página lida, sem esses dados].
- Uso proposto: enriquecer filme a partir do `tmdb:movieId` do RSS (pôster, diretor, gênero, duração, sinopse PT/EN) [A: `/movie/{id}?language=pt-BR&append_to_response=credits`]. Para séries, usar `tmdb:tvId` (`/tv/{id}`).
- Atribuição (“This product uses the TMDB API but is not endorsed or certified by TMDB”) provavelmente obrigatória [A]; planejar uma linha de crédito no rodapé das páginas.
- **Pôsteres:** o RSS traz o pôster hospedado pela Letterboxd; os termos de reuso são incertos [A]. Preferir pôster do TMDB (CDN `image.tmdb.org`) ou, se TMDB for descartado, texto sem pôster (decisão D3).

### 4.4 Música e teatro: **sem fonte automática definida**

Você não indicou perfil para esses dois. Opções (decisão D4): (a) curadoria manual em `src/data/personal/` (recomendado: sem dependência, sem dado inventado); (b) Last.fm/ListenBrainz para música [A: dependem de conta e chave]; (c) Spotify: exige OAuth, desproporcional. Teatro: não existe fonte pública padrão, então é manual.

## 5. Variáveis de ambiente (nenhum segredo neste documento)

Todas **somente no servidor** (painel da Netlify e `.env` local ignorado). **Nunca** prefixar com `VITE_`.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `HARDCOVER_API_TOKEN` | Para livros ao vivo | Token pessoal da API do Hardcover (Bearer). Renovar quando expirar |
| `HARDCOVER_USERNAME` | Não (padrão `dudapbrt`) | Usuário cujas estantes são lidas |
| `LETTERBOXD_USERNAME` | Não (padrão `dudapbrt`) | Usuário do feed `https://letterboxd.com/<usuário>/rss/` |
| `TMDB_API_KEY` | Para pôster/metadados | Chave da API do TMDB |
| `PERSONAL_HARDCOVER_TTL_MIN` | Não (padrão 360) | Validade do cache dos livros, em minutos (D9: 6 h) |
| `PERSONAL_LETTERBOXD_TTL_MIN` | Não (padrão 60) | Validade do cache do diário de filmes, em minutos (D9: 1 h) |
| `PERSONAL_BUILD_HOOK_URL` | Só com HTML estático (D7) | URL do build hook da Netlify que a função agendada aciona. Segredo |
| `VITE_PERSONAL_SOURCE` | Não (padrão `mock`) | Cliente: `mock` (dados fictícios) ou `live`; produção recusa `mock` |
| `PERSONAL_REFRESH_SECRET` | Só se houver gatilho HTTP | Segredo do endpoint de atualização manual/webhook |

Acrescentar os nomes (sem valores) ao `.env.example` na Fase 1, e proteger `.env.zip` no `.gitignore`.

## 6. Sincronização e cache

Restrições (Netlify) [V/A]: bundle estático sem sistema de arquivos gravável em runtime [A]; Functions são efêmeras; `@netlify/blobs` já está instalado e em uso [V]; builds podem ser disparados por *build hook* [A].

Estratégia em 3 camadas:

1. **Snapshot versionado** (`*.snapshot.json`): garante página completa se APIs caírem, e alimenta SEO/assistente. Atualizado por script manual (`npm run personal:snapshot`) ou no build quando houver credencial.
2. **Cache em Blobs** (`personal-cache`): a função serve o cache e revalida em segundo plano após o TTL de cada fonte (`PERSONAL_HARDCOVER_TTL_MIN`, `PERSONAL_LETTERBOXD_TTL_MIN`; stale-while-revalidate). Cabeçalho `Cache-Control: public, max-age=300, stale-while-revalidate=3600` na resposta.
3. **Atualização agendada** (função agendada, 1x por hora ou por dia, a decidir): repopula os Blobs, evitando que o primeiro visitante pague a latência. Frequências decididas (D9): Hardcover 6 h, Letterboxd 1 h, TMDB permanente por filme. Limites do Hardcover (~60/min) ficam longe de serem atingidos.

Falhas: se a fonte cair, serve o cache vencido com marca `stale: true` (a UI mostra “atualizado em <data>”); sem cache, cai no snapshot; sem snapshot, a seção mostra aviso, **nunca** número ou item inventado. CORS: a função só aceita a origem do site (padrão de `allowedOrigins` do `ask.mts`).

## 7. Modelo de dados normalizado (proposta)

```ts
// src/data/personal/types.ts
import type { Localized } from '../../types';

export type Source = 'hardcover' | 'letterboxd' | 'tmdb' | 'manual' | 'mock';
export type Rating = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5; // escala do Letterboxd
export interface Provenance { source: Source; url?: string; fetchedAt: string /* ISO */ }

export interface Book {
  id: string;                 // `hc:<id>` ou `manual:<slug>`
  title: string;
  authors: string[];
  coverUrl?: string;
  pages?: number;
  status: 'reading' | 'read' | 'want' | 'paused' | 'dnf';
  rating?: Rating;
  startedAt?: string;         // ISO (dia), só se a fonte informar
  finishedAt?: string;
  note?: Localized;           // nota editorial manual (nunca gerada)
  provenance: Provenance;
}

export interface FilmDiaryEntry {
  id: string;                 // `lb:<guid>`
  kind: 'movie' | 'tv';
  title: string;              // filmTitle
  year?: number;
  watchedDate?: string;       // ausente em parte dos itens reais
  rewatch: boolean;
  rating?: Rating;            // ausente em parte dos itens reais
  liked: boolean;
  tmdbId?: number;
  posterUrl?: string;         // TMDB, ou a do feed se a decisão D3 permitir
  reviewUrl: string;          // link do Letterboxd
  review?: string;            // texto do feed, se houver (pode ter spoiler)
  publish?: boolean;          // false suprime a resenha (padrão true), D8
  provenance: Provenance;
}

export interface FilmMeta {   // enriquecimento TMDB, por tmdbId
  tmdbId: number; directors: string[]; genres: string[]; runtimeMin?: number;
  overview?: Localized; // PT e EN vindos do TMDB, não escritos à mão
}

export interface Album {      // manual
  id: string; title: string; artist: string; year?: number;
  coverUrl?: string; inRotation?: boolean; note?: Localized; provenance: Provenance; // source: manual
}

export interface TheaterVisit { // manual
  id: string; title: string; company?: string; venue?: string; city?: string;
  date?: string; note?: Localized; provenance: Provenance;
}

export interface PersonalFeed<T> {
  items: T[]; updatedAt: string; stale: boolean; source: Source | 'snapshot';
}
```

Regras: ausência de campo é `undefined`, nunca valor presumido (mesma regra de `ProjectDate.month`); IDs estáveis para chaves React e deduplicação; validação manual de runtime no normalizador (o projeto não usa zod); testes com **fixtures reais** do feed (itens sem data, sem nota, série).

## 8. Sistema de design editorial

**Conflito a decidir (D2):** o projeto exige estilo único (mono, tokens, sem degradê); “editorial” costuma pedir serifa. Duas rotas:

- **A (recomendada): editorial dentro do sistema atual.** Mantém JetBrains Mono e os tokens; o caráter editorial vem de escala tipográfica generosa, grade de colunas, filetes finos, numeração de seções (`01`, `02`), legendas em corpo pequeno, capas como figuras com `figcaption`, espaço em branco e ritmo vertical. Zero mudança de regra; passa no contraste dos 5 temas.
- **B: acrescentar 1 serifa só para títulos do `/pessoal`.** Mais “revista”, mas muda `estilo-unico` (spec e `CLAUDE.md`), pede nova fonte hospedada (OFL) e revisão de contraste/peso (TR-27 já aponta peso acima do teto).

Em qualquer rota: sem degradê (nem sobre capas), cores só via `data-tone`/tokens, `prefers-reduced-motion`, 390 px sem rolagem horizontal, impressão não prioritária, `alt` em toda capa, imagens com `width/height` e `loading="lazy"` para evitar salto de layout.

| Página | Composição |
| --- | --- |
| Hub `/pessoal` | “Capa” com título e linha editorial; índice numerado das 4 seções (padrão `DocPage`); 1 destaque por seção (livro atual, último filme, álbum, peça) em colunas assimétricas; rodapé com data de atualização e fontes |
| Livros | “Lendo agora” em destaque; grade de capas “lidos” com ano; coluna lateral “quero ler”; metadados em legenda |
| Filmes | Diário em ordem cronológica agrupado por mês; nota em estrelas de texto (`★★★½`, com rótulo acessível “3,5 de 5”); marca de revisto/curtido; pôster pequeno |
| Música | Lista curada de álbuns/artistas com nota editorial curta; sem player embutido (sem terceiros) |
| Teatro | Linha do tempo de peças vistas: título, companhia, local, data, nota |

Componentes: `EditorialHeader`, `SectionIndex`, `CoverFigure`, `RatingStars`, `DiaryRow`, `ShelfGrid`, `SourceBadge` (“via Hardcover · atualizado em…”), `StaleNotice`, `AttributionFooter` (TMDB). Reutilizar `Card`, `Chip`, `SectionTitle`, `ActionLink`, `SiteShell`.

## 9. Plano de implementação em fases (mock primeiro)

Decisão de 13/11/2026: a **Fase 1 entrega a interface inteira com dados fictícios tipados**; as
integrações reais entram depois, trocando só a camada de serviço. As credenciais só são
necessárias a partir da Fase 2.

| Fase | Entrega | Depende de |
| --- | --- | --- |
| 0 | Decisões D1–D9 (feito); estabilizar a árvore pendente; PRD + requisitos `CL-xx` + tarefas **aprovados**; proteger `.env.zip` | você |
| 1 | **Foundation com mocks:** rotas, casca, i18n, comando de terminal, persona, sistema editorial, componentes, as 5 páginas e todos os estados (loading, vazio, erro, stale), marca de dados fictícios e trava de publicação (9.1) | 0 |
| 2 | **Filmes reais:** Letterboxd RSS + TMDB (função, normalizador, cache Blobs, snapshot). Troca o mock de filmes | 1, chave TMDB; o RSS não precisa de credencial |
| 3 | **Livros reais:** Hardcover (prova de conceito com consulta real primeiro, depois serviço). Importação do CSV do Letterboxd (histórico) | 1, token Hardcover |
| 4 | Sincronização: função agendada, build hook, pré-renderização das listas no `seoPlugin` (D7), "última sincronização" | 2, 3 |
| 5 | Qualidade e publicação: remover mocks, `/verify-site` (1440×900 e 390×844, claro/escuro), a11y, SEO, busca/assistente/trilhas, `status.md` + índice | 4 |

Música e teatro são manuais por decisão (D4): na Fase 1 ganham estrutura e, na Fase 5, o
conteúdo real que a Duda fornecer.

### 9.1 Dados fictícios: regras (a regra "nada de dado inventado" continua valendo)

1. **Tipados pelos modelos da seção 7**, nunca objetos soltos. Todo item mock tem `provenance.source: "mock"` (acrescentar `mock` ao tipo `Source`).
2. **Mesma interface do cliente real.** Contrato único `PersonalSource<T> { load(): Promise<PersonalFeed<T>> }`. Arquivos dedicados: `src/services/integrations/{hardcover,letterboxd,tmdb}/mock.ts` + `index.ts` que escolhe a implementação. A troca nas Fases 2 e 3 é mudar o que `index.ts` exporta. A chamada à API real fica no servidor (`netlify/personal/*`); no cliente o "real" é o `fetch` a `/api/personal/*`.
3. **Títulos claramente fictícios** ("Livro de exemplo 1", "Filme de exemplo"). Obras reais atribuídas à Duda seriam dado inventado sobre ela, mesmo como placeholder.
4. **Casos chatos incluídos de propósito:** livro sem capa, filme sem nota, filme sem data, série (`kind: "tv"`), revisto, resenha longa (> 400 caracteres, testa o truncamento da D8), resenha com `publish: false`, título muito longo, lista vazia, fonte com erro e dado vencido (`stale`). Os mesmos casos viram fixtures de teste.
5. **Marca visível enquanto o mock estiver ativo:** kicker/badge `DADOS FICTÍCIOS` / `PLACEHOLDER DATA` (PT/EN) em cada página e em cada item mock, discreto mas sempre presente e legível nos 5 temas.
6. **Trava de publicação:** (a) as rotas `/pessoal/*` ficam `draft: true` enquanto houver mock (fora do sitemap, da barra lateral e do índice); (b) o build **falha** se estiver em produção da Netlify com a fonte em modo mock (variável `VITE_PERSONAL_SOURCE=mock|live`, padrão `mock` até a Fase 2; o contexto de produção vem de `CONTEXT` [A]); (c) mocks **não** entram no snapshot, no `context.json` do assistente nem na pré-renderização de SEO; (d) teste automatizado garante (a) a (c).
7. O mock é carregado por `import()` dinâmico só em modo mock, para não pesar no bundle real.

## 10. Riscos e limitações

| Risco | Efeito | Mitigação |
| --- | --- | --- |
| API do Hardcover em beta, com limites e token que expira | Livros param de atualizar | Cache + snapshot; alerta visual “atualizado em”; manual como fallback |
| RSS do Letterboxd limitado a ~50 itens e sem CORS | Sem histórico longo; precisa de servidor | CSV manual para histórico; função como proxy |
| Termos de reuso de pôsteres (Letterboxd/TMDB) | Problema de direitos | TMDB com atribuição, ou sem pôster (D3) |
| Resenhas do feed podem conter spoiler ou texto privado | Exposição indesejada | Opt-in por entrada; mostrar só nota por padrão (D8) |
| Regra “estilo único” x editorial | Retrabalho de spec | Decidir D2 antes da Fase 4 |
| Novo conteúdo muda o assistente, a busca e as trilhas | Testes quebram, respostas incoerentes | Entrar só como dado estático/snapshot; revisar `searchRanking` e `trails` na Fase 7 |
| Netlify Functions: cold start, tempo limite, plano gratuito | Primeira carga lenta | Cache em Blobs + agendamento; snapshot na primeira pintura |
| Segredos (`.env.zip`, `VITE_`) | Vazamento | Seção 5; `SECRETS_SCAN` da Netlify já ativo |
| “Nada de dado inventado” | Música/teatro vazios | Páginas `draft: true` até haver conteúdo real |

## 11. Decisões (registradas em 13/11/2026)

| ID | Decisão | Ajuste técnico / observação |
| --- | --- | --- |
| D1 | **`/pessoal`** principal, alias `/personal` | Confirma o precedente do site (`/sobre` + `/about`) [V] |
| D2 | **Mono** (rota A): hierarquia por numeração, kickers em caixa alta, grid assimétrico, imagens grandes, espaço em branco. Uma única variação, reservada aos títulos de seção | A fonte hospedada só tem `font-style: normal`, peso 400–700 [V: `tokens.css`]. **Itálico seria sintético (falso)**: usar **peso 700** nos títulos de seção. Itálico verdadeiro exigiria hospedar outro arquivo de fonte (OFL), só se você quiser |
| D3 | **Livros: capa do Hardcover; filmes: pôster do TMDB** (com atribuição). Sem outra fonte; sem imagem = placeholder tipográfico (título + ano em bloco mono) | Que a capa venha no payload do Hardcover é [A] até a Fase 1 |
| D4 | **Música e teatro manuais**, em arquivos tipados; seção "Em rotação" manual | Sem dependência nova |
| D5 | Você gera as credenciais e confirma os perfis públicos (11.2) | Bloqueia a Fase 1 |
| D6 | **`amigo` e `professor` destacam** o espaço na home; `rh`, `tech` e `cliente` só o têm no menu. Ninguém perde acesso | `pessoal` entra na `order` de `amigo` e `professor` em `personas.ts`; promoção na home em `personaHome.ts`. Testes de persona precisam de revisão |
| D7 | **Listas no HTML estático**, não só no cliente | **Ajuste importante, ver 11.1:** o site é SPA e não tem ISR |
| D8 | **Resenhas sim, com limite:** completas até ~400 caracteres; acima, truncadas com "continuar no Letterboxd →". Diário recente só com título, nota e data; resenha ao expandir ou na página do filme; link canônico sempre. Campo `publish: false` suprime caso a caso | Campo `publish` entra no modelo (seção 7) |
| D9 | **Hardcover a cada 6 h; Letterboxd RSS a cada 1 h; TMDB cache permanente por filme (refaz só se faltar campo); música/teatro a cada deploy; CSV do Letterboxd pontual.** "Última sincronização" no rodapé de cada página | Aplicado na seção 6 |

### 11.1 D7 adaptada ao deploy atual

"SSG/ISR" são termos de frameworks como Next.js; este projeto é Vite + SPA na Netlify [V]. O que
dá o mesmo efeito (HTML com as listas, indexável, que sobrevive à queda da API):

1. **Pré-renderização no build:** estender `scripts/seoPlugin.ts` para gravar, no HTML de cada rota `/pessoal/*`, a lista em marcação simples (título, nota, data, link) a partir do snapshot, no lugar do `<noscript>` atual. O React assume a página e atualiza com o dado vivo.
2. **"Revalidação" por rebuild agendado:** uma função agendada chama um *build hook* da Netlify (a cada 6 h ou 1 h, conforme a fonte) [A: confirmar no plano de conta]. Cada rebuild consome minutos de build; começar com 1x por dia é uma opção.
3. **Resiliência:** se uma fonte falhar no build, usa o snapshot anterior e **não derruba o deploy**.
4. Alternativa sem rebuild: a função devolver o HTML da lista sob demanda. Mais código; só se o custo de build incomodar.

Consequência: a Fase 6 passa a incluir o plugin de pré-renderização e o build hook.

### 11.2 Credenciais (D5): checklist para você

- [ ] Token do Hardcover (a página exata é incerta [A]: tente `hardcover.app/account/api`; senão, em Configurações).
- [ ] Chave da API do TMDB (`themoviedb.org/settings/api`) e aceite dos termos.
- [ ] Perfil Hardcover `@dudapbrt` público (ou token com permissão). **Não verifiquei:** exige o token.
- [ ] Perfil Letterboxd público. **Já verificado:** o RSS responde 200 com 50 itens.
- [ ] CSV do Letterboxd exportado (`letterboxd.com/settings/data/` [A]) e guardado fora do repositório até a importação.

## 12. Dependências propostas (nenhuma instalada)

| Pacote | Para quê | Necessário? |
| --- | --- | --- |
| `fast-xml-parser` | Ler o RSS no servidor | Recomendado; alternativa é parser próprio de poucos campos (sem dependência) |
| `@netlify/functions` | Tipos/agendamento das funções | Opcional [A] |
| Cliente GraphQL | — | **Não**: um `fetch` POST basta |
| Biblioteca de imagem/cache | — | **Não**: `<img>` com dimensões; Blobs já cobrem cache |

## 13. Fontes verificadas

Letterboxd RSS e endpoint do Hardcover/TMDB: requisições feitas em 13/11/2026 (HTTP 200 / "No Authorization header" / 401). Documentação oficial do Hardcover: **não lida** (403); dados dela marcados [A]. Perfis `hardcover.app/@dudapbrt` e `letterboxd.com/dudapbrt/` (página HTML): 403 a robôs, não acessados nem raspados.
