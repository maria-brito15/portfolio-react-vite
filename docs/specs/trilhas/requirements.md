# Trilhas por persona

Percurso guiado, opcional e feito só com o conteúdo do site, para cada persona de
`docs/specs/personas/`. Contexto, decisões e princípios em `prd.md`; textos em `textos.md`.

Grupo de requisitos **TR-xx**. Fonte única: `src/data/trails.ts` (dados); persona em
`src/data/personas.ts`; textos de interface em `src/i18n/ui.ts`.

Legenda: **Pri.** P0 = essencial, P1 = importante. **Verif.** AUT = teste automático,
MAN = checagem manual.

## Modelo e conteúdo

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| TR-01 | Trilhas como dado | `trails.ts` define uma trilha por persona (`rh`, `tech`, `professor`, `cliente`, `amigo`), cada uma com título, introdução, conclusão e de 4 a 6 passos, tudo em PT e EN; nenhum outro arquivo repete esses dados | P0 | AUT |
| TR-02 | Passos válidos | Todo passo tem tipo (`ver`, `fazer`, `achar`, `agir`), alvo e texto; os ids de rota, seção e comando citados existem em `routes.ts`, `sections.ts` e `commands.tsx` (teste que percorre todas as trilhas) | P0 | AUT |
| TR-03 | Nada inventado | Texto de passo só orienta; números e nomes vêm dos dados (ex.: quantidade de projetos, de atividades), nunca digitados à mão; trilhas só usam ações que existem (imprimir currículo, `mailto`, formulário de contato, repositórios) | P0 | AUT/MAN |
| TR-04 | Textos aprovados | Cada texto de `textos.md` está marcado "aprovado" pela Duda antes de entrar no código; o que não foi aprovado não é publicado | P0 | MAN |
| TR-05 | Assistente opcional | O passo do `tech` que usa `pergunte` só existe quando o assistente está disponível; sem ele, a trilha fecha igual, com o total de passos ajustado | P1 | AUT |

## Início, painel e comando

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| TR-06 | Painel na home | Com persona escolhida, a home mostra o cartão da trilha dela (título, nº de passos) com "Começar", "Continuar (X de N)" ou "Refazer", conforme o progresso; sem persona não mostra nada | P0 | AUT |
| TR-07 | Nunca começa sozinha | O tour só inicia por clique ou comando; `/r/<persona>` mostra o convite no painel, sem iniciar | P0 | AUT |
| TR-08 | Dispensar | "Agora não" esconde o cartão (lembrado por trilha); o comando `trilha` o traz de volta | P1 | AUT |
| TR-09 | Comando `trilha`/`trail` | Sem argumento mostra a trilha da persona, o progresso e o passo atual; `iniciar`, `continuar`, `reiniciar` e `sair` controlam o tour; aparece em `ajuda`, no Tab e no catálogo; sem persona, explica como escolher | P0 | AUT |
| TR-10 | Persona trocada | Trocar a persona troca a trilha mostrada, e o progresso de cada trilha é guardado em separado (voltar a uma persona retoma de onde parou) | P1 | AUT |

## Tour com destaque

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| TR-11 | Destaque sobre a página | Ao iniciar, o tour leva à rota do passo e destaca o elemento real (anel) com uma mensagem, o contador "2 de 5" e os botões "anterior", "próximo" e "sair" | P0 | AUT/MAN |
| TR-12 | Sair a qualquer hora | Esc, o botão "sair" ou `trilha sair` encerram o tour; o site volta como estava, o foco volta ao elemento de antes e reabrir continua do passo em que parou | P0 | AUT |
| TR-13 | Alvo ausente | Se o elemento de um passo não existe (celular, página em rascunho), o passo aparece sem destaque ou é pulado, sem erro; um teste percorre todos os alvos de todas as trilhas | P0 | AUT |
| TR-14 | Passo "ver" | Conclui quando a pessoa chega a ele (a seção fica à vista) | P0 | AUT |
| TR-15 | Passo "fazer" | Mostra o comando sugerido, clicável, e conclui quando o comando roda no terminal da sessão | P0 | AUT |
| TR-16 | Passo "achar" | Conclui quando a pessoa descobre o segredo (executa o comando escondido); a dica aparece só se pedida | P1 | AUT |
| TR-17 | Passo "agir" | Último passo de cada trilha: leva à ação real da persona (imprimir o currículo, enviar e-mail, abrir a página do GitHub com os repositórios, abrir o formulário de contato) e conclui quando a pessoa a aciona | P0 | AUT |

## Progresso e gamificação

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| TR-18 | Progresso local | Passo atual, passos feitos, conclusão e "dispensada" ficam em `localStorage` (`portfolio-trail`), por trilha; sem servidor nem analytics; com o armazenamento bloqueado, vale na sessão | P0 | AUT |
| TR-19 | Gamificação graduada | `rh` e `tech`: só checklist "viu N de M", sem pontos nem níveis; `professor` e `cliente`: barra de progresso; `amigo`: conquistas e contador de segredos; um teste garante que nenhuma outra persona mostra conquistas | P0 | AUT |
| TR-20 | Conquistas do `amigo` | Lista fixa de segredos = comandos e ações que já existem (`fortune`, `cowsay`, `matrix`, `boot`, `rm`, campo minado, troca de tema, troca de idioma); desbloqueio detectado pela execução; contador "3 de 8" persistente; aviso discreto no desbloqueio (`aria-live`, sem som) | P1 | AUT |
| TR-21 | Conclusão | Ao terminar, mensagem final com a ação da persona e um selo discreto no cartão; nada é compartilhado nem enviado automaticamente | P0 | AUT |

## Qualidade

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| TR-22 | Teclado e leitor de tela | O tour é operável só com teclado: foco vai para a mensagem ao abrir, Tab circula entre "anterior/próximo/sair", Esc sai, o passo é anunciado em `aria-live` e o anel é `aria-hidden` | P0 | AUT/MAN |
| TR-23 | Movimento reduzido | Com `prefers-reduced-motion`, sem animação do anel nem rolagem suave | P1 | AUT |
| TR-24 | Celular | Em 390×844 a mensagem não cobre o alvo nem os botões, sem rolagem horizontal, botões com área de toque de pelo menos 2,5 rem | P0 | MAN |
| TR-25 | Estilo único e contraste | Só tokens de `tokens.css` e componentes de `components/ui/`; mono único, sem degradê, contraste AA nos cinco temas | P0 | AUT/MAN |
| TR-26 | Impressão e robôs | Painel e tour ficam fora da impressão do currículo e não são montados para robôs de busca | P1 | AUT/MAN |
| TR-27 | Peso | O motor do tour carrega sob demanda; o JS inicial do site cresce no máximo 3 kB gzip em relação a antes da feature | P1 | AUT |

## Fora desta spec

- Pontos, níveis, ranking e qualquer dado em servidor; conteúdo novo sobre a Duda; segredos
  novos (a lista do `amigo` usa só o que já existe).
- Biblioteca externa de tour (decisão de plano; a preferência é um motor pequeno e próprio).

## Perguntas em aberto

Nenhuma bloqueando. Para o plano: como o destaque localiza elementos nas páginas já
existentes (`data-trail-step` nos elementos ou âncoras de `sections.ts`), como o tour
navega entre rotas sem perder o estado, e como o motor sabe que um comando rodou (hoje a
sessão do terminal guarda o histórico em `sessionStorage`).
