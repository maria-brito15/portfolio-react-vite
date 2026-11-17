# 001 Engineering baseline, Review
**Data:** 2026-11-17 · **Branch:** `rebuild/sdd` · **HEAD:** `71e60ae` · **`.status` lido:** `implementation:done` (não alterado) · **Revisor:** Claude, contexto novo (não viu a implementação ser escrita)
**Contra:** `requirements.md` v1.3, `design.md` (+ anexos), `tasks.md` v1.1 (fases 1 a 6). A Fase 7 (T7.1 a T7.3) é trabalho futuro aprovado depois do aceite: **não é lacuna**, só contexto.
**Máquina:** Windows 11, Node v24.15.0, projeto no OneDrive, nenhum processo `node` antes de cada execução, uma execução de vitest por vez. `npm run verify` rodou **uma única vez** (no fim).

## Veredito geral: PASS
50 blocos (29 tarefas + 18 FR + 3 NFR): **50 PASS, 0 FAIL**. Nenhum "spec fix needed" obrigatório; há 8 gaps (abaixo), nenhum bloqueia o aceite. Dois deles pedem decisão da Duda sobre a spec (G-1, G-6).

## Como os blocos foram produzidos
- **Reexecutado por mim agora**: todos os testes de schema, validador, plugin, paridade, segredos, `verify`, o `npm run verify -- --enforce-budget` completo, `npm audit`, a varredura de `zod` no bundle, o build com `VITE_X_TOKEN`, os `git grep` do V-06 e as checagens de arquivo.
- **Medição de 3 repetições (FR-004), clone fora do OneDrive e WSL**: não reproduzidas (regra da máquina: no máximo 1 `verify`). Uso o `evidence.md` (T6.6, T6.7) e o `.verify/times.jsonl` como fonte, dito em cada bloco.
- Resultado da minha execução única do `verify`: formatação 3,8 s · lint 10,3 s · tipos 7,0 s · testes 48,5 s (85 arquivos, 1147 testes, 0 falhas) · geração 2,9 s · **total 72,5 s**, exit 0, linha `ok:true` gravada em `.verify/times.jsonl`. A máquina estava mais folgada que nas medições da T6.6/T6.7 (104 a 133 s).

---
## Blocos por requisito funcional

```
Claim:     FR-001: um único comando roda formatação, lint 0 avisos, tipos, testes e geração, nessa ordem; validação de conteúdo e varredura de segredos ficam DENTRO das etapas de testes e geração.
Command:   node scripts/verify.mjs --dry-run ; npm run verify -- --enforce-budget ; npx vitest run scripts/verify.test.ts
Exit code: 0 ; 0 ; 0
Summary:   plano na ordem formatação, lint, tipos, testes, geração; verify real OK em 72,5 s; 12 testes do runner. Conteúdo e segredos: `contentValidator.test.ts`, `secretScan.test.ts` (etapa 4) e plugins `contentGuard`/`secretGuard` (etapa 5, vite.config.ts); não há etapa à parte.
Verdict:   PASS
```
```
Claim:     FR-002: falha de etapa para, nomeia a etapa e sai diferente de 0.
Command:   npx vitest run scripts/verify.test.ts
Exit code: 0
Summary:   12 testes, 12 passaram (inclui "falha": para na etapa 2, sai 1, não roda as seguintes; ferramenta ausente sai 2; Ctrl+C 130).
Verdict:   PASS
```
```
Claim:     FR-003: todas as etapas passando, sai 0.
Command:   npm run verify -- --enforce-budget (PowerShell/Git Bash do ambiente); evidence.md T6.7 para Git Bash, WSL
Exit code: 0
Summary:   "verify: OK em 72,5 s". Git Bash 104,0 s, PowerShell 133,3 s e WSL Ubuntu limpo 70,2 s vêm da T6.7 (não reproduzidos por mim, `.verify/times.jsonl` confirma as linhas do Windows com ok:true).
Verdict:   PASS
```
```
Claim:     FR-004: suíte sem falhas, passando 3 vezes seguidas; falha corrigida ou removida conforme FR-006; remoção do código fora do MVP.
Command:   npm run verify -- --enforce-budget (inclui `vitest run`) ; leitura de evidence.md T6.6 ; git grep -n -E "\b(it|test|describe)\.(skip|todo)|\bxit\b|\bxdescribe\b" -- src scripts netlify
Exit code: 0 ; n/a ; 1 (nenhum skip/todo)
Summary:   minha execução: 85 arquivos, 1147 testes, 0 falhas. As 3 repetições de `npm test` (3/3, 55-58 s) e 3 `verify` são do evidence.md T6.6, não reproduzi. Falhas por carga achadas na T6.6 (foco da paleta) foram corrigidas com `waitFor`, sem aumentar timeout nem pular.
Verdict:   PASS
```
```
Claim:     FR-005: orçamento aprovado (suíte ≤ 90 s, verify ≤ 180 s; metas 60/120).
Command:   npm run verify -- --enforce-budget ; leitura de .verify/times.jsonl
Exit code: 0
Summary:   agora: testes 48,5 s, total 72,5 s. Histórico gravado: testes 48,5 a 66,5 s; total 72,5 a 133,3 s. Dentro do orçamento aprovado (TD-009) em todas as linhas; a meta de 120 s foi ultrapassada em 133,3 s (PowerShell) e 128,1 s (clone, T6.6). Ver G-2.
Verdict:   PASS
```
```
Claim:     FR-006: teste de código removido sai junto; remoção só da lista aprovada; nada silenciado.
Command:   ls dos arquivos do Anexo B ; git grep (V-06 a, termos de cada onda) ; git grep skip/todo
Exit code: 0 ; 1 nas varreduras por onda e na (b) ; 
Summary:   assistente, jogos, trilhas, personas, Caderno e `PageNext` ausentes do disco; nenhum termo de onda em src/scripts/netlify/config (Caderno, jogos, trilhas, personas, assistente: todos exit 1). V-06 (a) com o padrão exato do design acha só `scripts/status.mjs:52,54` ("pare e pergunte", exceção registrada); (c) acha só `docs/specs/GATES.md:44` ("personal" em exemplo, falso positivo). Restam resquícios de persona nos testes da /pessoal (PEND-001, Fase 7).
Verdict:   PASS
```
```
Claim:     FR-007: texto localizado PT e EN, não vazio após trim.
Command:   npx vitest run src/content/schema/localized.test.ts
Exit code: 0
Summary:   24 testes, 24 passaram (3 linhas do requirements, espaço invisível U+200B, chave extra, não texto, linha inteira do §6.2).
Verdict:   PASS
```
```
Claim:     FR-008: data com ano de 4 dígitos e mês opcional de 1 a 12.
Command:   npx vitest run src/content/schema/date.test.ts src/content/dates.test.ts
Exit code: 0
Summary:   29 testes, 29 passaram (mês 13 e 0, ano texto, ano 25, `null`, decimal).
Verdict:   PASS
```
```
Claim:     FR-009: imagem com caminho local único `/`, alt PT/EN, width/height inteiros positivos e arquivo existente.
Command:   npx vitest run src/content/schema/image.test.ts scripts/contentValidator.test.ts
Exit code: 0
Summary:   52 testes, 52 passaram (alt EN vazio, largura 0 e 12,5, `https://`, `//cdn`, `..`, `\`, arquivo não encontrado, maiúscula diferente, imagem aninhada).
Verdict:   PASS
```
```
Claim:     FR-010: link só `https` (sem credenciais), caminho interno de uma `/` ou `mailto:` simples; recusa `//host`, `http`, `javascript:`, `tel:`, `mailto:?`, `/\host`.
Command:   npx vitest run src/content/schema/link.test.ts src/content/schema/tag.test.ts src/content/schema/rating.test.ts (32 + 47 testes somados: 79 no comando)
Exit code: 0
Summary:   79 testes, 79 passaram no comando conjunto; link.test.ts cobre as 9 linhas do requirements + `/\host`, `https://a:b@x`, `data:`, `mailto:` com `?subject=`.
Verdict:   PASS
```
```
Claim:     FR-011: etiqueta com id minúsculas/números/hífen (hífen só separa partes), rótulo localizado, id único no conjunto.
Command:   npx vitest run src/content/schema/tag.test.ts (parte do comando anterior, 79 testes passaram)
Exit code: 0
Summary:   `react-19` válida; `Meu Tema 19`, `-react`, `react-`, `react--19`, `React`, `réact`, `react_19` e repetição recusados.
Verdict:   PASS
```
```
Claim:     FR-012: violação de FR-007 a FR-011 falha a verificação e a geração do site, com arquivo, campo e motivo.
Command:   npx vitest run scripts/contentValidator.test.ts ; npx vitest run scripts/contentGuard.test.ts
Exit code: 0 ; 0
Summary:   17 + 12 testes passaram. Linha inteira `conteúdo inválido: <arquivo> › <campo> — <motivo>` conferida; plugin `contentGuard` derruba `buildStart` com a mesma mensagem; registro real vazio passa no `vite build` (geração do verify OK).
Verdict:   PASS
```
```
Claim:     FR-013: formatar data com o que ela tem e expor ordem indeterminada.
Command:   npx vitest run src/content/schema/date.test.ts src/content/dates.test.ts
Exit code: 0
Summary:   29 testes passaram; as 5 linhas da tabela "Exibição de data" em PT e EN, sem supor mês.
Verdict:   PASS
```
```
Claim:     FR-014: chave existente só em um idioma falha nomeando a chave e o idioma.
Command:   npx vitest run src/i18n/parity.test.ts scripts/parity.test.ts
Exit code: 0
Summary:   24 testes passaram (12 + 12): `ui`, `portfolio`, `resume`, `services` e 6 projetos sem achado; tirar `nav.projects` do `ui.en` real dá `paridade: src/i18n/ui.ts › nav.projects — falta a tradução em "en"`.
Verdict:   PASS
```
```
Claim:     FR-015: falta de idioma impossível em produção; nenhuma função de leitura devolve a chave nem o outro idioma.
Command:   npx vitest run src/content/pick.test.ts ; git grep -n -E "\.(pt|en)\b\s*(\?\?|\|\|)|\[lang\]\s*(\?\?|\|\|)\s*[^'\"[:space:]]" -- src
Exit code: 0 ; 0 (achados fora de src/content e src/i18n)
Summary:   11 testes passaram; `pick` lança em vez de reservar; o guarda não acha nada em `src/content` nem `src/i18n`. Em `src/` inteiro ainda há 5 reservas com `id` cru (`paletteItems.ts:130`, `data/routes.ts:335`, `terminal/commands.tsx:196`, `extras/neofetch.tsx:34`, `extras/personalView.tsx:34`), aceitas por DQ-006 para as specs 002/003. PASS conforme TD-005, mas ver G-1.
Verdict:   PASS
```
```
Claim:     FR-016: a verificação falha com padrão de segredo em arquivo rastreado ou em variável exposta ao navegador.
Command:   npx vitest run scripts/secretScan.test.ts ; npx vitest run scripts/secretGuard.test.ts ; VITE_X_TOKEN=abc npx vite build
Exit code: 0 ; 0 ; 1
Summary:   21 + 13 testes passaram (credencial montada em tempo de execução achada e mascarada; sem ela passa; arquivos reais 0 achados; `VITE_X_TOKEN` falha; 3 do EmailJS passam). Build com `VITE_X_TOKEN=abc` caiu com `secretGuard: segredo: variável VITE_X_TOKEN — nome de variável pública (VITE_) que sugere segredo`.
Verdict:   PASS
```
```
Claim:     FR-017 (Won't): nenhum CI nesta spec.
Command:   git ls-files .github
Exit code: 0 (saída vazia)
Summary:   nenhum arquivo rastreado em `.github`.
Verdict:   PASS
```
```
Claim:     FR-018: nota de 0,5 a 5 em passos de 0,5; ausente = sem nota, nunca 0.
Command:   npx vitest run src/content/schema/rating.test.ts (dentro do comando de 79 testes)
Exit code: 0
Summary:   válidas 0,5 a 5 e ausente (continua ausente após o parse); `0`, `0,25`, `4,3`, `5,5`, `-1`, `"4,5"`, `null`, `NaN`, `Infinity` recusadas com `nota 4,3 fora do passo de 0,5 (valores válidos: 0,5 a 5)`.
Verdict:   PASS
```

## Blocos por requisito não funcional
```
Claim:     NFR-001: suíte ≤ 60 s e verify ≤ 120 s (metas; orçamento 90/180); validação ≤ 5 s com 200 itens de cada tipo; tempo registrado a cada execução.
Command:   npx vitest run scripts/contentValidator.test.ts -t carga --reporter=verbose ; npm run verify -- --enforce-budget ; tail .verify/times.jsonl
Exit code: 0 ; 0 ; 0
Summary:   carga: 200 itens de cada tipo em 53 ms (limite 5 s). verify 72,5 s, suíte 48,5 s (dentro de 60/120 hoje). Registro: linha JSON com campos e `ok:true` acrescentada a cada execução. Ressalva: execuções anteriores passaram de 120 s (133,3 s, 128,1 s) e a suíte de 60 s (66,5 s, 63,8 s); dentro do orçamento aprovado. Ver G-2.
Verdict:   PASS
```
```
Claim:     NFR-002: sem segredo no código rastreado nem em variável do navegador; dados de teste sem credencial real; audit de produção = 0.
Command:   npm audit --omit=dev ; npx vitest run scripts/secretScan.test.ts ; git grep (a) padrões
Exit code: 0 ; 0 ; n/a
Summary:   `found 0 vulnerabilities`; varredura dos arquivos rastreados reais 0 achados; credenciais de teste só montadas em tempo de execução.
Verdict:   PASS
```
```
Claim:     NFR-003 (parcial, camada de dados): toda imagem tem alt em PT e EN.
Command:   npx vitest run src/content/schema/image.test.ts scripts/contentValidator.test.ts
Exit code: 0
Summary:   52 testes passaram; alt ausente ou com EN/PT vazio é recusado. Contraste, teclado e leitor de tela são da spec 002 (N/A aqui). Não foram feitas medições de Lighthouse nem axe: a spec as declara fora do escopo (Non-Goals, NFR-003).
Verdict:   PASS
```

---
## Blocos por tarefa
Onde o comando é de estado atual (e não o da tarefa original), o bloco diz.

```
Claim:     T1.1: `zod` só em devDependencies; `src.zip` e `.verify/` ignorados; `src.zip` intacto e fora do git.
Command:   node -e "...devDependencies.zod && !dependencies.zod ? 0 : 1" ; git check-ignore -v src.zip .verify/times.jsonl ; ls src.zip ; git ls-files src.zip
Exit code: 0 ; 0 ; 0 ; 0 (saída vazia)
Summary:   `.gitignore:22 src.zip`, `.gitignore:25 .verify/`; `src.zip` presente; não rastreado. Não toquei em `src.zip`.
Verdict:   PASS
```
```
Claim:     T1.2: runner com 5 etapas fixas, parada, códigos 0/1/2/130, `--dry-run`.
Command:   npx vitest run scripts/verify.test.ts ; node scripts/verify.mjs --dry-run
Exit code: 0 ; 0
Summary:   12 testes passaram; as 5 etapas na ordem impressas, nada executado.
Verdict:   PASS
```
```
Claim:     T1.3: registro de tempo em `.verify/times.jsonl`, aviso de regressão, orçamento e `--enforce-budget`; scripts `lint` e `format:check`.
Command:   npx vitest run scripts/verify.test.ts ; npm run verify -- --enforce-budget ; node -e "package.json scripts"
Exit code: 0 ; 0 ; 0
Summary:   testes de registro, pasta ausente, regressão e orçamento passaram; a execução gravou nova linha com `ok:true`, `lint` e `format:check` presentes. Execuções simultâneas (EC-17) não têm teste (G-5).
Verdict:   PASS
```
```
Claim:     T2.1: `LocalizedText` e conversor de erros em PT.
Command:   npx vitest run src/content/schema/localized.test.ts
Exit code: 0
Summary:   24 testes, 24 passaram.
Verdict:   PASS
```
```
Claim:     T2.2: `ContentDate`, `formatDate`, `compareDates`.
Command:   npx vitest run src/content/schema/date.test.ts src/content/dates.test.ts
Exit code: 0
Summary:   29 testes, 29 passaram.
Verdict:   PASS
```
```
Claim:     T2.3: schema de link.
Command:   npx vitest run src/content/schema/link.test.ts src/content/schema/tag.test.ts src/content/schema/rating.test.ts
Exit code: 0
Summary:   79 testes, 79 passaram (32 de link segundo o evidence.md).
Verdict:   PASS
```
```
Claim:     T2.4: etiqueta, conjunto e nota.
Command:   npx vitest run src/content/schema/link.test.ts src/content/schema/tag.test.ts src/content/schema/rating.test.ts
Exit code: 0
Summary:   mesmo comando da T2.3, 79 testes passaram (43 de tag e rating segundo o evidence.md).
Verdict:   PASS
```
```
Claim:     T2.5: imagem (forma).
Command:   npx vitest run src/content/schema/image.test.ts scripts/contentValidator.test.ts
Exit code: 0
Summary:   52 testes, 52 passaram (35 de image segundo o evidence.md).
Verdict:   PASS
```
```
Claim:     T2.6: validador, registro, checagem do arquivo da imagem, carga ≤ 5 s.
Command:   npx vitest run scripts/contentValidator.test.ts ; npx vitest run scripts/contentValidator.test.ts -t carga --reporter=verbose ; cat src/content/registry.ts
Exit code: 0 ; 0 ; 0
Summary:   17 testes passaram; carga 53 ms; `registry.ts` existe (vazio, válido por EC-11); fixtures marcadas como exemplo.
Verdict:   PASS
```
```
Claim:     T2.7: plugin `contentGuard` e regra de importação em conteúdo.
Command:   npx vitest run scripts/contentGuard.test.ts ; npm run verify (lint e geração)
Exit code: 0 ; 0
Summary:   12 testes passaram; plugin registrado no `vite.config.ts` (linhas 6 e 10); lint 0 avisos e `vite build` com registro vazio OK. A regra usa `no-restricted-syntax` e não `no-restricted-imports` como o `tasks.md` descreve (G-6).
Verdict:   PASS
```
```
Claim:     T2.8: `pick` sem reserva e teste-guarda.
Command:   npx vitest run src/content/pick.test.ts
Exit code: 0
Summary:   11 testes, 11 passaram.
Verdict:   PASS
```
```
Claim:     T3.1: `secretScan` (padrões, arquivos rastreados, mascaramento, teste genérico).
Command:   npx vitest run scripts/secretScan.test.ts
Exit code: 0
Summary:   21 testes, 21 passaram.
Verdict:   PASS
```
```
Claim:     T3.2: plugin `secretGuard` (bundle e variáveis públicas).
Command:   npx vitest run scripts/secretGuard.test.ts ; VITE_X_TOKEN=abc npx vite build ; verify (geração)
Exit code: 0 ; 1 ; 0
Summary:   13 testes passaram; build real sem segredo passa; com `VITE_X_TOKEN` falha. O caso (b) (valor de variável secreta dentro do bundle) só tem teste sintético, e o teste usa stub de `loadEnv` (G-4; PEND-004, T7.2).
Verdict:   PASS
```
```
Claim:     T4.1: `pool: 'vmThreads'` com timeouts mantidos.
Command:   grep -n "pool" vite.config.ts ; evidence.md T4.1 e T6.6
Exit code: 0
Summary:   `pool: 'vmThreads'` presente (linha 23). A tarefa fechou com ressalva (falha intermitente de `HomePersona`, aprovada pela Duda em 2026-11-16); o teste saiu na T5.7 e o critério de 3 rodadas verdes foi atendido na T6.6 (3/3).
Verdict:   PASS
```
```
Claim:     T5.1: assistente de IA e `pergunte` removidos; 008 intacta.
Command:   git grep -n -E "netlify/assistant|assistantContext|askEvals|services/ask|functions/ask|GEMINI" -- src scripts netlify vite.config.ts package.json netlify.toml .env.example ; ls netlify/assistant netlify/functions/ask.mts ; grep "[functions]" netlify.toml ; grep blobs package.json
Exit code: 1 ; ausentes ; presente ; presente
Summary:   nenhum termo; arquivos ausentes; `[functions]` e `@netlify/blobs` presentes. Ação da Duda (apagar GEMINI no Netlify) segue pendente (PEND-005).
Verdict:   PASS
```
```
Claim:     T5.2: jogos removidos.
Command:   git grep -n -E "GameCenter|Minesweeper|bestTimes|terminal/games|extras/games|'minas'" -- src scripts netlify vite.config.ts package.json netlify.toml
Exit code: 1
Summary:   nenhuma ocorrência; `src/terminal/games` e `GameCenter.tsx` ausentes.
Verdict:   PASS
```
```
Claim:     T5.3: trilhas desacopladas (parte 1, sem commit próprio).
Command:   git grep -n -E "TrailProvider|useTrail|emitTrailEvent|TrailCard|TourHost|SecretToast|PageNext|src/trails|data/trails|utils/visited|extras/trilha" -- src scripts netlify vite.config.ts package.json netlify.toml
Exit code: 1
Summary:   nenhuma referência; tema e idioma sem `emitTrailEvent`. Evidência de execução da onda está no bloco único T5.3/T5.4 do evidence.md.
Verdict:   PASS
```
```
Claim:     T5.4: trilhas apagadas (inclui ExploreMode e explore.ts por DQ-018).
Command:   ls src/trails src/data/trails.ts src/components/PageNext.tsx ; npm run verify (tsc, vite build, vitest)
Exit code: 2 (ausentes) ; 0
Summary:   todos ausentes; tipos, geração e suíte passam.
Verdict:   PASS
```
```
Claim:     T5.5: Caderno e `CADERNO_V2` removidos; uma casca só.
Command:   git grep -n -E "CADERNO_V2|components/notebook|data/notebook|i18n/nb|styles/notebook|shellProps" -- src scripts vite.config.ts package.json
Exit code: 1
Summary:   nenhuma ocorrência; `src/components/notebook` e `src/config.ts` ausentes.
Verdict:   PASS
```
```
Claim:     T5.6: personas desacopladas (parte 2 da onda 4).
Command:   git grep -n -E "usePersona\b|data/personas'|personaHome" -- src
Exit code: 1
Summary:   nenhuma referência; home com composição fixa (`HomeSections.tsx`, `homeLayout.ts`).
Verdict:   PASS
```
```
Claim:     T5.7: personas apagadas, V-06 completo.
Command:   git grep -n -E "personas|PersonaHome|PersonaPrompt|ProjectLens|CADERNO_V2|notebook" -- src scripts ; git grep -n -E "\b(it|test|describe)\.(skip|todo)|\bxit\b|\bxdescribe\b" -- src scripts netlify
Exit code: 1 ; 1
Summary:   zero ocorrências. Com o padrão amplo `\bpersonas?\b` ainda há resquício em dois testes da /pessoal (PEND-001; tocar neles é a T7.3, fora desta revisão).
Verdict:   PASS
```
```
Claim:     T5.8: limpeza final; nada da 008 alterado além de formatação autorizada (DQ-019).
Command:   npx vitest run src/terminal/deadCode.test.ts (dentro do `vitest run` do verify) ; git diff --stat arquivo/pre-remocao-fora-do-mvp HEAD -- netlify/personal netlify/functions/personal-books.mts netlify/functions/personal-films.mts scripts/personalGuard.ts
Exit code: 0 ; 0
Summary:   suíte inteira passa (inclui `deadCode`); a diferença para a marca em arquivos da 008 é de 5 arquivos, 72 inserções e 31 remoções, compatível com o `prettier --write` autorizado pela DQ-019 (T6.5 provou equivalência do código transpilado). Não rederivei a equivalência.
Verdict:   PASS
```
```
Claim:     T6.1: paridade PT/EN.
Command:   npx vitest run src/i18n/parity.test.ts scripts/parity.test.ts
Exit code: 0
Summary:   24 testes, 24 passaram.
Verdict:   PASS
```
```
Claim:     T6.2: projetos `unit` e `dom` e `content:check`.
Command:   npx vitest run src/content scripts/contentValidator.test.ts --project unit ; grep projects vite.config.ts ; verify (vitest run)
Exit code: 0 ; 0 ; 0
Summary:   `content:check`: 9 arquivos, 195 testes; projetos `unit` (node, `**/*.test.ts`) e `dom` (jsdom, `**/*.test.tsx`) presentes; 1147 testes na suíte completa, a mesma contagem do evidence.md. Ganho de tempo na suíte inteira foi desprezível (admitido no evidence.md).
Verdict:   PASS
```
```
Claim:     T6.3: `sections.test.tsx` dividido em 4 arquivos com 52 casos.
Command:   ls src/terminal/sections* ; verify (vitest run, 1147 testes)
Exit code: 0 ; 0
Summary:   4 arquivos + `sectionsHelpers.ts`, original ausente; contagem total de 1147 igual à anotada. A soma de 52 casos entre os 4 arquivos vem do evidence.md (21+20+5+6), não recontei.
Verdict:   PASS
```
```
Claim:     T6.4: configuração de formatação sem reformatar.
Command:   cat .prettierrc ; git ls-files .prettierignore .gitattributes
Exit code: 0
Summary:   `.prettierrc` com `"endOfLine": "auto"`; `.prettierignore` e `.gitattributes` rastreados; `prettier --check .` passa no verify (3,8 s).
Verdict:   PASS
```
```
Claim:     T6.5: commit só de formatação; `prettier --check .` exit 0.
Command:   npm run verify -- --enforce-budget (etapa 1 a 5)
Exit code: 0
Summary:   formatação OK, lint 0 avisos, tipos OK, 1147 testes, build OK. A equivalência código a código (20 de 20 idênticos pelo esbuild) vem do evidence.md.
Verdict:   PASS
```
```
Claim:     T6.6: 3 execuções verdes de `npm test` e de `verify`, dentro do orçamento, e medição fora do OneDrive.
Command:   leitura de evidence.md (T6.6 partes 1 a 3) e .verify/times.jsonl ; minha execução única do verify
Exit code: n/a ; 0
Summary:   fonte: 3/3 `npm test` (55-58 s) e 3/3 `verify` (108-119 s), mais clone fora do OneDrive em 128,1 s (suíte 63,8 s), todos dentro de 90/180 s. As linhas de `times.jsonl` têm `ok:true`. Defeitos de CRLF achados no clone (shebang e `envExample.test.ts`) foram corrigidos. Não reproduzi as 3 repetições nem o clone (limite de uma execução).
Verdict:   PASS
```
```
Claim:     T6.7: aceite final (verify em PowerShell, Git Bash e WSL; audit 0; zod fora do bundle; sem CI; V-06; checklist).
Command:   npm audit --omit=dev ; grep -r -l "ZodError\|zod" dist/static ; git ls-files .github ; git ls-files src.zip ; V-06 (a)(b)(c) ; leitura de evidence.md T6.7
Exit code: 0 ; 1 ; 0 (vazio) ; 0 (vazio) ; 0 com só as exceções ; 
Summary:   `found 0 vulnerabilities`; nenhum `zod` em `dist/static`; sem `.github`; sem `src.zip`; V-06 só com as 2 exceções registradas. WSL (70,2 s) e PowerShell (133,3 s) vêm do evidence.md; não reproduzidos.
Verdict:   PASS
```

---
## Cobertura: US → FR → TD → T → evidência

| US | FR | TD | Tarefas | Evidência (comando / teste) |
| --- | --- | --- | --- | --- |
| US-001 (conteúdo errado é recusado) | FR-007 | TD-001, TD-002 | T2.1 | `localized.test.ts` (24) |
| US-001 | FR-008 | TD-012 | T2.2 | `date.test.ts`, `dates.test.ts` (29) |
| US-001 | FR-009 | TD-002, TD-003 | T2.5, T2.6 | `image.test.ts`, `contentValidator.test.ts` (52) |
| US-001 | FR-010 | TD-001 | T2.3 | `link.test.ts` (79 no comando conjunto) |
| US-001 | FR-011 | TD-001 | T2.4 | `tag.test.ts` |
| US-001 | FR-018 | TD-001 | T2.4 | `rating.test.ts` |
| US-001 | FR-012 | TD-003 | T2.1, T2.6, T2.7 | `contentValidator.test.ts` (17), `contentGuard.test.ts` (12) |
| US-001 | FR-013 | TD-012 | T2.2 | `dates.test.ts` |
| US-002 (um comando) | FR-001 | TD-006 | T1.2, T1.3, T6.2, T6.7 | `verify.test.ts` (12), `verify --dry-run`, verify real 72,5 s |
| US-002 | FR-002 | TD-006 | T1.2 | `verify.test.ts` ("falha") |
| US-002 | FR-003 | TD-006 | T1.2, T6.7 | verify exit 0 |
| US-002 | FR-016 | TD-011 | T3.1, T3.2, T5.1, T6.7 | `secretScan.test.ts` (21), `secretGuard.test.ts` (13), build com `VITE_X_TOKEN` exit 1 |
| US-003 (sem texto sem tradução) | FR-014 | TD-004 | T6.1 | `parity.test.ts` (24) |
| US-003 | FR-015 | TD-005 | T2.8 | `pick.test.ts` (11); ver G-1 |
| US-004 (suíte confiável) | FR-004 | TD-008, TD-010 | T4.1, T5.1 a T5.8, T6.2, T6.3, T6.6 | verify: 1147 testes, 0 falhas; T6.6 (3/3) |
| US-004 | FR-005 | TD-008, TD-009 | T1.3, T4.1, T6.2, T6.3, T6.6 | verify 72,5 s, suíte 48,5 s; `times.jsonl` |
| US-004 | FR-006 | TD-010 | T5.1 a T5.8 | V-06 (a), (b), (c) |
| (Won't) | FR-017 | n/a | T6.7 | `git ls-files .github` vazio |
| NFR-001 | n/a | TD-008, TD-009 | T1.3, T2.6, T6.6 | carga 53 ms; `times.jsonl` |
| NFR-002 | FR-016 | TD-011 | T3.1, T3.2, T6.7 | `npm audit --omit=dev` = 0 |
| NFR-003 | FR-009 | n/a | T2.5 | `image.test.ts` |

Critérios de aceitação das US (leitura contra o resultado):
- US-001: mês 13, imagem sem alt ou externa, texto sem PT/EN e nota 4,3 falham com arquivo, campo e motivo; conteúdo válido passa (`contentValidator.test.ts`). PASS.
- US-002: exit 0 e exit ≠ 0 por etapa; a saída nomeia a etapa; ordem fixa; segredo derruba. PASS.
- US-003: remoção de `en` falha nomeando chave e idioma (`parity.test.ts`); sem reserva em `src/content` e `src/i18n`. PASS (G-1).
- US-004: 0 falhas e dentro do orçamento. PASS.

Success Metrics (requirements.md): os 6 itens têm prova no evidence.md T6.7 e nos blocos acima; as caixas no requirements.md seguem `[ ]` (G-7).

## Contexto: Fase 7 (não é lacuna da 001)
T7.1 (código e fontes sem uso: PEND-002, PEND-003, resquício de Fraunces em `index.html:24`, confirmado por mim), T7.2 (`secretGuard` com `loadEnv` real: PEND-004, confirmado: `scripts/secretGuard.test.ts:5` ainda tem `vi.mock('vite'`), T7.3 (resquício de persona em `qa.test.tsx` e `personalDiscovery.test.tsx`: PEND-001, confirmado). Aprovadas pela Duda para depois desta revisão. As cinco pendências de `.ai/sdd/pendencias.md` seguem abertas (PEND-005 é só da Duda).

## Gaps
Só lacunas; nenhum requisito novo.
- **G-1 (FR-015 / TD-005 / DQ-006):** o texto literal do FR-015 diz "em nenhuma função de leitura de texto localizado". O guarda e o `pick` só cobrem `src/content` e `src/i18n`; cinco pontos com `id` cru como reserva continuam em `src/` (lista no bloco FR-015). A Duda aceitou no design (DQ-006, para as specs 002/003), mas esses cinco pontos **não estão** em `.ai/sdd/pendencias.md`. Spec fix needed: `requirements.md` FR-015 (ou nota de escopo) ou `pendencias.md`, para o requisito e a realidade coincidirem; a decisão é da Duda.
- **G-2 (FR-005, NFR-001, Success Metric 1):** as metas de 60 s (suíte) e 120 s (verify) foram superadas em 3 medições registradas (suíte 66,5 s e 63,8 s; verify 133,3 s e 128,1 s) e atendidas em outras (minha execução: 48,5 s e 72,5 s). O orçamento aprovado (90/180 s, TD-009) vale e passou sempre. Variação grande (72 a 133 s) com RAM livre de 4,9 a 7 GB. Sem ação exigida; registro para a 010.
- **G-3 (execuções repetidas):** as 3 repetições do FR-004, o clone fora do OneDrive e o WSL não foram reproduzidos nesta revisão (limite de uma execução do `verify`). Estão aceitos pelo evidence.md; se a Duda quiser reprodução independente, é outra rodada.
- **G-4 (T3.2, FR-016):** o caso (b), valor de variável secreta do ambiente dentro do bundle, só tem teste sintético, e o teste troca `loadEnv` por stub (a leitura real de `.env` só é exercida pelo build real). Já tratado como PEND-004 e T7.2.
- **G-5 (T1.3, EC-17):** execuções simultâneas do `verify` não têm teste (o evidence.md da T1.3 admite). Sem requisito violado; EC-17 diz que esses tempos não valem como medição.
- **G-6 (design TD-002 e R-007 / tasks T2.7):** o design e a tarefa descrevem `no-restricted-imports`; a implementação usa `no-restricted-syntax` (desvio explicado só no evidence.md, com teste via `Linter`). Spec fix needed: `design.md` TD-002 e R-007 (ou nota em `tasks.md` T2.7) para registrar o desvio.
- **G-7 (documentos de requisito):** as caixas dos critérios de aceitação das US e dos Success Metrics em `requirements.md` seguem `[ ]` embora o evidence.md T6.7 as marque `[x]`. Spec fix needed (opcional): `requirements.md`, US e Success Metrics (decisão da Duda; arquivo aprovado, não editei).
- **G-8 (INDEX):** `.ai/sdd/INDEX.md` ainda mostra `specs/001-engineering-baseline | tasks:approved`, enquanto o `.status` diz `implementation:done`. O INDEX é só painel (AGENTS.md), mas está defasado.

O `.status` continua `implementation:done`. A promoção para `review:done` só depois da confirmação da Duda.
