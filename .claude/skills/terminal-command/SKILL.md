---
name: terminal-command
description: >
  Criar, alterar, renomear ou depurar qualquer comando do terminal do portfólio
  (src/terminal/commands.jsx): novo comando, apelido, argumento, autocompletar
  (Tab), saída em PT/EN, atalho clicável, `ajuda`, `ls`/`cd`/`<página> <seção>`,
  número como atalho, `proximo`/`anterior`, primeira visita, erro que reensina.
when_to_use: >
  Qualquer pedido que toque o terminal da home, a barra de comandos (CommandBar)
  ou a sessão (TerminalSession, useTerminal). Não usar para criar uma página ou
  seção nova (use site-page-section) nem para mexer só em CSS.
argument-hint: "<comando ou comportamento a criar/alterar>"
effort: high
---

# terminal-command

Trabalho de uma frase: **mudar o terminal sem quebrar PT/EN, o inventário de
comandos, o replay do histórico nem a regra de que a saída ensina o próximo passo.**

## Antes de editar (obrigatório)

Leia, nesta ordem, só o que a tarefa toca:

1. `src/terminal/commands.jsx` (lista `commands`, `runCommand`, `complete`, `quickCommands`, `commandInventory`)
2. `src/data/routes.js` e `src/data/sections.js` (nomes de página e seções; fonte única)
3. `src/i18n/ui.js` (blocos `term`, `cmdbar`, `term.nav`; sempre PT **e** EN)
4. `src/terminal/TerminalSession.jsx` se a tarefa envolver contexto, carregamento ou histórico

## Mapa de leitura

| Se a tarefa for… | Leia antes |
| --- | --- |
| Criar ou alterar a forma de um comando | `references/anatomia-do-comando.md` |
| Índice, número, vizinhos, primeira visita, erros, `ajuda` | `references/descoberta.md` |
| Escrever ou ajustar testes | `references/receitas-de-teste.md` |

Leia o arquivo indicado **antes** de editar; não responda de memória.

## Regras que não se negociam

1. **Saída é função de idioma:** `output: (lang) => JSX`. Nunca congele texto de um idioma.
2. **Efeitos só fora do replay:** navegar, trocar tema/idioma ou iniciar carregamento só se `!ctx.replay`. O replay reconstrói a tela sem efeitos.
3. **Nomes:** `names: [pt, en]` mais `aliases`. Nenhum nome ou apelido pode repetir em outro comando (há teste de inventário). Comparação com `fold()` (sem acento, sem caixa).
4. **Comando de página usa `route: '<id>'`** e herda o par `[ ver no terminal ] [ abrir página própria ↗ ]` automaticamente (`runCommand`). Não repita esse par à mão.
5. **Erros nunca lançam exceção e sempre ensinam:** dizem o que deu errado e mostram o caminho (índice ou `ls`).
6. **Nada de caminho escrito à mão:** use `routes.js`/`sections.js`.
7. **`ajuda` é gerada da lista `commands`:** dê `desc` (e `usage`, se houver argumento) nos dois idiomas; comando só de brincadeira leva `hidden: true`.
8. **Sem dependência nova.**

## Passos

1. Escreva o teste que falha primeiro (ver receitas).
2. Implemente em `commands.jsx` (ou no módulo de visão em `views.jsx`/`sectionViews.jsx`/`pageIndex.jsx`).
3. Se houver argumento novo, ajuste `complete()` e o teste de autocompletar.
4. Texto novo → `ui.js` nos dois idiomas (use a skill `content-integrity` se mexer em fato do conteúdo).
5. Atualize `quickCommands` só se o comando for porta de entrada.
6. Atualize a tabela de comandos do `README.md`.
7. Rode `npm run lint`, `npm test`, `npm run build` (ou a skill `verify-site`).
8. Marque o requisito correspondente em `docs/sdd-terminal-v2/gap-analysis.md` (skill `sdd-spec-sync`).

## Entrega

Diga: o que mudou, quais arquivos, quais testes cobrem, e o que **não** foi verificado.
