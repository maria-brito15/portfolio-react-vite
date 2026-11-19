# 003 Content migration, Evidência

## Linha de base (T1.1, 2026-11-19)
Estado: branch `rebuild/sdd`, antes de qualquer arquivo da 003 em `src/`. O working tree tinha alterações não commitadas da 002 (não são da 003).

### T1.1 Linha de base: build, tempos e arquivos antigos
```
Claim:     O estado atual passa no verify e no build; tempos, chunks e hashes dos 8 módulos antigos estão registrados.
Command:   npm run verify ; npx vite build ; git hash-object src/data/{projects.tsx,experiences.ts,academics.ts,resume.ts,skillTimeline.ts,profile.ts,now.ts,uses.ts}
Exit code: 0 ; 0 ; 0
Summary:   verify OK em 112,5 s (orçamento 180 s). Etapas (s): formatação 7,8; lint 21,0; tipos 15,3; testes 60,3; geração 8,1. vite build OK.
Verdict:   PASS
```

**Etapas 4 e 5 (última linha de `.verify/times.jsonl`):** testes 60,3 s; geração 8,1 s; total 112,5 s.

**Maiores chunks de `dist/static` (bytes, sem gzip):**
| Arquivo | Tamanho |
| --- | --- |
| `index-*.js` (entrada) | 304 176 (gzip 97,80 kB) |
| `CaseStudy-*.js` | 113 413 |
| `TerminalPage-*.js` | 52 409 |
| `SectionPage-*.js` | 15 109 |
| `usePersonal-*.js` | 14 328 |
| `services-*.js` | 12 275 |
| `resume-*.js` | 10 197 |
| `CommandPalette-*.js` | 8 225 |

**Hashes dos módulos antigos (`git hash-object`), a repetir no fechamento (T6.1):**
| Arquivo | Hash |
| --- | --- |
| `src/data/projects.tsx` | `0435ccaad4a116a9aa699aa5df4b3042f3b22d08` |
| `src/data/experiences.ts` | `07804e66a417f63dcce2f0b9ed716f562ba85812` |
| `src/data/academics.ts` | `065f44fc3709291d8339c80718fdb4528d9f2a4d` |
| `src/data/resume.ts` | `d04f82401e64156402aa9ad26ee2b93844668cb8` |
| `src/data/skillTimeline.ts` | `6d547dfd77d36f6fb10704aeb4499367adb94c55` |
| `src/data/profile.ts` | `08ea85725bd7cac4fa9c64ea37331f23c0d3ec02` |
| `src/data/now.ts` | `2e6ad2d50a3a6e386283d6e53be186fa858832c4` |
| `src/data/uses.ts` | `465993b2325c3a1c5589b224f773bed45ae3162f` |

Observação: o `verify` avisou "AUMENTO de 29 % na etapa geração (6,3 s → 8,1 s)"; é variação de execução, dentro do orçamento. Os arquivos `.verify/` e `dist/` são ignorados pelo git.

## T1.2 Marcação `**negrito**`: `parseRich`, `plainText` e `RichTextSchema`
**Entregue:** `src/content/rich.ts` (puro, sem import de zod), `src/content/schema/rich.ts` (`RichTextSchema`, `richProblem`, reexportados em `schema/index.ts`) e os dois testes.
```
Claim:     parseRich/plainText e RichTextSchema funcionam; `**` desbalanceado, vazio, aninhado e tag HTML falham nomeando arquivo, campo, idioma e motivo; `a < b` e texto comum passam
Command:   npx vitest run src/content/rich.test.ts src/content/schema/rich.test.ts ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0
Summary:   2 arquivos, 18 testes passando; tipos e lint sem aviso; `grep -n "^import" src/content/rich.ts` sem resultado (nenhum import)
Verdict:   PASS com ressalva
```
Ressalva: o critério (1) ("a descrição do WhatsApp Dispatcher vira os segmentos esperados") depende de o conteúdo existir; ele é conferido na T4.1, quando a descrição é migrada. Aqui os segmentos foram testados com texto de exemplo equivalente.

## T1.3 `CalendarDate` e `withNoPlaceholders`
**Entregue:** `src/content/schema/calendarDate.ts` (`CalendarDateSchema`, `calendarDateProblem`), `src/content/schema/placeholder.ts` (`withNoPlaceholders`), reexportados em `schema/index.ts`, e os dois testes. Nenhum schema da 001 foi alterado (só uma linha de reexport em `index.ts`).
```
Claim:     CalendarDate aceita só dia real (inclui bissexto) em AAAA-MM-DD; withNoPlaceholders acusa [x], lorem ipsum, TODO, TBD e FIXME com o caminho do campo, em lista e objeto aninhados, sem alterar o dado
Command:   npx vitest run src/content/schema/calendarDate.test.ts src/content/schema/placeholder.test.ts ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0
Summary:   2 arquivos, 29 testes passando; 2026-02-30, 2027-02-29, 2026-13-01, 2026-11-1, "" e null recusados; 2028-02-29 válida; caminho acusado `itens[1].pontos[0].en`; `[]` e "todos"/"mastodon" não casam
Verdict:   PASS
```
Limite conhecido: `daysInMonth` usa `Date.UTC`, que trata anos de 0 a 99 como 1900 a 1999; o formato exige 4 dígitos e a data é "atualizado em" recente, então não afeta o uso real.

## T2.1 Schema de projeto
**Entregue:** `src/content/schema/project.ts` (`ProjectSchema`, `ProjectsSchema`, `tagIdFromLabel`, tipos), reexportado em `schema/index.ts`, e `project.test.ts`. Tudo dentro de `withNoPlaceholders`. Sem `rating`, `variant` nem `icon` (campo desconhecido é recusado por `strictObject`).
```
Claim:     o schema de projeto aceita o projeto completo, sem mês e sem repo; recusa sem EN na descrição (`[2].description.en: texto ausente`), etiqueta repetida, repo http, versão anterior ao início, rótulo de versão repetido, versão sem pontos, dateLabel de outro ano, rating/variant/icon, id repetido, alt só em PT e marcador [x]; tagIdFromLabel dá next-js-15, ci-cd, javascript-es6
Command:   npx vitest run src/content/schema/project.test.ts ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0
Summary:   1 arquivo, 17 testes passando; tipos e lint sem aviso
Verdict:   PASS
```
Observação: a existência do arquivo da imagem em `public/` não é regra do schema (é do validador da 001, `scripts/contentValidator.ts`), então o teste de imagem usa o caminho de uma captura real do EcoShop e confere só a forma. Dado de teste marcado como exemplo.

## T2.2 Schema de experiência
**Entregue:** `src/content/schema/experience.ts` (`ExperienceGroupsSchema`, tipos), reexportado em `schema/index.ts`, e `experience.test.ts`.
```
Claim:     os 7 períodos reais (lidos de src/data/experiences.ts) passam com o início que parsePeriodStart extrai; mês inventado, mês que o rótulo não mostra, ano divergente, id repetido entre grupos, grupo repetido, grupo vazio e campo desconhecido falham nomeando o item e o campo
Command:   npx vitest run src/content/schema/experience.test.ts ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0
Summary:   1 arquivo, 9 testes passando (o primeiro confere exatamente 7 itens reais, 3 grupos); tipos e lint sem aviso
Verdict:   PASS
```
Observação: o teste importa o módulo antigo só para ler; nenhum arquivo antigo foi alterado.

## T2.3 Schema do acadêmico
**Entregue:** `src/content/schema/academics.ts` (`AcademicsSchema`, tipos), reexportado em `schema/index.ts`, e `academics.test.ts`. Nenhum teto de nota no schema (Q-002).
```
Claim:     o schema do acadêmico aceita nota 0 e 120 (sem teto) e semestre em andamento com courses vazio; recusa nota -1, NaN, null e texto, programa inexistente em semestre, end < start, hours 0 ou fracionado, modalidade fora da lista, id de semestre repetido ou fora de AAAA-N, ano sem 4 dígitos e kind desconhecido; a referência years[].items[].id não é regra deste schema
Command:   npx vitest run src/content/schema/academics.test.ts ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0
Summary:   1 arquivo, 13 testes passando; tipos e lint sem aviso
Verdict:   PASS
```

## T2.4 Schemas de competências e currículo
**Entregue:** `src/content/schema/skills.ts` (`SkillGroupsSchema`), `src/content/schema/resume.ts` (`ResumeSchema`), reexportados em `schema/index.ts`, e os dois testes.
```
Claim:     competência sem fonte e sem ano é válida (nunca ano estimado); `since` sem `source` e o inverso falham; since 99999, "2020" e 2020.5 falham; nome repetido no grupo falha; o currículo recusa `print` (texto de interface) e nome/links copiados do projeto como campo desconhecido, exige `project` e pelo menos 1 ponto, e acusa EN ausente com o índice (`summary[1].en`)
Command:   npx vitest run src/content/schema/skills.test.ts src/content/schema/resume.test.ts ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0
Summary:   2 arquivos, 15 testes passando; tipos e lint sem aviso
Verdict:   PASS
```

## T2.5 Schemas de contato, "agora" e setup
**Entregue:** `src/content/schema/contact.ts` (`ContactSchema`), `src/content/schema/now.ts` (`NowSchema`, `UsesSchema`), reexportados em `schema/index.ts`, e os dois testes.
```
Claim:     contato aceita https no host esperado (com ou sem www) e recusa http, host trocado, foto sem alt ou com alt só em PT, mailto com parâmetros e e-mail que não é mailto; "agora" recusa 2026-02-30 e itens sem `updated` (mensagem: "a data de atualização é obrigatória quando há itens (AAAA-MM-DD)") e aceita { items: [] } sem data; setup aceita { groups: [] }
Command:   npx vitest run src/content/schema/contact.test.ts src/content/schema/now.test.ts ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0
Summary:   2 arquivos, 16 testes passando; tipos e lint sem aviso
Verdict:   PASS
```
Observação: a regra "itens exigem data" vale só para o "agora", como no design §5.7; `uses` aceita data opcional sem exigir quando há grupos.

## T3.1 Arcabouço da equivalência: projetores, comparador e trava de cobertura
**Entregue:** `src/content/__migration__/{compare.ts,legacy.ts,coverage.ts,legacyFacts.ts,newFacts.ts,equivalence.test.ts,projectors.test.ts,README.md}`. Só essa pasta nova (apagável de uma vez na T6.2).
```
Claim:     o comparador acusa faltando, a mais, mudou e fora de ordem com o caminho; a trava falha por contagem diferente, chave nova não mapeada e PT/EN com tamanhos diferentes; richToText converte <strong> em **negrito**, decodifica apóstrofo e &, e falha com qualquer outra marcação; o teste roda no projeto unit (Node, sem DOM)
Command:   npx vitest run src/content/__migration__ ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0 ; git status --short -- src
Exit code: 0 ; 0 ; 0 ; 0
Summary:   14 testes passando e 8 todo (um por domínio, sem projetor ainda; aparecem como todo, não como passou); tsc 64 s e eslint 24 s sem erro; `git status` mostra só `?? src/content/__migration__/` além das alterações da 002 que já existiam
Verdict:   PASS
```
Observações:
- Os 8 `todo` são intencionais: cada T4.x liga o projetor do seu domínio. Um domínio sem projetor não conta como equivalente.
- Uma execução de `tsc` levou 10 min 44 s por contenção da máquina (outra execução em paralelo); a repetição isolada levou 64 s. Sem erro de tipo.

## T4.1 Conteúdo dos projetos (6) e fatia de equivalência
**Entregue:** `src/content/projects.content.ts` (6 projetos, ordem de hoje), registro em `registry.ts`, e a fatia `projects` da equivalência (`legacyFacts.ts`, `newFacts.ts`, `equivalence.test.ts` com contagem, trava de chaves e comparação de fatos). O arquivo de conteúdo foi gerado por um script descartável a partir do módulo antigo (para não digitar à mão) e o script não foi commitado; o teste de equivalência, escrito à parte, é quem confere o resultado.
```
Claim:     os 6 projetos migraram sem diferença de fato (nome, início, rótulo de data, stack, repo, caso, caminho das imagens, selo, descrição com **negrito**, versões e pontos PT/EN); o EcoShop tem as 3 capturas com as dimensões reais; nenhum projeto tem rating, variant ou icon; o módulo antigo não mudou
Command:   npx vitest run src/content ; npm run content:check ; git diff --quiet -- src/data/projects.tsx ; npx tsc --noEmit ; npx eslint src/content --max-warnings 0
Exit code: 0 ; 0 ; 0 ; 0 ; 0
Summary:   content:check: 23 arquivos, 348 testes passando e 7 todo (os domínios ainda sem projetor); a equivalência de projetos tem 3 testes (trava, contagem 6 lida do antigo, fatos); `git diff --quiet src/data/projects.tsx` sem diferença; tsc 49 s e eslint sem aviso. Teste de mutação: trocar "Planoriza" por "Planoriza X" no conteúdo novo faz a equivalência falhar com `mudou: projects/planoriza/name/pt`; o arquivo foi restaurado. Dimensões lidas do cabeçalho JPEG: 1.jpeg, 2.jpeg e 3.jpeg têm 1280x631, iguais às declaradas.
Verdict:   PASS
```
Observações:
- O alt das capturas ("EcoShop — captura de tela N de 3" / "EcoShop — screenshot N of 3") é o modelo do site (design D1); texto alternativo e dimensões são dado novo, sem par no antigo, então a equivalência compara só o caminho e a contagem das imagens.
- Um erro de lint de linha em branco no `legacyFacts.ts` apareceu e foi corrigido com `eslint --fix` antes do fechamento.
- Esta tarefa contradiz a resposta "sem imagem" da Q-001 do requirements; vale a decisão D1, aprovada depois pela Duda, e a emenda está anotada na Q-001.
