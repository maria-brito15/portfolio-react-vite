# PRD — Experiência interativa e originalidade

Estado: **rascunho, aguardando aprovação**.

## Problema

O site já tem identidade (terminal na home, páginas como janelas), mas quem visita vê o mesmo que em qualquer portfólio de dev: listas de projetos e habilidades. Falta um motivo para explorar, lembrar e comentar com alguém. O terminal responde só a comandos de navegação.

## Objetivo

Tornar o site memorável sem perder a clareza: um recrutador acha o que precisa em segundos, e quem explora encontra surpresas. Tudo dentro do estilo único (mono, tokens, sem degradê) e dos dois idiomas.

## Escopo (15 itens, em 5 features)

| Feature | Itens |
| --- | --- |
| **A. Comandos de personalidade** | `neofetch`/`whoami` com ASCII, easter eggs (`sudo contratar-duda`, `matrix`, `fortune`, `cowsay`, `rm -rf`), `history` com humor |
| **B. Temas e boot** | `tema <nome>` com 3 paletas novas e persistência; boot na primeira visita, com saída por tecla e `prefers-reduced-motion` |
| **C. Jogos** | um jogo pequeno no terminal (`snake`, `forca` ou `quiz`) |
| **D. Janelas e atalhos** | janelas arrastáveis com minimizar/fechar e barra de tarefas; paleta de comandos global; `?` com atalhos |
| **E. Conteúdo e acabamento** | estudos de caso com processo; `/now` e `uses`; timeline de habilidades como `git log`; `stats` com dados reais do build; 404 temático; imagem Open Graph; mensagem no `console` |

## Achados que mudam o escopo

1. **Ctrl+K já existe** e foca a barra de comandos (texto da `ajuda`). A paleta global (D) estende esse atalho em vez de criar outro.
2. **`history` e `sudo` já existem** (`src/terminal/commands.tsx`). Entram como ajuste de resposta, não como comando novo.
3. **O comando `tema` hoje só alterna claro/escuro.** Aceitar um nome muda o comportamento dele e exige atualizar o requisito que o cobre (feature `comandos-terminal`).

## Conteúdo que só a Duda pode fornecer (regra "nada de dado inventado")

- `fortune`: as frases (próprias ou de fontes citadas).
- `/now` e `uses`: o que estuda agora, ferramentas, setup.
- Estudos de caso: problema, decisão, o que deu errado, aprendizado (só existe o do WhatsApp Dispatcher).
- `neofetch`: confirmar quais campos mostrar; `skillTimeline` já traz `since: null` para o que não tem data.
- Quiz (se escolhido): perguntas e respostas sobre ela.

Sem esse conteúdo, a feature é entregue com a estrutura e o texto marcado como pendente, nunca com texto inventado.

## Fora de escopo

Backend, analytics, contas, placar online de jogo, som, qualquer degradê ou segunda fonte, e dependências novas de UI (arrastar janela e paleta saem em React puro).

## Riscos

- **Peso e desempenho.** Jogos e boot entram por `React.lazy`, como as páginas pesadas hoje.
- **Acessibilidade.** Janelas arrastáveis precisam de alternativa por teclado; animação respeita `prefers-reduced-motion`; contraste AA nos temas novos (já há `contrast.test.ts`).
- **Celular.** Arrastar janela não faz sentido a 390px; no mobile a janela segue fixa.
- **Humor em excesso** pode atrapalhar quem só quer o currículo. O boot e os efeitos nunca bloqueiam e podem ser pulados.

## Critérios de sucesso

- `lint`, `typecheck`, `test`, `build` e `/verify-site` passam.
- Cada comando novo tem nome PT/EN, aparece (ou não, se oculto) na `ajuda` e completa com Tab.
- Nenhuma regra do CLAUDE.md quebrada (estilo único, sem dado inventado, rotas só em `routes.ts`).

## Ordem proposta de entrega

1. A (comandos de personalidade): menor esforço, maior efeito.
2. B (temas e boot).
3. E parcial: 404, `console`, `stats`, timeline (não dependem de conteúdo novo).
4. D (janelas e paleta).
5. C (jogo).
6. E dependente de conteúdo (`fortune`, `/now`, `uses`, estudos de caso).
