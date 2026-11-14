# Livros reais: integração com o Hardcover

Estado: **implementada e testada sem rede; ainda não validada com o Hardcover real** (falta o
token da Duda). Requisitos: CL-29, CL-31, CL-32 (`requirements.md`); contexto e viabilidade:
`README.md`, seções 4.2, 5 e 6.

Legenda: **[V]** verificado · **[A]** assunção a confirmar com `npm run personal:probe`.

## 1. Decisão: SDK oficial ou `fetch` tipado?

**Escolhido: um `fetch` tipado e pequeno** (`netlify/personal/hardcover.ts`), sem SDK.

| Critério | SDK TypeScript (0.x) | `fetch` tipado (escolhido) |
| --- | --- | --- |
| Dependência nova | sim (e pré-1.0, API pode quebrar) | nenhuma (regra do projeto: não adicionar sem necessidade) |
| Superfície usada | duas consultas | as mesmas duas consultas |
| Controle de timeout, retry, `Retry-After`, limite de profundidade | depende do SDK | total |
| Peso no bundle | só roda no servidor | só roda no servidor |
| Teste sem rede | precisa simular o SDK | `fetch` injetado |
| Risco de esquema (campo recusado) | tipos gerados podem divergir da API em beta [A] | queda para consulta mínima, testada |

Se um dia o Hardcover publicar um SDK 1.0 estável e o projeto precisar de muito mais consultas,
vale rever. Hoje o custo de uma dependência supera o ganho.

## 2. Fluxo

```
navegador ─GET /api/personal/books─► Netlify Function ─► cache (Blobs) ─┬─ fresco: serve
 (sem token)                          (token só aqui)                    └─ vencido: Hardcover
                                                                            └─ falhou: último snapshot (stale)
```

- `netlify/functions/personal-books.mts` liga o ambiente (variáveis, Blobs) ao núcleo testável
  `netlify/personal/books.ts` (HTTP), `cache.ts` (snapshot) e `hardcover.ts` (cliente).
- No navegador, `src/services/integrations/hardcover/live.ts` lê `/api/personal/books` e
  `parse.ts` valida a resposta (capa só `https:`, estado e nota válidos, procedência sempre
  `hardcover`). O código de `src/` **não conhece** o token nem `api.hardcover.app` (teste varre `src/`).

## 3. Consultas (rasas, por causa do limite de profundidade 3)

Endpoint `https://api.hardcover.app/v1/graphql`, `Authorization: Bearer <token>` [V: página
User Books da documentação oficial, via busca; a página de docs em si devolveu 403 à ferramenta].

1. `me { id username }` → id do usuário. `me` pode vir como lista ou objeto [A]; o cliente aceita os dois.
2. `user_books(where: { user_id: { _eq: $userId } }, limit, offset)` em páginas de 100 (até 20 páginas),
   com `book` e a última `user_book_reads`.

Há dois níveis: **completo** (tudo que a página usa) e **mínimo** (`id status_id rating book {...}`).
Se o Hardcover recusar um campo do completo, o cliente cai no mínimo e segue: a página mostra menos,
nunca algo inventado.

### Mapeamento para o modelo

| Campo do Hardcover | Campo de `Book` | Observação |
| --- | --- | --- |
| `status_id` 1 / 2 / 3 / 4 / 5 | `want` / `reading` / `read` / `paused` / `dnf` | [V] mapa da documentação; 6 (ignorado) e desconhecidos saem |
| `book.id` | `id` (`hc:<id>`) | deduplica o mesmo livro: vence o estado mais ativo |
| `book.title`, `book.pages` | `title`, `pages` | página só se número positivo |
| `book.cached_contributors` | `authors` | formatos `{author:{name}}`, `{name}`, texto [A]; sem nome, fora; repetidos, uma vez |
| `book.cached_image` | `coverUrl` | só `https:` [A] |
| `rating` | `rating` | arredonda a 0,5; zero ou ausente = sem nota |
| `user_book_reads[0].started_at`, `first_started_reading_date` | `startedAt` | dia `AAAA-MM-DD` |
| `user_book_reads[0].finished_at`, `last_read_date` | `finishedAt` | **só** para livros lidos; `finished_at` **não confirmado** [A] |
| `user_book_reads[0].progress_pages`, `progress` | `progress` | só para "lendo"; percentual limitado a 0–100; sem percentual, derivado de páginas/total |
| `review_raw` | `review` | aparado, até 5000 caracteres, vazio = ausente |
| `book.slug` | `provenance.url` | `https://hardcover.app/books/<slug>` |

Todo campo ausente continua ausente. Nada é preenchido com valor presumido.

## 4. O que a página mostra

Estantes: lendo agora (com andamento), lidos por ano (do mais recente), pausados/abandonados,
quero ler, **favoritos**, **atividade de leitura** (livros por mês), estatísticas do ano
(`ReadingStats`, derivadas dos itens), resenhas quando existem, link ao perfil, selo de última
sincronização e os quatro estados.

**Favoritos = livros com nota 5.** É uma derivação, e o rótulo diz isso ("Favoritos · nota 5").
Não se confirmou que o Hardcover tenha uma noção própria de "favorito" ou uma lista com esse nome.

### Fora desta entrega (e por quê)

| Pedido | Estado |
| --- | --- |
| Listas do Hardcover | ❌ o esquema de listas não foi confirmado; o `probe` deve descobri-lo antes de consultar |
| Metas de leitura | ❌ idem: não há campo confirmado |
| Favoritos nativos | ◐ só a derivação por nota 5 (acima) |
| Tipografia serifada de destaque | ❌ contraria a decisão D2 (estilo único em mono). Se quiser mudar, é mudança de spec (`estilo-unico`) e de fonte, não detalhe desta página |
| Atualização agendada | ❌ Fase 4: hoje o cache se renova sob demanda |

## 5. Cache e resiliência

| Preocupação | Tratamento | Teste |
| --- | --- | --- |
| Validade | `PERSONAL_HARDCOVER_TTL_MIN` (padrão 360, decisão D9: 6 h) | `books.test.ts` |
| Fonte fora do ar | devolve o último snapshot com `stale: true` e a data original | `cache.test.ts` |
| Sem snapshot e fonte fora | 503 genérico; a página mostra erro com "tentar de novo" | `books.test.ts` |
| Martelar a fonte | *single-flight* (leituras simultâneas dividem uma busca) e *backoff* de 60 s depois de falha | `cache.test.ts` |
| Limite de taxa (429) | espera o `Retry-After` (até 8 s) e tenta de novo, até 2 vezes | `hardcover.test.ts` |
| Timeout | 6 s por requisição, 20 s de orçamento total; estourou = erro, **nunca resultado parcial** | `hardcover.test.ts` |
| 5xx e rede | tentativas com espera crescente | `hardcover.test.ts` |
| Token recusado (401/403) | falha na hora, sem insistir | `hardcover.test.ts` |
| Armazenamento (Blobs) instável | leitura e escrita não derrubam; segue como se não houvesse snapshot | `cache.test.ts` |
| "Última sincronização" na UI | `updatedAt` do snapshot, mostrado no rodapé; vencido mostra aviso | `books.test.tsx` |

### Limite conhecido: primeira leitura a frio

A função da Netlify tem tempo limite curto (cerca de 10 s no padrão [A]). A primeira leitura sem
snapshot, com uma estante grande, pode passar disso e falhar; as seguintes usam o cache. A correção
de verdade é a **função agendada da Fase 4**, que aquece o cache fora do pedido do visitante. Até lá,
a primeira visita depois de uma implantação pode ver o estado de erro uma vez.

## 6. Segurança

- O token só existe em `HARDCOVER_API_TOKEN`, variável **de servidor** do painel da Netlify (nunca `VITE_`,
  nunca no `netlify.toml`). Testes garantem: nenhum arquivo de `src/` cita o token ou o endpoint; o
  `.env.example` deixa o segredo vazio; a resposta HTTP e os cabeçalhos nunca contêm o token; as
  mensagens de erro nunca o contêm.
- A função é só leitura (GET), não aceita entrada, não expõe detalhe de erro. O motivo real vai
  apenas para o log do servidor.
- Sem scraping e sem endpoint não oficial: só a API GraphQL documentada.

## 7. Como confirmar o esquema (feito uma vez, com o seu token)

1. Gere o token na sua conta do Hardcover e ponha `HARDCOVER_API_TOKEN=...` no `.env` (ignorado pelo git)
   ou no ambiente do terminal.
2. Rode `npm run personal:probe`. Ele confere por introspecção se cada campo usado existe, roda a consulta
   completa com 3 linhas e a leitura completa pelo **mesmo cliente** do servidor, e resume contagens
   (livros por estado, quantos têm capa, autores, páginas, datas, resenha). Não imprime o token, títulos
   nem o texto das resenhas.
3. Se divergir, o script diz o quê. Ajuste as consultas e a normalização em `netlify/personal/hardcover.ts`
   e as fixtures de `hardcover.test.ts` (que hoje seguem a forma assumida).
4. No painel da Netlify, defina `HARDCOVER_API_TOKEN` (e, se quiser, `PERSONAL_HARDCOVER_TTL_MIN`) e
   publique com `VITE_PERSONAL_SOURCE=live`. Enquanto Filmes não for integrado (`data/personal/integrations.ts`),
   ele fica em rascunho no modo `live`.

## 8. Operação

- **Token expira ou é recusado:** a página mostra o último snapshot como "vencido" (se houver) ou o estado de
  erro; o log do servidor registra `personal-books: auth`. Gere um token novo e atualize a variável.
- **Forçar atualização:** não há endpoint manual; reduza `PERSONAL_HARDCOVER_TTL_MIN` ou aguarde o TTL.
  A função agendada (Fase 4) trará isso.
- **Resposta inesperada do Hardcover:** o cliente do navegador rejeita o que foge do contrato e mostra o
  estado de erro, em vez de exibir dado quebrado.
