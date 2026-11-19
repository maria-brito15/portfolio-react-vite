# 008 Films and books, Tasks
**Status:** draft (ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada), `design.md` v1.0 (`design:approved` em 2026-11-19, com a seção "Decisões da Duda (2026-11-19)"), modelo dos `tasks.md` da 001 e da 002.
**Estimativa total:** 26 tarefas, **76 h** (1 a 4 h cada), em 7 fases (0 a 6). Uma tarefa (T2.1) é **bloqueada por dado da Duda** e arrasta T2.2 a T2.4 e T5.1. A "Ação da Duda" está no fim.
Nada foi escrito em código nem removido para gerar este arquivo.

## Como ler
- **Testes ficam dentro de cada tarefa.**
- **Bloco de evidência** no fechamento de toda tarefa, em `evidence.md` desta pasta: `Claim`, `Command`, `Exit code`, `Summary`, `Verdict`.
- **Gate de toda tarefa:** `npm run verify` com exit 0 no fim, **inclusive nas tarefas que removem** (D-002, TD-011). Remoção e reescrita andam juntas: nenhuma tarefa deixa o repositório quebrado.
- **Remoção só do que o `grep` prova sem importador.** Antes de apagar, a tarefa roda e cola no `evidence.md` o `grep` de importadores do arquivo (`git grep -n -E "<nome>" -- src scripts netlify e2e vite.config.ts package.json netlify.toml`), e o resultado só pode listar arquivos que saem na mesma tarefa. A lista aprovada é a do `design.md` ("Lista de remoção", seções A, B, C, D, aprovadas em 2026-11-19). **Arquivo fora da lista não é apagado**; se aparecer um importador novo, parar e avisar.
- **Três ondas (TD-011):** onda 1 só acrescenta (Fase 1 e 2); onda 2 reescreve e remove juntas (Fase 3); onda 3 remove o servidor (Fases 4 e 5).
- **Commits** em português, `tipo(escopo): resumo`, citando o ID da tarefa, terminando com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. **Nenhuma tarefa inclui `git push`**, e nada vai para a `main`.
- **Orçamento:** suíte ≤ 90 s, `verify` ≤ 180 s (001). Nunca duas execuções de vitest ao mesmo tempo. Se um `verify` estourar, repetir com a máquina ociosa antes de culpar o código.
- **Windows:** arquivo com barra invertida, crases ou `\uXXXX` vai pelo Write, não por heredoc.
- **Texto de interface** em PT e EN (`src/i18n/personal.ts`, paridade existente). **Conteúdo** nunca fica em componente. Nada inventado: nenhum título, nota ou resenha de exemplo entra em `src/content/` (as fixtures ficam fora dele, TD-014).
- **Arquivos da Duda:** `src.zip`, `letterboxd-export/` e `docs/DEPLOY.md` não são apagados, movidos nem comitados.

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados | OK: `requirements.md` v1.0 |
| Design aprovado | OK: `design:approved` em 2026-11-19 (`.status`) |
| Todo FR e NFR coberto | OK (tabela Coverage); nenhum FR sem tarefa |
| Perguntas respondidas | OK: Q-001 a Q-007 do requirements e Q-D1 a Q-D9 do design (registradas no `design.md`) |
| Remoção aprovada | OK: seções A, B, C e D (Q-D9); Anexo B da 001 e `tech-stack.md` autorizados, com emenda visível (T5.2) |
| Toda tarefa tem dependência, critério e verificação | OK |
| **Dado que falta** | **Export real do Letterboxd (PEND-001).** Sem ele T2.1 não fecha e **T2.2, T2.3, T2.4 e T5.1 não começam**. Nada mais depende dele: Fases 1, 3 e 4 e T5.2 em diante seguem. Nenhuma coluna de CSV é suposta (R-002) |
| Pontos que dependem de medição | limites de 5 s de validação, LCP/INP/CLS e peso do chunk (T1.4, T6.3). Se algum falhar, **parar e voltar à Duda** (TD-006, TD-014), sem aumentar o número em silêncio |
| Tarefas de 4 h que concentram risco | T1.2, T2.3, T3.1 a T3.4, T6.1: se estourar, parar e avisar a Duda antes de dividir (muda o total) |
| Ressalva de dependência | o importador antigo (`scripts/importLetterboxd.mjs`) importa `netlify/personal/{letterboxdCsv,tmdb}.ts`, e `letterboxdCsv.ts` importa `letterboxd.ts`; `cache.ts` é importado por `tmdb.ts`. Por isso a remoção do servidor se divide em 4.1 (o que não depende do importador) e 5.1 (o resto, depois do importador novo) |

## Coverage
| Requisito | Tarefas |
| --- | --- |
| FR-001 (conteúdo curado lido e validado) | T1.1, T1.2 |
| FR-002 (falha com arquivo, campo e motivo) | T1.1, T1.2 |
| FR-003 (sem serviço externo) | T2.4, T3.3, T3.4, T3.8, T4.1, T5.1, T6.5 |
| FR-004 (item de filme) | T1.2, T3.3 |
| FR-005 (item de livro) | T1.2, T3.4 |
| FR-006 (nota) | T1.2, T3.1 |
| FR-007 (capa; terceiros recusados sem registro) | T1.1, T3.1, T3.10 |
| FR-008 (totais, média, "itens registrados") | T1.3, T3.2 |
| FR-009 (link de origem `https`) | T1.1, T3.2, T3.3, T3.4 |
| FR-010 (estado vazio) | T3.2, T3.3, T3.4, T3.5 |
| FR-011 (sem marcador de exemplo) | T1.1, T3.9 |
| FR-012 (importador offline) | T2.1, T2.2, T2.3, T2.4 |
| FR-013 (remoção do código de API) | T3.5 a T3.9, T4.1, T5.1, T5.2, T6.5 |
| FR-014 (escala: agrupar por ano, 500 itens, 5 s) | T1.3, T1.4, T3.2, T6.1, T6.2, T6.3 |
| FR-015 (PT/EN, rota, lista sem JavaScript) | T3.2, T3.3, T3.4, T6.2, T6.4 |
| NFR-001 (desempenho) | T1.4, T6.1, T6.3 |
| NFR-002 (segurança: `.env.example`, painel, terceiros) | T1.1, T2.4, T3.8, T5.1, T6.5 |
| NFR-003 (acessibilidade) | T3.1, T3.2, T3.10, T6.4 |
| US-001 (menu; hierarquia) | nada a mudar (DQ-019 da 002); conferido em T3.5 |
| Decisões: TD-001/002/003 / TD-004 / TD-005 / TD-006 / TD-007/008 / TD-009 / TD-010 / TD-011 / TD-012 / TD-013 / TD-014 / TD-015 | T1.1, T1.2 / T1.1, T3.1 / T1.1, T3.9 / T3.2 / T1.3, T3.2 / T2.2 a T2.4 / T3.1 / todas as de remoção / T3.6, T3.7 / T3.5 / T1.4, T6.1 a T6.3 / T3.2 |

---

## Fase 1: Onda 1, só acrescenta (schemas, conteúdo vazio, funções puras, fixture)
### T1.1 Schemas base: prateleira, `slug`, dia, tom, foto e marcador de exemplo (TD-001, TD-004, TD-005)
- **Requisito:** FR-001, FR-002, FR-007, FR-009, FR-011, NFR-002 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** nenhuma
- **Trabalho:** criar em `src/content/schema/` os arquivos `shelf.ts` (prateleira `{ perfil?, historicoCompleto, colchetesPermitidos?, itens }`; `perfil` só `https`; `historicoCompleto: true` exige 1 item ou mais; `slug` com a regex do design e único; `colchetesPermitidos` apontando para `slug` existente; `editadoEm` como dia real `AAAA-MM-DD`; enum dos 6 tons; `foto` = `{ imagem: ImageSchema, autoria }` com `autoria` `propria` ou `terceiros` com `origem`, `licenca`, `atribuicao` e `verificadoEm` obrigatórios) e `marker.ts` (`markerProblem`: `[...]`, `TODO`/`TBD`/`FIXME`/`XXX`/`placeholder` como palavra, `lorem ipsum`; exceção só em `titulo` e só para `slug` de `colchetesPermitidos`). Reexportar em `schema/index.ts`. Mensagens no formato da 001 (arquivo, campo, motivo). O validador da 001 não muda.
- **Testes:** `src/content/schema/shelf.test.ts` e `marker.test.ts`: `perfil` `http` e `mailto:` recusados; `historicoCompleto: true` com 0 itens; `slug` repetido; `colchetesPermitidos` com `slug` inexistente; dia `2026-02-30` recusado; `foto` com URL `https://` recusada (001, FR-009); `terceiros` sem um dos 4 campos recusado; marcador em `titulo`, `resenha`, `alt` e campos de registro; `[REC]` recusado sem e aceito com `colchetesPermitidos`; "exemplo" e "Todo mundo" **não** disparam (palavra inteira).
- **Critérios de aceitação:** cada recusa traz o campo e o motivo do design; nenhum import de `src/content/` para fora de `src/content/` (regra de lint da 001).
- **Arquivos prováveis:** `src/content/schema/{shelf,marker,index}.ts`, `src/content/schema/{shelf,marker}.test.ts`
- **Verificação:** `npx vitest run src/content/schema` (exit 0); `npm run verify` (exit 0)

### T1.2 Schemas do filme e do livro, regras cruzadas, `registry` e arquivos de conteúdo vazios (TD-001, TD-002, TD-003)
- **Requisito:** FR-001, FR-002, FR-004, FR-005, FR-006 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.1
- **Trabalho:** `schema/film.ts` (campos da tabela "Filme": `titulo` texto único, `ano`, `assistidoEm?`, `nota?` com o `RatingSchema` da 001, `resenha?` PT e EN até **600 caracteres** por idioma, `tom?`, `foto?`, `editadoEm`, `letterboxdUri?` `https` em `boxd.it` ou `letterboxd.com`, único) e `schema/book.ts` (`autores` 1+, `estado` enum, `iniciadoEm?`, `lidoEm?` e as regras cruzadas por `superRefine`: `lendo` exige `iniciadoEm`; `quero-ler` sem datas e sem nota; `iniciadoEm` não depois de `lidoEm` por `compareDates`). **Não** criar `diretor`, `favorito`, `paginas`, `paginaAtual`, link por item, `tmdbId` (Q-D3). Aplicar `markerProblem` a todo texto do item. Criar `src/content/films.content.ts` e `books.content.ts` **com `itens: []`**, `historicoCompleto: false`, e **sem `perfil`**: o link vem da Duda (PEND-002; os valores hoje em `src/data/personal/profiles.ts` só migram em T3.3 e T3.4, "informados por ela"). Registrar no `registry.ts`.
- **Testes:** `film.test.ts` e `book.test.ts`: nota 0, 4,3, 5,5, `null`, texto; resenha só em PT; resenha com 601 caracteres (a mensagem traz o tamanho); `lendo` sem `iniciadoEm`; `quero-ler` com nota e com data; `lidoEm` antes de `iniciadoEm`; `letterboxdUri` repetido ou de outro domínio; item bom de cada tipo aceito. `scripts/contentValidator.test.ts` (ajuste) confere os 2 arquivos novos no `registry`.
- **Critérios de aceitação:** as mensagens cruzadas batem com o design (`itens[3].iniciadoEm: obrigatório quando estado é "lendo"`); `validateAll` passa com os arquivos vazios; o conteúdo de teste vive só nos testes.
- **Arquivos prováveis:** `src/content/schema/{film,book,index}.ts` e testes, `src/content/{films,books}.content.ts`, `src/content/registry.ts`, `scripts/contentValidator.test.ts`
- **Verificação:** `npx vitest run src/content scripts/contentValidator.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.3 Funções puras da prateleira e `formatDay` (TD-006, TD-007, TD-008)
- **Requisito:** FR-008, FR-014 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2
- **Trabalho:** `src/data/personal/shelf.ts` com `groupByYear`, `shelfTotals`, `bookCounts`, `latestEdit` e `toneFor` (hash estável do `slug`), conforme a tabela do Interface Contract; `formatDay(dia, lang)` em `src/content/dates.ts` com **tabela fixa de meses**, sem `Intl`. Os arquivos `stats.ts`, `highlights.ts` e `review.ts` **ficam** (saem na T3.9).
- **Testes:** `shelf.test.ts`: ano mais recente primeiro, "sem data" por último; empate mantém a ordem do arquivo; `ordemIndeterminada` quando falta mês ou os meses são iguais (001, FR-013); `media` ausente sem nota (nunca 0); `anoRecente` sem olhar o relógio (data do sistema falsificada em dois valores dá o mesmo resultado); `latestEdit` de lista vazia é `undefined`; `toneFor` não muda quando um item novo entra antes; `formatDay` "19 nov 2026" e "nov 19, 2026".
- **Critérios de aceitação:** nenhuma função usa `Date.now`, `new Date()` sem argumento nem `Intl`.
- **Arquivos prováveis:** `src/data/personal/shelf.ts`, `shelf.test.ts`, `src/content/dates.ts`, `dates.test.ts`
- **Verificação:** `npx vitest run src/data/personal/shelf.test.ts src/content/dates.test.ts` (exit 0); `git grep -n -E "Date\.now|new Date\(\)|Intl\." -- src/data/personal/shelf.ts` (exit 1); `npm run verify` (exit 0)

### T1.4 Fixture de 500 filmes e 500 livros e teste de validação (TD-014, parte 1)
- **Requisito:** FR-014, NFR-001 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2
- **Trabalho:** `scripts/fixtures/shelves500.ts`, determinística (semente fixa): 500 filmes e 500 livros, 10 anos, cerca de 30% com resenha PT/EN de cerca de 400 caracteres, 20% sem nota, 10% sem `assistidoEm`, alguns sem mês, 3 livros `lendo`; um texto-marca único (ex.: `FIXTURE-500`) em todo título. Fora de `src/content/` e fora do `registry`. Teste que valida a fixture com os schemas e mede o tempo.
- **Testes:** `scripts/shelves500.test.ts`: a fixture passa no schema; `validateAll` sobre ela **≤ 5 s** (3 rodadas, pior valor registrado); `src/content/registry.ts` não importa de `scripts/`.
- **Critérios de aceitação:** nenhum item da fixture em `src/content/`; se passar de 5 s, **parar e voltar à Duda** (TD-014).
- **Arquivos prováveis:** `scripts/fixtures/shelves500.ts`, `scripts/shelves500.test.ts`
- **Verificação:** `npx vitest run scripts/shelves500.test.ts` (exit 0, tempos no `evidence.md`); `git grep -n "FIXTURE-500" -- src` (exit 1); `npm run verify` (exit 0)

---

## Fase 2: Importador offline (bloqueada por dado da Duda)
### T2.1 BLOQUEADA POR DADO DA DUDA: receber o export real e registrar as colunas (Q-D7, R-002)
- **Requisito:** FR-012 · **Prioridade:** P0 · **Estimativa:** 1 h (depois que o dado existir) · **Dependências:** **PEND-001 (ação da Duda)**
- **Bloqueio:** o export real do Letterboxd, descompactado em `letterboxd-export/` (ignorada pelo git), com `diary.csv` e, se existirem, `reviews.csv`, `watched.csv`, `ratings.csv`. **Esta tarefa não começa sem os arquivos. Nenhuma coluna é suposta, e nenhum CSV é inventado**; as colunas que o código atual marca como "[A: confirmar com o primeiro arquivo real]" continuam em aberto até aqui.
- **Trabalho:** ler **só a linha de cabeçalho** de cada arquivo (nenhuma linha de dado vai para o repositório) e gravar `import-columns.md` nesta pasta com: nome do arquivo, colunas exatas e a coluna que cada campo (`Name`, `Year`, `Watched Date`, `Rating`, `Letterboxd URI`, texto da resenha) ocupa. Se faltar uma coluna que o design usa (por exemplo, `Letterboxd URI`), **parar e voltar à Duda** com a diferença; o design não muda em silêncio.
- **Testes:** nenhum de código; a conferência é do próprio registro.
- **Critérios de aceitação:** `import-columns.md` existe, cada coluna citada foi vista no arquivo real; o veredito diz "colunas confirmadas" ou lista a divergência.
- **Arquivos prováveis:** `.ai/sdd/specs/008-films-and-books/import-columns.md`
- **Verificação:** `test -f .ai/sdd/specs/008-films-and-books/import-columns.md` (exit 0); `git status --short -- letterboxd-export` (sem linha: pasta ignorada, nada comitado)

### T2.2 Parser de CSV movido para `scripts/` e reduzido (TD-009)
- **Requisito:** FR-012 · **Prioridade:** P1 · **Estimativa:** 3 h · **Dependências:** T2.1, T1.2
- **Trabalho:** criar `scripts/letterboxdCsv.ts` e `scripts/letterboxdCsv.test.ts` **a partir** de `netlify/personal/letterboxdCsv.ts` (o original **fica**: o importador antigo ainda o usa e sai na T5.1). Ficam `parseCsv`, leitura de colunas **por nome**, `toEntry` e `entryKey`; saem `History`, `parseHistory`, `historyToEntries`, `mergeDiary`, a dependência de `FilmDiaryEntry` e de `sortDiary`. Mapear só as colunas confirmadas em `import-columns.md`. Fixture de CSV de teste com o **cabeçalho real** do `import-columns.md` e linhas inventadas **só dentro do teste** (nunca em `src/content/`).
- **Testes:** `letterboxdCsv.test.ts`: lê por nome (colunas fora de ordem); sem `Name` falha com código e o cabeçalho encontrado; nota 3,7 recusada com número da linha; ano inválido recusado; aspas, vírgula e quebra de linha em campo; sem import de `netlify/`.
- **Critérios de aceitação:** `scripts/letterboxdCsv.ts` não importa nada de `netlify/` nem de `src/`, exceto os tipos/schemas do conteúdo.
- **Arquivos prováveis:** `scripts/letterboxdCsv.ts`, `scripts/letterboxdCsv.test.ts`
- **Verificação:** `npx vitest run scripts/letterboxdCsv.test.ts` (exit 0); `git grep -n -E "netlify/|sortDiary" -- scripts/letterboxdCsv.ts` (exit 1); `npm run verify` (exit 0)

### T2.3 Importador offline, aditivo e com ensaio (TD-009)
- **Requisito:** FR-012 · **Prioridade:** P1 · **Estimativa:** 4 h · **Dependências:** T2.2, T1.2
- **Trabalho:** reescrever `scripts/importLetterboxd.mjs` (sem `.env`, sem `--tmdb`, sem rede) e criar `scripts/shelfWriter.ts`. Pasta de entrada padrão `letterboxd-export/`; **ensaio por padrão** (imprime o que faria) e `--escrever` grava. Aditivo e idempotente: lê o `films.content.ts` atual, mantém todo item existente intocado, acrescenta só os novos (chave `letterboxdUri`, senão título + ano + mês) e **relata** a diferença de nota de item existente. Filme só em `watched.csv` entra **sem `assistidoEm`**. **Nunca escreve `resenha`**: o texto vai para `letterboxd-export/resenhas-pendentes.md` por `slug`. `slug` sem acento com ano, colisão `-2`, `-3`, imutável. Ordem: ano e mês decrescentes e, dentro do mês, o dia do CSV decrescente. Título com colchetes entra e o relatório avisa sobre `colchetesPermitidos`. `editadoEm` = dia da importação (ou `--data`). Valida com `validateAll` **antes** de gravar e recusa gravar com erro; formata com a API do `prettier` na configuração do projeto. Checa Node 22.18 ou superior e sai com código 2 e mensagem clara.
- **Testes:** `scripts/importLetterboxd.test.ts` (em pasta temporária do scratchpad, nunca no repositório): ensaio não grava; `--escrever` grava e valida; reimportar o mesmo CSV não muda o arquivo (idempotente); item existente editado à mão não é alterado; nota 3,7 recusada e listada; `watched.csv` sem data; resenha vai ao relatório e não ao arquivo; saída sem `tmdbId`; saída passa em `prettier --check`; Node antigo simulado sai com código 2.
- **Critérios de aceitação:** o `films.content.ts` gerado passa no schema; nenhum campo fora do schema; `npm run personal:import-letterboxd` continua existindo, `personal:probe` ainda existe (sai na T4.1).
- **Arquivos prováveis:** `scripts/importLetterboxd.mjs`, `scripts/shelfWriter.ts`, `scripts/importLetterboxd.test.ts`, `package.json` (só se o nome do script mudar)
- **Verificação:** `npx vitest run scripts/importLetterboxd.test.ts scripts/letterboxdCsv.test.ts` (exit 0); `node scripts/importLetterboxd.mjs --ajuda` (exit 0, mostra o ensaio como padrão); `npm run verify` (exit 0)

### T2.4 Garantia de "sem rede" no importador (FR-003, NFR-002)
- **Requisito:** FR-003, FR-012, NFR-002 · **Prioridade:** P1 · **Estimativa:** 2 h · **Dependências:** T2.3
- **Trabalho:** teste estático que falha se `scripts/importLetterboxd.mjs`, `scripts/letterboxdCsv.ts` ou `scripts/shelfWriter.ts` contiverem `fetch(`, `node:http`, `node:https`, `node:net`, `undici` ou `XMLHttpRequest`, e se algum arquivo de `src/` importar algo desses três arquivos. Provar o teste com um trecho plantado (e desfeito).
- **Testes:** `scripts/importerOffline.test.ts`.
- **Critérios de aceitação:** o teste reprova o trecho plantado; passa sem ele; o importador não aparece em nenhum chunk do navegador.
- **Arquivos prováveis:** `scripts/importerOffline.test.ts`
- **Verificação:** `npx vitest run scripts/importerOffline.test.ts` (exit 0); `npm run verify` (exit 0)

---

## Fase 3: Onda 2, reescreve e remove juntas
Cada tarefa mantém o `/pessoal` funcionando (com as prateleiras vazias a página mostra o estado vazio) e o `verify` verde. Componente novo nasce ao lado do antigo quando o antigo ainda tem consumidor; o antigo sai **na tarefa em que o último consumidor sai**.

### T3.1 `RatingStars` em SVG, `Cover` e mapeamento de tons por CSS (TD-004, TD-010, Q-D6)
- **Requisito:** FR-006, FR-007, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.3
- **Trabalho:** `RatingStars` com 5 estrelas SVG (cheia, meia, vazia por `clipPath`), `role="img"` e `aria-label` "nota 4,5 de 5" / "rating 4.5 out of 5", número visível ao lado, **sem nota nada é renderizado** (a chave `rating.none` deixa de ser usada). `Cover` (bloco tipográfico 2:3, `data-tone`, `aria-hidden`; ou `<img>` local com `alt`, `width`, `height`; legenda de atribuição quando `autoria.tipo = terceiros`; **sem `srcSet` do TMDB, sem `onError`, sem URL externa**). Mapeamento dos 6 tons claros para os 4 escuros **em CSS**, no arquivo da página (`personal.css`), **sem tocar** em `tokens.css` nem em outra coisa da 002; registrar no `evidence.md` quais pares dividem o mesmo escuro. Se `RatingStars` antigo tiver consumidores com outra assinatura, ajustar esses consumidores na mesma tarefa (eles saem em T3.3 e T3.4); conferir com `grep` antes.
- **Testes:** `RatingStars.test.tsx` (4,5 em PT e EN; 0,5; 5; sem nota nada; nunca "0"); `Cover.test.tsx` (tom do item; tom por `slug` estável; foto com `alt` e dimensões; terceiros com legenda; bloco `aria-hidden`); extensão de `src/styles/contrast.test.ts` para o par texto/tom e borda/página nos dois temas, com os 6 tons.
- **Critérios de aceitação:** contraste do texto ≥ 13 (claro) e ≥ 6,6 (escuro) sobre todo tom, conforme as tabelas da 002; `tokens.css` sem diff.
- **Arquivos prováveis:** `src/components/personal/{RatingStars,Cover}.tsx` e testes, `src/styles/personal.css`, `src/styles/contrast.test.ts`
- **Verificação:** `npx vitest run src/components/personal/RatingStars.test.tsx src/components/personal/Cover.test.tsx src/styles/contrast.test.ts` (exit 0); `git diff --stat -- src/styles/tokens.css` (vazio); `npm run verify` (exit 0)

### T3.2 `i18n/personal.ts` e blocos da prateleira: `YearGroup`, `ShelfTotals`, `ShelfFooter`, `EmptyShelf` (TD-006, TD-007, TD-008, TD-015)
- **Requisito:** FR-008, FR-009, FR-010, FR-014, FR-015, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.3, T3.1
- **Trabalho:** acrescentar as chaves novas em `src/i18n/personal.ts` (PT e EN: "itens registrados"/"items logged", "atualizado em", "sem data", "ordem dentro do mesmo mês não é registrada", estados do livro, "lendo desde", estado vazio); **as chaves de API só saem na T3.9** (ainda têm consumidor). Componentes: `YearGroup` (`<details>` com `<summary>` "2024 · 37 itens", mais recente com `open`, nota de ordem indeterminada), `ShelfTotals` (rótulo "itens registrados" enquanto `historicoCompleto` for `false`; "N filmes/livros" quando `true`; média com a contagem de itens com nota; sem nota a média some), `ShelfFooter` ("Atualizado em" a partir de `latestEdit` e link `perfil` com `rel="noopener noreferrer"`; sem data quando não há itens), `EmptyShelf`.
- **Testes:** um teste por componente, em PT e EN; `personal.test.ts` (paridade) passa; `<summary>` alcançável por teclado; texto do estado do livro em texto, nunca só cor; sem `dangerouslySetInnerHTML` no diretório (`git grep`).
- **Critérios de aceitação:** `ShelfTotals` e `ShelfFooter` não leem o relógio; o rodapé sem `perfil` não mostra link vazio.
- **Arquivos prováveis:** `src/i18n/personal.ts`, `src/components/personal/{YearGroup,ShelfTotals,ShelfFooter,EmptyShelf}.tsx` e testes
- **Verificação:** `npx vitest run src/i18n/personal.test.ts src/components/personal/YearGroup.test.tsx src/components/personal/ShelfTotals.test.tsx src/components/personal/ShelfFooter.test.tsx src/components/personal/EmptyShelf.test.tsx` (exit 0); `git grep -n "dangerouslySetInnerHTML" -- src/components/personal src/pages/personal` (exit 1); `npm run verify` (exit 0)

### T3.3 Página de filmes: `FilmRow`, `Films.tsx` e remoção do diário antigo (TD-001, TD-006, TD-011)
- **Requisito:** FR-003, FR-004, FR-009, FR-010, FR-013, FR-015 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.2
- **Trabalho:** `FilmRow` (título, ano, data por `formatDate`, estrelas, resenha inteira; sem nota mostra só o título). `src/pages/personal/Films.tsx` lê `films.content.ts` direto, agrupa por ano com `YearGroup`, usa `ShelfTotals`, `ShelfFooter` e `EmptyShelf`; sem estado assíncrono. O `perfil` do conteúdo recebe o valor hoje em `src/data/personal/profiles.ts` **somente se a Duda o informou (PEND-002)**; sem informação, fica ausente. **Remove, no mesmo passo:** `FilmsDiary`, `DiaryEntry`, `FilmPoster` e os testes deles (e `ReviewBlock`/`StatTile` se o `grep` mostrar sem consumidor). `grep` de importadores antes e depois no `evidence.md`.
- **Testes:** `Films.test.tsx` (3 estados: vazio; poucos itens; um ano fechado com o texto no HTML); `FilmRow.test.tsx`; `pages` e `films` antigos reescritos ou removidos um a um; rota `/en/personal/films` com texto em inglês.
- **Critérios de aceitação:** nenhum `fetch`, nenhuma URL externa na página além do `perfil`; sem `usePersonalFilms` na página.
- **Arquivos prováveis:** `src/pages/personal/Films.tsx`, `src/components/personal/FilmRow.tsx` e testes; removidos conforme o `grep`
- **Verificação:** `npx vitest run src/pages/personal src/components/personal` (exit 0); `git grep -n -E "FilmsDiary|DiaryEntry|FilmPoster|usePersonalFilms" -- src` (exit 1); `npm run verify` (exit 0)

### T3.4 Página de livros: `BookRow`, `Books.tsx` e remoção das estantes antigas (TD-001, TD-003, TD-011)
- **Requisito:** FR-003, FR-005, FR-009, FR-010, FR-013, FR-015 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.3
- **Trabalho:** `BookRow` (título, autores, estado em texto, "lendo desde mmm/aaaa", `lidoEm`, estrelas só quando há nota, resenha inteira) e `Books.tsx` com `bookCounts`, agrupamento por ano de `lidoEm` e grupo "Sem data". **Remove, no mesmo passo:** `BooksShelves`, `BookCard`, `ShelfGrid`, `CoverFigure` e testes (conferir com `grep`; `profiles.ts` só sai na T3.9).
- **Testes:** `Books.test.tsx` e `BookRow.test.tsx`: vazio; `lendo` com a data; `quero-ler` sem estrelas; `abandonado` com texto; PT e EN.
- **Critérios de aceitação:** nenhum livro sem nota mostra "0" nem "sem nota" como valor falso; sem `usePersonalBooks`.
- **Arquivos prováveis:** `src/pages/personal/Books.tsx`, `src/components/personal/BookRow.tsx` e testes; removidos conforme o `grep`
- **Verificação:** `npx vitest run src/pages/personal src/components/personal` (exit 0); `git grep -n -E "BooksShelves|BookCard|ShelfGrid|CoverFigure|usePersonalBooks" -- src` (exit 1); `npm run verify` (exit 0)

### T3.5 `routeStatus` sem `mock` nem `integrated`, hub reescrito (TD-013)
- **Requisito:** FR-010, FR-013 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.4
- **Trabalho:** reescrever `src/data/routeStatus.ts`: `pessoal-filmes` é rascunho (`noindex`, fora do sitemap) com `films.itens` vazio; `pessoal-livros`, com `books.itens` vazio; `pessoal`, quando ambas vazias; `musica` e `teatro` seguem `musicHasContent`/`theaterHasContent`; saem `personalMode`, `integrated` e `showInNav` como regra. Reescrever `HubIndex` e `PersonalHub.tsx` (cartões de filmes e livros com os totais e o rótulo; "lendo agora: título, desde mmm/aaaa"). **Remove:** `src/data/personal/integrations.ts` (importado só por `routeStatus.ts`). Conferir que `Pessoal` continua o último item do menu (US-001, DQ-019 da 002) sem alterar `routes.ts`.
- **Testes:** `personalRoutes.test.tsx`, `personalDiscovery.test.tsx`, `routes.test.ts`, `seo.test.ts` ajustados à nova regra (vazio gera `noindex` e fica fora do sitemap; com itens publica); hub com 0, 1 e 2 prateleiras cheias.
- **Critérios de aceitação:** nenhum import de `services/integrations/mode` em `routeStatus.ts`; o sitemap gerado não lista a rota vazia.
- **Arquivos prováveis:** `src/data/routeStatus.ts`, `src/components/personal/HubIndex.tsx`, `src/pages/personal/PersonalHub.tsx` e testes
- **Verificação:** `npx vitest run src/data src/pages/personal src/components/personal` (exit 0); `git grep -n -E "personalMode|personal/integrations|integrated" -- src/data/routeStatus.ts src/components/personal` (exit 1); `npm run verify` (exit 0)

### T3.6 Música e teatro leem os arquivos direto, sem mudar o que mostram (TD-012, Q-D1)
- **Requisito:** FR-013 · **Prioridade:** P1 · **Estimativa:** 3 h · **Dependências:** T3.5
- **Trabalho:** `Music.tsx`, `Theater.tsx`, `MusicList`, `TheaterTimeline` passam a ler `music.ts` e `theater.ts`, sem `usePersonal*` e sem carregando/erro/vencido. **O que cada página mostra não muda** (listas hoje vazias seguem vazias, com o mesmo texto). Tipos `Album`, `TheaterVisit`, `Instrument` e afins ficam em `src/data/personal/types.ts` sem `provenance`. Os dados fictícios de `manual/mock.ts` **não** viram conteúdo. `music.ts` e `theater.ts` perdem só o comentário sobre `provenance`.
- **Testes:** `Music` e `Theater` com os mesmos textos e estados de antes (capturar antes e comparar); sem `SourceBadge`/`PlaceholderBadge`.
- **Critérios de aceitação:** o HTML pré-renderizado de `/pessoal/musica` e `/pessoal/teatro` **não muda** em texto visível (comparar a saída do `build` antes e depois, no `evidence.md`); `git grep usePersonal` em `Music|Theater|MusicList|TheaterTimeline` vazio.
- **Arquivos prováveis:** `src/pages/personal/{Music,Theater}.tsx`, `src/components/personal/{MusicList,TheaterTimeline}.tsx`, `src/data/personal/{types,music,theater}.ts` e testes
- **Verificação:** `npx vitest run src/pages/personal src/components/personal src/data/personal` (exit 0); `git grep -n "usePersonal" -- src/pages/personal src/components/personal` (exit 1); `npm run verify` (exit 0)

### T3.7 Terminal: comando `pessoal` lê o conteúdo (TD-012, Q-D1)
- **Requisito:** FR-013 · **Prioridade:** P1 · **Estimativa:** 2 h · **Dependências:** T3.5, T3.6
- **Trabalho:** `src/terminal/extras/personalView.tsx` (e `personal.tsx`, se preciso) passa a ler `films.content.ts` e `books.content.ts`, sem `usePersonal*`, `PlaceholderBadge` nem `i18n/personal.ts` de API; mostra "-" ou estado vazio como hoje. **Só isso:** nenhum outro comando do terminal muda (a spec 009 é a dona).
- **Testes:** `personal.test.tsx` do terminal ajustado: saída do comando `pessoal` com prateleiras vazias igual à anterior; com um item de teste lido do conteúdo.
- **Critérios de aceitação:** nenhuma outra mudança em `src/terminal/` além desses dois arquivos e do teste (conferir com `git diff --stat`).
- **Arquivos prováveis:** `src/terminal/extras/{personalView,personal}.tsx`, `personal.test.tsx`
- **Verificação:** `npx vitest run src/terminal` (exit 0); `git grep -n -E "usePersonal|PlaceholderBadge" -- src/terminal` (exit 1); `git diff --stat -- src/terminal` (só os arquivos acima); `npm run verify` (exit 0)

### T3.8 Remove o hook, as integrações e os selos de fonte (TD-011, onda 2)
- **Requisito:** FR-003, FR-013, NFR-002 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.3 a T3.7
- **Trabalho:** com o `grep` de importadores vazio fora do que sai, remover: `src/hooks/usePersonal.ts` e `.test.tsx`; `src/services/integrations/**` (hardcover, letterboxd, tmdb, `manual`, `mode.ts`, `parseMode.ts`, `source.ts`, `types.ts`, `integrations.test.ts`); `FeedState`, `StaleNotice`, `SourceBadge`, `PlaceholderBadge`, `AttributionFooter`, `States` (`Loading`, `ErrorState`) e os testes `badges` e `qa` de `src/components/personal/`; do `.env.example`, a variável `VITE_PERSONAL_SOURCE` e o ajuste de `scripts/envExample.test.ts` (as demais variáveis de API saem na T5.1, porque o importador antigo ainda lê `TMDB_API_KEY`).
- **Testes:** os testes removidos saem com o código; `envExample.test.ts` ajustado; nenhum teste órfão.
- **Critérios de aceitação:** o `grep` por importadores, colado antes, só lista arquivos removidos aqui; `typecheck` limpo; nenhum `process.env`/`import.meta.env` de `PERSONAL` em `src/`.
- **Arquivos prováveis:** removidos conforme a lista da seção A e B do `design.md`; `.env.example`, `scripts/envExample.test.ts`
- **Verificação:** `git grep -n -E "usePersonal|services/integrations|FeedState|StaleNotice|SourceBadge|PlaceholderBadge|AttributionFooter|VITE_PERSONAL_SOURCE" -- src scripts e2e vite.config.ts .env.example` (exit 1); `npx tsc --noEmit` (exit 0); `npm run verify` (exit 0)

### T3.9 Remove o `personalGuard`, funções e chaves de API, e reduz tipos (TD-005, TD-011, onda 2)
- **Requisito:** FR-011, FR-013 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.8, T1.1
- **Trabalho:** remover `scripts/personalGuard.ts` e `.test.ts` e, em `vite.config.ts`, o import e `personalGuardPlugin()` (a garantia agora é `markerProblem` + `contentGuard`; provar que um `[x]` plantado em conteúdo derruba o `build`); remover `src/data/personal/{stats.ts,highlights.ts,review.ts}` e testes (funções ainda usadas por música e teatro migram para onde tiver dono; função sem importador sai por lint), `profiles.ts` se ficar vazio, e os tipos de API de `types.ts` (`Book`, `FilmDiaryEntry`, `FilmMeta`, `Provenance`, `PersonalFeed`, `Source`, `Rating`, `ReadingStats`, `FilmStats`); chaves de API de `src/i18n/personal.ts` (`placeholder`, `state`, `stale`, `rating.none`, `films.stats.liked/rewatches`, `films.entryLink`, `review.more`, atribuição do rodapé) e `usePersonalText.ts` se ficar sem uso; nomes `VITE_PERSONAL_SOURCE`/`HARDCOVER_API_TOKEN` nas fixtures de `secretScan.test.ts` e `secretGuard.test.ts` trocados por nomes neutros.
- **Testes:** `personal.test.ts` (paridade) continua passando; teste novo de build: um conteúdo com `[PREENCHER]` plantado faz o `contentGuard` falhar (e é desfeito).
- **Critérios de aceitação:** `vite.config.ts` sem `personalGuard`; sem chave de i18n sem uso (o teste de i18n da 001 prova); `npm run verify` verde.
- **Arquivos prováveis:** `vite.config.ts`, `scripts/personalGuard.*` (removidos), `src/data/personal/*`, `src/i18n/personal.ts`, `scripts/secretScan.test.ts`, `scripts/secretGuard.test.ts`
- **Verificação:** `git grep -n -E "personalGuard|HARDCOVER_API_TOKEN|VITE_PERSONAL_SOURCE" -- src scripts vite.config.ts` (exit 1); `npx vitest run src/i18n scripts/secretScan.test.ts scripts/secretGuard.test.ts src/content` (exit 0); `npm run verify` (exit 0)

### T3.10 `personal.css` reescrito com os tokens da 002
- **Requisito:** FR-007, NFR-003 · **Prioridade:** P1 · **Estimativa:** 3 h · **Dependências:** T3.9
- **Trabalho:** reescrever `src/styles/personal.css` (577 linhas, classes `pe-*` da identidade antiga) só com tokens da 002, sem hex fora de `tokens.css`, sem `gradient(`, com foco visível e movimento reduzido; remover as classes dos componentes removidos (varredura por classe usada em `src/`).
- **Testes:** `styles.test.ts` e `contrast.test.ts` da 002 passam sem isenção nova; teste de CSS sem seletor órfão da `pe-*` removida.
- **Critérios de aceitação:** nenhuma isenção nova em `styles.test.ts`; sem rolagem horizontal a 320 px (conferida em T6.4).
- **Arquivos prováveis:** `src/styles/personal.css`
- **Verificação:** `npx vitest run src/styles` (exit 0); `git grep -n -E "#[0-9a-fA-F]{3,8}\b|gradient\(" -- src/styles/personal.css` (exit 1); `npm run verify` (exit 0)

---

## Fase 4: Onda 3a, remove o servidor que não depende do importador
### T4.1 Remove Functions, `books.ts`, `films.ts`, `hardcover.ts` e a sonda (TD-011, onda 3)
- **Requisito:** FR-003, FR-013 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T3.9
- **Trabalho:** com o `grep` de importadores colado antes, remover `netlify/functions/personal-books.mts` e `personal-films.mts`; `netlify/personal/{books,films,hardcover}.ts` e os testes `{books,films,hardcover,qa}.test.ts`; `scripts/hardcoverProbe.mjs`, `hardcoverProbe.test.ts` e o script `personal:probe` do `package.json`. **Ficam, por ainda serem usados pelo importador antigo:** `netlify/personal/{letterboxd,letterboxdCsv,tmdb,cache}.ts`, seus testes, a fixture de RSS, `data/letterboxd-history.json`, `@netlify/blobs` e o bloco `[functions]`.
- **Testes:** os testes removidos saem; `headers.test.ts` e `envExample.test.ts` continuam passando.
- **Critérios de aceitação:** o `grep` prova que nada fora do conjunto removido importa os arquivos; `importLetterboxd.mjs` antigo ainda executa o `--ajuda` (nada que ele importa saiu).
- **Arquivos prováveis:** os listados; `package.json`
- **Verificação:** `git grep -n -E "personal-books|personal-films|hardcover|personal:probe" -- src scripts netlify package.json netlify.toml` (só dentro de `netlify/personal/letterboxd*.ts`/`tmdb.ts`/`cache.ts` se citarem, ou exit 1; listar no `evidence.md`); `npx tsc --noEmit` (exit 0); `npm run verify` (exit 0)

---

## Fase 5: Onda 3b, depois do importador novo
### T5.1 BLOQUEADA INDIRETAMENTE: remove o resto de `netlify/`, `@netlify/blobs`, `[functions]` e as variáveis (TD-011, onda 3, Q-001)
- **Requisito:** FR-003, FR-013, NFR-002 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.3, T2.4, T4.1 (portanto também **PEND-001**)
- **Trabalho:** só depois de o `scripts/importLetterboxd.mjs` novo não importar mais nada de `netlify/` (conferir por `grep`), remover `netlify/personal/` inteiro (`letterboxd.ts`, `letterboxdCsv.ts` e `.test.ts`, `tmdb.ts`, `cache.ts`, `qa` já saiu, `letterboxd.test.ts`, `tmdb.test.ts`, `cache.test.ts`, `fixtures/letterboxd-rss.xml`, `data/letterboxd-history.json`) e `netlify/functions/`; **`netlify/` inteiro some se nada mais existir lá** (conferir); `@netlify/blobs` do `package.json` e do `package-lock.json` (por `npm uninstall`, sem editar o lock à mão); o bloco `[functions]` do `netlify.toml` (comentário de `headers.test.ts` ajustado); do `.env.example`, `HARDCOVER_API_TOKEN`, `HARDCOVER_USERNAME`, `TMDB_API_KEY`, `LETTERBOXD_USERNAME`, `PERSONAL_HARDCOVER_TTL_MIN`, `PERSONAL_LETTERBOXD_TTL_MIN`, `PERSONAL_REFRESH_SECRET`, `PERSONAL_BUILD_HOOK_URL` e a seção "Espaço cultural" (ficam só as 3 do EmailJS); `envExample.test.ts` passa a conferir só as 3.
- **Testes:** `envExample.test.ts`, `headers.test.ts` e `netlifyToml` (se existir) ajustados; o `build` não precisa de nenhuma variável de API.
- **Critérios de aceitação:** o `grep` do V-10 sai sem linhas; `npm ls @netlify/blobs` não encontra o pacote; o build funciona com o ambiente sem as variáveis de API.
- **Arquivos prováveis:** removidos conforme a seção A e D do `design.md`; `package.json`, `package-lock.json`, `netlify.toml`, `.env.example`, `scripts/envExample.test.ts`, `scripts/headers.test.ts`
- **Verificação:** `git grep -n -i -E "hardcover|tmdb|usePersonal|personalMode|netlify/blobs|netlify/personal" -- src scripts netlify.toml package.json .env.example vite.config.ts` (**exit 1, sem linhas**); `npm ls @netlify/blobs` (exit 1); `npm run verify` (exit 0)

### T5.2 Emenda do Anexo B da 001 e do `tech-stack.md` (Q-D9, R-008)
- **Requisito:** FR-013 · **Prioridade:** P2 · **Estimativa:** 1 h · **Dependências:** T5.1 (T4.1 não basta: as Functions só somem de fato na T5.1)
- **Trabalho:** **autorizada pela Duda em 2026-11-19, com emenda visível.** Em `.ai/sdd/specs/001-engineering-baseline/design.anexo-fora-do-mvp.md` (linhas 47 e 155 a 158) trocar "continuam até a 008" por "a 008 removeu", e em `.ai/steering/tech-stack.md` (item Netlify e a seção "Dados de filmes...") por "o site não tem Function". Cada arquivo ganha uma linha "Emenda 2026-11-19 (spec 008): ...". **Nenhuma outra linha** desses arquivos muda; o `.status` da 001 continua `review:done`. `docs/DEPLOY.md` **não é tocado** (é da Duda).
- **Testes:** nenhum de código; `git diff` do `evidence.md` mostra só as linhas citadas.
- **Critérios de aceitação:** diff mínimo e restrito; a emenda é visível no próprio arquivo.
- **Arquivos prováveis:** `.ai/sdd/specs/001-engineering-baseline/design.anexo-fora-do-mvp.md`, `.ai/steering/tech-stack.md`
- **Verificação:** `git diff --stat -- .ai/sdd/specs/001-engineering-baseline .ai/steering` (só os 2 arquivos); `git grep -n "Emenda 2026-11-19" -- .ai` (2 linhas, exit 0); `node scripts/status.mjs read 001-engineering-baseline` (continua `review:done`)

---

## Fase 6: Escala, acessibilidade e fechamento
### T6.1 Build de prova com a fixture de 500 e `checkDist` (TD-014, parte 2)
- **Requisito:** FR-014, NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.4, T3.4, T3.5
- **Trabalho:** no `build --mode prova` da 002, um alias do Vite troca `films.content.ts` e `books.content.ts` pela fixture **só nesse modo**, para `dist-prova/`; o `contentGuard` valida a fixture como valida o conteúdo; `scripts/checkDist.mjs` passa a falhar se `dist/` (publicado) contiver o texto-marca da fixture.
- **Testes:** `scripts/checkDist.test.ts`: `dist/` com o texto-marca planta falha, sem ele passa; teste do alias (o `build:prova` gera 500 títulos em `/pessoal/filmes`; o `build` normal, nenhum).
- **Critérios de aceitação:** `dist/` real sem `FIXTURE-500`; `dist-prova/` com a fixture; `src/content/` intacto.
- **Arquivos prováveis:** `vite.config.ts` (modo `prova`), `scripts/checkDist.mjs` e teste
- **Verificação:** `npm run build:prova` (exit 0); `node scripts/checkDist.mjs dist` (exit 0); `git grep -n -c "FIXTURE-500" -- dist` (exit 1, no `dist/` normal); `npm run verify` (exit 0)

### T6.2 HTML sem JavaScript com 500 itens (FR-015, V-12)
- **Requisito:** FR-014, FR-015 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T6.1
- **Trabalho:** teste sobre o HTML pré-renderizado de `dist-prova/`: contém os 500 títulos da fixture, o `<details>` do ano mais recente com `open`, os demais anos fechados mas presentes, `<html lang>` e `hreflang` corretos em PT e EN; paridade de `i18n/personal.ts`.
- **Testes:** `scripts/prerender.test.ts` (extensão) ou `scripts/pessoalHtml.test.ts`, que roda sobre `dist-prova/` só se existir (ou o constrói em `beforeAll` dentro do orçamento).
- **Critérios de aceitação:** `grep -c` de `FIXTURE-500` em `dist-prova/pessoal/filmes/index.html` = 500; sem `<script>` necessário para ver a lista.
- **Arquivos prováveis:** `scripts/pessoalHtml.test.ts`
- **Verificação:** `npx vitest run scripts/pessoalHtml.test.ts src/i18n/personal.test.ts` (exit 0); `npm run verify` (exit 0)

### T6.3 Medição com 500 itens: tamanho, LCP, INP e CLS (TD-014, NFR-001)
- **Requisito:** FR-014, NFR-001 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T6.1, T6.2, T3.10
- **Trabalho:** medir e registrar no `evidence.md` (pior valor de 3 rodadas): (1) `validateAll` com a fixture ≤ 5 s; (2) tamanho do HTML de `/pessoal/filmes` e `/pessoal/livros` (bruto e gzip); (3) gzip do chunk de cada rota e do hub; (4) LCP, INP (abrir um `<details>`) e CLS em celular médio com `lighthouseRun.mjs` e `inpRun.mjs` apontados para `dist-prova`; (5) quanto os testes novos somam na suíte (≤ 90 s) e o tempo do `verify` (≤ 180 s). Limites: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. **Se algum falhar, parar e voltar à Duda** (resumo gerado no build para o hub, ou dividir por década); não aumentar limite nem inventar medida.
- **Testes:** os scripts da 002; nada novo entra no `verify` além do já criado.
- **Critérios de aceitação:** as 5 medidas com comando, exit code e valor; veredito por limite.
- **Arquivos prováveis:** `.ai/sdd/specs/008-films-and-books/evidence.md`
- **Verificação:** `npm run prova` (exit 0, mostrando as medidas; a medição no Chrome depende da máquina da Duda, como na 002); `npm run verify` (exit 0, tempos no `evidence.md`)

### T6.4 Acessibilidade e teclado das três páginas (NFR-003, FR-015)
- **Requisito:** NFR-003, FR-015, FR-012 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.10, T6.1
- **Trabalho:** estender o e2e e o axe da 002 às 3 páginas, PT e EN, claro e escuro, sobre `dist-prova` e sobre `dist`: axe sem violação; abrir e fechar `<details>` por teclado com foco visível; sem rolagem horizontal a 320 px; Lighthouse ≥ 95 em acessibilidade, SEO e boas práticas em `/pessoal`, `/pessoal/filmes`, `/pessoal/livros`.
- **Testes:** `e2e/personal.e2e.ts`.
- **Critérios de aceitação:** zero violação do axe; foco visível no `<summary>`; Lighthouse ≥ 95.
- **Arquivos prováveis:** `e2e/personal.e2e.ts`, `scripts/axeRun.mjs` (se for preciso incluir as rotas)
- **Verificação:** `npx playwright test --project=shell` (exit 0); `node scripts/lighthouseRun.mjs` (exit 0, notas no `evidence.md`); `npm run verify` (exit 0)

### T6.5 Varredura final, `evidence.md` e fechamento (V-10, FR-003, FR-013)
- **Requisito:** FR-003, FR-013, NFR-002 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T5.1, T5.2, T6.3, T6.4
- **Trabalho:** rodar a varredura de resíduos do V-10; o teste do HTML sem URL externa além de `perfil` nas 3 páginas (V-03) e o de `.env.example`; conferir que `dist/` não tem a fixture; resumo de cada requisito com a tarefa e a evidência; listar o que ficou aberto (importador sem export real, `perfil`, `historicoCompleto`). Atualizar o painel `INDEX.md` **só com o texto**; a promoção de `.status` é da Duda.
- **Testes:** `scripts/pessoalExternal.test.ts` (varre o HTML pré-renderizado de `/pessoal`, `/pessoal/filmes`, `/pessoal/livros` atrás de `src=`/`href=` externos que não sejam o `perfil`).
- **Critérios de aceitação:** todo FR com evidência; nenhum resíduo; `verify` verde.
- **Arquivos prováveis:** `scripts/pessoalExternal.test.ts`, `.ai/sdd/specs/008-films-and-books/evidence.md`
- **Verificação:** `git grep -n -i -E "hardcover|tmdb|usePersonal|personalMode|netlify/blobs|netlify/personal" -- src scripts netlify.toml package.json .env.example vite.config.ts` (exit 1); `npx vitest run scripts/pessoalExternal.test.ts scripts/envExample.test.ts` (exit 0); `npm run verify` (exit 0)

---

## Formato do bloco de evidência
```
### T<n.m> <título>
- Claim: <o que se afirma>
- Command: <comando exato>
- Exit code: <n>
- Summary: <resultado em poucas linhas; para remoção, o grep de importadores antes e depois>
- Verdict: PASS | FAIL | PASS com ressalva
```

## Ação da Duda (fora do repositório e da contagem de horas)
| ID | Ação | Quando | Bloqueia |
| --- | --- | --- | --- |
| PEND-001 | Exportar o Letterboxd e descompactar em `letterboxd-export/` (`diary.csv`; `reviews.csv`, `watched.csv` e `ratings.csv` se existirem) | quando puder | **T2.1 e, por cadeia, T2.2, T2.3, T2.4, T5.1, T5.2 e T6.5** |
| PEND-002 | Informar o link de perfil do Letterboxd e do livro-fonte (os valores de hoje em `profiles.ts` precisam da sua confirmação) | antes da T3.3 | `perfil` no conteúdo (opcional; sem isso o rodapé não mostra link) |
| PEND-003 | Aprovar este `tasks.md` (`tasks:approved`) | antes de qualquer código | tudo |
| PEND-004 | Medição no Chrome da máquina dela, se o ambiente do implementador não tiver (como na 002) | T6.3 e T6.4 | veredito de NFR-001 |
| PEND-005 | **Apagar no painel do Netlify** as variáveis de API (`HARDCOVER_API_TOKEN`, `HARDCOVER_USERNAME`, `TMDB_API_KEY`, `LETTERBOXD_USERNAME`, `PERSONAL_HARDCOVER_TTL_MIN`, `PERSONAL_LETTERBOXD_TTL_MIN`, `PERSONAL_REFRESH_SECRET`, `PERSONAL_BUILD_HOOK_URL`, `VITE_PERSONAL_SOURCE`) e o gancho de build associado, **depois** do deploy da 008 | depois do deploy | nada no repositório |
| PEND-006 | Ligar `historicoCompleto: true` só quando o histórico estiver completo | quando for verdade | rótulo "itens registrados" |
| PEND-007 | Traduzir as resenhas (PT e EN) a partir de `letterboxd-export/resenhas-pendentes.md` e conferir os itens importados | depois da T2.3 | conteúdo publicado |
| PEND-008 | Decidir os `slug` de títulos com colchetes (`colchetesPermitidos`), como *[REC]* | depois da importação | `verify` do conteúdo |
| PEND-009 | `docs/DEPLOY.md` (local, ignorado pelo git) cita as variáveis: atualizar | depois do deploy | nada |
