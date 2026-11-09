# Status — Descoberta das seções pelo terminal

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| DS-01 | ✅ | `curriculo` imprime o índice `[1]…[6]` com a linha "Digite o número ou o nome": `PageIndex` ligado em `commands.jsx:520`. Teste `sections.test.jsx` › "curriculo e ls curriculo produzem o mesmo índice [1]…[6] com instrução e dicas" (T-D1) |
| DS-02 | ✅ | O índice termina com as dicas ver uma seção / abrir a página / listar de novo / início e ajuda (`pageIndex.jsx:61-70`). O mesmo teste confere os textos; "o índice aparece em inglês e nas páginas com seções" cobre o inglês |
| DS-03 | ✅ | `listSections` (`commands.jsx:49`) só escolhe `PageIndex`; o comando da página usa o mesmo componente (`commands.jsx:520`); a lista "# seções" de `views.jsx` foi removida. O teste compara o HTML do índice de `curriculo` e de `ls curriculo` (igual) |
| DS-04 | ✅ | Cada linha `[n]` é um `RunCommand` (`pageIndex.jsx:53`), desabilitado com `session.busy`; estilo em `terminal.css` (`.t-run`, `.t-index-list`). Teste `sections.test.jsx` › "clicar em [2] produz a mesma saída de \"curriculo 2\" e o botão é alcançável por Tab". Conferido no Chrome: 390×844 e 1440×900 sem rolagem horizontal e sem erro de console |
| DS-05 | ❌ | Não há tratamento de número sozinho nem contexto de "última página aberta" (`TerminalSession` não guarda a página do último índice); executado: `2` → comando não encontrado. Mensagem pronta em `ui.js` (`term.nav.noContext`) e sem uso |
| DS-06 | ❌ | `SectionNav` (`pageIndex.jsx:75`) existe e não é renderizado ao fim das seções (`sectionViews.jsx` não o importa) |
| DS-07 | ❌ | Não existem os comandos `proximo`/`anterior`/`n`/`p` em `commands.jsx`; `ui.js` já tem `nextWord`/`previousWord` sem uso; executado: `proximo` e `n` → comando não encontrado |
| DS-08 | ❌ | `ui.js` tem `term.firstVisit`, sem uso; o banner mostra só "digite ajuda" |
| DS-09 | ◐ | O placeholder existe ("digite um comando · ajuda") mas sem exemplo; `ui.js` tem `term.try` ("experimente:") sem uso |
| DS-10 | ◐ | `curriculo 9` → `curriculo: "9": seção não encontrada. Tente ls curriculo` (erro claro, mas **não reimprime o índice**); texto pronto em `ui.js` (`term.nav.notExist`) sem uso |
| DS-11 | ◐ | `ajuda` ganhou o bloco "seções dentro das páginas" com `ls <página>`, `<página> <seção>`, `cd <página>/<seção>`, mas não o exemplo `curriculo` → `2` → `cd curriculo`; `term.nav.howTo`/`howToSteps` sem uso |
| DS-12 | ❌ | Depende de DS-01 a DS-07; hoje `academico`, `servicos`, `projetos`, `experiencias` seguem o formato do resumo antigo |

Resumo: ✅ 4 · ◐ 3 · ❌ 5 · ❔ 0
