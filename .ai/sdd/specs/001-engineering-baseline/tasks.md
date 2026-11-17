# 001 Engineering baseline, Tasks
**Status:** approved (aprovado pela Duda em 2026-11-15, fase por fase; ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-15
**Entrada:** `requirements.md` v1.3 (aprovada), `design.md` v1.0 (aprovado, 13 respostas DQ registradas), `design.anexo-evidencias.md`, `design.anexo-fora-do-mvp.md` (lista de remoção aprovada, com a correção de `/pessoal` curado)
**Estimativa total:** 29 tarefas, **86 h** (1 a 4 h cada), em 6 fases. A "Ação da Duda" (fora da contagem) está no fim da Fase 5.

## Como ler
- **Testes ficam dentro de cada tarefa.** Não há fase de testes separada.
- **Bloco de evidência** no fechamento de toda tarefa (conventions.md): `Claim`, `Command`, `Exit code`, `Summary`, `Verdict`. Os blocos vão para `evidence.md` na pasta da spec (DQ-015, respondida).
- **Commits** em português, `tipo(escopo): resumo`, citando o ID da tarefa. **Nenhuma tarefa inclui `git push`** (só a Duda pede). Nunca se toca em `main`.
- **`src.zip` é arquivo da Duda:** nenhuma tarefa o apaga, o move ou o comita (R-010).
- **Fora desta spec (008):** `netlify/personal/`, `netlify/functions/personal-*.mts`, `scripts/personalGuard.*`, `scripts/hardcoverProbe.*`, `scripts/importLetterboxd.mjs`, `src/services/integrations/*`, `src/hooks/usePersonal.ts`, `@netlify/blobs`, o bloco `[functions]` do `netlify.toml` e as variáveis de API do `.env.example`. **Nenhuma tarefa abaixo os toca.**
- **Fora desta spec (002):** os 3 temas extras (dracula, solarized, amber).

### Gate de onda (padrão das tarefas T5.x)
Todo fechamento de onda roda, nesta ordem (Git Bash; `git grep` sai com 1 quando não acha nada):
1. `npx tsc --noEmit` (exit 0)
2. `npx vite build` (exit 0)
3. `npx vitest run` (exit 0, 0 falhas)
4. **V-06 estendido**, com os termos da onda (cada tarefa os lista), em três varreduras:
   - (a) `git grep -n -E "<termos da onda>" -- src scripts netlify vite.config.ts package.json netlify.toml .env.example` → **exit 1**
   - (b) `git grep -n -E "\b(it|test|describe)\.(skip|todo)|\bxit\b|\bxdescribe\b" -- src scripts netlify` → **exit 1**
   - (c) `git grep -n -E "<termos de rota/texto da onda>" -- e2e public README.md docs index.html` → **exit 1**, ou cada ocorrência legítima (por exemplo, registro histórico) entra numa lista de exceções com motivo na mensagem do commit.
5. Bloco de evidência, e **UM commit** da onda, com a lista de arquivos e de testes removidos e dos casos editados (FR-006).
O design (V-06) escreve o padrão completo de uma vez; como as ondas são sucessivas, cada onda confere os termos dela e a **onda 4 e a T6.7 conferem o padrão completo** (DQ-014, item 3).

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados no `.status` | OK: `node scripts/status.mjs read 001-engineering-baseline` devolveu `design:approved` (pressupõe `requirements:approved`, GATES.md). Requisitos v1.3 |
| Design aprovado no `.status` | OK: `design:approved` |
| Todo Must Have coberto | OK: FR-001 a FR-016 e FR-018 e os 3 NFR na tabela Coverage; FR-017 (Won't) é conferido em T6.7 |
| Perguntas Q-* respondidas | OK: Q-001 e Q-002 (requirements) |
| Perguntas DQ-* respondidas | OK: DQ-001 a DQ-017 (DQ-014 a DQ-017 respondidas em 2026-11-15, ver o fim) |
| Toda tarefa com dependências, critérios e verificação | OK (cada tarefa abaixo) |
| `tasks.md` aprovado | NÃO: está `design:approved`; vira `tasks:draft` com este arquivo. **Nenhuma implementação começa antes de `tasks:approved` e do "Confirm before building"** |

## Coverage
| Requisito | Tarefas |
| --- | --- |
| FR-001 (comando único, 5 etapas) | T1.2, T1.3, T6.2, T6.7 |
| FR-002 (para na primeira falha) | T1.2 |
| FR-003 (sucesso sai 0) | T1.2, T6.7 |
| FR-004 (suíte sem falhas, 3 vezes) | T4.1, T5.1 a T5.8, T6.2, T6.3, T6.6 |
| FR-005 (orçamento: suíte ≤ 90 s, verify ≤ 180 s; metas 60/120) | T1.3, T4.1, T6.2, T6.3, T6.6 |
| FR-006 (teste de código removido; lista aprovada) | T5.1 a T5.8 |
| FR-007 (texto localizado) | T2.1 |
| FR-008 (data) | T2.2 |
| FR-009 (imagem, arquivo existe, caminho local) | T2.5, T2.6 |
| FR-010 (link) | T2.3 |
| FR-011 (etiqueta) | T2.4 |
| FR-012 (falha de validação, verificação e build) | T2.1, T2.6, T2.7 |
| FR-013 (exibição e ordem de data) | T2.2 |
| FR-014 (paridade) | T6.1 |
| FR-015 (sem texto de reserva) | T2.8 |
| FR-016 (varredura de segredos) | T3.1, T3.2, T5.1 (o teste genérico sobrevive), T6.7 |
| FR-017 (CI: Won't) | T6.7 (`git ls-files .github` vazio) |
| FR-018 (nota) | T2.4 |
| NFR-001 (tempos; validação ≤ 5 s; registro) | T1.3, T2.6, T6.6 |
| NFR-002 (segredos; dados de teste; audit = 0) | T3.1, T3.2, T6.7 |
| NFR-003 (alt PT/EN na camada de dados) | T2.5 |
| Decisões: DQ-001 (Caderno) / DQ-002 (orçamentos) / DQ-003 (zod) / R-010 (`src.zip`) / TD-007 (formatação) / TD-008 (suíte rápida) | T5.5 / T1.3, T6.6 / T1.1 / T1.1 / T6.4, T6.5 / T4.1, T6.2, T6.3 |

---

## Fase 1: Base de configuração e runner `verify`

### T1.1 `zod` como devDependency e `.gitignore`
- **Requisito:** TD-001, DQ-003, R-010 · **Prioridade:** P0 · **Estimativa:** 1 h · **Dependências:** nenhuma (depois de `tasks:approved` e do Confirm)
- **Trabalho:**
  - Declarar `zod` em `devDependencies` (`^4`; o lockfile já traz 4.6.7 via `eslint-plugin-react-hooks`). Instalação é feita pelo implementador (aprovada pela DQ-003).
  - `.gitignore`: acrescentar `src.zip` (com o comentário "arquivo da Duda") e `.verify/`.
  - Confirmar que o `package-lock.json` só muda a marcação de `zod` (de transitiva para direta de desenvolvimento).
- **Testes:** conferência por comando (sem teste de unidade; não há código).
- **Critérios de aceitação:** (1) `zod` está só em `devDependencies`; (2) `git status` não lista mais `src.zip`; (3) `src.zip` continua no disco, intacto; (4) nenhuma versão de outra dependência mudou.
- **Arquivos prováveis:** `package.json`, `package-lock.json`, `.gitignore`
- **Verificação:** `node -e "const p=require('./package.json');process.exit(p.devDependencies&&p.devDependencies.zod&&!(p.dependencies&&p.dependencies.zod)?0:1)"` (exit 0); `git check-ignore -v src.zip .verify/times.jsonl` (exit 0, duas linhas); `ls src.zip` (exit 0); `git diff --stat package-lock.json` (só linhas de `zod`); `npx tsc --noEmit` (exit 0).
- **Commit:** `chore(config): zod como devDependency e src.zip/.verify no .gitignore (T1.1)`

### T1.2 Runner `verify`: ordem, parada e códigos de saída
- **Requisito:** FR-001, FR-002, FR-003, TD-006, EC-15, EC-18 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** nenhuma
- **Trabalho:**
  - `scripts/verify.mjs`: Node, `spawn(process.execPath, [binDaFerramenta, ...args], { stdio: 'inherit', shell: false })`; bin resolvido com `createRequire(...).resolve` (prettier, eslint, typescript, vitest, vite). Cinco etapas fixas na ordem `formatação, lint, tipos, testes, geração`.
  - Saída no formato do design §6.1 (`verify [n/5] nome ...`, `parou na etapa n/5`). Códigos: 0, 1, 2 (ferramenta ou `node_modules` ausente: `rode npm ci antes`, sem pilha), 130 (Ctrl+C repassado ao filho).
  - `--dry-run` imprime o plano e sai 0. Sem concatenar nada do ambiente em comando.
  - Script `"verify": "node scripts/verify.mjs"` no `package.json`.
- **Testes (dentro da tarefa):** `scripts/verify.test.ts` com etapas falsas (`node -e`): "ordem" (as 5, na ordem), "falha" (para na etapa 2 falsa, sai 1, não roda as seguintes, nomeia a etapa), "sucesso" (sai 0), "ferramenta ausente" (sai 2), "dry-run" (sai 0, sem executar). O runner recebe a lista de etapas injetável para o teste.
- **Critérios de aceitação:** (1) a ordem é sempre a mesma; (2) a falha da etapa N impede as seguintes e a saída diz qual falhou; (3) o código de saída é o do design; (4) roda igual em PowerShell e Git Bash (sem `.cmd`, sem shell).
- **Arquivos prováveis:** `scripts/verify.mjs`, `scripts/verify.test.ts`, `package.json`
- **Verificação:** `npx vitest run scripts/verify.test.ts` (exit 0); `node scripts/verify.mjs --dry-run` (exit 0; as 5 etapas na ordem); `npx tsc --noEmit` (exit 0).

### T1.3 Runner `verify`: registro de tempo, comparação e orçamento
- **Requisito:** NFR-001, FR-005, DQ-002, TD-009 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2
- **Trabalho:**
  - Medir cada etapa com `performance.now()`; anexar uma linha em `.verify/times.jsonl` por execução: `{em, sistema, node, etapas:{nome:segundos}, total, ok}` (append; execuções simultâneas não corrompem, EC-17).
  - Comparar com a execução anterior; avisar `AUMENTO de N %` quando uma etapa piora mais de 25 %.
  - Orçamento aprovado: suíte ≤ 90 s e verify ≤ 180 s (constantes nomeadas, com 60 s e 120 s como "meta de esforço" só em comentário). `--enforce-budget` faz o excesso falhar (padrão: só avisa).
  - Scripts `lint` (`eslint . --max-warnings 0`) e `format:check` (`prettier --check .`) no `package.json`. (O script `content:check` entra na T6.2, quando o projeto `unit` existir.)
- **Testes (dentro da tarefa):** em `scripts/verify.test.ts` (estender): "registro" (a linha tem os campos e `ok`), "regressão" (aviso com +25 %), "orçamento" (padrão só avisa; `--enforce-budget` sai 1), "pasta ausente" (cria `.verify/`).
- **Critérios de aceitação:** (1) cada execução acrescenta uma linha válida de JSON; (2) o excesso só falha com `--enforce-budget`; (3) `.verify/` não é rastreado (T1.1).
- **Arquivos prováveis:** `scripts/verify.mjs`, `scripts/verify.test.ts`, `package.json`
- **Verificação:** `npx vitest run scripts/verify.test.ts` (exit 0); `node scripts/verify.mjs --dry-run` seguido de `node -e "process.exit(require('fs').existsSync('.verify')?0:1)"` conforme o teste decidir (o teste usa pasta temporária; o `--dry-run` não grava); `npm run lint` (exit 0, 0 avisos).

---

## Fase 2: Schemas, datas, validador e plugin de conteúdo

### T2.1 Conversor de erros em PT e `LocalizedText`
- **Requisito:** FR-007, FR-012 (formato da mensagem), §5.1, §6.2 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:**
  - `src/content/schema/localized.ts` (zod; `pt` e `en` obrigatórios, não vazios após `trim` e remoção de `U+200B` a `U+200D` e `U+FEFF`; qualquer outra chave recusada). Os idiomas vêm de `Lang` em `src/types.ts` (um lugar só).
  - Conversor das mensagens do zod para o formato `conteúdo inválido: <arquivo> › <campo> — <motivo>` (campo = caminho `lista[2].capa.alt.en`), em PT, com limite de 50 problemas e fecho `N problema(s) em M arquivo(s)`.
  - `src/content/schema/index.ts` reexporta; tipos por `z.infer` (`import type` no resto do código).
- **Testes:** `src/content/schema/localized.test.ts`: as 3 linhas do requirements, espaço invisível (EC-01), chave extra e `{pt, em}` (EC-02), não texto; conversor: a linha inteira confere com o §6.2.
- **Critérios de aceitação:** `{pt:"Olá"}` falha em `en` com `texto ausente`; `{pt:"  ", en:"Hello"}` falha em `pt` com `texto vazio (só espaços)`; a mensagem sempre traz arquivo, campo e motivo.
- **Arquivos prováveis:** `src/content/schema/localized.ts`, `src/content/schema/index.ts`, `src/content/schema/errors.ts`, `src/content/schema/localized.test.ts`
- **Verificação:** `npx vitest run src/content/schema/localized.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-07)

### T2.2 Data (`ContentDate`) e `dates.ts`
- **Requisito:** FR-008, FR-013, TD-012 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.1
- **Trabalho:**
  - `src/content/schema/date.ts`: `year` inteiro de 1000 a 9999 (sem texto, decimal ou `null`); `month` opcional, inteiro de 1 a 12 (`null` recusado).
  - `src/content/dates.ts` (puro, vai ao navegador, sem zod, sem `Intl`): `formatDate(date, lang)` (`2025` ou `mar/2025`, meses em minúsculas pela tabela fixa PT/EN) e `compareDates(a, b)` → `'a-antes' | 'b-antes' | 'indeterminada'` (anos diferentes: determinada; mesmo ano, meses diferentes e ambos presentes: determinada; algum mês ausente ou meses iguais: indeterminada). Não ordena listas (L-009).
- **Testes:** `date.test.ts` (6 linhas do requirements + `null`, decimal, 99999) e `dates.test.ts` (as 5 linhas da tabela "Exibição de data", em PT e EN; nunca supõe mês).
- **Critérios de aceitação:** mês 13 e mês 0 falham com `mês fora de 1 a 12`; ano `"2025"` falha com `ano não é inteiro`; `{year:2025}` mostra `2025`; 2025-03 × 2025 é `indeterminada`.
- **Arquivos prováveis:** `src/content/schema/date.ts`, `src/content/dates.ts`, `src/content/schema/date.test.ts`, `src/content/dates.test.ts`
- **Verificação:** `npx vitest run src/content/schema/date.test.ts src/content/dates.test.ts` (exit 0). (V-08, V-13)

### T2.3 Link
- **Requisito:** FR-010, §5.4 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T2.1
- **Trabalho:** `src/content/schema/link.ts`: `https` absoluto (análise por `new URL`, host não vazio, sem usuário e senha); caminho interno (uma só `/`, segundo caractere nem `/` nem `\`, sem espaço e controle); `mailto:` com e-mail válido e sem `?`. Recusa com o motivo específico de cada caso do design §5.4.
- **Testes:** `link.test.ts`: as 9 linhas do requirements + `/\host`, `https://a:b@x`, `data:`, `mailto:` com `?subject=`, `HTTPS://Exemplo.com` aceito (EC-06), `/` e `/projetos?x=1#a` (EC-07).
- **Critérios de aceitação:** `//exemplo.com/a`, `http://…`, `javascript:…`, `tel:123`, `exemplo.com`, `mailto:` e `mailto:semarroba` falham com a mensagem da tabela; `mailto:contato@exemplo.com` passa.
- **Arquivos prováveis:** `src/content/schema/link.ts`, `src/content/schema/link.test.ts`
- **Verificação:** `npx vitest run src/content/schema/link.test.ts` (exit 0). (V-10, V-22)

### T2.4 Etiqueta, conjunto de etiquetas e nota
- **Requisito:** FR-011, FR-018, §5.5, §5.6 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.1
- **Trabalho:**
  - `src/content/schema/tag.ts`: `id` `^[a-z0-9]+(-[a-z0-9]+)*$`; `label` localizado; `TagSet` com `id` único (lista vazia válida; unicidade por conjunto, EC-09).
  - `src/content/schema/rating.ts`: número opcional de 0,5 a 5 em passos de 0,5 (`multipleOf(0.5)`); ausente = "sem nota", nunca 0; recusa 0, `0,25`, `4,3`, `5,5`, `-1`, `"4,5"`, `NaN`, `Infinity`.
- **Testes:** `tag.test.ts` (`react-19` válida; `Meu Tema 19`, `-react`, `react-`, `react--19`, `React`, `réact`, `react_19` e repetição falham) e `rating.test.ts` (os valores acima; ausente continua ausente após o parse).
- **Critérios de aceitação:** mensagens do §5.5 e §5.6 exatas (`nota 4,3 fora do passo de 0,5 (valores válidos: 0,5 a 5)`).
- **Arquivos prováveis:** `src/content/schema/tag.ts`, `src/content/schema/rating.ts`, os dois testes
- **Verificação:** `npx vitest run src/content/schema/tag.test.ts src/content/schema/rating.test.ts` (exit 0). (V-11, V-21, V-22)

### T2.5 Imagem (forma)
- **Requisito:** FR-009, NFR-003, §5.3 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T2.1
- **Trabalho:** `src/content/schema/image.ts`: `path` começa com uma só `/`, sem `..`, sem `\`, sem `//` inicial, extensão `png jpg jpeg webp avif svg`; endereço externo recusado com `imagem externa não é aceita (sem hotlink)`; `alt` localizado (PT e EN); `width` e `height` inteiros positivos. A checagem do arquivo no disco é da T2.6.
- **Testes:** `image.test.ts`: alt EN vazio, largura 0 e 12,5, altura 0, `https://…`, `//cdn…`, `..`, `\`, extensão não aceita.
- **Critérios de aceitação:** toda imagem sem alt em PT ou EN falha (NFR-003); caminho externo falha.
- **Arquivos prováveis:** `src/content/schema/image.ts`, `src/content/schema/image.test.ts`
- **Verificação:** `npx vitest run src/content/schema/image.test.ts` (exit 0). (V-09, V-22)

### T2.6 Validador de conteúdo, registro e checagem do arquivo da imagem
- **Requisito:** FR-009 (arquivo existe), FR-012, NFR-001 (≤ 5 s), TD-002, TD-003, EC-04, EC-10, EC-11 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.2, T2.3, T2.4, T2.5
- **Trabalho:**
  - `src/content/registry.ts`: lista explícita `{arquivo, schema, dados}` (vazia hoje: lista vazia é válida).
  - `scripts/contentValidator.ts`: `validateAll(registry, { publicDir })` devolve problemas no formato §6.2; checa o arquivo em `public/<path>` listando o diretório para comparar o nome exato (diferença de maiúscula falha nos dois sistemas) e confere que o caminho resolvido fica dentro de `public/`; `*.content.ts` no disco sem registro é problema (`não está registrado em src/content/registry.ts`).
  - `src/content/__fixtures__/` com exemplos **marcados como exemplo** (nada da Duda), incluindo gerador de 200 itens por tipo.
- **Testes:** `scripts/contentValidator.test.ts`: linha inteira do §6.2 para cada regra (data, imagem inexistente com `arquivo não encontrado`, link `//`, título EN ausente, etiqueta repetida); pasta temporária com arquivo real; maiúscula diferente; `*.content.ts` esquecido; "carga": 200 itens de cada tipo validados em ≤ 5 s (o teste falha se passar).
- **Critérios de aceitação:** US-001 completa: data com mês 13, imagem sem alt ou externa, texto sem PT ou EN e nota 4,3 fazem o validador falhar com arquivo, campo e motivo; conteúdo válido passa.
- **Arquivos prováveis:** `src/content/registry.ts`, `src/content/__fixtures__/*`, `scripts/contentValidator.ts`, `scripts/contentValidator.test.ts`
- **Verificação:** `npx vitest run scripts/contentValidator.test.ts` (exit 0); `npx vitest run scripts/contentValidator.test.ts -t "carga"` (exit 0, ≤ 5 s); `npx tsc --noEmit` (exit 0). (V-09, V-12, V-18)

### T2.7 Plugin `contentGuard` (o build também falha) e regra de importação
- **Requisito:** FR-012 (geração do site), TD-003, R-007 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.6
- **Trabalho:**
  - `scripts/contentGuard.ts` no molde de `scripts/personalGuard.ts` (função pura `assert…` + plugin `apply: 'build'` + `configResolved`/`buildStart`): lança erro com as mesmas mensagens do validador.
  - Registrar o plugin em `vite.config.ts` (sem mexer no resto do arquivo; a remoção do `assistantContext` é da T5.1).
  - ESLint: `no-restricted-imports` para `src/content/**/*.content.ts` (só outros arquivos de conteúdo e `import type`).
- **Testes:** `scripts/contentGuard.test.ts`: conteúdo inválido lança erro com a linha inteira do §6.2; válido não lança; o teste de lint da regra de importação (arquivo de fixture com import proibido falha no `eslint`, via `ESLint` API).
- **Critérios de aceitação:** um conteúdo inválido no registro derruba `vite build` (verificado com registro de teste, sem alterar o registro real); `npx vite build` com o registro real vazio passa.
- **Arquivos prováveis:** `scripts/contentGuard.ts`, `scripts/contentGuard.test.ts`, `vite.config.ts`, `eslint.config.*`
- **Verificação:** `npx vitest run scripts/contentGuard.test.ts` (exit 0); `npx vite build` (exit 0); `npm run lint` (exit 0). (V-12)

### T2.8 `pick` sem reserva e teste-guarda
- **Requisito:** FR-015, TD-005, DQ-006 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T2.1
- **Trabalho:** `src/content/pick.ts`: `pick(localized, lang)` devolve só `localized[lang]` e **lança erro** se faltar (nunca a chave nem o outro idioma). Teste-guarda que procura em `src/content/` e `src/i18n/` os padrões `\.(pt|en)\b\s*(\?\?|\|\|)` e `\[lang\]\s*(\?\?|\|\|)\s*[^'"\s]`. Os 5 pontos antigos (fora dessas pastas) **não** são corrigidos aqui (DQ-006: ficam para as 002/003).
- **Testes:** `pick.test.ts`: devolve o idioma pedido; lança sem o idioma; o guarda acha uma amostra com `?? id` em arquivo temporário e não acha nada em `src/content` e `src/i18n`.
- **Critérios de aceitação:** nenhuma função de leitura de texto localizado devolve chave nem outro idioma.
- **Arquivos prováveis:** `src/content/pick.ts`, `src/content/pick.test.ts`
- **Verificação:** `npx vitest run src/content/pick.test.ts` (exit 0). (V-15, V-22) Se o guarda achar ocorrência em `src/i18n/`, **pare e registre** em vez de silenciar.

---

## Fase 3: Varredura de segredos

### T3.1 `secretScan`: padrões, arquivos rastreados e teste genérico
- **Requisito:** FR-016, NFR-002, TD-011, §7 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** nenhuma
- **Trabalho:**
  - `scripts/secretScan.ts`: lista arquivos com `git ls-files -co --exclude-standard -z` (se não houver `git`, percorre o disco ignorando `node_modules`, `dist`, `.git`, `.verify` e avisa, EC-14); ignora binários, `package-lock.json` e arquivos > 1 MB; lê CRLF e LF; padrões do §7 (Google `AIza…`, GitHub, AWS, Slack, chave privada, JWT, `sk-…`, `nfp_…`); saída mascarada (tipo, arquivo, linha, 4 primeiros caracteres + `…`; nunca o valor).
  - Função que varre uma pasta (para `dist/`), reutilizada pela T3.2; função que avalia variáveis `VITE_*` (nome sugere segredo: `TOKEN|SECRET|PASSWORD|API_?KEY|PRIVATE|HOOK`; exceção: as 3 do EmailJS, as de `SECRETS_SCAN_OMIT_KEYS` do `netlify.toml`).
  - Substitui, em generalidade, os 2 testes genéricos de `netlify/assistant/secrets.test.ts` ("repositório inteiro" e "`dist/`"); **os 2 do assistente morrem com ele (T5.1)**.
- **Testes:** `scripts/secretScan.test.ts`: credencial **montada em tempo de execução** (`'AIza' + 'x'.repeat(35)`) em arquivo temporário (`os.tmpdir`) é achada e mascarada; sem ela passa; um teste varre os arquivos rastreados reais e passa (linha de base 0, E12); `VITE_X_TOKEN` falha; as 3 do EmailJS passam; arquivo CRLF; sem `git` (simulado) avisa. Nenhuma credencial escrita em arquivo.
- **Critérios de aceitação:** a varredura acha uma credencial de teste plantada e passa sem ela (Success Metric); o teste roda na etapa de testes do `verify`.
- **Arquivos prováveis:** `scripts/secretScan.ts`, `scripts/secretScan.test.ts`
- **Verificação:** `npx vitest run scripts/secretScan.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-16)

### T3.2 Plugin `secretGuard` (bundle e variáveis públicas)
- **Requisito:** FR-016, NFR-002, TD-011 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.1
- **Trabalho:** `scripts/secretGuard.ts` (plugin `apply: 'build'`): (a) `VITE_*` com nome que sugere segredo falha, exceto as 3 do EmailJS; (b) o **valor** de variável secreta do ambiente (nome com os termos, valor ≥ 8 caracteres) dentro do bundle falha; (c) os padrões do §7 no bundle falham. Registrar o plugin em `vite.config.ts` (acrescentar; sem tirar nada, T5.1 cuida do resto). Substitui o teste "`dist/` não tem chave" do assistente.
- **Testes:** `scripts/secretGuard.test.ts` (função pura e plugin, no molde de `personalGuard.test.ts`): bundle sintético com credencial montada em tempo de execução falha mascarado; sem ela passa; valor de variável secreta no bundle falha; EmailJS passa.
- **Critérios de aceitação:** `npx vite build` real passa (sem segredo); a mensagem nunca imprime o valor.
- **Arquivos prováveis:** `scripts/secretGuard.ts`, `scripts/secretGuard.test.ts`, `vite.config.ts`
- **Verificação:** `npx vitest run scripts/secretGuard.test.ts` (exit 0); `npx vite build` (exit 0). (V-16)

---

## Fase 4: Suíte rápida (primeira alavanca)

### T4.1 `pool: 'vmThreads'` e medição
- **Requisito:** FR-004, FR-005, TD-008 (itens 1 e 4), R-001, R-003 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** nenhuma (fazer antes das ondas: o gate delas fica mais rápido e menos instável)
- **Trabalho:** em `vite.config.ts`, `test.pool: 'vmThreads'`; manter `testTimeout: 20000` e `asyncUtilTimeout: 5000` (**não aumentar**). Medir a memória e o tempo em 2 execuções (a medição de referência é a E5: 91 a 112 s, 0 falhas). Se um teste quebrar por `vmThreads`, o plano B é `pool: 'forks'` com `isolate` mantido (R-001); registrar e perguntar antes de trocar.
- **Testes:** a própria suíte; nenhum teste é alterado, pulado ou removido nesta tarefa.
- **Critérios de aceitação:** a suíte completa passa 2 vezes seguidas com 0 falhas; tempo registrado com a condição de medição (máquina, Node, o que estava aberto).
- **Arquivos prováveis:** `vite.config.ts`
- **Verificação:** `npx vitest run` (exit 0, 2 vezes seguidas, 0 falhas; anotar a duração de cada); `npx tsc --noEmit` (exit 0).
- **Commit:** `perf(testes): pool vmThreads na suíte (T4.1)`

---

## Fase 5: Remoção do código fora do MVP (Anexo B)

> **Pré-condição de toda a fase (e da primeira tarefa de implementação da spec que apagar algo, T5.1):**
> 1. `node scripts/status.mjs check 001-engineering-baseline tasks:approved` com exit 0 (a Duda promoveu);
> 2. o "Confirm before building" (fim deste arquivo) foi feito: o implementador restatou os FRs e as restrições e **a Duda respondeu OK**;
> 3. estar na branch `rebuild/sdd` (`git branch --show-current`) e com a árvore limpa de alterações **do código** (`git status --short` sem arquivo de `src/`, `scripts/`, `netlify/`; `src.zip` já está no `.gitignore` pela T1.1).
> **Regras de toda onda:** desacoplar primeiro, apagar depois; teste que cobre só código removido sai junto e entra na lista do commit; teste misto é **editado** (só os casos do código removido saem, listados um a um); nunca `skip`/`todo`/`xit`; falha de comportamento que permanece é corrigida (FR-006). Cada onda é um commit, **sem `git push`**.

### T5.1 Onda 1: assistente de IA (G-1)
- **Requisito:** FR-006, FR-004, FR-016, D-004, TD-010 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.1, T3.2 (o teste genérico de segredos entra e passa **antes** de `secrets.test.ts` ser apagado), T4.1, T2.7 (ambas editam `vite.config.ts`; evita conflito) e a pré-condição da Fase 5
- **Trabalho:**
  - **Primeiro, confirmar** `npx vitest run scripts/secretScan.test.ts scripts/secretGuard.test.ts` verde.
  - **Desacoplar:** tirar `assistantContextPlugin` e o import de `vite.config.ts`; tirar `pergunte` de `src/terminal/extras/index.ts`; remover o script `ask:eval` do `package.json`; no `netlify.toml` remover **só** `included_files` e o comentário do assistente (**manter `directory = "netlify/functions"` e o bloco `[functions]`**, são da 008); tirar a entrada de `netlify/assistant/context.json` do `.gitignore`; remover de `src/i18n/ui.ts` as chaves de `ask`/`pergunte` que ficarem sem leitor.
  - **Apagar:** `netlify/assistant/{gemini,handle,limiter,prompt,region,validate}.ts`, `netlify/functions/ask.mts`, `scripts/askEvals.cases.ts`, `scripts/assistantContext.ts`, `src/services/ask.ts`, `src/terminal/extras/ask.tsx`, e localmente `netlify/assistant/context.json`. Testes que saem junto: `netlify/assistant/{handle,limiter,secrets}.test.ts`, `scripts/askEvals.cases.test.ts`, `scripts/askEvals.live.test.ts`, `scripts/assistantContext.test.ts`, `src/services/ask.test.ts`, `src/terminal/extras/ask.test.tsx`. (`secrets.test.ts` só sai porque os 2 testes genéricos já vivem na T3.1; os 2 do assistente morrem com ele.)
  - **Não tocar:** `@netlify/blobs` (as Functions `personal-*` ainda o usam), `netlify/personal/`, `personal-*.mts`, `scripts/personalGuard.*`.
  - Atualizar `README.md`/`docs/` se citarem o assistente (varredura (c)).
- **Testes:** os que sobram devem passar sem edição; edição só nos mistos que o `typecheck` acusar (listar caso a caso no commit). Nenhum `skip`.
- **Critérios de aceitação:** gate de onda verde; o terminal (MVP) segue com os outros comandos; `grep` de `pergunte` e `GEMINI` sem ocorrência; `[functions]` e `@netlify/blobs` intactos.
- **Arquivos prováveis:** os listados acima, mais `vite.config.ts`, `package.json`, `netlify.toml`, `.gitignore`, `src/i18n/ui.ts`, `src/terminal/extras/index.ts`
- **Verificação (gate de onda):** `npx tsc --noEmit`; `npx vite build`; `npx vitest run` (todos exit 0); `git grep -n -E "netlify/assistant|assistantContext|askEvals|services/ask|functions/ask|pergunte|GEMINI" -- src scripts netlify vite.config.ts package.json netlify.toml .env.example` (exit 1); `git grep -n -E "\b(it|test|describe)\.(skip|todo)|\bxit\b|\bxdescribe\b" -- src scripts netlify` (exit 1); `git grep -n -E "pergunte|assistente de IA|GEMINI|functions/ask" -- e2e public README.md docs index.html` (exit 1 ou exceções listadas); `git diff --name-only HEAD -- netlify/personal netlify/functions scripts/personalGuard.ts` não pode listar nada além de `netlify/functions/ask.mts`.
- **Evidência e commit:** bloco de evidência; um commit `refactor(remocao): assistente de IA e comando pergunte (T5.1, G-1)`, com a lista de arquivos e testes removidos. Sem push.

> **Ação da Duda (fora da contagem de tarefas):** depois da T5.1, apagar `GEMINI_API_KEY` e `GEMINI_MODEL` do painel do Netlify (DQ-012). O implementador não consegue fazer nem conferir isso. As variáveis `HARDCOVER_*`, `TMDB_API_KEY` e `PERSONAL_*` ficam até depois da 008.

### T5.2 Onda 2: jogos (G-2)
- **Requisito:** FR-006, FR-004, DQ-007, TD-010 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.1
- **Trabalho:**
  - **Desacoplar:** tirar o bloco `games` de `src/components/paletteItems.ts` (`LEVELS`, `LEVEL_NAMES`); tirar a rota `jogos` (e `aliases`) de `src/data/routes.ts`, o `case 'jogos'` de `src/App.tsx`, a entrada em `src/pages/lazyPages.ts`, o mock do `GameCenter` em `src/test/setup.ts`, a meta de `jogos` em `src/data/seo.ts` (o `scripts/seoPlugin.ts` lê as rotas e some sozinho; conferir); tirar `jogos`, `minas` e `sair` de `src/terminal/extras/index.ts`; remover `.games` e `.game-*` de `src/styles/workspace.css` (linhas 507-565 e 684 hoje; conferir os números); tirar o bloco de jogos da home provisória (`InteractivePanel` em `PersonaHomeSections.tsx`, DQ-007). `/jogos` passa a responder 404 (o redirecionamento antigo é da 010).
  - **Apagar:** `src/terminal/games/{Minesweeper.tsx,bestTimes.ts,mines.ts}`, `src/pages/GameCenter.tsx`, `src/terminal/extras/games.tsx`, `src/components/dashboard/InteractivePanel.tsx`; testes `src/terminal/games/Minesweeper.test.tsx`, `src/terminal/games/mines.test.ts`.
  - **Editar (misto):** `src/pages/Workspace.test.tsx` (só os casos de jogo saem, listados).
- **Testes:** os restantes passam sem `skip`; casos removidos listados no commit.
- **Critérios de aceitação:** gate de onda verde; a paleta e o terminal funcionam sem jogos; nenhuma referência a jogo fora de exceções.
- **Arquivos prováveis:** os acima, `src/test/setup.ts`
- **Verificação (gate de onda):** `npx tsc --noEmit`; `npx vite build`; `npx vitest run` (exit 0); `git grep -n -E "GameCenter|Minesweeper|bestTimes|terminal/games|extras/games|case 'jogos'|'minas'" -- src scripts netlify vite.config.ts package.json netlify.toml` (exit 1); a varredura (b) (exit 1); `git grep -n -E "/jogos|/games|GameCenter|Minesweeper|campo minado" -- e2e public README.md docs index.html` (exit 1 ou exceções listadas).
- **Commit:** `refactor(remocao): jogos e campo minado (T5.2, G-2)`

### T5.3 Onda 3, parte 1: trilhas, desacoplar (G-3)
- **Requisito:** FR-006, DQ-014 (itens 1 e 2), R-004 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T5.5 (o Caderno já saiu; nova ordem, DQ-014)
- **Trabalho (só editar; nada é apagado aqui):**
  - `src/App.tsx`: tirar `TrailProvider`, `TourHost` e `SecretToast` da árvore.
  - `src/terminal/TerminalSession.tsx` (tirar `useTrail`) e `src/terminal/commands.tsx` (tirar o tipo `TrailValue` e `ctx.trail`).
  - Apagar as chamadas de `emitTrailEvent` em `src/hooks/useTheme.tsx`, `src/i18n/LanguageContext.tsx` e `TerminalSession.tsx` (tema e idioma não mudam de comportamento).
  - `src/pages/Home.tsx`: tirar `TrailCard`. `src/components/shell/SiteShell.tsx`: tirar a faixa `PageNext`. `src/terminal/extras/index.ts`: tirar `trilha`.
  - Os arquivos de trilha continuam no disco, sem importadores.
- **Testes:** `npx vitest run` pode acusar testes que cobrem só o código desacoplado; **não** apagar ainda: eles saem na T5.4 junto com o código. Ajustar agora só o que quebrar por comportamento que permanece (por exemplo, `SiteShell.test.tsx`, `Overlays.test.tsx`), caso a caso.
- **Critérios de aceitação:** `tsc` e `vite build` verdes; o app e o terminal sobem sem provider de trilha; nenhum arquivo fora do grupo importa `src/trails/*`.
- **Arquivos prováveis:** os acima
- **Verificação:** `npx tsc --noEmit` (exit 0); `npx vite build` (exit 0); `git grep -n -E "from '.*trails/(TrailProvider|events|TourHost|SecretToast|TrailCard)'" -- src` lista **só** arquivos de `src/trails/` e seus testes; `npx vitest run` (exit 0, ou falhas só nos testes de trilha listados para a T5.4). Evidência parcial; **sem commit** (o commit da onda é na T5.4).

### T5.4 Onda 3, parte 2: trilhas, apagar e fechar a onda (G-3)
- **Requisito:** FR-006, FR-004, TD-010 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.3
- **Trabalho:**
  - **Apagar:** `src/trails/{Tour,TrailProgress,storage,TrailProvider,events,TourHost,SecretToast,TrailCard}.tsx|ts`, `src/data/trails.ts`, `src/utils/visited.ts`, `src/terminal/extras/trilha.tsx`, `src/components/PageNext.tsx`.
  - **Testes que saem junto:** `trails/Tour.test.tsx`, `TrailCard.test.tsx`, `TrailProvider.test.tsx`, `gamification.test.tsx`, `data/trails.test.tsx`, `terminal/extras/trilha.test.tsx`, `PageNext.test.tsx` (19).
  - **Editar (misto):** `src/data/experiences.test.ts` (sai o que usa `secrets` de `trails.ts`; **fica** `experienceGroups`); `notebook.test.tsx` e `r1.test.tsx` só nos casos de trilha e `PageNext` (os arquivos saem inteiros na T5.5).
  - Remover de `src/i18n/ui.ts` as chaves `tour` e `trail` sem leitor.
- **Testes:** restantes passam; nada de `skip`; casos editados listados.
- **Critérios de aceitação:** gate de onda verde.
- **Arquivos prováveis:** os acima
- **Verificação (gate de onda):** `npx tsc --noEmit`; `npx vite build`; `npx vitest run` (exit 0); `git grep -n -E "TrailProvider|useTrail|emitTrailEvent|TrailCard|TourHost|SecretToast|PageNext|src/trails|data/trails|utils/visited|extras/trilha|'trilha'" -- src scripts netlify vite.config.ts package.json netlify.toml` (exit 1); a varredura (b) (exit 1); `git grep -n -E "/trilha|/trail|TrailProvider|PageNext|tour guiado" -- e2e public README.md docs index.html` (exit 1 ou exceções listadas).
- **Commit:** `refactor(remocao): trilhas, visita guiada e PageNext (T5.3, T5.4, G-3)` (um commit para as duas partes).

### T5.5 Onda 2b: remover o Caderno, ANTES das trilhas (DQ-001; ordem alterada por DQ-014)
- **Requisito:** FR-006, DQ-001, G-5 opção 1 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.2 (nova ordem: o Caderno sai antes da onda 3; esta tarefa fecha a onda 2b com o gate de onda e UM commit)
- **Trabalho:**
  - Apagar `src/components/notebook/`, `src/data/notebook/`, `src/i18n/nb.ts`, `src/styles/notebook.css`, `src/config.ts`, `src/components/shell/shellProps.ts` (confirmar que ninguém de fora importa antes) e os testes `notebook.test.tsx` (52) e `r1.test.tsx` (26).
  - Remover a ramificação `CADERNO_V2` de `Home.tsx`, `SiteShell.tsx`, `App.tsx`, `main.tsx`, `SectionPage.tsx`, `CaseStudy.tsx`, `NotFound.tsx`, `PersonalHub.tsx`; o site fica com **uma** casca só (a de `CADERNO_V2` desligado, que é o padrão de hoje).
  - Atualizar `README.md` e `docs/` se citarem o flag (varredura (c)). O histórico guarda tudo (`9145f2b`). Os steering e o `CLAUDE.md` citam `CADERNO_V2`: **não editar aqui**, listar para a Duda (DQ-017).
- **Testes:** os que sobram passam; os 78 testes do Caderno saem com o código (FR-006).
- **Critérios de aceitação:** `tsc`, `vite build` e `vitest run` verdes; a casca e a home continuam renderizando como com o flag desligado (os testes de `SiteShell` e `Home` provam).
- **Arquivos prováveis:** os acima
- **Verificação:** `npx tsc --noEmit`; `npx vite build`; `npx vitest run` (exit 0); `git grep -n -E "CADERNO_V2|components/notebook|data/notebook|i18n/nb|styles/notebook|shellProps" -- src scripts vite.config.ts package.json` (exit 1). Evidência parcial; **sem commit** (o commit da onda 4 é na T5.7).

### T5.6 Onda 4, parte 2: personas, desacoplar (G-4)
- **Requisito:** FR-006, DQ-007, R-004 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T5.4
- **Trabalho (editar; nada de persona é apagado aqui):**
  - `src/data/routes.ts`: tirar as rotas `/r/<persona>` e o campo `Route.persona`; `src/data/seo.ts` e `scripts/seoPlugin.ts`: tirar os ramos de persona; `src/data/seo.test.ts` (7 linhas de persona saem).
  - `src/App.tsx`: remover o provider e `PersonaHome`; `Sidebar.tsx` (`byPersona`, `isPick`), `CommandPalette.tsx`, `paletteItems.ts` (`boostOf`), `searchRanking.ts` (tirar o favorecimento por persona de `filterItems`; a busca continua), `dashboard/QuickAccess.tsx`, `dashboard/FeaturedProjects.tsx`: tirar cada `usePersona()`.
  - Terminal: `Terminal.tsx`, `commands.tsx` (interpretador da pergunta pendente), `extras/index.ts`: tirar a pergunta de persona e o comando `visitante`.
  - Home: extrair a composição **padrão** (`DEFAULT_HOME`: `quick`, `projects`, `github`, DQ-007) para um arquivo próprio sem persona; `Home.tsx` e `PersonaHomeSections.tsx` passam a montagem fixa dos blocos padrão (sem `intents`, sem jogos); `sections/portfolio/ProjectCard.tsx`: tirar `<ProjectLens>`.
  - `src/test/setup.ts`: remover a linha que grava `portfolio-persona-asked`.
- **Testes:** ajustar só o que quebra por comportamento que permanece; os testes que cobrem apenas persona saem na T5.7.
- **Critérios de aceitação:** `tsc` e `vite build` verdes; o site e o terminal funcionam sem persona; a página de projetos mostra o card sem lente; nenhum arquivo do MVP importa `personas.ts` ou `usePersona`.
- **Arquivos prováveis:** os acima
- **Verificação:** `npx tsc --noEmit` (exit 0); `npx vite build` (exit 0); `git grep -n -E "usePersona|data/personas'|personaHome" -- src` lista **só** arquivos do grupo G-4 e seus testes; `npx vitest run` (exit 0 ou falhas só nos testes de persona listados para a T5.7). Evidência parcial; **sem commit**.

### T5.7 Onda 4, parte 3: personas, apagar, testes mistos e fechar a onda (G-4)
- **Requisito:** FR-006, FR-004, TD-010 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T5.6
- **Trabalho:**
  - **Apagar (A):** `src/experiences/{client/SolutionJourney,explore/ExploreMode,professor/AcademicTimeline,recruiter/ProfessionalOverview,tech/ArchitectureExplorer}.tsx`, `src/data/{clientJourney,architecture,explore,nextActions,projectPerspectives,intents,personas,personaHome}.ts`, `src/hooks/{usePerspectives,usePersona}.ts(x)`, `src/components/{PersonaPrompt,ProjectLens}.tsx`, `src/components/dashboard/IntentShortcuts.tsx`, `src/terminal/extras/persona.tsx`, `src/styles/experiences.css` (e a linha de `import` em `src/main.tsx`), `.persona-*` de `workspace.css` (a partir da linha 738; conferir).
  - **Testes que saem:** `experiences/experiences.test.tsx`, `data/{personas,personaHome,personaRoutes,nextActions,projectPerspectives}.test.ts(x)`, `hooks/usePersona.test.tsx`, `components/{PersonaLens,PersonaPrompt,ProjectLens}.test.tsx`, `pages/HomePersona.test.tsx`, `PersonaFlows.test.tsx`, `terminal/persona.test.tsx`.
  - **Editar (misto), caso a caso, mantendo o resto:** `data/experiences.test.ts`, `data/personalDiscovery.test.tsx` (**mantém** o que prova o espaço cultural), `data/search.test.ts` (**mantém** a busca sem persona), `components/SearchDiscovery.test.tsx`, `pages/Workspace.test.tsx`, `data/seo.test.ts`, `components/Overlays.test.tsx`, `terminal/extras/extras.test.tsx`, `components/shell/SiteShell.test.tsx`. Registrar a contagem exata de casos (com `it.each` expandidos) antes e depois.
  - Remover de `src/i18n/ui.ts` as chaves `persona` sem leitor.
- **Testes:** passam; nenhum `skip`; lista de casos removidos no commit.
- **Critérios de aceitação:** gate de onda verde **com o padrão V-06 completo do design**; `/r/<persona>` e `/jogos` não existem em `src/`, `e2e/`, `public/`, `README.md`, `docs/`, `index.html` (exceções só com motivo).
- **Arquivos prováveis:** os acima
- **Verificação (gate de onda):** `npx tsc --noEmit`; `npx vite build`; `npx vitest run` (exit 0); `git grep -n -E "usePersona|TrailProvider|GameCenter|netlify/assistant|assistantContext|pergunte|emitTrailEvent" -- src scripts netlify vite.config.ts package.json netlify.toml` (exit 1); `git grep -n -E "\b(it|test|describe)\.(skip|todo)|\bxit\b|\bxdescribe\b" -- src scripts netlify` (exit 1); `git grep -n -E "/r/|/jogos|/games|/trilha|/trail|persona|GameCenter" -- e2e public README.md docs index.html` (exit 1, ou cada exceção com motivo no commit); `git grep -n -E "personas|PersonaHome|PersonaPrompt|ProjectLens|searchRanking|CADERNO_V2|notebook" -- src scripts` (exit 1, exceto o que o `searchRanking` mantiver por outra razão, caso a caso).
- **Commit:** `refactor(remocao): personas e contexto por persona (T5.6, T5.7, G-4)` (um commit para as duas partes). O Caderno saiu antes, na onda 2b (T5.5, um commit próprio com o gate de onda: `refactor(remocao): Caderno (T5.5, G-5)`).

### T5.8 Limpeza final da remoção
- **Requisito:** FR-006, FR-004 · **Prioridade:** P1 · **Estimativa:** 3 h · **Dependências:** T5.7
- **Trabalho:** chaves de `src/i18n/ui.ts` sem leitor (o `deadCode.test.ts` pega o que sobrar), CSS sem uso, resíduos em `src/test/setup.ts`, comentários que citem o código removido. Conferir que `netlify/personal/`, `personal-*.mts`, `@netlify/blobs`, o bloco `[functions]` e `.env.example` seguem **intactos**.
- **Testes:** `src/terminal/deadCode.test.ts` e a suíte completa.
- **Critérios de aceitação:** `deadCode.test.ts` verde; gate de onda verde; nenhum arquivo da 008 alterado.
- **Arquivos prováveis:** `src/i18n/ui.ts`, `src/styles/*.css`, `src/test/setup.ts`
- **Verificação:** `npx tsc --noEmit`; `npx vite build`; `npx vitest run src/terminal/deadCode.test.ts` e `npx vitest run` (exit 0); o V-06 completo (3 varreduras, como na T5.7); `git diff --name-only HEAD~1 -- netlify/personal netlify/functions/personal-books.mts netlify/functions/personal-films.mts netlify.toml` sem listar nada além do já previsto.
- **Commit:** `chore(limpeza): chaves, CSS e setup sem uso após a remoção (T5.8)`

---

## Fase 6: Consolidação (paridade, suíte rápida, formatação, medição)

### T6.1 Paridade PT/EN
- **Requisito:** FR-014, TD-004, EC-12, EC-13 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.8 (a lista fechada de árvores é a que **sobrou** da remoção)
- **Trabalho:** `scripts/parity.ts` (`diffKeys(árvoreA, árvoreB)`: folhas por caminho; falta de um lado, vazio, tipo diferente; arrays comparam o tamanho e depois cada posição) e `src/i18n/parity.test.ts` aplicando a `ui.pt` × `ui.en` e às árvores por idioma ainda existentes (`portfolio`, `resume`, `services`, `projects[].pt/en`; lista fechada que a 003 esvazia, L-010). Mensagens do §6.3.
- **Testes:** `parity.test.ts` (verde com `ui` real); árvore de teste sem uma chave EN falha nomeando a chave e `"en"`; texto vazio; tipo diferente (função × texto); EN igual ao PT **não** é erro.
- **Critérios de aceitação:** remover uma tradução EN de uma chave faz o teste falhar com `paridade: <arquivo> › <chave> — falta a tradução em "en"` (US-003).
- **Arquivos prováveis:** `scripts/parity.ts`, `scripts/parity.test.ts`, `src/i18n/parity.test.ts`
- **Verificação:** `npx vitest run src/i18n/parity.test.ts scripts/parity.test.ts` (exit 0). (V-14)

### T6.2 Projetos `unit` (node) e `dom` (jsdom) e o script `content:check`
- **Requisito:** FR-004, FR-005, TD-008 (item 2), E6 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.8, T4.1
- **Trabalho:** em `vite.config.ts`, dois projetos do Vitest: `unit` (`environment: 'node'`, `**/*.test.ts`, sem o `setup.ts` de DOM) e `dom` (jsdom, `**/*.test.tsx`, com `setup.ts`); arquivo `.test.ts` que precise de DOM declara `// @vitest-environment jsdom`. Acrescentar ao `package.json` `content:check` = `vitest run --project unit src/content scripts/contentValidator.test.ts` (design §6.1). Medir (estimativa E6, ainda sem prova).
- **Testes:** a suíte completa; nenhum teste muda de conteúdo, só a declaração de ambiente quando necessária.
- **Critérios de aceitação:** 0 falhas; antes e depois, a mesma contagem de testes (anotar); tempo anotado.
- **Arquivos prováveis:** `vite.config.ts`, `package.json`, cabeçalhos de `.test.ts` que usem DOM, `src/test/setup.ts`
- **Verificação:** `npx vitest run --project unit` e `npx vitest run --project dom` (exit 0); `npx vitest run` (exit 0, contagem total igual à anterior); `npm run content:check` (exit 0).
- **Commit:** `perf(testes): projetos unit e dom e script content:check (T6.2)`

### T6.3 Dividir `terminal/sections.test.tsx`
- **Requisito:** FR-005, TD-008 (item 3), E7 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.8, T6.2
- **Trabalho:** dividir o arquivo (65 s e 52 testes antes da remoção; confirmar a contagem atual) em 2 ou 3 arquivos por página, **sem mudar nenhum caso**; helpers compartilhados num arquivo à parte.
- **Testes:** a contagem de casos nos novos arquivos = a do arquivo original (anotar antes e depois); nada de `skip`.
- **Critérios de aceitação:** mesma contagem; nenhum arquivo isolado passa de ~25 s sob `vmThreads` (anotar os 5 maiores).
- **Arquivos prováveis:** `src/terminal/sections*.test.tsx`
- **Verificação:** `npx vitest run src/terminal` (exit 0); `npx vitest run` (exit 0, mesma contagem total).
- **Commit:** `perf(testes): dividir sections.test.tsx por página (T6.3)`

### T6.4 Configuração de formatação (sem reformatar)
- **Requisito:** TD-007, DQ-009 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T5.8
- **Trabalho:** `.prettierrc` ganha `"endOfLine": "auto"`; `.prettierignore` ganha `docs`, `.ai`, `.claude`, `*.md`, `public`, `.verify`, `test-results`, `playwright-report`, `scripts/status.mjs`; `.gitattributes` com `* text=auto`. **Não rodar `prettier --write` nesta tarefa.** Não rodar `git add --renormalize`.
- **Testes:** `npx prettier --check scripts/status.mjs` não é executado (ignorado); contagem de arquivos fora do formato anotada para a T6.5.
- **Critérios de aceitação:** `npx prettier --check .` não reclama de `.md`, `status.mjs` nem de fim de linha; a lista restante é só código e configuração.
- **Arquivos prováveis:** `.prettierrc`, `.prettierignore`, `.gitattributes`
- **Verificação:** `npx prettier --check .` (exit 1 com **só** arquivos de código, anotar a lista; **nenhum** `.md`, `status.mjs`, nem diferença de CRLF); `git status --short` lista só os 3 arquivos de configuração.
- **Commit:** `chore(config): prettier endOfLine auto, .prettierignore e .gitattributes (T6.4)`

### T6.5 Commit só de formatação
- **Requisito:** TD-007 (item 3), R-006 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T6.1, T6.2, T6.3, T6.4 (é a **última** alteração de código; nada de lógica no mesmo commit)
- **Trabalho:** `npx prettier --write .` uma única vez; conferir que o diff é só formatação; acrescentar o `.verify/` ao que já está ignorado (T1.1).
- **Testes:** a suíte inteira prova que nenhum comportamento mudou.
- **Critérios de aceitação:** `prettier --check .` exit 0; `tsc`, `vite build` e `vitest run` verdes; o commit só tem arquivos que o Prettier cobre (nada de `.md`, `public`, `.ai`).
- **Arquivos prováveis:** os ~30 arquivos de código/config que sobraram fora do formato
- **Verificação:** `npx prettier --check .` (exit 0); `npx tsc --noEmit` (exit 0); `npx vite build` (exit 0); `npx vitest run` (exit 0); `git diff --stat` revisado: nenhum arquivo fora do conjunto da lista de T6.4.
- **Commit:** `style(formatacao): prettier --write em todo o código (T6.5)`, **só** formatação.

### T6.6 Medição final e estabilidade (3 execuções verdes)
- **Requisito:** FR-004, FR-005, NFR-001, DQ-002, TD-009, R-002, R-008 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T6.5
- **Trabalho:** com a máquina sem outro comando do projeto rodando (VS Code aberto e ocioso), rodar `npm test` **3 vezes seguidas** e `npm run verify` **3 vezes**; ler `.verify/times.jsonl`. Repetir 1 vez em **cópia fora do OneDrive** (R-002): `git clone . <pasta fora do OneDrive>` + `npm ci` + `npm run verify`. Registrar a máquina e as condições (Node, RAM livre, o que estava aberto). Os orçamentos aprovados são **suíte ≤ 90 s** e **verify ≤ 180 s**; se a suíte medir ≤ 60 s e o verify ≤ 120 s, os números originais voltam a ser o orçamento (TD-009); se o número exceder, **parar e propor outro à Duda** (não aumentar timeout).
- **Testes:** a suíte e o `verify` reais.
- **Critérios de aceitação:** 3 execuções de `npm test` com exit 0 e 0 falhas; 3 de `npm run verify` com exit 0, todas dentro do orçamento; a medição fora do OneDrive registrada; as linhas de `times.jsonl` com `ok:true`.
- **Arquivos prováveis:** nenhum (registro da evidência: DQ-015)
- **Verificação:** `npm test` (3 vezes; exit 0 nas três); `npm run verify -- --enforce-budget` (3 vezes; exit 0); `node -e "const l=require('fs').readFileSync('.verify/times.jsonl','utf8').trim().split('\n').map(JSON.parse);console.log(l.slice(-3).map(x=>x.total+' '+x.ok))"` (as 3 últimas com `ok` true); medição do clone fora do OneDrive registrada.

### T6.7 Aceite final: Linux, auditoria, zod fora do bundle, Won't e checklist
- **Requisito:** FR-003, FR-016, FR-017, NFR-002, §4.3, DQ-011, R-009, Success Metrics · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T6.6
- **Trabalho:**
  - `npm run verify` real em **PowerShell** e em **Git Bash** (exit 0 nos dois).
  - Clone limpo no **WSL Ubuntu** (vale como "Linux" até a 010, DQ-011): `wsl -- bash -lc "git clone /mnt/c/Users/maria/OneDrive/Desktop/portfolio ~/p && cd ~/p && npm ci && npm run verify"`. O clone só vê o que está **commitado**: por isso é a última tarefa.
  - `npm audit --omit=dev` (V-19, precisa de rede; fora do `verify`).
  - `zod` fora do bundle: `grep -r -l "ZodError\|zod" dist/static` (V-20, após `npx vite build`).
  - `git ls-files .github` vazio (FR-017: Won't, nada de CI nesta spec).
  - V-06 completo (as 3 varreduras do design) e `git grep` de `skip|todo`.
  - Percorrer o checklist dos Success Metrics do requirements e anotar cada item com o teste que o prova.
- **Testes:** os comandos acima são a verificação.
- **Critérios de aceitação:** todos os itens do Success Metrics marcados com evidência; `src.zip` intacto e fora do repositório.
- **Arquivos prováveis:** nenhum
- **Verificação:** `npm run verify` (exit 0, PowerShell e Git Bash); o comando do WSL acima (exit 0); `npm audit --omit=dev` (exit 0, `found 0 vulnerabilities`); `grep -r -l "ZodError\|zod" dist/static` (exit 1); `git ls-files .github` (exit 0, saída vazia); `git ls-files src.zip` (exit 0, saída vazia).

---

## Phase dependencies
```
T1.1 ─► T2.1 ─┬─► T2.2 ─┐
              ├─► T2.3 ─┤
              ├─► T2.4 ─┼─► T2.6 ─► T2.7 ──┐
              ├─► T2.5 ─┘                  │
              └─► T2.8                     │
T1.2 ─► T1.3                               │
T3.1 ─► T3.2 ──────────────────────────────┤
T4.1 ──────────────────────────────────────┴─► T5.1 ─► T5.2 ─► T5.3 ─► T5.4 ─► T5.5 ─► T5.6 ─► T5.7 ─► T5.8
                                                                                                          │
                    ┌─────────────────────────────────────────────────────────────────────────────────────┤
                    ├─► T6.1 ──────────────────┐
                    ├─► T6.2 ─► T6.3 ──────────┤
                    └─► T6.4 ──────────────────┴─► T6.5 ─► T6.6 ─► T6.7
```
- As Fases 1 a 4 não dependem uma da outra, exceto as setas acima; podem ser feitas em qualquer ordem entre si, uma tarefa por vez (todas editam `vite.config.ts` ou `package.json` em pontos diferentes).
- **A Fase 5 só começa depois de `tasks:approved` e do "Confirm before building", e depende de T2.7, T3.1, T3.2 e T4.1.** As ondas são estritamente sequenciais (uma por vez, cada uma com o gate completo).
- **Nova ordem (DQ-014, 2026-11-15):** onda 1 = T5.1; onda 2 = T5.2; **onda 2b = T5.5 (Caderno)**; onda 3 = T5.3 + T5.4 (um commit); onda 4 = T5.6 + T5.7 (um commit). Uma tarefa e um commit nas ondas 1, 2 e 2b.
- A Fase 6 só começa depois de T5.8. A formatação (T6.5) é a última mudança de código; a T6.7 vem depois dos commits, porque o clone do WSL só vê o que está commitado.

## Lacunas, propostas e perguntas abertas (nada foi editado em requirements/design aprovados)
| ID | Lacuna ou ambiguidade | Proposta (a Duda decide) |
| --- | --- | --- |
| DQ-014 | **Ordem do Caderno × ondas.** O Anexo B manda o Caderno na onda 4 (G-4), mas `NotebookHome` importa `TrailCard` e `NotebookShell` importa `PageNext` (G-3). Para a onda 3 fechar `tsc`, o Caderno precisa de uma edição mínima (T5.3) que a onda 4 depois apaga. Além disso, as ondas 3 e 4 têm mais de uma tarefa e a regra é **um commit por onda**: o trabalho fica sem commit por ~7 h (onda 3) e ~11 h (onda 4). **Item 3:** o padrão V-06 do design só dá exit 1 no fim (depois da onda 4) | **Padrão proposto:** seguir o Anexo B (edição mínima em T5.3, um commit por onda, V-06 por termos de cada onda e o completo na T5.7/T5.8/T6.7). **Alternativa:** mover o Caderno para antes da onda 3 (uma "onda 0") e/ou um commit por tarefa, cada um com o gate verde |
| DQ-015 | Onde guardar os blocos de evidência e as medições. O requirements diz que o tempo aprovado "é registrado no design", mas o design está aprovado (não se edita) | **Padrão proposto:** criar `.ai/sdd/specs/001-engineering-baseline/evidence.md` (só acrescenta blocos, nenhum arquivo aprovado muda); a Duda decide se prefere um adendo ao design |
| DQ-016 | O design (§13, "Respostas") registra que a adição do FR-018 (§5.6, V-21, V-22) ficou pendente de confirmação, e o texto ainda diz `.status` = `design:draft`. O `.status` hoje é `design:approved` | Confirmar que a promoção cobre o §5.6 (T2.4 depende disso). Se sim, nada muda; o texto antigo do design é histórico |
| DQ-017 | O `CLAUDE.md` e o steering citam `CADERNO_V2` e o redesenho Caderno; a T5.5 o remove na 001 | Listar para a Duda decidir qual documento atualizar (princípio 10 do steering). Esta spec não edita nenhum deles. Idem L-011 (números do steering) |
| Nota | O `package.json` `content:check` do design (§6.1) usa `--project unit`, que só existe depois de T6.2 | Resolvido na ordem das tarefas: o script entra na T6.2 |
| Nota | Termos amplos do V-06 (`persona`, `/r/`) podem casar com registro histórico em `docs/` | Já previsto no design: lista de exceções com motivo no commit da onda |

## Confirm before building
Antes de qualquer tarefa de implementação, o implementador **restata com as próprias palavras** e espera o **OK explícito da Duda**:
1. **FRs (resumo):** um único comando `verify` roda formatação, lint sem avisos, tipos, testes e geração, na ordem, para na primeira falha e diz qual (FR-001 a FR-003); a suíte passa 3 vezes seguidas, dentro de 90 s, e o `verify` em 180 s, com tempo registrado (FR-004, FR-005, NFR-001); o código fora do MVP (assistente, jogos, trilhas, personas e o Caderno) sai nas ondas, sem nunca silenciar teste (FR-006, DQ-001); cinco primitivas, nota e plugin de build recusam conteúdo errado com arquivo, campo e motivo (FR-007 a FR-013, FR-018); paridade PT/EN e sem texto de reserva (FR-014, FR-015); varredura de segredos (FR-016); CI não entra (FR-017).
2. **Restrições:** branch `rebuild/sdd`, **nenhum `git push`** e nenhum merge na `main`; `src.zip` não é apagado nem comitado; nada da 008 é tocado (`netlify/personal/`, `personal-*.mts`, integrações, `@netlify/blobs`, bloco `[functions]`); os 3 temas extras ficam para a 002; nenhum `skip`; nenhum dado inventado; só a Duda promove o `.status`.
3. **Perguntas abertas** DQ-014 a DQ-017 respondidas.
4. **Ação da Duda:** depois da onda 1, apagar `GEMINI_API_KEY` e `GEMINI_MODEL` do painel do Netlify.
Nada de código antes de `tasks:approved`.

## Respostas da Duda (2026-11-15) às perguntas DQ-014 a DQ-017
| ID | Resposta | Efeito neste arquivo |
| --- | --- | --- |
| DQ-014 | **Apagar o Caderno antes da onda 3.** (Muda a ordem do Anexo B aprovado, por decisão dela.) | T5.5 virou a **onda 2b** e depende de T5.2; T5.3 depende de T5.5 e perdeu a "edição mínima no Caderno"; T5.6 depende de T5.4. Ondas: 1, 2, 2b, 3, 4. O Anexo B recebeu a mesma correção de ordem |
| DQ-015 | **`evidence.md` na pasta da spec** | Cada tarefa fechada acrescenta seu bloco de evidência a `.ai/sdd/specs/001-engineering-baseline/evidence.md`; o `review.md` o consome |
| DQ-016 | **Já confirmada** (aprovação do design em 2026-11-15 cobre o FR-018) | Nenhuma ação |
| DQ-017 | **Já resolvida:** o steering foi atualizado (L-011) e o `CLAUDE.md` não existe mais | As menções a `CADERNO_V2` que restam são do código, que a T5.5 remove |

## Resposta da Duda (2026-11-16) à pergunta DQ-018
| ID | Lacuna e resposta | Efeito neste arquivo |
| --- | --- | --- |
| DQ-018 | **Lacuna achada ao começar a onda 3:** `src/experiences/explore/ExploreMode.tsx` importa `useTrail` (TrailProvider) e `secrets` (`src/data/trails.ts`), que a T5.4 apaga, mas só a T5.7 (onda 4) o apagava; a onda 3 deixaria o `tsc` quebrado. `src/data/explore.ts` (`exploreHints`) também depende de `secrets`. **Resposta: opção 1.** Antecipar a remoção do modo explorar para a onda 3. Sem código novo e sem copiar o estado de segredos. | **T5.3** passa a incluir: tirar o bloco `explore` da home do amigo (`personaHome.ts`: tipo e item `{ id: 'explore' }`; `PersonaHomeSections.tsx`: `lazy` e `case 'explore'`). **T5.4** passa a apagar também `src/experiences/explore/ExploreMode.tsx` e `src/data/explore.ts`, e a editar os testes mistos que os usam (`data/experiences.test.ts`: sai o caso que usa `secrets` e `exploreHints`, fica `experienceGroups`; `experiences/experiences.test.tsx`: sai a descrição `amigo: modo explorar`). **T5.7** deixa de apagar esses dois arquivos. O commit da onda 3 lista isso. Registrado antes do código. |

## Resposta da Duda (2026-11-16) à pergunta DQ-019
| ID | Lacuna e resposta | Efeito neste arquivo |
| --- | --- | --- |
| DQ-019 | **Lacuna achada na T6.4:** dos 20 arquivos de código fora do formato, 8 são da 008 (`netlify/personal/{films.test,films,letterboxd.test,letterboxdCsv,tmdb}.ts`, `scripts/importLetterboxd.mjs`, `src/services/integrations/{letterboxd/parse,tmdb/mock}.ts`), e o `tasks.md` diz que nenhuma tarefa os toca. **Resposta: opção 1.** Formatar os 20, incluindo os 8 da 008, só em formatação. | **T6.5** formata os 20 arquivos com um único `prettier --write .`; o commit diz que tocou a 008 só em formatação, e a suíte inteira prova que nada mudou. O `.prettierignore` do design não ganha exceção. Registrado antes do código. |
