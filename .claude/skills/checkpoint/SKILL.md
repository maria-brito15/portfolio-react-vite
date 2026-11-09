---
name: checkpoint
description: >
  Preparar e retomar o trabalho em sessões longas do Claude Code neste
  portfólio: resumo de estado antes de pausar, retomada depois do limite de uso
  ou de uma pausa grande, commits pequenos por etapa, mensagem de PR com o que
  mudou e o que ficou de fora. Reduz custo de cache e reexplicação.
when_to_use: >
  Quando a sessão estiver longa, o limite de uso estiver perto, a pessoa disser
  "vou parar", "retomar", "onde paramos", "resumo", ou antes de abrir PR.
argument-hint: "[salvar | retomar | pr]"
disable-model-invocation: true
effort: low
---

# checkpoint

Chamada só pela pessoa (`/checkpoint salvar|retomar|pr`).

## Mapa de leitura

| Modo | Faça |
| --- | --- |
| `salvar` | Preencha `assets/modelo-estado.md` em `docs/ESTADO.md` e faça commit de WIP |
| `retomar` | Leia `docs/ESTADO.md`, `git log -10 --oneline`, `git status`; rode o Portão 1 de `verify-site`; só então continue |
| `pr` | Use `assets/modelo-pr.md`; confirme com `verify-site` completo antes |

## Regras

1. **Um commit por etapa**, mensagem no imperativo e com o ID da tarefa (`T-D1: liga pageIndex ao comando curriculo`).
2. Nunca commitar com teste vermelho, exceto WIP explícito no `docs/ESTADO.md`.
3. `docs/ESTADO.md` diz: objetivo, feito, falta, decisões, comandos para retomar. Máximo uma tela.
4. Retomar **não** reabre decisões já registradas; ler o estado e continuar.
5. Em sessão longa, prefira `/compact` com foco ("manter spec, tarefa atual e decisões") a reler o repo inteiro.
6. PR: o que mudou por etapa, o que ficou de fora, evidência (testes, capturas). Sem adjetivos.
