# PRD — Personas (o site se adapta a quem visita)

## Problema

O site mostra a mesma coisa para todo mundo. Uma pessoa de RH, uma pessoa
recrutadora técnica, um professor, um amigo e um cliente chegam com perguntas
diferentes ("ela tem o perfil da vaga?", "o código é bom?", "como foi o
desempenho acadêmico?", "o que ela faz?", "quanto custa um site?"), mas todos
precisam descobrir sozinhos onde está a resposta.

## Objetivo

Perguntar, de forma opcional e leve, quem está visitando e usar a resposta como
uma **lente** sobre o mesmo conteúdo: mudar a ordem, o destaque e as sugestões
de próximo passo. Nenhum conteúdo é escondido nem inventado por persona.

## Personas da v1

| id | Quem | O que quer ver primeiro |
| --- | --- | --- |
| `rh` | Recrutador(a) / RH | Currículo, experiências, contato |
| `tech` | Recrutador(a) técnico(a) / engenheiro(a) | Projetos, GitHub, stack, estudo de caso |
| `professor` | Professor(a) | Acadêmico, notas, projetos de pesquisa/estudo |
| `amigo` | Amigo(a) / curioso(a) | Sobre, jogos, projetos pessoais |
| `cliente` | Cliente | Serviços, projetos entregues, contato |

## Escopo

1. Pergunta na primeira visita, dentro do terminal da home, pulável com Enter.
2. Comando para ver/trocar a persona a qualquer momento (`quem-sou-eu` /
   `whoami`) e para limpar a escolha.
3. Link direto com persona por **rota**: `/r/tech`, `/r/rh`, `/r/professor`,
   `/r/amigo`, `/r/cliente`, para a Duda mandar um link já ajustado numa
   candidatura. O link dispensa a pergunta.
4. A escolha fica em `localStorage`; sem cookie, sem envio a servidor, sem
   analytics por persona.
5. A lente muda: ordem de páginas/seções, destaque visual, comandos sugeridos
   no terminal e o chamado para ação.
6. Dados da persona em um só arquivo (`src/data/personas.ts`); textos PT/EN em
   `src/i18n/ui.ts`.

## Fora de escopo

- Esconder, trocar ou reescrever conteúdo por persona (o fato é um só).
- Login, perfil de usuário, rastreamento ou métrica de quem escolheu o quê.
- Detecção automática de persona (referrer, user-agent, IP).
- Personas além das cinco; texto livre de "quem é você".
- O assistente de IA (spec própria: `docs/specs/assistente-ia/`, que depende
  desta).

## Decisões já tomadas com a usuária

1. Cinco personas da v1: RH, tech, professor, amigo, cliente.
2. Lente, não sites separados.
3. Pergunta opcional e pulável; nunca bloqueia o acesso.
4. Personas viram dado, no mesmo padrão de `routes.ts`.
5. Link por rota (`/r/<persona>`), não por query string.

## Premissas assumidas (corrija se discordar)

- A persona **não** muda o tema; só ordem, destaque e sugestões.
- Quem já visitou o site antes da feature é tratado como primeira visita:
  a pergunta aparece uma vez.
- Rotas `/r/<persona>` não entram no sitemap nem competem com a página
  principal nos buscadores (canonical para `/`).
