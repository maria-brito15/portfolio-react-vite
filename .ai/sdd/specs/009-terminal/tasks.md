# 009 Terminal, Tasks
**Status:** draft (ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (arquiteto, rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada), `design.md` (aprovado em 2026-11-19, com a seção "Decisões da Duda (2026-11-19)": DQ-001 a DQ-010 aceitas), modelos `specs/001` e `specs/002` (`tasks.md`).
**Estimativa total:** 17 tarefas, **50 h** (1 a 4 h cada), em 6 fases (0 a 5). A "Ação da Duda" (fora da contagem) está no fim.

## Como ler
- **Testes ficam dentro de cada tarefa.** Não há fase de testes separada.
- **Bloco de evidência** no fechamento de toda tarefa (conventions.md), em `evidence.md` nesta pasta, neste formato:
  ```
  Claim: <o que foi provado>
  Command: <comando exato>
  Exit code: <n>
  Summary: <o que o comando mostrou>
  Verdict: PASS | FAIL
  ```
- **Gate de cada tarefa:** `npm run verify` com exit 0 no fim. Nenhuma tarefa deixa o repositório quebrado: o terminal novo nasce com sufixo `.next` (como `Header.next.tsx` na 002) ao lado do antigo; a T3.1 faz a troca e a remoção no mesmo commit.
- **Commits** em português, `tipo(escopo): resumo`, citando o ID da tarefa e terminando com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. **Nenhuma tarefa inclui `git push`** e nada vai para a `main` (o Netlify publica a partir dela).
- **Orçamento da 001:** suíte ≤ 90 s, `verify` ≤ 180 s. Se um `verify` estourar, repetir com a máquina ociosa antes de culpar o código. **Nunca duas execuções de vitest ao mesmo tempo.**
- **`src.zip`** é arquivo da Duda: nenhuma tarefa o toca.
- **Spec 008 (`netlify/personal/`, `src/data/personal/*`, integrações): intocável.**
- **Windows:** arquivos com barra invertida, crases ou `\uXXXX` vão pelo Write, não por heredoc.
- **Texto de interface** em PT e EN (`src/i18n/ui.ts`, paridade da 001); **conteúdo** só da 003, só por `sources.ts`; nada inventado.
- **Remoção:** o design não removeu nada. A lista de remoção está **aprovada (DQ-010)**, mas só roda nas tarefas da Fase 3, **depois que a 003 fechar**. Cada tarefa de remoção lista os arquivos removidos no `evidence.md`.
- **Código da 002:** a Duda autorizou (DQ-006) mexer em `App.tsx`, `main.tsx` e `routes.ts`; **nenhum texto de `specs/002` muda** e `NotFound.tsx` não é editado.
- **`src/App.test.tsx` tem diff não commitado de outra tarefa** (2 linhas, em 2026-11-19). Antes de editar esse arquivo, o implementador roda `git diff src/App.test.tsx`, registra o resultado na evidência e **não sobrescreve** o diff alheio (se precisar de teste novo, cria arquivo próprio). Tarefas afetadas: T3.2, T3.3, T4.1.

## Dependência da spec 003 (conteúdo)
A 003 está em `design:approved`; ainda não há conteúdo em `src/content/`. Tudo o que lê conteúdo ou remove arquivos que a 003 substitui depende dela:
- **Bloqueadas até a 003 fechar** (`.status` da 003 em `implementation:done` ou posterior; a T0.1 confere): **T1.3, T1.4, T2.2, T3.1, T3.2, T3.3, T4.1, T5.1, T5.2, T5.3**.
- **Sem dependência de conteúdo** (podem começar antes, ver pergunta Q-T1): **T0.1, T0.2, T1.1, T1.2, T2.1, T2.3, T2.4**.
- Se o design/implementação da 003 renomear módulos, só `sources.ts` muda (TD-008). Os campos exatos do resumo de `curriculo` e `academico` são fixados na T1.3, a partir do design da 003, e voltam para o `design.md` desta spec (tabela "Saída de cada comando") para a Duda ver.

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados | OK: `requirements.md` v1.0 (2026-11-19) |
| Design aprovado | OK: `design:approved` em 2026-11-19 (`.status`) |
| Todo FR e NFR coberto | OK: FR-001 a FR-013 e NFR-001 a NFR-003 na tabela Coverage; nenhuma lacuna |
| Todo Q-* e DQ-* respondido | OK: Q-001 a Q-005 do requirements; DQ-001 a DQ-010 aceitas (seção "Decisões da Duda") |
| Toda tarefa tem dependência, critério e verificação | OK (ver cada tarefa) |
| Dependência dura da 003 | PENDENTE por natureza: tarefas listadas acima não começam antes de a 003 fechar |
| Diff alheio em `src/App.test.tsx` | Conferir antes de editar (regra acima) |
| Pontos que dependem de medição | orçamento de 10 KB JS, 3 KB CSS, 1 KB do lançador (T0.1 linha de base, T5.2 comparação). **Se não couber, parar e levar à Duda; o número não é editado em silêncio** |
| Verificações manuais | leitor de tela (NVDA e VoiceOver) na T5.3; sem Duda/dispositivo, a T5.3 fica `PENDENTE` e não é fechada |
| Estimativas de 4 h | T1.4, T2.2, T3.1, T4.1 e T5.1 concentram risco; se uma estourar 4 h, **parar e avisar a Duda** antes de seguir |

## Coverage
| Requisito | Tarefas |
| --- | --- |
| FR-001 (rota fora do menu, sem casca) | T2.4, T3.3, T5.1 |
| FR-002 (Sair é o primeiro item focável) | T2.2, T2.4, T5.1 |
| FR-003 (região ao vivo educada) | T2.2, T5.1 |
| FR-004 (desconhecido, "digite ajuda", mais parecido) | T1.1, T1.4 |
| FR-005 (exatamente oito comandos, atalho clicável) | T1.4, T2.2, T5.3 |
| FR-006 (equivalência com as páginas) | T1.3, T1.4 |
| FR-007 (Tab, setas, foco visível) | T1.1, T2.1, T2.2, T5.1 |
| FR-008 (idioma da rota, mesmo estado ao trocar) | T1.2, T2.2, T4.1 |
| FR-009 (sem JavaScript) | T2.4 |
| FR-010 (movimento reduzido) | T3.1 |
| FR-011 (remoção do código morto) | T3.1, T3.2, T3.3, T5.3 |
| FR-012 (terminal na 404) | T4.1, T5.1 |
| FR-013 (dica de primeira visita) | T2.3, T2.4 |
| NFR-001 (carga sob demanda, INP) | T0.1, T4.1, T5.1, T5.2 |
| NFR-002 (entrada é texto, sem terceiros) | T1.4, T2.2 |
| NFR-003 (WCAG 2.1 AA, foco nunca preso, equivalente em texto) | T2.2, T2.4, T5.1, T5.3 |
| Decisões TD-001 a TD-015 | T1.1 (TD-004, TD-006), T1.3 (TD-008), T1.4 (TD-002, TD-006, TD-007), T2.1 (TD-005), T2.2 (TD-003, TD-014), T2.3 (TD-012), T2.4 (TD-009), T3.1 (TD-001), T3.3 (TD-013), T4.1 (TD-010), T0.1/T5.2 (TD-011) |
| Verificações V-01 a V-18 | V-01: T3.3 · V-02, V-03: T2.2 · V-04: T1.1, T1.4 · V-05: T1.4, T3.1 · V-06: T1.3 · V-07: T2.1, T2.2 · V-08: T5.1 · V-09: T1.2, T2.2 · V-10: T2.4 · V-11: T3.1 · V-12: T5.3 · V-13: T4.1, T5.1 · V-14: T2.3 · V-15: T5.2 · V-16: T5.1 · V-17: T1.4, T2.2 · V-18: T5.1 |

---

## Fase 0: Pré-condições
### T0.1 Conferir a base e medir a linha de base (TD-011)
- **Requisito:** NFR-001 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** nenhuma
- **Trabalho:** (1) registrar o estado da 003 (`node scripts/status.mjs read 003-content-migration`); (2) registrar `git diff src/App.test.tsx` e `git status --short`; (3) medir a linha de base: `npm run build:prova` e `node scripts/measureBundle.mjs dist-prova`, anotando JS do 1º acesso, CSS, e o tamanho gzip do chunk atual de `TerminalPage` e de `terminal.css`; (4) listar as classes de `terminal.css` usadas por `NotFound.tsx` e `Prompt.tsx` (`.term-line`, `.t-prompt`, `.t-err`, `.not-found-cmd`, e as que a varredura achar).
- **Testes:** nenhum código novo; a medição e a lista ficam no `evidence.md`.
- **Critérios de aceitação:** `evidence.md` tem o estado da 003, o diff de `App.test.tsx`, os números da linha de base e a lista de classes. Nenhum arquivo de código alterado.
- **Arquivos prováveis:** `.ai/sdd/specs/009-terminal/evidence.md`
- **Verificação:** `node scripts/status.mjs read 003-content-migration`; `npm run build:prova && node scripts/measureBundle.mjs dist-prova` (exit 0); `git status --short` mostra só `evidence.md` novo desta tarefa.

### T0.2 Mover para o CSS da casca as classes que a 404 usa (risco "terminal.css")
- **Requisito:** NFR-001, FR-012 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T0.1
- **Trabalho:** mover as regras da lista da T0.1 de `src/styles/terminal.css` para o CSS que o 1º acesso já carrega (`shell.css` ou o arquivo da 404, o que a T0.1 indicar), sem mudar o visual. Nenhuma regra fica duplicada. `NotFound.tsx` não é editado.
- **Testes:** `src/styles/styles.test.ts` continua verde (sem hex fora de `tokens.css`, sem `gradient(`); teste novo `src/styles/notFoundCss.test.ts`: toda classe `term-*`/`t-*`/`not-found-*` citada em `NotFound.tsx` e `Prompt.tsx` está definida fora de `terminal.css`.
- **Critérios de aceitação:** `terminal.css` pode sair do `main.tsx` na T3.3 sem a 404 perder estilo; verify verde; e2e da 404 da 002 inalterado.
- **Arquivos prováveis:** `src/styles/terminal.css`, `src/styles/shell.css`, `src/styles/notFoundCss.test.ts`
- **Verificação:** `npx vitest run src/styles/notFoundCss.test.ts src/styles/styles.test.ts` (exit 0); `npm run verify` (exit 0).

---

## Fase 1: Núcleo puro (sem DOM)
Arquivos novos com sufixo `.next` onde o nome colide com o antigo (`commands.ts` x `commands.tsx` seria resolvido antes pelo Vite).

### T1.1 `blocks.ts` e `match.ts` (TD-004, TD-006)
- **Requisito:** FR-004, FR-007 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T0.1
- **Trabalho:** `src/terminal/blocks.ts` (tipo `Block`, `Entry`, `Command`, `CommandId`, conforme Data Model); `src/terminal/match.ts`: `fold` (minúsculas, sem acento), `candidates(prefix, lang)` (idioma da rota primeiro, depois o outro), `closest(text)` usando `levenshtein` de `src/utils/suggest.ts` (distância ≤ 2 e menor que metade do tamanho), `commonPrefix`. Puros.
- **Testes:** `src/terminal/match.test.ts`: `projt` sugere `projetos`; `trilhas`, `xyz` não sugerem nada; `Projetos`, `PROJETOS`, `projêtos` casam; candidatos de `p` em PT e EN; prefixo comum; vazio não casa.
- **Critérios de aceitação:** sem DOM, sem importar conteúdo; arquivos antigos intactos.
- **Arquivos prováveis:** `src/terminal/blocks.ts`, `src/terminal/match.ts`, `src/terminal/match.test.ts`
- **Verificação:** `npx vitest run src/terminal/match.test.ts` (exit 0); `npm run verify` (exit 0).

### T1.2 Texto da interface: bloco `terminal` em `ui.ts` (PT e EN)
- **Requisito:** FR-008, FR-004, FR-009, FR-012, FR-013 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T0.1
- **Trabalho:** acrescentar a `src/i18n/ui.ts` o bloco `terminal` (chaves do Interface Contract: `exit`, `title`, `hint`, `intro`, `commandLabel`, `shortcutsLabel`, `usage(name)`, `notFound(text)`, `didYouMean(name)`, `candidates`, `noJs`, `openOn404`, `closeOn404`, `opening`, `openFailed`, `pagesLabel` ("Prefere sem terminal?"), as oito descrições), PT e EN, sem `bash:`. O bloco `term` antigo **fica** até a T3.2.
- **Testes:** `src/terminal/parity.test.ts`: chaves de `ui.pt.terminal` e `ui.en.terminal` idênticas, nenhum valor vazio, nenhuma frase com `bash:`.
- **Critérios de aceitação:** paridade verde; nenhum texto de conteúdo (nome, projetos) no bloco.
- **Arquivos prováveis:** `src/i18n/ui.ts`, `src/terminal/parity.test.ts`
- **Verificação:** `npx vitest run src/terminal/parity.test.ts src/i18n` (exit 0); `npm run verify` (exit 0).

### T1.3 `sources.ts`: o único adaptador de conteúdo (TD-008) **[003]**
- **Requisito:** FR-006 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1, **003 fechada**
- **Trabalho:** (1) a partir do design e do conteúdo da 003, **fixar os campos exatos** do resumo de `curriculo` e `academico` e atualizar a tabela "Saída de cada comando" do `design.md` (mudança sinalizada à Duda no `evidence.md`); (2) `src/terminal/sources.ts`: `profileLine`, `projectLines` (ano; mês só se confirmado, `src/content/dates.ts`), `resumeSummary`, `academicSummary`, `contactChannels`, por idioma (`pick.ts`); único arquivo do terminal que importa conteúdo e a tabela de rotas (`routeById`, `pathInLang`).
- **Testes:** `src/terminal/equivalence.test.ts` (V-06): nomes de projeto da saída = nomes do conteúdo e mesma contagem; todo `href` é rota da tabela ou canal do conteúdo; **varredura**: nenhum arquivo de `src/terminal/*.ts(x)` (fora de `sources.ts` e testes) importa `src/content`; nenhum texto de conteúdo literal.
- **Critérios de aceitação:** nada de campo inventado (campo ausente no conteúdo não aparece); datas sem mês mostram só o ano.
- **Arquivos prováveis:** `src/terminal/sources.ts`, `src/terminal/equivalence.test.ts`, `.ai/sdd/specs/009-terminal/design.md`
- **Verificação:** `npx vitest run src/terminal/equivalence.test.ts` (exit 0); `npm run content:check` (exit 0); `npm run verify` (exit 0).

### T1.4 `commands.next.ts`: os oito comandos (TD-002, TD-006, TD-007) **[003]**
- **Requisito:** FR-004, FR-005, FR-006, NFR-002 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.1, T1.2, T1.3
- **Trabalho:** `src/terminal/commands.next.ts` (renomeado na T3.1): tabela de `ajuda`, `ls` (rotas com `menu: true` por `order`, `desc` da rota), `whoami` (link para `/curriculo`), `projetos`, `curriculo`, `academico`, `contato`, `home` (`{ navigate }` para `pathInLang('/', lang)`), com `routeId` nos de página; `runCommand(input, lang)` puro: `fold` do 1º token, nomes PT e EN valem nos dois idiomas, argumento extra gera `uso: <nome>` + "digite ajuda", desconhecido gera "<texto>: comando não encontrado. Digite “ajuda”." + `Quis dizer` quando houver, vazio devolve nada. Sem apelidos, sem `fetch`, sem `eval`.
- **Testes:** `src/terminal/commands.test.ts` (V-04, V-17): cada comando em PT e EN, com maiúscula e sem acento; saída não vazia nos dois idiomas; `projetos xyz` dá `uso:`; `trilhas` não sugere nada; `<img onerror=...>`, `javascript:` e `{{7*7}}` saem como texto; nenhum `fetch` no módulo (varredura). `src/terminal/removed.test.ts` (V-05): o conjunto de comandos é exatamente os oito; `neofetch`, `fortunes`, `agora`, `setup`, `cd`, `tema`, `idioma`, `trilhas`, `personas`, `jogos`, `assistente` respondem como desconhecidos; todo `routeId` existe na tabela (`routeById`) e o `href` da saída é `pathInLang(route.path, lang)`.
- **Critérios de aceitação:** cada comando de página tem rota equivalente; `ls` não escreve caminho nenhum à mão; o `removed.test.ts` da varredura de `neofetch|fortune|Matrix|BootSequence` em `src/` fica para a T3.1 (o código antigo ainda existe).
- **Arquivos prováveis:** `src/terminal/commands.next.ts`, `src/terminal/commands.test.ts`, `src/terminal/removed.test.ts`
- **Verificação:** `npx vitest run src/terminal/commands.test.ts src/terminal/removed.test.ts src/terminal/equivalence.test.ts` (exit 0); `npm run verify` (exit 0).

---

## Fase 2: Interface do terminal
### T2.1 `useTerminal.next.ts`: estado, histórico e Tab (TD-004, TD-005)
- **Requisito:** FR-007 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:** `useReducer`: entradas (no máximo 50 no registro), histórico das últimas 50 digitações aceitas (sem vazias, sem repetir a anterior), rascunho restaurado por ↓ no fim, Tab (um candidato completa; vários completam até o prefixo comum e acrescentam uma linha de candidatos; nenhum ou campo vazio não intercepta), `maxLength` 200 com corte do texto colado. Estado local ao componente, sem provedor global, sem armazenamento.
- **Testes:** `src/terminal/useTerminal.test.ts` (V-07): sequência de ↑/↓, rascunho, limite de 50, Tab completa, Tab ambíguo lista, Tab sem candidato devolve "não tratou" (o componente não chama `preventDefault`), entrada vazia não entra, 51ª entrada derruba a mais antiga.
- **Critérios de aceitação:** reducer puro e testável sem DOM; nenhum `setTimeout` de digitação.
- **Arquivos prováveis:** `src/terminal/useTerminal.next.ts`, `src/terminal/useTerminal.test.ts`
- **Verificação:** `npx vitest run src/terminal/useTerminal.test.ts` (exit 0); `npm run verify` (exit 0).

### T2.2 `Terminal.next.tsx`, `TerminalOutput.next.tsx` e `terminal.next.css` (TD-003, TD-014) **[003]**
- **Requisito:** FR-002, FR-003, FR-007, FR-008, NFR-002, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.4, T2.1, T0.2
- **Trabalho:** `TerminalOutput` desenha `Block[]` (linha, chave/valor, link) como texto do React; `Terminal`: introdução e dica **fora** do log, `div role="log" aria-live="polite"` vazio desde a montagem que **acrescenta** um nó por comando (eco com `$` `aria-hidden`), formulário com `<label>` oculto "Comando", `autocomplete="off"`, `autocapitalize="none"`, `spellcheck="false"`, `enterkeyhint="send"`, atalhos em `role="group"` (um botão por comando, alvo ≥ 44 px, devolvem o foco à linha), sem autofoco, sem Ctrl+L/Ctrl+C/Esc, rolagem `block: 'nearest'` sem animação sob movimento reduzido. Trocar de idioma re-desenha as entradas sem reexecutar (`Entry.output(lang)`). O CSS novo (`terminal.next.css`, importado pelo `Terminal`, sem `animation`/`transition` fora de movimento reduzido) usa só tokens.
- **Testes:** `src/terminal/Terminal.test.tsx` (V-02, V-03, V-07, V-09, V-17): primeiro item focável do `main` é "Sair do terminal" e não há autofoco; log presente e vazio antes do 1º comando, `aria-live="polite"`, comandos acrescentam nós sem trocar os anteriores; Enter, Tab, ↑/↓ pela tela; atalho executa e devolve o foco; troca de idioma re-desenha sem perder entradas; entrada hostil sai como texto.
- **Critérios de aceitação:** só o conteúdo de `sources.ts` aparece; nenhum `dangerouslySetInnerHTML`; Tab sem candidato não é interceptado.
- **Arquivos prováveis:** `src/terminal/Terminal.next.tsx`, `src/terminal/TerminalOutput.next.tsx`, `src/styles/terminal.next.css`, `src/terminal/Terminal.next.test.tsx`
- **Verificação:** `npx vitest run src/terminal/Terminal.next.test.tsx` (exit 0); `npm run verify` (exit 0). (O arquivo de teste ganha o nome `Terminal.test.tsx` na T3.1, ao substituir o antigo.)

### T2.3 `hint.ts`: dica de primeira visita (TD-012)
- **Requisito:** FR-013 · **Prioridade:** P1 · **Estimativa:** 1 h · **Dependências:** T0.1
- **Trabalho:** `src/terminal/hint.ts`: leitura/escrita de `localStorage['portfolio-terminal-hint']` em `try/catch`, `useSyncExternalStore` com snapshot de servidor "não vista"; a marca é gravada **ao abrir** o terminal (DQ-008).
- **Testes:** `src/terminal/hint.test.ts` (V-14): 1ª visita mostra, 2ª não; com `localStorage` que lança erro mostra em toda visita e não lança.
- **Critérios de aceitação:** nada mais usa armazenamento no terminal.
- **Arquivos prováveis:** `src/terminal/hint.ts`, `src/terminal/hint.test.ts`
- **Verificação:** `npx vitest run src/terminal/hint.test.ts` (exit 0); `npm run verify` (exit 0).

### T2.4 `TerminalPage.next.tsx` e o HTML pré-renderizado (TD-009)
- **Requisito:** FR-001, FR-002, FR-009, FR-013, NFR-003 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.3, T1.2 (o `Terminal` monta depois da hidratação; usa um marcador até a T2.2)
- **Trabalho:** `main` da variante `bare` com `a` "Sair do terminal" (primeiro item), `h1` "Terminal", dica (escondida com `hidden` após a hidratação se já vista, sem mudar a altura), seção do terminal só no cliente (`useSyncExternalStore`, snapshot de servidor `false`), `nav aria-label="Páginas"` com a lista "Prefere sem terminal?" (um link por rota de menu, lida da tabela) sempre visível, e `<noscript>` "O terminal precisa de JavaScript. Use as páginas acima". Conferir que o `prerender` emite o `<noscript>`; se não, fallback do TD-009 (parágrafo `hidden` revelado só sem JS por CSS).
- **Testes:** `scripts/prerenderTerminal.test.ts` (V-10): HTML de `/terminal` e `/en/terminal` tem um `h1`, "Sair do terminal" primeiro, a lista de rotas do menu como links, a mensagem sem JavaScript, e **não** tem o formulário.
- **Critérios de aceitação:** sem divergência de hidratação (nenhum aviso no teste de hidratação existente da 002); `/terminal` segue fora do menu.
- **Arquivos prováveis:** `src/pages/TerminalPage.next.tsx`, `scripts/prerenderTerminal.test.ts`
- **Verificação:** `npx vitest run scripts/prerenderTerminal.test.ts` (exit 0); `npm run build` e `node scripts/checkDist.mjs dist` (exit 0); `npm run verify` (exit 0).

---

## Fase 3: Troca e remoção (FR-011; só depois da 003 fechar) **[003]**
### T3.1 Trocar o terminal e remover `src/terminal/` antigo (TD-001)
- **Requisito:** FR-005, FR-010, FR-011 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.2, T2.4, T1.4, **003 fechada**
- **Trabalho:** renomear `*.next.*` para os nomes finais (`commands.ts`, `Terminal.tsx`, `TerminalOutput.tsx`, `useTerminal.ts`, `TerminalPage.tsx`, `terminal.css`, testes) e **remover** (lista aprovada, DQ-010): `src/terminal/extras/` inteira (com `ascii.test.ts`, `Boot.test.tsx`, `extras.test.tsx`, `personal.test.tsx`, `phase3.test.tsx`), `commands.tsx`, `TerminalSession.tsx`, `sessionContext.ts`, `outputs.tsx`, `views.tsx`, `sectionViews.tsx`, `sectionsHelpers.ts`, `pageIndex.tsx`, `catalog.ts`, `CommandInput.tsx`, e os testes `deadCode.test.ts`, `redirect.test.tsx`, `sections.index.test.tsx`, `sections.nav.test.tsx`, `sections.pagesA.test.tsx`, `sections.pagesB.test.tsx`, `Terminal.test.tsx` (antigo). **Fica:** `Prompt.tsx`, `src/utils/suggest.ts`, `suggestRoutes.ts`, `shortcuts.ts`, `sections.ts`, `lazyPages.ts`. Antes de apagar cada arquivo, confirmar por `git grep` que nenhum arquivo que fica o importa; `tsc` pega o resto.
- **Testes:** acrescentar ao `removed.test.ts` a varredura: nenhum arquivo de `src/` contém `neofetch`, `fortune`, `Matrix`, `BootSequence`; `src/styles/styles.test.ts` e `removed.test.ts` (V-11): CSS do terminal sem `animation`/`transition` fora de movimento reduzido e nenhum timer de digitação no código.
- **Critérios de aceitação:** `/terminal` funciona com o terminal novo; nenhum arquivo `*.next.*` sobra em `src/terminal`; a lista de arquivos removidos vai para o `evidence.md`.
- **Arquivos prováveis:** `src/terminal/*`, `src/pages/TerminalPage.tsx`, `src/styles/terminal.css`
- **Verificação:** `git ls-files "src/terminal/*.next.*" "src/**/*.next.*"` (vazio); `npx vitest run src/terminal src/styles` (exit 0); `npm run verify` (exit 0).

### T3.2 Remover o que fica fora de `src/terminal/` (CommandCatalog, RunButton, fortunes, `ui.term`)
- **Requisito:** FR-011 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.1
- **Trabalho:** remover `src/components/CommandCatalog.tsx`, `src/components/RunButton.tsx`, `src/data/fortunes.ts`; em `src/i18n/ui.ts` remover `term` (inclui `term.nav.*`, `firstVisit`, `try`, `degrees`, `hours`) e `ws.terminal.*`, **conferindo antes** (`git grep`) que `cmdbar.*` e `ws.*` restantes não são lidos só por eles; em `e2e/site.e2e.ts` remover o teste "comando stats no terminal"; ajustar (sem apagar o arquivo) `src/components/Overlays.test.tsx`, `src/pages/InfoPages.test.tsx`, `src/pages/Workspace.test.tsx`, `src/appImports.test.ts` (caso `TerminalProvider`/`RunButton`/`CommandCatalog`). **`src/App.test.tsx`: aplicar a regra do diff alheio antes de qualquer edição.**
- **Testes:** os arquivos ajustados passam; `src/i18n` (paridade) verde.
- **Critérios de aceitação:** nenhum resíduo dos nomes removidos; só o que o terminal antigo usava é apagado.
- **Arquivos prováveis:** os listados acima.
- **Verificação:** `git grep -n -i -E "TerminalProvider|RunButton|CommandCatalog|fortunes" -- src e2e` (exit 1, sem saída); `npx vitest run src/components src/pages src/i18n src/appImports.test.ts` (exit 0); `npm run verify` (exit 0).

### T3.3 Limpar `routes.ts` e `main.tsx`, sem `?cmd=` (TD-013, DQ-006)
- **Requisito:** FR-001, FR-011 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T3.1, T0.2
- **Trabalho:** em `src/data/routes.ts` remover `terminalUrl` e o campo `command` das rotas; simplificar `legacyCommandTarget` para levar `/?cmd=…` a `/terminal` sem query (o uso em `src/router.tsx` fica); em `src/main.tsx` remover `import './styles/terminal.css'` (o `Terminal` importa o CSS). Ajustar `src/data/routes.test.ts`. **Nenhum texto da spec 002 muda.** Regra do diff de `src/App.test.tsx` se for tocado.
- **Testes:** `src/data/routes.test.ts` (V-01): `terminal` é `bare`, fora do menu, não aparece em `ls` nem na navegação, `/en/terminal` existe; teste de que `/?cmd=ajuda` leva a `/terminal`.
- **Critérios de aceitação:** nenhuma rota carrega `command`; a 404 mantém o estilo (T0.2); build verde.
- **Arquivos prováveis:** `src/data/routes.ts`, `src/data/routes.test.ts`, `src/router.tsx`, `src/main.tsx`
- **Verificação:** `git grep -n -E "terminalUrl|command:" -- src/data/routes.ts src/router.tsx` (exit 1); `npx vitest run src/data/routes.test.ts` (exit 0); `npm run verify` (exit 0).

---

## Fase 4: Terminal na 404
### T4.1 `NotFoundTerminal` e o lançador `lazy` (TD-010) **[003]**
- **Requisito:** FR-012, FR-008, NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.1, T0.2
- **Trabalho:** `src/terminal/NotFoundTerminal.tsx` (chunk próprio): botão "Abrir o terminal" só após a hidratação, 44 px reservados no HTML estático (sem CLS), `import('./Terminal')` antecipado no foco/ponteiro e no clique (`aria-busy`, "Abrindo…"), foco na linha de comando ao montar, "Fechar o terminal" como 1º item (desmonta e devolve o foco ao botão), `openFailed` se o chunk falhar; `lazyPages.ts` exporta o lançador; `App.tsx`, no `default` do `Page`, devolve `<><NotFound /><Suspense fallback={null}><NotFoundTerminal /></Suspense></>`. `NotFound.tsx` e o texto da 002 **não mudam**; o status 404 não é tocado. Regra do diff de `src/App.test.tsx`: teste novo em arquivo próprio.
- **Testes:** `src/terminal/NotFoundTerminal.test.tsx` (V-13): o texto, as sugestões e os links da 002 continuam; o botão só existe após a hidratação; clicar monta o terminal com foco na linha; os oito comandos funcionam; "Fechar" devolve o foco; `home` navega; falha de import mostra `openFailed`; trocar de idioma re-desenha sem perder entradas. Comparação do HTML pré-renderizado da 404 com o da 002 (só a altura reservada difere).
- **Critérios de aceitação:** o 1º acesso da 404 não baixa o terminal; a informação da 404 nunca depende dele.
- **Arquivos prováveis:** `src/terminal/NotFoundTerminal.tsx`, `src/terminal/NotFoundTerminal.test.tsx`, `src/pages/lazyPages.ts`, `src/App.tsx`
- **Verificação:** `npx vitest run src/terminal/NotFoundTerminal.test.tsx src/pages` (exit 0); `npm run build && node scripts/checkDist.mjs dist` (exit 0); `npm run verify` (exit 0).

---

## Fase 5: Navegador, medição e fechamento
### T5.1 `e2e/terminal.e2e.ts`: teclado, axe, 404 e INP **[003]**
- **Requisito:** FR-001, FR-002, FR-003, FR-007, FR-012, NFR-001, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.3, T4.1
- **Trabalho:** e2e novo (sem alterar `scripts/inpRun.mjs`): só teclado da abertura até `home`, foco visível, Tab e Shift+Tab saem do campo (foco nunca preso); axe sem violação em `/terminal` e `/en/terminal`, claro e escuro, com saída longa e com erro; contraste ≥ 4,5:1; 404 (abrir, oito comandos, fechar, `home`); INP ≤ 200 ms em `ajuda` e `projetos` (`PerformanceObserver` de `event`).
- **Testes:** o próprio e2e (V-08, V-13, V-16, V-18).
- **Critérios de aceitação:** todos os grupos (`-g axe`, `-g 404`, `-g INP`) verdes; capturas no padrão do `e2e/shots`, se a 002 já o usa.
- **Arquivos prováveis:** `e2e/terminal.e2e.ts`, `playwright.config.*` (só se faltar projeto)
- **Verificação:** `npx playwright test e2e/terminal.e2e.ts` (exit 0); `npx playwright test e2e/terminal.e2e.ts -g axe`; `-g 404`; `-g INP` (exit 0 cada). Se o Chrome não puder rodar na máquina, a tarefa fica `PENDENTE` (como a medição da 002), não `PASS`.

### T5.2 Orçamento de JS e CSS do terminal (TD-011, DQ-005) **[003]**
- **Requisito:** NFR-001 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.3, T4.1, T0.1
- **Trabalho:** estender `scripts/measureBundle.mjs` (com teste em `scripts/measureBundle.test.ts`) para medir, em gzip, o chunk do terminal (sem React nem chunks compartilhados), o CSS do terminal e o lançador da 404; checar que `main.tsx` não importa `terminal.css`. Comparar com a linha de base da T0.1.
- **Testes:** `scripts/measureBundle.test.ts` cobre a nova checagem (limite excedido reprova; dentro passa).
- **Critérios de aceitação:** (V-15) JS do 1º acesso ≤ 100 KB **e sem aumento medido** contra a linha de base; chunk do terminal ≤ 10 KB; CSS ≤ 3 KB; lançador ≤ 1 KB. **Se não couber: parar e levar à Duda; não editar o número.**
- **Arquivos prováveis:** `scripts/measureBundle.mjs`, `scripts/measureBundle.test.ts`
- **Verificação:** `npm run build:prova && node scripts/measureBundle.mjs dist-prova` (exit 0, com os 3 números impressos); `npx vitest run scripts/measureBundle.test.ts` (exit 0); `git grep -n "terminal.css" -- src/main.tsx` (exit 1).

### T5.3 Fechamento: resíduos, `verify` e leitor de tela (FR-011, NFR-003)
- **Requisito:** FR-005, FR-011, NFR-003 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.1, T5.2
- **Trabalho:** (1) V-12: `git grep` de resíduos; (2) inventário dos oito comandos e atalhos clicáveis (`removed.test.ts` verde); (3) `npm run verify` completo, anotando tempos contra o orçamento (suíte ≤ 90 s, `verify` ≤ 180 s); (4) teste manual com NVDA e VoiceOver (anúncio por comando, ordem do foco, saída longa), registrado no `evidence.md` (se algum não estiver disponível, a pendência é nomeada e a Duda decide); (5) atualizar `.ai/sdd/INDEX.md`; (6) listar todos os arquivos removidos da spec.
- **Testes:** os já existentes; nenhum novo.
- **Critérios de aceitação:** nenhum resíduo; `verify` exit 0 nos tempos; evidência manual registrada ou pendência explícita.
- **Arquivos prováveis:** `.ai/sdd/specs/009-terminal/evidence.md`, `.ai/sdd/INDEX.md`
- **Verificação:** `git grep -n -i -E "neofetch|fortune|BootSequence|TerminalProvider|RunButton|CommandCatalog|terminalUrl" -- src e2e` (exit 1, sem saída); `npm run verify` (exit 0).

---

## Ação da Duda (fora da contagem)
1. Promover este `tasks.md` (`tasks:draft` para `tasks:approved`); só ela.
2. Fechar a 003 antes da Fase 1 de conteúdo e da Fase 3.
3. Rodar ou acompanhar o teste manual com leitor de tela (T5.3) e decidir se o Chrome local basta para T5.1.
4. Responder as perguntas abertas abaixo.

## Perguntas abertas
- **Q-T1:** o design (TD-008) diz que nenhuma tarefa começa antes da 003. Este `tasks.md` libera T0.1, T0.2, T1.1, T1.2, T2.1, T2.3 e T2.4 (sem conteúdo) para adiantar, e bloqueia as demais. Serve, ou prefere tudo só depois da 003?
- **Q-T2:** os campos exatos de `curriculo` e `academico` são fixados na T1.3 e voltam ao `design.md`. A Duda quer revisar essa alteração antes do código, ou basta o registro na evidência?

## Confirm before building
Antes de qualquer tarefa de implementação, o implementador restata com as próprias palavras e espera o **OK explícito da Duda**:
1. **FRs (resumo):** terminal em `/terminal` e `/en/terminal` sem casca e fora do menu, "Sair" primeiro, oito comandos sem argumento, saída em região ao vivo educada, Tab e setas, conteúdo só da 003, sem JavaScript uma lista de páginas e mensagem, terminal sob demanda na 404, dica de primeira visita, remoção do código antigo.
2. **Restrições:** branch `rebuild/sdd`, nenhum `git push`, nada na `main`; remoção só nas tarefas e só depois da 003; diff alheio de `src/App.test.tsx` conferido antes de editar; `NotFound.tsx` e o texto da 002 intocados; orçamento 10 KB JS, 3 KB CSS, 1 KB lançador não editado em silêncio.
3. **Perguntas abertas:** Q-T1 e Q-T2.
Nada de código antes de `tasks:approved`.
