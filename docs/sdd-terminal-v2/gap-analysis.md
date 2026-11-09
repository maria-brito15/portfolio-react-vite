# Análise de lacunas — Portfólio v2 (terminal/IDE)

Cruzamento entre [`requirements.md`](requirements.md) e o código do `src.zip` enviado em 09/11/2026 (a sessão do Claude Code foi interrompida pelo limite de uso).

**Como foi verificado.** (1) Leitura do código e de `README.md`. (2) `npm install`, `npm run lint` (sem apontamentos), `npm test` (**158 testes, 17 arquivos, todos passando**) e `npm run build` (ok). (3) Execução no navegador (Chromium, `vite preview`): os comandos `curriculo`, `ls curriculo`, `curriculo 2`, `curriculo 9`, `curriculo competencias`, `academico disciplinas`, `2`, `proximo`, `n` e `ajuda`; varredura de 11 rotas × 3 larguras (390, 768, 1440) sem rolagem horizontal e sem erro de console. (4) Cálculo de contraste dos tokens contra as três superfícies.

**Legenda.** ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado nesta análise.

## 1. Resumo

| Grupo | ✅ | ◐ | ❌ | ❔ |
| --- | --- | --- | --- | --- |
| Estilo (ES) | 8 | 1 | 0 | 1 |
| Shell e navegação (SH) | 10 | 0 | 0 | 0 |
| Sessão do terminal (TS) | 8 | 0 | 0 | 0 |
| Comandos e conteúdo (CM) | 5 | 0 | 0 | 0 |
| **Descoberta (DS)** | **12** | **0** | **0** | **0** |
| Dados e ordem (DT) | 4 | 0 | 0 | 0 |
| Não funcionais (NF) | 3 | 1 | 0 | 0 |

**Conclusão principal.** O redesenho de estilo, o header, a barra de comandos, a sessão do terminal, a gramática `<página> <seção>` e o conteúdo completo no terminal estão prontos e testados. **O que o limite de uso interrompeu é a camada de descoberta (DS):** o componente do índice numerado (`src/terminal/pageIndex.jsx`: `PageIndex`, `SectionNav`, `RunCommand`) e os textos em `src/i18n/ui.js` (`term.nav.*`, `firstVisit`, `try`) foram escritos, mas **nenhum arquivo os importa**. Hoje o terminal imprime o conteúdo certo, só não ensina o caminho.

## 2. Estilo (ES)

| ID | Estado | Evidência |
| --- | --- | --- |
| ES-01 | ✅ | `src/styles/styles.test.js` ("a única família de fonte…"); `index.html` carrega só JetBrains Mono |
| ES-02 | ✅ | `styles.test.js` ("não sobra Syne, DM Sans nem degradê"); varredura de `src` e `index.html` sem ocorrência fora do teste |
| ES-03 | ✅ | Arquivos antigos removidos e testado (`styles.test.js`); o comentário obsoleto de `ui.css:3` foi corrigido e o teste "nenhum CSS cita folhas que não existem mais" barra `original.css`/`portfolio.css` em qualquer CSS (verificado por mutação com um CSS temporário). `grep original.css src --include=*.css` vazio |
| ES-04 | ✅ | `styles.test.js` ("toda variável usada está definida"); `tokens.css` com temas claro e escuro |
| ES-05 | ✅ | Teste `src/styles/contrast.test.js` (8): lê `tokens.css` nos dois temas e exige ≥ 4,5:1 de accent, ok, warn, err, text, text-2 e dim contra surface, surface-2 e surface-3, mais on-accent sobre accent. Verificado por mutação: com `--warn` escuro trocado por `#6b4a22` o teste falha (2,40:1); tokens restaurados |
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
| SH-10 | ✅ | Tabela `legacyHashes`/`legacyTarget` em `routes.js` e `redirectLegacy` em `router.jsx` (`replaceState`, também no `hashchange`). Testes `src/data/legacyHashes.test.jsx` (11): `/#sobre`, `#habilidades`, `#projetos`, `#experiencias`, `#contato` e `#projects` levam à página própria sem `pushState`; `#xyz`, `#inicio` e `#%` não redirecionam e não lançam. Conferido no Chrome: `/#projetos` → `/projetos` e o Voltar vai para a página anterior (não reabre o link antigo). Corrigido junto: `scrollToHash` lançava `URIError` com hash malformado |

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
| DS-04 | ✅ | Cada linha `[n]` é um `RunCommand` (`pageIndex.jsx:53`), desabilitado com `session.busy`; estilo em `terminal.css` (`.t-run`, `.t-index-list`). Teste `sections.test.jsx` › "clicar em [2] produz a mesma saída de \"curriculo 2\" e o botão é alcançável por Tab". Conferido no Chrome: 390×844 e 1440×900 sem rolagem horizontal e sem erro de console |
| DS-05 | ✅ | Em `runCommand` (`commands.jsx:577`) `^\d+$` abre a seção da última página aberta; sem contexto responde `term.nav.noContext`. Testes `sections.test.jsx` › "número sozinho e navegação sequencial": `curriculo` → `2` abre a seção 2; `2` sem contexto e após `limpar` → "nenhum índice aberto"; EN "no index open". Contexto: `contextAfter`/`TerminalSession.jsx` (T-D4) |
| DS-06 | ✅ | `SectionNav` é renderizado ao fim de toda seção em `runSection` (`commands.jsx:98`). Teste `sections.test.jsx` › "toda seção termina com próxima, anterior e índice; os extremos avisam": `curriculo 2` → próxima 3 (experiencias), anterior 1 (resumo), índice; `curriculo 1` → "esta é a primeira seção"; `curriculo 6` → "esta é a última seção"; o clique em "anterior" abre a seção 5 |
| DS-07 | ✅ | Comandos `proximo`/`next` (apelido `n`) e `anterior`/`previous` (`p`) em `commands.jsx` (`runStep`), na `ajuda` e no autocompletar. Testes: após `curriculo`, `2` e `proximo` abrem 2 e 3; `n`/`p` equivalem; `anterior` na seção 1 → "esta é a primeira seção"; `proximo` na última → "esta é a última seção"; com o índice aberto, `proximo` abre a primeira; sem contexto → `noContext`; PT e EN; teste de inventário sem nomes repetidos |
| DS-08 | ✅ | Sem comando no histórico da sessão, o banner mostra `term.firstVisit` no lugar da dica (`Terminal.jsx:17,55`). Teste `Terminal.test.jsx` › "primeira visita: o banner sugere ls/ajuda; com histórico, não"; EN conferido em "o placeholder ensina um exemplo nos dois idiomas e some com a saída" |
| DS-09 | ✅ | O placeholder da linha do terminal vira `term.try` + exemplo (`Terminal.jsx:64`): "experimente: curriculo" / "try: resume"; some quando há saída ou carregamento. Teste `Terminal.test.jsx` › "o placeholder ensina um exemplo nos dois idiomas e some com a saída". A chave `placeholder` de `portfolio.jsx` (sem uso) foi removida |
| DS-10 | ✅ | `runSection` (`commands.jsx`) responde `<página> <arg inválido>` com `term.nav.notExist(arg)` e reimprime `PageIndex` + `ActionLine`. Testes `sections.test.jsx` › "erros que reensinam (DS-10)": `curriculo 9`, `curriculo xpto`, `projetos xpto`, `curriculo resumo sobra` e, em inglês, `9` depois de `resume` mostram o erro e o índice; nenhum lança exceção |
| DS-11 | ✅ | A `ajuda` traz `term.nav.howTo`/`howToSteps` e a linha clicável `curriculo` → `2` → `cd curriculo` (`resume` → `2` → `cd resume` em EN), em `commands.jsx` (bloco `.t-howto`). Testes `sections.test.jsx` › "ajuda com exemplo de ponta a ponta (DS-11)": texto e botões nos dois idiomas; clicar `curriculo` e depois `[2]` abre a seção |
| DS-12 | ✅ | Teste parametrizado `sections.test.jsx` › "mesmo padrão em todas as páginas com seções (DS-12)": `curriculo`, `academico`, `servicos`, `projetos`, `experiencias` × PT/EN (10 casos) — índice `[1]…[n]`, instrução e dicas, `ls <página>` com o mesmo HTML, clique em [1], número sozinho, `proximo`/`p`, erro que reensina. Conferido no Chrome (390 e 1440 px, as cinco páginas + `2`, `proximo`, `curriculo xpto`, `ajuda`): sem rolagem horizontal e sem erro de console. Marco D: `deadCode.test.js` garante que toda chave `term.nav.*`, `firstVisit`, `try` e toda exportação de `pageIndex.jsx` têm uso |
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
