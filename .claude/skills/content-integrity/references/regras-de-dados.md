# Dados em `src/data/`

| Arquivo | Conteúdo | Cuidado |
| --- | --- | --- |
| `projects.tsx` | projetos e timeline | ordem **crescente**; teste em `projects.test.js` |
| `experiences.ts` | atividades acadêmicas, cursos, reconhecimentos | agrupadas por ano, ano mais recente primeiro |
| `academics.ts` | programas, semestres, disciplinas (`courses`) | `inProgress` no atual; `grade: null` até sair; modelo em `assets/modelo-semestre.md` |
| `resume.ts` | ordem e rótulos das seções do currículo | seções em `sections.ts` |
| `skillTimeline.ts` | tempo por habilidade | `since` derivado; teste em `skillTimeline.test.js` |
| `services.tsx`, `portfolio.tsx`, `profile.ts` | serviços, textos, perfil | PT/EN lado a lado |

Formato de data: `{ year: 2026, month: 1 }` (mês opcional). Intervalos: `{ start, end }`; `end` ausente = "atual".
Ao adicionar projeto: respeite a posição cronológica; se dois projetos caem no mesmo ano sem mês, o teste
sinaliza `orderUndetermined` — peça o mês à pessoa em vez de chutar.
Ao adicionar disciplina: dentro de `courses` do semestre certo, nome PT/EN, `hours` e `modality` só se informados.
