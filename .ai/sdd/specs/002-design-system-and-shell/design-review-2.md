# 002 Design system and shell, 2ª revisão do design (v2.1)
**Revisor:** Claude, contexto novo, somente leitura · **Data:** 2026-11-17 · **Alvo:** `design.md` v2.1 (`design:draft`) contra `requirements.md` v1.6, `spike-001.md`, `design-review.md` (com a resposta do autor), steering, `AGENTS.md` e o código atual.
**Método:** leitura e `grep`/`git grep`. Não rodei vitest, `verify`, build nem navegador. Comportamentos de Vite, Netlify e React são avaliação técnica, não medição; digo onde não tenho certeza.

## Resumo
A v2.1 resolveu a maior parte da 1ª revisão: a cobertura de testes cresceu, as contradições de texto (DQ-002, `bare`, `enPath`) foram corrigidas, o `SiteShell` sobe para o `App` (conferi: são exatamente 10 arquivos que chamam `<SiteShell>`), e o TD-025 nomeia o que sai do 1º acesso. Os problemas que restam são de três tipos: (a) mudanças novas que o código atual não sustenta como escritas (flag `PROVA` sem prefixo `VITE_`, paleta que "navega ao terminal com o comando", `?cmd=` que só executa comandos de página, `draft` extraído mas sem dono de leitura); (b) mecânica de build ainda subespecificada (recursão do build aninhado, `.prerender`/`dist-prova` fora do `.prettierignore` e do `eslint`, testes de HTML dentro do vitest que roda antes do build); (c) restos de texto velho (DQ-011 contradiz DQ-019). Nenhum bloqueia a aprovação, mas oito itens Importantes devem ser corrigidos no texto antes de `design:approved`.

---

## 1. Os achados da 1ª revisão foram resolvidos?

| ID | Estado | Prova no design (ou o que falta) |
| --- | --- | --- |
| C-01 | Resolvido | V-08 (design.md:297) inclui `LanguageSwitch.test.tsx`, `href`/`hreflang`, `aria-current`, gravação só no clique. |
| C-02 | Parcialmente | V-14 inclui `DecorativeStripe.test.tsx`. Falta V-01 exigir `--deco-1..5` nos dois temas (V-01, linha 290, não os cita) e o Mapping de FR-038 apontar V-01. |
| C-03 | Parcialmente | V-07 (linha 296) mede o botão em 1023 e 1024 px; o Mapping de FR-013 (linha 31) ainda diz só V-06 e a coluna "Cobre" de V-07 não lista FR-013. Ver R2-12. |
| C-04 | Resolvido | V-07: `boundingBox` ≥ 44×44 (TD-010 e linha 296). |
| C-05 | Resolvido | V-01 (linha 290): `transition`/`animation` neutralizadas dentro de `prefers-reduced-motion`. |
| C-06 | Resolvido no texto | V-09 (linha 298) confere script de boot antes do CSS. Mas o teste que leria o HTML não tem como rodar no vitest (ver R2-05). |
| C-07 | Parcialmente | V-07 agora testa 360, 1023, 1024, 1920 (linha 296 e Edge Cases linha 207). Continua faltando o texto de 80 caracteres sem espaço no conteúdo da `/_prova` (Interface Contract, linha 185, não o inclui), então o caso cita V-07 sem ser exercido. |
| C-08 | Resolvido | V-11 (linha 300): ≤ 4 arquivos de fonte e `<link rel="preload">`; TD-016 pré-carrega os 3. |
| K-01 | Resolvido | DQ-002 (linha 360) diz "fixa no topo". |
| K-02 | Parcialmente | A seção de divergências (linha 325) agora diz que o Terminal foi lido, mas o campo "Entrada" (linha 3) continua listando só `Tokens`, `Mobile`, `NotFound`, `Projetos`. |
| K-03 | Resolvido | TD-006 (linha 219) lista `bare`. |
| K-04 | Resolvido | Data Model (linha 141): "é `/en` ou começa com `/en/`". |
| K-05 | Parcialmente | TD-009 lista as 3 diferenças e a tabela de arquivos (linha 321) põe `dist-prova/` e `.prerender/` no `.gitignore`. Falta `.prettierignore` e `ignores` do eslint (R2-06). |
| K-06 | Sem ação | Era consistente; confirmo. |
| S-01 | Parcialmente | TD-025 (linha 284) nomeia (a) `TerminalProvider`, (b) `draft`, (c) eventos, (d) medição. Faltam os leitores de `draft` e a viabilidade de (c) (R2-03, R2-04). |
| S-02 | Parcialmente | `SHOW_OUTPUT` e `openShortcuts` têm destino, mas a solução da paleta não funciona com o código atual (R2-03). |
| S-03 | Resolvido | Linhas 318-321 listam `main.tsx`, `App.tsx`, `router.tsx`, provedores, `seo.ts`, testes, `.gitignore`, `package.json`, `playwright.config.ts`. Ressalva menor: testes de página que assumem a casca (`Workspace.test.tsx`, `DocPages.test.tsx`, `InfoPages.test.tsx`, `personalRoutes.test.tsx`) não são citados; cobertos genericamente por R-003. |
| S-04 | Resolvido | "Nada é gravado ao montar" (linha 163) e casos em V-03 e V-08. |
| S-05 | Resolvido | TD-011 remove `data-theme="dark"` fixo e põe dois `theme-color` por `media`. |
| S-06 | Resolvido | Data Model (linha 152) e TD-006: `title`/`desc` migram de `pageMeta`, `seo.ts` lê da tabela. Falta teste que garanta que `pageMeta` deixou de ter textos próprios (FR-009; ver R2-12). |
| T-01 | Parcialmente | TD-008 dá a mecânica (build SSR programático em `closeBundle`, `build.manifest`, `prerender` de `react-dom/static`, 4 critérios para T0). Restam recursão do build aninhado, `copyPublicDir`, limpeza de `.prerender` e `dist/.vite` (R2-07). |
| T-02 | Resolvido | DQ-018 e Interface Contract (linha 176): `SiteShell` no `App`, fora do `Suspense`. Conferi que são 10 chamadores reais. Ressalva R2-10 (props `after`/`badge`/`variant` do terminal). |
| T-03 | Resolvido, com ressalva | `src/boot/boot.ts` único (TD-011) e `data-shell="bare"` (TD-012). Viabilidade em R2-14. |
| T-04 | Parcialmente | Ordem das regras, 404 sem `hreflang`/canonical e `dist/en.html` resolvidos; falta `/en/` com barra final (R2-08). |
| T-05 | Resolvido | TD-019: `--lang=en` mais `Accept-Language`, `scripts/serveDist.mjs`, nota de conservadorismo do `vite preview`. |
| T-06 | Resolvido | TD-008 e R-002: hidratação com `lazy` provada por e2e sobre `dist-prova`. |
| T-07 | Resolvido | TD-016 pré-carrega a Mono (3 de 4 arquivos) e cita `size-adjust`. |
| P-01 | Resolvido | DQ-017 e TD-025(b); "Confirm before building" (linha 378) abre a exceção só para o cálculo de `draft`. |
| P-02 | Parcialmente | `title`/`desc` do caso saem de `pageMeta`; o `enPath` do caso está marcado como proposta. Mas `home`, `terminal` e `github` também não têm alias em inglês e não são citados (R2-09). |
| P-03 | Resolvido, com resíduo | DQ-019 e Data Model (linha 154) decidem o menu; DQ-011 (linha 365) ficou com o texto velho (R2-01). |
| P-04 | Resolvido | Linha 189: textos de interface em `src/i18n/ui.ts`, PT e EN. |
| P-05 | Resolvido | TD-020: lista declarada, teste de existência em `dependencies`/`devDependencies`, versão instalada. Ver R2-13 sobre V-14. |
| Lacuna 1 | Resolvido | Linha 190 e Edge Cases (linha 211): botão no HTML, CSS o esconde sem `js`. |
| Lacuna 2 | Resolvido | Linha 190 e TD-013: `useDocumentMeta` atualiza `lang`, título, descrição, `hreflang`. |
| Lacuna 3 | Resolvido | TD-013 e TD-014: 404 e `/_prova` sem `hreflang`/canonical. |
| Lacuna 4 | Resolvido | Linha 134: `dist/en.html`, `dist/index.html`. Pendente a validação no deploy (R2-08). |
| Lacuna 5 | Resolvido, com ressalva | TD-025(c): paleta fora da rota `bare`. Efeito colateral em R2-10. |
| Lacuna 6 | Resolvido | Linha 321: `.gitignore`, `package.json`, `playwright.config.ts`, `scripts/serveDist.mjs`. |

IDs conferidos: TD-001 a TD-025, V-01 a V-15, R-001 a R-011, DQ-001 a DQ-019 e as referências cruzadas existem e apontam para o que dizem (as únicas referências defasadas estão em R2-13). Os IDs de FR/NFR do Mapping batem com o requirements v1.6.

---

## 2. Achados novos

### Importante

**R2-01 · Importante · DQ-011 contradiz DQ-019 e o Data Model.** design.md:365 termina com "As rotas de projetos, currículo e contato só viram `menu: true` quando as specs 005 e 007 chegarem (US-001)". O Data Model (linha 154) e DQ-019 (linha 373) dizem o contrário: já entram como `menu: true` na 002. Quem lê só as perguntas entende o oposto. Correção: reescrever o fim da DQ-011 para "entram já na 002 (DQ-019); as specs 005 e 007 só trocam a página".

**R2-02 · Importante · TD-009: a flag `PROVA` não chega ao cliente e `PROVA=1 vite build` não roda no PowerShell.**
- TD-009 (linha 228) manda ler a flag "como em `mode.ts`" (`import.meta.env?.X ?? process.env.X`). Em `src/services/integrations/mode.ts:11-13` isso funciona porque a variável é `VITE_PERSONAL_SOURCE`: o Vite só expõe ao cliente variáveis com prefixo `VITE_`. A flag está nomeada `PROVA` (sem prefixo; também no Executive Summary, linha 10): no bundle do cliente `import.meta.env.PROVA` é `undefined` e `process` não existe, então a tabela de rotas do cliente não teria `/_prova` enquanto o HTML pré-renderizado (Node) teria: rota desconhecida na hidratação e falso 404. Correção: nomear `VITE_PROVA`, ou passar a flag por `define` no config (`mode` do callback `defineConfig`), ou por opção do plugin.
- O `package.json` `build:prova` seria "`PROVA=1 vite build`", sintaxe que não funciona em PowerShell/cmd. A convenção do projeto (conventions.md, "Comando de verificação") é runner Node sem shell, igual em PowerShell, Git Bash e Linux. Correção: `node scripts/buildProva.mjs` (define a variável no `env` do processo filho) ou `vite build --mode prova`.

**R2-03 · Importante · TD-025(c): a paleta "navega ao terminal com o comando", mas `?cmd=` só executa comandos de página.** A paleta roda `session.execute(item.run)` (`CommandPalette.tsx:63`); os `run` são `cd <dir>`, `cd projetos/<id>` e nomes de comandos (`src/components/paletteItems.ts:54,111,169`). O tratador de `?cmd=` em `src/terminal/TerminalSession.tsx:272-281` só executa se o 1º termo for `command` de uma rota (`routes.some((r) => r.command === first)`); `cd ...`, `ajuda`, `stats` etc. são ignorados e o `navigate` limpa a URL. Também `terminalUrl(route, command)` (`routes.ts:361`) recebe uma `Route`, não texto livre. Resultado: com o design como está, quase todas as escolhas do tipo `run` na paleta levam ao terminal sem executar nada. Correção: o design decidir (a) estender o tratador de `?cmd=` (terminal é da 009: pedir OK, ou fazer só o mínimo e registrar), ou (b) a paleta da 002 oferecer só destinos de página (`to`) e adiar os itens de comando para a 009. Aproveitar para dizer que o provedor movido para o chunk do terminal perde o histórico de comandos ao sair de `/terminal`.

**R2-04 · Importante · TD-025(b): `draft` sai de `routes.ts`, mas ninguém é nomeado como leitor.** `draft` é lido hoje em `src/data/seo.ts:300` (noindex), `src/components/personal/HubIndex.tsx:64`, `scripts/seoPlugin.ts` (sitemap, `r.draft`) e `routes.ts:366` (`isListed`, com `showInNav`). O design diz que o cálculo vai "para um módulo próprio, fora do 1º acesso", mas `seo.ts` e `useDocumentMeta` rodam no 1º acesso (noindex em `headTags`); se importarem o módulo novo, `now.ts`, `uses.ts` e `data/personal/*` voltam ao chunk de entrada e o ganho some. Correção: dizer (i) o nome e o conteúdo do módulo novo, (ii) quem o importa, (iii) que o cliente não precisa de `draft` na 1ª pintura (o `noindex` já vem no HTML pré-renderizado; no cliente `useDocumentMeta` só atualiza título/descrição), ou que `draft`/`showInNav` viram um campo calculado no build e gravado, sem import de conteúdo. Incluir `routes.test.ts`, `personalRoutes.test.tsx` e `personalDiscovery.test.tsx` na lista de testes ajustados (eles leem `draft`/`showInNav`).

**R2-05 · Importante · Testes sobre HTML gerado (V-09, parte de V-11) não têm como rodar onde estão.** `scripts/verify.mjs:16-21` roda `vitest run` **antes** de `vite build`; portanto `scripts/prerender.test.ts` não pode ler `dist/`. Para checar "`<main>`, `<h1>`, `lang`, `hreflang` recíproco, script de boot antes do CSS e síncrono" (V-09) e "`<link rel="preload">` da fonte crítica" (V-11), o teste precisa gerar o HTML por conta própria. Há duas saídas viáveis e o design não escolhe: (a) o teste importa `renderRoute` e o montador de `<head>` (o projeto `unit` roda em Node, sem o `setup.ts` que troca `lazyPages`, então `lazy` funciona de verdade; custo dentro do orçamento de 90 s a medir: ~2 × N rotas) e o plugin expõe a função que monta o documento, para o teste olhar o mesmo código; ou (b) as checagens viram um passo do próprio plugin (falha o `vite build`, como já está dito para `<main>` e `<h1>`). Correção: escolher e escrever; sem isso V-09 e C-06 ficam sem prova.

**R2-06 · Importante · `dist-prova/` e `.prerender/` quebrariam o `verify` seguinte.** A 1ª etapa do `verify` é `prettier --check .` e a 2ª `eslint .`. `.prettierignore` (hoje: `dist`, `node_modules`, `docs`, `.ai`, `*.md`, `public`…) e `eslint.config.*` (`ignores: ['dist', 'docs', …]`) não listam `dist-prova` nem `.prerender`; o design só os acrescenta ao `.gitignore` (linha 321). Depois de um `build:prova` ou de um build interrompido, os HTML e o JS gerado seriam verificados (e reprovariam). Correção: acrescentar `dist-prova`, `.prerender` ao `.prettierignore` e ao `ignores` do eslint na lista de arquivos ajustados, e o TD-008 mandar o plugin apagar `.prerender/` ao terminar (sucesso ou falha). Também `build.manifest: true` grava `dist/.vite/manifest.json` dentro do diretório publicado; dizer se o plugin o apaga.

**R2-07 · Importante · TD-008: o build SSR aninhado pode recursar e copiar `public/`.** `build({ build: { ssr: ... } })` chamado de `closeBundle` carrega, por padrão, o mesmo `vite.config.ts`, que instancia de novo `seoPlugin` (e `personalGuard`, `contentGuard`, `secretGuard`): o `closeBundle` do build aninhado dispararia outro build, em laço. O design não diz como evitar (guarda por `config.build.ssr`, `configFile: false` com plugins explícitos, ou `ssr` só no `closeBundle` do build do cliente). Também: `copyPublicDir: false` no build do servidor (senão `public/` e as fontes vão para `.prerender/`), `emptyOutDir`, e que `define: { __BUILD__ }` e o `react()` precisam estar no build aninhado. T0 já é o spike certo; acrescentar estes três pontos aos "4 critérios" (viram 5 ou 6) e a regra "o plugin do servidor nunca instancia o plugin de pré-render". A afirmação "uma etapa só no `vite build`" é viável, não a considero inviável.

**R2-08 · Importante · `/en/` (com barra final) e a home EN em `dist/en.html` não estão cobertos.** O requirements fala em "EN sob `/en/`" (D-005, linhas 151, 166, 277); o design escolhe `dist/en.html` e trata `/en` e `/en/...` (TD-007, Data Model). Um visitante ou link que use `/en/` (o que o requirements escreve) cai, na Netlify, na regra `/en/*` → `dist/en/404.html` com status 404, porque `dist/en/index.html` não existe; não confirmo o comportamento do "pretty URLs" da Netlify para `/en` quando existem `en.html` e a pasta `en/` (não medi; o R-008 só cita a regra de 404). O roteador do cliente também precisa de `normalizePath('/en/')` → `/en`. Correção: (a) acrescentar a `netlify.toml` uma regra `/en/` → `/en` (301) **antes** das regras de 404, ou gerar também `dist/en/index.html`; (b) ampliar o R-008 e a V-10 para incluir `/en` e `/en/`; (c) caso de teste de `normalizePath` e de `languageOffer` com `/en/`.

### Menor

**R2-09 · Menor · `enPath` de `home`, `terminal` e `github` não vêm de alias nenhum.** O design (linha 152) diz que os `enPath` "saem dos `aliases` atuais" e só marca o do `whatsapp-dispatcher` como proposta. Em `routes.ts` só `home` (`/`, e `/en` é do requirements), `terminal` (`TERMINAL_PATH`), `github` e o caso de estudo não têm alias em inglês. Os endereços `/en/terminal` e `/en/github` seriam decisão nova. Não é dado sobre a Duda, mas é endereço público inventado: listá-los na DQ-016 como propostas, como já foi feito para o caso. O status da DQ-016 também está dúbio: o design a marca "respondida" (linha 370) e a "Resposta do autor" em `design-review.md` a chama "aberta, da Duda"; "Confirm before building" (linha 379) trata o `enPath` como a confirmar. Dizer só uma coisa.

**R2-10 · Menor · O que acontece com o conteúdo do terminal que dependia de `SiteShell`.** `TerminalPage.tsx:17-23` passa `variant="terminal"`, `badge={c.hero.tag}` e `after={<CommandCatalog …/>}`; os três "saem" (linha 176), e o `bare` só tem faixa e `main`. O design não diz onde vai o `CommandCatalog` (dentro do `main`? é da 009?). Também: `GlobalOverlays` está na lista "Ficam" (linha 322), mas TD-025(c) manda não montar a paleta na rota `bare` e a tela atual diz que Ctrl+K funciona "dentro da linha de comando do próprio terminal" (`GlobalOverlays.tsx:3-4,18-21`). Tirar a paleta do terminal muda o teclado do terminal (spec 009) sem pergunta; e `src/data/shortcuts.ts:15` ainda lista "/ foca a barra de comandos" (a barra sai). Correção: registrar o destino do catálogo, a mudança em `GlobalOverlays` e a atualização de `shortcuts.ts` (e do teste que o cobre); perguntar se a paleta fica ou não no terminal.

**R2-11 · Menor · R-001 cobre o JS, não o CSS de 20 KB.** `src/main.tsx:6-17` importa todos os CSS (inclui `terminal.css`, `personal.css`, `resume.css`, `sections.css`) no 1º acesso; TD-017 mantém o bloco `/* LEGADO */` e acrescenta `@font-face`, tokens e a casca. O SPIKE mediu 16,1 KB (gzip) com folga de ~3,9 KB. Acrescentar um risco R-012 para o CSS (ou dizer que o CSS de página sai do 1º acesso) com o mesmo "se não couber, volta para a Duda".

**R2-12 · Menor · Mapping e "Cobre" não foram atualizados com os testes novos.** FR-005 aponta só V-03 (o teste de ordem do `<head>` é V-09); FR-013 só V-06 (a prova de ponto de quebra é V-07); FR-038 só V-14 (os tokens `--deco-*` não estão em V-01); FR-009 não tem teste de que `seo.ts` deixou de ter textos próprios (por exemplo, afirmar que `pageMeta` não existe mais ou que cada título vem de `routeById`). Correção: ajustar as linhas do Mapping e as colunas "Cobre" de V-01, V-07, V-09.

**R2-13 · Menor · Referências e números defasados.**
- Executive Summary, decisão 5 (linha 11): "O terminal e `src/data` saem do 1º acesso (TD-008, TD-019)" deveria citar TD-025.
- TD-019 (linha 266): frase iniciada em minúscula ("ver TD-025 … o terminal …") e ainda afirma que o terminal e `src/data` saem "do chunk de entrada" sem o ressalva de R2-04.
- V-14 (linha 303): "elenco = versões maiores do `package.json`", mas TD-020 (linha 269) usa a versão **instalada** (`node_modules/<nome>/package.json`). Alinhar.
- Linha 3 "Entrada": falta `Terminal` (K-02).
- TD-020 cita "valores … confirmados pela Duda em 2026-11-17"; o que está no repositório é o README de referência (`design-reference/README.md:28`). Citar onde a confirmação está registrada.

**R2-14 · Menor · TD-011 (boot serializado por `Function.prototype.toString`): viável, mas faltam duas regras.**
- Só vale se cada função serializada for **autocontida**: não pode referenciar constantes ou funções do módulo (por exemplo, a lista `['light','dark']`, ou `languageOffer` chamando `resolveTheme`). O design diz "sem helpers do esbuild", mas não proíbe referências a outras declarações do módulo, que o `toString` não leva. Dizer: constantes dentro da função, ou `bootSource()` concatena declarações explícitas e o teste `vm` falha se alguma identidade ficar livre.
- O teste `vm` deve rodar também sem cobertura instrumentada (o `vite.config.ts` não define `coverage`, então hoje é seguro) e o `bootSource()` não deve entrar no bundle do cliente (tree-shaking cobre se só o plugin o chama; um teste de `measureBundle` pega).
- `unit` roda em Node: `boot.test.ts` (`.test.ts`) é correto; `useTheme.test.tsx` e `LanguageOffer.test.tsx` (`.test.tsx`) vão para `dom`. OK.

**R2-15 · Menor · Comandos de aceite que dependem de `grep` ou que provam pouco.**
- V-09: `grep -c "<h1" dist/projetos.html dist/en/projects.html` sai com 0 se **qualquer** dos arquivos casar; não prova que os dois têm `<h1>`. Usar `grep -L "<h1" …` (sem saída) ou verificar no passo do plugin (R2-05). Depende também de `/en/projects` ser o `enPath` de projetos (confirmado pelo alias atual `/projects`).
- V-12 usa `grep -r` em `dist`; no PowerShell (o shell principal deste projeto) `grep` não existe. A convenção do projeto é "runner Node sem shell"; trocar por um teste ou `node -e` (`dist` está no `.gitignore`, então `git grep` não serve).
- V-07 e V-13 ficam fora do `verify` (dito no design); FR-016 é "Must" e o teste que o prova só roda em `npm run prova`. Aceitável, mas dizer na evidência de cada tarefa que ele foi rodado. O `playwright.config.ts` atual tem um único `webServer` (`vite` dev, porta 5199); o design cita `scripts/serveDist.mjs` mas não diz como o e2e escolhe o servidor por arquivo (dois `projects`/`webServer`s ou `baseURL` por spec).

**R2-16 · Menor · Dependências de sequência e testes que o design não nomeia.** Os testes `useTheme.test.tsx`, `Menu.test.tsx`, `LanguageSwitch.test.tsx`, `DecorativeStripe.test.tsx`, `scripts/assets.test.ts`, `scripts/prerender.test.ts`, `scripts/headers.test.ts`, `src/boot/boot.test.ts`, `src/data/suggestRoutes.test.ts`, `src/styles/state.test.ts`, `e2e/shell.e2e.ts` e `src/content/schema/route.test.ts` não existem hoje; a tabela "Arquivos que esta spec remove ou substitui" só trata dos que saem. Para a spec de tarefas, listar os arquivos novos (a próxima etapa vai precisar).

---

## 3. Viabilidade das mudanças novas (resumo)

| Mudança | Veredito | Justificativa |
| --- | --- | --- |
| TD-008 (pré-render dentro do `vite build`) | Viável, subespecificado | Build SSR aninhado em `closeBundle`, `build.manifest` e `prerender` de `react-dom/static` (React ^19.1, Node ≥ 20.19, Netlify Node 22) existem. Faltam recursão, `copyPublicDir`, limpeza, flag `VITE_PROVA`, e onde roda o teste de HTML (R2-02, R2-05 a R2-07). `routes.ts` já é importável no config (hoje `seoPlugin` o faz). |
| TD-011 (`boot.ts` sem imports + `toString`) | Viável, com regras | Funções autocontidas e teste `vm` (R2-14). |
| TD-018 (SiteShell no `App`) | Viável | Os 10 chamadores conferem: `DocPage`, `EditorialPage`, `CaseStudy`, `GithubPage`, `Home`, `InfoPages`, `NotFound`, `SectionPage`, `Services`, `TerminalPage`. `Terminal.tsx` só cita `SiteShell` em comentário. `NotFound` usa `missingPath` (sem rota, o `App` já passa `route` indefinido); `TerminalPage` usa `variant`, `badge`, `after` (R2-10). `renderApp` em `src/test/helpers.tsx` já renderiza `App`, então os testes se ajustam por consulta, não por montagem. |
| TD-025(a) `TerminalProvider` fora do 1º acesso | Viável, mais simples do que o texto sugere | Quem usa a sessão: `TerminalSession`, `Terminal`, `CommandInput`, `outputs`, `pageIndex`, `TerminalOutput`, `useTerminal`, `RunButton` (só `CommandCatalog`, que é da página do terminal), `CommandPalette` (lazy). O ponto difícil é a paleta (R2-03). |
| TD-025(b) extrair `draft` | Subespecificado | R2-04. |
| TD-025(c) remover `SHOW_OUTPUT`/`openShortcuts` | Viável; `Sidebar` e `CommandBar` são os únicos ouvintes/chamadores restantes (`Header` usa `openPalette`, que fica) | Mas a substituição pela paleta não funciona (R2-03) e `shortcuts.ts` fica defasado (R2-10). |

## 4. Steering, AGENTS.md e escopo
- **Spec 008:** respeitada. Só `routes.ts` perde as importações de conteúdo; o design diz que `data/personal`, `integrations/mode`, `netlify/personal/`, `[functions]` e `.env.example` não mudam. A ressalva é R2-04: os testes `personalRoutes.test.tsx` e `personalDiscovery.test.tsx` leem `draft`/`showInNav`; ajustá-los é parte da exceção e deve estar dita.
- **Dado inventado:** o `enPath` `/en/case-studies/whatsapp-dispatcher` está marcado como proposta (ok); `/en/terminal` e `/en/github` não estão (R2-09). `title`/`desc` migram sem reescrita (ok). "Belo Horizonte, MG" e "Duda" vêm do README de referência (R2-13).
- **Texto fixo em componente:** não encontrei; os textos novos ficam em `ui.ts` e `credits.content.ts` (linhas 189 e 269).
- **Segredo:** nenhum; o EmailJS não é tocado.
- **Git:** o design não manda `push`, merge nem mexe em `main`; `src.zip` intacto.
- **Princípio 2 (conteúdo sem JavaScript) e 4 (orçamento):** atendidos pela estrutura; a prova depende de R2-05 e R2-11.

---

## Veredito: **PASS COM RESSALVAS**

A v2.1 fecha a maioria dos achados da 1ª revisão (dos 38 itens, incluindo as 6 lacunas: 27 resolvidos, 10 parcialmente, 0 não resolvidos e 1 sem ação). Os problemas novos são de especificação, não de arquitetura. Recomendo corrigir R2-01 a R2-08 no texto antes de promover `design:approved` (R2-02, R2-03 e R2-04 mudam o que as tarefas vão construir; R2-05 a R2-07 definem como T0 será julgado). O restante cabe no ajuste de tarefas.

| Severidade | Quantidade | IDs |
| --- | --- | --- |
| Bloqueia | 0 | |
| Importante | 8 | R2-01 a R2-08 |
| Menor | 8 | R2-09 a R2-16 |

Contagem da seção 1 (IDs da 1ª revisão): resolvido 27, parcialmente 10 (C-02, C-03, C-07, K-02, K-05, S-01, S-02, T-01, T-04, P-02), não resolvido 0, sem ação 1 (K-06).


---

## Resposta do autor do design (2026-11-17, design v2.2)
Os 8 achados Importantes e os Menores foram tratados no `design.md` v2.2, com as respostas da Duda a DQ-020 (paleta só com destinos de página) e DQ-021 (`/en/` redireciona 301 para `/en`):
- **R2-01:** DQ-011 reescrita; as rotas atuais já entram como `menu: true`.
- **R2-02:** a flag deixa de ser variável de ambiente: `vite build --mode prova`, com `__PROVA__` (cliente) e opção do plugin (Node); roda igual em PowerShell.
- **R2-03 e R2-10:** a paleta só oferece destinos de página até a 009; `shortcuts.ts`, `GlobalOverlays` e o destino do `CommandCatalog` registrados no TD-025.
- **R2-04:** `src/data/routeStatus.ts` nomeado, com quem o importa; `seo.ts` dividido; testes ajustados listados.
- **R2-05:** os testes de HTML gerado rodam no projeto `unit` importando `renderRoute`; o que depende do `dist` é `scripts/checkDist.mjs`.
- **R2-06 e R2-07:** `.prettierignore`, `eslint` e `.gitignore` com `dist-prova` e `.prerender`; build aninhado com `configFile: false`, plugins explícitos, `copyPublicDir: false` e limpeza; critérios do T0 passaram a 6.
- **R2-08:** regra 301 de `/en/` para `/en`, `normalizePath` e testes.
- **R2-09:** os `enPath` de `/en`, `/en/terminal`, `/en/github` e do estudo de caso estão marcados como propostas; DQ-016 com um só status.
- **R2-11 a R2-16:** risco R-012 (CSS), Mapping e "Cobre" atualizados, referências corrigidas, regra do boot autocontido, `grep` trocado por `checkDist.mjs`, lista de arquivos novos.
