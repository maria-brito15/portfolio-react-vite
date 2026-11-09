# Análise de lacunas — Portfólio v2 (terminal/IDE)

Cruzamento entre [`requirements.md`](requirements.md) e o código do `src.zip` enviado em 09/11/2026 (a sessão do Claude Code foi interrompida pelo limite de uso).

**Como foi verificado.** (1) Leitura do código e de `README.md`. (2) `npm install`, `npm run lint` (sem apontamentos), `npm test` (**158 testes, 17 arquivos, todos passando**) e `npm run build` (ok). (3) Execução no navegador (Chromium, `vite preview`): os comandos `curriculo`, `ls curriculo`, `curriculo 2`, `curriculo 9`, `curriculo competencias`, `academico disciplinas`, `2`, `proximo`, `n` e `ajuda`; varredura de 11 rotas × 3 larguras (390, 768, 1440) sem rolagem horizontal e sem erro de console. (4) Cálculo de contraste dos tokens contra as três superfícies.

**Legenda.** ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado nesta análise.

## 1. Resumo

| Grupo | ✅ | ◐ | ❌ | ❔ |
| --- | --- | --- | --- | --- |
| Estilo (ES) | 6 | 3 | 0 | 1 |
| Shell e navegação (SH) | 9 | 0 | 1 | 0 |
| Sessão do terminal (TS) | 8 | 0 | 0 | 0 |
| Comandos e conteúdo (CM) | 5 | 0 | 0 | 0 |
| **Descoberta (DS)** | **3** | **3** | **6** | **0** |
| Dados e ordem (DT) | 4 | 0 | 0 | 0 |
| Não funcionais (NF) | 3 | 1 | 0 | 0 |

**Conclusão principal.** O redesenho de estilo, o header, a barra de comandos, a sessão do terminal, a gramática `<página> <seção>` e o conteúdo completo no terminal estão prontos e testados. **O que o limite de uso interrompeu é a camada de descoberta (DS):** o componente do índice numerado (`src/terminal/pageIndex.jsx`: `PageIndex`, `SectionNav`, `RunCommand`) e os textos em `src/i18n/ui.js` (`term.nav.*`, `firstVisit`, `try`) foram escritos, mas **nenhum arquivo os importa**. Hoje o terminal imprime o conteúdo certo, só não ensina o caminho.

## 2. Estilo (ES)

| ID | Estado | Evidência |
| --- | --- | --- |
| ES-01 | ✅ | `src/styles/styles.test.js` ("a única família de fonte…"); `index.html` carrega só JetBrains Mono |
| ES-02 | ✅ | `styles.test.js` ("não sobra Syne, DM Sans nem degradê"); varredura de `src` e `index.html` sem ocorrência fora do teste |
| ES-03 | ◐ | Arquivos removidos e testado, mas `src/styles/ui.css:3` ainda cita "cores gerais, de original.css" (comentário obsoleto) |
| ES-04 | ✅ | `styles.test.js` ("toda variável usada está definida"); `tokens.css` com temas claro e escuro |
| ES-05 | ◐ | Verificado por cálculo (pior caso contra as 3 superfícies): escuro — texto 12,6, dim 5,1, accent 6,8, ok 9,4, warn 7,5, err 6,5; claro — texto 12,8, dim 4,8, accent 5,2, ok 4,9, warn 5,0, err 5,2; todos ≥ 4,5. **Não há teste automatizado**; o `tokens.css` só afirma AA em comentário |
| ES-06 | ❔ | Regra declarada no README e nos tokens; não conferi visualmente todas as telas |
| ES-07 | ✅ | `src/components/shell/SiteShell.test.jsx` (layout das rotas); `App.jsx` envolve todas as páginas |
| ES-08 | ✅ | `components/ui/` (Card, Chip, DataTable, SectionTitle, ActionLink) importado por Resume, Academics, Services e `sections/portfolio/*`; `ui.test.jsx` |
| ES-09 | ◐ | Há `@media print` em `resume.css`, `shell.css` e `ui.css`; **não há teste nem captura de PDF** nesta análise (MAN pendente) |
| ES-10 | ✅ | `Reveal` não existe mais; só restam `@keyframes term-blink` e `term-type`; `TerminalSession.jsx:27` respeita `prefers-reduced-motion` |

## 3. Shell e navegação (SH)

| ID | Estado | Evidência |
| --- | --- | --- |
| SH-01 | ✅ | `components/shell/Header.jsx` (zonas esquerda/centro/direita, sem menu); `SiteShell.test.jsx` ("o header é o mesmo em todas as rotas…") |
| SH-02 | ✅ | `shell.css:18-29` (`grid-template-columns: 1fr auto 1fr`) |
| SH-03 | ✅ | `CommandBar.jsx` + `SiteShell.test.jsx` ("executa comandos fora da home…", "na home, a barra e o terminal compartilham…") |
| SH-04 | ✅ | `SiteShell.test.jsx` ("só as páginas internas têm Voltar e breadcrumb", "usa history.back()…", "vai para a home quando…") |
| SH-05 | ✅ | `SiteShell.test.jsx` ("Ctrl+K e / focam a barra", "os atalhos não roubam o foco de campos de formulário") |
| SH-06 | ✅ | Varredura: nenhuma das 11 rotas tem rolagem horizontal em 390, 768 e 1440 px; botão `>_` em `CommandBar.jsx` |
| SH-07 | ✅ | `SiteShell.test.jsx` ("as páginas dedicadas têm [ ver no terminal ]…", "/?cmd=servicos…") |
| SH-08 | ✅ | `data/routes.js`, `data/sections.js`; `routes.test.js` |
| SH-09 | ✅ | `App.jsx` + `pages/SectionPage.jsx`; aliases `/about`, `/skills`, `/projects`, `/experience` em `routes.js` |
| SH-10 | ❌ | Não há tratamento de `/#sobre`, `/#projetos` etc.: o roteador só rola até o id e, como a home é só o terminal, o link antigo cai na home sem destino. Afeta links já publicados (LinkedIn, currículo, README) |

## 4. Sessão do terminal (TS)

| ID | Estado | Evidência |
| --- | --- | --- |
| TS-01 | ✅ | `TerminalSession.jsx:14`; `Terminal.test.jsx`; README |
| TS-02 | ✅ | `tokens.css`: `--win-max: 1100px`, `--win-h: 75vh`, `--win-min-h: 520px` (360 e 70vh no mobile) |
| TS-03 | ✅ | `redirect.test.jsx`; `TerminalSession.jsx:124-161` (progresso, `Esc`/`Ctrl+C`, modo reduzido) |
| TS-04 | ✅ | `redirect.test.jsx` / `Terminal.test.jsx` (replay sem navegação) |
| TS-05 | ✅ | `Terminal.test.jsx`; `TerminalSession.jsx:195` (`^C`) |
| TS-06 | ✅ | `sections.test.jsx` ("autocompletar": página, seção, lista de opções, "não inventa") |
| TS-07 | ✅ | `Terminal.test.jsx` (idioma redesenha a saída); `findCommand` com `fold()` aceita PT/EN e acentos |
| TS-08 | ✅ | `Terminal.jsx:52` e `CommandBar.jsx:131` com `aria-live="polite"`; campo com rótulo (`CommandInput.jsx`) |

## 5. Comandos e conteúdo (CM)

| ID | Estado | Evidência |
| --- | --- | --- |
| CM-01 | ✅ | `sections.test.jsx` ("inventário de comandos": nomes únicos, ajuda real, atalhos reais) |
| CM-02 | ✅ | `sections.test.jsx` ("ls <página>…", "cd <página>/<seção>"); executado: `ls curriculo` lista as 6 seções |
| CM-03 | ✅ | `sections.test.jsx` ("resolveTarget aceita ~, ./, .., barra final, maiúsculas e acentos", "funciona com barra, maiúsculas e em inglês"); executado: `curriculo 2` abre "Competências técnicas" |
| CM-04 | ✅ | `sections.test.jsx` ("nenhuma seção de nenhuma página fica inacessível pelo terminal"); `terminal/sectionViews.jsx` (438 linhas); executado: `academico disciplinas` imprime os 4 semestres |
| CM-05 | ✅ | `sections.test.jsx` ("erros são claros e nunca quebram", "runCommand devolve saída para entradas estranhas") |

## 6. Descoberta (DS): onde a sessão parou

Sintomas observados no navegador:

- `curriculo` imprime o resumo antigo (`views.jsx`): uma lista "# seções" com `01 Sobre mim … 06 Reconhecimentos`, **sem** colchetes `[n]`, **sem** a linha "digite o número ou o nome" e **sem** as dicas `→ ver uma seção…`.
- `ls curriculo` imprime linhas de texto `curriculo resumo | Sobre mim · …`, sem número e sem dicas.
- `2` → `2: comando não encontrado. Digite ajuda`. `proximo` e `n` → idem.
- O fim de `curriculo competencias` mostra só o par "ver no terminal / abrir página própria": não há próxima/anterior/índice.

| ID | Estado | Evidência e o que falta |
| --- | --- | --- |
| DS-01 | ✅ | `curriculo` imprime o índice `[1]…[6]` com a linha "Digite o número ou o nome": `PageIndex` ligado em `commands.jsx:520`. Teste `sections.test.jsx` › "curriculo e ls curriculo produzem o mesmo índice [1]…[6] com instrução e dicas" (T-D1) |
| DS-02 | ✅ | O índice termina com as dicas ver uma seção / abrir a página / listar de novo / início e ajuda (`pageIndex.jsx:61-70`). O mesmo teste confere os textos; "o índice aparece em inglês e nas páginas com seções" cobre o inglês |
| DS-03 | ✅ | `listSections` (`commands.jsx:49`) só escolhe `PageIndex`; o comando da página usa o mesmo componente (`commands.jsx:520`); a lista "# seções" de `views.jsx` foi removida. O teste compara o HTML do índice de `curriculo` e de `ls curriculo` (igual) |
| DS-04 | ❌ | Nenhuma linha do índice executa comando ao clicar: `RunCommand` existe e não é usado |
| DS-05 | ❌ | Não há tratamento de número sozinho nem contexto de "última página aberta" (`TerminalSession` não guarda a página do último índice); executado: `2` → comando não encontrado. Mensagem pronta em `ui.js` (`term.nav.noContext`) e sem uso |
| DS-06 | ❌ | `SectionNav` (`pageIndex.jsx:75`) existe e não é renderizado ao fim das seções (`sectionViews.jsx` não o importa) |
| DS-07 | ❌ | Não existem os comandos `proximo`/`anterior`/`n`/`p` em `commands.jsx`; `ui.js` já tem `nextWord`/`previousWord` sem uso; executado: `proximo` e `n` → comando não encontrado |
| DS-08 | ❌ | `ui.js` tem `term.firstVisit`, sem uso; o banner mostra só "digite ajuda" |
| DS-09 | ◐ | O placeholder existe ("digite um comando · ajuda") mas sem exemplo; `ui.js` tem `term.try` ("experimente:") sem uso |
| DS-10 | ◐ | `curriculo 9` → `curriculo: "9": seção não encontrada. Tente ls curriculo` (erro claro, mas **não reimprime o índice**); texto pronto em `ui.js` (`term.nav.notExist`) sem uso |
| DS-11 | ◐ | `ajuda` ganhou o bloco "seções dentro das páginas" com `ls <página>`, `<página> <seção>`, `cd <página>/<seção>`, mas não o exemplo `curriculo` → `2` → `cd curriculo`; `term.nav.howTo`/`howToSteps` sem uso |
| DS-12 | ❌ | Depende de DS-01 a DS-07; hoje `academico`, `servicos`, `projetos`, `experiencias` seguem o formato do resumo antigo |
| (Tab) | ✅ | Tab depois de `curriculo ` lista as seções (`sections.test.jsx`, "autocompletar") |

## 7. Dados e ordem (DT)

| ID | Estado | Evidência |
| --- | --- | --- |
| DT-01 | ✅ | `utils/projectDate.js` (`sortByDateDesc`, `parsePeriodStart`), `utils/academics.js` (`activitiesByYear`); `DocPages.test.jsx`; README |
| DT-02 | ✅ | `data/projects.test.js` passa sem alteração |
| DT-03 | ✅ | `data/academics.js` (4 semestres com `courses: []`); executado: `academico disciplinas` lista 02/2026 (Engenharia, em andamento), 01/2026, 02/2025, 01/2025, todos "sem disciplinas lançadas" |
| DT-04 | ✅ | `data/skillTimeline.js` + `skillTimeline.test.js` |

## 8. Não funcionais (NF)

| ID | Estado | Evidência |
| --- | --- | --- |
| NF-01 | ✅ | lint limpo · 158/158 testes · build ok |
| NF-02 | ✅ | Varredura em 3 larguras × 11 rotas sem erro de console |
| NF-03 | ✅ | Textos novos em `ui.js` e nos dados; testes de idioma |
| NF-04 | ◐ | README descreve o terminal, o header e as seções, mas ainda não menciona índice numerado, número como atalho nem `proximo`/`anterior` (não existem ainda); `docs/sdd/` (TP1) não marca os itens superados (spec §1, D-04/RF-19/RF-18/RNF-03) |

## 9. Outros achados

- **Código morto:** `pageIndex.jsx` inteiro e as chaves `term.nav.*`, `term.firstVisit`, `term.try` de `ui.js` (PT e EN). Resolvem-se ligando (T-D1 a T-D6), não apagando.
- **Telas não revisadas:** `docs/screenshots/estilo-*` (43 imagens) foram geradas pela sessão anterior; não foram conferidas aqui (ES-06 segue ❔).
- **Entrega:** o zip enviado contém `dist/` (já está no `.gitignore`); não vai ao repositório.
- **Pendências do TP1 herdadas, fora desta spec:** deploy, EmailJS real, Figma, imagens de ShortURL/File Name Standardizer, LinkedIn divergente entre o PDF e `profile.js` (ver `docs/sdd/tasks.md`).
