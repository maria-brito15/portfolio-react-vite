# 001 Engineering baseline, Anexo A: evidências da investigação
**Status:** rascunho · Parte do `design.md` · Data das medições: 2026-11-15 · Formato de cada bloco: Claim, Command, Exit code, Summary, Verdict (conventions.md)

## Condições de medição (leia antes dos números)
- Máquina: Intel Core i7-1355U (12 threads, notebook de 15 W), 17 GB de RAM (5 GB livres no início), Windows 11, Node 24.15.0, npm 11.6.4.
- O projeto está em `OneDrive\Desktop\...` (pasta sincronizada pelo OneDrive). Isso não foi isolado como causa; fica como hipótese em R-002.
- **Nenhum outro comando do projeto rodou em paralelo** com cada medição. O VS Code estava aberto (processos `Code.exe` e `node.exe` ociosos). Isto é "sem outros comandos pesados", não "máquina limpa": o NFR-001 diz "sem outros processos pesados", e a medição cumpre isso na leitura mais estrita que a máquina permitiu.
- A árvore medida é a **árvore de trabalho no momento das medições** (20:05 em diante): 17 arquivos modificados e o código do Caderno ainda não rastreado (`src/components/notebook/`, `src/data/notebook/`, `src/i18n/nb.ts`, `src/config.ts`). Às 20:09 esse estado foi commitado na branch `rebuild/sdd` (`9145f2b wip(caderno)`); conferi depois que `git diff 9145f2b -- src` está vazio, ou seja, o `src/` medido é o do commit `9145f2b` (HEAD atual `aee59a0`). Por isso a suíte tem 1418 testes e não os 1060 que o steering cita (o Caderno acrescentou testes e o espaço cultural também).
- Tempos de parede medidos com `date +%s` em volta do comando (inclui a partida do `npm`/`npx`). "Duration" é o que o Vitest imprime (sem a partida).
- Efeito colateral conhecido: o Vitest carrega `vite.config.ts`, e o plugin `assistantContextPlugin` regravou `netlify/assistant/context.json` (arquivo ignorado pelo git). Nenhum arquivo do projeto foi alterado por mim (só criei arquivos em `.ai/sdd/specs/001-engineering-baseline/` e na pasta de apoio fora do repositório). Um `src.zip` apareceu na raiz às 20:11, criado por outro processo, não por mim.

## Investigação 1: os 638 s da suíte (FR-005, D-001)

### E1. Suíte completa, sozinha, configuração atual
- **Claim:** a suíte sozinha não leva 638 s e não tem as mesmas 5 falhas.
- **Command:** `npm test -- --reporter=default --reporter=json --outputFile.json=<scratchpad>/suite.json`
- **Exit code:** 1
- **Summary:** 322 s de parede (Vitest: `Duration 314,37s`). 1418 testes: 1390 passaram, **10 falharam**, 18 pulados (as avaliações "ao vivo" do assistente). 99 arquivos: 6 falharam, 92 passaram, 1 pulado. Decomposição do Vitest: ambiente 52 %, testes 30 %, setup 10 %, importação 5 %, transformação 2 %. "jsdom foi criado 99 vezes, 1685 s no total" (17 s por arquivo, em média, somando os workers).
- **Falhas (10):** `personalDiscovery.test.tsx` (1), `experiences.test.tsx` (3: "Unable to find role=heading 'Explorador de arquitetura'" e "Visão profissional"), `Workspace.test.tsx` (1: "Unable to find role=dialog 'Atalhos de teclado'"), `gamification.test.tsx` (1), `SiteShell.test.tsx` (1: dialog "Paleta de comandos"), `trilha.test.tsx` (3). Oito delas são "não achou o diálogo/título a tempo", ou seja, estouro de espera sob carga, não erro de lógica.
- **Verdict:** os 638 s da auditoria não se repetem (322 s sozinho). O conjunto de falhas **mudou** (as 5 antigas eram `experiences`, `gamification` e `trails.test`; agora `trails.test.tsx` passou e surgiram outras 5 em arquivos diferentes). Falhas que mudam de arquivo entre execuções indicam teste dependente de carga, não defeito fixo.

### E2. Os arquivos que falharam, rodados sozinhos
- **Claim:** as falhas não se repetem quando o arquivo roda sem a competição dos outros 90.
- **Command:** `npx vitest run src/experiences/experiences.test.tsx src/trails/gamification.test.tsx src/data/trails.test.tsx src/terminal/extras/trilha.test.tsx src/components/shell/SiteShell.test.tsx src/pages/Workspace.test.tsx src/data/personalDiscovery.test.tsx`
- **Exit code:** 0
- **Summary:** 7 arquivos, 134 testes, todos passaram, 35 s de parede. Os 3 arquivos citados no pedido (`experiences`, `gamification`, `trails.test`) passam sozinhos.
- **Verdict:** as falhas **não se repetem sozinhas**. São flaky sob carga (ver E3).

### E3. Menos workers
- **Claim:** com menos concorrência as falhas somem, mas o tempo não melhora: o gargalo é a CPU, não o número de workers.
- **Command:** `npx vitest run --maxWorkers=4 --reporter=default --reporter=json --outputFile.json=<scratchpad>/w4.json`
- **Exit code:** 0
- **Summary:** 320 s de parede (`Duration 313,89s`), 1400 passaram, 0 falhas. jsdom criado 99 vezes, **630 s no total (6,4 s por arquivo)**, contra 1685 s com 11 workers. Trabalho total de CPU quase igual nos dois casos (~1190 s de trabalho em 4 workers, ~3240 s de tempo de worker em 11): a vazão do notebook é a mesma, ~320 s.
- **Verdict:** o tempo não cai com mais workers; a CPU satura. Reduzir workers só tira as falhas.

### E4. Sem isolamento de ambiente
- **Claim:** `--no-isolate` (um jsdom por worker) é mais rápido mas não é seguro.
- **Command:** `npx vitest run --no-isolate --reporter=default --reporter=json --outputFile.json=<scratchpad>/noiso.json`
- **Exit code:** 1
- **Summary:** 215 s, **19 falhas em 11 arquivos** (estado compartilhado entre arquivos: `persona.test`, `sections.test`, `personal.test`, `Minesweeper.test`, `notebook/r1.test` e outros).
- **Verdict:** descartado (TD-008). Ganho de 33 % com custo de 19 testes quebrados.

### E5. Pool `vmThreads` (o que o próprio Vitest sugere no relatório)
- **Claim:** `vmThreads` cria o jsdom uma vez por worker, mantém o isolamento por arquivo e cai o tempo para perto de 100 s sem falhas.
- **Command:** `npx vitest run --pool=vmThreads --reporter=default` (duas execuções seguidas; a segunda também com `--reporter=json`)
- **Exit code:** 0 e 0
- **Summary:** execução 1: **112 s** de parede (`Duration 105,20s`); execução 2: **91 s** (`Duration 86,23s`). As duas com 98 arquivos passando, 1 pulado, 1400 testes passando, **0 falhas**. Ambiente caiu de 52 % para 12-13 % do tempo.
- **Verdict:** a maior alavanca medida (3,0x a 3,5x). Duas execuções verdes seguidas; a variação entre elas (91 a 112 s) é o motivo de o design propor uma folga no orçamento (TD-009).

### E6. Os testes `.test.ts` (sem DOM) pagam o preço do jsdom
- **Claim:** 44 arquivos `.test.ts` existem e quase todo o seu tempo é criação de ambiente.
- **Command:** `npx vitest run <os 44 arquivos *.test.ts>` e, em seguida, o mesmo com `--environment=node`
- **Exit code:** 0 (com jsdom) e 1 (com node)
- **Summary:** com jsdom: 566 testes (+18 pulados), 79 s de parede, "ambiente 79 %, testes 2 %". Com `--environment=node` os 44 arquivos falham na coleta com `ReferenceError: window is not defined`, porque o arquivo de setup global (`src/test/setup.ts`) usa `window`, `localStorage` e `Element`.
- **Verdict:** o ganho de um projeto "node" para `.test.ts` é real mas só existe com um setup próprio sem DOM; não foi medido o resultado final (precisa de configuração; ver TD-008 e a tarefa de medição). Estimativa honesta: vários segundos, não dezenas.

### E7. Onde o tempo está dentro dos arquivos (execução E3, sem contenção)
- **Summary:** soma dos tempos por arquivo 339 s em 99 arquivos. Maiores: `terminal/sections.test.tsx` 64,9 s (52 testes, **19 % de toda a soma**, o maior teste leva 10,4 s: "nenhuma seção de nenhuma página fica inacessível pelo terminal"), `terminal/games/Minesweeper.test.tsx` 19,2 s, `components/personal/qa.test.tsx` 18,8 s, `pages/Workspace.test.tsx` 14,5 s, `components/shell/SiteShell.test.tsx` 14,3 s. Distribuição: 13 arquivos acima de 30 s (na execução E1, sob carga), 54 abaixo de 3 s. 40 testes acima de 5 s e 248 acima de 1 s sob carga (E1).
- **Verdict:** `sections.test.tsx` sozinho é o piso de parede da suíte inteira com vmThreads (≈70 s em um worker); dividi-lo em 2 ou 3 arquivos é obrigatório para chegar perto de 60 s.

### E8. Quanto do tempo é código fora do MVP
- **Command:** análise do grafo de importações (script de apoio fora do repositório) cruzada com o JSON de E3.
- **Summary:** os 30 arquivos de teste de trilhas, personas, jogos e assistente (Anexo B) somam **391 testes e 101 s dos 339 s (30 %)**. Se o Caderno também sair (DQ-001): mais 2 arquivos, 78 testes, 11 s (3 %). Seis arquivos de teste mistos (editar, não remover) somam 108 testes e 26 s (8 %).
- **Verdict:** a remoção sozinha leva a suíte de ~320 s para ~220 s no pool atual, e de ~90-110 s para ~65-80 s com `vmThreads`. Só a remoção não chega a 60 s.

### E9. As outras quatro etapas do `verify`, cada uma sozinha
| Etapa | Comando | Exit | Tempo | Observação |
| --- | --- | --- | --- | --- |
| formatação | `npx prettier --check .` | 1 | 19 s | 143 arquivos fora do formato (ver E10) |
| lint | `npx eslint . --max-warnings 0` | 0 | 55 s | zero avisos |
| tipos | `npx tsc --noEmit` | 0 | 32 s | |
| geração | `npx vite build` | 0 | 14 s | "built in 8,50s"; o maior pacote é `index` com 450 kB (143 kB gzip) |

### E10. A formatação já falha hoje, por causa dos fins de linha
- **Claim:** o passo 1 do `verify` não passa na base atual, e a causa principal é CRLF.
- **Command:** `npx prettier --check .` e `npx prettier --end-of-line auto --check .`
- **Exit code:** 1 e 1
- **Summary:** com o padrão (`endOfLine: "lf"`): 143 arquivos (47 `.md`, 55 `.tsx`, 30 `.ts`, 6 `.mjs`, 3 `.json`, 1 `.css`, 1 `.mts`). A diferença mostrada em `projectDate.ts` e `routes.ts` é o arquivo inteiro: o commit guarda LF (`git ls-files --eol`: `i/lf w/crlf`) e a árvore de trabalho no Windows tem CRLF (`core.autocrlf=true`, sem `.gitattributes`, sem `.editorconfig`, `.prettierrc` sem `endOfLine`). Com `--end-of-line auto`: 83 arquivos, dos quais 33 são código/config (18 `.tsx`, 12 `.ts`, 2 `.mjs`, 1 `.json`) e 50 são `.md` (`docs/`, `.ai/`, `.claude/`, `README.md`). Dos 33, 22 estão em código que a remoção do Anexo B apaga ou reescreve.
- **Verdict:** o `verify` precisa de uma decisão de formatação (TD-007), senão nasce quebrado no passo 1.

### E11. Auditoria de dependências de produção (NFR-002)
- **Command:** `npm audit --omit=dev`
- **Exit code:** 0
- **Summary:** `found 0 vulnerabilities`.
- **Verdict:** a linha de base do NFR-002 vale hoje (0). A auditoria precisa de rede, por isso não entra nas 5 etapas do `verify` (TD-011).

### E12. Linha de base da varredura de segredos
- **Command:** `git ls-files -co --exclude-standard` (522 arquivos, sem binários nem `package-lock.json`) filtrado por `grep -E` com os padrões `AIza…`, `gh[pousr]_…`, `github_pat_…`, `AKIA…`, `xox[baprs]-…`, `-----BEGIN … PRIVATE KEY-----`, `sk-…`, JWT de três partes e `nfp_…`
- **Exit code:** 0 (comando terminou), **0 ocorrências**
- **Verdict:** a varredura nova nasce verde. O teste de aceite é plantar uma credencial montada em tempo de execução (nunca escrita em arquivo rastreado).

### E13. Paridade PT/EN de `ui` hoje
- **Command:** `esbuild src/i18n/ui.ts --bundle` para a pasta de apoio, depois comparação dos caminhos das folhas de `ui.pt` e `ui.en`
- **Exit code:** 0
- **Summary:** 425 folhas em cada idioma; só no PT: 0; só no EN: 0; texto vazio: 0; tipo diferente (função num lado, texto no outro): 0; 18 textos idênticos nos dois idiomas (nomes próprios, por exemplo "GitHub").
- **Verdict:** o teste de paridade da `ui` (TD-004) nasce verde. Não existe teste global de paridade hoje: só `term.nav` (`terminal/deadCode.test.ts`), personas e notebook têm checagens parciais.

## Conclusão da investigação 1 (para a Duda)
1. **Causa provável do tempo:** (a) o jsdom é recriado em cada um dos 99 arquivos (52 % do tempo medido) e a CPU do notebook satura, de modo que 4 ou 11 workers dão os mesmos ~320 s; (b) um arquivo, `terminal/sections.test.tsx`, vale 19 % do trabalho; (c) os 638 s da auditoria eram ~2x os 322 s de hoje, coerente com os outros comandos que rodavam ao mesmo tempo.
2. **Meta de 60 s para a suíte:** **ainda não provada, plausível.** Hoje: 91 a 112 s (vmThreads). Estimativa depois da remoção do Anexo B: 65 a 80 s. Com a divisão de `sections.test.tsx` e um projeto `node` para os `.test.ts`: 50 a 60 s. Falta a medição final (tarefa de medição).
3. **Meta de 120 s para o `verify`:** **inviável** com as etapas em sequência obrigatória (FR-002, US-002). Hoje: 19 + 55 + 32 + ~100 + 14 = ~220 s. Depois da remoção e das otimizações: ~15 + 40 + 25 + 60 + 12 = ~150 s. Para 120 s faltaria cortar lint e tipos pela metade, o que não é escopo.
4. **Proposta para aprovação (DQ-002, TD-009):** suíte **≤ 90 s** e `verify` **≤ 180 s** como orçamento, medidos sozinhos; 60 s e 120 s ficam como meta de esforço, a reavaliar quando a tarefa de medição final mostrar o número real.
5. **Falhas:** as falhas atuais não são "5 testes quebrados", são flakiness sob carga; o critério do FR-004 deve ser "verde em 3 execuções seguidas" (L-007 do design).
