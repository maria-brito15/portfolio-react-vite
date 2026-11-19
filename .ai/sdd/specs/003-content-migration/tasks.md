# 003 Content migration, Tasks
**Status:** draft (ver `.status`) · **Versão:** 0.1 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 + emendas anotadas de 2026-11-19 (FR-003 "hoje 7"; nota na Q-001), `design.md` (aprovado em 2026-11-19; §14 registra as respostas D1 a D6 da Duda)
**Estimativa total:** 19 tarefas, **49 h** (1 a 4 h cada), em 6 fases. A "Ação da Duda" (fora da contagem) está no fim.

## Como ler
- **Testes ficam dentro de cada tarefa.** Não há fase de testes separada.
- **Bloco de evidência** no fechamento de toda tarefa (conventions.md), gravado em `.ai/sdd/specs/003-content-migration/evidence.md` (mesmo padrão da 001 e da 002):
  ```
  Claim:     <o que se afirma>
  Command:   <comando exato>
  Exit code: <número>
  Summary:   <o que a saída mostrou>
  Verdict:   PASS | FAIL | PASS com ressalva
  ```
- **Commits** em português, `tipo(escopo): resumo (Tx.y)`, citando a tarefa. **Nenhuma tarefa inclui `git push`.** Nunca se toca em `main`. Branch `rebuild/sdd`.
- **Esta spec é só aditiva (design §8):** nenhuma tarefa apaga ou altera `src/data/*`, `src/utils/*` nem componente. Cada tarefa de conteúdo confere isso com `git diff --quiet -- src/data src/utils src/components src/sections src/pages` (exit 0) **na parte que ela não toca**. O único apagamento é o do `src/content/__migration__/` na T6.2, e só com a aprovação da Duda (FR-008).
- **Nada se inventa:** dado que não existe hoje (mês, carga horária, modalidade, nota de projeto, capa) fica ausente. Texto de conteúdo é copiado como está; divergência é decisão da Duda, não do implementador (D-001).
- **Fora desta spec:** telas (004 a 007), critérios e nota de projeto (005), filmes e livros (008), `fortunes` (009), `services`, `portfolio.tsx` (L-004), texto de interface do currículo (`print`, `showMore`, `since`…: 007). `variant` e `icon` dos projetos (D3) ficam fora do conteúdo.
- **Se um passo exigir mexer em código da 001 ou da 002** (validador, primitivas, `registry` além de acrescentar entradas): parar e propor a emenda à Duda; não remendar.

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados no `.status` | OK: `node scripts/status.mjs read 003-content-migration` devolveu `design:approved` (pressupõe `requirements:approved`). Requisitos v1.0 + emendas anotadas |
| Design aprovado no `.status` | OK: `design:approved` (2026-11-19) |
| Todo Must Have coberto | OK: FR-001 a FR-012 e NFR-001 a NFR-003 na tabela de cobertura (FR-007 é Should, também coberto) |
| Perguntas Q-* do requirements respondidas | OK: Q-001 a Q-005 (a Q-001 teve emenda: D1 migra as 3 capturas do EcoShop) |
| Perguntas Q-D1 a Q-D6 do design respondidas | OK: D1 a D6 em design §14 |
| Toda tarefa com dependências, critérios e verificação | OK (cada tarefa abaixo) |
| Todo V-01 a V-18 do design tem tarefa | OK: ver "Cobertura dos V-NN" |
| Emenda à 007 (D4: reescrever `/agora` e `/setup`) | OK: já registrada em `007/requirements.md` v1.1 (US-005, FR-015); **pendente o aceite da Duda junto do `tasks.md` da 007** |
| Estado do repositório | ATENÇÃO: há alterações não commitadas da 002 no working tree (`git status`). O implementador não as mistura: cada commit da 003 lista só os arquivos dela (`git add` por caminho) |
| `tasks.md` aprovado | NÃO: fica `tasks:draft`. **Nenhuma implementação começa antes de `tasks:approved` e do "Confirm before building"** |

## Cobertura FR / NFR -> tarefas
| Requisito | Tarefas |
| --- | --- |
| FR-001 (projetos: id, nome, início, stack, repo, caso, imagens, textos, selo, versões) | T1.2, T2.1, T3.1, T4.1 |
| FR-002 (projeto sem nota; a 003 não atribui) | T2.1 (campo `rating` recusado), T4.1 |
| FR-003 (7 experiências, grupos, destaque) | T2.2, T4.2 |
| FR-004 (acadêmico; nota, horas, modalidade opcionais) | T2.3, T4.3 |
| FR-005 (currículo e competências; sem ano estimado) | T2.4, T4.4 |
| FR-006 (contato e foto em link e imagem da 001) | T2.5, T4.5 |
| FR-007 (agora com data; setup vazio; rota segue rascunho) | T1.3, T2.5, T4.5, T6.1 (V-14) |
| FR-008 (equivalência item a item; descarte só com a Duda) | T3.1, T4.1 a T4.5, T6.1, T6.2 |
| FR-009 (regra de datas) | T2.1, T2.2, T4.1, T4.2 |
| FR-010 (paridade PT/EN) | T1.2, T5.2 |
| FR-011 (registro) | T4.1 a T4.5 (cada uma registra), T5.2 |
| FR-012 (sem texto de exemplo) | T1.3 (e todos os schemas: T2.x) |
| NFR-001 (validação ≤ 5 s; conteúdo só na página que o usa) | T5.1, T5.3, T6.1 |
| NFR-002 (sem segredo; varredura passa) | T6.1 (`npm run verify`) |
| NFR-003 (alt PT/EN em toda imagem) | T2.1, T2.5, T4.1, T4.5 |

### Cobertura dos V-NN do design (§10)
V-01, V-02 -> T2.1 · V-03 -> T2.2 · V-04 -> T2.3 · V-05, V-06 -> T2.4 · V-07, V-08 -> T2.5 · V-09 -> T5.2 · V-10 -> T3.1 e T4.1 a T4.5 (fatia por domínio), T6.1 (completo) · V-11 -> T3.1 · V-12 -> T1.2 · V-13 -> T5.2 · V-14 -> T6.1 · V-15 -> T1.3 · V-16 -> T5.3 · V-17 -> T5.1 · V-18 -> T6.1.

---

## Fase 1: Linha de base e primitivas novas

### T1.1 Linha de base: build, tempos e arquivos antigos
- **Requisito:** NFR-001 (JS do navegador não muda; custo no `verify`), design §6.6 itens 2 e 3 · **Prioridade:** P0 · **Estimativa:** 1 h · **Dependências:** nenhuma (depois de `tasks:approved` e do Confirm)
- **Trabalho:**
  - Rodar `npm run verify` e `npx vite build` no estado atual e gravar, em `evidence.md`, a seção "Linha de base": duração das etapas 4 e 5 (última linha de `.verify/times.jsonl`) e a lista `arquivo -> tamanho` dos chunks de `dist/assets`.
  - Gravar o hash do conteúdo dos módulos antigos (`git hash-object src/data/projects.tsx src/data/experiences.ts src/data/academics.ts src/data/resume.ts src/data/skillTimeline.ts src/data/profile.ts src/data/now.ts src/data/uses.ts`) para provar no fechamento que a 003 não os alterou.
- **Testes:** nenhum (só medição).
- **Critérios de aceitação:** (1) a linha de base tem tempos das etapas 4 e 5 e os tamanhos dos chunks; (2) os 8 hashes estão registrados; (3) nenhum arquivo do repositório foi alterado além de `evidence.md`.
- **Arquivos prováveis:** `.ai/sdd/specs/003-content-migration/evidence.md`
- **Verificação:** `npm run verify` (exit 0); `npx vite build` (exit 0); `git hash-object src/data/projects.tsx src/data/experiences.ts src/data/academics.ts src/data/resume.ts src/data/skillTimeline.ts src/data/profile.ts src/data/now.ts src/data/uses.ts` (exit 0, 8 linhas); `git status --short -- src` (o mesmo de antes da tarefa).
- **Commit:** `docs(003): linha de base de tempos, chunks e hashes (T1.1)`

### T1.2 Marcação `**negrito**`: `parseRich`, `plainText` e `RichTextSchema`
- **Requisito:** FR-001 (texto com marcação), FR-010, TD-001, D5 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T1.1
- **Trabalho:**
  - `src/content/rich.ts` (puro, sem zod, vai ao navegador): `parseRich(text): Segment[]` com `Segment = { text: string; strong: boolean }`; `plainText(text): string`. Só `**` (D5); nenhum HTML.
  - `src/content/schema/rich.ts`: `RichTextSchema` = `LocalizedTextSchema` + regras por idioma: `**` em pares, sem aninhar, sem `****`, sem tag HTML (`<` seguido de letra ou `/`). Texto sem `**` é válido sem mudança. Reexportar em `schema/index.ts`.
- **Testes:** `src/content/rich.test.ts` (texto puro, um negrito, vários, negrito no início e no fim, `**` sozinho tratado conforme o design, sem perder caractere: `plainText(parseRich(x).map(...))` consistente) e `src/content/schema/rich.test.ts` (`**` desbalanceado, aninhado, vazio e `<b>x</b>` falham com o campo e o idioma nomeados; texto comum e `a < b` passam).
- **Critérios de aceitação:** (1) a descrição do WhatsApp Dispatcher (única com marcação hoje) vira os segmentos esperados; (2) nenhuma importação de `zod` em `rich.ts`; (3) a mensagem de erro nomeia arquivo, campo e motivo.
- **Arquivos prováveis:** `src/content/rich.ts`, `src/content/schema/rich.ts`, `src/content/schema/index.ts`, `src/content/rich.test.ts`, `src/content/schema/rich.test.ts`
- **Verificação:** `npx vitest run src/content/rich.test.ts src/content/schema/rich.test.ts` (exit 0); `npx tsc --noEmit` (exit 0); `npx eslint src/content --max-warnings 0` (exit 0). (V-12)
- **Commit:** `feat(content): marcacao **negrito** e RichTextSchema (T1.2)`

### T1.3 `CalendarDate` e `withNoPlaceholders`
- **Requisito:** FR-007 (data de atualização), FR-012, TD-011, TD-014 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:**
  - `src/content/schema/calendarDate.ts`: texto `AAAA-MM-DD` que é um dia real (`2026-02-30`, `2026-13-01`, `2026-11-1`, `""`, `null` recusados; ano bissexto correto).
  - `src/content/schema/placeholder.ts`: `withNoPlaceholders(schema)` percorre todo texto do dado validado e acusa, com o caminho, `/\[[^\]]+\]/`, `lorem ipsum`, `TODO`, `TBD`, `FIXME` (design §6.5). Não altera o dado; só o recusa. Reexportar ambos em `schema/index.ts`.
- **Testes:** `calendarDate.test.ts` (válidas, `2026-02-30`, `2028-02-29` válida, `2027-02-29` inválida, formatos errados) e `placeholder.test.ts` (`[x]`, `lorem ipsum`, `TODO`, `TBD`, `FIXME` falham com o caminho do campo; texto normal passa; colchete vazio `[]` e sintaxe de lista fora de texto não são texto; dado aninhado em lista e objeto é percorrido).
- **Critérios de aceitação:** (1) o erro de placeholder traz o caminho (`projects[3].versions[0].points[1].en`); (2) ambos são reexportados; (3) nenhum dos dois altera schema da 001.
- **Arquivos prováveis:** `src/content/schema/calendarDate.ts`, `src/content/schema/placeholder.ts`, `src/content/schema/index.ts`, `src/content/schema/calendarDate.test.ts`, `src/content/schema/placeholder.test.ts`
- **Verificação:** `npx vitest run src/content/schema/calendarDate.test.ts src/content/schema/placeholder.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-15, parte de V-08)
- **Commit:** `feat(content): CalendarDate e withNoPlaceholders (T1.3)`

---

## Fase 2: Schemas por domínio

### T2.1 Schema de projeto
- **Requisito:** FR-001, FR-002, FR-009, NFR-003, TD-003, TD-004, TD-005 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2, T1.3
- **Trabalho:**
  - `src/content/schema/project.ts`: `ProjectSchema` (`strictObject`) e `ProjectsSchema` (lista; `id` único) conforme design §5.1: `id`, `name`, `start` (`ContentDate`), `dateLabel?` (precisa conter o ano de `start`), `stack` (`TagSet`), `repo?` (https), `caseStudy?` (caminho `/…`), `images` (`Image[]`), `badge?`, `description` (`RichText`), `versions?` (rótulo único; `date` não anterior a `start` via `compareDates`; `points` >= 1, lista de pares PT/EN). **Sem `rating`, `variant`, `icon`** (campo desconhecido recusado). Tudo dentro de `withNoPlaceholders`.
  - Função de id de etiqueta a partir do rótulo (TD-005: `Next.js 15` -> `next-js-15`, `CI/CD` -> `ci-cd`, `JavaScript ES6+` -> `javascript-es6`), exportada de `schema/project.ts` ou módulo irmão, usada só por testes e pelo conteúdo. Tipo `ContentProject` por `z.infer`. Reexportar em `schema/index.ts`.
- **Testes:** `src/content/schema/project.test.ts`, as linhas do requirements e do design: completo passa; sem `en` na descrição falha com `projects[2].description.en: texto ausente`; sem mês passa; sem `repo` passa; `React` repetido falha; `http://` falha; versão anterior ao início falha; `dateLabel` de outro ano falha; `rating` falha (campo desconhecido); id repetido falha; imagem com alt só em PT falha; a função de id dos 3 exemplos acima.
- **Critérios de aceitação:** (1) todas as linhas acima dão o resultado esperado; (2) a mensagem nomeia o campo; (3) nenhum campo `rating`, `variant`, `icon` no schema.
- **Arquivos prováveis:** `src/content/schema/project.ts`, `src/content/schema/index.ts`, `src/content/schema/project.test.ts`
- **Verificação:** `npx vitest run src/content/schema/project.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-01, V-02)
- **Commit:** `feat(content): schema de projeto (T2.1)`

### T2.2 Schema de experiência
- **Requisito:** FR-003, FR-009, TD-006 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2, T1.3
- **Trabalho:** `src/content/schema/experience.ts`: `ExperienceGroupsSchema` conforme design §5.2: grupos com `id` único, `title`, `items` >= 1; item com `id` **único entre todos os grupos**, `highlight?`, `period {start, label}`, `org`, `role`, `description`, `tag?`. Regra cruzada TD-006: `label.pt` contém o ano de `start`; com `start.month` contém `MM/AAAA`; sem mês não começa com `MM/AAAA`. Tipo `ContentExperienceGroup`. Reexportar.
- **Testes:** `src/content/schema/experience.test.ts`: os 7 rótulos reais como casos válidos ("02/2026", "2025–2026", "2º semestre de 2026 – em andamento" e os demais, lidos do módulo antigo `src/data/experiences.ts` para o teste não inventar rótulo); mês inventado (rótulo `03/2025` sem `start.month`) falha; ano divergente falha; id repetido entre grupos falha; grupo vazio falha; `highlight` ausente válido.
- **Critérios de aceitação:** (1) os 7 rótulos reais passam com o início que `parsePeriodStart` extrai deles; (2) cada falha nomeia o item e o campo.
- **Arquivos prováveis:** `src/content/schema/experience.ts`, `src/content/schema/index.ts`, `src/content/schema/experience.test.ts`
- **Verificação:** `npx vitest run src/content/schema/experience.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-03)
- **Commit:** `feat(content): schema de experiencia (T2.2)`

### T2.3 Schema do acadêmico
- **Requisito:** FR-004, TD-010, TD-012 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2
- **Trabalho:** `src/content/schema/academics.ts` conforme design §5.3: `programs[]` (`id` único, `start`/`end` anos de 4 dígitos, `end >= start`, `expected?`), `timeline[]`, `years[]` (itens `{kind: 'project'|'experience', id}`), `semesters[]` (`id` `AAAA-N` único, `program` **conferido contra `programs` no schema**, `inProgress?`, `courses` pode ser `[]`), `courses[]` (`name`, `hours?` inteiro > 0, `modality?` `presencial|hibrida|virtual`, `grade?` número finito >= 0 **sem teto**). Tipo `ContentAcademics`. Reexportar.
- **Testes:** `src/content/schema/academics.test.ts`: `grade` 0 e 120 válidas; `-1` e `NaN` inválidas; sem `grade` válida; semestre com programa inexistente falha; `end < start` falha; semestre em andamento com `courses: []` válido; `hours: 0` falha; `modality` fora da lista falha; `id` de semestre repetido falha.
- **Critérios de aceitação:** (1) nenhum teto de nota no schema (Q-002); (2) a referência `semesters[].program` é regra do schema, a de `years[].items[].id` fica para a T5.1.
- **Arquivos prováveis:** `src/content/schema/academics.ts`, `src/content/schema/index.ts`, `src/content/schema/academics.test.ts`
- **Verificação:** `npx vitest run src/content/schema/academics.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-04)
- **Commit:** `feat(content): schema do academico (T2.3)`

### T2.4 Schemas de competências e currículo
- **Requisito:** FR-005, TD-008 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2
- **Trabalho:**
  - `src/content/schema/skills.ts` (design §5.5): grupos com `id` único, `title`, `items` >= 1; item com `name` único no grupo, `since?` (ano de 4 dígitos), `source?` (`LocalizedText`); **`since` e `source` juntos ou nenhum**.
  - `src/content/schema/resume.ts` (design §5.4): `name`, `headline`, `location`, `languages`, `summary[]`, `skillAreas[]` `{label, text}`, `featuredProjects[]` `{project, subtitle, award?, points[]}`. Sem campo de texto de interface (`print`, `showMore`…) e sem nome ou link copiado do projeto. Tipos `ContentSkillGroup`, `ContentResume`. Reexportar.
- **Testes:** `skills.test.ts`: `since` sem `source` falha e o inverso falha; sem os dois vale; `since: 99999` e `since: "2020"` falham; nome repetido no grupo falha. `resume.test.ts`: completo passa; `featuredProjects[].project` ausente falha; `points` vazio falha; campo `print` (interface) é recusado como desconhecido; EN ausente num parágrafo do `summary` falha nomeando o índice.
- **Critérios de aceitação:** (1) competência sem fonte e sem ano é válida (FR-005: nunca ano estimado); (2) o currículo não tem espaço para duplicar nome e links de projeto.
- **Arquivos prováveis:** `src/content/schema/skills.ts`, `src/content/schema/resume.ts`, `src/content/schema/index.ts`, `src/content/schema/skills.test.ts`, `src/content/schema/resume.test.ts`
- **Verificação:** `npx vitest run src/content/schema/skills.test.ts src/content/schema/resume.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-05, V-06)
- **Commit:** `feat(content): schemas de competencias e curriculo (T2.4)`

### T2.5 Schemas de contato, "agora" e setup
- **Requisito:** FR-006, FR-007, NFR-003, TD-007 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.3
- **Trabalho:** `src/content/schema/contact.ts` (design §5.6: `email` e `servicesEmail` `mailto:` sem parâmetros, `github` https host `github.com`, `linkedin` https host `linkedin.com`, `photo` `Image`) e `src/content/schema/now.ts` (design §5.7: `NowSchema` e `UsesSchema`, `updated?` `CalendarDate`, **`items` não vazio exige `updated`**; `uses.groups` pode ser `[]`). Tipos `ContentContact`, `ContentNow`, `ContentUses`. Reexportar.
- **Testes:** `contact.test.ts`: `https://github.com/...` passa; `http://` falha; GitHub em outro host falha; foto sem alt falha; `mailto:` com `?subject=` falha (regra da 001). `now.test.ts`: `2026-02-30` falha; itens sem `updated` falham; `{ items: [] }` sem `updated` vale; `uses` `{ groups: [] }` vale.
- **Critérios de aceitação:** (1) as linhas do requirements ("Contato" `https` e `http`) dão o resultado esperado; (2) a mensagem do "agora" sem data diz que a data de atualização é obrigatória.
- **Arquivos prováveis:** `src/content/schema/contact.ts`, `src/content/schema/now.ts`, `src/content/schema/index.ts`, `src/content/schema/contact.test.ts`, `src/content/schema/now.test.ts`
- **Verificação:** `npx vitest run src/content/schema/contact.test.ts src/content/schema/now.test.ts` (exit 0); `npx tsc --noEmit` (exit 0). (V-07, V-08)
- **Commit:** `feat(content): schemas de contato, agora e setup (T2.5)`

---

## Fase 3: Teste de equivalência (arcabouço)

### T3.1 Arcabouço da equivalência: projetores, comparador e trava de cobertura
- **Requisito:** FR-008, FR-001 (marcação), TD-009 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.2
- **Trabalho:** tudo dentro de `src/content/__migration__/` (apagável de uma vez):
  - `compare.ts`: compara duas listas de fatos `caminho -> texto`, na mesma ordem; devolve cada diferença como `faltando`, `a mais` ou `mudou` com o caminho e os dois valores.
  - `legacy.ts` (utilitário do lado antigo): `ReactNode` -> texto com `renderToStaticMarkup` (`react-dom/server`, Node), `<strong>x</strong>` -> `**x**`, entidades HTML decodificadas (`&#x27;` -> `'`; caso `what I'd do`).
  - Esqueletos de `legacyFacts.ts` e `newFacts.ts` (escritos separadamente, um por forma de dado), com a **trava de cobertura** (design §6.3 item 5) como funções reutilizáveis: (a) contagens lidas do módulo antigo; (b) chaves de cada objeto antigo conferidas contra "mapeada ∪ excluída explicitamente" (hoje excluídas: `variant`, `icon`, textos de interface de `resume.ts`; D3); (c) PT e EN do antigo com tamanhos de lista diferentes falham antes da comparação.
  - `equivalence.test.ts` com a estrutura por domínio (cada tarefa T4.x liga o seu) e `README.md` ("descartável; ver FR-008; quem apagar um módulo antigo apaga o trecho correspondente na mesma tarefa").
- **Testes:** `projectors.test.ts` com fixtures (não o conteúdo real): um fato alterado -> `mudou` com caminho; um item a mais -> `a mais`; um a menos -> `faltando`; chave nova no objeto antigo -> falha da trava; lista PT com 3 e EN com 2 -> falha antes da comparação; `ReactNode` com `<strong>` e com apóstrofo.
- **Critérios de aceitação:** (1) o comparador detecta as três classes de diferença; (2) a trava falha por campo novo não mapeado; (3) nada fora de `__migration__/` foi criado; (4) o teste roda no projeto `unit` (Node, sem DOM).
- **Arquivos prováveis:** `src/content/__migration__/{compare.ts,legacy.ts,legacyFacts.ts,newFacts.ts,equivalence.test.ts,projectors.test.ts,README.md}`
- **Verificação:** `npx vitest run src/content/__migration__/projectors.test.ts` (exit 0); `npx tsc --noEmit` (exit 0); `git status --short -- src` (só `src/content/__migration__/` novo, fora as alterações da 002 já existentes). (V-11)
- **Commit:** `test(content): arcabouco da equivalencia antigo x novo (T3.1)`

---

## Fase 4: Migração do conteúdo (um domínio por tarefa)
Em cada tarefa: (1) criar o `*.content.ts` copiando os textos como estão; (2) registrá-lo em `registry.ts` (sem registro o validador da 001 falha); (3) ligar a fatia do domínio em `legacyFacts.ts`, `newFacts.ts` e `equivalence.test.ts`; (4) provar que o arquivo antigo não mudou (`git diff --quiet` no(s) módulo(s) antigo(s) do domínio, exit 0). Dado ausente hoje continua ausente.

### T4.1 Conteúdo dos projetos (6) e fatia de equivalência
- **Requisito:** FR-001, FR-002, FR-008, FR-009, FR-011, NFR-003, D1, D3 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.1, T3.1
- **Trabalho:** `src/content/projects.content.ts` exporta `projects: ContentProject[]` (6 projetos, ordem de hoje; `stack` com ids pelo TD-005; `repo: null` vira ausente; versões e pontos pareados PT/EN; descrição do WhatsApp Dispatcher com `**negrito**`; `dateLabel` onde existe). **EcoShop com as 3 capturas** de `public/cases/ecoshop/` (1280x631, alt "EcoShop — captura de tela N de 3" / "EcoShop — screenshot N of 3", o modelo que o site já usa); os outros 5 sem imagem. Nenhuma nota, `variant` ou `icon`. Registro em `registry.ts`. Fatia `projects` da equivalência.
- **Testes:** a fatia de equivalência dos projetos (contagem 6, nomes, datas e `dateLabel`, stack, `repo`, `caseStudy`, imagens, selo, descrição, versões e pontos), mais a trava de chaves (`variant`, `icon` excluídas).
- **Critérios de aceitação:** (1) a equivalência de projetos passa sem diferença; (2) as 3 capturas existem em disco com as dimensões declaradas (a 001 confere); (3) nenhum projeto tem `rating`; (4) projeto sem mês fica só com ano.
- **Arquivos prováveis:** `src/content/projects.content.ts`, `src/content/registry.ts`, `src/content/__migration__/{legacyFacts.ts,newFacts.ts,equivalence.test.ts}`
- **Verificação:** `npx vitest run src/content/__migration__/equivalence.test.ts` (exit 0); `npm run content:check` (exit 0); `git diff --quiet -- src/data/projects.tsx` (exit 0); `npx tsc --noEmit` (exit 0). (V-10 fatia, V-01 conteúdo real)
- **Commit:** `feat(content): migra os 6 projetos e confere a equivalencia (T4.1)`

### T4.2 Conteúdo das experiências (7) e fatia de equivalência
- **Requisito:** FR-003, FR-008, FR-009, FR-011, D2 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T2.2, T3.1
- **Trabalho:** `src/content/experiences.content.ts` exporta `experienceGroups` (3 grupos: `academic`, `learning`, `awards`; 3 + 3 + 1 = **7 itens**; `period.start` igual ao que `parsePeriodStart` extrai; `period.label` literal; `org` string vira o mesmo texto nos dois idiomas; `highlight` preservado). Registro. Fatia `experiences` da equivalência, incluindo o item 6 do design §6.3 (início = `parsePeriodStart`; mês no novo sem mês no antigo falha).
- **Testes:** a fatia de equivalência (contagem 7 lida do módulo antigo, grupos, ordem, destaque, período, org, papel, descrição, etiqueta).
- **Critérios de aceitação:** (1) 7 itens, ordem e grupos iguais; (2) nenhum mês inventado; (3) `src/data/experiences.ts` intacto.
- **Arquivos prováveis:** `src/content/experiences.content.ts`, `src/content/registry.ts`, `src/content/__migration__/*`
- **Verificação:** `npx vitest run src/content/__migration__/equivalence.test.ts` (exit 0); `npm run content:check` (exit 0); `git diff --quiet -- src/data/experiences.ts` (exit 0). (V-10 fatia, V-03 conteúdo real)
- **Commit:** `feat(content): migra as 7 experiencias (T4.2)`

### T4.3 Conteúdo do acadêmico e fatia de equivalência
- **Requisito:** FR-004, FR-008, FR-011 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.3, T3.1
- **Trabalho:** `src/content/academics.content.ts` exporta `academics`: formação, linha do tempo, atividades por ano (referências `{kind, id}` na ordem de hoje), semestres e **as 13 disciplinas, todas com nota**, sem omissão e sem escala inventada; `grade: null` vira ausente; `hours` e `modality` ausentes (hoje não existem). Registro. Fatia `academics` da equivalência (contagem de semestres e disciplinas lida do módulo antigo).
- **Testes:** a fatia de equivalência (programas, linha do tempo, anos e itens, semestres, disciplinas e notas; semestre em andamento com lista vazia, se existir).
- **Critérios de aceitação:** (1) 13 disciplinas com a nota de hoje; (2) nenhuma carga horária ou modalidade preenchida; (3) `src/data/academics.ts` intacto.
- **Arquivos prováveis:** `src/content/academics.content.ts`, `src/content/registry.ts`, `src/content/__migration__/*`
- **Verificação:** `npx vitest run src/content/__migration__/equivalence.test.ts` (exit 0); `npm run content:check` (exit 0); `git diff --quiet -- src/data/academics.ts` (exit 0). (V-10 fatia, V-04 conteúdo real)
- **Commit:** `feat(content): migra o academico e as 13 disciplinas (T4.3)`

### T4.4 Conteúdo de competências e currículo e fatia de equivalência
- **Requisito:** FR-005, FR-008, FR-011, TD-008 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.4, T3.1, T4.1
- **Trabalho:** `src/content/skills.content.ts` (`skillGroups`, 4 grupos; `null` do antigo vira ausente; `since` só com `source`) e `src/content/resume.content.ts` (`resume`: um objeto, dois idiomas por campo; 2 parágrafos de `summary`; 7 `skillAreas`; `featuredProjects` apontando para o id do projeto, sem copiar nome e links). Textos de interface do `resume.ts` **não migram** (lista de exclusões da trava). Registro das duas. Fatias `skills` e `resume` da equivalência, incluindo: nome e endereço derivados do projeto são iguais aos do currículo antigo.
- **Testes:** a fatia de equivalência (grupos, itens, `since`, `source`, áreas, destaques, pontos, premiação).
- **Critérios de aceitação:** (1) competência sem projeto datado continua sem ano; (2) o nome e os links dos destaques vêm do projeto e batem com o antigo; (3) `src/data/resume.ts` e `skillTimeline.ts` intactos.
- **Arquivos prováveis:** `src/content/skills.content.ts`, `src/content/resume.content.ts`, `src/content/registry.ts`, `src/content/__migration__/*`
- **Verificação:** `npx vitest run src/content/__migration__/equivalence.test.ts` (exit 0); `npm run content:check` (exit 0); `git diff --quiet -- src/data/resume.ts src/data/skillTimeline.ts` (exit 0). (V-10 fatia, V-05 e V-06 conteúdo real)
- **Commit:** `feat(content): migra competencias e curriculo (T4.4)`

### T4.5 Conteúdo de contato, "agora" e setup e fatia de equivalência
- **Requisito:** FR-006, FR-007, FR-008, FR-011, NFR-003 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T2.5, T3.1
- **Trabalho:** `src/content/contact.content.ts` (e-mail e e-mail de serviços como `mailto:`, GitHub, LinkedIn; foto `/assets/portfolio.jpeg`, 768x768, alt PT "Foto de Maria Eduarda Brito" / EN "Photo of Maria Eduarda Brito"), `src/content/now.content.ts` (1 item, `updated: '2026-11-11'`) e `src/content/uses.content.ts` (`{ groups: [] }`, sem `updated`). Registro das três. Fatias `contact`, `now` e `uses` da equivalência (e-mail antigo = endereço do link).
- **Testes:** a fatia de equivalência; o estado de rascunho é conferido na T6.1 (V-14).
- **Critérios de aceitação:** (1) os endereços batem com os de hoje; (2) setup continua vazio, sem texto inventado; (3) `src/data/profile.ts`, `now.ts` e `uses.ts` intactos.
- **Arquivos prováveis:** `src/content/{contact,now,uses}.content.ts`, `src/content/registry.ts`, `src/content/__migration__/*`
- **Verificação:** `npx vitest run src/content/__migration__/equivalence.test.ts` (exit 0); `npm run content:check` (exit 0); `git diff --quiet -- src/data/profile.ts src/data/now.ts src/data/uses.ts` (exit 0). (V-10 fatia, V-07 e V-08 conteúdo real)
- **Commit:** `feat(content): migra contato, agora e setup (T4.5)`

---

## Fase 5: Regras entre arquivos, paridade e custo

### T5.1 Referências entre arquivos, consistência de etiquetas e importadores
- **Requisito:** FR-001, FR-004, FR-005, NFR-001, TD-002, TD-005, TD-010, D6 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T4.1, T4.2, T4.3, T4.4
- **Trabalho:**
  - `src/content/references.test.ts` (conteúdo real): `academics.years[].items[].id` existe em `projects` ou nas experiências, conforme `kind`; `resume.featuredProjects[].project` existe em `projects`; o **mesmo id de etiqueta tem o mesmo rótulo** em todo o conteúdo e dois rótulos diferentes não colidem num id (TD-005). Só no `verify` (D6): o validador da 001 não é alterado.
  - `src/content/importers.test.ts`: nenhum arquivo de `src/` fora de `src/content/`, de testes e de `__migration__/` importa `registry` ou `schema/*` sem ser `import type`; nenhuma página importa os `*.content.ts` novos nesta spec.
- **Testes:** os dois acima, com **casos negativos sobre cópias em memória** (id inexistente, mesmo id com rótulos diferentes, importador de `registry` simulado numa lista de caminhos), nunca alterando o dado real.
- **Critérios de aceitação:** (1) conteúdo real passa; (2) cada caso negativo falha com a referência e o arquivo nomeados; (3) nenhum arquivo da 001 foi editado.
- **Arquivos prováveis:** `src/content/references.test.ts`, `src/content/importers.test.ts`
- **Verificação:** `npx vitest run src/content/references.test.ts src/content/importers.test.ts` (exit 0); `git diff --quiet -- scripts/contentValidator.ts` (exit 0). (V-17)
- **Commit:** `test(content): referencias entre arquivos, etiquetas e importadores (T5.1)`

### T5.2 Paridade PT/EN e registro completo
- **Requisito:** FR-010, FR-011, US-003 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T4.1 a T4.5
- **Trabalho:**
  - `src/content/migration.parity.test.ts`: para cada um dos 8 arquivos, uma **cópia em memória** com o EN removido de um item faz `validateAll` falhar nomeando arquivo, item e idioma (nunca altera o dado real).
  - `src/content/registry.test.ts`: os 8 arquivos novos (`projects`, `experiences`, `academics`, `skills`, `resume`, `contact`, `now`, `uses`) estão em `registry` com o caminho certo; um `*.content.ts` sem registro (arquivo temporário num diretório de teste) é recusado pelo validador da 001.
- **Testes:** os dois acima.
- **Critérios de aceitação:** (1) as 8 cópias com EN removido falham com mensagem no formato `arquivo › campo — motivo`; (2) o registro tem 9 entradas (os 8 + `credits`).
- **Arquivos prováveis:** `src/content/migration.parity.test.ts`, `src/content/registry.test.ts`
- **Verificação:** `npx vitest run src/content/migration.parity.test.ts src/content/registry.test.ts` (exit 0); `npm run content:check` (exit 0). (V-09, V-13)
- **Commit:** `test(content): paridade PT/EN e registro dos 8 arquivos (T5.2)`

### T5.3 Custo da validação (NFR-001)
- **Requisito:** NFR-001, TD-013, L-006 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T4.1 a T4.5
- **Trabalho:** `src/content/contentCost.test.ts`: mede com `performance.now()` o `await import('./registry')` (frio) **mais** `validateAll` com o conteúdo real; falha se passar de **5000 ms**; acima de 1000 ms só imprime aviso para a evidência.
- **Testes:** o próprio teste; um caso com limite artificial baixo (injetável) prova que a falha acontece (o limite real não muda).
- **Critérios de aceitação:** (1) tempo medido e registrado na evidência; (2) o limite real é 5000 ms; (3) o teste roda no projeto `unit` sem passar do orçamento da suíte (90 s).
- **Arquivos prováveis:** `src/content/contentCost.test.ts`
- **Verificação:** `npx vitest run src/content/contentCost.test.ts` (exit 0, 3 vezes seguidas; registrar o tempo). (V-16)
- **Commit:** `test(content): custo da validacao do conteudo real (T5.3)`

---

## Fase 6: Fechamento

### T6.1 Verificação completa e comparação com a linha de base
- **Requisito:** FR-007 (rota continua rascunho), FR-008, NFR-001, NFR-002, Success Metrics · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T5.1, T5.2, T5.3
- **Trabalho:** nenhum código de produção (só correção de teste se algo falhar, com a causa registrada).
  - `npm run verify` e comparação das etapas 4 e 5 com a linha de base da T1.1 (esperado: < 5 s somando validação e os testes novos; suíte ≤ 90 s, verify ≤ 180 s).
  - `npx vite build` e comparação dos chunks com a T1.1: **mesmos arquivos, mesmo tamanho** (nenhuma página importa o conteúdo novo).
  - `git hash-object` dos 8 módulos antigos igual ao da T1.1 (não foram alterados).
  - V-14: `npx vitest run src/data/routes.test.ts src/data/seo.test.ts` verdes sem mudança; `/agora` e `/setup` continuam rascunho.
  - Conferência dos Success Metrics do requirements (checklist em `evidence.md`): 100% dos itens registrados, equivalência cobre todos, zero `[...]`, paridade testada.
  - Fechar a lista de pendências para a Duda (ver "Ação da Duda").
- **Testes:** os existentes; o teste de equivalência completo.
- **Critérios de aceitação:** (1) `verify` exit 0; (2) chunks idênticos; (3) hashes idênticos; (4) V-14 verde; (5) varredura de segredos da 001 passa nos arquivos novos.
- **Arquivos prováveis:** `.ai/sdd/specs/003-content-migration/evidence.md`
- **Verificação:** `npm run verify` (exit 0); `npx vitest run src/content/__migration__/equivalence.test.ts` (exit 0); `npx vite build` (exit 0); `npx vitest run src/data/routes.test.ts src/data/seo.test.ts` (exit 0); os 8 `git hash-object` (iguais aos da T1.1); `git status --short` (só arquivos da 003 e as alterações da 002 que já existiam). (V-10, V-14, V-18)
- **Commit:** `docs(003): evidencia de fechamento (T6.1)`

### T6.2 Descartar o teste de equivalência (só com aprovação da Duda)
- **Requisito:** FR-008 ("descartado só quando a Duda aprovar o fechamento"), design §8 · **Prioridade:** P1 · **Estimativa:** 1 h · **Dependências:** T6.1 **e a aprovação explícita da Duda** (não é automática; se ela preferir manter o teste até a 007 remover os módulos antigos, esta tarefa não roda e a pendência passa à spec que apagar o último módulo)
- **Trabalho:** apagar `src/content/__migration__/` inteiro (um diretório, um commit); conferir que nada fora dele o importa; `README` da 003 (`evidence.md`) registra a data e o hash do último commit com o teste vivo.
- **Testes:** a suíte inteira continua verde sem o diretório.
- **Critérios de aceitação:** (1) `git grep -n "__migration__" -- src scripts vite.config.ts package.json` sai com 1; (2) `npm run verify` exit 0; (3) nenhum outro arquivo removido.
- **Arquivos prováveis:** `src/content/__migration__/` (remoção)
- **Verificação:** `git grep -n "__migration__" -- src scripts vite.config.ts package.json` (exit 1); `npm run verify` (exit 0); `git diff --stat --diff-filter=D` (só `__migration__/`).
- **Commit:** `chore(content): remove o teste de equivalencia aprovado pela Duda (T6.2)`

---

## Phase dependencies
```
T1.1 ─┬─► T1.2 ─┬─► T2.1 ─┐
      │         ├─► T2.2 ─┤              ┌─► T4.1 ─┐
      │         ├─► T2.3 ─┤              ├─► T4.2 ─┤
      │         ├─► T2.4 ─┼─────────────►├─► T4.3 ─┼─► T5.1 ─┐
      │         └─► T3.1 ─┘ (T3.1 após T1.2)    ├─► T4.4 ─┤   │
      └─► T1.3 ─┬─► T2.1, T2.2             └─► T4.5 ─┘   │   ├─► T6.1 ─► T6.2*
                └─► T2.5                       T4.1-T4.5 ─┬─► T5.2 ─┤
                                                           └─► T5.3 ─┘
```
Leitura: T2.x dependem de T1.2/T1.3 (T2.1 e T2.2 das duas; T2.3 e T2.4 de T1.2; T2.5 de T1.3). Cada T4.x depende do schema do seu domínio e da T3.1 (T4.4 também da T4.1, pelos ids dos projetos). T5.1 depende de T4.1 a T4.4; T5.2 e T5.3 de T4.1 a T4.5. T6.1 fecha tudo; T6.2 (*) só com aprovação da Duda.
- Ordem sugerida, uma tarefa por vez: T1.1, T1.2, T1.3, T2.1 a T2.5, T3.1, T4.1 a T4.5, T5.1 a T5.3, T6.1, T6.2.
- Um commit por tarefa; cada commit lista só os arquivos da tarefa.

## Riscos de execução
| Risco | Mitigação |
| --- | --- |
| Gabarito vivo muda sob o teste (a Duda edita o dado antigo) | O teste acusa; decide-se qual vale e atualizam-se os dois, nunca em silêncio |
| Rótulo de período real rejeitado pela regra cruzada (T2.2) | Os 7 rótulos reais são casos de teste lidos do módulo antigo; o erro nomeia o item. Se um for legítimo e a regra errada, **parar e propor a correção do design** |
| Alterações da 002 não commitadas no working tree | `git add` por caminho; nenhum `git add -A`; nenhum commit mistura as duas |
| Equivalência quebrada por entidade HTML (`&#x27;`) | Decodificação explícita e caso `what I'd do` em T3.1 |

## Ação da Duda (fora da contagem de horas)
1. Aprovar o `tasks.md` (`tasks:approved`) e o "Confirm before building".
2. **Aceitar a emenda à 007** (US-005, FR-015: reescrever `/agora` e `/setup`) junto do `tasks.md` da 007.
3. Depois da T6.1, **aprovar o fechamento** para a T6.2 apagar o `__migration__/` (ou decidir mantê-lo até a 007).
4. Confirmar que o e-mail de serviços fica no conteúdo (FR-006), ficando a decisão de exibi-lo para a 007 (007 Q-002).

## Confirm before building
Antes de qualquer tarefa, o implementador **restata com as próprias palavras** e espera o **OK explícito da Duda**:
1. **FRs (resumo):** mover o conteúdo atual (6 projetos com as 3 capturas do EcoShop, 7 experiências, acadêmico com 13 disciplinas, currículo, 4 grupos de competências, contato, "agora" e setup vazio) para 8 arquivos tipados, registrados e validados, sem alterar um fato; PT e EN em tudo; datas só com mês confirmado; sem nota de projeto, sem texto de exemplo; um teste de equivalência ao vivo antigo x novo, apagado só com a aprovação dela.
2. **Restrições:** esta spec é aditiva (nenhum arquivo antigo é alterado; nenhuma página muda; o JavaScript do navegador não muda); só `**negrito**` (D5); `variant` e `icon` fora (D3); referências entre arquivos só no `verify` (D6); `/agora` e `/setup` são da 007 (D4); branch `rebuild/sdd`, sem `push`; só a Duda promove o `.status`.
3. **Perguntas abertas:** nenhuma de design; ver "Ação da Duda".
Nada de código antes de `tasks:approved`.
