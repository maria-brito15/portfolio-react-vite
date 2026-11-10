---
name: content-integrity
description: >
  Adicionar ou alterar CONTEÚDO do portfólio sem inventar nada: projetos,
  experiências, atividades, disciplinas, notas, datas, habilidades e tempo de
  uso, serviços, textos PT/EN em `src/i18n/ui.ts` e `src/data/*`. Valida ordem
  das listas, formato de datas, paridade PT/EN e `skillTimeline`.
when_to_use: >
  Sempre que o pedido trouxer fato sobre a Duda (data, nota, curso, projeto) ou
  texto de interface novo. Não usar para layout ou comandos.
argument-hint: '<o que adicionar/alterar>'
effort: medium
---

# content-integrity

Portfólio é documento pessoal e profissional: **dado errado é pior que dado ausente.**

## Mapa de leitura

| Tarefa                                                    | Leia antes                      |
| --------------------------------------------------------- | ------------------------------- |
| Qualquer dado novo (projeto, atividade, disciplina, nota) | `references/regras-de-dados.md` |
| Texto de interface novo                                   | `references/i18n.md`            |
| Preencher notas dos semestres                             | `assets/modelo-semestre.md`     |

## Regras

1. **Nunca invente** nota, data, empresa, certificado, número ou tecnologia. Faltou informação → deixe `placeholder`/vazio explícito e pergunte à pessoa.
2. Datas no formato `{ year, month? }`; nunca string solta.
3. Ordens: **timeline de projetos crescente** (obrigatório, testado); **atividades por ano e disciplinas decrescentes** (mais recente primeiro).
4. `skillTimeline`: o `since` de cada habilidade é **derivado** do primeiro projeto/curso datado que a cita; não escreva à mão.
5. Texto de interface em `ui.ts` nos dois idiomas; conteúdo em `src/data/*` com campos PT/EN. Valor com função (`(n) => …`) precisa existir nos dois lados.
6. Contagens ("6 atividades desde 2025") são calculadas dos dados.
7. Semestres: `2025-1`, `2025-2`, `2026-1` (programa `cc`) e `2026-2` (programa `es`, `inProgress`). Os três primeiros têm as disciplinas **aprovadas** e suas notas (informadas pela Duda; reprovações não entram); `hours` e `modality` ficam ausentes até ela informar. `2026-2` segue com `courses` vazio.

## Passos

1. Ler `references/regras-de-dados.md` e o arquivo de dados que será tocado.
2. Editar dado + (se preciso) `ui.ts`.
3. `node .claude/skills/content-integrity/scripts/check-i18n.mjs` (exit 1 = falta chave).
4. `npm test -- data` (ordens, `skillTimeline`) e `npm test`.
5. Conferir a página em PT e EN e a visão em terminal (mesmos dados).
