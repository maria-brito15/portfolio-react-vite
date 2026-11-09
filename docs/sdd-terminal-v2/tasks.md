# Plano de implementação — Portfólio v2 (terminal/IDE)

Plano derivado de [`gap-analysis.md`](gap-analysis.md) para cumprir [`requirements.md`](requirements.md). Cada tarefa cabe em um commit e termina com um critério verificável. O que já está pronto não reaparece aqui.

**Definição de pronto (toda tarefa de código):** `npm run lint`, `npm test` e `npm run build` com código 0 · textos novos em PT e EN (`src/i18n/ui.js` ou dados) · nenhum dado inventado · teste cobrindo o comportamento novo · estado correspondente em `gap-analysis.md` atualizado.

**Legenda:** 💻 código · 📝 documentação · 🔎 verificação manual · ⛓ dependência.

## Estado em 09/11/2026

Pronto e testado (158 testes): estilo único, header, barra de comandos, sessão do terminal, `ls`/`cd`/`<página> <seção>`, conteúdo completo no terminal, ordem das atividades e disciplinas. **Pendente: descoberta (DS), redirecionamento de links antigos (SH-10) e acabamento.** O trabalho de DS foi interrompido pelo limite de uso: o componente `src/terminal/pageIndex.jsx` e os textos em `src/i18n/ui.js` já existem, falta ligá-los.

## Fase D — Descoberta (P0)

Ordem importa: cada tarefa aproveita a anterior.

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-D1 ✅ | 💻 **Um só renderizador do índice.** Fazer o comando da página (`curriculo`, `academico`, `servicos`, `projetos`, `experiencias`) e o `ls <página>` renderizarem `PageIndex` (de `pageIndex.jsx`). Manter, acima do índice, o cabeçalho/resumo curto de cada página (hoje em `views.jsx`) e remover `listSections` de `commands.jsx` e a lista "# seções" de `views.jsx` | DS-01, DS-02, DS-03 | — | Teste: `curriculo` e `ls curriculo` produzem o mesmo índice `[1] … [6]` com a linha "Digite o número ou o nome" e as dicas `→ ver uma seção / abrir a página / listar de novo / início`; nenhuma outra lista de seções sobra no código |
| T-D2 ✅ | 💻 **Índice clicável.** Usar `RunCommand` em cada linha `[n]` (botão que executa `<página> n`, desabilitado enquanto `session.busy`); estilo no `terminal.css` sem quebrar o mobile | DS-04 | T-D1 | Teste: clicar em `[2]` produz a mesma saída de `curriculo 2`; botão alcançável por Tab; em 390 px a linha quebra sem rolagem horizontal |
| T-D3 ✅ | 💻 **Vizinhos ao fim da seção.** Renderizar `SectionNav` no fim de toda seção (`sectionViews.jsx`), antes ou junto ao `ActionLine`; os três itens clicáveis | DS-06 | T-D2 | Teste: `curriculo 2` termina com próxima (3 · experiencias), anterior (1 · resumo) e índice; `curriculo 1` mostra "esta é a primeira seção"; a última mostra "esta é a última" |
| T-D4 ✅ | 💻 **Contexto da última página.** Guardar na sessão (`TerminalSession.jsx`) o `routeId` e a seção do último índice/seção aberta; limpar com `limpar` e ao abrir `cd ~` | DS-05, DS-07 | T-D1 | Teste: o contexto muda ao abrir `curriculo` e `academico`; `limpar` o zera; o replay do histórico reconstrói o contexto sem efeitos |
| T-D5 ✅ | 💻 **Número sozinho e navegação sequencial.** Em `runCommand`, tratar `^\d+$` como seção da página do contexto; criar `proximo`/`anterior` (apelidos `n`/`p`, nomes de `ui.js`: `nextWord`, `previousWord`) para a última página aberta. Sem contexto, responder `term.nav.noContext`; nos limites, `term.nav.first/last`. Incluir os novos comandos em `ajuda`, `complete` e no teste de inventário (sem nomes repetidos; `n` e `p` não colidem com nada) | DS-05, DS-07 | T-D4 | Testes: após `curriculo`, `2` abre a seção 2 e `proximo` abre a 3; `anterior` na seção 1 diz "primeira seção"; `2` sem contexto devolve `noContext`; `n`/`p` equivalem a `proximo`/`anterior`; PT e EN |
| T-D6 ✅ | 💻 **Erros que reensinam.** `<página> <arg inválido>` mostra `term.nav.notExist(arg)` e reimprime o `PageIndex` da página | DS-10 | T-D1 | Teste: `curriculo 9` e `curriculo xpto` mostram o erro e o índice; não lança exceção |
| T-D7 ✅ | 💻 **Primeira visita e placeholder.** Mostrar `term.firstVisit` no banner quando não há histórico salvo; mudar o placeholder para `term.try` + exemplo (`experimente: curriculo`) | DS-08, DS-09 | — | Testes: sem `sessionStorage` o banner traz a sugestão; com histórico, não; o placeholder nunca fica vazio nos dois idiomas |
| T-D8 ✅ | 💻 **`ajuda` com exemplo de ponta a ponta.** Acrescentar o bloco `term.nav.howTo` / `howToSteps` com `curriculo` → `2` → `cd curriculo`, clicável | DS-11 | T-D5 | Teste: `ajuda` contém o bloco nos dois idiomas e os três comandos do exemplo existem |
| T-D9 ✅ | 💻 **Mesmo padrão em todas as páginas.** Conferir `academico`, `servicos`, `projetos` e `experiencias` com T-D1 a T-D8 (inclusive o projeto como seção em `projetos ecoshop`) | DS-12 | T-D1 a T-D8 | Teste parametrizado sobre todas as rotas com seções: índice, clique, número, `proximo`, erro e dicas funcionam; PT e EN |

**Marco D:** DS-01 a DS-12 atendidos; nenhum trecho de `pageIndex.jsx` nem chave `term.nav.*` fica sem uso (um teste/`eslint` acusa código morto).

## Fase L — Links antigos (P1)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-L1 ✅ | 💻 Mapear hashes antigos (`#sobre`, `#habilidades`, `#projetos`, `#experiencias`, `#contato`, mais os ids em inglês de `/en`) para a página própria equivalente e redirecionar no cliente (`replaceState`, sem empilhar histórico) | SH-10 | — | Teste: abrir `/#projetos` leva a `/projetos` e o botão Voltar não volta ao link antigo; hash desconhecido não redireciona |
| T-L2 ✅ | 📝 Registrar no README que as seções da home viraram páginas e que os links antigos redirecionam | SH-10, NF-04 | T-L1 | README atualizado |

## Fase A — Acabamento (P1)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-A1 ✅ | 💻 Teste automatizado de contraste AA: ler os tokens de `tokens.css` nos dois temas e exigir ≥ 4,5:1 contra `--surface`, `--surface-2` e `--surface-3` | ES-05 | — | O teste falha se um acento for trocado por uma cor abaixo de 4,5:1 |
| T-A2 ✅ | 💻 Corrigir o comentário obsoleto em `src/styles/ui.css:3` (cita `original.css`) e adicionar ao `styles.test.js` a regra "nenhum CSS cita `original.css` ou `portfolio.css`" | ES-03 | — | Teste passa; `grep original.css src` vazio |
| T-A3 ✅ | 🔎 Imprimir `/curriculo` em PDF (Chromium, `page.pdf`) e conferir: sem header, barra de comandos e moldura; sem cortes; competências e experiências abertas | ES-09 | — | PDF anexado ao PR e registrado no gap-analysis |
| T-A4 ✅ | 🔎 Revisar as capturas de `docs/screenshots/estilo-*` (43 imagens) e conferir azul/verde/âmbar/vermelho nas duas telas, nos dois temas | ES-06 | — | Estado de ES-06 vira ✅ ou lista os desvios |
| T-A5 ✅ | 📝 Marcar em `docs/sdd/requirements.md` (TP1) os itens superados (D-04, RF-18, RF-19, RNF-03, D-10) com uma nota "superado por `sdd-terminal-v2/`" e atualizar a contagem de testes em `docs/sdd/tasks.md` | NF-04 | — | Notas presentes; nenhum requisito do TP1 contradiz o site sem aviso |
| T-A6 ✅ | 📝 README: documentar índice numerado, número como atalho, `proximo`/`anterior` e a primeira visita; regerar capturas (`curriculo`, `2`, `proximo`) em 1440×900 e 390×844, claro e escuro | NF-04 | T-D9 | README e `docs/screenshots` atualizados |
| T-A7 | 🔎 Rodar a varredura de 11 rotas × 390/768/1440 (rolagem horizontal e console) e o fluxo `curriculo` → `2` → `proximo` → `cd curriculo` | SH-06, NF-02 | T-D9 | Sem rolagem horizontal e sem erro de console |

## Ordem sugerida

1. **T-D1 → T-D2 → T-D3** (o índice e os vizinhos): maior ganho de intuitividade com o código que já existe.
2. **T-D4 → T-D5** (contexto, número sozinho, `proximo`/`anterior`) e **T-D6, T-D7, T-D8**.
3. **T-D9** (conferir todas as páginas), depois **T-L1/T-L2**.
4. **T-A1 a T-A7** por último, com o site estável.

## Como retomar no Claude Code (cada tarefa em uma sessão curta)

Abra uma sessão nova por grupo de tarefas, cole a spec e peça só aquelas tarefas, por exemplo:

> Leia `docs/sdd-terminal-v2/requirements.md`, `gap-analysis.md` e `tasks.md`. Implemente **só T-D1 a T-D3**, na ordem, um commit por tarefa. Reaproveite `src/terminal/pageIndex.jsx` e as chaves `term.nav.*` de `src/i18n/ui.js`, que já existem e não estão ligadas. Rode lint, testes e build ao final de cada tarefa, atualize o estado em `gap-analysis.md` e pare.
