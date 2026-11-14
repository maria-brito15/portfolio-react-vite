# Espaço cultural: critérios de aceite por fase

Plano em `README.md` (seção 9, "mock primeiro"). Marque só com evidência (teste, captura ou requisição).
Em toda fase de código vale o fluxo do projeto: `npm run typecheck` · `npm run lint` ·
`npm test` · `npm run build`; ao fim, `/verify-site` e `status.md` atualizado.

## Fase 0: decisões e preparo

- [x] D1–D9 registradas no `README.md` (13/11/2026).
- [x] PRD, `requirements.md` (IDs `CL-xx`), `design.md` e `tasks.md` aprovados antes de qualquer código.
- [x] Árvore pendente (`git status`) commitada ou estabilizada.
- [x] `.env.zip` coberto pelo `.gitignore`; nenhum segredo rastreado (`git ls-files | grep env`).
- [x] Índice `docs/specs/README.md` com a nova linha.

## Fase 1: Foundation com dados fictícios

Rotas e casca
- [x] Rotas só em `routes.ts` (`/pessoal` + 4 subpáginas, aliases `/personal/*`), `draft: true`; `App.tsx`, `seo.ts` (PT/EN), `lazyPages.ts` e o mock em `src/test/setup.js` atualizados.
- [x] Páginas abrem nos dois caminhos; 404 continua 404; fora do sitemap enquanto `draft`.
- [x] Barra lateral (grupo `personal`), breadcrumb e título da Window corretos em PT e EN.
- [x] Comando de terminal `pessoal`/`personal` com Tab, ajuda e saída PT/EN.
- [x] `amigo` e `professor` destacam o espaço (D6); `rh`, `tech`, `cliente` só no menu; testes de persona, trilhas, busca e `routes.test.ts` verdes.

Dados e contrato
- [x] Tipos da seção 7 em `src/data/personal/types.ts` (com `Source` incluindo `mock`).
- [x] `PersonalSource<T>` único; `mock.ts` em `src/services/integrations/{hardcover,letterboxd,tmdb}/`; páginas não importam mock direto.
- [x] Títulos fictícios claros; casos chatos presentes: livro sem capa, filme sem nota, sem data, série, revisto, resenha longa, `publish: false`, título longo, lista vazia, erro, `stale`.

Sistema editorial (mono, D2)
- [x] Só variáveis de `tokens.css`; sem hex solto, sem degradê; títulos de seção em peso 700 (sem itálico sintético).
- [x] Contraste AA nos 5 temas (`contrast.test.ts`); 390 px sem rolagem horizontal; `prefers-reduced-motion`.
- [x] Componentes com teste: capa/placeholder tipográfico, nota com rótulo acessível, linha de diário, resenha truncada (~400) com link, índice numerado.
- [x] Estados visíveis e testados: carregando, vazio, erro, `stale` ("última sincronização").

Páginas
- [x] Hub, Livros, Filmes, Música e Teatro completos com mock; textos PT/EN com paridade em `ui.ts`.

Trava de dados fictícios
- [x] Badge `DADOS FICTÍCIOS` / `PLACEHOLDER DATA` visível em páginas e itens, legível nos 5 temas.
- [x] Build de produção da Netlify **falha** com `VITE_PERSONAL_SOURCE=mock` (simulado com `CONTEXT=production`; confirmar o `CONTEXT` num deploy real).
- [ ] Mock fora do sitemap, do snapshot, do `context.json` e da pré-renderização (teste automatizado). Feito para sitemap, busca e bundle; snapshot e pré-renderização só existem na Fase 4.

### Cruzamento com o pedido "Fase 1 — Foundation" (14/11/2026)

- [x] Rotas `/personal`, `/personal/books`, `/personal/films`, `/personal/music`, `/personal/theater`: já existem como aliases; o caminho principal é `/pessoal/*` (decisão D1, segue o padrão de rotas em português do site). Cada página mostra o número editorial 001–005, kicker, título e lede.
- [x] Primitivos editoriais: `EditorialPage`, `EditorialSection`, `EditorialDivider`, `BookCard`, `FilmPoster`, `StatTile`, `DiaryEntry` (visuais, recebem props) e os estados `Loading`, `Empty`, `ErrorState` e `StaleNotice` com a mesma geometria.
- [x] Modelos de domínio: `Book`, `FilmDiaryEntry`, `ReadingStats`, `FilmStats`, `MusicItem` (= `Album`), `TheaterItem` (= `TheaterVisit`), em `src/data/personal/types.ts` (o caminho que a auditoria escolheu, não `src/domain/`). Só tipos; as estatísticas vêm de funções puras em `stats.ts`.
- [x] Esqueletos de integração em `src/services/integrations/{hardcover,letterboxd,tmdb}/`, sem nenhuma chamada de rede. **Divergência deliberada:** o pedido fala em "resultado vazio simulado"; ficou o que foi aprovado depois (dados fictícios tipados e rotulados no `mock.ts`; o modo `live` ainda sem integração falha de forma explícita em vez de devolver vazio, para nunca parecer dado real).
- [x] Menu: o hub entra na barra lateral e nos atalhos da home em PT e EN (`showInNav`); persona: `amigo` e `professor` destacam, todas continuam com acesso.
- [x] `.env.example` com nomes e descrições, sem segredos (teste em `scripts/envExample.test.ts`).
- [x] Sem dado inventado apresentado como real: todo item mock tem título "… de exemplo", selo visível e build de produção recusa o modo mock.
- [x] Alterações fora de `/personal` já feitas e aprovadas antes (T-CL8): ordem de `amigo` e `professor`, bloco da home, busca e o campo `showInNav` em `routes.ts`.

## Fase 2: filmes reais (Letterboxd RSS + CSV + TMDB)

Detalhes e decisões em `films.md`.

- [x] Feed descoberto e conferido (`https://letterboxd.com/dudapbrt/rss/`, 14/11/2026); só RSS oficial, sem HTML nem endpoint não oficial.
- [x] Normalizador puro testado com o **feed real** (50 itens: sem data, sem nota, série, resenha, spoiler, revisto, curtido); ordenação por `watchedDate`; só campos que o feed traz.
- [x] Importador do CSV (`npm run personal:import-letterboxd`): colunas por nome, deduplicação por título+ano+data (RSS vence), `publish` por entrada preservado, CSV bruto fora do repositório. **Testado só com CSV sintético.**
- [ ] CSV real importado e colunas confirmadas (**pendente: a Duda sobe o export**; depois `npm run personal:import-letterboxd -- --tmdb`).
- [x] Cliente TMDB no servidor (pôster, fundo, sinopse PT/EN, gêneros, direção, duração), chave v3 ou token v4, erros 401/404/429/5xx tratados, atribuição na página (testado sem rede).
- [ ] TMDB validado com a chave real (`TMDB_API_KEY`) e termos/limites confirmados.
- [x] Função `/api/personal/films`: só GET, 503 genérico, sem segredo em resposta ou log (testes).
- [x] Caches separados por fonte: Letterboxd 1 h com snapshot de reserva e `stale`; TMDB permanente por filme (Blobs). Histórico do CSV serve de reserva se o RSS cair sem snapshot.
- [x] `index.ts` de filmes exporta a implementação real; `integrated.films = true`; ordenação por `watchedDate`.
- [x] Página de filmes: estatísticas do ano, exibições por ano, pôsteres, diário, resenhas (spoiler avisado, `publish: false` nunca sai do servidor), link do perfil, última sincronização, atribuição do TMDB, quatro estados, PT/EN.
- [x] Nunca "assistido no cinema" nem "favorito": a fonte não informa (teste).
- [ ] Listas, favoritos e watchlist: **não entregues** (o RSS não os traz; `watchlist.csv` e `lists/` do export ficam para depois).
- [x] Nenhuma credencial no repositório; `.env.example` com os nomes, sem valores.
- [ ] Função executada na Netlify real (primeira leitura a frio e enriquecimento gradual do TMDB).

## Fase 3: livros reais (Hardcover) e CSV

Detalhes e decisões em `hardcover.md`.

- [ ] Token obtido; consulta real devolve as estantes de `@dudapbrt` (status, nota, datas, capa); modelo ajustado ao que a API entrega. **Pendente do token:** rodar `npm run personal:probe`.
- [x] Cliente do servidor (`fetch` tipado, justificado contra o SDK 0.x) com timeout, novas tentativas, `Retry-After` e consulta mínima de reserva (`hardcover.test.ts`).
- [x] Normalização para `Book`: estados, nota, datas, andamento, resenha, capa `https`, autores; sem inventar campo; duplicados resolvidos.
- [x] Função `/api/personal/books` com cache em Blobs (TTL configurável, padrão 6 h), snapshot de reserva, *single-flight* e *backoff* (`cache.test.ts`, `books.test.ts`).
- [x] "Última sincronização" exposta (`updatedAt`) e mostrada no rodapé, com aviso de dado vencido.
- [x] Token só no servidor: nenhum arquivo de `src/` o cita; `.env.example` vazio; resposta e erros sem token (testes).
- [x] `index.ts` de livros troca o mock pela fonte real em modo `live`; Filmes fica em rascunho no `live` até ser integrado.
- [x] Página de livros: andamento, resenhas, favoritos (nota 5), atividade por mês, estatísticas, link do perfil, quatro estados, PT/EN.
- [ ] Listas e metas de leitura do Hardcover: esquema não confirmado, ficam para depois do `probe`.
- [x] Importação do CSV do Letterboxd para JSON versionado, com `publish: false` por entrada; CSV bruto fora do repositório (feita na Fase 2; falta o export real).
- [ ] Função executada na Netlify real, com a primeira leitura a frio dentro do tempo limite (hoje depende do aquecimento da Fase 4).

## Música e Teatro: curadoria manual (pedido "Fase 4 — Music and Theater", 14/11/2026)

Sem chamada externa. Conteúdo em `src/data/personal/music.ts` e `theater.ts` (tipados por `MusicData`/`TheaterData`); a Duda edita só esses arquivos.

- [x] Tipos `Instrument`, `PracticeItem`, `FavoriteArtist`, `FavoriteSong`, `TheaterExperience`, `FavoriteProduction`, `TheaterObservation`, `VisualReference` em `types.ts`; `MusicItem`/`TheaterItem` (Fase 1) seguem para discos e peças.
- [x] Música: instrumentos informados por ela (guitarra, violão, canto, baixo, bateria, ukulele), sem nível, ano nem favoritos inventados; prática atual, artistas, músicas e discos prontos, vazios (`TODO` no arquivo). Seção ou campo sem dado não aparece.
- [x] Kickers `EM ROTAÇÃO`/`ON REPEAT` e `APRENDENDO AGORA`/`CURRENTLY LEARNING`.
- [x] Teatro: peças vistas, vivências, produções favoritas, observações e referências visuais; nada presume atuação ou profissão. Tudo vazio, com `TODO`.
- [x] Componentes novos só onde preciso: `InstrumentCard`, `CuratedEntry`, `MusicProfile`, `TheaterProfile`; o resto reaproveita o sistema editorial.
- [x] PT/EN em `personal.ts`; teste em `curated.test.tsx`.
- [x] Música sai do rascunho (tem conteúdo real: instrumentos); Teatro continua rascunho até ela enviar conteúdo.
- [ ] **Pendente da Duda:** nível/ano dos instrumentos (opcional), o que está aprendendo, artistas, músicas, discos, e todo o conteúdo de teatro.
- [ ] `/verify-site` (capturas 1440×900 e 390×844) ainda não rodado para estas páginas.

## Hub `/pessoal` e integração ao portfólio (pedido "Fase 5 — Personal Hub", 14/11/2026)

- [x] Cabeça `001 · CULTURA · INTERESSES · COTIDIANO` / `CULTURE · INTERESTS · EVERYDAY LIFE` (kicker em `personal.ts`); o lede é o `deck` já aprovado, sem fato novo sobre a Duda.
- [x] Quatro cartões (Livros, Filmes, Música, Teatro), cada um um só link para a página: livro de agora + **último lido**, **até 3 pôsteres** dos filmes mais recentes (só com data), disco em rotação, última peça (`highlights.ts`: `recentFilms`, `lastFinishedBook`; testes em `hubCards.test.tsx`).
- [x] Sem busca nova: o hub usa os mesmos hooks/fontes das páginas (`usePersonal*`); nenhum serviço novo, nenhuma função de servidor nova. **Não verificado:** que as quatro leituras do hub e das páginas dividem o mesmo cache entre navegações (cada montagem chama `load()` de novo; o cache quente é o do servidor, Blobs).
- [x] Menu principal e atalhos da home PT/EN (T-CL8/Fase 1); os cinco perfis acessam, `amigo` e `professor` só destacam; nenhuma cópia de página por perfil.
- [ ] Persona influenciando o lede: **não feito** (opcional; exigiria texto novo a aprovar).
- [x] Numeração 001–005 vinda da ordem das rotas; mesma escala tipográfica; cor por seção via `data-tone` (violeta, coral, ciano, rosa; hub em âmbar).
- [x] Entrada discreta (subida de 0,5 rem + opacidade, escalonada); desligada com `prefers-reduced-motion`.
- [x] Imagens: `loading="lazy"`, `decoding="async"`, `width`/`height`; pôster do TMDB em w342 ganha `srcset` com w185 e `sizes` (teste). Capas do Hardcover não têm tamanho alternativo.
- [ ] `/verify-site` (capturas 1440×900 e 390×844, claro e escuro) ainda não rodado para o hub novo.

## Fase 4: sincronização e HTML estático

- [ ] Função agendada repopula o cache nas frequências da D9; falha de uma fonte não derruba as outras.
- [ ] Build hook e pré-renderização das listas no `seoPlugin` (D7); falha de fonte no build usa o snapshot e não derruba o deploy.
- [ ] "Última sincronização" no rodapé de cada página; aviso quando vencido.
- [ ] Runbook curto: renovar token, regerar snapshot, importar CSV, custo de build.

## Fase 5: qualidade e publicação

- [ ] Nenhum mock no código de produção; rotas sem `draft` só onde há conteúdo real (música/teatro sem conteúdo continuam `draft`).
- [ ] `/verify-site`: lint, testes, build, capturas 1440×900 e 390×844 em claro e escuro, console sem erro.
- [ ] Teclado e leitor de tela; SEO (título, descrição, canonical, aliases, JSON-LD); atribuição ao TMDB.
- [ ] Busca, assistente e trilhas revisados quanto ao conteúdo novo.
- [ ] Variáveis no painel da Netlify; `SECRETS_SCAN` sem alarme; sem segredo em `dist/`.
- [ ] `docs/specs/personal/status.md` criado e índice atualizado (`/sdd-spec-sync`).

## Fase 6: QA, acessibilidade, segurança e desempenho (14/11/2026)

Relatório completo e achados F-01…F-11 em `QA.md`. **Fase NÃO concluída**: restam bloqueios externos.

- [x] Falhas 403/429/500/timeout do RSS: reserva `stale`, "última sincronização" exata, 503 genérico (`netlify/personal/qa.test.ts`).
- [x] Deduplicação RSS × CSV (testada; só com CSV sintético).
- [x] Nenhum nome ou valor de segredo em `dist/`; sem source maps; `.env`/`.env.zip` fora do git; `.env.example` sem valores.
- [x] Cinco rotas × PT/EN × cinco perfis: um `<main>`, um `<h1>`, títulos sem saltos, sem chave crua (`qa.test.tsx`).
- [x] Datas e números por idioma; foco visível global; cache por rota (API 60 s + `stale-while-revalidate`, `no-store` em erro); rotas diretas e aliases em HTML estático.
- [ ] Sincronização agendada e build hook (F-01, Fase 4).
- [ ] Integrações validadas com contas reais (F-02).
- [ ] Teclado e leitor de tela à mão; capturas `/verify-site` do hub, música e teatro (F-05, F-06).
- [ ] Lighthouse / web vitals (F-08) e deploy real com variáveis no painel (F-10).
- [ ] Teste automatizado "nada em `dist/`" e varredura do pacote das funções (F-03).
