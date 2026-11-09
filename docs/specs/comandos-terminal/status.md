# Status — Comandos e conteúdo no terminal

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| CM-01 | ✅ | `sections.test.jsx` ("inventário de comandos": nomes únicos, ajuda real, atalhos reais) |
| CM-02 | ✅ | `sections.test.jsx` ("ls <página>…", "cd <página>/<seção>"); executado: `ls curriculo` lista as 6 seções |
| CM-03 | ✅ | `sections.test.jsx` ("resolveTarget aceita ~, ./, .., barra final, maiúsculas e acentos", "funciona com barra, maiúsculas e em inglês"); executado: `curriculo 2` abre "Competências técnicas" |
| CM-04 | ✅ | `sections.test.jsx` ("nenhuma seção de nenhuma página fica inacessível pelo terminal"); `terminal/sectionViews.jsx` (438 linhas); executado: `academico disciplinas` imprime os 4 semestres |
| CM-05 | ✅ | `sections.test.jsx` ("erros são claros e nunca quebram", "runCommand devolve saída para entradas estranhas") |

Resumo: ✅ 5 · ◐ 0 · ❌ 0 · ❔ 0
