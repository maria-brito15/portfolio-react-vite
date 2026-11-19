# 005 Projects catalog, Tasks
**Status:** draft (aguarda a Duda; ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada), `design.md` v0.1 (`design:approved` em 2026-11-19, com a seção "Decisões da Duda (2026-11-19)": DQ-001 a DQ-011 aceitas), `003-content-migration/design.md` (campos reais do projeto), `002/tasks.md` e `001/tasks.md` (formato).
**Estimativa total:** 23 tarefas, **73 h** (1 a 4 h cada), em 6 fases (0 a 5). 3 tarefas são **bloqueadas por conteúdo da Duda** (T3.1, T3.2, T3.3; ver Fase 3) e seguram a Fase 4 inteira. A "Ação da Duda" está no fim.

## Como ler
- **Testes ficam dentro de cada tarefa.** Não há fase de testes separada.
- **Bloco de evidência** no fechamento de toda tarefa (conventions.md), em `evidence.md` nesta pasta, neste formato:
  ```
  ### Tx.y <título>
  - Claim: <o que se afirma>
  - Command: <comando exato>
  - Exit code: <número>
  - Summary: <o que a saída mostrou, em 1 a 3 linhas>
  - Verdict: PASS | FAIL | PASS com ressalva (qual)
  ```
- **Gate de cada tarefa:** `npm run verify` com exit 0 no fim (formatação, lint sem avisos, tipos, testes, geração). Nenhuma tarefa deixa o repositório quebrado.
- **Commits** em português, `tipo(escopo): resumo`, citando o ID da tarefa, terminando com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. **Nenhuma tarefa inclui `git push`**; nada vai para a `main`.
- **Orçamento da 001:** suíte ≤ 90 s, `verify` ≤ 180 s. Nunca duas execuções de vitest ao mesmo tempo.
- **Texto que a Duda não aprovou não entra** em arquivo de conteúdo nem em `ui.ts` (AGENTS.md: nada de dado inventado). Os testes de código usam fixture marcada como exemplo em `src/content/__fixtures__/` (001), nunca dado dela (R-005).
- **Tarefa "bloqueada por conteúdo da Duda":** o implementador **não começa e não preenche**; pede o texto à Duda, registra a data e a mensagem dela no `evidence.md` e só então executa. As frases do mockup (`Projetos.dc.html`) e as propostas do design aparecem **só como PROPOSTA marcada** nesta tarefa; viram conteúdo apenas depois de aprovadas por ela, texto a texto.
- **O código novo substitui o antigo no lugar** (P-Q-001, TD-014): a remoção está na tarefa T4.5, no mesmo passo em que a rota nova assume (T4.4).
- **Windows:** arquivos com barra invertida, crases ou `\uXXXX` vão pelo Write, não por heredoc. **`src.zip` é da Duda:** nenhuma tarefa o toca. **`public/cases/**` fica no disco** (DQ-011).
- **Specs 006 (estudo de caso), 008 (pessoal), 009, 010:** intocáveis. `src/data/projects.tsx` e `src/utils/projectDate.ts` ficam (têm consumidores de outras specs).

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados | OK: `requirements.md` v1.0, Q-001 a Q-006 respondidas (2026-11-19) |
| Design aprovado | OK: `design:approved` em 2026-11-19 (`.status`); DQ-001 a DQ-011 aceitas e registradas no `design.md` |
| Todo Must Have coberto | OK: FR-001 a FR-015 e NFR-001 a NFR-003 na tabela Coverage; nenhum FR sem tarefa |
| Todo Q-* e DQ-* respondido | OK. Pendentes **de conteúdo** (não de decisão): nomes EN dos critérios, descrições dos critérios e regra, 6 frases PT/EN, papel/equipe/estado/demonstração que ela quiser mostrar, `h1` e introdução de `/projetos` (T3.1 a T3.3) |
| Toda tarefa tem dependência, critério e verificação | OK (ver cada tarefa) |
| **Gate externo G0: spec 003 implementada e fechada** | **PENDENTE.** `.status` da 003 é `design:approved` (sem `tasks.md`). A 005 lê `src/content/projects.content.ts` e edita `registry.ts` (R-007). **Nenhuma tarefa daqui começa antes de G0.** A T0.1 confere: `projects.content.ts` existe e `validateAll` passa |
| Contrato da 003 diferente do suposto | **Já divergente** (R-004): na 003 `name` é `LocalizedText` (o design da 005 supôs texto simples) e o início é `start` (não `date`), `stack` é `TagSet`, `images` pode ter as 3 capturas do EcoShop (003 L-002). Só o adaptador `projectView.ts` (T1.7) absorve; o `design.md` ganha uma linha de correção na T0.1 (sem mudar decisão) |
| Spike obrigatório antes do resto | **T0.1** (R-002): rota-padrão de ponta a ponta com **um** detalhe e a medição real da entrada. Se inviável: voltar à alternativa (a) do TD-003 e **parar para a Duda** (muda a T2.1 e o total) |
| Pontos que dependem de medição | 110 KB por página e entrada +≤ 0,5 KB (T0.1, T5.2, T5.3); CLS com `?stack=` (T5.3, R-003); INP dos filtros (T5.3). Se algum não couber, **parar e propor**; não editar número em silêncio |
| Estimativas de 4 h | T1.4, T2.1, T2.2, T4.1, T4.2, T4.3, T5.1 e T5.2 concentram risco; se estourar 4 h, **parar e avisar a Duda** antes de seguir |

## Coverage
| Requisito | Tarefas |
| --- | --- |
| FR-001 (lista por ano, nome, data, stack, frase) | T1.3, T3.2, T4.1 |
| FR-002 (ordem indeterminada marcada, estável) | T1.3, T4.1 |
| FR-003 (filtros E/OU, no endereço) | T1.4, T4.2 |
| FR-004 (estado vazio e anúncio) | T4.2, T5.1 |
| FR-005 (filtro pelo endereço, valor inválido ignorado) | T1.4, T4.2, T5.1 |
| FR-006 (detalhe: ficha, descrição, links, imagens, nota) | T3.2, T4.3 |
| FR-007 (endereço por idioma, troca leva ao mesmo projeto) | T2.1, T2.2, T4.4 |
| FR-008 (critérios e regra em conteúdo, nas duas páginas, mesmos para todos) | T1.1, T1.8, T3.1, T4.1, T4.3 |
| FR-009 (média, 2 casas, estrelas na meia, texto alternativo) | T1.2, T1.6 |
| FR-010 (sem nota; parcial = sem nota; nunca 0) | T1.1, T1.2, T1.6 |
| FR-011 (capa: imagem própria ou bloco; sem imagem de terceiro) | T1.5 |
| FR-012 (links só se existem, `https`, sem rastreamento) | T1.1, T4.3, T5.1 |
| FR-013 (teclado, foco visível, estado sem depender de cor) | T4.2, T5.1 |
| FR-014 (conteúdo sem JavaScript; filtros aprimoramento) | T2.2, T4.1, T4.4 |
| FR-015 (rotas na tabela, catálogo no menu) | T2.1, T4.4 |
| NFR-001 (LCP, INP, CLS, 200 ms, orçamento de JS) | T0.1, T1.4 (50 de fixture), T5.2, T5.3 |
| NFR-002 (valor do endereço nunca vira marcação; sem terceiros) | T1.4, T4.2, T5.1 |
| NFR-003 (acessibilidade, axe, 390 px) | T1.6, T4.2, T5.1, T5.3 |
| TD-014 (substituição e remoção) | T4.5 |
| Conteúdo da Duda (DQ-004, DQ-005, DQ-002) | T3.1, T3.2, T3.3 |

---

## Fase 0: Gate e spike
### T0.1 Spike da rota-padrão e medição da entrada (TD-003, R-002)
- **Requisito:** FR-007, FR-015, NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** **G0 (003 fechada)**
- **Trabalho:** em clone/pasta do scratchpad (nada commitado como produto), com **um** detalhe fictício: (1) `pattern: true` na tabela e `findPageByPath` casando `/projetos/<id>`; (2) `prerenderPaths()` gerando `projetos/<id>.html` e `en/projects/<id>.html`; (3) `serveDist` servindo os dois e devolvendo 404 para id desconhecido; (4) **medir** o chunk de entrada antes e depois (gzip) para confirmar o orçamento de +0,5 KB e quanto sobra para a página dentro de 110 KB; (5) listar todos os consumidores da tabela de rotas (menu, `suggestRoutes`, terminal `ls`/`cd`, paleta, `legacyHashes`) que precisam pular `pattern`; (6) conferir os campos reais de `projects.content.ts` contra o "Contrato esperado da 003" e anotar as diferenças.
- **Testes:** o próprio spike; nada entra no `verify`.
- **Critérios de aceitação:** `spike-001.md` nesta pasta com as 6 respostas, os números medidos e o veredito **viável / viável com ressalva / inviável**. Inviável ou entrada > +0,5 KB: **parar e voltar à Duda** (alternativa (a) do TD-003 ou revisão do número). Uma linha de correção no `design.md` (campos reais da 003), sem mudar decisão.
- **Arquivos prováveis:** `.ai/sdd/specs/005-projects-catalog/spike-001.md`, `design.md` (1 linha)
- **Verificação:** `test -f .ai/sdd/specs/005-projects-catalog/spike-001.md` (exit 0); `grep -n -E "viável|inviável" .ai/sdd/specs/005-projects-catalog/spike-001.md` mostra o veredito; `git status --short` só com `spike-001.md`, `design.md`, `evidence.md`.

---

## Fase 1: Dados e lógica pura (sem conteúdo da Duda; fixture de exemplo)
### T1.1 Schemas da rubrica e da entrada do catálogo (TD-005, Data Model; V-08)
- **Requisito:** FR-008, FR-010, FR-012 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T0.1
- **Trabalho:** `src/content/schema/rubric.ts` (`criteria` com `id` kebab **único**, `label` e `description` `LocalizedText` completos, ao menos 1; `rule` `LocalizedText`; a escala vem de `RATING_*` da 001, não é campo) e `src/content/schema/projectCatalog.ts` com a fábrica `makeProjectCatalogSchema({ projectIds, criteriaIds })`: `id` existe nos projetos e todo projeto tem entrada; `summary` obrigatório, uma frase (sem quebra de linha, ≤ 200 caracteres); `role`, `team`, `status` opcionais (`LocalizedText`, texto livre, não enumeração); `demo` opcional só `https`; `scores` opcional, chaves só ids da rubrica, valores por `ratingProblem` (0, `null`, 4,3, texto recusados), cada chave pode faltar. Mensagens em PT com arquivo, campo e motivo. Fixtures de exemplo em `src/content/__fixtures__/`.
- **Testes:** `rubric.test.ts` e `projectCatalog.test.ts` (nota 0, 4,3, `null`, chave desconhecida, id inexistente, projeto sem entrada, id repetido, `summary` sem EN, com quebra de linha e com 240 caracteres, `demo` `http:` / `/rota` / `mailto:`, critério repetido; N = 1 e N = 5 aceitos pelo schema).
- **Critérios de aceitação:** cada linha da tabela do Data Model tem um caso que falha com a mensagem esperada; fixtures marcadas como exemplo; nenhum texto da Duda.
- **Arquivos prováveis:** `src/content/schema/rubric.ts`, `src/content/schema/projectCatalog.ts` e os `.test.ts`, `src/content/__fixtures__/*`
- **Verificação:** `npx vitest run src/content/schema/rubric.test.ts src/content/schema/projectCatalog.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.2 Nota em aritmética inteira (TD-006; V-07)
- **Requisito:** FR-009, FR-010 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:** `src/catalog/score.ts`: `projectScore(scores, criteria)` devolve `{ state: 'none'|'partial'|'complete', rated, total, centis?, halfStars? }` com `h = Σ(2·nota)`, `centis = floor((100h + N)/(2N))`, `halfStars = floor((2h + N)/(2N))` (empate sobe, DQ-008); só `complete` tem nota; `formatScore(centis, lang)` (`4,38` PT / `4.38` EN), `formatCriterion(value, lang)` (1 casa). N sempre `criteria.length`.
- **Testes:** `score.test.ts` em tabela: 4; 4,5; 4; 5 -> `438`, 9 meias, "4,38"; 4,25 -> `425` e 9 meias (empate sobe); 4,125 -> `413` e 8 meias; 0, 1, 2, 3 de 4 critérios -> `none`/`partial`, sem `centis` e sem estrela; **nunca** o texto "0"; N = 5 e N = 1 (o N vem do dado); todas as 10^4 combinações de 4 notas (passo 0,5) batem com uma referência escrita em racionais; sem `NaN`.
- **Critérios de aceitação:** a tabela da validação "entrada -> resultado" do requirements passa; zero ponto flutuante na função (`grep` abaixo).
- **Arquivos prováveis:** `src/catalog/score.ts`, `src/catalog/score.test.ts`
- **Verificação:** `npx vitest run src/catalog/score.test.ts` (exit 0); `git grep -n -E "toFixed|Math\.round" -- src/catalog/score.ts` (exit 1); `npm run verify` (exit 0)

### T1.3 Ordem por ano e ordem indeterminada (TD-009; V-01)
- **Requisito:** FR-001, FR-002 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T0.1
- **Trabalho:** `src/catalog/order.ts`: `groupByYear(projects)` -> `[{ year, items, indeterminate }]`, anos decrescentes; dentro do ano, com mês (mais recente primeiro), depois sem mês na ordem do conteúdo; empate de mês pela ordem do conteúdo; `indeterminate` quando algum par devolve `'indeterminada'` em `compareDates` (001); grupo visível após filtro recalcula a nota (um só projeto: sem nota). Data do cartão: `dateLabel[lang]` ou `formatDate`; "início -> fim" só com as duas datas no dado.
- **Testes:** `order.test.ts` (as 5 linhas da tabela da 001 FR-013; sem mês ao lado de com mês; meses iguais; 1 projeto no ano; ordem estável em 100 execuções; nenhum projeto some).
- **Critérios de aceitação:** ordem total e determinística; nenhum mês presumido.
- **Arquivos prováveis:** `src/catalog/order.ts`, `src/catalog/order.test.ts`
- **Verificação:** `npx vitest run src/catalog/order.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.4 Filtros: opções, parse do endereço e aplicação (TD-001, TD-010; V-02 lógica)
- **Requisito:** FR-003, FR-005, NFR-001, NFR-002 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T0.1
- **Trabalho:** `src/catalog/filters.ts`: `filterOptions(projects)` (stack só com ≥ 2 projetos, constante `MIN_PROJECTS_PER_STACK_FILTER = 2`; ano só com ≥ 2 anos; tipo "estudo-de-caso" só se algum tem `caseStudy` e algum não), `parseFilters(search, options)` (lista fechada por `Map`/`Set`; corta em 2 000 caracteres e 20 valores; descarta o resto), `serializeFilters(state, options)` (ordem canônica, chave ausente se vazia), `applyFilters(projects, state)` (E entre grupos, OU dentro; passada única).
- **Testes:** `filters.test.ts` com **todas as linhas** da tabela de entrada do Data Model (vazio, `react`, `react,java&ano=2026`, `xyz`, `react,xyz`, `react,react`, `ano=abc`, `ano=20266`, `tipo`, `foo=bar`, `__proto__,constructor`, 5 000 caracteres, `<img onerror=x>`); etiqueta usada 1 vez é ignorada; 50 projetos de fixture (corretude, sem laço quadrático: contagem de comparações limitada); o endereço canônico devolvido por `serializeFilters` é o que o teste espera.
- **Critérios de aceitação:** nenhum valor do endereço aparece em saída além de ids da lista; passa com a constante em 2.
- **Arquivos prováveis:** `src/catalog/filters.ts`, `src/catalog/filters.test.ts`
- **Verificação:** `npx vitest run src/catalog/filters.test.ts` (exit 0); `git grep -n -E "obj\[|\[key\]|innerHTML|dangerouslySetInnerHTML" -- src/catalog` (exit 1); `npm run verify` (exit 0)

### T1.5 Capa tipográfica e tons (TD-008; V-09)
- **Requisito:** FR-011 · **Prioridade:** P1 · **Estimativa:** 3 h · **Dependências:** T0.1
- **Trabalho:** `src/catalog/cover.ts` (`coverTone(i) = i mod 6`; `coverInitial(name)`: primeiro caractere alfanumérico, senão o primeiro grapheme), `src/components/catalog/Cover.tsx` (bloco 2:3 com `aspect-ratio`, selo só quando existe no dado, inicial `aria-hidden`; com `images[0]` renderiza `<img>` com `alt`, `width`, `height` do dado e `object-fit: cover`; **nunca** `src` de outro site), início de `src/styles/catalog.css` com os alias `--cover-1` a `--cover-6` (sem cor literal, claro e escuro, índices 4 e 5 reaproveitam 0 e 1 no escuro) e os pares tom × `--text` na matriz de `contrast.test.ts` (002).
- **Testes:** `cover.test.ts` (emoji, acento, símbolo, nome vazio, 7º projeto volta ao tom 1); `Cover.test.tsx` (selo só com `badge`; imagem do dado; URL externa recusada); `contrast.test.ts` ampliado; `styles.test.ts` segue verde (sem hex, sem `gradient(`).
- **Critérios de aceitação:** o tom não muda quando um filtro esconde um projeto (depende do índice declarado); contraste ≥ 4,5:1 do texto sobre os 6 tons nos dois temas. Não afirma que os 6 projetos reais usam bloco: o EcoShop pode ter imagem se a 003 migrou as capturas (003 L-002).
- **Arquivos prováveis:** `src/catalog/cover.ts`, `src/components/catalog/Cover.tsx`, `src/styles/catalog.css`, `src/styles/contrast.test.ts` e os testes
- **Verificação:** `npx vitest run src/catalog/cover.test.ts src/components/catalog/Cover.test.tsx src/styles/contrast.test.ts src/styles/styles.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.6 Estrelas e texto alternativo (TD-007; V-07)
- **Requisito:** FR-009, FR-010, NFR-003 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2
- **Trabalho:** `src/components/catalog/Stars.tsx`: 5 posições em SVG `aria-hidden` (cheia, meia, vazia) a partir de 3 `<symbol>` definidos uma vez por página; contêiner `role="img"` com `aria-label` ("nota 4,38 de 5" / "rated 4.38 out of 5", ou "sem nota" / "unrated"); número visível no mesmo `role="img"` (`4,38`, `sem nota`, "2 de 4 critérios avaliados"). Sem nota: 5 contornos, nenhuma cheia, nenhum zero. Cheia = `--accent`; contorno = `--control-border`; par adicionado à matriz de contraste (≥ 3:1 sobre `--bg` e `--surface`). Os rótulos vêm de um objeto de texto recebido por props (o bloco `catalog` de `ui.ts` chega na T1.9).
- **Testes:** `Stars.test.tsx` (completo: `role="img"` e rótulo; none e partial: "sem nota", 0 estrelas cheias, nunca "0"; meia estrela; EN com ponto; um único conjunto de `<symbol>` por página); `contrast.test.ts` com o par.
- **Critérios de aceitação:** a forma (cheia/meia/vazia) e o texto dizem o estado sem cor.
- **Arquivos prováveis:** `src/components/catalog/Stars.tsx`, `Stars.test.tsx`, `src/styles/catalog.css`, `src/styles/contrast.test.ts`
- **Verificação:** `npx vitest run src/components/catalog/Stars.test.tsx src/styles/contrast.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.7 Junção do conteúdo: adaptador `projectView` (TD-005, R-004)
- **Requisito:** FR-001, FR-006, FR-008 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T1.1, T1.2
- **Trabalho:** `src/catalog/projectView.ts`: função **pura** `joinCatalog(projects, entries, rubric)` (único lugar que conhece os nomes de campo da 003: `name` localizado, `start`, `stack`, `repo`, `caseStudy`, `images`, `badge`, `description`, `versions`) mais `catalogProjects()` que a chama com os arquivos reais (a chamada real só entra na T4.1, quando existem os arquivos da Duda). Devolve por projeto: dados do projeto, `summary`, `role/team/status/demo` (ausentes continuam ausentes), `score` (T1.2), índice declarado (para a capa).
- **Testes:** `projectView.test.ts` com fixtures (junção completa; entrada sem `scores`; campo opcional ausente fica ausente, nunca string vazia; ordem declarada preservada; `import type` apenas para schemas, sem zod no navegador).
- **Critérios de aceitação:** mudar um nome de campo da 003 mexe só neste arquivo e no seu teste.
- **Arquivos prováveis:** `src/catalog/projectView.ts`, `src/catalog/projectView.test.ts`
- **Verificação:** `npx vitest run src/catalog/projectView.test.ts` (exit 0); `git grep -n "from 'zod'" -- src/catalog src/components/catalog src/pages` (exit 1); `npm run verify` (exit 0)

### T1.8 `RubricExplainer`: critérios, regra e barras (FR-008)
- **Requisito:** FR-008 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.6, T1.7
- **Trabalho:** `src/components/catalog/RubricExplainer.tsx` com duas formas: (a) catálogo: lista dos critérios com a definição e a regra; (b) projeto: cada critério com a nota (barra decorativa `aria-hidden`, o número está no texto), "ainda não avaliado" para os que faltam, nota final via `Stars`. A frase da regra usa `{n}` calculado de `criteria.length` (o texto vem do dado; o componente não tem frase). CSS em `catalog.css`.
- **Testes:** `RubricExplainer.test.tsx` com fixtures: 4 critérios, 5 critérios (o número muda sem código), parcial 2 de 4, sem notas; barra `aria-hidden`; nenhum texto fixo de critério no componente (`grep` abaixo).
- **Critérios de aceitação:** os mesmos critérios para todos os projetos; nenhum critério escrito no código.
- **Arquivos prováveis:** `src/components/catalog/RubricExplainer.tsx`, `.test.tsx`, `src/styles/catalog.css`
- **Verificação:** `npx vitest run src/components/catalog/RubricExplainer.test.tsx` (exit 0); `git grep -n -i -E "clareza do código|code clarity" -- src/components src/pages` (exit 1); `npm run verify` (exit 0)

### T1.9 Bloco `catalog` de textos de interface (PT e EN)
- **Requisito:** FR-004, FR-006, FR-013, NFR-003 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T1.6
- **Trabalho:** bloco `catalog` em `src/i18n/ui.ts`, PT e EN, **sem** o `h1` e a introdução (são da Duda, T3.3): rótulos de filtro (Stack, Ano, Tipo, Estudo de caso), "Limpar filtros", linha de estado com plural ("N projetos · nenhum filtro ativo · mais recentes primeiro" / "N de M projetos · ..."), estado vazio, "sem nota", "n de N critérios avaliados", "nota X de 5" / "rated X out of 5", "ainda não avaliado", rótulos da ficha (período, stack, papel, equipe, estado), "Ver demonstração", "Código no repositório", "Ler o estudo de caso", título da seção da nota, título do detalhe ("Nome: projeto | Duda Brito"). Reaproveita `timeline.orderUndetermined` se a frase servir.
- **Testes:** `src/i18n/parity.test.ts` (mesmas chaves PT e EN); teste do plural.
- **Critérios de aceitação:** paridade verde; nenhum texto da lista da Duda foi escrito aqui (a chave da introdução não existe ainda).
- **Arquivos prováveis:** `src/i18n/ui.ts`, `src/i18n/parity.test.ts`
- **Verificação:** `npx vitest run src/i18n/parity.test.ts` (exit 0); `npm run verify` (exit 0)

---

## Fase 2: Rotas e geração
### T2.1 Rota-padrão `projeto` na tabela de rotas (TD-003; V-03)
- **Requisito:** FR-007, FR-015 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T0.1 (viável)
- **Trabalho:** uma linha nova em `src/data/routes.ts`: `projeto`, `path: '/projetos/:slug'`, `enPath: '/en/projects/:slug'`, `hidden: true`, `parent: 'projetos'`, `pattern: true` (campo opcional); `findPageByPath` casa o padrão (um segmento, só `[a-z0-9-]`); `equivalentPath(route, lang, slug)` mantém o slug; **todos** os consumidores listados na T0.1 pulam `pattern` (menu, `suggestRoutes`, terminal `ls`/`cd`, paleta, `legacyHashes`). Ajuste de `router.tsx`/`seo.ts` só no necessário.
- **Testes:** `routes.test.ts` (rota existe, `hidden`, `pattern`, fora do menu; unicidade de caminhos preservada); um teste percorre **cada** consumidor e prova que `pattern` não aparece; `/projetos/EcoShop` (maiúscula) não casa; `equivalentPath` PT<->EN mantém o slug; o chunk de entrada medido não cresce além de +0,5 KB (confere o número da T0.1 sobre o build real).
- **Critérios de aceitação:** testes de rota da 002 continuam verdes sem edição de asserção.
- **Arquivos prováveis:** `src/data/routes.ts`, `src/router.tsx`, `src/data/seo.ts`, consumidores e testes
- **Verificação:** `npx vitest run src/data/routes.test.ts` (exit 0); `npm run verify` (exit 0); `node scripts/measureBundle.mjs dist` (exit 0, entrada ≤ 97,9 KB + 0,5 KB)

### T2.2 Pré-render por projeto, `projectMeta` e servidor de teste (TD-003, TD-013; V-03, V-05)
- **Requisito:** FR-007, FR-014 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.1, T1.9
- **Trabalho:** `scripts/prerender.ts`: `prerenderPaths()` expande a rota-padrão em (id × idioma) lendo `projects.content.ts` em Node; `projectMeta(project, lang)` (título "Nome: projeto | Duda Brito" / "Name: project | Duda Brito"; descrição = `summary` do idioma, a ser lida do arquivo da T3.2; **até lá a função recebe o `summary` por parâmetro e é testada com fixture**), usada pelo pré-render e por `useDocumentMeta`; `hreflang` recíproco com o slug; `serveDist` resolve `projetos/<id>` e `en/projects/<id>` e dá 404 ao desconhecido. A query do catálogo não muda `canonical`.
- **Testes:** `scripts/prerender.test.ts` (lista **todo** `id` do conteúdo nos dois idiomas, nenhum extra); `projectMeta` em tabela; `serveDist` com id válido, inexistente e maiúscula; `hreflang` recíproco.
- **Critérios de aceitação:** acrescentar um projeto ao conteúdo cria a página sem editar a tabela; `og:` e JSON-LD ficam fora (spec 010).
- **Arquivos prováveis:** `scripts/prerender.ts`, `scripts/serveDist.mjs`, `src/data/seoHead.ts`, testes
- **Verificação:** `npx vitest run scripts/prerender.test.ts src/data/routes.test.ts` (exit 0); `npm run verify` (exit 0)

---

## Fase 3: Conteúdo da Duda (BLOQUEADAS POR CONTEÚDO DA DUDA)
> As três tarefas abaixo **não começam sem o texto dela** (ver "Como ler"). Nada aqui é escrito pelo agente. Enquanto não houver conteúdo, as Fases 4 e 5 **não rodam sobre dado real**; as Fases 1 e 2 seguem normalmente com fixture.

### T3.1 [bloqueada por conteúdo da Duda] `rubric.content.ts`: critérios e regra
- **Requisito:** FR-008 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T1.1; **conteúdo da Duda (DQ-005)**
- **Texto que a Duda precisa fornecer ou aprovar:** (1) os **nomes em EN** dos 4 critérios; (2) a **descrição** (o que significa) de cada critério, PT e EN; (3) a **regra de cálculo**, PT e EN. **PROPOSTA (não aprovada, só para ela editar):** ids `code-clarity`, `tests-verification`, `a11y-performance`, `real-use-impact`; nomes PT do mockup (Clareza do código; Testes e verificação; Acessibilidade e desempenho; Uso real / impacto, já aceitos na Q-001); EN propostos no design: Code clarity; Tests and verification; Accessibility and performance; Real use / impact; regra proposta no design (com `{n}`). As descrições **não têm proposta do agente**.
- **Trabalho:** com o texto aprovado, criar `src/content/rubric.content.ts` e registrar em `src/content/registry.ts` (ordem alfabética; R-007).
- **Testes:** `src/content/catalog.content.test.ts` (parte da rubrica): conteúdo real tem N = 4 e os 4 ids; PT e EN completos; a regra contém `{n}`; `validateAll` passa.
- **Critérios de aceitação:** `evidence.md` registra a data e a mensagem da Duda aprovando cada texto; nenhum texto inventado.
- **Arquivos prováveis:** `src/content/rubric.content.ts`, `src/content/registry.ts`, `src/content/catalog.content.test.ts`
- **Verificação:** `npx vitest run src/content/catalog.content.test.ts src/content/registry.test.ts` (exit 0); `npm run verify` (exit 0)

### T3.2 [bloqueada por conteúdo da Duda] `projectCatalog.content.ts`: frases e ficha dos 6 projetos
- **Requisito:** FR-001, FR-006, FR-012 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1, T3.1; **conteúdo da Duda (DQ-002, DQ-003)**
- **Texto que a Duda precisa fornecer ou aprovar:** as **6 frases** (`summary`, PT e EN, ≤ 200 caracteres, sem quebra de linha); e, **se ela quiser mostrar**, papel, equipe, estado e link de demonstração (`https`) por projeto, PT e EN. O que ela não passar **fica ausente** e a linha some na ficha. **PROPOSTA (não aprovada):** as frases (`blurb`) do mockup `Projetos.dc.html`, entregues a ela como rascunho para aprovar ou reescrever, **uma por uma**; nenhuma entra sem o aceite dela.
- **Trabalho:** com o texto aprovado, criar `src/content/projectCatalog.content.ts` (uma entrada por projeto, `scores` **ausente** nos 6: ela ainda não avaliou) e registrar em `registry.ts`; a fábrica recebe os ids lidos dos outros dois arquivos.
- **Testes:** `catalog.content.test.ts` (parte das entradas): os 6 projetos têm entrada; lista de ids publicados guardada (`['ecoshop', ...]`, TD-004); nenhum `scores`; paridade PT/EN; nenhum campo vazio (`""`); `validateAll` com arquivo, campo e motivo em caso de erro.
- **Critérios de aceitação:** `evidence.md` registra a aprovação de cada frase e de cada campo opcional; "sem nota" é o estado correto de entrada.
- **Arquivos prováveis:** `src/content/projectCatalog.content.ts`, `src/content/registry.ts`, `src/content/catalog.content.test.ts`
- **Verificação:** `npx vitest run src/content/catalog.content.test.ts src/content/registry.test.ts` (exit 0); `npm run verify` (exit 0)

### T3.3 [bloqueada por conteúdo da Duda] `h1` e introdução de `/projetos`
- **Requisito:** FR-001, FR-008 · **Prioridade:** P0 · **Estimativa:** 1 h · **Dependências:** T1.9; **conteúdo da Duda (DQ-004)**
- **Texto que a Duda precisa fornecer ou aprovar:** o `h1` (rótulo da rota, hoje em `routes.ts`) e a **introdução**, PT e EN. A contagem de projetos é calculada pela linha de estado, **não** entra no texto. **PROPOSTA:** a introdução do mockup traz um número fixo ("Seis projetos...") e a atual do site (`portfolio.tsx`) fala em "propósito"; **nenhuma serve sem o aceite dela**.
- **Trabalho:** chave `catalog.intro` em `ui.ts` (PT e EN) e, se ela mudar o rótulo, o `label` da rota `projetos` em `routes.ts`.
- **Testes:** `parity.test.ts`; `routes.test.ts` (rótulo nos dois idiomas).
- **Critérios de aceitação:** a mensagem da Duda com o texto aprovado fica no `evidence.md`.
- **Arquivos prováveis:** `src/i18n/ui.ts`, `src/data/routes.ts`
- **Verificação:** `npx vitest run src/i18n/parity.test.ts src/data/routes.test.ts` (exit 0); `npm run verify` (exit 0)

---

## Fase 4: Páginas, integração e remoção do código antigo
### T4.1 Página do catálogo `/projetos` sem filtros (TD-009, TD-012; V-05)
- **Requisito:** FR-001, FR-002, FR-008, FR-014 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.3, T1.5, T1.6, T1.7, T1.8, T1.9, T3.1, T3.2, T3.3
- **Trabalho:** `src/pages/Projects.tsx` (chunk lazy em `lazyPages.ts`) com `h1` e introdução, seção por ano (`h2`, nota de ordem indeterminada do **grupo**), `<ul>` de cartões (`h3` com o único `<a>`, link esticado por `::after`, capa `aria-hidden`, estrelas e nota, data, stack em mono, `summary`, selo se existir, "Estudo de caso" derivado de `caseStudy`), `RubricExplainer` no fim; grade 4/2/1 colunas (1280/768/390 px); `catalogProjects()` chama `joinCatalog` com o conteúdo real; `catalog.css` importado pelo módulo da página; sem JS a seção de filtros (T4.2) não existe ainda.
- **Testes:** `Projects.test.tsx` (6 cartões; agrupamento e nota do ano; "sem nota" nos 6; nome acessível do link = nome do projeto; um `h1`; sem texto de projeto no componente).
- **Critérios de aceitação:** o HTML renderizado no servidor traz o catálogo inteiro; nenhuma cor literal.
- **Arquivos prováveis:** `src/pages/Projects.tsx`, `Projects.test.tsx`, `src/pages/lazyPages.ts`, `src/catalog/projectView.ts`, `src/styles/catalog.css`
- **Verificação:** `npx vitest run src/pages/Projects.test.tsx src/catalog/projectView.test.ts` (exit 0); `npm run verify` (exit 0)

### T4.2 Filtros na página: botões, endereço, status, estado vazio e foco (TD-001, TD-002, TD-012; V-02)
- **Requisito:** FR-003, FR-004, FR-005, FR-013, NFR-002, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T4.1, T1.4
- **Trabalho:** seção de filtros com um `role="group"` por filtro, `<button type="button" aria-pressed>` de 44×44 px com ✓ e peso quando ativo; "Limpar filtros" visível só com filtro; `<p role="status">` com contagem calculada (não anunciado no carregamento); estado vazio com botão; foco: chip fica no chip, "Limpar" leva o foco ao `h2` dos resultados (`tabindex="-1"`); leitura da query **só em `useEffect`** e reescrita canônica por `history.replaceState(history.state, '', ...)`, sem `router.navigate` (a página não rola ao topo); `html:not(.js)` esconde a seção; sem estado salvo; os filtros não passam ao trocar de idioma (DQ-006).
- **Testes:** `Projects.test.tsx` ampliado: combinação E/OU, vazio, `?stack=xyz` reescrito para limpo, valor malicioso nunca no DOM, a lista não muda entre servidor e cliente (sem aviso de hidratação), `replaceState` preserva `history.state`; `state.test.ts` da 002 ampliado para a regra `[aria-pressed="true"]` do catálogo mudar mais que cor.
- **Critérios de aceitação:** a tabela de entrada do design vale ponta a ponta na página; operável só com teclado.
- **Arquivos prováveis:** `src/pages/Projects.tsx`, `src/components/catalog/Filters.tsx`, `src/styles/catalog.css`, `src/styles/state.test.ts`, testes
- **Verificação:** `npx vitest run src/pages/Projects.test.tsx src/catalog/filters.test.ts src/styles/state.test.ts` (exit 0); `npm run verify` (exit 0)

### T4.3 Página de detalhe `/projetos/<id>` (FR-006, FR-012; V-04)
- **Requisito:** FR-006, FR-008, FR-012 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.7, T1.8, T1.5, T3.1, T3.2
- **Trabalho:** `src/pages/ProjectDetail.tsx` (chunk lazy): trilha `<nav aria-label>`, `h1`, cabeçalho com capa, linha "ano · papel · estado" **só com as partes que existem**, estrelas e nota, `summary`, etiquetas, ações (demonstração, repositório, estudo de caso, só as que existem, `rel="noopener noreferrer"`, sem `target` forçado, sem rastreamento); `h2` Ficha técnica (`<dl>`, linha vazia some), `h2` Sobre (descrição da 003 via `parseRich`), `h2` Versões (só se existem), imagens (`<figure>`, `alt`, `width`, `height`, `loading="lazy"`, sem lightbox), `h2` Nota por critério (`RubricExplainer`); slug desconhecido renderiza `NotFound` do idioma.
- **Testes:** `ProjectDetail.test.tsx`: projeto completo, projeto mínimo (sem papel, equipe, estado, demo, repo, caso, versões, imagens: nenhuma linha vazia, nenhum botão quebrado), links `https` com `rel`, parcial 2 de 4, slug desconhecido, PT e EN.
- **Critérios de aceitação:** nenhum bloco "Moldado por"; o caso é só um link (006).
- **Arquivos prováveis:** `src/pages/ProjectDetail.tsx`, `ProjectDetail.test.tsx`, `src/pages/lazyPages.ts`, `src/styles/catalog.css`
- **Verificação:** `npx vitest run src/pages/ProjectDetail.test.tsx` (exit 0); `npm run verify` (exit 0)

### T4.4 Integração: rotas lazy, pré-render real e `checkDist` (V-05)
- **Requisito:** FR-007, FR-014, FR-015 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.2, T4.2, T4.3
- **Trabalho:** `LAZY_SOURCE` e `lazyPages.ts` apontam para as páginas novas (o catálogo novo **assume** `/projetos`; `projetos` deixa de vir de `SectionPage`); o pré-render gera `dist/projetos.html`, `dist/projetos/<id>.html`, `dist/en/projects.html`, `dist/en/projects/<id>.html` com `title`, `description`, `hreflang`; `chunkAssets` referencia o CSS do chunk; `checkDist` confere os 14 arquivos.
- **Testes:** `scripts/prerender.test.ts` (catálogo com 6 cartões e detalhe completo no HTML, `lang`, um `h1`, `hreflang` recíproco); medição do `vite build` (R-008) no `evidence.md`.
- **Critérios de aceitação:** `checkDist` sai 0; HTML sem JavaScript traz lista e ficha.
- **Arquivos prováveis:** `scripts/prerender.ts`, `src/pages/lazyPages.ts`, `scripts/checkDist.mjs`, testes
- **Verificação:** `npx vitest run scripts/prerender.test.ts` (exit 0); `npm run verify` (exit 0); `node scripts/checkDist.mjs dist` (exit 0)

### T4.5 Remoção do código antigo (TD-014; V-11)
- **Requisito:** FR-014, TD-014 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T4.4
- **Trabalho:** remover `src/sections/portfolio/Projects.tsx`, `Projects.test.tsx`, `ProjectCard.tsx`, `ProjectMedia.tsx`; tirar a chave `projetos` e o import de `SectionPage.tsx`; apagar o bloco `projects` de `src/data/portfolio.tsx`; `timeline.*` de projetos em `ui.ts` só se nada mais usar; remover as regras `.project-*` e a linha do tempo de projetos de `sections.css`; `ImageGallery.tsx` e `Lightbox.tsx` **só se** `git grep` mostrar que nenhum outro arquivo os importa (hoje `Services.tsx` importa: ficam). **Ficam:** `src/data/projects.tsx`, `src/utils/projectDate.ts`, `public/cases/**`, `CaseStudy.tsx`.
- **Testes:** o teste de código removido sai junto; `npm run verify` cobre o resto.
- **Critérios de aceitação:** nenhuma referência às peças antigas em `src`.
- **Arquivos prováveis:** os listados acima
- **Verificação:** `git grep -n -E "sections/portfolio/(Projects|ProjectCard|ProjectMedia)" -- src` (exit 1); `git ls-files public/cases | wc -l` (igual ao de antes, anotado no `evidence.md`); `npm run verify` (exit 0)

---

## Fase 5: Medição, e2e e fechamento
### T5.1 e2e do catálogo e do detalhe (V-06)
- **Requisito:** FR-004, FR-005, FR-012, FR-013, NFR-002, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T4.4
- **Trabalho:** `e2e/catalog.e2e.ts` sobre `dist` via `serveDist`: só teclado (alternar chips, limpar, abrir um projeto); foco visível; foco no título após "Limpar"; `aria-pressed` e ✓; sem rolagem horizontal em 390 px; axe 0 em `/projetos`, `/projetos/<id>` e versões EN, tema claro e escuro; todas as requisições da mesma origem; console sem aviso de hidratação (inclui `?stack=`); `?stack=<img onerror=x>` não vira DOM; voltar do detalhe preserva a query.
- **Testes:** o próprio e2e.
- **Critérios de aceitação:** zero violação axe; zero requisição externa.
- **Arquivos prováveis:** `e2e/catalog.e2e.ts`
- **Verificação:** `npx playwright test e2e/catalog.e2e.ts` (exit 0); `npm run verify` (exit 0)

### T5.2 Medição por página e roteiro de filtros (TD-011; V-10)
- **Requisito:** NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T4.4
- **Trabalho:** estender `scripts/measureBundle.mjs` para `--pages` e `--max-js`/`--max-css` (os 4 totais de JS ≤ 110 KB gzip; entrada +≤ 0,5 KB; chunks de página ≤ 8 KB; compartilhado ≤ 6 KB; `catalog.css` ≤ 4 KB; CSS da página ≤ 20 KB); `lighthouseRun.mjs` e `inpRun.mjs` aceitam a lista de URLs; o INP ganha o roteiro de filtros (abrir, alternar 3 chips, limpar) com CPU 4× mais lenta; incluir `/projetos?stack=react` na medição de CLS. Se algum total passar, **parar e voltar à Duda** (R-001).
- **Testes:** teste de unidade da função de julgamento de `measureBundle` (passa e reprova com número plantado).
- **Critérios de aceitação:** função de julgamento testada nos dois sentidos; nenhum limite editado em silêncio.
- **Arquivos prováveis:** `scripts/measureBundle.mjs`, `scripts/lighthouseRun.mjs`, `scripts/inpRun.mjs`, testes
- **Verificação:** `npx vitest run scripts/measureBundle.test.ts` (exit 0); `node scripts/measureBundle.mjs dist --pages projetos.html,projetos/ecoshop.html,en/projects.html,en/projects/ecoshop.html --max-js 110000 --max-css 20000` (exit 0); `npm run verify` (exit 0)

### T5.3 Medição final e fechamento da spec (V-10, Success Metrics)
- **Requisito:** NFR-001, NFR-003, Success Metrics · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.1, T5.2, T4.5
- **Trabalho:** rodar `npm run prova` estendido; registrar LCP, CLS (inclui `?stack=react`), INP (e o indício ≤ 100 ms para o argumento dos 50 projetos, DQ-010), Lighthouse (acessibilidade, SEO, boas práticas ≥ 95), tempo de `verify` (≤ 180 s) e da suíte (≤ 90 s); marcar cada item do Success Metrics com evidência; confirmar 2 cliques da home; **dizer no `evidence.md` que os 50 projetos são cobertos por teste funcional, não por medição de tempo de parede**. Se CLS > 0,1 com query, aplicar a saída do TD-002 **só com aprovação da Duda**.
- **Testes:** os comandos abaixo.
- **Critérios de aceitação:** todos os limites cumpridos ou uma proposta à Duda registrada; `git ls-files src.zip` vazio; `public/cases/**` intacto.
- **Arquivos prováveis:** `evidence.md`
- **Verificação:** `npm run verify` (3 vezes, exit 0); `npm run prova` (exit 0); `node scripts/checkDist.mjs dist` (exit 0); `git ls-files src.zip` (vazio)

---

## Phase dependencies
```
G0 (003 fechada) ─► T0.1 ─┬─► T1.1 ─► T1.2 ─┬─► T1.6 ─► T1.9
                          │                 └─► T1.7 ─► T1.8
                          ├─► T1.3, T1.4, T1.5
                          └─► T2.1 ─► T2.2 (também T1.9)
T1.1, T1.8 ─► T3.1* ─► T3.2* ; T1.9 ─► T3.3*          (* bloqueadas por conteúdo da Duda)
T1.3, T1.5, T1.6, T1.7, T1.8, T1.9, T3.1, T3.2, T3.3 ─► T4.1 ─► T4.2 ─┐
T1.5, T1.7, T1.8, T3.1, T3.2 ─► T4.3 ──────────────────────────────────┤
T2.2, T4.2, T4.3 ─► T4.4 ─► T4.5 ; T4.4 ─► T5.1, T5.2 ; T4.5, T5.1, T5.2 ─► T5.3
```
- Fases 1 e 2 **não dependem** do conteúdo da Duda; um implementador pode avançar até a T2.2 enquanto ela escreve. A T4.1 em diante só começa com os três textos entregues.
- Uma tarefa e um commit de cada vez, cada uma com o `verify` verde.

## Lacunas, propostas e perguntas abertas
| ID | Lacuna ou ambiguidade | Proposta (a Duda decide) |
| --- | --- | --- |
| G0 | A 003 ainda não tem `tasks.md` nem código; a 005 depende de `projects.content.ts` e de `registry.ts` | Esperar a 003 fechada (R-007); a T0.1 confere |
| L-A | O `design.md` supôs `name` não localizado e `date`; a 003 usa `name` localizado e `start`; o EcoShop pode ter as 3 capturas migradas | O adaptador (T1.7) absorve; a T0.1 anota a correção; a T1.5 não assume "6 blocos" |
| L-B | Conteúdo pendente: nomes EN, descrições dos critérios, regra, 6 frases, papel/equipe/estado/demonstração, `h1` e introdução | T3.1 a T3.3; **só a Duda escreve**; o agente entrega só PROPOSTA marcada |
| L-C | `h1` hoje é o rótulo da rota em `routes.ts`; a Duda tratou o `h1` como conteúdo dela | T3.3 mexe no rótulo só se ela mudar o texto |
| L-D | Se a medição de 110 KB, CLS com query ou INP falhar | Parar e propor (R-001, R-003); nada em silêncio |

## Confirm before building
Antes de qualquer tarefa de implementação, o implementador **restata com as próprias palavras** e espera o **OK explícito da Duda**:
1. **FRs (resumo):** catálogo por ano com ordem indeterminada marcada; filtros por stack, ano e tipo (E entre grupos, OU dentro) no endereço, valor inválido ignorado, estado vazio; detalhe por projeto nos dois idiomas com ficha (só linhas existentes), links e nota por critério; critérios e regra públicos; nota = média simples (2 casas), estrelas na meia mais próxima com empate para cima, "sem nota" até os 4 critérios; capa de bloco tipográfico; tudo no HTML sem JavaScript.
2. **Restrições:** branch `rebuild/sdd`, nenhum `git push`, nada na `main`; só depois do gate G0; **nenhum texto da Duda é inventado** (T3.1 a T3.3 bloqueadas até ela entregar); `public/cases/**` e `src.zip` intocados; entrada +≤ 0,5 KB e 110 KB por página, sem edição silenciosa; cada tarefa com `verify` verde e bloco de evidência.
3. **Perguntas abertas:** nenhuma decisão; só o conteúdo de L-B.
4. **Ação da Duda:** escrever ou aprovar o conteúdo de L-B (T3.1 a T3.3) e avaliar os projetos nos 4 critérios quando quiser (o site entra no ar com "sem nota").
Nada de código antes de `tasks:approved`.
