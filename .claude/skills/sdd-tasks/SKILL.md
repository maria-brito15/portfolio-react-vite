---
name: "sdd-tasks"
description: "Escreve tasks.md de uma feature com design:approved: Readiness Check, tabela de cobertura FR → tarefas e tarefas de 1 a 4 horas com verificação. Deixa .status em tasks:draft. Não escreve código e nunca marca nada como approved."
---

# sdd-tasks
1. Confirme `design:approved` com `node scripts/status.mjs check <feature> design:approved`. Qualquer outro resultado: pare.
2. Escreva `tasks.md`: Readiness Check (requisitos e design aprovados, todo Must Have coberto, todo Q-* respondido, toda tarefa com dependência, critério e verificação), Coverage (FR → tarefas) e fases com tarefas T1.1…
3. Cada tarefa: 1 a 4 horas, testável sozinha, com os testes dentro dela (sem fase de testes separada) e comando de verificação exato. Tarefa sem verificação é opinião.
4. Grave `tasks:draft`. NUNCA `tasks:approved`. Resuma em até 15 linhas e pare.
