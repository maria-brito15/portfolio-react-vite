# 001 Engineering baseline, Anexo B: lista do código fora do MVP, para a Duda aprovar
**Status:** rascunho para aprovação (FR-006, D-004) · Parte do `design.md` · Nada daqui é removido antes de a Duda aprovar este anexo **e** o `tasks.md` · Os 3 temas extras (dracula, solarized, amber) não estão aqui: saem com a spec 002.

## Como a lista foi feita
- Grafo de importações de todos os `.ts/.tsx/.mts/.mjs` de `src/`, `scripts/`, `netlify/`, `e2e/` e dos arquivos de configuração (script de apoio fora do repositório, resolve `import ... from './x'`; **não vê** `import()` dinâmico com variável nem referências por texto, por isso o `grep` complementar de cada grupo está citado). Para cada arquivo: quem o importa.
- **Classe A, "sai direto":** nenhum arquivo de fora do grupo o importa (só o grupo e os testes dele). Pode ser apagado junto com o grupo sem tocar em página do MVP.
- **Classe B, "desacoplar antes":** pelo menos um arquivo de fora do grupo o importa. Primeiro se corta a ligação nos importadores (editar), só depois se apaga. A coluna "MVP?" diz se esse importador é uma página/casca do MVP (projetos, casos, currículo, acadêmico, contato, `/pessoal`, terminal, casca).
- **Classe T, teste misto:** o arquivo de teste cobre código que fica **e** código que sai. Edita-se o teste (remove-se só os casos do código removido); nunca se pula nem se silencia (FR-006).
- Contagens de testes e tempos vêm da execução E3 do Anexo A (4 workers, sem contenção).
- Os arquivos do Caderno (`src/components/notebook/`, `src/data/notebook/`, `src/i18n/nb.ts`, `src/styles/notebook.css`, `src/config.ts`, `src/components/shell/shellProps.ts`) **não estão na lista**: o plano não os cita. Dependem de personas e trilhas (ver G-5) e a decisão sobre eles é a DQ-001.

## Resumo
| Grupo | Arquivos de código | Arquivos de teste | Testes que passam hoje | Tempo de teste (E3) |
| --- | --- | --- | --- | --- |
| G-1 Assistente de IA | 11 | 8 | 90 (+18 pulados "ao vivo") | 11,5 s |
| G-2 Jogos | 6 | 2 | 47 | 19,3 s |
| G-3 Trilhas (inclui `PageNext`) | 12 | 7 | 95 | 34,4 s |
| G-4 Personas e contexto por persona | 21 (+1 CSS) | 13 | 141 | 36,4 s |
| **Total** | **50 (+1 CSS)** | **30** | **373 (+18 pulados = 391)** | **101,6 s de 339 s (30 %)** |

Os totais vêm do JSON da execução E3 (soma por arquivo). Cada arquivo foi atribuído ao grupo que mais o usa; alguns testes cobrem dois grupos, então a divisão por grupo é aproximada. O que vale é a lista de arquivos abaixo. O teste `netlify/assistant/secrets.test.ts` (4 testes) está contado em G-1, mas metade dele sobrevive (ver G-1).

## G-1 Assistente de IA
Nenhuma página do MVP usa o assistente. O único ponto de contato no cliente é o comando `pergunte` do terminal.

### Sai direto (A)
| Arquivo | Quem importa (fora do grupo) | MVP? |
| --- | --- | --- |
| `netlify/assistant/gemini.ts` | só `handle.ts` | não |
| `netlify/assistant/handle.ts` | só `ask.mts` e testes do grupo | não |
| `netlify/assistant/limiter.ts` | só `ask.mts` | não |
| `netlify/assistant/prompt.ts` | só `handle.ts`, `ask.mts` | não |
| `netlify/assistant/region.ts` | só `handle.ts` | não |
| `netlify/assistant/validate.ts` | `handle.ts`, `prompt.ts`, `src/services/ask.ts`, `scripts/askEvals.cases.ts` (todos do grupo) | não |
| `netlify/functions/ask.mts` | ninguém (é a Function da Netlify) | não |
| `netlify/assistant/context.json` | arquivo gerado e ignorado pelo git; apagar localmente | não |
| `scripts/askEvals.cases.ts` | só os testes `askEvals.*` | não |
| `src/services/ask.ts` | só `terminal/extras/ask.tsx` | não |
| Testes: `netlify/assistant/handle.test.ts` (32), `limiter.test.ts` (9), `scripts/askEvals.cases.test.ts` (5), `scripts/askEvals.live.test.ts` (18 pulados), `scripts/assistantContext.test.ts` (8), `src/services/ask.test.ts` (15), `src/terminal/extras/ask.test.tsx` (17) | n/a | n/a |

### Precisa ser desacoplado antes (B)
| Arquivo | Quem importa ou referencia | O que fazer antes |
| --- | --- | --- |
| `scripts/assistantContext.ts` (+ `assistantContextPlugin`) | **`vite.config.ts`** (import e lista de plugins) | tirar o plugin e o import do `vite.config.ts`; sem isso o build e o Vitest quebram |
| `src/terminal/extras/ask.tsx` | **`src/terminal/extras/index.ts`** (comando `pergunte` na lista `extraCommands`) | tirar `pergunte` do índice; o terminal (MVP) continua com os outros comandos |
| script `ask:eval` | `package.json` | remover a linha |
| bloco `[functions] included_files` e o comentário do assistente | `netlify.toml` | remover; **manter `directory = "netlify/functions"` só até a spec 008**, que remove as Functions `personal-books` e `personal-films` e então o bloco `[functions]` inteiro (correção de 2026-11-15, conteúdo curado) |
| `netlify/assistant/context.json` | `.gitignore` (linha de comentário e entrada) | remover a entrada |
| textos de `ask`/`pergunte` em `src/i18n/ui.ts` | `src/terminal/deadCode.test.ts` e leitores | remover as chaves que ficarem sem leitor (o teste de código morto pega o que sobrar) |

### Teste de segredos que o assistente possui: sobrevive em parte (investigação 3)
`netlify/assistant/secrets.test.ts` (4 testes, 1,5 s) está **dentro** da pasta do assistente e verifica o repositório inteiro. Dois dos quatro são genéricos e precisam sobreviver, movidos e ampliados para a varredura nova (`scripts/secretScan`, TD-011): "nenhum arquivo do repositório tem chave com cara de chave" e "o `dist/` não tem chave". Os outros dois são do assistente e morrem com ele: "o código do navegador nem cita `GEMINI_API_KEY`" e "o `netlify.toml` não define `GEMINI_API_KEY`". **Regra para a tarefa:** o teste genérico novo entra e passa **antes** de `secrets.test.ts` ser apagado.

## G-2 Jogos
Só o Game Center e o campo minado. As páginas do MVP não dependem do jogo em si; dependem de **referências a ele** (rota, paleta, comandos, meta de SEO).

### Sai direto (A)
| Arquivo | Quem importa (fora do grupo) | MVP? |
| --- | --- | --- |
| `src/terminal/games/Minesweeper.tsx` | `pages/GameCenter.tsx`, `terminal/extras/games.tsx` (ambos do grupo) | não |
| `src/terminal/games/bestTimes.ts` | `Minesweeper.tsx`, `GameCenter.tsx`, `dashboard/InteractivePanel.tsx`; **`pages/Workspace.test.tsx`** (teste misto) | só o teste |
| `src/pages/GameCenter.tsx` | `pages/lazyPages.ts`, `src/test/setup.ts` (ver B) | ligação em B |
| `src/terminal/extras/games.tsx` | `terminal/extras/index.ts` (ver B) | ligação em B |
| `src/components/dashboard/InteractivePanel.tsx` | só `PersonaHomeSections.tsx` (que sai/muda em G-4) | home provisória |
| Testes: `terminal/games/Minesweeper.test.tsx` (22, **19 s**, o maior do grupo), `terminal/games/mines.test.ts` (25) | n/a | n/a |

### Precisa ser desacoplado antes (B)
| Arquivo | Quem importa ou referencia | MVP? | O que fazer antes |
| --- | --- | --- | --- |
| `src/terminal/games/mines.ts` | **`src/components/paletteItems.ts`** (`LEVELS`, `LEVEL_NAMES`: itens de jogo na paleta Ctrl+K) | sim (casca/paleta) | tirar o bloco `games` de `paletteItems.ts` |
| rota `jogos` | **`src/data/routes.ts`** (rota `/jogos` e `aliases`), `src/App.tsx` (`case 'jogos'`), `src/pages/lazyPages.ts`, `src/test/setup.ts` (mock do `GameCenter`), `src/data/seo.ts` (meta de `jogos`), `scripts/seoPlugin.ts` (lê as rotas; some sozinho) | sim (roteamento) | tirar a rota da tabela única e as referências; `/jogos` passa a responder 404 (redirecionamento antigo é da spec 010) |
| comandos `jogos`, `minas`, `sair` | `src/terminal/extras/index.ts` | sim (terminal) | tirar os três da lista |
| `.games`, `.game-*` em `src/styles/workspace.css` (linhas 507-565 e 684) | `workspace.css` | sim (CSS compartilhado) | remover as regras; o resto do arquivo fica |
| `Workspace.test.tsx` | importa `bestTimes` | teste misto (T) | remover só os casos de jogo |

## G-3 Trilhas (visita guiada e segredos)
### Sai direto (A)
| Arquivo | Quem importa (fora do grupo) | MVP? |
| --- | --- | --- |
| `src/trails/Tour.tsx` | só `TourHost.tsx` | não |
| `src/trails/TrailProgress.tsx` | `PageNext.tsx`, `Tour.tsx`, `TrailCard.tsx` (todos saem) | não |
| `src/trails/storage.ts` | `TrailProvider.tsx` e testes | não |
| `src/data/trails.ts` | `experiences/explore/ExploreMode.tsx` (G-4) e `data/experiences.test.ts` (T) | só o teste misto |
| `src/utils/visited.ts` | só `PageNext.tsx` | não |
| Testes: `trails/Tour.test.tsx` (14), `TrailCard.test.tsx` (11), `TrailProvider.test.tsx` (19), `gamification.test.tsx` (10, 9 s), `data/trails.test.tsx` (12), `terminal/extras/trilha.test.tsx` (10, 7,8 s) | n/a | n/a |

### Precisa ser desacoplado antes (B)
| Arquivo | Quem importa | MVP? | O que fazer antes |
| --- | --- | --- | --- |
| `src/trails/TrailProvider.tsx` | **`src/App.tsx`** (provider que envolve o site inteiro), **`terminal/TerminalSession.tsx`** (`useTrail`), **`terminal/commands.tsx`** (tipo `TrailValue` e `ctx.trail`) | sim (raiz do app e terminal) | remover o provider do `App.tsx`; tirar `trail` do contexto de comandos |
| `src/trails/events.ts` (`emitTrailEvent`) | **`hooks/useTheme.tsx`**, **`i18n/LanguageContext.tsx`**, `terminal/TerminalSession.tsx` | sim (tema, idioma, terminal) | apagar as 3 chamadas; o comportamento de tema e idioma não muda |
| `src/trails/TourHost.tsx`, `SecretToast.tsx` | **`src/App.tsx`** | sim | remover da árvore do `App.tsx` |
| `src/trails/TrailCard.tsx` | **`pages/Home.tsx`**, `components/notebook/NotebookHome.tsx` | sim (home) | tirar do `Home.tsx` (e do Caderno, ver DQ-001) |
| `src/terminal/extras/trilha.tsx` | `terminal/extras/index.ts` | sim (terminal) | tirar `trilha` do índice |
| `src/components/PageNext.tsx` (+ teste, 19 testes, 4,8 s) | **`components/shell/SiteShell.tsx`** (a casca) e `notebook/NotebookShell.tsx` | sim (casca) | remover a faixa "próximo passo" da casca; depende de persona e de trilha |
| `data/experiences.test.ts` | importa `secrets` de `trails.ts` | teste misto (T) | editar |

## G-4 Personas e contexto por persona
O núcleo: `usePersona`, `personas.ts`, a pergunta de persona, a home por persona, as "experiências" por persona, a lente nos projetos, a ordenação da busca, as rotas `/r/<persona>`.

### Sai direto (A)
| Arquivo | Quem importa (fora do grupo) | MVP? |
| --- | --- | --- |
| `src/experiences/client/SolutionJourney.tsx`, `explore/ExploreMode.tsx`, `professor/AcademicTimeline.tsx`, `recruiter/ProfessionalOverview.tsx`, `tech/ArchitectureExplorer.tsx` | só `dashboard/PersonaHomeSections.tsx` | não |
| `src/data/clientJourney.ts`, `architecture.ts`, `explore.ts` | só as experiências acima e `data/experiences.test.ts` (T) | só o teste misto |
| `src/data/nextActions.ts` (+ teste, 35) | `PageNext.tsx` (G-3) e `data/search.test.ts` (T) | só o teste misto |
| `src/data/projectPerspectives.ts` (+ teste, 6), `src/hooks/usePerspectives.ts` | `ProjectLens.tsx`, `dashboard/FeaturedProjects.tsx` (ver B) | ligação em B |
| `src/components/PersonaPrompt.tsx` (+ teste, 6) | só `pages/Home.tsx` (ver B) | ligação em B |
| `src/components/dashboard/IntentShortcuts.tsx`, `src/data/intents.ts` | `PersonaHomeSections.tsx`; `data/search.test.ts` (T). **Ver DQ-007**: o bloco só muda a ordem por persona; pode ficar sem persona ou sair | home provisória |
| `src/styles/experiences.css` | `src/main.tsx` (uma linha de `import`) | só a linha de import |
| Testes: `experiences/experiences.test.tsx` (8, 8 s), `data/personas.test.ts` (8), `data/personaHome.test.ts` (15), `data/personaRoutes.test.tsx` (5), `hooks/usePersona.test.tsx` (8), `components/PersonaLens.test.tsx` (4), `PersonaPrompt.test.tsx` (6), `pages/HomePersona.test.tsx` (14, 6,7 s), `PersonaFlows.test.tsx` (8), `ProjectLens.test.tsx` (12), `terminal/persona.test.tsx` (12, 7,5 s) | n/a | n/a |

### Precisa ser desacoplado antes (B)
| Arquivo | Quem importa | MVP? | O que fazer antes |
| --- | --- | --- | --- |
| `src/data/personas.ts` | **`data/routes.ts`** (gera as rotas `/r/<persona>` e o campo `Route.persona`), **`App.tsx`**, **`components/shell/Sidebar.tsx`** (`byPersona`, `isPick`), **`paletteItems.ts`**, `searchRanking.ts`, **`terminal/commands.tsx`** (contexto), `dashboard/QuickAccess.tsx` | sim (roteamento, casca, paleta, terminal) | tirar as rotas de persona da tabela única e o campo `persona` do tipo `Route`; `data/seo.ts` e `scripts/seoPlugin.ts` deixam de tratar rota de persona |
| `src/hooks/usePersona.tsx` | **`App.tsx`** (provider e `PersonaHome`), **`CommandPalette.tsx`**, **`Sidebar.tsx`**, **`Home.tsx`**, **`terminal/Terminal.tsx`**, **`terminal/TerminalSession.tsx`**, `dashboard/FeaturedProjects.tsx`, `dashboard/QuickAccess.tsx` | sim | remover o provider e cada `usePersona()`; o comportamento sem persona vira o único |
| `src/terminal/extras/persona.tsx` (`PersonaQuestion`, `visitante`, `personaAnswer`) | **`terminal/Terminal.tsx`**, `terminal/extras/index.ts`, **`terminal/commands.tsx`** (interpretador: resposta da pergunta pendente) | sim (terminal) | tirar a pergunta de persona do terminal e o comando `visitante` |
| `src/data/personaHome.ts` | **`pages/Home.tsx`** (ações e composição), `PageNext.tsx`, `searchRanking.ts` | sim (home) | extrair a composição **padrão** (`DEFAULT_HOME`) para um arquivo próprio que não cite persona; a home provisória usa só ela (DQ-007) |
| `src/components/dashboard/PersonaHomeSections.tsx` | **`pages/Home.tsx`** | sim (home) | virar uma montagem fixa dos blocos padrão; os blocos filhos (`ProfileSummary`, `StackOverview`, `AcademicSnapshot`, `ServicesPreview`, `FeaturedProjects`, `QuickAccess`, `GithubStats`, `PersonalSpace`) **não** são de persona e ficam |
| `src/components/ProjectLens.tsx` | **`sections/portfolio/ProjectCard.tsx`** (página de projetos do MVP) e `dashboard/FeaturedProjects.tsx` | sim (projetos) | tirar o `<ProjectLens>` do `ProjectCard`: a página de projetos mostra o card sem a lente |
| `src/data/searchRanking.ts` | **`paletteItems.ts`** (`boostOf`: ordem da busca por persona), `data/search.test.ts` (T) | sim (paleta) | remover o favorecimento por persona de `filterItems`; a busca continua |
| `route.persona` em `data/seo.ts` e `scripts/seoPlugin.ts` | `data/seo.ts` (canonical `/`, `noindex`), `scripts/seoPlugin.ts` (filtro do sitemap) e `data/seo.test.ts` (7 linhas) | sim (SEO) | remover os ramos de persona |
| `src/test/setup.ts` | grava `portfolio-persona-asked` em todo teste | sim (todos os testes) | remover a linha |
| `.persona-*` em `src/styles/workspace.css` (a partir da linha 738) | `workspace.css` | sim | remover as regras |
| textos `persona`, `tour`, `trail` em `src/i18n/ui.ts` | leitores removidos | sim | remover as chaves sem leitor |

### Testes mistos (T): editar, nunca pular
`src/data/experiences.test.ts` (importa trails, architecture, clientJourney, explore; **mantém** os casos de `experienceGroups`), `src/data/personalDiscovery.test.tsx` (44 linhas citam persona; **mantém** o que prova o espaço cultural), `src/data/search.test.ts` (28 linhas; **mantém** a busca sem persona), `src/components/SearchDiscovery.test.tsx` (10), `src/pages/Workspace.test.tsx` (13), `src/data/seo.test.ts` (7), `src/components/Overlays.test.tsx` (2), `src/terminal/extras/extras.test.tsx` (1), `src/components/shell/SiteShell.test.tsx` (1). Esses 9 arquivos têm cerca de 130 blocos `it()` (contagem por `grep`; a exata, com os `it.each` expandidos, sai na tarefa) e a maior parte **fica**; só os casos de código removido saem, listados um a um na tarefa. A lista de casos é feita por cada onda, porque só o `typecheck` e a execução mostram o que quebrou.

## G-5 O Caderno depende dos grupos acima (decisão da Duda, DQ-001)
O Caderno (`CADERNO_V2`, desligado por padrão; commit `9145f2b`, cuja mensagem diz que a spec 002 o substitui) importa o que sai: `notebook/ChapterHeader.tsx`, `EpigraphBand.tsx`, `LensChips.tsx`, `Sommaire.tsx` (`usePersona`), `LensChips.tsx` e `data/notebook/chapters.ts`, `epigraphs.ts` (`personas.ts`), `NotebookHome.tsx` (`TrailCard`), `NotebookShell.tsx` (`PageNext`), e `notebook.test.tsx` (52 testes, 8 s) e `r1.test.tsx` (26 testes) testam persona. Sem decisão, a remoção dos grupos acima quebra o Caderno e a suíte dele.
- **Opção 1 (recomendada): remover o Caderno na 001**, junto com `src/config.ts`, `shellProps.ts`, `nb.ts`, `notebook.css`, a ramificação `CADERNO_V2` de `Home.tsx`, `SiteShell.tsx`, `App.tsx`, `main.tsx`, `SectionPage.tsx`, `CaseStudy.tsx`, `NotFound.tsx`, `PersonalHub.tsx`. O histórico guarda tudo (`9145f2b`). Menos edição, 78 testes e 11 s a menos.
- **Opção 2: desacoplar o Caderno** (editar 8 arquivos e 2 testes para ele não citar persona e trilha) e deixá-lo para a 002 apagar. Mais trabalho para código que a própria mensagem do commit diz que será substituído.

## O que **não** entra na lista, de propósito
- Páginas e dados do MVP e do que a 003 migra: projetos, casos de estudo, currículo, acadêmico, contato, experiências, habilidades, `/pessoal` (livros, filmes, música, teatro; **as páginas ficam**, e `netlify/personal/`, `netlify/functions/personal-*.mts`, `scripts/personalGuard.ts`, `scripts/hardcoverProbe.*` e `scripts/importLetterboxd.mjs` **permanecem nesta spec e saem ou mudam de lugar na spec 008**, ver "Correção de 2026-11-15" no fim), terminal (exceto `pergunte`, `visitante`, `trilha`, `jogos`, `minas`, `sair`), casca, tema claro e escuro.
- Páginas que o plano não manda tirar: `sobre`, `habilidades`, `servicos`, `github`, `agora`, `setup`. Se algum deles estiver fora do MVP novo, é decisão da 002/003, não daqui ("na dúvida, não está no escopo").
- Comandos de personalidade do terminal que não são jogo nem IA: `neofetch`, `gitlog`, `stats`, `fortune`, `cow`, `matrix`, `boot`, `rm`. Continuam.
- Os 3 temas extras (002).

## Ordem de remoção proposta (uma onda por vez, com a trava do FR-006)
1. **Pré-condição:** estar na branch `rebuild/sdd` com a árvore limpa; o histórico já guarda o Caderno (`9145f2b`).
2. **Onda 1, assistente (G-1):** o teste genérico de segredos entra primeiro; depois desacopla (`vite.config.ts`, `extras/index.ts`, `package.json`, `netlify.toml`, `.gitignore`) e apaga. Gate: `npx tsc --noEmit`, `npx vite build` e `npx vitest run` passam.
3. **Onda 2, jogos (G-2).** Mesmo gate.
4. **Onda 3, trilhas (G-3).** Mesmo gate.
5. **Onda 4, personas (G-4)** e, se a DQ-001 for a opção 1, o Caderno junto. É a maior: mexe em `routes.ts`, `App.tsx`, `Home.tsx`, `Sidebar.tsx`, `Terminal*.tsx`, `commands.tsx`, `paletteItems.ts`, `seo.ts`. Mesmo gate.
6. **Limpeza:** chaves de `ui.ts` sem leitor, CSS sem uso, `src/test/setup.ts`. Gate: `deadCode.test.ts` passa.
**O gate de cada onda inclui a varredura V-06 estendida** (`design.md`, Verification Strategy) também a `e2e/`, `public/`, `README.md`, `docs/` e `index.html`, para que redirecionamentos, sitemap e links de `/r/<persona>` e `/jogos` não sobrem fora de `src/`. Cada onda termina com o bloco de evidência (Claim, Command, Exit code, Summary, Verdict) e é um commit. Nenhuma onda pula teste: o que falha é corrigido ou removido pelo critério do FR-006, listado no commit.

## Correção de 2026-11-15: `/pessoal` vira conteúdo curado (rascunho, aguarda aprovação da Duda)
Decisão da Duda: Letterboxd, Hardcover e Spotify são preenchidos **manualmente**, sem API, token, cache de servidor nem Function. Detalhes e perguntas respondidas em `.ai/sdd/PROPOSTA-pessoal-conteudo-curado.md`. **Dono da remoção: a spec 008** (Q-P5), que remove o código de API e reescreve as páginas no mesmo conjunto de tarefas, para o `/pessoal` nunca ficar quebrado.

O que isso muda **para a 001**:
- **Continuam nesta spec como "permanece":** `netlify/personal/`, `netlify/functions/personal-*.mts`, `scripts/personalGuard.ts`, `scripts/hardcoverProbe.*`, `scripts/importLetterboxd.mjs`, `src/services/integrations/*`, `src/hooks/usePersonal.ts` e as variáveis de API do `.env.example`. Nenhuma onda da 001 os toca. A 008 os remove ou os move.
- **`@netlify/blobs` fica em `package.json` depois da onda 1.** A onda 1 apaga `ask.mts` e `limiter.ts` (outros dois usos), mas `personal-books.mts` e `personal-films.mts` ainda o usam. A 008 o remove com as Functions.
- **`netlify.toml`:** a onda 1 remove só `included_files` e o comentário do assistente. O bloco `[functions]` (diretório) sai com a 008.
- **Painel do Netlify:** `GEMINI_API_KEY` e `GEMINI_MODEL` seguem como ação da Duda depois da onda 1. As variáveis `HARDCOVER_*`, `TMDB_API_KEY`, `PERSONAL_*` ficam para depois da 008.
- **Importador de CSV (Q-P1 e Q-P14):** permanece, mudando para `scripts/` e gerando o `*.content.ts`; o `--tmdb` e o `tmdb.ts` saem (Q-P2). Tudo isso é da 008.
- **Caderno e G-1 a G-4** não mudam.

## Aprovação do Anexo B (2026-11-15)
A Duda respondeu "aprovado" ao item "aprovar o design da 001 e o Anexo B (a lista do que será removido)". **A lista, incluindo a correção de `/pessoal` curado acima, está aprovada pela Duda.** Isso **não autoriza remover nada ainda**: nenhuma remoção acontece antes de `tasks:approved` e de eu restatar os requisitos ("Confirm before building"). A DQ-001 (remover o Caderno na 001) e as ondas G-1 a G-4 seguem como descritas.

## Correção da ordem das ondas (2026-11-15, DQ-014 respondida pela Duda)
A Duda decidiu **apagar o Caderno antes da onda 3** (trilhas). Nova ordem: **onda 1** assistente (G-1) → **onda 2** jogos (G-2) → **onda 2b** Caderno (G-5, DQ-001) → **onda 3** trilhas (G-3) → **onda 4** personas (G-4) → limpeza. Efeito: a onda 3 não precisa mais de uma "edição mínima" no Caderno. Os gates de onda, o V-06 estendido e "um commit por onda" não mudam. A lista de arquivos aprovada é a mesma; só a ordem mudou.
