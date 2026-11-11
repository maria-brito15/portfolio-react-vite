# Experiência interativa — desenho

Decisões e arquivos afetados. Cada decisão cita os requisitos de [requirements.md](requirements.md).

## Decisões

**D1. Comandos novos em arquivos próprios, registrados em `commands.tsx`** (PE-*, JG-01, CE-01/02). `commands.tsx` já tem 800+ linhas. Os comandos ficam em `src/terminal/commands/` (`neofetch.tsx`, `fun.tsx`, `stats.tsx`, `gitlog.tsx`, `games.tsx`) e exportam objetos `Command`; `commands.tsx` só os junta na lista. Alternativa descartada: tudo em `commands.tsx` (arquivo ingovernável).

**D2. Temas por atributo `data-theme` com mais valores** (TB-*). O tipo `Theme` passa de `'dark' | 'light'` a uma união com os 5 nomes, lista única em `src/data/themes.ts` (id, nomes PT/EN, `scheme`). `useTheme` ganha `setTheme(id)`; o alternador claro/escuro continua. O script inline do `index.html` valida o nome contra a mesma lista. Cada tema é um bloco em `tokens.css`. Alternativa descartada: temas por classe/variáveis em JS (foge de "tokens em CSS").

**D3. Boot e `matrix` por `React.lazy`** (TB-06, PE-06). Fora do pacote principal, como as páginas pesadas. O boot é um componente da home que lê/grava a flag `portfolio-booted`.

**D4. Campo minado: lógica pura + visão** (JG-*). `minesweeper.ts` (estado imutável, `open`, `flag`, `chord` opcional, gerador com semente injetada para teste) e `Minesweeper.tsx` (grade de `button`, teclado, cronômetro). A partida mora em estado do componente, fora do histórico da sessão; o replay cria só uma saída "partida encerrada". Alternativa descartada: guardar o tabuleiro no `sessionStorage` (complexidade sem ganho).

**D5. Janela: gerenciador mínimo em contexto** (JA-01 a JA-05). `WindowProvider` guarda por id: posição, minimizada. `Window` ganha as três bolinhas como botões e o arrasto por ponteiro (hook `useDrag`, só quando `(min-width: 760px) and (pointer: fine)`). A barra de tarefas é um componente do `SiteShell` que lê o mesmo contexto. Sem biblioteca de drag.

**D6. Paleta e atalhos usam as fontes únicas existentes** (JA-06 a JA-09). A paleta monta as opções de `routes.ts` (`directories`) e `commandInventory()`; executar chama `execute()` da sessão (mesmo caminho do terminal). `shortcuts.ts` é a tabela única de atalhos, lida pela paleta, pelo overlay `?` e pela `ajuda`. `Ctrl+K` hoje foca a barra (`CommandBar`/`TerminalSession`): muda para abrir a paleta, e a barra segue focável por clique e `/`.

**D7. Dados de build injetados pelo Vite** (CE-02). `vite.config.ts` define `__BUILD__` com `git rev-list --count HEAD`, versão do `package.json` e `new Date().toISOString()`. Se o git não estiver disponível, o campo vira `null` e o comando mostra "indisponível". Nenhum número no código.

**D8. Conteúdo pendente como dado vazio** (CE-06/07/08, PE-07). `fortunes.ts`, `now.ts`, `uses.ts` exportam estruturas vazias tipadas; a interface trata o vazio com aviso. O `content-integrity` valida paridade PT/EN quando houver texto.

**D9. Rotas novas só em `routes.ts`** (CE-06/07). `agora`/`now` e `setup`/`uses` entram na tabela; `ls`, `cd`, breadcrumb, sitemap e SEO leem dali (skill `site-page-section`).

**D10. 404 e Open Graph** (CE-03/04). Sugestões por distância de edição (função pura em `src/utils/`) sobre os nomes de `routes.ts`. A imagem `og.png` é gerada por um script em `scripts/` com as cores dos tokens e commitada; `seo.ts` já aponta para a imagem de compartilhamento, só troca o arquivo.

## Divergências na implementação (11/11/2026)

- **D1:** a pasta é `src/terminal/extras/`, não `commands/` (`./commands` já é o arquivo `commands.tsx`; a pasta de mesmo nome ficaria ambígua).
- **D3:** o boot **não** é `React.lazy` (é pequeno e precisa aparecer já na primeira pintura); só `matrix`, o campo minado, a paleta e a lista de atalhos carregam sob demanda, cada um em chunk próprio.
- **D4:** a lógica pura está em `games/mines.ts`, e a visão em `games/Minesweeper.tsx` (no Windows, `minesweeper.ts` e `Minesweeper.tsx` colidem por maiúsculas). Cada execução do comando recebe uma chave própria: rodar `minas` de novo começa outra partida, e trocar de idioma mantém a atual.
- **D5:** o estado de janelas vive em `windowManager.tsx` (contexto), a geometria pura em `windowGeometry.ts`. As bolinhas, o arrasto e a barra de tarefas só existem com `(min-width: 761px) and (pointer: fine)`; abaixo disso as bolinhas são só desenho (recolher sem barra de tarefas deixaria a janela sem volta). Maximizar sobe o `.shell` acima do rodapé com `:has()`.
- **D6:** `Ctrl+K` também abre a paleta com o foco na linha de comando (e a fecha de dentro dela); em outros campos de formulário continua sem agir. A paleta pede a saída à barra de comandos por um evento (`SHOW_OUTPUT`).
- **D9/CE-06:** `Route` ganhou `draft`. Página sem conteúdo fica fora do sitemap e com `noindex`; ao receber conteúdo, entra sozinha.
- **Novos:** `src/utils/env.ts` (robô de busca e movimento reduzido, antes duplicados), `src/data/build.ts` e `scripts/buildInfo.ts` (dados do build), `src/utils/suggest.ts` (404), `src/utils/consoleMessage.ts`.
- **Testes:** `asyncUtilTimeout` global de 5 s (os diálogos e o jogo carregam por `import()` e a suíte completa é lenta em máquina ocupada).

## Mudanças em requisitos existentes

- `comandos-terminal` (CM-01): o inventário passa a incluir os comandos novos; `tema` aceita argumento.
- `sessao-terminal`: `Ctrl+K` deixa de focar a barra e passa a abrir a paleta.
- `estilo-unico`: novos temas continuam sem degradê e em mono único.
- `seo`: a imagem OG troca; rotas novas entram no sitemap.

## Arquivos afetados (principais)

`src/terminal/commands.tsx`, `src/terminal/commands/*` (novos), `src/terminal/games/*` (novos), `src/terminal/TerminalSession.tsx`, `src/hooks/useTheme.tsx`, `src/data/themes.ts`, `src/data/shortcuts.ts`, `src/data/{fortunes,now,uses}.ts`, `src/data/routes.ts`, `src/components/shell/{Window,SiteShell,CommandBar}.tsx`, `src/components/{CommandPalette,ShortcutsHelp,Taskbar}.tsx`, `src/pages/{NotFound,Now,Uses}.tsx`, `src/styles/{tokens,terminal,shell}.css`, `index.html`, `vite.config.ts`, `src/main.tsx`, `scripts/og.mjs`.

## Riscos e mitigação

- Substituir o `Ctrl+K` pode quebrar testes de sessão: ajustar os testes junto com o requisito.
- Arrastar só com ponteiro fino evita conflito com rolagem no toque.
- Tema novo sem contraste AA reprova no `contrast.test.ts`: a paleta é escolhida com o teste aberto.
