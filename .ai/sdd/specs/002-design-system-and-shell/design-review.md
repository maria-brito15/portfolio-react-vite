# 002 Design system and shell, revisão do design (v2.0)
**Revisor:** Claude, contexto novo, somente leitura · **Data:** 2026-11-17 · **Alvo:** `design.md` v2.0 (`design:draft`) contra `requirements.md` v1.6, `spike-001.md`, `design-reference/*`, steering, `AGENTS.md` e o código atual.
**Método:** leitura dos arquivos e `grep`. Não rodei vitest, `verify` nem build. Os comportamentos de Vite/Netlify/React citados abaixo são avaliação técnica, não medição; onde não tenho certeza, digo.

## Resumo
A cobertura FR/NFR é completa na tabela de mapeamento (FR-001 a FR-041 e NFR-001 a NFR-003 têm TD e V). Os problemas não estão em requisito sem casa, e sim em: (a) texto velho que contradiz decisão já tomada pela Duda, (b) verificações que não provam o que dizem ou cujo comando não funciona como escrito, (c) a mecânica do pré-render e do orçamento de 100 KB, que está subespecificada e esbarra em fatos do código atual, (d) arquivos afetados que a lista de remoção não cita.

---

## 1. Cobertura (FR/NFR, TD, V)

**C-01 · Importante · FR-021 e FR-022 sem teste.** Mapping (design.md:39-40) aponta V-08, mas o comando de V-08 (design.md:285) roda só `languageOffer.test.ts` e `LanguageOffer.test.tsx`. Nada testa o seletor PT|EN (link para o equivalente da mesma página; gravação de `portfolio-lang` ao escolher). Correção: acrescentar a V-08 o teste do seletor (por exemplo, dentro de `SiteShell.test.tsx` ou `LanguageSwitch.test.tsx`), com: href igual ao `enPath`/`path` da rota atual, `aria-current`, gravação no clique, e **nenhuma gravação na montagem** (ver S-04).

**C-02 · Importante · FR-038 (faixa decorativa) sem teste na V-14.** O texto de V-14 diz "faixa `aria-hidden` com 5 cores e sem texto", mas nenhum dos quatro arquivos do comando (`Footer.test`, `NotFound.test`, `suggestRoutes.test`, `state.test`) testa a faixa. Também não há teste de que `--deco-1..5` existem nos dois temas. Correção: citar `SiteShell.test.tsx` (ou `DecorativeStripe.test.tsx`) em V-14 e fazer o teste de tokens (V-01) exigir `--deco-1..5` em claro e escuro.

**C-03 · Importante · FR-013 não é verificável como escrito.** V-06 roda em jsdom e `vite.config.ts:20` põe `css: false`; o ponto de quebra de 1024 px é CSS, então o teste de unidade não prova "abaixo do ponto de quebra a navegação fica atrás de um botão". V-07 (que poderia provar) não lista FR-013 (design.md:284, mapping linha 32 só V-06). Correção: V-07 cobrir FR-013 (em 1023 px o botão aparece e os itens ficam fechados; em 1024 px os itens aparecem e o botão some).

**C-04 · Importante · NFR-003, "alvos de toque do menu ≥ 44×44 px", sem verificação.** TD-004 e TD-010 afirmam, mas nenhum V mede. Correção: V-07 medir `boundingBox` do botão do menu e dos itens (< 1024 px).

**C-05 · Menor · FR-018 (movimento reduzido).** V-01 só confere que "existe `prefers-reduced-motion`" (design.md:278). Isso não prova que as animações/transições não essenciais param. Correção: o teste varrer `transition`/`animation` do CSS e exigir que cada uma esteja anulada dentro do bloco `prefers-reduced-motion: reduce` (ou use `--dur-*` zerado ali).

**C-06 · Menor · FR-005 (tema antes do 1º desenho).** V-03 testa a função de boot (unidade). Não prova que o script está no `<head>` antes do CSS e síncrono. Correção: no teste do HTML gerado (V-09 ou `prerender.test.ts`), conferir que o `<script>` inline do tema precede qualquer `<link rel="stylesheet">` e o `#root`.

**C-07 · Menor · FR-012, larguras e caso extremo.** V-07 só testa 360 e 1920 px (design.md:284), mas a quebra do cabeçalho é em 1024 px e o requirement diz "de 360 a 1920". O caso "80 caracteres sem espaço" (Edge Cases, design.md:199) cita V-07, mas a `/_prova` não contém esse texto. Correção: testar também 768, 1023 e 1024 px e acrescentar à prova um título longo/sem espaço (conteúdo de teste, marcado como exemplo).

**C-08 · Menor · NFR-001, "≤ 4 arquivos de fonte na 1ª pintura, fonte crítica pré-carregada".** V-11 verifica ≤ 2 famílias, `swap` e `/fonts/`; ninguém conta os arquivos pedidos na 1ª pintura nem o `preload`. V-13 não menciona. Correção: o e2e da V-11 contar requisições `font` (≤ 4) e V-09 checar o `<link rel="preload" as="font">` no HTML.

---

## 2. Contradições internas e IDs

**K-01 · Importante · DQ-002 diz "faixa de idioma fixa embaixo".** design.md:344 afirma "faixa de idioma fixa embaixo, só no cliente". TD-012 (design.md:229), a linha 1 da tabela de divergências (design.md:312) e DQ-012 (design.md:350) dizem que é **fixa no topo**, e a opção "fixa embaixo" foi descartada pela Duda. Quem lê só a lista de perguntas entende o contrário do que a Duda aprovou. Correção: reescrever a DQ-002 para "faixa fixa no topo, com espaço reservado (DQ-012, DQ-015)".

**K-02 · Importante · "Não li o Terminal" contradiz TD-024.** design.md:309 lista `Terminal` entre as telas **não lidas**, mas TD-024 (design.md:272), a linha 13 da tabela (design.md:324) e o requirements v1.6 descrevem o mockup do terminal ("sem cabeçalho, menu nem rodapé; 'Sair do terminal' primeiro"). Conferi `mockup/Terminal.dc.html:24,59` e a descrição está certa. Correção: atualizar a frase da linha 309 e o campo "Entrada" (design.md:3) para incluir `Terminal`.

**K-03 · Menor · TD-006 e Data Model divergem sobre os campos novos.** TD-006 (design.md:211) lista `enPath, title, menu, order, prova`; o Data Model (design.md:149) e TD-024 acrescentam `bare`. Correção: acrescentar `bare` ao TD-006.

**K-04 · Menor · Regra de `enPath` contraditória.** Data Model (design.md:141): "começa com `/en/` (a home EN é `/en`)". `/en` não começa com `/en/`. Correção: "é `/en` ou começa com `/en/`" e ajustar a mensagem de erro do teste.

**K-05 · Menor · TD-009 "só a flag" não é literal.** O build de prova usa outro `outDir` (`dist-prova/`) e inclui `noindex`; o teste "falha se divergirem além da flag" precisa listar essas exceções. Além disso `.gitignore` só ignora `dist` (linha 2); falta `dist-prova`. Correção: citar as exceções no TD-009 e acrescentar `dist-prova` ao `.gitignore` na tarefa.

**K-06 · Menor · Números.** Verifiquei: 1024 px aparece em TD-010, mapping (linha 31) e divergência 11, e "768" só como estimativa dentro do TD-010 (consistente). 100 KB aparece em todo o design; o "90 KB" só vive em `spike-001.md` (histórico, anterior à decisão). Não há inconsistência numérica no design. IDs R-001 a R-011, TD-001 a TD-024 e V-01 a V-15 estão completos e todos referenciados; DQ-009 e DQ-006 só existem agrupadas (design.md:346), sem definição própria: aceitável, mas citar a pergunta.

---

## 3. Afirmações sobre o código existente

Conferidas e **corretas:** os 4 cabeçalhos já em `netlify.toml:21-27` (`for = "/*"`); o comentário sobre `.html` sem barra final (`netlify.toml:16-18`); `seo.ts:10` diz "NÃO há hreflang"; JSON-LD já escapa `<` (`scripts/seoPlugin.ts:36`); `index.html:22-31` define tema e `lang` por `localStorage`; `__BUILD__` por `define` em `vite.config.ts:12`; Sidebar, CommandBar, Window, Taskbar, Breadcrumb e `windowGeometry` só são importados por `SiteShell` (ou entre si); `windowManager` também em `App.tsx:24`; `ViewActions` usado por `terminal/outputs.tsx:9`; `contrast.test.ts` existe; `public/fonts/jetbrains-mono-*.woff2` (2 arquivos) existem; os atributos `badge`, `variant`, `after`, `missingPath` existem em `SiteShell.tsx:15-20`.

**S-01 · Importante · "O terminal e `src/data` saem do 1º acesso" não é sustentado pelo código que fica.** (TD-019, design.md:257)
- `src/App.tsx:3,23-24,66-77` importa `TerminalProvider` de forma estática e embrulha **toda** página; o design não diz que isso muda. `GlobalOverlays`/`CommandPalette` ficam (design.md:306), e `CommandPalette.tsx:17` usa a sessão do terminal; `RunButton.tsx:7,20` também.
- `src/data/routes.ts:14-19` importa `personalMode`, `integrated`, `musicHasContent`, `theaterHasContent`, `now` e `uses` para decidir `draft`. Ou seja, "a tabela de rotas" na casca arrasta conteúdo (`now.ts`, `uses.ts`, `data/personal/*`) e a integração `services/integrations/mode` (território da spec 008). 43 arquivos importam `routes.ts`.
- Sem desfazer isso, o orçamento de 100 KB (R-001) é uma torcida, não uma decisão. Correção: o design dizer (a) onde mora o `TerminalProvider` (dentro do chunk do terminal; páginas que usam `RunButton` degradam sem o provider ou o carregam lazy), (b) que `routes.ts` perde as importações de conteúdo (o `draft` passa a ser calculado em outro módulo ou dado), com a nota de que isso encosta na 008 e precisa de OK. Pergunta para a Duda se mexer em `routes.ts`/`mode` aqui é aceitável.

**S-02 · Importante · Remoção do `CommandBar` deixa evento sem ouvinte.** `commandBarEvents.ts:8,14` define `SHOW_OUTPUT`; só `CommandBar.tsx:84` o ouve; `CommandPalette.tsx:63` o dispara depois de rodar um comando. Com a barra removida, a saída de comandos rodados pela paleta some em silêncio. `Header.tsx:5` (botão `>_`) e `Sidebar.tsx:6` (`openShortcuts`) também somem. Correção: o design registrar o destino de `SHOW_OUTPUT`/`openShortcuts` (remover do `commandBarEvents.ts` e ajustar `CommandPalette`, ou deixar a decisão explícita para a 009) e se a paleta (Ctrl+K) continua montada na rota `bare`.

**S-03 · Importante · Lista de arquivos afetados incompleta (FR-032).** A tabela (design.md:296-306) omite arquivos que a mudança obriga a editar: `src/main.tsx` (hoje `createRoot` e importa `shell.css`/`workspace.css`, linhas 6-15), `src/App.tsx`, `src/router.tsx` (lê `window` no inicializador, linhas 44-55), `src/i18n/LanguageContext.tsx`, `src/hooks/useTheme.tsx`, `src/data/seo.ts` (comentário e `pageMeta`), `scripts/seoPlugin.test.ts`, `src/data/seo.test.ts`, `src/data/legacyHashes.test.tsx`, `src/App.test.tsx:88,98` (afirma `portfolio-lang` e `portfolio-theme` gravados), e `src/styles/contrast.test.ts:64` (teste "cada tema extra tem bloco próprio"). Correção: acrescentar uma linha "ajustados" na tabela.

**S-04 · Importante · Os provedores atuais gravam o armazenamento na montagem.** `LanguageContext.tsx:29-35` grava `portfolio-lang` em todo efeito (inclusive o `pt` padrão), e `useTheme.tsx:23-29` grava `portfolio-theme` em todo efeito. Se o código novo herdar isso, a 1ª visita grava "escolha" sem o visitante escolher: apaga a faixa de inglês (FR-025/FR-035) e congela o tema do sistema (FR-003/FR-004). O design diz "só grava a escolha manual" (TD-011, TD-007), mas nenhum V testa a ausência de gravação. Correção: acrescentar caso de teste em V-03 e V-08 ("montar sem clicar não grava").

**S-05 · Importante · `index.html:2` tem `data-theme="dark"` fixo e `index.html:6` tem `theme-color` fixo.** TD-011 diz que o CSS `:root:not([data-theme])` cobre quem desliga o JavaScript (FR-003 sem JS), mas o template já nasce com `data-theme="dark"`, então esse ramo nunca vale; sem JS o visitante vê sempre o escuro. O design não manda remover o atributo nem cita `theme-color` (que precisa de duas variantes por `media`). Correção: TD-011 mandar remover `data-theme` do template (o HTML pré-renderizado sai sem ele) e tratar o `theme-color`.

**S-06 · Menor · TD-006 diz que `title` é novo, mas já existe em `seo.ts`.** `seo.ts:275` (`pageMeta`) já guarda título e descrição por rota e idioma (nos dois idiomas) e `routes.ts` já tem `desc`/`label`. O design cria `Route.title` sem dizer o que acontece com `pageMeta` (duas fontes, violando FR-009 "título lê da tabela"). Veja também P-02.

---

## 4. Riscos técnicos

**T-01 · Importante · TD-008, mecânica do pré-render subespecificada (talvez inviável como escrita).**
- Hoje o HTML por rota sai em `closeBundle` (`scripts/seoPlugin.ts:80-103`), que roda **depois** do bundle do cliente e no contexto do config (Node puro). O `entry-server.tsx` tem JSX, imports de CSS, `React.lazy` com `import()` e `__BUILD__`; não roda ali sem uma segunda passagem do Vite (`build.ssr` ou `ssrLoadModule`). O design diz "dois bundles no build" (design.md:132) mas não diz como são produzidos nem em que ordem.
- `scripts/verify.mjs:16-21` roda a etapa de geração como `vite build` fixo, e `package.json` `build` é `tsc --noEmit && vite build`. Se o SSR precisar de um segundo comando, o `verify` não o executa (a verificação passaria sem pré-render). A solução precisa viver **dentro** do `vite build` (plugin que dispara o build SSR programático) ou mudar o runner (spec 001, fora do escopo).
- `modulepreload` "lido do manifesto" exige `build.manifest: true`; não citado. Para Node, o `react-dom/static` expõe `prerenderToNodeStream` além de `prerender` (Web Streams); o design não escolhe qual.
- `import.meta.env.MODE` para decidir `prova` (TD-009) quebra no contexto do config (onde `seoPlugin` importa `routes.ts`): `src/services/integrations/mode.ts:5-11` já resolve esse mesmo problema com `import.meta.env?.X ?? process.env.X`. Correção: o design citar essa técnica ou passar `prova` como opção do plugin.
- Correção geral: T0 já é o spike certo; o design deve declarar, como critério de T0, as 4 respostas acima (como roda o SSR dentro de `vite build`, manifesto, API de `react-dom/static`, `routes.ts` no config), e que, se não fechar dentro do `vite build`, volta para a Duda.

**T-02 · Importante · A casca fica dentro das páginas lazy.** Cada página renderiza o próprio `SiteShell` (`DocPage.tsx:22`, `EditorialPage.tsx:31`, `CaseStudy.tsx:14`, `Home.tsx:26`, `SectionPage.tsx:29`, `NotFound.tsx:16`, `TerminalPage.tsx:17` etc.), e `App.tsx:66-77` põe todas dentro de `<Suspense fallback={null}>` com `React.lazy` (`lazyPages.ts`). Consequências com o Interface Contract atual (design.md:170, `SiteShell({ routeId?, children })`): (a) a cada navegação para um chunk ainda não carregado, a casca inteira some (fallback `null`) e volta; (b) o menu, o seletor de tema e a faixa de idioma perdem estado (FR-014 "devolver o foco ao botão", faixa remontada); (c) na hidratação, a casca só fica interativa depois do chunk da rota (INP e o modo "gaveta" dependem disso); (d) `languageOffer` roda de novo a cada rota. Correção: o design mover o `SiteShell` para o `App` (fora do `Suspense`, escolhendo a variante `bare` pelo `routeId` da URL) e as páginas deixarem de embrulhar a si mesmas. Isso muda o "ajuste mecânico" prometido às páginas (design.md:170): precisa de OK.

**T-03 · Importante · TD-012 M1, script de boot que reserva o espaço da faixa.**
- O boot é gerado de "uma única função TypeScript" (TD-011), agora precisa também calcular `languageOffer`. O boot inline é serializado (`Function.toString` ou equivalente) e **não pode importar** `languageOffer.ts`; se for copiado, volta o "teste que confere duas listas copiadas" que o design acabou de eliminar. Também o nome `scripts/themeBoot.ts` já não descreve o arquivo. Correção: decidir como o código é compartilhado (um único módulo auto-contido, sem imports, que o teste e o plugin importam; cuidado com helpers que o esbuild injeta na serialização) e testar a equivalência do boot com `languageOffer` nas 9 linhas da tabela de idioma.
- O boot precisa saber se a rota é `bare` (FR-041: sem faixa), e o HTML da 404 serve em caminhos arbitrários (`/xyz`), onde o `path` do navegador não é o da rota. O design não diz como o boot recebe essa informação (atributo `data-` gravado no build?).
- Falha parcial: se o JS principal falhar depois do boot, o espaço fica em branco para sempre (o design registra "pode ficar em branco por instantes"). Aceitável, mas dizer que a faixa não pode depender de hidratação completa para aparecer (ela monta depois da hidratação, que depende do chunk da rota: ver T-02).
- A reserva de espaço desloca o conteúdo desde o 1º desenho, o que é coerente com FR-035 (nada se move depois), mas o FR-035 diz "não desloca o conteúdo da página": registrar na spec/DQ que a interpretação é "não desloca depois do desenho". Já está dito no TD-012; falta ecoar em V-13 (medir CLS **e** que o 1º desenho já tem o espaço).

**T-04 · Importante · TD-014, 404 por idioma.**
- As duas regras `[[redirects]]` (`/en/*` → `/en/404.html`, `/*` → `/404.html`, `status = 404`) seguem o padrão documentado de 404 por idioma da Netlify, e a ordem importa (a de `/en/*` primeiro); o design não registra a ordem. A regra `/*` é redundante com o comportamento padrão de servir `404.html`. Não confirmo o comportamento sem deploy (o design já diz: R-008).
- O HTML estático `dist/404.html` é servido em qualquer URL; o cliente hidrata com `path = /xyz`. A página renderizada no servidor tem de ser idêntica ao cliente (inclusive `aria-current` do menu e `suggestRoutes`); TD-022 cuida das sugestões, mas nada diz que o `<link rel=canonical>`/`hreflang` da 404 não deve apontar para uma "página equivalente" inexistente. Correção: dizer que a 404 não emite `hreflang`/canonical.
- Layout dos arquivos: `dist/en/<caminho>.html` para a home EN (`/en`) vira `en.html` ou `en/index.html`? Com `en/` existindo como pasta, `/en` pode redirecionar para `/en/` na Netlify (URLs bonitas) e quebrar o `hreflang`/canonical. Correção: fixar o arquivo da home EN e o canonical (com ou sem barra).

**T-05 · Importante · TD-019 / V-13, instrumentação.**
- "Lighthouse com `navigator.languages = ['en']`" (design.md:253): o Lighthouse não permite definir `navigator.languages` por opção simples; seria preciso `--chrome-flags="--lang=en"` ou um script de página. Especificar.
- `vite preview` serve sem compressão; o tamanho em gzip é medido por script (bom), mas LCP em laboratório mede arquivos sem compressão, pior que a Netlify. Dizer que isso é conservador.
- O `playwright.config.ts:17-22` sobe `vite` (dev) em 5199 com `testMatch: '*.e2e.ts'`; V-07/V-11 pedem `dist-prova`. A tarefa precisa de um servidor estático que imite a Netlify (`/_prova` → `_prova.html`, 404 por idioma). Não sei se `vite preview` resolve `.html` sem extensão em modo SPA; sem isso, V-07/V-11 podem testar o `index.html` sem pré-render e dar falso positivo. Correção: nomear o servidor do teste e testar nele o 404 por idioma.

**T-06 · Menor · R-002, o teste de hidratação não cobre o `lazy`.** `src/test/setup.ts:10-11` troca `lazyPages` por imports diretos nos testes; um "teste que falha em aviso de hidratação" no jsdom não exercita o caminho real (chunk ainda não carregado durante `hydrateRoot`). Correção: a prova de hidratação com `lazy` é o e2e sobre `dist-prova` (console sem erro de hidratação), não o vitest.

**T-07 · Menor · TD-016, Mono sob demanda.** Contei no mockup 250 declarações `font-family` em Plex Mono contra ~34 em Sans (cabeçalho, datas e etiquetas são Mono). Carregar a Mono depois da 1ª pintura provoca troca de fonte visível no menu/rodapé, e `swap` sem ajuste de métricas da fonte reserva (`size-adjust`) pode piorar o CLS. O design já manda medir; acrescentar a fonte reserva com métricas ajustadas ou pré-carregar a Mono (4 arquivos continuam dentro do teto do NFR-001).

---

## 5. Steering, AGENTS.md e escopo

**P-01 · Importante (pergunta) · Escopo da spec 008.** TD-019 exige que `routes.ts` deixe de importar `now`, `uses`, `data/personal/*` e `services/integrations/mode` para a casca ficar leve (S-01). Isso toca arquivos que o "Confirm before building" (design.md:358) lista como intocáveis da 008 (`services/integrations`, `data/personal`). Pelo princípio 9 ("na dúvida não está no escopo"), parar e perguntar. Pergunta para a Duda: posso extrair o cálculo de `draft` para fora de `routes.ts` sem alterar o conteúdo nem o comportamento da 008?

**P-02 · Importante · Texto novo que o design não diz de onde vem (princípio 7, "nada de dado inventado").** TD-006 exige `title` e `desc` obrigatórios e `enPath` para toda rota. Hoje a rota `whatsapp-dispatcher` (última de `routes.ts`) não tem `desc` nem alias EN, e `/estudos-de-caso/...` não tem equivalente inglês. As demais podem reaproveitar `pageMeta` de `seo.ts` e os `aliases` atuais (`/about` etc.). Correção: o design dizer que `title`/`desc` migram de `seo.ts` (sem reescrever) e que os `enPath` vêm dos `aliases` atuais, e perguntar à Duda o `enPath`, o título e a descrição do estudo de caso.

**P-03 · Importante (pergunta) · Composição do menu na 002.** DQ-011 lista 5 itens (Projetos, Currículo, Acadêmico, Contato, Pessoal), mas US-001 e DQ-011 dizem que projetos, currículo e contato só viram `menu: true` quando as specs 005/007 chegarem, e `pessoal` está `draft: personalMode === 'mock'` em `routes.ts`. Resultado: na entrega da 002 o menu real teria Acadêmico e talvez nenhum item; FR-016 ("itens do menu na ordem da tabela"), FR-039 ("até 3 rotas reais do menu") e a regra de 2 interações ficam testando quase nada fora da `/_prova`. Pergunta para a Duda: na 002 as rotas existentes (`projetos`, `curriculo`, `contato`, `pessoal`) entram como `menu: true` já (apontando para as páginas atuais), ou o menu fica reduzido até as specs 005/007? O design deve registrar a resposta no TD-006.

**P-04 · Menor · Strings de interface no design.** "Read this page in English", "Dispensar", "Alternar tema" aparecem no texto do design; devem ir para `src/i18n/ui.ts` com PT e EN (paridade). Não é violação (é um design), mas o TD-012 e o Interface Contract deveriam dizer que ficam em `ui.ts`.

**P-05 · Menor · TD-020, "elenco".** O FR-037 pede fonte "derivada do projeto". O design lê a **versão maior** do `package.json`, mas a **lista de nomes** (`react`, `vite`, `typescript`) é escrita à mão em `credits.content.ts`. Isso pode divergir do que o site usa (por exemplo, trocar o framework e esquecer a lista). Além disso, as versões em `package.json` são faixas (`^19.1.0`, `^6.0.3`); definir se vale a faixa ou a versão instalada. Correção: dizer que a lista de nomes é um subconjunto declarado (com teste de que cada nome existe nas `dependencies`/`devDependencies`) ou derivá-la de uma lista de `dependencies` marcadas.

Sem violação encontrada de: segredo no cliente (EmailJS só no envio, intocado), `src.zip` (não citado para edição), push/merge na `main` (design proíbe), CSP (TD-015 decide com motivo e adia para a 010), `localStorage` para decidir idioma (rejeitado no TD-007).

---

## 6. Lacunas (sem requisito novo)
1. Quem monta a faixa de idioma na hidratação e como o seletor funciona antes da hidratação (links reais: ok) quando o menu em tela estreita é "gaveta" só com a classe `js`: não está dito se o botão do menu existe no HTML pré-renderizado ou só depois da montagem (risco de divergência de hidratação). Dizer que o botão está no HTML e o CSS o esconde sem a classe `js`.
2. Atualização do `lang`, `<title>`, descrição e `hreflang` na navegação **do cliente** (PT para EN sem recarregar): TD-013 só cobre o HTML estático; `useDocumentMeta` (já existe) precisa ler `enPath`/`hreflang`. Citar o hook.
3. `hreflang` e canonical da `/_prova` e da 404 (não há equivalente): dizer que não emitem.
4. Layout de arquivo da home EN e do PT `index.html` (ver T-04).
5. Como o comando `tema` do terminal convive com a casca `bare` (TD-024 já adia para a 009: ok) e se a paleta (Ctrl+K) continua na rota `bare`.
6. Ajuste de `.gitignore`, `package.json` (`build:prova`, `prova`) e das duas `devDependencies` (DQ-010) estão implícitos; listar na tarefa.

---

## Veredito: **PASS COM RESSALVAS**

A cobertura de requisitos é completa e as decisões estão, em sua maioria, bem justificadas. Não há achado que invalide o design, mas **não recomendo promover a `design:approved` antes de corrigir K-01, K-02 (texto que contradiz decisões da Duda) e de resolver, no próprio design, T-01 e T-02 (mecânica do pré-render e posição do `SiteShell`) e S-01/P-01 (o que sai do 1º acesso e se isso toca a 008)**, porque dessas depende o orçamento de 100 KB e o escopo.

| Severidade | Quantidade | IDs |
| --- | --- | --- |
| Bloqueia | 0 | |
| Importante | 19 | C-01 a C-04, K-01, K-02, S-01 a S-05, T-01 a T-05, P-01 a P-03 |
| Menor | 13 | C-05 a C-08, K-03 a K-06, S-06, T-06, T-07, P-04, P-05 |


---

## Resposta do autor do design (2026-11-17, design v2.1)
Todos os achados foram tratados no `design.md` v2.1, com as respostas da Duda a P-01 a P-03:
- **Cobertura (C-01 a C-08):** V-01, V-03, V-07, V-08, V-09, V-11 e V-14 ganharam os testes que faltavam (seletor de idioma, faixa decorativa, ponto de quebra e alvo de 44 px no e2e, movimento reduzido, ordem do boot no `<head>`, contagem e preload das fontes).
- **Contradições (K-01 a K-05):** DQ-002 corrigida; a nota sobre o Terminal corrigida; `enPath` aceita `/en`; TD-009 diz que mudam a flag, o `outDir` e o `noindex`.
- **Código existente (S-01 a S-06):** TD-025 novo (o que sai do 1º acesso, `SHOW_OUTPUT`/`openShortcuts`); lista de arquivos ajustados completa; "nada é gravado ao montar"; `data-theme` fixo e `theme-color` tratados no TD-011; `title`/`desc` migram de `seo.ts`.
- **Riscos (T-01 a T-07):** mecânica do pré-render dentro do `vite build` e 4 critérios para o T0 (TD-008); `SiteShell` sobe para o `App` (DQ-018); boot de fonte única em `src/boot/boot.ts` (TD-011) e `data-shell` para `bare` (TD-012); redirects em ordem e home EN em `dist/en.html` (TD-014); servidor de teste e idioma do Lighthouse (TD-019); prova de hidratação com `lazy` por e2e; Mono pré-carregada (TD-016).
- **Escopo (P-01 a P-05):** DQ-017 (extrair `draft` de `routes.ts`, autorizado), DQ-019 (menu com as rotas atuais), DQ-016 (texto do estudo de caso: **aberta, da Duda**), strings em `ui.ts`, elenco com lista declarada e versão instalada.
- **Lacunas 1 a 6:** todas registradas (botão do menu no HTML, `useDocumentMeta`, sem `hreflang` na 404 e na `/_prova`, layout da home EN, paleta fora da rota `bare`, arquivos de configuração).
Não foi aplicado: nada além de K-06 (que já era consistente).
