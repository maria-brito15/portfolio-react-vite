---
name: sdd-spec-sync
description: >
  Manter a especificação SDD do portfólio (docs/sdd-terminal-v2/: requirements,
  gap-analysis, tasks) em sincronia com o código: marcar requisito como feito,
  recalcular a tabela-resumo, cruzar código x spec depois de uma mudança, criar
  requisito ou tarefa nova, escolher a próxima tarefa (T-D1…, T-L1…, T-A1…).
when_to_use: >
  Ao terminar qualquer mudança que cumpra, quebre ou crie requisito; ao pedir
  "o que falta", "próxima tarefa", "atualiza a spec", "cruzar com a spec".
argument-hint: "[ID de requisito ou tarefa, ex.: DS-03 ou T-D4]"
effort: medium
---

# sdd-spec-sync

A spec é a fonte de verdade do que "pronto" significa. Código sem requisito é deriva;
requisito sem evidência é desejo.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `docs/sdd-terminal-v2/requirements.md` | requisitos com ID e critério de aceite (EARS) |
| `docs/sdd-terminal-v2/gap-analysis.md` | status de cada requisito + evidência (arquivo/teste) |
| `docs/sdd-terminal-v2/tasks.md` | tarefas ordenadas, cada uma ligada a requisitos |

Os documentos antigos em `docs/sdd/` (TP1) estão **superados**: não os use como referência.

## Mapa de leitura

| Tarefa | Leia antes |
| --- | --- |
| Marcar status / cruzar código x spec | `references/fluxo-de-sincronizacao.md` |
| Criar requisito ou tarefa | `assets/modelo-requisito.md` |
| Escolher a próxima tarefa | `tasks.md` (ordem de dependência) e `gap-analysis.md` |

## Status usados

✅ atendido (com evidência) · ◐ parcial (diga o que falta) · ❌ ausente · ❔ não verificado.

## Passos ao terminar uma mudança

1. Liste os IDs que a mudança toca (`grep -n "<palavra>" requirements.md`).
2. Para cada um: confirme no código/teste e atualize o status **com a evidência** (`arquivo:linha` ou nome do teste). Nunca marque ✅ sem rodar o teste citado.
3. Marque a tarefa em `tasks.md`.
4. Recalcule o resumo: `node .claude/skills/sdd-spec-sync/scripts/gap-summary.mjs` e cole a tabela no fim de `gap-analysis.md`.
5. Requisito novo descoberto no caminho → `assets/modelo-requisito.md`, com ID seguinte do grupo.
6. Diga na resposta: quais IDs mudaram de status e o que continua ❌/◐.

## Nunca

- Contar o resumo à mão (use o script).
- Reescrever requisito para caber no código; se o código divergiu de propósito, registre a decisão e peça confirmação.
- Marcar ✅ por "parece certo".
