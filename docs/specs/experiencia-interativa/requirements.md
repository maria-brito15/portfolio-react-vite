# Experiência interativa e originalidade — requisitos

Grupos **PE** (personalidade), **TB** (temas e boot), **JG** (jogo), **JA** (janelas e atalhos), **CE** (conteúdo e acabamento). Decorre de [prd.md](prd.md). Estado: **aprovada em 11/11/2026 e implementada**; evidência em [status.md](status.md). `/agora` já tem conteúdo. Pendentes: texto da Duda para `fortune`, `/setup` e novos estudos de caso (PE-07, CE-07, CE-08).

Arquivos: [prd.md](prd.md) · [design.md](design.md) · [tasks.md](tasks.md) · status.md (criado na primeira tarefa entregue)

Regras que valem para todos: texto de interface e saída nos dois idiomas; só tokens de `tokens.css` (sem degradê, mono único); nada de dado inventado; nenhum efeito bloqueia a navegação; `prefers-reduced-motion` desliga animação; efeitos que mudam estado não rodam no replay do histórico.

Verificação: **AUT** = teste automatizado, **VIS** = captura 1440×900 e 390×844 (`/verify-site`).

## A. Comandos de personalidade (PE)

| ID | Requisito (EARS) | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| PE-01 | Quando o visitante rodar `neofetch`, o terminal deve mostrar um monograma ASCII ao lado de campos do "sistema" da Duda. | Campos lidos de `src/data/*`: nome, cargo, local, idioma atual, tema atual, total de tecnologias com data em `skillTimeline` e tempo da mais antiga. Sem campo sem fonte. Em tela estreita o monograma vai acima dos campos. | P0 | AUT+VIS |
| PE-02 | O monograma deve derivar das iniciais do nome em `profile`/`portfolio`, não de texto fixo. | Trocar o nome nos dados muda o monograma; teste cobre toda letra que o nome exigir. | P1 | AUT |
| PE-03 | Quando o visitante rodar `sudo contratar-duda` (ou `sudo hire-duda`), o terminal deve responder com humor e apontar o contato. | Resposta com link para `/contato` e e-mail de `profile`; `sudo` com qualquer outro argumento mantém a resposta atual. | P0 | AUT |
| PE-04 | Quando o visitante rodar `rm -rf` (com qualquer alvo), o terminal deve responder com humor sem efeito algum. | Nada é apagado nem navegado; mensagem PT/EN; o histórico e a sessão ficam intactos. | P1 | AUT |
| PE-05 | O terminal deve ter `cowsay <texto>`. | Balão com o texto (quebra em 40 colunas) e a figura em ASCII; sem argumento, mostra uma frase padrão. | P2 | AUT |
| PE-06 | O terminal deve ter `matrix`. | Chuva de caracteres em canvas por no máximo 6 s; qualquer tecla, clique ou Esc encerra; com `prefers-reduced-motion` mostra uma linha estática em vez de animar; cores só por tokens; carregado sob demanda. | P2 | AUT+VIS |
| PE-07 | O terminal deve ter `fortune`. | Sorteia uma frase de `src/data/fortunes.ts`; com a lista vazia mostra "sem frases ainda" (nunca texto inventado). O conteúdo é fornecido pela Duda. | P1 | AUT |
| PE-08 | O comando `historico` deve fechar a lista com uma linha de humor. | Linha dim com a contagem de comandos; saída restante idêntica à atual (CM-01 segue valendo). | P2 | AUT |
| PE-09 | Os comandos novos devem seguir o inventário: nomes PT/EN sem repetição, Tab completa, `ajuda` lista só os não ocultos. | Teste de inventário passa; easter eggs (`matrix`, `cowsay`, `rm`, `sudo contratar-duda`) ficam ocultos; `neofetch`, `fortune`, `stats`, `jogos` aparecem na `ajuda`. | P0 | AUT |

## B. Temas e boot (TB)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| TB-01 | Quando o visitante rodar `tema <nome>`, o site deve aplicar o tema. | Nomes: `escuro`/`dark`, `claro`/`light`, `dracula`, `solarized`, `ambar`/`amber`. `tema` sem argumento continua alternando claro/escuro (CM atual). Nome inválido lista os temas válidos (erro que reensina). | P0 | AUT |
| TB-02 | `tema ls` (ou `tema lista`) deve listar os temas com o atual marcado. | Saída PT/EN; cada nome é clicável e roda `tema <nome>`. | P1 | AUT |
| TB-03 | O tema escolhido deve persistir entre visitas. | Salvo em `localStorage` (`portfolio-theme`); o script inline do `index.html` aplica antes do React, sem flash; nome salvo desconhecido cai em `dark`. | P0 | AUT |
| TB-04 | Cada tema novo deve ser só um bloco de tokens. | Definido em `tokens.css`; sem degradê; contraste AA em texto e links (`contrast.test.ts` cobre todos os temas); `color-scheme` correto por tema. | P0 | AUT+VIS |
| TB-05 | O botão de tema do cabeçalho deve continuar alternando claro/escuro. | A partir de um tema novo, vai para `dark`; `aria-label` descreve o tema atual. | P1 | AUT |
| TB-06 | Na primeira visita à home, o terminal deve mostrar uma sequência de boot curta. | No máximo 6 linhas e 1,5 s; só uma vez (flag em `localStorage`); some com qualquer tecla ou clique; nunca atrasa a digitação; não roda para robôs de busca nem no replay. | P1 | AUT |
| TB-07 | Com `prefers-reduced-motion`, o boot deve ser estático. | As linhas aparecem de uma vez, sem temporizador de animação. | P0 | AUT |
| TB-08 | O comando `boot` deve repetir a sequência. | Roda de novo sob demanda; oculto na `ajuda`. | P2 | AUT |

## C. Jogo: campo minado (JG)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| JG-01 | O terminal deve ter `minas` (`minesweeper`) e a lista `jogos` (`games`). | `minas` abre o tabuleiro na saída do terminal; `jogos` lista os jogos disponíveis; entram na `ajuda`. | P0 | AUT |
| JG-02 | A lógica deve ser pura e testada à parte da interface. | `src/terminal/games/minesweeper.ts` sem React: criar tabuleiro, abrir, bandeira, abrir em cascata, vitória/derrota, contagem de vizinhas. | P0 | AUT |
| JG-03 | O primeiro clique nunca deve ser mina. | Minas sorteadas depois do primeiro clique, excluindo a célula e as vizinhas; testado com sementes fixas. | P0 | AUT |
| JG-04 | Dificuldades: `minas` (9×9, 10 minas), `minas medio` (16×16, 40), `minas dificil` (30×16, 99). | Argumento inválido devolve erro que lista as opções. No celular, `dificil` avisa que o tabuleiro é largo. | P1 | AUT |
| JG-05 | Deve haver contador de minas restantes, cronômetro e estado (jogando, ganhou, perdeu). | Cronômetro só corre depois do primeiro clique e para ao fim; estado anunciado por `aria-live`. | P0 | AUT |
| JG-06 | Jogável por mouse, toque e teclado. | Mouse: clique abre, clique direito marca. Toque: botão "bandeira" alterna o modo (toque longo também). Teclado: setas movem, Espaço/Enter abre, `F` marca, `R` reinicia. Sem rolagem horizontal da página a 390 px (o tabuleiro rola dentro da janela se for largo). | P0 | AUT+VIS |
| JG-07 | O tabuleiro deve ser acessível. | Cada célula é botão com `aria-label` ("linha 3, coluna 4, fechada, bandeira, 2 minas vizinhas"); número não depende só da cor (os números usam tokens de contraste AA e o dígito aparece sempre). | P0 | AUT |
| JG-08 | O melhor tempo por dificuldade deve ser guardado no navegador. | Só `localStorage`, só do próprio visitante, mostrado ao ganhar; sem placar online; falha de armazenamento não quebra o jogo. | P2 | AUT |
| JG-09 | O jogo deve carregar sob demanda e não tocar o resto. | `React.lazy`; `Esc` ou o comando `sair` volta ao prompt; trocar de idioma redesenha sem perder a partida; no replay do histórico mostra só "partida encerrada", nunca um tabuleiro novo. | P0 | AUT |

## D. Janelas e atalhos (JA)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| JA-01 | Em telas largas com mouse, o visitante deve poder arrastar a janela pela barra de título. | Arrasto por ponteiro, limitado ao viewport; duplo clique na barra volta à posição original; posição vale só para a sessão; a janela da home e das páginas usam o mesmo `Window`. | P1 | AUT+VIS |
| JA-02 | O arrasto deve ter alternativa de teclado. | Com a barra focada, as setas movem 16 px e `Home` restaura; foco visível. | P0 | AUT |
| JA-03 | Abaixo de 760 px ou sem ponteiro fino, a janela deve ficar fixa. | Nenhum arrasto nem barra de tarefas no celular; layout atual intacto a 390 px. | P0 | VIS |
| JA-04 | As três bolinhas devem funcionar: minimizar, maximizar/restaurar e fechar. | Viram botões com `aria-label` PT/EN; minimizar recolhe o corpo e deixa só a barra; fechar numa página vai para a home; fechar o terminal da home recolhe a janela até ser reaberta. | P1 | AUT |
| JA-05 | Deve haver uma barra de tarefas mínima com as janelas recolhidas. | Aparece só quando há janela recolhida; clique restaura; é um `nav` com `aria-label`; some no celular. | P1 | AUT+VIS |
| JA-06 | `Ctrl+K` deve abrir uma paleta de comandos global. | Substitui o comportamento atual de focar a barra (a `ajuda` e o requisito de sessão do terminal são atualizados); lista páginas (de `routes.ts`) e comandos (do inventário); busca sem acento e sem caixa; setas e Enter; Esc fecha e devolve o foco; foco preso dentro da paleta. | P0 | AUT |
| JA-07 | Escolher uma opção da paleta deve executar o mesmo caminho do terminal. | Página abre pela mesma rota/carregamento; comando roda na sessão e aparece no terminal; nada de caminho duplicado. | P0 | AUT |
| JA-08 | `?` deve abrir a lista de atalhos. | Fora de campos de texto; lista vinda de uma tabela única (`src/data/shortcuts.ts`) usada também pela `ajuda`; Esc fecha. | P1 | AUT |
| JA-09 | O comando `atalhos` (`shortcuts`) deve mostrar a mesma lista no terminal. | Mesma fonte de dados do JA-08. | P2 | AUT |

## E. Conteúdo e acabamento (CE)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| CE-01 | O comando `git log` (também `evolucao`/`log`) deve mostrar a timeline de habilidades. | Lido de `skillTimeline`, do mais recente ao mais antigo, agrupado por ano; entradas com `since: null` ficam fora, e uma linha diz quantas não têm data (nada de data inventada); cada item cita o `source`. | P1 | AUT |
| CE-02 | O comando `stats` deve mostrar dados reais do próprio site. | Número de commits, versão do `package.json` e data/hora do build, injetados no build; em desenvolvimento mostra "dev" e o que souber, nunca número fixo no código. | P1 | AUT |
| CE-03 | O 404 deve ser temático e útil. | `<caminho>: command not found`-style em PT/EN, com até 3 sugestões por similaridade sobre `routes.ts`, link para a home e `ls`; continua devolvendo o `404.html` real do SEO. | P1 | AUT+VIS |
| CE-04 | A imagem de compartilhamento deve ter o visual de terminal. | `og.png` 1200×630, só cores dos tokens, com o nome e o cargo reais; as metas do SEO apontam para ela. **Já atendido** pela feature `seo` (`public/assets/og-image.png`); nada a fazer. | P2 | VIS |
| CE-05 | Ao abrir o DevTools, o `console` deve mostrar uma mensagem. | Uma chamada `console.info` na inicialização, PT e EN conforme o idioma do navegador, com o link do repositório e do contato; nenhum erro/aviso novo no console. | P2 | AUT |
| CE-06 | Deve existir a página `/agora` (`/now`). | Rota só em `routes.ts`; conteúdo em `src/data/now.ts` fornecido pela Duda, com a data da última atualização; conteúdo ausente mostra aviso de página em construção, não texto inventado; vira `ls` e comando. **Acrescentado na implementação:** enquanto vazia, a rota é `draft` (fora do sitemap e com `noindex`); ao receber conteúdo passa a ser indexada sozinha. | P1 | AUT |
| CE-07 | Deve existir a página `/setup` (`/uses`). | Mesmas regras do CE-06 (`src/data/uses.ts`). | P1 | AUT |
| CE-08 | Os estudos de caso novos devem seguir uma estrutura comum. | Seções fixas: problema, decisão, o que deu errado, aprendizado; um componente único lê dados por projeto; novos só entram com texto da Duda. **Alterado na implementação:** o estudo do WhatsApp Dispatcher (~130 KB, 17 seções longas) **não** é migrado, porque o formato é outro e a migração perderia conteúdo; o componente comum só será criado quando houver o primeiro texto novo. | P1 | AUT |

## Fora do escopo

Backend, analytics, placar online, som, dependências de UI, degradê, segunda fonte. O que não foi pedido (ex.: `snake`, `forca`, `quiz`) fica de fora; o campo minado foi o jogo escolhido.

## Perguntas em aberto

1. Quais iniciais usar no monograma (derivam do nome em `profile`; confirmar o resultado visual)?
2. `fortune`, `/agora`, `/setup` e os novos estudos de caso: a Duda fornece o texto (as features entram com a estrutura e o aviso de pendência).
3. Fechar a janela do terminal da home recolhe ou leva a uma tela "sessão encerrada"? Proposta: recolhe, com a barra de tarefas para reabrir.
