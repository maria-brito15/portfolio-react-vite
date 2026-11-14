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

## Fase 2: filmes reais (Letterboxd RSS + TMDB)

- [ ] Normalizador puro testado com fixtures **reais** do feed (50 itens: sem data, sem nota, série).
- [ ] Chamada TMDB por `tmdbId`: pôster e metadados PT/EN; atribuição visível; limites e termos confirmados.
- [ ] Função `/api/personal/films`: origem restrita, erro tratado (fonte fora do ar, 429, chave inválida).
- [ ] Cache em Blobs (acerto, vencimento, revalidação; Letterboxd 1 h, TMDB permanente) e resposta com `stale`.
- [ ] `index.ts` de filmes exporta a implementação real; páginas inalteradas; ordenação por `watchedDate`.
- [ ] Nenhuma credencial no repositório nem em `dist/`; `.env.example` com os nomes novos, sem valores.

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
- [ ] Importação do CSV do Letterboxd para JSON versionado, com `publish: false` por entrada; CSV bruto fora do repositório (é da parte de filmes).
- [ ] Função executada na Netlify real, com a primeira leitura a frio dentro do tempo limite (hoje depende do aquecimento da Fase 4).

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
