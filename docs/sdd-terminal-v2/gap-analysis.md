# Análise de lacunas — Portfólio v2 (terminal/IDE)

Cruzamento entre [`requirements.md`](requirements.md) e o código do `src.zip` enviado em 09/11/2026 (a sessão do Claude Code foi interrompida pelo limite de uso).

**Como foi verificado.** (1) Leitura do código e de `README.md`. (2) `npm install`, `npm run lint` (sem apontamentos), `npm test` (**158 testes, 17 arquivos, todos passando**) e `npm run build` (ok). (3) Execução no navegador (Chromium, `vite preview`): os comandos `curriculo`, `ls curriculo`, `curriculo 2`, `curriculo 9`, `curriculo competencias`, `academico disciplinas`, `2`, `proximo`, `n` e `ajuda`; varredura de 11 rotas × 3 larguras (390, 768, 1440) sem rolagem horizontal e sem erro de console. (4) Cálculo de contraste dos tokens contra as três superfícies.

**Legenda.** ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado nesta análise.

## 1. Resumo

| Grupo | ✅ | ◐ | ❌ | ❔ |
| --- | --- | --- | --- | --- |
| Estilo (ES) | 9 | 1 | 0 | 0 |
| Shell e navegação (SH) | 10 | 0 | 0 | 0 |
| Sessão do terminal (TS) | 7 | 1 | 0 | 0 |
| Comandos e conteúdo (CM) | 5 | 0 | 0 | 0 |
| **Descoberta (DS)** | **12** | **0** | **0** | **0** |
| Dados e ordem (DT) | 3 | 1 | 0 | 0 |
| Não funcionais (NF) | 4 | 0 | 0 | 0 |

**Conclusão principal.** O redesenho de estilo, o header, a barra de comandos, a sessão do terminal, a gramática `<página> <seção>` e o conteúdo completo no terminal estão prontos e testados. **O que o limite de uso interrompeu é a camada de descoberta (DS):** o componente do índice numerado (`src/terminal/pageIndex.tsx`: `PageIndex`, `SectionNav`, `RunCommand`) e os textos em `src/i18n/ui.ts` (`term.nav.*`, `firstVisit`, `try`) foram escritos, mas **nenhum arquivo os importa**. Hoje o terminal imprime o conteúdo certo, só não ensina o caminho.

## 2. Estilo (ES)

| ID | Estado | Evidência |
| --- | --- | --- |
| ES-01 | ✅ | `src/styles/styles.test.ts` ("a única família de fonte…"); `index.html` carrega só JetBrains Mono |
| ES-02 | ✅ | `styles.test.ts` ("não sobra Syne, DM Sans nem degradê"); varredura de `src` e `index.html` sem ocorrência fora do teste |
| ES-03 | ✅ | Arquivos antigos removidos e testado (`styles.test.ts`); o comentário obsoleto de `ui.css:3` foi corrigido e o teste "nenhum CSS cita folhas que não existem mais" barra `original.css`/`portfolio.css` em qualquer CSS (verificado por mutação com um CSS temporário). `grep original.css src --include=*.css` vazio |
| ES-04 | ✅ | `styles.test.ts` ("toda variável usada está definida"); `tokens.css` com temas claro e escuro |
| ES-05 | ✅ | Teste `src/styles/contrast.test.ts` (8): lê `tokens.css` nos dois temas e exige ≥ 4,5:1 de accent, ok, warn, err, text, text-2 e dim contra surface, surface-2 e surface-3, mais on-accent sobre accent. Verificado por mutação: com `--warn` escuro trocado por `#6b4a22` o teste falha (2,40:1); tokens restaurados |
| ES-06 | ◐ | Auditoria das cores computadas no Chrome (10 rotas × claro/escuro × 1440/390 px, texto com cor de token) + 3 das 43 capturas vistas (`estilo-home-desktop-dark`, `estilo-curriculo-desktop-light`, `estilo-projetos-mobile-dark`); as outras 40 não foram abertas uma a uma. **Conforme:** vermelho só em erro (nenhuma ocorrência fora do terminal); verde em `t-user` (prompt) e chips de "ok"; âmbar nos botões, `>_` do header e comandos; azul em links, caminhos e `code`. **Desvios** (o token é de outro papel): (1) âmbar em selos/destaques — `proj-bdg`, `extra-bdg`, `doc-award`, `design-disclaimer-label` ("Finalista · PUC Minas"), que não são comando nem ação; (2) azul em texto decorativo — título "Duda Brito" e linha de cargos da home, números `doc-num`/`xp-num`, `sk-time`, `chip`, `case-tech-label`, "destaque" no título de Projetos — não são link nem caminho; (3) emojis coloridos (🌐 ☀ 📅 🏆) fora da paleta. Decisão de design pendente: ajustar o uso ou declarar no README que azul também marca ênfase e âmbar também marca destaque |
| ES-07 | ✅ | `src/components/shell/SiteShell.test.tsx` (layout das rotas); `App.tsx` envolve todas as páginas |
| ES-08 | ✅ | `components/ui/` (Card, Chip, DataTable, SectionTitle, ActionLink) importado por Resume, Academics, Services e `sections/portfolio/*`; `ui.test.tsx` |
| ES-09 | ✅ | Conferido no Chrome em modo de impressão (A4, `/curriculo`): sem header, barra de comandos, moldura, rodapé nem botão de imprimir; competências e experiências abertas; ~3 páginas A4. Dois desvios achados e corrigidos: o botão "Imprimir" saía no papel (`.doc-actions` agora oculto, `resume.css`) e no tema escuro o texto saía cinza-claro sobre branco (`tokens.css` usa os tokens claros em `@media print`; teste `contrast.test.ts` › "a impressão usa os mesmos tokens do tema claro"). PDF em `docs/screenshots/curriculo-impressao.pdf`. **Limite:** as quebras de página foram vistas na renderização em modo de impressão, não rasterizando o PDF (sem `pdftoppm` aqui) |
| ES-10 | ✅ | `Reveal` não existe mais; só restam `@keyframes term-blink` e `term-type`; `TerminalSession.tsx:27` respeita `prefers-reduced-motion` |

## 3. Shell e navegação (SH)

| ID | Estado | Evidência |
| --- | --- | --- |
| SH-01 | ✅ | `components/shell/Header.tsx` (zonas esquerda/centro/direita, sem menu); `SiteShell.test.tsx` ("o header é o mesmo em todas as rotas…") |
| SH-02 | ✅ | `shell.css:18-29` (`grid-template-columns: 1fr auto 1fr`) |
| SH-03 | ✅ | `CommandBar.tsx` + `SiteShell.test.tsx` ("executa comandos fora da home…", "na home, a barra e o terminal compartilham…") |
| SH-04 | ✅ | `SiteShell.test.tsx` ("só as páginas internas têm Voltar e breadcrumb", "usa history.back()…", "vai para a home quando…") |
| SH-05 | ✅ | `SiteShell.test.tsx` ("Ctrl+K e / focam a barra", "os atalhos não roubam o foco de campos de formulário") |
| SH-06 | ✅ | Varredura de responsividade em 09/11/2026 (Chrome, build de produção): 11 rotas × 17 tamanhos (320×568 a 2560×1440, inclusive celular deitado 667×375, 844×390, 932×430) × claro/escuro = 374 verificações, e 252 estados do terminal (ajuda, ls, índice, seções, erros) em 6 tamanhos: nenhum elemento passa da tela e nenhum erro de console. `html/body` têm `overflow-x: hidden` (`base.css`, `responsive.css`), que esconde a rolagem; por isso a medida foi refeita sem essa máscara (scrollWidth real) e por elemento: zero estouros; o único conteúdo "cortado" é o `hp-field` (campo-armadilha anti-spam, 1 px de propósito). Alvos de toque: o que tinha < 24 px (botões `.t-run`, `.action-link`, links do `ls`, sumário de competências, índice do estudo de caso, `.case-back`, campo do terminal) ganhou `min-height: 1.75rem` em `responsive.css` (`pointer: coarse` ou ≤ 720 px); texto < 11 px (`doc-num`, rótulos do estudo de caso) subiu para ≥ 11 px. Botão `>_` em `CommandBar.tsx`. Fluxo `curriculo` → `2` → `proximo` → `cd curriculo` conferido em 1440 e 390 px |
| SH-07 | ✅ | `SiteShell.test.tsx` ("as páginas dedicadas têm [ ver no terminal ]…", "/?cmd=servicos…") |
| SH-08 | ✅ | `data/routes.ts`, `data/sections.ts`; `routes.test.ts` |
| SH-09 | ✅ | `App.tsx` + `pages/SectionPage.tsx`; aliases `/about`, `/skills`, `/projects`, `/experience` em `routes.ts` |
| SH-10 | ✅ | Tabela `legacyHashes`/`legacyTarget` em `routes.ts` e `redirectLegacy` em `router.tsx` (`replaceState`, também no `hashchange`). Testes `src/data/legacyHashes.test.tsx` (11): `/#sobre`, `#habilidades`, `#projetos`, `#experiencias`, `#contato` e `#projects` levam à página própria sem `pushState`; `#xyz`, `#inicio` e `#%` não redirecionam e não lançam. Conferido no Chrome: `/#projetos` → `/projetos` e o Voltar vai para a página anterior (não reabre o link antigo). Corrigido junto: `scrollToHash` lançava `URIError` com hash malformado |

## 4. Sessão do terminal (TS)

| ID | Estado | Evidência |
| --- | --- | --- |
| TS-01 | ✅ | `TerminalSession.tsx:14`; `Terminal.test.tsx`; README |
| TS-02 | ◐ | Divergência deliberada (pedido da Duda em 10/11/2026: janela adaptável à tela): `tokens.css` agora usa `--win-max: clamp(1100px, 78vw, 1480px)` e altura `clamp(--win-min-h, 100dvh − --win-chrome, --win-cap-h)` (`terminal.css`), com mínimos menores em ≤720 px e em telas baixas; conferido no Edge headless em 1366×768 (janela inteira cabe) e 1920×1080/2560×1440 (cresce). O critério (~1100 px, ~75vh, mínimo ~520 px) não foi reescrito: aguarda confirmação para atualizar o requisito. Falta conferir 390 px em dispositivo real |
| TS-03 | ✅ | `redirect.test.tsx`; `TerminalSession.tsx:124-161` (progresso, `Esc`/`Ctrl+C`, modo reduzido) |
| TS-04 | ✅ | `redirect.test.tsx` / `Terminal.test.tsx` (replay sem navegação) |
| TS-05 | ✅ | `Terminal.test.tsx`; `TerminalSession.tsx:195` (`^C`) |
| TS-06 | ✅ | `sections.test.tsx` ("autocompletar": página, seção, lista de opções, "não inventa") |
| TS-07 | ✅ | `Terminal.test.tsx` (idioma redesenha a saída); `findCommand` com `fold()` aceita PT/EN e acentos |
| TS-08 | ✅ | `Terminal.tsx:52` e `CommandBar.tsx:131` com `aria-live="polite"`; campo com rótulo (`CommandInput.tsx`) |

## 5. Comandos e conteúdo (CM)

| ID | Estado | Evidência |
| --- | --- | --- |
| CM-01 | ✅ | `sections.test.tsx` ("inventário de comandos": nomes únicos, ajuda real, atalhos reais) |
| CM-02 | ✅ | `sections.test.tsx` ("ls <página>…", "cd <página>/<seção>"); executado: `ls curriculo` lista as 6 seções |
| CM-03 | ✅ | `sections.test.tsx` ("resolveTarget aceita ~, ./, .., barra final, maiúsculas e acentos", "funciona com barra, maiúsculas e em inglês"); executado: `curriculo 2` abre "Competências técnicas" |
| CM-04 | ✅ | `sections.test.tsx` ("nenhuma seção de nenhuma página fica inacessível pelo terminal"); `terminal/sectionViews.tsx` (438 linhas); executado: `academico disciplinas` imprime os 4 semestres |
| CM-05 | ✅ | `sections.test.tsx` ("erros são claros e nunca quebram", "runCommand devolve saída para entradas estranhas") |

## 6. Descoberta (DS): onde a sessão parou

Sintomas observados no navegador:

- `curriculo` imprime o resumo antigo (`views.tsx`): uma lista "# seções" com `01 Sobre mim … 06 Reconhecimentos`, **sem** colchetes `[n]`, **sem** a linha "digite o número ou o nome" e **sem** as dicas `→ ver uma seção…`.
- `ls curriculo` imprime linhas de texto `curriculo resumo | Sobre mim · …`, sem número e sem dicas.
- `2` → `2: comando não encontrado. Digite ajuda`. `proximo` e `n` → idem.
- O fim de `curriculo competencias` mostra só o par "ver no terminal / abrir página própria": não há próxima/anterior/índice.

| ID | Estado | Evidência e o que falta |
| --- | --- | --- |
| DS-01 | ✅ | `curriculo` imprime o índice `[1]…[6]` com a linha "Digite o número ou o nome": `PageIndex` ligado em `commands.tsx:520`. Teste `sections.test.tsx` › "curriculo e ls curriculo produzem o mesmo índice [1]…[6] com instrução e dicas" (T-D1) |
| DS-02 | ✅ | O índice termina com as dicas ver uma seção / abrir a página / listar de novo / início e ajuda (`pageIndex.tsx:61-70`). O mesmo teste confere os textos; "o índice aparece em inglês e nas páginas com seções" cobre o inglês |
| DS-03 | ✅ | `listSections` (`commands.tsx:49`) só escolhe `PageIndex`; o comando da página usa o mesmo componente (`commands.tsx:520`); a lista "# seções" de `views.tsx` foi removida. O teste compara o HTML do índice de `curriculo` e de `ls curriculo` (igual) |
| DS-04 | ✅ | Cada linha `[n]` é um `RunCommand` (`pageIndex.tsx:53`), desabilitado com `session.busy`; estilo em `terminal.css` (`.t-run`, `.t-index-list`). Teste `sections.test.tsx` › "clicar em [2] produz a mesma saída de \"curriculo 2\" e o botão é alcançável por Tab". Conferido no Chrome: 390×844 e 1440×900 sem rolagem horizontal e sem erro de console |
| DS-05 | ✅ | Em `runCommand` (`commands.tsx:577`) `^\d+$` abre a seção da última página aberta; sem contexto responde `term.nav.noContext`. Testes `sections.test.tsx` › "número sozinho e navegação sequencial": `curriculo` → `2` abre a seção 2; `2` sem contexto e após `limpar` → "nenhum índice aberto"; EN "no index open". Contexto: `contextAfter`/`TerminalSession.tsx` (T-D4) |
| DS-06 | ✅ | `SectionNav` é renderizado ao fim de toda seção em `runSection` (`commands.tsx:98`). Teste `sections.test.tsx` › "toda seção termina com próxima, anterior e índice; os extremos avisam": `curriculo 2` → próxima 3 (experiencias), anterior 1 (resumo), índice; `curriculo 1` → "esta é a primeira seção"; `curriculo 6` → "esta é a última seção"; o clique em "anterior" abre a seção 5 |
| DS-07 | ✅ | Comandos `proximo`/`next` (apelido `n`) e `anterior`/`previous` (`p`) em `commands.tsx` (`runStep`), na `ajuda` e no autocompletar. Testes: após `curriculo`, `2` e `proximo` abrem 2 e 3; `n`/`p` equivalem; `anterior` na seção 1 → "esta é a primeira seção"; `proximo` na última → "esta é a última seção"; com o índice aberto, `proximo` abre a primeira; sem contexto → `noContext`; PT e EN; teste de inventário sem nomes repetidos |
| DS-08 | ✅ | Sem comando no histórico da sessão, o banner mostra `term.firstVisit` no lugar da dica (`Terminal.tsx:17,55`). Teste `Terminal.test.tsx` › "primeira visita: o banner sugere ls/ajuda; com histórico, não"; EN conferido em "o placeholder ensina um exemplo nos dois idiomas e some com a saída" |
| DS-09 | ✅ | O placeholder da linha do terminal vira `term.try` + exemplo (`Terminal.tsx:64`): "experimente: curriculo" / "try: resume"; some quando há saída ou carregamento. Teste `Terminal.test.tsx` › "o placeholder ensina um exemplo nos dois idiomas e some com a saída". A chave `placeholder` de `portfolio.tsx` (sem uso) foi removida |
| DS-10 | ✅ | `runSection` (`commands.tsx`) responde `<página> <arg inválido>` com `term.nav.notExist(arg)` e reimprime `PageIndex` + `ActionLine`. Testes `sections.test.tsx` › "erros que reensinam (DS-10)": `curriculo 9`, `curriculo xpto`, `projetos xpto`, `curriculo resumo sobra` e, em inglês, `9` depois de `resume` mostram o erro e o índice; nenhum lança exceção |
| DS-11 | ✅ | A `ajuda` traz `term.nav.howTo`/`howToSteps` e a linha clicável `curriculo` → `2` → `cd curriculo` (`resume` → `2` → `cd resume` em EN), em `commands.tsx` (bloco `.t-howto`). Testes `sections.test.tsx` › "ajuda com exemplo de ponta a ponta (DS-11)": texto e botões nos dois idiomas; clicar `curriculo` e depois `[2]` abre a seção |
| DS-12 | ✅ | Teste parametrizado `sections.test.tsx` › "mesmo padrão em todas as páginas com seções (DS-12)": `curriculo`, `academico`, `servicos`, `projetos`, `experiencias` × PT/EN (10 casos) — índice `[1]…[n]`, instrução e dicas, `ls <página>` com o mesmo HTML, clique em [1], número sozinho, `proximo`/`p`, erro que reensina. Conferido no Chrome (390 e 1440 px, as cinco páginas + `2`, `proximo`, `curriculo xpto`, `ajuda`): sem rolagem horizontal e sem erro de console. Marco D: `deadCode.test.ts` garante que toda chave `term.nav.*`, `firstVisit`, `try` e toda exportação de `pageIndex.tsx` têm uso |
| (Tab) | ✅ | Tab depois de `curriculo ` lista as seções (`sections.test.tsx`, "autocompletar") |

## 7. Dados e ordem (DT)

| ID | Estado | Evidência |
| --- | --- | --- |
| DT-01 | ✅ | `utils/projectDate.ts` (`sortByDateDesc`, `parsePeriodStart`), `utils/academics.ts` (`activitiesByYear`); `DocPages.test.tsx`; README |
| DT-02 | ✅ | `data/projects.test.ts` passa sem alteração |
| DT-03 | ◐ | `data/academics.ts` (divergência deliberada, dados informados pela Duda em 10/11/2026): 01/2025 (7), 02/2025 (5) e 01/2026 (5) com as disciplinas **aprovadas** e suas notas; reprovações (Arquitetura de Computadores I, Cálculo II, Linguagens de Programação) ficam de fora; `hours`/`modality` ausentes (aparecem como "—"); 02/2026 segue vazio, em andamento. O critério fala em "placeholder" e não foi reescrito: aguarda confirmação. Teste: `DocPages.test.tsx` ("mostra formação, linha do tempo e atividades por ano") |
| DT-04 | ✅ | `data/skillTimeline.ts` + `skillTimeline.test.ts` |

## 8. Não funcionais (NF)

| ID | Estado | Evidência |
| --- | --- | --- |
| NF-01 | ✅ | lint limpo · `tsc --noEmit` limpo · 215/215 testes · build ok (10/11/2026, após a migração para TypeScript) |
| NF-02 | ✅ | Varredura de 09/11/2026: 33 combinações (11 rotas × 390/768/1440 px) e o fluxo `curriculo` → `2` → `proximo` → `cd curriculo` (1440 e 390 px) sem nenhum erro de console nem exceção de página |
| NF-03 | ✅ | Textos novos em `ui.ts` e nos dados; testes de idioma |
| NF-04 | ✅ | README documenta o índice numerado, o número como atalho, `proximo`/`anterior`, a primeira visita e os erros que reensinam (seção "Descobrir as seções sem saber os comandos") e os links antigos (T-L2); 12 capturas novas `docs/screenshots/terminal-{indice,numero,proximo}-{desktop,mobile}-{dark,light}.png` geradas no Chrome (sem rolagem horizontal, sem erro de console). `docs/sdd/requirements.md` marca D-04, D-10, RF-18, RF-19 e RNF-03 como superados e `docs/sdd/tasks.md` traz a contagem atual (215 testes em 20 arquivos) |

## 9. Outros achados

- **Código morto:** `pageIndex.tsx` inteiro e as chaves `term.nav.*`, `term.firstVisit`, `term.try` de `ui.ts` (PT e EN). Resolvem-se ligando (T-D1 a T-D6), não apagando.
- **Telas não revisadas:** `docs/screenshots/estilo-*` (43 imagens) foram geradas pela sessão anterior; não foram conferidas aqui (ES-06 segue ❔).
- **Entrega:** o zip enviado contém `dist/` (já está no `.gitignore`); não vai ao repositório.
- **Pendências do TP1 herdadas, fora desta spec:** deploy, EmailJS real, Figma, imagens de ShortURL/File Name Standardizer, LinkedIn divergente entre o PDF e `profile.ts` (ver `docs/sdd/tasks.md`).
