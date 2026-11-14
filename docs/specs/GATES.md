# Gates SDD — `.status`

Cada spec em `docs/specs/<feature>/` tem um arquivo `.status`. Ele é a **única fonte de verdade** da aprovação. Existir `requirements.md`, `design.md` ou `tasks.md` não significa que estão aprovados: sem `.status` que diga o contrário, são rascunho.

## Formato

Uma linha, UTF-8, só o token `<fase>:<estado>`, newline no fim, sem comentários.

Fases em ordem estrita (os tokens válidos são **apenas** estes):

```
idea:exploring  →  idea:captured
plan:draft      →  plan:approved
requirements:draft → requirements:approved
design:draft    →  design:approved
tasks:draft     →  tasks:approved
implementation:in-progress → implementation:done
review:done
```

Um valor implica que todas as fases anteriores chegaram ao estado final (`:approved`/`:done`). Ex.: `design:draft` implica `requirements:approved`. `idea` e `plan` são opcionais: uma spec pode começar em `requirements:draft`.

## Regras

1. **Nenhum código antes de `tasks:approved`.**
2. **Nenhum design vinculante antes de `requirements:approved`.**
3. `.status` ausente ou com token inválido: o agente **para e pergunta**. Nunca infere aprovação pelos documentos.
4. Se uma fase posterior revela lacuna em fase já aprovada, o agente **propõe a alteração e pede aprovação**. Não edita em silêncio o documento aprovado.
5. O agente não promove fase por conta própria; quem aprova é a pessoa dona do projeto.

## Ferramenta

`node scripts/status.mjs <comando>` (a ferramenta nunca lê os `.md` da spec):

| Comando | Efeito |
| --- | --- |
| `read <feature>` | imprime o token; sai com 2 se `.status` faltar ou for inválido |
| `check <feature> <token>` | sai com 0 se o estado é pelo menos `<token>`; 1 se não; 2 se `.status` faltar/for inválido |
| `promote <feature> <token> --yes` | grava o novo token e mostra anterior → novo; recusa sem `--yes` |
| `list` | tabela feature \| state \| last-modified |

`promote` só aceita avançar um passo na ordem (ou ir de `idea`/`plan` direto a `requirements:draft`). Pular fases (`requirements:draft` → `design:approved`) e voltar atrás são recusados.

Exemplo de gate antes de codificar: `node scripts/status.mjs check personal tasks:approved`.

## Estado inicial

Os `.status` foram criados reconstruindo estado, não aprovando: toda spec com `requirements.md` começou em `requirements:draft`. As 8 specs que só tinham `status.md` (requisitos dentro dele, sem `requirements.md`) também começaram em `requirements:draft`. O `status.md` em prosa de cada feature continua sendo o diário de progresso; não substitui o `.status`.

Fora do escopo desta etapa: checagem em CI.
