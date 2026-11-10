# Status — Dados, ordem e competências

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| DT-01 | ✅ | `utils/projectDate.ts` (`sortByDateDesc`, `parsePeriodStart`), `utils/academics.ts` (`activitiesByYear`); `DocPages.test.tsx`; README |
| DT-02 | ✅ | `data/projects.test.ts` passa sem alteração |
| DT-03 | ◐ | `data/academics.ts` (divergência deliberada, dados informados pela Duda em 10/11/2026): 01/2025 (7), 02/2025 (5) e 01/2026 (5) com as disciplinas **aprovadas** e suas notas; reprovações (Arquitetura de Computadores I, Cálculo II, Linguagens de Programação) ficam de fora; `hours`/`modality` ausentes (aparecem como "—"); 02/2026 segue vazio, em andamento. O critério fala em "placeholder" e não foi reescrito: aguarda confirmação. Teste: `DocPages.test.tsx` ("mostra formação, linha do tempo e atividades por ano") |
| DT-04 | ✅ | `data/skillTimeline.ts` + `skillTimeline.test.ts` |

Resumo: ✅ 4 · ◐ 0 · ❌ 0 · ❔ 0
