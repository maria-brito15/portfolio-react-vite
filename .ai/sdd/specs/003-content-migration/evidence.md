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
