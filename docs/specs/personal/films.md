# Filmes reais: Letterboxd (RSS + CSV) e TMDB

Estado: **implementada e testada sem rede (fixture real do RSS); TMDB ainda não validado com a chave
real e CSV ainda não importado** (faltam `TMDB_API_KEY` e o export da Duda). Requisitos: CL-22, CL-25,
CL-27, CL-28, CL-30, CL-31, CL-32 (`requirements.md`). Modelo de cache igual ao dos livros (`hardcover.md`).

Legenda: **[V]** verificado · **[A]** assunção a confirmar.

## 1. Fontes permitidas (e proibidas)

| Fonte | Uso | Estado |
| --- | --- | --- |
| RSS público do perfil | diário recente | **[V]** `https://letterboxd.com/dudapbrt/rss/` (HTTP 200, `application/rss+xml`, 50 itens, 14/11/2026) |
| CSV oficial de exportação | histórico além dos 50 do RSS | **[A]** colunas conferidas só pela documentação/memória; falta o arquivo real |
| TMDB API v3 | pôster, fundo, sinopse PT/EN, gêneros, direção, duração | **[A]** forma da resposta conhecida da documentação; sem chave não houve chamada real |

Proibido: HTML de página do Letterboxd, endpoints não oficiais, API do Letterboxd (não concedida).
Nenhum dado do Letterboxd vem do HTML: a resenha vem do campo `description` do **próprio feed**.

## 2. O que o RSS realmente traz

Por item: título (`letterboxd:filmTitle`), ano, `watchedDate` (**ausente em 3 de 50**), `memberRating`
(**ausente em 5 de 50**), `rewatch`, `memberLike`, `tmdb:movieId` ou `tmdb:tvId` (**1 série**), link da entrada
e, nos itens `letterboxd-review-…` (13 de 50), o texto da resenha e o aviso "may contain spoilers".

**Não traz:** listas, favoritos do perfil, watchlist, hora de exibição, local ("cinema") nem dados de
streaming. Por isso a página não tem esses blocos e nunca afirma "assistido no cinema".
O pôster do feed (CDN do Letterboxd) é ignorado: o pôster vem do TMDB.

## 3. Fluxo

```
RSS (cache 1 h, snapshot) ─┐
CSV → JSON versionado ─────┼─► mescla (título+ano+data) ─► TMDB (cache permanente) ─► /api/personal/films
                           │                                                          └─ stale só se o RSS falhar
```

- `netlify/personal/letterboxd.ts` (RSS), `letterboxdCsv.ts` (CSV + mesclagem), `tmdb.ts` (cliente e
  enriquecimento), `films.ts` (HTTP e serviço), `functions/personal-films.mts` (liga ao ambiente).
- **Caches separados por fonte:** snapshot `letterboxd` (TTL `PERSONAL_LETTERBOXD_TTL_MIN`, padrão 60;
  reaproveita `cache.ts`: single-flight, backoff, snapshot vencido) e `tmdb-meta` (por `tmdbId`, sem
  validade; refaz só o que veio sem pôster, após 7 dias; 404 lembrado por 7 dias).
- TMDB: até 20 filmes novos por requisição (concorrência 5, 5 s cada); o resto é enriquecido nas
  próximas leituras. Chave inválida (401/403) ou 429 interrompem as buscas daquela requisição. O TMDB
  **nunca** deixa a resposta "vencida": sem ele, o diário aparece sem pôsteres.
- RSS fora e sem snapshot: se houver histórico do CSV, serve-o como `stale: true` (data do import).
  Sem nada: 503 genérico, e a página mostra erro com "tentar de novo".

## 4. Importador do CSV

`npm run personal:import-letterboxd -- [pasta] [--tmdb]` lê `diary.csv` (+ `reviews.csv`) de
`letterboxd-export/` (**ignorada pelo git**; o CSV bruto nunca é versionado) e grava
`netlify/personal/data/letterboxd-history.json` (versionado, empacotado na função; **o navegador nunca
vê CSV**). Colunas por nome, não por posição; cabeçalho inesperado falha com mensagem.

- **Deduplicação:** chave (título + ano + data) sem acento/caixa/pontuação; RSS vence (tem "curtido",
  id do TMDB e link da entrada). Sem data, só casa com outra sem data.
- **`publish: false`** por entrada (edite o JSON): a resenha **nem sai do servidor**, nem na entrada
  equivalente do RSS. Reimportar preserva `publish` e `tmdbId`.
- O CSV não traz `tmdbId` nem "curtido": `liked` fica ausente (não "não curtido"); `--tmdb` resolve o
  id por busca exata (título + ano, resultado único; ambíguo = sem pôster, nunca o pôster errado).

## 5. Página `/pessoal/filmes`

Estatísticas do ano mais recente (de `watchedDate`; derivadas dos itens), exibições por ano, parede de
pôsteres recentes (só os que têm pôster do TMDB), diário por mês (nota, data, revisto, curtido, série,
direção/gêneros/duração, sinopse e resenha ao expandir, aviso de spoiler), link do perfil, "última
sincronização", aviso de vencido e atribuição do TMDB quando há dado dele. Quatro estados, PT/EN.

### Fora desta entrega (e por quê)

| Pedido | Estado |
| --- | --- |
| Listas | ❌ o RSS não traz; `lists/*.csv` existe no export, não importado |
| Favoritos | ❌ os 4 favoritos do perfil não estão no RSS; mostra-se só "curtidos" (`memberLike`), com esse nome |
| Watchlist | ❌ o RSS não traz; `watchlist.csv` existe no export, não importado ainda |
| "Assistido no cinema" | ❌ nenhuma fonte informa |
| Logo do TMDB | ◐ só o texto de atribuição exigido |
| `backdropUrl`, "sinopse" na parede | `backdropUrl` já vem no modelo; a página ainda não o usa |

## 6. Segurança

`TMDB_API_KEY` só em variável de servidor; v3 vai em `api_key` e v4 (`eyJ…`) como Bearer; mensagens de
erro, logs e respostas nunca a contêm (testes). Função só-GET, sem entrada, 503 sem detalhe.
