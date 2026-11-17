# 002 Design system and shell, revisão do tasks.md
**Alvo:** `tasks.md` v1.0 (`tasks:draft`) · **Contra:** `requirements.md` v1.6, `design.md` v2.2, `.ai/steering/*`, `AGENTS.md` · **Data:** 2026-11-17 · **Revisor:** Claude (contexto novo; não editei requirements, design, tasks nem `.status`; nenhum commit)

## Veredito
**Não recomendo promover a `tasks:approved` antes de corrigir os achados A-01 a A-05 (Alta).** Três deles (A-01, A-03, A-04) fazem o `npm run verify` reprovar numa tarefa que o texto diz deixar o repositório verde; um (A-02) quebra o gate de 11 arquivos de teste que são da spec 008; um (A-05) é uma ordem impossível (a rota `/_prova` entra na tabela duas fases antes do filtro que a esconde). A estrutura geral (27 tarefas, 89 h, 7 fases, cobertura de FR/NFR) está sólida.

Todo FAIL abaixo vira "spec fix needed" no documento indicado. Nenhum requisito novo foi criado: os achados só apontam lacunas e inconsistências.

## Verificações mecânicas (com evidência)
```
Claim:     tasks.md tem 27 tarefas, cada uma com estimativa de 1 a 4 h, soma 89 h
Command:   grep -c "^### T[0-9]" tasks.md; grep -o "Estimativa:\*\* [0-9]* h" tasks.md | awk '{s+=$2;n++;if($2<1||$2>4)bad++} END{print n,s,bad+0}'
Exit code: 0
Summary:   27 tarefas; 27 estimativas; soma 89; 0 fora de 1 a 4 h. Por fase: F0 4, F1 20, F2 20, F3 24, F4 10, F5 12, F6 3
Verdict:   PASS
```
```
Claim:     IDs de tarefa sem duplicata e todo FR-001..FR-041 aparece em tasks.md
Command:   grep -o "^### T[0-9.]*" tasks.md | sort | uniq -d | wc -l; for i in $(seq -w 1 41); do grep -q "FR-0$i" tasks.md || echo "sem FR-0$i"; done
Exit code: 0
Summary:   0 duplicatas; 0 FR ausentes (FR-033 só como conferência na T6.1, correto: Won't)
Verdict:   PASS (a cobertura por tarefa, não só a citação, está em A-08 e A-09)
```
```
Claim:     `npm run verify` não roda e2e, então ajustes em `e2e/site.e2e.ts` não são pegos pelo gate
Command:   grep -n "e2e" scripts/verify.mjs; grep -n "site.e2e" tasks.md
Exit code: 1 (nenhuma ocorrência em nenhum dos dois)
Summary:   verify.mjs não cita e2e; tasks.md não cita `e2e/site.e2e.ts`, que o design lista como "ajustado"
Verdict:   FAIL (ver A-07)
```
Os demais achados citam o comando de cada prova no próprio corpo. Nenhuma tarefa foi executada (a spec está em `tasks:draft`; AGENTS.md proíbe código antes de `tasks:approved`), então os vereditos sobre tarefas são sobre o **texto** das tarefas contra o estado atual do repositório.

---

## Achados

### A-01 · Alta · T1.1: o critério e a verificação falham contra o repositório de hoje
**Evidência.** T1.1 exige "nenhum hex fora de `tokens.css`" e `git grep -n -i "gradient(" -- src/styles` com **exit 1**, com "as páginas antigas intactas". Hoje:
- `src/styles/base.css` linhas 57 e 58 têm dois `linear-gradient(` (o bloco `.grid-bg`), que só sai na **T3.4**;
- `src/styles/resume.css` linhas 390 a 422 têm `#fff`, `#000`, `#333` num bloco de impressão (página do currículo, spec 007; o design a deixa "até a spec de cada página").
Comando: `grep -n "gradient(" src/styles/base.css` (2 linhas); `grep -n -E "#[0-9a-fA-F]{3,8}\b" src/styles/*.css | grep -v tokens.css` (vários).
**Efeito.** T1.1 não fecha, ou o implementador afrouxa o teste em silêncio.
**Correção (spec fix needed: tasks.md, T1.1 e T3.4).** Escolher e escrever: (a) mover a remoção do `.grid-bg` para a T1.1; e (b) decidir o destino dos hex do bloco de impressão do `resume.css` (isentar o `@media print` no teste, com lista explícita e dono, ou mapear para tokens, o que toca CSS da 007). A (b) é pergunta para a Duda, não para o implementador.

### A-02 · Alta · T2.5: o fim da leitura de `portfolio-lang` quebra 11 arquivos de teste que a spec não lista (e que são da 008)
**Evidência.** `grep -rln "portfolio-lang" src` acha 11 arquivos de teste além do `App.test.tsx`: `src/components/personal/{badges,books,curated,editorial,films,foundation,hub,hubCards,pages,qa}.test.tsx` e `src/data/personalRoutes.test.tsx`, mais `src/terminal/extras/personal.test.tsx` e `src/terminal/sections.index.test.tsx` (terminal). Eles fazem `localStorage.setItem('portfolio-lang', 'en')` para renderizar em inglês (ex.: `hub.test.tsx:154`, `pages.test.tsx:79`). Pelo TD-007/T2.5, o `LanguageProvider` deixa de consultar o `localStorage`, então esses testes passam a renderizar em PT e reprovam. A T2.5 só lista `i18n`, `useDocumentMeta.test.tsx` e `App.test.tsx`.
**Efeito.** (1) O `verify` da T2.5 reprova. (2) Ajustar esses testes é tocar arquivos da 008, e o tasks.md (linha 14) só autoriza a extração de `draft` em `routes.ts`.
**Correção (spec fix needed: tasks.md, T2.5 e a regra "Spec 008 intocável", linha 14).** Listar os arquivos afetados na T2.5 e declarar na regra que a mudança é **só de teste** (trocar o `localStorage` por abrir o caminho `/en/...` ou pelo `initial` do `RouterProvider`), sem alterar asserção de comportamento; pedir à Duda a extensão da autorização da DQ-017 para esses arquivos (a DQ-017 cobre "só o `draft`"). O mesmo vale para a T3.3 (A-06).

### A-03 · Alta · T3.4: apagar `workspace.css` quebra o `vite build` até a T4.3
**Evidência.** `src/main.tsx:15` faz `import './styles/workspace.css';` e o design (linha 318) diz que a remoção do import acontece em `main.tsx`, mas a T4.3 é quem o cita ("sem importar `shell.css`/`workspace.css` antigos"). A T3.4 apaga `workspace.css` e não cita `main.tsx`. Entre a T3.4 e a T4.3 o `vite build` (etapa do `verify`) falha com import inexistente.
**Correção (spec fix needed: tasks.md, T3.4 e T4.3).** Acrescentar `src/main.tsx` aos "Arquivos prováveis" da T3.4 e tirar o import do `workspace.css` lá; a T4.3 fica só com `hydrateRoot`. Acrescentar à verificação da T3.4 `git grep -n "workspace.css" -- src index.html` (exit 1).

### A-04 · Alta · T3.2 substitui o `Header.tsx` antes de a T3.3 trocar o `SiteShell`
**Evidência.** `src/components/shell/SiteShell.tsx:78` renderiza `<Header menuOpen={menuOpen} menuId={menuId} onMenu={...} />`. A T3.2 reescreve `Header.tsx` (marca, `nav`, tema, idioma, `Menu`) e só a T3.3 troca o `SiteShell`. Com o `Header` novo sem essas props, o `tsc --noEmit` do `verify` reprova na T3.2 (o texto da T3.2 promete gate verde). O mesmo risco, menor, vale para o `Footer.tsx` da T3.1.
**Correção (spec fix needed: tasks.md, T3.1 a T3.3).** Duas opções para a Duda: (a) a T3.2 e a T3.1 criam os componentes novos com nome novo ou em arquivo novo e a T3.3 faz a troca no lugar (o design TD-018 manda "no mesmo caminho", então precisa de uma frase de exceção); ou (b) fundir a troca do `SiteShell` na T3.2 (estourando as 4 h: ver A-10). Hoje o tasks.md não escolheu.

### A-05 · Alta · A rota `/_prova` entra na tabela na T2.2 e o filtro `__PROVA__` só nasce na T5.1
**Evidência.** T2.2 declara "`/_prova` declarada com `prova: true`". O filtro (`__PROVA__` no cliente, opção do plugin no Node, `routes.test.ts` "sem `__PROVA__` a rota é filtrada") e a página `Prova.tsx` são da **T5.1**. Mas a T4.1 gera o HTML "para **cada rota × idioma**" (e cita "404 e `/_prova` sem `hreflang`"), e a T4.2 grava `dist/` e `checkDist.mjs` exige `<main>` e `<h1>` em cada rota. Entre a T4.1 e a T5.1: ou o build publicado (`dist/`) contém `/_prova` (viola o requirements, Definições e Success Metrics, e o design TD-009), ou a rota quebra o teste por não ter página.
**Correção (spec fix needed: tasks.md, T2.2, T4.1, T5.1).** Mover para a T2.2 (ou T4.1) o filtro por `__PROVA__`/opção do plugin e uma `Prova.tsx` mínima, deixando para a T5.1 o `build:prova`, o conteúdo completo e o teste das duas configurações. Alternativa: a T2.2 só declarar `/_prova` quando a T5.1 chegar.

### A-06 · Média · T3.3 e T2.1 mexem em código da 008 além do que a regra da linha 14 autoriza
**Evidência.** A regra lista como intocável `netlify/personal/`, `personal-*.mts`, `scripts/personalGuard.*`, integrações, `@netlify/blobs`, `[functions]` e `.env.example`; a exceção única é o cálculo de `draft` em `routes.ts`. Mas:
- T3.3 tira o `<SiteShell>` de `src/components/personal/EditorialPage.tsx` (a lista de 10 páginas vem do design, aprovado), e "ajusta consultas de testes que assumem a casca antiga", o que alcança `src/components/personal/*.test.tsx` e `src/pages/personal`;
- T2.1 altera `src/components/personal/HubIndex.tsx` e `personalRoutes.test.tsx`/`personalDiscovery.test.tsx`;
- a verificação `git diff --stat -- netlify scripts/personalGuard.ts src/services src/data/personal` (vazia) **não cobre** `src/components/personal` nem `src/pages/personal`, e a T6.1 promete "nada da 008 além do `draft`", o que a própria T3.3 contradiz.
**Correção (spec fix needed: tasks.md, linha 14 e T6.1).** Definir "008 intocável" por lista fechada de caminhos e separar "mudança de casca/teste, sem tocar conteúdo nem comportamento" do resto; ajustar o `git diff --stat` da T2.1 e da T6.1 à mesma lista; registrar a autorização da Duda para os arquivos de `components/personal` e `pages/personal` (ver A-02).

### A-07 · Média · `e2e/site.e2e.ts` ajustado pelo design não tem tarefa
**Evidência.** Design (tabela "Arquivos que esta spec remove ou substitui", linha 317): `e2e/site.e2e.ts` **ajustado** "só no que assume a casca antiga". tasks.md não o cita (ver o bloco de verificação acima). O `verify` não roda e2e, então o quebrar passa despercebido; a T5.2 só passa a rodar o servidor atual do `vite` para "os e2e existentes" depois.
**Correção (spec fix needed: tasks.md, T3.4 ou T5.2).** Atribuir o ajuste a uma tarefa e pôr `npx playwright test e2e/site.e2e.ts` na verificação dela (como a T5.2 já usa o Playwright).

### A-08 · Média · Cobertura incompleta: FR-041 no boot, FR-016 com faixa visível, FR-005/FR-023/FR-024 na tabela
1. **FR-041 + faixa reservada.** O design (TD-012) diz que o build grava `data-shell="bare"` no `<html>` e que o boot precisa saber disso para não reservar o espaço da faixa. `grep -n "data-shell\|bare" tasks.md` não acha esse atributo em nenhuma tarefa: a `languageOffer` da T1.3 (entrada `{ path, storedLang, dismissed, navigatorLangs, storageOk }`) não tem a variante, e T4.1/T4.2 não gravam o atributo. Efeito: em `/terminal` com navegador em inglês o CSS reservaria um espaço em branco no topo e violaria "SHALL NOT exibir a faixa de idioma nela" (FR-041). Correção: T1.3 (entrada ou regra do `data-shell`), T4.1/T4.2 (gravar o atributo) e teste em `prerender.test.ts`.
2. **FR-016 "WHILE a faixa estiver visível, ela vem logo depois do skip link".** Nenhum teste da T2.6, T3.3 ou T5.2 prova a posição no DOM/foco. T5.2 compara a sequência sem a faixa. Correção: acrescentar um caso (idioma do navegador em inglês) ao e2e da T5.2 e/ou ao `SiteShell.test.tsx`.
3. **Tabela Coverage.** FR-005 (tema antes do 1º desenho), FR-023 e FR-024 (`lang`, `hreflang`) são provados por `prerender.test.ts` (T4.1; V-09), mas a linha da tabela só cita T1.x e T2.x. FR-020 não tem linha própria (agrupado). Correção (spec fix needed: tasks.md, Coverage): citar T4.1/T4.2 nessas linhas.

### A-09 · Média · Verificações sem comando/exit code ou fracas
- **T0.1:** `spike-002.md` existe e `git status --short` sem mudança fora dele: não há comando com exit code. Sugerido: `test -f .../spike-002.md` e `git diff --name-only` filtrado. (Observação: o requirements, FAQ "Como sabemos...", diz "O SPIKE nunca fecha tarefas"; o tasks.md trata o T0.1 como tarefa fechável por `spike-002.md` com veredito. Confirmar com a Duda que são coisas diferentes, o SPIKE-001 do requirements e o T0 do design.)
- **T3.7:** "`git diff -- netlify.toml` sem alteração em `[functions]`" é conferência visual. Sugerido: teste em `headers.test.ts` que o bloco `[functions]` é igual ao do commit-base, ou `git diff -U0 -- netlify.toml | grep -n "functions"` (exit 1).
- **T6.1:** pede `verify` 3 vezes "com a máquina ociosa" mas não registra o tempo contra o orçamento (suíte ≤ 90 s, `verify` ≤ 180 s, da 001). O pré-render dentro do `vite build` (T4.2) e as dezenas de testes novos podem estourar o orçamento. Correção: critério de aceitação numérico (tempo de cada execução) e a medição já na T4.2.
- **T5.3:** os comandos para Lighthouse e INP não têm arquivo previsto (só `e2e/prova.e2e.ts`); falta ao menos `scripts/lighthouse*.mjs`. Lighthouse precisa de um Chrome acessível ao `chrome-launcher`: o tasks.md não diz se usa o Chromium do Playwright; é risco de a tarefa de 4 h estourar.

### A-10 · Média · Estimativas otimistas em tarefas de maior risco
O total de 89 h soma certo, mas várias tarefas de 4 h concentram trabalho que o próprio texto descreve como grande:
- **T3.3** (4 h): `SiteShell` novo, `App`, variante `bare`, **10 páginas "uma por vez, com o gate verde"** (10 execuções de `verify`, de até 180 s cada, só de espera), mais a lista de testes ajustados.
- **T3.5** (4 h): tirar `TerminalProvider`/sessão do 1º acesso, `RunButton` sob demanda, medir o chunk antes e depois.
- **T4.2** (4 h): plugin com build aninhado, manifesto, `modulepreload`, `404.html` por idioma, limpeza, `checkDist.mjs`, três arquivos de ignore.
- **T5.3** (4 h): `measureBundle`, axe, Lighthouse, INP, duas `devDependencies` e auditoria.
Sugestão (spec fix needed: tasks.md): dividir a T3.3 em duas (casca e `App`; páginas) e a T5.3 em duas (tamanho e axe; Lighthouse e INP), ou registrar explicitamente que o limite de 4 h pode ser estourado com a Duda avisada. Dividir mexe no total de 27 tarefas e 89 h, então precisa de nova aprovação (a Duda decide).

### A-11 · Baixa · O spike (T0.1) não vem antes do resto, apesar do Readiness
**Evidência.** Readiness Check: "Spike obrigatório antes do resto: T0.1". Mas T1.1 e T1.x têm "Dependências: nenhuma/T1.x" e o diagrama deixa T0.1 como uma raiz paralela; só a T4.1 depende dele. Se o veredito for "inviável", as Fases 1 a 3 (64 h) já foram feitas. O design pede T0 como primeiro item.
**Correção (spec fix needed: tasks.md, Readiness e Dependências).** Ou escrever "T0.1 antes de qualquer outra" (T1.1 depende de T0.1) ou reescrever o Readiness ("o spike pode rodar em paralelo, mas o risco é aceito"). Observação relacionada: o critério (4) do spike ("como `routes.ts` carrega sem `import.meta.env`") depende do que a T2.1 muda em `routes.ts`; medir antes da T2.1 pode dar resposta diferente da final.

### A-12 · Baixa · T2.1 depende de T1.5 sem motivo e é a primeira tarefa de risco com a 008
T2.1 não usa nada da T1.5 (boot e provedor de tema). A dependência atrasa a única exceção à 008. Sugestão: depender só de T0.1 ou de T1.2. (Se for deliberado, dizer por quê.)

### A-13 · Baixa · IDs fora do padrão de `conventions.md`
- `TD-025a`, `TD-025b`, `TD-025c` (títulos de T2.1, T3.4, T3.5) não são IDs do design: lá são os itens (a)-(d) do TD-025. Usar "TD-025 (b)".
- `TL-001` a `TL-004` (tabela de lacunas) usam um prefixo que conventions.md não define (US, FR, NFR, D, TD, Q, T). Usar `Q-` ou `DQ-`.
- T1.5 cita "S-04, S-05" e a T2.1 "R-001": são IDs de `design-review.md` e dos Riscos do design; ok, mas o prefixo do documento deveria aparecer ("design-review S-04").

### A-14 · Baixa · Pontos do próprio tasks.md que dependem de confirmação, não de código
- **T1.4 e DQ-003:** correto declarar aberta; a tarefa tem condição de parada. OK.
- **T3.2 (1024 px) e T5.3 (100 KB/20 KB):** têm "parar e propor". OK. O tasks.md deve garantir que um "parar" vire uma pergunta registrada no `design.md`/`requirements.md` (regra 4 do AGENTS.md: a resposta volta para a spec). Falta uma linha dizendo **qual documento** recebe a resposta (design TD-010, requirements NFR-001).
- **T2.2** diz "`menu: true` nas 5 rotas (Projetos, Currículo, Acadêmico, Contato, Pessoal)". Confere com DQ-019/DQ-011. OK.

---

## Resumo das checagens pedidas
| Item | Resultado |
| --- | --- |
| Cobertura de todo FR/NFR por tarefa | PASS com ressalvas: todos citados; faltam FR-041/boot (A-08.1), FR-016 com faixa (A-08.2) e citações de T4.x (A-08.3) |
| Tarefas de 1 a 4 h, com verificação | PASS na faixa de horas; verificações fracas em T0.1, T3.7, T6.1, T5.3 (A-09); risco de estimativa (A-10) |
| Ordem e dependências | FAIL: A-03, A-04, A-05 (ordem que quebra o `verify`), A-11, A-12 |
| Soma 27 tarefas / 89 h | PASS (comando acima) |
| Readiness Check | PASS com ressalva: "spike antes do resto" não vale nas dependências (A-11); "toda tarefa tem verificação" vale com as ressalvas de A-09 |
| IDs estáveis | PASS nos T*; ressalvas em A-13 |
| Spec 008 intocável, exceção única da T2.1 | FAIL parcial: A-02 e A-06 (outras tarefas tocam arquivos da 008) |
| Evidência Claim/Command/Exit code/Summary/Verdict | PASS (linha 8, e `evidence.md`); falta o formato do T0.1 (`spike-002.md`) |
| Um commit por tarefa, sem push | PASS (linhas 10 e 312) |
| `npm run verify` como gate | PASS em texto; FAIL na prática em T1.1, T2.5, T3.2, T3.4 (A-01 a A-04) |
| Respeito a steering (conteúdo como dado, PT/EN, sem segredo, sem push na main) | PASS: nenhum conflito com `AGENTS.md`/`conventions.md`/`principles.md` encontrado |

## Spec fix needed (resumo por documento)
- **tasks.md:** T1.1 e T3.4 (A-01), T2.5 e linha 14 (A-02, A-06), T3.4/T4.3 (A-03), T3.1 a T3.3 (A-04), T2.2/T4.1/T5.1 (A-05), T3.3/T6.1 (A-06), T3.4 ou T5.2 (A-07), T1.3/T4.1/T4.2/T5.2 e Coverage (A-08), verificações (A-09), estimativas (A-10), Readiness e dependências (A-11, A-12), IDs (A-13).
- **requirements.md / design.md:** nenhuma correção necessária. Duas decisões para a Duda: o destino dos hex de impressão do `resume.css` (A-01) e a extensão da autorização da DQ-017 para testes e arquivos de `components/personal` e `pages/personal` (A-02, A-06).

## Gaps
(Só lacunas encontradas; nenhum requisito novo.)
1. Nenhuma tarefa grava `data-shell="bare"` nem o consome no boot (TD-012).
2. Nenhuma tarefa ajusta `e2e/site.e2e.ts` (design, lista de remoções).
3. Nenhum teste prova a posição da faixa de idioma na ordem do foco (FR-016).
4. Os arquivos de teste da 008/terminal que usam `portfolio-lang` não estão listados na T2.5.
5. O tempo do `verify` e da suíte após o pré-render não tem medição prevista antes da T6.1.

`.status` continua `tasks:draft`. Nenhum arquivo além deste foi criado ou alterado.
