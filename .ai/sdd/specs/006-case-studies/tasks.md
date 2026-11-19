# 006 Case studies, Tasks
**Status:** draft (ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada), `design.md` v0.1 (`design:approved` em 2026-11-19, com as 9 respostas registradas em §14.1).
**Estimativa total:** 18 tarefas, **58 h** (1 a 4 h cada), em 7 fases (1 a 6, mais a "Ação da Duda").

## Como ler
- **Testes ficam dentro de cada tarefa.** Não há fase de testes separada.
- **Bloco de evidência** no fechamento de toda tarefa (conventions.md), em `evidence.md` nesta pasta: `Claim`, `Command`, `Exit code`, `Summary`, `Verdict`.
- **Gate de cada tarefa:** `npm run verify` com exit 0 no fim. Nenhuma tarefa deixa o repositório quebrado: os componentes antigos continuam compilando até a **T6.1** (a página nova não os importa; ficam como código morto até lá).
- **Commits** em português, `tipo(escopo): resumo`, citando o ID da tarefa, terminando com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. **Nenhuma tarefa inclui `git push`**; nada vai para a `main`.
- **Orçamento:** suíte ≤ 90 s e `verify` ≤ 180 s. **Nunca duas execuções de vitest ao mesmo tempo.**
- **Windows:** arquivos com barra invertida, crases ou `\uXXXX` vão pelo Write, não por heredoc.
- **Texto:** nada inventado, resumido ou reescrito (FR-007, D-001). Texto de interface em PT e EN (`src/i18n/ui.ts`); conteúdo em `src/content/`.
- **Ordem obrigatória (design §15):** o dourado nasce na **primeira** tarefa (T1.1), antes de qualquer mudança; a remoção dos componentes antigos é a **última** (T6.1), depois da equivalência verde.

## Dependências externas (declaradas)
| Spec | O que esta spec precisa | Tarefas que dependem |
| --- | --- | --- |
| **001** (fechada, `review:done`) | `LocalizedText`, registro explícito, validador, mensagens "arquivo, campo, motivo", paridade, `npm run verify` | T2.1 a T2.3, T4.1 |
| **002** (`tasks:approved`; casca, tokens, pré-render, `renderRoute`, `checkDist`, `measureBundle`, e2e com axe, `state.test.ts`) | casca, tokens, rota na tabela, pré-render por rota, ponto de quebra de 1024 px | T4.6, T4.7, T5.3, T5.4 |
| **003** (conteúdo e schemas; `design:approved`, **sem `tasks.md` ainda**) | registro com `projects.content.ts` e o campo `caseStudy` do projeto, tipos `Link` e `LocalizedText`, `contentValidator` | **T2.3 (consistência com o projeto) e T3.2 (gera o conteúdo)** |
| **005** (detalhe do projeto; `design:approved`, **sem `tasks.md` ainda**) | a página `ProjectDetail` que mostra o link "Ler o estudo de caso" só quando o projeto tem caso | **T5.2 (ligação projeto ↔ caso)** |
Os IDs de tarefa da 003 e da 005 entram aqui quando os `tasks.md` delas existirem (a ligar numa revisão desta versão). Enquanto isso, a dependência é por **capacidade**: T2.3 e T3.2 só começam com o registro, o schema de projeto e o validador da 003 fechados e verdes; T5.2 só começa com `ProjectDetail` da 005 fechada.

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados | OK: `requirements.md` v1.0 (`requirements:approved`, 2026-11-19) |
| Design aprovado | OK: `design:approved` em 2026-11-19 (`.status`) |
| Todo Must Have coberto | OK: FR-001 a FR-009, NFR-001 a NFR-003 e US-001 a US-003 na tabela Coverage |
| Q-* e perguntas do design respondidas | OK: Q-001 a Q-004 do requirements e as 9 perguntas do design (§14.1) |
| Toda tarefa tem dependência, critério e verificação | OK (ver cada tarefa) |
| Dependências de outras specs | **Pendente de IDs:** 003 e 005 ainda não têm `tasks.md`; declaradas por capacidade (tabela acima). Não bloqueia T1.1 a T2.2, T4.1 a T4.5 |
| Dado a medir | tamanho do chunk do caso (V-14, T5.3); se passar do orçamento da 002 (110 KB, 005), **parar e propor** à Duda, sem subir o número em silêncio |
| Tarefas de 4 h com risco | T3.1, T3.2, T4.2, T4.6, T4.7, T5.1, T5.4. Se uma estourar 4 h, **parar e avisar a Duda** antes de seguir (dividir muda o total) |
| Risco de cadeia | o gerador (T3.1) e o dourado (T1.1) partem do mesmo HTML (R-03): o dourado guarda texto cru e o gerador tem 3 trechos conferidos à mão |

## Coverage
| Requisito | Tarefas |
| --- | --- |
| FR-001 (caso como conteúdo validado, PT/EN, sem texto em componente) | T2.1, T2.2, T2.3, T3.1, T3.2, T4.1, T6.1 |
| FR-002 (decisão com ganho e custo, tabela acessível) | T2.2, T4.3, T5.4 |
| FR-003 (escopo no início) | T2.2, T4.4, T4.6 |
| FR-004 (índice, destaque ao escolher, sem depender só de cor) | T4.4, T4.5, T4.7, T5.4 |
| FR-005 (tela estreita: índice no topo, sem rolagem horizontal) | T4.6, T4.7, T5.4 |
| FR-006 (caso ↔ projeto; projeto sem caso válido) | T2.2, T2.3, T5.2 |
| FR-007 (equivalência; nada acrescentado ou resumido) | T1.1, T3.1, T3.2, T5.1 |
| FR-008 (PT/EN, endereço por idioma, troca leva ao mesmo caso, destino existe) | T2.3, T4.6, T5.2 |
| FR-009 (caso inteiro no HTML sem JavaScript) | T4.6, T5.3 |
| NFR-001 (desempenho; sem código de outras páginas) | T4.6, T5.3, T5.4 |
| NFR-002 (sem terceiros; sem HTML injetado) | T4.2, T5.3 |
| NFR-003 (WCAG 2.1 AA, axe, títulos, foco, cabeçalhos de tabela) | T4.3, T4.4, T4.7, T5.4 |
| US-001 / US-002 / US-003 | FR-002 e FR-003 / FR-004 e FR-005 / FR-007 |
| Decisões da Duda (§14.1) | 1: T2.1, T4.2; 2: T2.2; 3: T2.3; 4 e 6: T3.2, T4.4; 5: T4.2; 7: T4.5; 8: sem tarefa; 9: T4.3, T5.4 |
| Remoção do código antigo (design §11, P-Q-001) | T6.1 |

---

## Fase 1: Congelar a referência
### T1.1 Dourado e normalização (TD-006, design §9.1 passos 1 e 2)
- **Requisito:** FR-007 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** nenhuma
- **Trabalho:** com os componentes antigos **intactos**, escrever `src/content/__fixtures__/normalize.ts` (função única: espaços colapsados, `<br>` e fronteira de bloco viram um espaço, NFC, sem alterar aspas nem Unicode; cada linha guarda `etiqueta: texto` para `h1`, `h2`, `h3`, `p`, `li`, `th`, `td`, `dt`, `dd`, `code`, `strong`, `em`). Um script de uma vez só (`scripts/freezeCaseGolden.mts`) renderiza `WhatsAppDispatcherPt`/`En` e o `CaseStudy` atual por idioma (que traz o texto de interface) com `renderToStaticMarkup`, e grava `case-whatsapp-dispatcher.golden.pt.json` e `.en.json` com o hash do commit de origem no cabeçalho. O script é removido na T6.1 (fica no histórico).
- **Testes:** `normalize.test.ts` (espaços, `<br>`, NFC, aspas preservadas); `golden.test.ts` (os dois arquivos existem, têm cabeçalho com hash, e as contagens batem com o código antigo: 14 `h2`, 3 `h3`, 3 tabelas, 14 blocos "Em termos técnicos", 2 destaques, 2 exemplos).
- **Critérios de aceitação:** dourados gerados antes de qualquer outra mudança; nenhum arquivo de `src/pages/case-study/` alterado (`git diff` vazio nele).
- **Arquivos prováveis:** `src/content/__fixtures__/normalize.ts`, `normalize.test.ts`, `golden.test.ts`, `case-whatsapp-dispatcher.golden.{pt,en}.json`, `scripts/freezeCaseGolden.mts`
- **Verificação:** `npx vitest run src/content/__fixtures__` (exit 0); `git diff --stat -- src/pages/case-study src/pages/CaseStudy.tsx` (vazio); `npm run verify` (exit 0)

---

## Fase 2: Schema e ligações
### T2.1 Schema de marcação e blocos (TD-002, TD-003)
- **Requisito:** FR-001 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** spec 001
- **Trabalho:** em `src/content/schema/case.ts`, `Inline` (`string`, `{code}`, `{strong}`, `{em}`, aninhável, profundidade ≤ 3), `Rich`, `Flow`, `LocOf<T>` (PT e EN obrigatórios e não vazios) e `Block` (`p`, `h3`, `list`, `callout`, `tech`, `example`, `terms`). Mensagens "arquivo, campo, motivo". Sem tipo `link`.
- **Testes:** `case.test.ts` (parte 1): aceita `strong > strong > em`; recusa profundidade 4, parágrafo só de espaços, `en` ausente, bloco de tipo desconhecido, lista aninhada.
- **Critérios de aceitação:** `*` dentro de string é texto literal (EC-08); cada erro nomeia campo e motivo.
- **Arquivos prováveis:** `src/content/schema/case.ts`, `src/content/schema/case.test.ts`
- **Verificação:** `npx vitest run src/content/schema/case.test.ts` (exit 0); `npm run verify` (exit 0)

### T2.2 Schema de seção, decisão e caso (TD-003, TD-010)
- **Requisito:** FR-001, FR-002, FR-003, FR-006 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.1
- **Trabalho:** `Section` (`id` e `tocLabel` e `title` localizados, `role`), `Decision` (`decision`, `gain`, `cost` obrigatórios), `Case` (`id`, `route`, `project`, `badge`, `title`, `summary`, `scope` 1 a N, `sections`, `decisions` ≥ 1). Regras da tabela de §5.1: uma seção `context` (a primeira), uma `decisions`, no máximo uma `outcome` e uma `glossary`; `id` único por idioma no formato `^[a-z0-9-]+$`; guarda de pendência `[entre colchetes]` herdado da 001/003.
- **Testes:** `case.test.ts` (parte 2), as 5 linhas da tabela "Validação" do requirements: decisão sem custo (`decisions[2].cost: texto ausente`), caso sem EN, caso sem `project`, `id` repetido (`sections[4].id.en: repetido`), papel repetido; mais o caso válido mínimo.
- **Critérios de aceitação:** cada linha da tabela de regras do design tem teste que falha com a mensagem esperada.
- **Arquivos prováveis:** `src/content/schema/case.ts`, `case.test.ts`, `schema/index.ts`
- **Verificação:** `npx vitest run src/content/schema/case.test.ts` (exit 0); `npm run verify` (exit 0)

### T2.3 Registro, leitura e consistência com projeto e rota (TD-009, FR-006)
- **Requisito:** FR-001, FR-006, FR-008 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.2, **spec 003** (registro, schema de projeto com `caseStudy`, validador)
- **Trabalho:** entrada do caso em `src/content/registry.ts`; `src/content/cases.ts` com `caseByRoute(id)` e `caseByProject(projectId)` (`undefined` se o projeto não tem caso); arquivo mínimo provisório `whatsapp-dispatcher.content.ts` só com o necessário para o teste de consistência (substituído na T3.2). Teste de consistência (V-08): todo `Case.project` existe; todo `Case.route` existe em `routes.ts` com o mesmo `id`; o `caseStudy` do projeto, se existir, é igual ao endereço da rota do caso; toda rota "estudo de caso" tem caso; sem `route` ou `id` duplicados (EC-12). A rota `whatsapp-dispatcher` em `routes.ts` **não muda** (decisão 3).
- **Testes:** `cases.test.ts` (consistência e os casos EC-03, EC-04, EC-05, EC-12); `registry.test.ts` da 001 inclui o caso (arquivo fora do registro falha).
- **Critérios de aceitação:** projeto sem caso é válido; `caseStudy` divergente falha com mensagem que nomeia projeto e caso.
- **Arquivos prováveis:** `src/content/registry.ts`, `src/content/cases.ts`, `src/content/cases.test.ts`, `src/content/cases/whatsapp-dispatcher.content.ts`
- **Verificação:** `npx vitest run src/content/cases.test.ts src/content/registry.test.ts` (exit 0); `git diff --stat -- src/data/routes.ts` (vazio); `npm run verify` (exit 0)

---

## Fase 3: Migrar o conteúdo
### T3.1 Gerador a partir do HTML renderizado (TD-005)
- **Requisito:** FR-001, FR-007 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.1, T2.2
- **Trabalho:** `scripts/migrateCase.mts` renderiza `WhatsAppDispatcherPt`/`En` com `renderToStaticMarkup`, faz o parse com `jsdom` (já é `devDependency`) e emite o objeto `Case` por papéis e blocos (`h3`, `callout`, `tech`, `example`, `terms`, `list`), com as duas diferenças da §9.1 passo 4 (`td` de termo vira linha de `terms`; `<br>` vira parágrafo). O gerador é removido na T6.1.
- **Testes:** `migrateCase.test.ts` com **3 trechos conferidos à mão**: um parágrafo com `strong > em`, uma lista (item com título e corpo no PT, tudo seguido no EN) e uma linha de glossário (PT com "Exemplo:" em outro parágrafo). Mais: a saída para os dois idiomas passa no schema.
- **Critérios de aceitação:** os 3 trechos batem caractere a caractere; nenhum texto passa por resumo ou limpeza além da normalização declarada.
- **Arquivos prováveis:** `scripts/migrateCase.mts`, `scripts/migrateCase.test.ts`
- **Verificação:** `npx vitest run scripts/migrateCase.test.ts` (exit 0); `npm run verify` (exit 0)

### T3.2 Gerar e registrar `whatsapp-dispatcher.content.ts` (TD-001, TD-005)
- **Requisito:** FR-001, FR-006, FR-007 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.1, T2.3, **spec 003** (projeto `whatsapp-dispatcher` no conteúdo)
- **Trabalho:** rodar o gerador, formatar com Prettier e tratar o arquivo como fonte: 14 seções com `role` (contexto = `context`; "decisões" = `decisions`; "O que mudaria para um cenário real de produção" = `outcome`; glossário = `glossary`), `id` por idioma (`#contexto`/`#context`), `tocLabel` com os rótulos atuais (decisões 2 e 4), `scope` com 3 pares, 4 decisões com ganho e custo, `badge`, `title`, `summary`, `project` e `route`. Comentário de procedência por seção (commit de origem). Substitui o arquivo provisório da T2.3.
- **Testes:** `npm run content:check` com o caso real; teste de contagem do arquivo (14 seções, 3 `h3`, 3 tabelas, 4 decisões, 3 itens de escopo, índice com 14 `tocLabel`); âncora para seção inexistente falha (linha da tabela "Validação").
- **Critérios de aceitação:** validador verde; nenhum `[...]` nem texto de exemplo; sem `import` além de `import type` no arquivo.
- **Arquivos prováveis:** `src/content/cases/whatsapp-dispatcher.content.ts`, `src/content/cases.test.ts`
- **Verificação:** `npm run content:check` (exit 0); `npx vitest run src/content/cases.test.ts` (exit 0); `git grep -n -E "^import " -- src/content/cases/whatsapp-dispatcher.content.ts` (só `import type`); `npm run verify` (exit 0)

---

## Fase 4: Componentes e página
### T4.1 Texto de interface `case.*` em PT e EN (§4, TD-011)
- **Requisito:** FR-001, FR-007 · **Prioridade:** P1 · **Estimativa:** 2 h · **Dependências:** spec 001 (paridade)
- **Trabalho:** chaves `case.*` em `src/i18n/ui.ts`: "Neste estudo de caso" / "In this case study", "Escopo deste material", "Em termos técnicos", cabeçalho "Decisão / Ganho / Custo aceito", "← Voltar aos projetos", "Vamos conversar sobre isso →" e os equivalentes em EN, **iguais ao texto atual** (conferidos contra o dourado).
- **Testes:** teste de paridade da 001 cobre as chaves novas; teste compara cada texto de interface com a linha correspondente do dourado.
- **Critérios de aceitação:** nenhuma chave só em um idioma; nenhum texto novo.
- **Arquivos prováveis:** `src/i18n/ui.ts`, `src/i18n/ui.test.ts`
- **Verificação:** `npx vitest run src/i18n scripts/parity.test.ts` (exit 0); `npm run verify` (exit 0)

### T4.2 `Inline` e blocos de texto (TD-002, TD-004, decisões 1 e 5)
- **Requisito:** FR-001, NFR-002 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.1, T4.1
- **Trabalho:** `src/components/case/Inline.tsx` (string, `code`, `strong`, `em`, por elemento React) e `CaseBlocks.tsx` para `p`, `h3`, `list` (cada parágrafo de `Flow` vira `<p>` dentro do `<li>`), `callout` (`div role="note"`), `tech` (rótulo "Em termos técnicos" vindo de `case.*`) e `example`. Desenho único PT/EN, sem ramo por idioma.
- **Testes:** `Inline.test.tsx` (aninhamento `strong > strong > em`, `*` literal), `CaseBlocks.test.tsx` (cada tipo, ordem, sem `<br>`).
- **Critérios de aceitação:** nenhum `dangerouslySetInnerHTML`; `callout` não cria landmark.
- **Arquivos prováveis:** `src/components/case/Inline.tsx`, `CaseBlocks.tsx` e testes
- **Verificação:** `npx vitest run src/components/case` (exit 0); `git grep -n dangerouslySetInnerHTML -- src/components/case` (exit 1); `npm run verify` (exit 0)

### T4.3 Tabelas: `terms` e `DecisionsTable` (TD-012, decisão 9)
- **Requisito:** FR-002, NFR-003 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T4.2
- **Trabalho:** `terms` como `<table>` com `th scope="col"` e **`th scope="row"` no termo**; `DecisionsTable.tsx` com `<caption>` visualmente oculto, `th scope="col"` Decisão, Ganho, Custo aceito; ambas dentro de contêiner `overflow-x: auto` com `tabindex="0"`, `role="region"` e `aria-label` (axe `scrollable-region-focusable`).
- **Testes:** `Tables.test.tsx` (V-03): `columnheader` Decisão, Ganho, Custo aceito; 4 linhas de 3 células; `caption` presente; `rowheader` no termo; região focável com nome.
- **Critérios de aceitação:** nenhuma célula vazia; ganho e custo sempre visíveis.
- **Arquivos prováveis:** `src/components/case/CaseBlocks.tsx`, `DecisionsTable.tsx`, `Tables.test.tsx`
- **Verificação:** `npx vitest run src/components/case/Tables.test.tsx` (exit 0); `npm run verify` (exit 0)

### T4.4 Cabeçalho, escopo, seção e índice (TD-010, decisões 4 e 6)
- **Requisito:** FR-003, FR-004, NFR-003 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T4.2, T4.3
- **Trabalho:** `CaseHeader.tsx` (selo, `h1`, resumo), `CaseScope.tsx` (`aside aria-labelledby` com `dl`), `CaseSection.tsx` (`section aria-labelledby`, `h2 id` do idioma, `scroll-margin-top`), `CaseIndex.tsx` (`nav aria-labelledby`, `ol` de `a href="#id"` com `tocLabel`).
- **Testes:** `CaseParts.test.tsx` (V-04, V-05): `dl` do escopo antes do primeiro `h2`; todo `href="#x"` do índice tem `id="x"` no artigo, em PT e EN; hierarquia `h1 > h2 > h3` sem saltos.
- **Critérios de aceitação:** rótulos do índice iguais aos atuais; âncoras por idioma.
- **Arquivos prováveis:** `src/components/case/CaseHeader.tsx`, `CaseScope.tsx`, `CaseSection.tsx`, `CaseIndex.tsx`, `CaseParts.test.tsx`
- **Verificação:** `npx vitest run src/components/case/CaseParts.test.tsx` (exit 0); `npm run verify` (exit 0)

### T4.5 Destaque da seção escolhida (TD-007, decisão 7)
- **Requisito:** FR-004, FR-009 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T4.4
- **Trabalho:** `src/hooks/useCurrentSection.ts` lê `location.hash` ao montar e em `hashchange` e devolve o id; `CaseIndex` marca `aria-current="location"` na âncora cujo `href` bate (comparação de texto com os `id` do conteúdo, nunca injeção). Sem `IntersectionObserver` nem rastreio de rolagem. Hash inexistente ou de outro idioma não destaca (EC-06, EC-07).
- **Testes:** `useCurrentSection.test.tsx` (V-06): hash inicial; `hashchange` muda a âncora; `#xyz` não destaca; `#contexto` em EN não destaca; o teste `state.test.ts` da 002 confere que a regra `[aria-current]` muda `text-decoration` ou `font-weight` (verificado na T4.7).
- **Critérios de aceitação:** sem JavaScript as âncoras seguem funcionando (a prova é a T5.3).
- **Arquivos prováveis:** `src/hooks/useCurrentSection.ts`, `useCurrentSection.test.tsx`, `src/components/case/CaseIndex.tsx`
- **Verificação:** `npx vitest run src/hooks/useCurrentSection.test.tsx src/components/case` (exit 0); `git grep -n IntersectionObserver -- src/hooks/useCurrentSection.ts src/components/case` (exit 1); `npm run verify` (exit 0)

### T4.6 Página `CaseStudy` por conteúdo (TD-009, TD-013)
- **Requisito:** FR-003, FR-005, FR-008, FR-009, NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.2, T4.4, T4.5
- **Trabalho:** reescrever `src/pages/CaseStudy.tsx`: lê o caso da rota (importa **o arquivo do caso direto**, não o registro nem o `zod`) e monta, na ordem do DOM: link "← Voltar aos projetos", cabeçalho, escopo, **índice**, `article` com as seções, botões finais ("Vamos conversar sobre isso →" vai a `/contato`). A página já não importa os componentes antigos. Segue `lazy` em `pages/lazyPages.ts`; `scripts/prerender.ts` e `src/test/setup.ts` não mudam.
- **Testes:** `CaseStudy.test.tsx`: renderiza PT e EN a partir do mesmo caso; ordem do DOM (V-04); 14 `h2`; `git grep` de importação (a página não importa `case-study/`, nem o registro, nem código de outras páginas).
- **Critérios de aceitação:** `/estudos-de-caso/whatsapp-dispatcher` e `/en/case-studies/whatsapp-dispatcher` renderizam o mesmo caso.
- **Arquivos prováveis:** `src/pages/CaseStudy.tsx`, `src/pages/CaseStudy.test.tsx`
- **Verificação:** `npx vitest run src/pages/CaseStudy.test.tsx` (exit 0); `git grep -n -E "case-study/|content/registry|zod" -- src/pages/CaseStudy.tsx` (exit 1); `npm run verify` (exit 0)

### T4.7 Estilo da página com os tokens da 002 (TD-008, TD-012)
- **Requisito:** FR-004, FR-005, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T4.6
- **Trabalho:** reescrever `src/styles/case-study.css` só com tokens (sem hex, sem `gradient(`): grid de duas colunas acima de 1024 px com índice `position: sticky`, uma coluna abaixo (índice no topo, **expandido**); `[aria-current]` com sublinhado e peso além da cor; foco visível; tabelas em contêiner rolável; `callout`, `tech` e `example` com rótulo; `prefers-reduced-motion` respeitado e **sem** `scroll-behavior: smooth` (EC-11). As classes `.case-*` antigas ficam (a T6.1 apaga o que sobrar sem uso).
- **Testes:** `styles.test.ts` e `contrast.test.ts` da 002 verdes com o arquivo novo; `state.test.ts` confere a regra `[aria-current]`.
- **Critérios de aceitação:** nenhum par de cor fora da matriz; nenhuma rolagem horizontal da **página**.
- **Arquivos prováveis:** `src/styles/case-study.css`
- **Verificação:** `npx vitest run src/styles` (exit 0); `git grep -n -i -E "gradient\(|#[0-9a-f]{3,8}\b" -- src/styles/case-study.css` (exit 1); `npm run verify` (exit 0)

---

## Fase 5: Provas
### T5.1 Teste de equivalência de texto (TD-006, design §9.1 passos 3 e 4)
- **Requisito:** FR-007 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.1, T4.6
- **Trabalho:** `src/content/caseEquivalence.test.tsx` renderiza a **página nova** nos dois idiomas com a mesma função de extração e a normalização única, e exige (a) a mesma **sequência de textos de bloco** do dourado, igualdade exata; (b) as mesmas **contagens** de `h2`, `h3`, `li` do corpo, linhas de tabela, `code` e itens do índice. Só duas diferenças declaradas no teste: `td` de termo como `th scope="row"` (etiqueta "célula de termo") e `<br>` como parágrafo. Falha mostra a primeira diferença (trecho e idioma).
- **Testes:** o próprio teste, mais prova de que ele reprova: um caractere alterado no conteúdo (cópia em memória) faz falhar apontando o trecho.
- **Critérios de aceitação:** verde nos dois idiomas; qualquer outra diferença falha; o dourado nunca é regerado para fazer passar.
- **Arquivos prováveis:** `src/content/caseEquivalence.test.tsx`
- **Verificação:** `npx vitest run src/content/caseEquivalence.test.tsx` (exit 0); `npm run verify` (exit 0)

### T5.2 Ligação projeto ↔ caso e troca de idioma (FR-006, FR-008, V-08, V-13)
- **Requisito:** FR-006, FR-008 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T4.6, **spec 005** (`ProjectDetail`)
- **Trabalho:** teste de integração: o detalhe do projeto `whatsapp-dispatcher` mostra "Ler o estudo de caso" apontando para o endereço do caso (via `caseByProject`), e um projeto sem caso **não** mostra o link; a troca de idioma (002, FR-021) leva de uma URL do caso à outra; o dado do caso não é copiado para o projeto.
- **Testes:** `caseLink.test.tsx`.
- **Critérios de aceitação:** link só quando há caso; as duas URLs resolvem o mesmo caso.
- **Arquivos prováveis:** `src/pages/caseLink.test.tsx`
- **Verificação:** `npx vitest run src/pages/caseLink.test.tsx src/content/cases.test.ts` (exit 0); `npm run verify` (exit 0)

### T5.3 Sem JavaScript, sem HTML injetado, orçamento (V-12, V-14, V-15)
- **Requisito:** FR-009, NFR-001, NFR-002 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T4.7, T5.1
- **Trabalho:** (a) `renderRoute` (002) em vitest: o HTML das duas rotas contém os 14 `h2`, as 3 tabelas e o índice, e `checkDist.mjs` confere o `dist`; (b) teste de texto: nenhum `dangerouslySetInnerHTML` em `src/components/case/` nem em `CaseStudy.tsx`; (c) teste de importação (a página não puxa código de outras páginas) e medição do chunk da rota com `measureBundle`, registrando o tamanho no `evidence.md`. Se passar do orçamento, **parar e propor** (R-07, plano B do TD-013).
- **Testes:** `caseStatic.test.ts`.
- **Critérios de aceitação:** HTML completo sem hidratação; chunk dentro do orçamento da 002/005 ou proposta à Duda.
- **Arquivos prováveis:** `src/pages/caseStatic.test.ts`
- **Verificação:** `npx vitest run src/pages/caseStatic.test.ts` (exit 0); `npm run build:prova && node scripts/checkDist.mjs dist-prova && node scripts/measureBundle.mjs dist-prova` (exit 0; tamanho no `evidence.md`); `npm run verify` (exit 0)

### T5.4 e2e: tela estreita, teclado, axe e capturas (V-07, V-09, V-10)
- **Requisito:** FR-002, FR-004, FR-005, NFR-001, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T5.3
- **Trabalho:** `e2e/case.e2e.ts` sobre `dist-prova` (se a prova não incluir a rota do caso, ajustar o build de prova como a 002 faz, sem mudar o publicado): em 390 px, `scrollWidth <= clientWidth` do `document`, índice acima do artigo (`boundingBox`) e tabela de decisões rolando **dentro** da região focável; Tab até um item do índice, Enter, a URL ganha o hash e `aria-current` muda; axe (`@axe-core/playwright`) sem violação nas duas URLs e nos dois temas; capturas de tela (390 px e 1280 px, claro e escuro) para a Duda, sem baseline automático. Lighthouse ≥ 95 (acessibilidade, SEO, boas práticas) pelo `scripts/lighthouseRun.mjs`.
- **Testes:** o próprio e2e.
- **Critérios de aceitação:** zero violações axe; sem rolagem horizontal da página; índice por teclado.
- **Arquivos prováveis:** `e2e/case.e2e.ts`, `e2e/shots/`
- **Verificação:** `npm run build:prova && npx playwright test --project=shell e2e/case.e2e.ts` (exit 0); `node scripts/lighthouseRun.mjs` (exit 0, notas no `evidence.md`); `npm run verify` (exit 0)

---

## Fase 6: Remover o código antigo
### T6.1 Remoção dos componentes antigos (design §11, P-Q-001)
- **Requisito:** FR-001 (nenhum texto de caso em componente) · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** **T5.1, T5.2, T5.3 e T5.4 verdes**, e a leitura da Duda das seções 1 e 2 do arquivo de conteúdo (ver "Ação da Duda")
- **Trabalho:** remover `src/pages/case-study/WhatsAppDispatcherPt.tsx`, `WhatsAppDispatcherEn.tsx` e a pasta; remover `scripts/migrateCase.*` e `scripts/freezeCaseGolden.mts`; apagar de `case-study.css` o que ficou sem uso e, de `tokens.css` (bloco LEGADO), os tokens que nenhum arquivo mais usa. **Ficam:** `src/data/resume.ts`, `src/data/projects.tsx` (donos: 003/007), a entrada em `routes.ts`, `scripts/prerender.ts` e `src/test/setup.ts`; os dourados e o `caseEquivalence.test.tsx` (a Duda decide a remoção depois do aceite).
- **Testes:** a suíte inteira, em especial a equivalência, continua verde sem o código antigo.
- **Critérios de aceitação:** nenhuma referência a `case-study/`, `WhatsAppDispatcherPt` ou `WhatsAppDispatcherEn`; `src/pages/case-study/` não existe.
- **Arquivos prováveis:** os listados no Trabalho
- **Verificação:** `git grep -n -E "WhatsAppDispatcher(Pt|En)|pages/case-study|migrateCase|freezeCaseGolden" -- src scripts e2e package.json vite.config.ts` (exit 1); `test ! -d src/pages/case-study` (exit 0); `npx vitest run src/content/caseEquivalence.test.tsx` (exit 0); `npm run verify` (exit 0)

---

## Dependências entre tarefas
```
T1.1 ─────────────────────────────────────────────┐
T2.1 ─► T2.2 ─► T2.3 ─┐                           │
         └─► T3.1 ────┴─► T3.2 ─┐                 │
T4.1 ─► T4.2 ─► T4.3 ─► T4.4 ─► T4.5 ─► T4.6 ─► T4.7
                                  (T3.2) ─┘  └─► T5.1 (T1.1) ─► T5.3 ─► T5.4 ─► T6.1
                                             └─► T5.2 (spec 005) ───────────────┘
```
T2.3 e T3.2 dependem da spec 003; T5.2, da 005. T1.1 e T4.1 a T4.5 podem andar sem elas.

## Ação da Duda (fora da contagem)
- Ler as seções 1 e 2 do `whatsapp-dispatcher.content.ts` (TD-005, mitigação de R-03) **antes da T6.1**.
- Olhar as capturas da T5.4 (aparência muda de propósito: tokens novos, `<br>` do PT virou parágrafo).
- Depois do aceite, decidir se remove os dourados e o teste de equivalência.

## Lacunas e perguntas abertas
| ID | Lacuna | Proposta |
| --- | --- | --- |
| TL-001 | 003 e 005 sem `tasks.md`: IDs de dependência não existem | Declarado por capacidade; ligar os IDs em revisão desta versão quando existirem |
| TL-002 | A 003 aceita só `**negrito**` na marcação dos projetos; o caso tem `Inline` próprio (`code`, `strong`, `em`) | Mantido separado (TD-002); se a Duda quiser unificar, é mudança de spec da 003 |
| TL-003 | Não confirmado se `build:prova` publica a rota do caso | A T5.4 verifica e ajusta o build de prova se preciso |

## Confirm before building
Antes de qualquer tarefa, o implementador restata com as próprias palavras e espera o OK explícito da Duda:
1. **FRs:** caso como dado validado em PT e EN, decisões com ganho e custo em tabela acessível, escopo no início, índice com destaque ao escolher a seção, índice no topo em tela estreita, ligação caso ↔ projeto, equivalência exata de texto, endereços atuais mantidos, caso inteiro no HTML sem JavaScript.
2. **Restrições:** branch `rebuild/sdd`, sem `git push`, nada na `main`; dourado antes de tudo e remoção só na T6.1; nenhum texto inventado ou resumido; limite do chunk não é editado em silêncio.
3. **Perguntas abertas:** TL-001 a TL-003.
Nada de código antes de `tasks:approved`.
