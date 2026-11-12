# Workspace: painel, barra lateral, Game Center e descoberta

Reorganização de UX/IA de 12/11/2026: o site deixa de ser "um terminal com páginas" e vira um **workspace pessoal** (portfólio + painel + jogos + terminal). Grupo de requisitos **WS-xx**.

Fluxo: auditoria do código → arquitetura da informação → implementação → verificação. A spec formal (PRD) saiu do pedido da Duda; este arquivo registra decisões e o estado.

## Auditoria (o que já existia)

| Área | Achado |
| --- | --- |
| Rotas | `/sobre`, `/habilidades`, `/projetos`, `/experiencias`, `/contato`, `/curriculo`, `/academico`, `/servicos`, `/agora`, `/setup` (rascunho), estudo de caso; aliases em inglês; `/#sobre` etc. redirecionam (SH-10) |
| Home | Só o terminal numa Window; nenhum link para páginas, jogos ou GitHub fora do terminal |
| Comandos | ajuda, sobre, ls, cd, proximo, anterior, projetos, habilidades, experiencias, curriculo, academico, servicos, contato, tema, idioma, historico, inicio, limpar, atalhos, agora, setup, neofetch, evolucao/git, stats, fortune, jogos, minas, sair) + ocultos |
| Easter eggs | `sudo`, `rm`, `cowsay`, `matrix`, `boot`, `pwd`, `echo`, `data`, `sair`: **ocultos de propósito** e mantidos assim |
| Jogos | Um só: Campo Minado (fácil 9×9/10, médio 16×16/40, difícil 30×16/99), recorde por nível em `localStorage` (`portfolio-minas-best`); só abria por `minas`/`jogos` |
| Inventário, conquistas, colecionáveis | **Não existem**; nada foi inventado |
| GitHub | Números ao vivo (repos, estrelas, contribuições, seguidores, linguagens, último push) com cache de 1 h; painel só na página Sobre e no comando `stats`. Não há dado do gráfico de contribuições |
| Janelas | Arrastar, maximizar, recolher e barra de tarefas só em tela larga com mouse; fixas no celular |
| Persistência | `localStorage`: tema, idioma, recorde do jogo, marca do boot; `sessionStorage`: histórico do terminal |

## Requisitos

| ID | Requisito | Estado |
| --- | --- | --- |
| WS-01 | A home (`/`) é um painel: apresentação, foco atual (de `data/now.ts`), acesso rápido, projetos em destaque, resumo do GitHub, área interativa. Sem Window | ✅ `src/pages/Home.tsx`, `src/components/dashboard/*` |
| WS-02 | O terminal ganha página própria `/terminal`, com a documentação dos comandos abaixo da janela. `/?cmd=…` antigo redireciona para `/terminal?cmd=…`; "ver no terminal" aponta para lá | ✅ `TerminalPage`, `TerminalSession` |
| WS-03 | Barra lateral persistente, agrupada (Workspace · Portfólio · Interativo · Desenvolvimento · Pessoal), montada de `routes.ts` (`group`); grupos recolhíveis; item ativo com `aria-current`; rascunhos não aparecem | ✅ `Sidebar.tsx` |
| WS-04 | Em tela estreita (≤ 960 px) a barra vira gaveta aberta pelo botão `☰` do header; Esc e navegar a fecham; alvos de toque de 44 px | ✅ |
| WS-05 | Header compacto: logo, busca global (abre a paleta, `Ctrl K`), seletor dos cinco temas, idioma | ✅ `Header.tsx` |
| WS-06 | Paleta unificada e agrupada: páginas, projetos (e estudo de caso), jogos, habilidades, comandos; relevância (igual › começa › palavra › contém); estado vazio com sugestões; destinos diretos (`to`) ou o mesmo `cd`/comando do terminal (`run`) | ✅ `paletteItems.ts`, `CommandPalette.tsx` |
| WS-07 | Game Center `/jogos`: Campo Minado com os três níveis, melhor tempo real por nível, botão Jogar (mesmo componente `Minesweeper`, carregado sob demanda), como jogar, e "experiências no terminal" | ✅ `GameCenter.tsx` |
| WS-08 | Catálogo de comandos por categoria; cada botão roda o comando na sessão existente (`RunButton`); comando com argumento obrigatório só é documentado; ocultos continuam ocultos | ✅ `terminal/catalog.ts`, `CommandCatalog.tsx` |
| WS-09 | Página `/github`: painel completo ao vivo + repositórios dos projetos que têm repositório público. A home mostra só o resumo | ✅ `GithubPage.tsx`, `GithubStats summary` |
| WS-10 | Rodapé com contato e links profissionais | ✅ `Footer.tsx` |
| WS-11 | PT/EN em tudo que é novo (`src/i18n/ws.ts`); sem número, recorde ou texto inventado | ✅ |
| WS-12 | Rotas e redirecionamentos antigos preservados; `/jogos`, `/terminal`, `/github` entram em `seo.ts` e no sitemap | ✅ |
| WS-13 | Sem aviso geral de "feito para computador": o site é feito para celular. Limitação de desktop é dita no contexto, não em modal na primeira tela | ✅ `MobileNoticeModal` removido; `aviso-mobile` marcada como substituída |
| WS-14 | Teclado completo: Ctrl+K, setas, Enter, Esc, Tab/Shift+Tab, foco visível e foco devolvido ao fechar (paleta, atalhos, gaveta) | ✅ auditoria no navegador (abaixo) + `Workspace.test.tsx` ("gaveta aberta: o foco entra nela…") |
| WS-15 | Contraste WCAG AA medido nos cinco temas, em texto renderizado e em contornos de campos | ✅ `contrast.mjs`, `contrast.test.ts`, varredura no navegador (abaixo) |
| WS-16 | Alvos de toque de 40–44 px nos componentes compartilhados, sem exceção por rota | ✅ `responsive.css`, `workspace.css` (medição abaixo) |

## Decisões

- **O terminal virou rota, não foi duplicado.** A sessão (histórico, saída, redirecionamento) continua uma só, no `TerminalProvider`. Paleta, `RunButton` e barra de comandos chamam `session.execute`; nenhum interpretador novo.
- **`cd ~` e `cd ..` voltam ao terminal**, como antes (a antiga "home" era o terminal); a home nova é o painel.
- **Fechar a janela do terminal leva ao painel**, como em qualquer página. Recolher (bolinha amarela) segue guardando a janela na barra de tarefas.
- **Janelas são opcionais**: toda a navegação é por links comuns (barra lateral, painel, paleta); arrastar/maximizar/recolher ficam só em tela larga com mouse (JA-03 inalterado).
- **Campo Minado `onExit`**: fora do terminal, "sair"/Esc encerra a partida na página; no terminal o comportamento é o de sempre.
- **Easter eggs não foram listados** no catálogo nem na paleta, para manter a surpresa.

## Limitações conhecidas

- O gráfico de contribuições do GitHub não é exibido: o serviço usado só devolve o total (ver GH-01). Um gráfico exigiria outro dado/serviço.
- "Atividade recente" é só o último push (real); não há feed de atividade.
- Há um único jogo; o Game Center é pequeno de propósito.
- Páginas do portfólio (Projetos, Habilidades, Experiências, Acadêmico, Currículo, Serviços, Contato) **não foram redesenhadas**: já estão organizadas e testadas, e ganharam apenas um caminho visível (barra lateral, painel e paleta). Filtros de projetos ficaram de fora.
- O campo de entrada do terminal (`.term-input`) não tem contorno: é identificado pelo prompt `visitante@mariab.dev:~$`, como em qualquer terminal. A barra de comandos tem indicador de foco próprio (linha de 2 px).
- A entrega real de e-mail pelo formulário de contato **não foi testada** (sem credenciais EmailJS no ambiente, e de propósito): só o caminho do navegador, com a rede interceptada.
- O PDF do currículo foi gerado e inspecionado em mídia `print`, mas não foi rasterizado página a página (sem Ghostscript/pdftoppm no ambiente); a paginação real depende do navegador de quem imprime.
- O link de e-mail na lista de contato do currículo (`/curriculo`) tem 19 px de altura: é o texto do documento impresso, mantido assim.
- Não foi testado em aparelho físico nem em Safari/Firefox; a auditoria usou Chrome (Playwright) em 390, 820 e 1440 px.

## QA final (12/11/2026)

Feita no navegador (Chrome via Playwright, servidor Vite local), depois da revisão visual de 8 rotas × 3 viewports × 5 temas.

**Aviso mobile.** Removido por inteiro (componente, estilos, textos PT/EN, teste). Primeira tela em 390 × 844 conferida: sem diálogo, sem rolagem horizontal, sem erro no console.

**Contraste.** `contrast.mjs` agora cobre os cinco temas e o contorno de campos. Uma varredura no navegador mediu a cor efetiva (com composição de transparências) de cada nó de texto em 12 rotas × 5 temas × 1440/390 px, e o contorno dos campos:

| Achado | Medida | Correção |
| --- | --- | --- |
| Contorno de campos do formulário e do seletor de tema | 1,27–1,34 : 1 (mín. 3 : 1) em todos os temas | novo token `--border-ui` por tema (3,1–3,2 : 1 sobre `--bg` e as três superfícies) |
| Mensagem de erro do formulário (`#e5484d` fixo) | 4,18 : 1 em dracula e 4,28 : 1 em solarized (mín. 4,5 : 1) | usa `var(--err)`; sem cor fixa no formulário (teste novo) |
| Emoji decorativo `.svc-icon` | falso positivo (glifo colorido, não texto) | nenhuma |

Depois da correção, nenhum texto reprova em nenhum tema; o único contorno abaixo de 3 : 1 é o do `.term-input` (ver limitações).

**Teclado** (desktop 1440 px e mobile 390 px). Passou: Ctrl+K abre e foca o campo; ↓/↑ movem a opção ativa; Enter escolhe; Esc fecha; Tab/Shift+Tab ficam no diálogo; o foco volta ao botão de origem; `?` abre os atalhos; Tab em `/sobre`, `/`, `/jogos` e `/contato` percorre tudo em ordem lógica com indicador visível; com a gaveta fechada nenhum link fora da tela recebe foco. Corrigido:

- gaveta aberta no celular não prendia o foco (Tab saía para a página atrás) e Esc deixava o foco no `body`: agora Tab circula na gaveta e Esc devolve o foco ao botão ☰ (`Sidebar.tsx`);
- na paleta, a opção ativa por seta saía da área visível da lista (30 × ↓): agora rola junto (`scrollIntoView`);
- a barra de comandos só trocava a cor de 1 px da borda ao receber foco: ganhou linha de 2 px (`.cmdbar:focus-within`).

**Alvos de toque** (390 px, 13 rotas, com e sem a gaveta, todos os links, botões, campos e `summary`). Antes: 22 grupos abaixo de 40 px, entre eles o botão `>_` do header (31 px de largura), o item `~` do breadcrumb (7 px), os botões `$ comando` (36 px), `.btn`/`.btn-o` (35–38 px), `Mostrar mais`, o resumo da lista de habilidades, os links de acesso rápido e de cartões, a imagem ampliável e o sumário do currículo. Todos receberam `min-height` de 2,5 rem (ou largura de 2,75 rem) **na classe compartilhada**, em `responsive.css` e `workspace.css`. Depois: só resta o e-mail da lista de contato do currículo (ver limitações). O Sidebar, o logo, o header, o voltar e o breadcrumb já estavam em 44 px; as bolinhas e a barra de tarefas das janelas não existem em tela estreita.

**Formulário de contato** (rede interceptada; nada foi enviado). Vazio: 3 erros, foco no primeiro campo, 0 requisições. E-mail inválido e mensagem curta: erros corretos, 0 requisições. Sem credenciais: aviso com o e-mail como alternativa. Com credenciais falsas (outro servidor Vite): 1 requisição a `api.emailjs.com/api/v1.0/email/send` com `from_name`, `from_email` e `message`, mensagem de sucesso, campos limpos; o campo-armadilha (`website`) preenchido não gera requisição.

**Currículo / PDF.** O botão "Imprimir / salvar em PDF" chama `window.print()`. Em mídia `print`: sem cabeçalho, barra lateral, rodapé, barra de tarefas nem botões; fundo branco e texto preto, igual nos temas escuro e claro (os dois PDFs gerados têm exatamente o mesmo tamanho: 321 500 bytes, 5 páginas A4). O layout foi conferido em capturas em largura A4.

**Barra de comandos.** Decisão: **alinhar com a coluna de conteúdo**. Evidência: com a barra lateral de 240 px, a barra ficava centrada na viewport (borda esquerda em x = 158 a 1440 px), ou seja, o prompt começava sobre a barra lateral e a borda direita ficava 120 px antes da borda direita do conteúdo, enquanto a janela abaixo começava em x = 278. A barra comanda o conteúdo (o painel de saída abre sobre ele), então agora as bordas coincidem com as da janela: 254–1426 px em 1440, 316–1844 em 1920, 240–1100 em 1100 (`workspace.css`, só ≥ 961 px). O header continua de borda a borda, como o restante do chrome do workspace.

## Specs anteriores afetadas

`shell-navegacao` (SH-01 e SH-02: header agora tem menu, busca, tema e idioma; SH-07: "ver no terminal" leva a `/terminal?cmd=…`; SH-06: gaveta lateral além da barra `>_`) e `experiencia-interativa` (JA-06: paleta agrupada). Os textos dessas specs não foram reescritos; este arquivo é a fonte das mudanças.
