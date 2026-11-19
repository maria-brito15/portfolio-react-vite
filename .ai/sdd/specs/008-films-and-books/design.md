# 008 Films and books, Design
**Status:** draft (ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada em 2026-11-19), `PROPOSTA-pessoal-conteudo-curado.md` (seções 1 a 5 e respostas Q-P1 a Q-P14), `.ai/steering/*`, o design da 002 (aprovado), os schemas da 001 em `src/content/schema/`, e o código lido em 2026-11-19: `src/pages/personal`, `src/components/personal`, `src/data/personal`, `src/services/integrations`, `src/hooks/usePersonal.ts`, `netlify/`, `scripts/`.

Nada aqui foi aprovado. Nada foi removido nem escrito em código. Onde a escolha é da Duda, está em "Perguntas deste design".

## Executive Summary
`/pessoal/filmes` e `/pessoal/livros` passam a ler dois arquivos de conteúdo (`films.content.ts`, `books.content.ts`) validados por schemas novos em `src/content/schema/`, no mesmo `registry` e no mesmo validador da 001. Não há hook, fonte assíncrona, Function nem cache: a página é uma função pura do conteúdo e já sai completa no HTML (002, TD-008). Sete decisões sustentam o resto:
1. **Um arquivo por prateleira**, com o objeto `{ perfil, historicoCompleto, itens }`. Regra que cabe no dado (nota, estado do livro, marcador de exemplo, `slug` único, `historicoCompleto` só com itens) fica no schema, não no componente (TD-001 a TD-005).
2. **Capa é bloco tipográfico** com tom escolhido pelo conteúdo ou derivado do `slug`; foto própria é exceção; imagem de terceiros só com registro validado (TD-004).
3. **Lista agrupada por ano em `<details>`**, tudo no HTML, o ano mais recente aberto (TD-006). Ordem dentro do ano é marcada como indeterminada pela regra da 001.
4. **Totais calculados do conteúdo**; rótulo "itens registrados" até `historicoCompleto: true`, campo que só a Duda liga (TD-007). "Atualizado em" é a maior `editadoEm` dos itens (TD-008).
5. **Importador offline em `scripts/`**, aditivo, que por padrão só mostra o que faria (`--escrever` grava), sem rede, sem TMDB, e que nunca escreve resenha (TD-009).
6. **A 008 remove e reescreve juntas**, em três ondas que mantêm o `verify` verde a cada tarefa (TD-011). A lista de remoção, com quem importa cada arquivo conferido no código, está abaixo e **só vale depois da aprovação da Duda** (FR-013).
7. **Medição com 500 itens** reaproveita o build de prova da 002: nesse modo o conteúdo é trocado por uma fixture de 500 filmes e 500 livros, validada pelo mesmo `contentGuard` (TD-014).

## Achados da leitura do código (o que a proposta não dizia)
1. **`/pessoal/musica` e `/pessoal/teatro` dependem da mesma infraestrutura que sai.** `Music.tsx` e `Theater.tsx` usam `usePersonal*` e `src/services/integrations/manual`; `MusicList`, `TheaterTimeline`, `HubIndex` usam `FeedState`, `StaleNotice`, `PlaceholderBadge`, `AttributionFooter`. Apagar o hook quebra as duas páginas. A proposta (seção 4B) já manda reescrevê-las; o design faz o mínimo: leitura direta de `music.ts` e `theater.ts`, sem alterar o que mostram (TD-012). **Pergunta Q-D1.**
2. **O terminal também usa o hook.** `src/terminal/extras/personalView.tsx` (comando `pessoal`) importa `usePersonalBooks/Films/Albums/Theater`, `PlaceholderBadge` e `i18n/personal.ts`. A spec 009 é dona do terminal, mas sem ajuste mínimo aqui o `typecheck` quebra. Entra no design como ajuste mínimo (TD-012). **Pergunta Q-D1.**
3. **`routeStatus.ts` decide rascunho com `personalMode` e `integrated`**, ambos removidos. Passa a decidir por "prateleira vazia" (TD-013). A 002 (TD-025) autorizou só extrair o cálculo; a mudança de regra é desta spec.
4. **O importador atual escreve em `netlify/personal/data/letterboxd-history.json`** (hoje `entries: []`), importa `netlify/personal/letterboxdCsv.ts` e `tmdb.ts`, e `letterboxdCsv.ts` importa `sortDiary` de `letterboxd.ts` (RSS). Ao mover o parser para `scripts/` é preciso cortar essa dependência (TD-009).
5. **O `@netlify/blobs` só é importado por `personal-books.mts` e `personal-films.mts`** (`grep` em `src`, `netlify`, `scripts`, `e2e`, configs: `netlify/assistant` e `ask.mts` já não existem, a 001 os removeu). Fica sem uso (Q-001 do requirements: a 008 remove).
6. **O ★ do glifo atual** (`RatingStars`) é texto; o IBM Plex (002, TD-016) provavelmente não o traz (a conferir na tarefa) e cairia em fonte do sistema, quebrando "só as fontes do site" e o CLS. As estrelas passam a SVG em linha (TD-010).
7. **O tom escuro da 002 tem 4 valores e o claro 6** (`tokens.css`: `--tone-peach` a `--tone-pink` e `--tone-dark-1` a `--tone-dark-4`). O mapeamento dos 6 tons de capa para os 4 escuros não está definido. **Pergunta Q-D6.**

## Requirements Mapping
| Requisito | Decisão / seção | Verificação |
| --- | --- | --- |
| FR-001 Conteúdo curado lido e validado | TD-001, TD-002, TD-003, Architecture (registry) | V-01 |
| FR-002 Falha com arquivo, campo e motivo | TD-001 (mesmo validador e mesmo formato da 001), TD-005 | V-02 |
| FR-003 Sem serviço externo | TD-009 (importador offline), TD-011 (remoção), Segurança | V-03 |
| FR-004 Item de filme | TD-002, Interface Contract (`FilmRow`) | V-04 |
| FR-005 Item de livro | TD-003, Interface Contract (`BookRow`) | V-04 |
| FR-006 Nota | TD-002, TD-003 (RatingSchema da 001), TD-010 | V-05 |
| FR-007 Capa | TD-004 | V-06 |
| FR-008 Totais e médias; "itens registrados" | TD-007 | V-07 |
| FR-009 Link de origem `https` | TD-001 (campo `perfil`) | V-02, V-04 |
| FR-010 Estado vazio | Interface Contract, TD-013 | V-08 |
| FR-011 Sem marcador de exemplo | TD-005 | V-02 |
| FR-012 Importador offline | TD-009 | V-09 |
| FR-013 Remoção do código de API | "Lista de remoção" e TD-011 | V-10 |
| FR-014 Escala (agrupar por ano, 500 itens, 5 s) | TD-006, TD-014 | V-11 |
| FR-015 PT/EN, rota, lista sem JavaScript | TD-006, TD-015, 002 (TD-008) | V-12 |
| NFR-001 Performance | TD-006, TD-014 | V-11 |
| NFR-002 Segurança (`.env.example`, painel, terceiros) | Segurança, lista de remoção (`.env.example`) | V-03, V-10 |
| NFR-003 Acessibilidade | TD-004, TD-010, Interface Contract | V-05, V-06, V-13 |
| US-001 (menu; hierarquia) | Q-007 respondida: já é o último item (002, DQ-019); nada a mudar | V-04 |

Nenhum FR ficou sem casa.

## Architecture
```
 src/content/films.content.ts ──┐                   (dado puro: { perfil, historicoCompleto, itens })
 src/content/books.content.ts ──┤
                                ├─► registry.ts ─► validateAll (001) ─► verify (testes) e contentGuard (build)
 src/content/schema/{shelf,film,book,marker}.ts ──┘        ▲
                                                           │ mesmo schema
 scripts/importLetterboxd.mjs ─► scripts/letterboxdCsv.ts ─┘  (offline: lê CSV, escreve films.content.ts)

 src/data/personal/shelf.ts (funções puras: agrupar por ano, totais, maior editadoEm)
        │
        ▼
 src/pages/personal/{Films,Books,PersonalHub}.tsx ─► components/personal/* ─► HTML pré-renderizado (002)
```
- **Sem estado assíncrono.** `Films.tsx` importa `films.content.ts` e calcula na renderização; não existe carregando, erro, vencido nem selo de fonte. O pré-render (002, TD-008) já entrega a lista completa sem JavaScript.
- **O conteúdo entra no chunk da rota** (lazy, como hoje). `routeStatus.ts` e o hub também leem o conteúdo (vazio/cheio, destaques); isso põe os dois arquivos no chunk do hub. O custo é medido em V-11 (TD-014) e, se passar do limite, o hub passa a ler um resumo gerado no build (decisão volta para a Duda).
- **O validador da 001 não muda.** Só ganha duas entradas no `registry` e regras novas nos schemas.

## Data Model
Os campos seguem o vocabulário já usado nos schemas da 001 (`strictObject`, `ContentDateSchema`, `RatingSchema`, `LocalizedTextSchema`, `LinkSchema`, `ImageSchema`). Nomes de campo em português, como o resto do conteúdo.

### Prateleira (`films.content.ts` e `books.content.ts`)
| Campo | Tipo | Regra | Mensagem de erro |
| --- | --- | --- | --- |
| `perfil` | link `https`, opcional | `LinkSchema` e protocolo `https` (caminho interno e `mailto:` recusados aqui) | `perfil: precisa de https` |
| `historicoCompleto` | booleano | só a Duda liga; `true` exige `itens.length >= 1` | `historicoCompleto: true com 0 itens` |
| `colchetesPermitidos` | lista de `slug`, opcional | cada `slug` existe em `itens` (TD-005) | `colchetesPermitidos: slug <x> não existe` |
| `itens` | lista | pode ser vazia; `slug` único; `letterboxdUri` único quando existir | `itens[<i>].slug: repetido (<x>)` |

### Filme (`itens[]` de `films.content.ts`)
| Campo | Tipo | Regra | Observação |
| --- | --- | --- | --- |
| `slug` | texto | `^[a-z0-9]+(-[a-z0-9]+)*$`, único | gerado pelo importador (título + ano); depois de gravado, não muda |
| `titulo` | texto | não vazio (como o `LocalizedText`, sem só espaços ou invisíveis) | **nome próprio, um só texto** (Q-D2) |
| `ano` | inteiro | 4 dígitos (reuso da regra de ano da 001) | ano de lançamento |
| `assistidoEm` | `ContentDate`, opcional | mês só se confirmado (001, FR-013) | ausente = grupo "Sem data" |
| `nota` | `RatingSchema`, opcional | 0,5 a 5 em passos de 0,5; 0 é erro (001, FR-018) | ausente = sem estrelas |
| `resenha` | `LocalizedText`, opcional | PT e EN obrigatórios quando existe; até 600 caracteres por idioma (Q-D4) | "resenha curta" no dado |
| `tom` | um dos 6 tons de apoio, opcional | `peach` `lilac` `mint` `lemon` `sky` `pink` | ausente: derivado do `slug` (TD-004) |
| `foto` | objeto, opcional | ver TD-004 | sem `foto`: bloco tipográfico |
| `editadoEm` | dia `AAAA-MM-DD`, obrigatório | data de calendário real | base do "atualizado em" (TD-008) |
| `letterboxdUri` | link `https`, opcional | `boxd.it` ou `letterboxd.com`; único | só o importador usa (dedupe); **não é exibido** (Q-D5) |

### Livro (`itens[]` de `books.content.ts`)
| Campo | Tipo | Regra |
| --- | --- | --- |
| `slug`, `titulo`, `tom`, `foto`, `nota`, `resenha`, `editadoEm` | iguais ao filme | |
| `autores` | lista de texto, 1 ou mais | cada autor não vazio |
| `estado` | `lendo` \| `lido` \| `quero-ler` \| `abandonado` | enum fechado |
| `iniciadoEm` | `ContentDate`, opcional | **obrigatório quando `estado = lendo`** ("lendo desde", Q-005); proibido em `quero-ler` |
| `lidoEm` | `ContentDate`, opcional | data em que terminou ou abandonou; proibido em `quero-ler` e `lendo` |
| (cruzada) | | `nota` proibida em `quero-ler` (livro que não foi lido não tem nota); se `iniciadoEm` e `lidoEm` existem e `compareDates` diz que `lidoEm` vem antes, erro |

Mensagens cruzadas, no formato da 001 (arquivo, campo, motivo): `itens[3].iniciadoEm: obrigatório quando estado é "lendo"`; `itens[7].nota: livro "quero-ler" não tem nota`.

**Não entram (cortados, sem FR que os use; se a Duda quiser, entram como campo opcional depois, sem migração):** `diretor`, `favorito`, `paginas`, `paginaAtual`, link por item, `tmdbId`, `rewatch`, `spoiler`. **Q-D3.**

### Regra de marcador de exemplo (FR-011, TD-005)
Uma função `markerProblem(texto)` devolve o motivo ou `null`. Vale para **todo texto** do item: `titulo`, `autores[]`, `resenha.pt`, `resenha.en`, `alt` da foto e campos de registro de terceiros. Falha se encontrar:
| Padrão | Exemplo recusado |
| --- | --- |
| trecho entre colchetes `[...]` (qualquer conteúdo, 1 ou mais caracteres) | `[nome do filme]`, `[PREENCHER]`, `[REC]` (ver exceção) |
| palavra inteira, sem caixa: `TODO`, `TBD`, `FIXME`, `XXX`, `placeholder` | `TODO resenha` |
| `lorem ipsum` | `Lorem ipsum dolor` |
Mensagem: `itens[4].resenha.pt: texto de exemplo ("[...]" ) não pode ser publicado`.
**Exceção explícita:** só `titulo` e só para os `slug` listados em `colchetesPermitidos` (o filme *[REC]*, 2007, é real). A lista fica no arquivo, visível no diff. Sem esse caso de borda, "[REC]" seria recusado e a Duda não conseguiria registrá-lo.
**Fixtures de teste e de medição** nunca ficam em `src/content/` nem no `registry` publicado (TD-014).

## Interface Contract
**Funções puras** (novo `src/data/personal/shelf.ts`, com teste; substitui `stats.ts`, `highlights.ts` e as partes de `review.ts` que o `/pessoal` de filmes e livros usava):
| Função | Entrada | Saída |
| --- | --- | --- |
| `groupByYear(itens, dateOf)` | itens e a data de cada um | grupos `{ ano \| 'sem-data', itens }`, ano mais recente primeiro, "sem data" por último; dentro do grupo, ordem do mês (maior primeiro), itens sem mês depois, **empate mantém a ordem do arquivo**; cada grupo traz `ordemIndeterminada: boolean` (via `compareDates` da 001) |
| `shelfTotals(itens)` | itens | `{ total, comNota, media? , anoRecente?, noAnoRecente }`; sem nota: `media` ausente (nunca 0); `anoRecente` = maior ano com data (sem olhar o relógio) |
| `bookCounts(livros)` | livros | contagem por `estado` |
| `latestEdit(itens)` | itens | maior `editadoEm` ou `undefined` (vazio) |
| `toneFor(slug, tom?)` | slug e tom opcional | o `tom` se houver; senão um dos 6 por hash estável do `slug` |

**Texto de data:** `src/content/dates.ts` ganha `formatDay(dia, lang)` com **tabela fixa de meses** (como o `formatDate` existente; nada de `Intl`, que varia entre versões do ICU), para "19 nov 2026" / "nov 19, 2026".

**Componentes** (em `src/components/personal/`, reescritos no lugar quando o nome já existe):
| Componente | Papel |
| --- | --- |
| `Cover` (substitui `CoverFigure` e `FilmPoster`) | bloco tipográfico (título e ano, `data-tone`) ou `<img>` com `alt`, `width`, `height`; **sem `srcSet` do TMDB, sem `onError`, sem URL externa**. Bloco tipográfico é `aria-hidden` (o título já está no texto do item); foto tem `alt` |
| `RatingStars` | SVG em linha, `role="img"`, `aria-label` "nota 4,5 de 5" / "rating 4.5 out of 5"; sem nota não renderiza nada (a linha mostra só o título) |
| `FilmRow`, `BookRow` (substituem `DiaryEntry`, `BookCard`, `ReviewBlock`, `ShelfGrid`) | título, ano/autores, data (`formatDate`), estado (livro, **em texto**, nunca só cor), estrelas, resenha inteira |
| `YearGroup` | `<details>` com `<summary>` "2024 · 37 itens"; o grupo mais recente tem `open`; nota "ordem dentro do mesmo mês não é registrada" quando `ordemIndeterminada` |
| `ShelfTotals` | totais; rótulo "N itens registrados" (PT) / "N items logged" (EN) enquanto `historicoCompleto` for `false`, "N filmes"/"N livros" quando for `true`; média com a mesma regra |
| `ShelfFooter` (substitui `AttributionFooter`) | "Atualizado em 19 nov 2026" e o link `perfil` (`rel="noopener noreferrer"`); sem data quando não há itens |
| `EmptyShelf` (substitui `States.Empty`) | estado vazio explicando que a estante será preenchida |
| `HubIndex` (reescrito) | cartão de filmes (total com o rótulo; itens do ano mais recente) e de livros (total; "lendo agora: título, desde mmm/aaaa" quando houver) |

Fica como está: `EditorialPage`, `EditorialHeader`, `EditorialSection`, `EditorialDivider`, `SectionIndex`, `StatTile` (se o `ShelfTotals` o usar), e, da música e do teatro, `MusicProfile`, `TheaterProfile`, `InstrumentCard`, `CuratedEntry`.
**Textos de interface** ficam em `src/i18n/personal.ts` (PT e EN, teste de paridade `personal.test.ts` existente). Saem as chaves `placeholder`, `state`, `stale`, `rating.none` (quando o item não tem nota, nada aparece), `films.stats.liked/rewatches`, `films.entryLink`, `review.more` e a atribuição do rodapé. Entram: rótulo "itens registrados", "atualizado em", "sem data", "ordem dentro do mesmo mês não é registrada", estados do livro, "lendo desde". Título, autor e resenha vêm do conteúdo.
**CSS:** `src/styles/personal.css` (577 linhas, classes `pe-*` da identidade antiga) é reescrito com os tokens da 002; classes de componentes removidos saem.

## Segurança
- **Sem requisição a terceiros** na geração e no navegador: nenhum `fetch`, URL de API ou `<img>` externo em `/pessoal`. Teste que varre o HTML pré-renderizado das três páginas atrás de `src=`/`href=` externos que não sejam o `perfil` (V-03), mais a regra de imagem local da 001 (FR-009).
- **Sem segredo:** `HARDCOVER_API_TOKEN`, `TMDB_API_KEY`, `PERSONAL_REFRESH_SECRET`, `PERSONAL_BUILD_HOOK_URL` e as demais variáveis saem do `.env.example`; o `secretScan` da 001 continua valendo. **Ação sua:** apagar essas variáveis no painel do Netlify (PEND-005), depois do deploy da 008.
- **Importador:** roda só na máquina dela, sem rede. Teste estático falha se `scripts/importLetterboxd.mjs` ou `scripts/letterboxdCsv.ts` contiverem `fetch(`, `node:http(s)`, `node:net`, `undici` ou `XMLHttpRequest`, e se qualquer arquivo de `src/` importar algo de `scripts/` do importador (nunca entra no pacote do navegador).
- **`rel="noopener noreferrer"`** no link de perfil; `https` validado no schema.
- **CSV bruto** nunca versionado (`letterboxd-export/` já está no `.gitignore`). O relatório de pendências do importador também sai dentro dessa pasta.
- **Texto da Duda no HTML:** as resenhas são texto, escapado pelo React; nenhuma vai com `dangerouslySetInnerHTML`.

## Edge Cases
| Caso | Comportamento |
| --- | --- |
| Filme sem `assistidoEm` | grupo "Sem data", por último; nunca some |
| Dois filmes no mesmo mês | ordem do arquivo; grupo marcado com a nota de ordem não registrada (001, FR-013) |
| Nota 0, 4,3, 5,5, `null`, texto | erro com campo e motivo (001, FR-018) |
| Livro "lendo" sem `iniciadoEm` | erro de verificação |
| Livro "quero-ler" com nota ou datas | erro de verificação |
| `historicoCompleto: true` com 0 itens | erro |
| Título `[REC]` sem `colchetesPermitidos` | erro; com o `slug` listado, passa |
| Resenha só em PT | erro (EN ausente) |
| Resenha com 601 caracteres em um idioma | erro com o tamanho |
| `foto` com URL `https://...` | erro: imagem externa (001, FR-009) |
| `foto` de terceiros sem registro completo | erro (TD-004) |
| Dois itens com o mesmo `slug` ou `letterboxdUri` | erro |
| CSV com nota 3,7 | linha **recusada** e listada no relatório; não entra no arquivo |
| CSV sem a coluna `Name` | importador sai com código 2 e mensagem com o cabeçalho encontrado |
| Importar de novo o mesmo CSV | nenhum item novo; arquivo idêntico (idempotente) |
| Item do CSV que já existe com nota diferente | **não altera** o item; relata a diferença |
| Estante com 0 itens | página mostra o estado vazio; rota continua `draft` (TD-013) |
| Título com acento, aspas, `&` | escapado pelo React; `slug` normalizado sem acento |
| 500 itens e tema escuro | mesmo componente; contraste dos tons conferido (V-13) |
| `<details>` sem JavaScript | abre e fecha nativamente; o conteúdo fechado continua no HTML |

## Technical Decisions

### TD-001: Dois arquivos de conteúdo, um objeto por prateleira, schemas em `src/content/schema/`
**Decision:** `src/content/films.content.ts` e `books.content.ts` exportam `{ perfil, historicoCompleto, colchetesPermitidos?, itens }`. Schemas novos: `schema/shelf.ts` (prateleira, `slug`, dia, tom, foto), `schema/film.ts`, `schema/book.ts` e `schema/marker.ts`; reexportados em `schema/index.ts`; os dois arquivos entram no `registry.ts`. Os `*.content.ts` só importam tipos (regra de lint da 001).
**Rationale:** o validador da 001 só conhece o `registry`, então entrar nele dá de graça verificação, `contentGuard` no build, mensagem "arquivo, campo, motivo" e a checagem de arquivo existente em `public/` para fotos. Um objeto por prateleira deixa `perfil` e `historicoCompleto` junto dos itens que descrevem.
**Alternatives:** (a) um arquivo por item (500 arquivos): diff limpo, mas 500 imports no registry e o importador teria de criar e apagar arquivos; (b) JSON em vez de `.content.ts`: contraria a convenção (conteúdo tipado, `src/content`); (c) um só arquivo `personal.content.ts` com filmes e livros: mistura dois schemas e dobra o tamanho do chunk de cada página.

### TD-002: Schema do filme
**Decision:** campos e regras da tabela "Filme". `titulo` é um texto só (nome próprio como aparece no Letterboxd dela); `ano` é o de lançamento; `assistidoEm` é `ContentDate` (a data completa do diário perde o dia, ver abaixo); `nota` é o `RatingSchema` da 001, sem recriar a regra.
**Rationale:** FR-004 e FR-006. Reusar `ContentDateSchema` e `RatingSchema` mantém uma só regra de data e nota no site.
**Consequência assumida:** o importador conhece o dia (`Watched Date`), mas o schema da 001 só guarda ano e mês. O dia se perde no dado; a ordem dentro do mês passa a depender da ordem do arquivo (que o importador grava do dia mais recente para o mais antigo) e a interface diz que ela não é registrada.
**Alternatives:** (a) guardar o dia (`AAAA-MM-DD`) em `assistidoEm`: mudaria o `ContentDateSchema` da 001, que é estrito (`campo não suportado`), e a regra de mês "só se confirmado" ficaria ambígua; (b) `titulo` localizado (`{ pt, en }`): inventa uma tradução que a Duda não deu (princípio 7), e o CSV traz um nome só; (c) `tituloOriginal` além do título: sem FR.

### TD-003: Schema do livro e regras cruzadas no dado
**Decision:** tabela "Livro". As regras entre campos (`lendo` exige `iniciadoEm`; `quero-ler` não tem nota nem datas; `iniciadoEm` não vem depois de `lidoEm`) ficam em `superRefine` do schema do item, com caminho do campo no erro.
**Rationale:** "regra que cabe no dado vai para a camada de dados". Q-005: "lendo desde [data]" só existe se o dado exigir a data; sem a regra, a página teria de adivinhar. FR-006: livro "lendo" ou "quero ler" sem nota mostra só o título, o que o schema permite (nota opcional) e, em "quero ler", impede (nota num livro que não foi lido seria dado inconsistente).
**Alternatives:** (a) aceitar tudo e tratar na página: o erro só apareceria na tela; (b) `paginaAtual`/`paginas` para "lendo agora: X%": Q-005 respondeu "lendo desde [data]", sem progresso.

### TD-004: Capa
**Decision:** padrão é o **bloco tipográfico** (título grande e ano, `data-tone`), proporção 2:3, texto na cor primária do tema (contraste ≥ 13 no claro e ≥ 6,6 no escuro, tabelas da 002), borda de 1 px no token de borda **da página** (não sobre o tom), `aria-hidden` porque o título já está no texto do item. `tom` vem do item; ausente, `toneFor(slug)` usa um hash estável do `slug` (não da posição: a ordem muda quando entram itens novos e a cor de um filme não pode mudar sozinha). **Foto** (opcional): `{ imagem: ImageSchema, autoria }`, onde `autoria` é `{ tipo: 'propria' }` ou `{ tipo: 'terceiros', origem, licenca, atribuicao, verificadoEm }` (os quatro obrigatórios, `verificadoEm` no formato `AAAA-MM-DD`). Sem os quatro, o schema recusa. A imagem continua local (`public/`, 001 FR-009): **o registro valida que existe origem e licença; não torna aceitável uma URL externa**. A página mostra a atribuição como legenda quando `tipo = terceiros`.
**Rationale:** FR-007, princípio 5 e Q-P4. O bloco tipográfico não tem licença, arquivo, nem CLS.
**Alternatives:** (a) cor por posição: instável (acima); (b) pôster do TMDB por URL: proibido (hotlink e termos do TMDB, Q-P2); (c) registro de terceiros só em texto na spec (e não no dado): a verificação não consegue recusar; o requisito FR-007 diz "a verificação recusa". **Q-D6** (tons escuros) e a pergunta "na spec" abaixo.

### TD-005: Marcador de exemplo no schema (substitui `personalGuard`)
**Decision:** `schema/marker.ts` aplica `markerProblem` a todo texto do item (ver Data Model). O `personalGuard` (que bloqueava build de produção em modo `mock`) deixa de existir; a mesma garantia ("dado de exemplo nunca vai ao ar") passa a ser do `contentGuard` do build e do teste do `verify`, sem variável de ambiente nem `CONTEXT` do Netlify.
**Rationale:** o risco continua (texto de exemplo esquecido), mas agora a regra é do dado, igual em preview e produção, e testada.
**Alternatives:** (a) manter o guarda só em produção: o `verify` local passaria com marcador e o build do Netlify quebraria tarde; (b) detectar a palavra "exemplo": falso positivo em resenha legítima; (c) lista fixa de títulos válidos com colchetes no código: escondida do diff; por isso `colchetesPermitidos` no arquivo de conteúdo.

### TD-006: Agrupar por ano, `<details>`, tudo no HTML
**Decision:** a lista é agrupada por ano (Q-006): cada ano é um `<details>` com `<summary>` ("2024 · 37 itens"), o ano mais recente aberto, os demais fechados. Todos os itens estão no HTML pré-renderizado (002, TD-008). Sem paginação, sem "carregar mais", sem JavaScript para abrir.
**Rationale:** Q-006 e FR-014/FR-015. `<details>` é nativo, funciona por teclado, anuncia aberto/fechado a leitores de tela, e o texto fechado continua no HTML (busca da página expande). Itens fechados não são desenhados, o que reduz o custo de layout; a medição (TD-014) confere LCP, INP e CLS com 500 itens.
**Alternatives:** (a) paginação: não cabe no HTML sem JS sem páginas por URL (rotas novas); (b) "carregar mais" com JS: contraria FR-015; (c) lista plana de 500 linhas: LCP e leitura piores; (d) acordeão em ARIA com JS: reimplementa o que `<details>` já dá.
**Risco:** a hidratação de ~500 `<li>` e o INP do primeiro toque; medidos (V-11). Se o INP passar de 200 ms, a decisão volta: virtualização fica fora (precisa de JS).

### TD-007: Totais, "itens registrados" e `historicoCompleto`
**Decision:** `shelfTotals` calcula do conteúdo; nada é digitado. Enquanto `historicoCompleto` for `false`, todo número da página usa o rótulo "itens registrados"/"items logged" (total, itens do ano, média). O campo é booleano da prateleira e só a Duda o liga (Q-002). Média: média simples das notas existentes, 1 casa decimal (vírgula em PT), com a contagem de itens com nota ("média de 212 itens com nota"); sem nota nenhuma, a média não aparece (nunca 0 nem "—" fingindo valor). "Itens do ano" usa o **ano mais recente com data**, nunca o relógio (a página gerada hoje e amanhã é igual).
**Rationale:** FR-008, Q-P3 parte 1, Q-P13. O ano pelo relógio tornaria o HTML dependente do dia do build.
**Alternatives:** (a) `historicoCompleto` inferido (ex.: "tem mais de N itens"): inventa uma afirmação sobre a vida dela; (b) número digitado "120 filmes": proibido (P-008-g); (c) data de corte "completo até AAAA-MM": mais informação que o requisito pede (Q-002 pediu um campo que só ela liga).

### TD-008: "Atualizado em" tirado do conteúdo
**Decision:** cada item tem `editadoEm` (dia, obrigatório). A prateleira mostra a **maior** `editadoEm` (`latestEdit`); o hub, a maior das duas. O importador grava `editadoEm` = dia da importação (ou `--data`) nos itens novos. A Duda atualiza o campo ao editar um item à mão.
**Rationale:** Q-004 ("maior data de edição dos itens"); é determinístico (nada de `mtime` nem `git log`, que mudam entre máquinas e no CI).
**Risco assumido:** esquecer de mexer em `editadoEm` ao editar. Mitigações: o campo é obrigatório, o importador o preenche, e a FAQ do guia de edição o lembra. Não há como o teste saber que o item foi editado. **Alternativa** (se a Duda preferir): um único `atualizadoEm` na prateleira, que ela mexe a cada edição (menos campos, mesmo risco). **Q-D4b abaixo.**

### TD-009: Importador offline em `scripts/`
**Decision:**
- **Arquivos:** `scripts/importLetterboxd.mjs` (reescrito: sem `.env`, sem `--tmdb`, sem rede), `scripts/letterboxdCsv.ts` e `scripts/letterboxdCsv.test.ts` (movidos de `netlify/personal/`; ficam `parseCsv`, a leitura de colunas por nome, `toEntry` e `entryKey`; saem `History`, `parseHistory`, `historyToEntries`, `mergeDiary` e a dependência de `FilmDiaryEntry` e de `sortDiary`, que eram do RSS) e `scripts/shelfWriter.ts` (monta o texto de `films.content.ts`).
- **Entrada:** pasta do export descompactado (padrão `letterboxd-export/`, ignorada pelo git): `diary.csv` obrigatório, `reviews.csv`, `watched.csv` e `ratings.csv` opcionais. Colunas lidas **por nome** (como hoje). **As colunas de `watched.csv` e `ratings.csv` não foram vistas em arquivo real; o código atual já marca o formato como "[A: confirmar com o primeiro arquivo real]"** (Q-D7).
- **Aditivo e idempotente:** lê o `films.content.ts` atual (import dinâmico), **mantém todo item existente intocado** e acrescenta só os que não existem (chave: `letterboxdUri`, senão título + ano + mês). Diferença entre CSV e item existente (ex.: nota) é só relatada.
- **Filmes só em `watched.csv`** (sem linha no diário) entram **sem `assistidoEm`**: a data dessa planilha é a de registro no Letterboxd, não a de exibição, e usá-la seria inventar (grupo "Sem data").
- **Padrão é ensaio:** sem `--escrever`, imprime o que faria e **não grava**. Com `--escrever`, valida o resultado com `validateAll` da 001 (mesmo schema) **antes** de gravar e recusa gravar se houver erro; depois formata com `prettier` (API, mesma configuração do projeto) para o `format:check` do `verify` passar.
- **Nunca escreve `resenha`:** o conteúdo exige PT e EN (Q-003) e o CSV traz um idioma. O texto das resenhas vai para `letterboxd-export/resenhas-pendentes.md` (por `slug`), para ela traduzir e colar.
- **Recusas:** linha com nota fora de 0,5 a 5 em passos de 0,5 (FAQ), sem `Name`, ou com ano inválido: **não entra** e aparece no relatório com número da linha e motivo. Título com colchetes: entra, e o relatório avisa para listar o `slug` em `colchetesPermitidos` (TD-005) ou o `verify` falhará.
- **Slug:** título sem acento, minúsculo, `-` e o ano; colisão ganha `-2`, `-3`; depois de gravado, imutável (itens existentes são mantidos).
- **Ordem no arquivo:** ano e mês decrescentes e, dentro do mês, dia decrescente **conhecido do CSV** (é o que mantém a ordem real mesmo sem guardar o dia).
- **Node:** o `.mjs` importa `.ts` (como o atual); precisa de Node com remoção de tipos (22.18 ou superior). Sem isso, mensagem clara e código 2, em vez de erro de módulo.
- **Npm script:** `personal:import-letterboxd` continua; `personal:probe` sai.
**Rationale:** FR-012, Q-P1, Q-P2, Q-P13, Q-P14, FAQ do requirements. Aditivo evita sobrescrever o que ela editou; ensaio evita surpresa; validar antes de gravar mantém o `verify` verde.
**Alternatives:** (a) manter o JSON `letterboxd-history.json` como intermediário: um formato a mais que ninguém lê; (b) importador sobrescreve o arquivo e preserva campos editados (como hoje faz com `publish`): regra de merge complexa e arriscada com 500 itens; (c) gerar a resenha com o texto do CSV nos dois idiomas: duplica texto num idioma que ela não escreveu (princípio 7).

### TD-010: Estrelas em SVG em linha
**Decision:** `RatingStars` desenha 5 estrelas em SVG (cheia, meia e vazia por `clipPath`) com a nota arredondada à meia estrela mais próxima (a nota do schema já é múltiplo de 0,5, então nunca precisa arredondar) e `role="img"` com `aria-label` "nota 4,5 de 5" / "rating 4.5 out of 5". Nota ausente: o componente não renderiza.
**Rationale:** FR-006 e NFR-003; independe de fonte (Q: IBM Plex sem ★) e tem tamanho fixo (CLS). Estado não depende só de cor: a nota também vai no `aria-label`; e a linha mostra o número como texto visível ("4,5") ao lado.
**Alternatives:** glifos ★ e ½ (como hoje): fallback de fonte; imagem raster: peso e sem tema.

### TD-011: A 008 remove e reescreve juntas, em três ondas
**Decision:** ordem que mantém o `verify` verde a cada tarefa e o `/pessoal` nunca quebrado (D-002):
1. **Onda 1, só acrescenta:** schemas, arquivos de conteúdo vazios, `registry`, `shelf.ts`, `formatDay`, importador novo (`scripts/`), fixture e testes. Nada é removido; o importador novo funciona ao lado do antigo.
2. **Onda 2, reescreve e remove no mesmo conjunto de tarefas:** páginas, componentes, i18n, CSS, `routeStatus`, terminal e Music/Theater passam a ler conteúdo/arquivos diretos; **no mesmo passo** saem `usePersonal`, `src/services/integrations/**`, `integrations.ts`, `personalGuard` e os testes que dependiam deles. Cada tarefa remove só o que o `grep` por importadores mostra sem uso depois dela.
3. **Onda 3, remove o servidor:** `netlify/personal/`, `netlify/functions/personal-*.mts`, `scripts/hardcoverProbe.*`, `@netlify/blobs` (e o `package-lock.json`), `[functions]` do `netlify.toml`, variáveis do `.env.example`, ajustes de teste (`envExample`, `headers`), e a correção do Anexo B e de `tech-stack.md` (Duda aprova).
Cada tarefa de remoção é precedida de `grep` listando importadores; "importado por ninguém" é critério, não suposição.
**Rationale:** FR-013 e D-002. O importador antigo importa `netlify/personal/*`, então o novo precisa existir antes (onda 1).
**Alternatives:** (a) apagar tudo primeiro e reescrever depois: `/pessoal` quebrado por várias tarefas; (b) a 001 remove a seção A: a Duda decidiu (Q-P5) que a 008 é dona.

### TD-012: Música, teatro e terminal, só o mínimo
**Decision:** `Music.tsx`, `Theater.tsx`, `MusicList`, `TheaterTimeline` passam a ler `music.ts`/`theater.ts` direto (listas hoje vazias), sem hook e sem os blocos de carregando/erro/vencido, **sem mudar o que mostram**. `personalView.tsx` (terminal, comando `pessoal`) passa a ler `films.content.ts` e `books.content.ts` e mostra "—"/estado vazio como hoje, sem `PlaceholderBadge`. Os tipos `Album`, `TheaterVisit`, `Instrument` etc. ficam em `src/data/personal/types.ts`, sem `provenance`; saem `Book`, `FilmDiaryEntry`, `FilmMeta`, `Provenance`, `PersonalFeed`, `Source`, `Rating`, `ReadingStats`, `FilmStats`. Os dados fictícios de `manual/mock.ts` (álbuns e peças inventados) **não** viram conteúdo.
**Rationale:** FR-013 manda remover o hook; as quatro páginas e o terminal o usam. A música é da 011 e o terminal é da 009; aqui só se evita quebrá-los. **Q-D1.**
**Alternatives:** (a) manter uma versão mínima do hook só para eles: deixa código de API-era vivo; (b) remover as rotas `musica` e `teatro` agora: mexe em `routes.ts`, no menu e na 011, fora do escopo; (c) deixar para a 009/011 consertarem: o `typecheck` quebra no meio.

### TD-013: `routeStatus` sem `mock` nem `integrated`
**Decision:** `pessoal-filmes` é rascunho (`noindex`, fora do sitemap) quando `films.itens` está vazio; `pessoal-livros`, quando `books.itens` está vazio; `pessoal` (hub), quando ambas estão vazias; `musica` e `teatro` seguem por `musicHasContent`/`theaterHasContent`. `showInNav` **deixa de existir como regra** (o menu já mostra `Pessoal` por `menu: true`, 002 DQ-019). O hub continua com cartões para as seções com conteúdo.
**Rationale:** preserva o comportamento de "página sem conteúdo não vai para o índice dos buscadores" sem a variável de modo.
**Alternatives:** publicar sempre (mesmo vazia): a página vazia entra no Google. Manter rascunho até `historicoCompleto`: mistura duas ideias.

### TD-014: Medição com 500 itens
**Decision:** a fixture `scripts/fixtures/shelves500.ts` gera, de forma determinística (sem aleatório sem semente), **500 filmes e 500 livros**: 10 anos, ~30% com resenha PT/EN de ~400 caracteres, ~20% sem nota, ~10% sem `assistidoEm`, alguns sem mês, 3 livros `lendo`. Ela fica **fora de `src/content/`** e fora do `registry` publicado. No build `--mode prova` (002, TD-009), um alias do Vite troca `films.content.ts` e `books.content.ts` pela fixture, só nesse modo, para `dist-prova/`; o `contentGuard` valida a fixture como valida o conteúdo real. `scripts/checkDist.mjs` ganha uma checagem: `dist/` (publicado) não pode conter o texto-marca da fixture.
Medidas (todas em `evidence.md`): (1) tempo de `validateAll` com a fixture (limite 5 s; alvo medido em 3 rodadas, pior valor registrado; teste de vitest com a fixture); (2) tamanho do HTML pré-renderizado de `/pessoal/filmes` e `/pessoal/livros` (bruto e gzip); (3) tamanho em gzip do chunk de cada rota e do hub; (4) LCP, INP (abrir um `<details>`) e CLS em celular médio, pelos scripts da 002 (`lighthouseRun.mjs`, `inpRun.mjs`) apontados para `dist-prova`; (5) quanto os testes novos somam à suíte (orçamento ≤ 90 s da 001).
**Rationale:** FR-014 e NFR-001 pedem medida, não estimativa. Reusar o build de prova evita um terceiro alvo de build.
**Alternatives:** (a) medir só o validador: ignora hidratação e HTML; (b) fixture em `src/content/`: dado de exemplo dentro do conteúdo publicável, contra FR-011; (c) novo `mode` `medida`: mais um `outDir`, mais uma checagem.
**Se algum limite falhar:** a decisão volta para a Duda (resumo gerado no build para o hub, ou dividir por década).

### TD-015: Idioma, rota e texto
**Decision:** as três páginas já têm `path` e `enPath` na tabela de rotas (`pessoal`, `pessoal-livros`, `pessoal-filmes`; `/en/personal/...`); nada muda ali. Texto de interface em `i18n/personal.ts` (PT/EN, paridade existente). Resenha com PT e EN (Q-003), lida por `pick(texto, lang)` da 001 (sem reserva do outro idioma). `<html lang>` e `hreflang` são da 002.
**Rationale:** FR-015.

## Lista de remoção para a Duda aprovar (FR-013)
**Nada foi removido.** "Importado por" foi conferido com um varredor de imports (relativos, `from`, `import()` e `import 'x'`) sobre `src`, `netlify`, `scripts`, `e2e` e as configs de raiz, e por `grep` para strings e configs (`package.json`, `netlify.toml`, `vite.config.ts`). "Só teste" = nenhum arquivo de produção importa. A Duda aprova por seção (A, B, C, D) ou por linha.

### A. Sai por inteiro (código e testes)
| Arquivo | Importado por (produção) | Observação |
| --- | --- | --- |
| `netlify/functions/personal-books.mts`, `personal-films.mts` | ninguém (a Netlify os carrega pelo diretório) | usam `@netlify/blobs`, `cache.ts`, `books.ts`, `films.ts`, `letterboxdCsv.ts` |
| `netlify/personal/books.ts` | `personal-books.mts` | cliente Hardcover agregado |
| `netlify/personal/films.ts` | `personal-films.mts` | RSS + CSV + TMDB |
| `netlify/personal/hardcover.ts` | `books.ts`, `scripts/hardcoverProbe.mjs` | |
| `netlify/personal/letterboxd.ts` | `films.ts`, `letterboxdCsv.ts` | RSS. **`letterboxdCsv.ts` o importa (`sortDiary`)**: o parser movido deixa de depender dele |
| `netlify/personal/tmdb.ts` | `films.ts`, `scripts/importLetterboxd.mjs` | Q-P2: TMDB sai |
| `netlify/personal/cache.ts` | as duas Functions, `books.ts`, `films.ts`, `tmdb.ts` | cache em `@netlify/blobs` |
| `netlify/personal/{books,films,hardcover,letterboxd,tmdb,cache,qa}.test.ts` | só teste | `qa.test.ts` importa `cache`, `films`, `letterboxdCsv` |
| `netlify/personal/fixtures/letterboxd-rss.xml` | só teste (`letterboxd.test.ts`, `films.test.ts`) | fixture do RSS |
| `netlify/personal/data/letterboxd-history.json` | `importLetterboxd.mjs` (grava), `personal-films.mts`/`films.ts` (leem) | vazio (`entries: []`); o importador novo grava `films.content.ts` |
| `scripts/hardcoverProbe.mjs`, `hardcoverProbe.test.ts` e o script `personal:probe` | ninguém | sonda da API |
| `src/services/integrations/hardcover/*`, `letterboxd/*`, `tmdb/*` (`index.ts`, `live.ts`, `parse.ts`, `mock.ts`, `live.test.ts`) | `src/hooks/usePersonal.ts` (os `index.ts`); o resto, só dentro da pasta ou em teste | clientes ao vivo e mocks |
| `src/services/integrations/{mode.ts,parseMode.ts,source.ts,types.ts,integrations.test.ts}` | `mode.ts`: `routeStatus.ts`, os `index.ts`; `parseMode.ts`: `mode.ts`, `scripts/personalGuard.ts`; `source.ts`: os `index.ts` e `mock.ts`; `types.ts`: `usePersonal.ts` e outros da pasta | sem `mock`/`live` não há razão para existirem |
| `src/data/personal/integrations.ts` | `src/data/routeStatus.ts` | sinalizador `integrated` |
| `.env.example`: `VITE_PERSONAL_SOURCE`, `HARDCOVER_API_TOKEN`, `HARDCOVER_USERNAME`, `TMDB_API_KEY`, `LETTERBOXD_USERNAME`, `PERSONAL_HARDCOVER_TTL_MIN`, `PERSONAL_LETTERBOXD_TTL_MIN`, `PERSONAL_REFRESH_SECRET`, `PERSONAL_BUILD_HOOK_URL` e a seção "Espaço cultural" | `scripts/envExample.test.ts` | ficam só as 3 do EmailJS. **`VITE_PERSONAL_SOURCE`** não estava na lista da proposta |
| Painel do Netlify (**ação sua**): as variáveis acima que existirem lá | n/a | depois do deploy da 008 |

### B. Muda de forma (reescrito no lugar, ou removido quando perde a razão)
| Arquivo | Importado por | O que acontece |
| --- | --- | --- |
| `src/hooks/usePersonal.ts`, `usePersonal.test.tsx` | 5 páginas, `BooksShelves`, `FilmsDiary`, `HubIndex`, `MusicList`, `TheaterTimeline`, `FeedState`, **`src/terminal/extras/personalView.tsx`** | **removido**; leitores passam a ler conteúdo (TD-012) |
| `src/services/integrations/manual/{index.ts,mock.ts}` | `usePersonal.ts`; `manual/index.ts` lê `music.ts` e `theater.ts` | **removidos**; `mock.ts` guarda álbuns e peças **fictícios** (não viram conteúdo) |
| `scripts/personalGuard.ts`, `personalGuard.test.ts`; linhas de `vite.config.ts` (import e `personalGuardPlugin()`) | `vite.config.ts` | **removidos**; a garantia vira a regra de marcador (TD-005) |
| `src/data/routeStatus.ts` | plugin de build, `HubIndex`, `seoHead.ts` e testes | **reescrito** (TD-013): sai `personalMode`, `integrated`; `hasNoContent.livros/filmes` passam a ler a prateleira |
| `src/data/personal/types.ts` | ~40 arquivos | **reduzido** (TD-012): ficam os tipos de música e teatro |
| `src/data/personal/{stats.ts,highlights.ts,review.ts}` e testes | `FilmsDiary`, `BooksShelves`, `HubIndex`, `DiaryEntry`, `RatingStars`, terminal etc. | **substituídos** por `shelf.ts` e `formatDay`; o que sobra em uso por música e teatro (`groupByYearOf`, `formatDay`, `formatMonth`) migra para onde tiver dono; função sem importador sai (lint) |
| `src/data/personal/profiles.ts` | `FilmsDiary`, `BooksShelves` | os dois links viram o `perfil` de cada prateleira (os mesmos valores, informados por ela); o arquivo sai se ficar vazio |
| `src/components/personal/`: `FilmsDiary`, `BooksShelves`, `HubIndex`, `MusicList`, `TheaterTimeline`, `BookCard`, `DiaryEntry`, `ShelfGrid`, `ReviewBlock`, `RatingStars`, `CoverFigure`, `FilmPoster`, `StatTile` | páginas e `HubIndex` | **reescritos** como `Cover`, `RatingStars`, `FilmRow`, `BookRow`, `YearGroup`, `ShelfTotals`, `EmptyShelf` (ver Interface Contract); os nomes antigos sem papel saem |
| `FeedState.tsx`, `StaleNotice.tsx`, `SourceBadge.tsx`, `PlaceholderBadge.tsx`, `AttributionFooter.tsx`, `States.tsx` (`Loading`, `ErrorState`) | `BooksShelves`, `FilmsDiary`, `MusicList`, `TheaterTimeline`, `HubIndex`, `personalView.tsx` | **removidos** (Q-P6); `AttributionFooter` vira `ShelfFooter` |
| testes de `src/components/personal/` (`books`, `films`, `foundation`, `hub`, `hubCards`, `pages`, `badges`, `editorial`, `curated`, `qa`) | só teste | **reescritos ou removidos** um a um, conforme o código; os de `badges` e `qa` (selo de fonte e matriz de falhas) saem |
| `src/pages/personal/{Films,Books,PersonalHub,Music,Theater}.tsx` | `lazyPages.ts`, `test/setup.ts`, `prerender.ts` (mapa de rotas) | **reescritos**; os caminhos não mudam |
| `src/i18n/personal.ts` (+ `personal.test.ts`) e `usePersonalText.ts` | componentes; `personalView.tsx` | chaves de API saem (ver Interface Contract) |
| `src/styles/personal.css` | `src/main.tsx` | **reescrito** com os tokens da 002 |
| `src/terminal/extras/personal.tsx`, `personalView.tsx`, `personal.test.tsx` | catálogo do terminal | **ajuste mínimo** (TD-012), sujeito a Q-D1 |
| `scripts/envExample.test.ts` | só teste | passa a conferir só as 3 variáveis do EmailJS |
| `scripts/secretScan.test.ts`, `secretGuard.test.ts` | só teste | usam `VITE_PERSONAL_SOURCE`/`HARDCOVER_API_TOKEN` só como **exemplo de nome** nas fixtures de teste; trocar por nomes neutros |
| `src/data/personalRoutes.test.tsx`, `personalDiscovery.test.tsx`, `routes.test.ts`, `seo.test.ts` | só teste | ajustados à nova regra de rascunho |
| `scripts/headers.test.ts` | só teste | só o comentário "não confere o bloco `[functions]` (008)" |

### C. Decisão da Duda já registrada (Q-P1, Q-P2, Q-P14)
| Item | Destino |
| --- | --- |
| `netlify/personal/letterboxdCsv.ts` e `.test.ts` | **movem** para `scripts/` e **encolhem** (TD-009) |
| `scripts/importLetterboxd.mjs`, script `personal:import-letterboxd` | **ficam**, reescritos (TD-009) |
| `src/data/personal/music.ts`, `theater.ts`, `editorial.ts` | **ficam** (música e teatro são 011/009; `editorial.ts` numera as páginas); `music.ts` e `theater.ts` perdem o comentário sobre `provenance` |

### D. Efeitos em cadeia
| Item | Importado por | Proposta |
| --- | --- | --- |
| `@netlify/blobs` em `package.json` (e `package-lock.json`) | só `personal-books.mts` e `personal-films.mts` (conferido; `ask.mts` e `limiter.ts` já saíram na 001) | **remover** na onda 3 (Q-001 respondida: a 008 remove) |
| `netlify.toml`: bloco `[functions]` (`directory = "netlify/functions"`) | n/a; o diretório fica sem Function | **remover o bloco**; `scripts/headers.test.ts` já não o confere |
| Diretórios `netlify/functions/` e `netlify/personal/` | | ficam vazios e somem; **`netlify/` inteiro some** se nada mais existir lá (conferir na tarefa) |
| 001, `design.anexo-fora-do-mvp.md` (Anexo B, linhas 47 e 155 a 158) | | **corrigir** ("a 008 removeu"); a 001 está em `review:done`, então é **mudança em spec fechada: precisa da sua aprovação** |
| `.ai/steering/tech-stack.md` (item Netlify e a seção "Dados de filmes...") | | trocar "continuam até a 008" por "o site não tem Function"; **steering: só com sua aprovação** |
| `docs/DEPLOY.md` (local, ignorado pelo git) | | só você; menciona as variáveis |

## Verification Strategy
Todo comando sai com código 0 e é rodado por `npm run verify` ao final; os de arquivo único servem para a tarefa. Nomes de arquivo de teste são propostos (os de `scripts/` seguem o padrão existente).
| ID | O que prova | Comando |
| --- | --- | --- |
| V-01 | schemas aceitam item bom e itens/prateleira reais; registry tem os 2 arquivos | `npx vitest run src/content scripts/contentValidator.test.ts` |
| V-02 | recusas com arquivo, campo e motivo: nota 0 / 4,3, `lendo` sem data, `quero-ler` com nota, `slug` repetido, marcador `[...]`, `TODO`, `[REC]` com e sem `colchetesPermitidos`, perfil `http`, `historicoCompleto` com 0 itens, resenha só PT, resenha > 600, imagem `https://` | `npx vitest run src/content/schema` |
| V-03 | sem rede: HTML das 3 páginas sem URL externa além do `perfil`; teste estático do importador e de `src/`; `.env.example` sem variável de API | `npx vitest run scripts/importLetterboxd.test.ts scripts/envExample.test.ts src/pages/personal` |
| V-04 | cada item mostra o que FR-004/FR-005 pedem; hub; link de perfil | `npx vitest run src/components/personal src/pages/personal` |
| V-05 | estrelas: "nota 4,5 de 5" PT/EN, sem nota nada, nunca "0" | `npx vitest run src/components/personal/RatingStars.test.tsx` |
| V-06 | capa: tom do item, tom por `slug` estável, foto com `alt` e dimensões, terceiros sem registro recusado, contraste do par texto/tom e borda/página (extensão de `contrast.test.ts` da 002) | `npx vitest run src/components/personal/Cover.test.tsx src/styles/contrast.test.ts` |
| V-07 | totais e média calculados; "itens registrados" com `historicoCompleto: false` e "filmes" com `true`; ano mais recente sem relógio | `npx vitest run src/data/personal/shelf.test.ts` |
| V-08 | estado vazio nas 3 páginas e rascunho (`noindex`) com 0 itens | `npx vitest run src/data/personalRoutes.test.tsx src/data/seo.test.ts` |
| V-09 | importador: ensaio não grava; `--escrever` grava e valida; idempotência; recusa nota 3,7; filmes só em `watched.csv` sem data; resenha vai ao relatório; sem `tmdbId`; saída passa em `prettier --check` | `npx vitest run scripts/letterboxdCsv.test.ts scripts/importLetterboxd.test.ts` |
| V-10 | remoção: `grep` sem resíduo (`Hardcover`, `TMDB`, `usePersonal`, `personalMode`, `@netlify/blobs`, `netlify/personal`) fora de `.ai/`, `docs/` e histórico; `npm run verify` verde | `npm run verify` e `git grep -n -i -E "hardcover\|tmdb\|usePersonal\|personalMode\|netlify/blobs\|netlify/personal" -- src scripts netlify.toml package.json .env.example vite.config.ts` (o último deve sair sem linhas, código 1) |
| V-11 | **500 itens:** validação ≤ 5 s; tamanho do HTML e dos chunks; LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; `dist/` sem a fixture | `npx vitest run scripts/shelves500.test.ts` e `npm run prova` (aponta `dist-prova` com a fixture) e `node scripts/checkDist.mjs dist` |
| V-12 | PT e EN com paridade de interface; lista no HTML sem JavaScript (HTML pré-renderizado contém os 500 títulos da fixture e o `<details>` do ano mais recente com `open`) | `npx vitest run src/i18n/personal.test.ts scripts/prerender.test.ts` |
| V-13 | axe sem violação e Lighthouse ≥ 95 em `/pessoal`, `/pessoal/filmes`, `/pessoal/livros` (PT e EN, claro e escuro); foco por teclado nos `<details>` | `npx playwright test --project=shell` e `node scripts/lighthouseRun.mjs` |

## Riscos
| ID | Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R-001 | Remover o hook quebra Music, Theater e o terminal | Alta | Médio | TD-012 e TD-011 (onda 2 reescreve e remove juntas); `typecheck` e teste de cada rota |
| R-002 | Formato real do CSV difere do suposto (`watched.csv`, `ratings.csv`) | Média | Médio | colunas por nome; falha clara; Q-D7 pede um export real; o código atual já marca o formato como não confirmado |
| R-003 | 500 itens pesam o chunk e a hidratação | Média | Médio | TD-006, TD-014; se falhar, a decisão volta para a Duda |
| R-004 | `editadoEm` esquecido | Média | Baixo | TD-008 |
| R-005 | Título legítimo com colchetes (`[REC]`) bloqueia o build | Baixa | Baixo | `colchetesPermitidos` e aviso do importador |
| R-006 | Dia da exibição perdido no dado | Certa | Baixo | TD-002; interface avisa; ordem do arquivo preserva a sequência |
| R-007 | Mapeamento dos 6 tons claros para os 4 escuros indefinido na 002 | Média | Baixo | Q-D6 |
| R-008 | Mexer no Anexo B (001, `review:done`) e no steering sem aprovação | Baixa | Alto | marcado como "precisa da sua aprovação"; nada é editado antes |
| R-009 | Importador com Node sem remoção de tipos | Baixa | Baixo | checagem no início, mensagem clara |
| R-010 | Rascunho sem conteúdo faz `/pessoal` aparecer no menu apontando para páginas vazias | Média | Baixo | já é o comportamento atual (DQ-019 da 002); página vazia explica |

## Decisões da Duda (2026-11-19)
A Duda aceitou as recomendações deste design nas Q-D1 a Q-D9 (registro do pedido dela de 2026-11-19; o `design:approved` do `.status` é da mesma data). Nenhum texto acima mudou; esta seção só registra as respostas, e vale sobre qualquer redação divergente das perguntas abaixo.
| Pergunta | Resposta |
| --- | --- |
| Q-D1 | Ajuste mínimo em música, teatro e terminal **dentro da 008** (TD-012). Teatro fica sem spec dona; o ajuste mínimo não muda o que a página mostra. |
| Q-D2 | `titulo` é um texto único (sem `tituloEn`). |
| Q-D3 | Cortados: `diretor`, `favorito`, `paginas`, `paginaAtual` e link por item. |
| Q-D4 | Resenha até **600 caracteres** por idioma; `editadoEm` **por item** (TD-008, não o `atualizadoEm` único). |
| Q-D5 | Campo `letterboxdUri` aceito (só dedupe do importador, não exibido). |
| Q-D6 | Os 6 tons claros são mapeados nos 4 escuros **por CSS**; a 002 não é alterada. |
| Q-D7 | Filmes só em `watched.csv` entram sem data (aceito). **O export real do Letterboxd é ação da Duda e ainda não existe no repositório:** as tarefas do importador ficam bloqueadas por esse dado e nenhuma coluna é suposta (ver `tasks.md`, T2.1). |
| Q-D8 | Registro de terceiros **no item** (validado pela verificação); sem cópia na spec. |
| Q-D9 | Lista de remoção **aprovada por seção (A, B, C, D)**. Autoriza também corrigir o Anexo B da 001 e o `.ai/steering/tech-stack.md`. |

**Emenda visível (autorizada em 2026-11-19):** a 001 está em `review:done` e `tech-stack.md` é steering. A Duda autorizou os dois ajustes citados em D (Anexo B, linhas 47 e 155 a 158, e a seção Netlify/"Dados de filmes..." do `tech-stack.md`). Quando a tarefa T5.2 os fizer, cada arquivo recebe uma linha "Emenda 2026-11-19 (spec 008): ..." e o diff entra no `evidence.md`. Nada além disso nesses arquivos.

**Ações da Duda fora do repositório** (nada aqui é feito por tarefa): PEND-001 export real do Letterboxd em `letterboxd-export/`; PEND-005 apagar as variáveis de API no painel do Netlify **depois** do deploy da 008; PEND-006 ligar `historicoCompleto` só quando o histórico estiver completo; PEND-007 traduzir as resenhas (PT e EN) e conferir os itens importados; PEND-008 decidir os `slug` de títulos com colchetes. A lista completa está no fim do `tasks.md`.

## Perguntas deste design
Todas respondidas em 2026-11-19 (ver "Decisões da Duda"). O texto original fica como histórico.
- **Q-D1 (alta):** música (`/pessoal/musica`), teatro e o comando `pessoal` do terminal usam o código que sai. Posso fazer o ajuste mínimo **nesta spec** (TD-012), sem mudar o que mostram, ou prefere que a 009 e a 011 assumam e a 008 deixe o `typecheck` para elas? Teatro não tem spec dona hoje: fica até quando?
- **Q-D2:** `titulo` é um texto só (nome como aparece no Letterboxd). Quer título traduzido em PT e EN para algum filme ou livro (ex.: "Cidade de Deus" / "City of God")? Se sim, o campo vira opcional `tituloEn`.
- **Q-D3:** cortei `diretor`, `favorito`, `paginas`, `paginaAtual`, link por item (sem FR). Concorda? Cada um entra depois como campo opcional, sem migração.
- **Q-D4:** "resenha curta": limite de 600 caracteres por idioma, ok? E o `editadoEm` por item (TD-008) ou prefere um único `atualizadoEm` por prateleira que você mexe a cada edição?
- **Q-D5:** o `letterboxdUri` por item existe só para o importador não duplicar filmes na reimportação, e não aparece na página. Aceita esse campo?
- **Q-D6:** a 002 tem 6 tons claros e 4 escuros para capas. Mapeio os 6 nos 4 escuros por CSS (dois pares dividem o mesmo escuro) ou a 002 ganha 2 tons escuros novos?
- **Q-D7:** pode me passar (ou guardar em `letterboxd-export/`) um export real do Letterboxd para confirmar as colunas de `diary.csv`, `reviews.csv`, `watched.csv` e `ratings.csv` antes de eu fechar as tarefas do importador? Filmes que só estão em `watched.csv` entrariam **sem data** (aceita)?
- **Q-D8:** "registro de terceiros na spec" (FR-007): eu o guardo **no próprio item** (validado pela verificação). Quer também uma cópia na spec ou o item basta?
- **Q-D9:** aprova a lista de remoção (seções A, B, C, D), por seção ou por linha? E autoriza corrigir o Anexo B da 001 e o `tech-stack.md` depois da remoção?
