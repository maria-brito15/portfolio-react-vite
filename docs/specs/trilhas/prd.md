# PRD — Trilhas por persona (experiência guiada e imersiva)

## Problema

A feature de personas (`docs/specs/personas/`) ficou rasa: escolher "RH" ou "amigo" só
reordena links e marca algumas entradas. A pessoa não sente que o site é **para ela**.
Quem visita com um objetivo (avaliar uma candidatura, entender o código, ver o histórico
acadêmico, pedir um site, passear) continua descobrindo sozinha onde está a resposta, e o
site perde a chance de mostrar, na prática, o cuidado com experiência de uso.

## Objetivo

Dar a cada persona uma **trilha**: um percurso curto, guiado e opcional, feito só com o
conteúdo que já existe no site, que termina numa ação concreta. A trilha aparece como
painel na home, roda como **tour com destaque** sobre a própria página e também como
comando no terminal. O nível de gamificação varia com a persona: de checklist sóbrio a
conquistas e caça a segredos.

## Decisões já tomadas com a Duda (12/11/2026)

1. **Gamificação graduada por persona:** amigo com conquistas e caça a segredos;
   professor e cliente com progresso leve; RH e tech só com checklist de descobertas, sem
   pontos nem níveis.
2. **Formato:** painel de trilha na home + tour guiado que destaca elementos da página,
   passo a passo, com "próximo" e "sair".
3. **Textos por persona:** o Claude rascunha, **só com fatos já presentes no site**, e a Duda
   aprova cada texto antes de entrar.

## As cinco trilhas (rascunho de passos; fechados na especificação)

| Persona | Trilha | Passos possíveis (páginas e comandos que já existem) | Fim com ação | Gamificação |
| --- | --- | --- | --- | --- |
| `rh` | Resumo em 60 segundos | Formação, experiências, idiomas e competências no currículo; contato | Baixar/imprimir o currículo; copiar o e-mail | Checklist "você viu 4 de 5" |
| `tech` | Tour do código | Projeto em destaque → decisões de arquitetura → estudo de caso → GitHub → `stats` e `evolucao` no terminal → perguntar ao assistente (só se estiver publicado) | Abrir o repositório; contato | Checklist de descobertas |
| `professor` | Trajetória acadêmica | Formação e linha do tempo → disciplinas e notas → projetos finalistas → extensão e monitoria | Ver o currículo; contato | Progresso leve (barra) |
| `cliente` | Do problema à entrega | Serviços → processo → perguntas frequentes → exemplos entregues | Pedir orçamento (formulário de contato) | Progresso leve (barra) |
| `amigo` | Caça aos segredos | Sobre → jogos e campo minado → `fortune`, `matrix`, `cowsay`, `boot`… → recorde | Compartilhar o site | **Conquistas**, contador de segredos |

## Princípios (não negociáveis)

1. **Opcional e sem armadilha.** Começa só se a pessoa quiser; "sair" e "pular" funcionam em
   todo passo; fechar a trilha devolve o site exatamente como estava.
2. **Nada inventado.** Todo texto e dado de passo vem de `src/data/*` ou de texto de
   interface aprovado pela Duda (skill `content-integrity`).
3. **Dados, não código.** Trilhas são dados (`src/data/trails.ts`), no mesmo padrão de
   `routes.ts` e `personas.ts`; o motor do tour é um só.
4. **Local e privado.** Progresso e conquistas ficam em `localStorage`; sem servidor, sem
   analytics, sem ranking.
5. **Mesmo estilo.** Mono único, tokens de `tokens.css`, sem degradê; o destaque do tour usa
   só tokens existentes.
6. **Acessível.** Tudo por teclado, foco gerenciado, `aria-live` nos avisos, respeita
   `prefers-reduced-motion`; o tour não prende o foco depois de fechado.
7. **Celular primeiro-classe.** O tour funciona em 390×844 (o destaque não cobre o botão
   "próximo").
8. **Sem dependência dura do assistente.** Passo que usa o assistente só aparece se ele
   estiver disponível; a trilha fecha igual sem ele.

## Escopo

1. Modelo de dados das trilhas e dos passos (alvo, texto, ação, condição de aparecer).
2. Painel da trilha na home (iniciar, continuar, reiniciar, progresso).
3. Tour com destaque (spotlight): passo a passo sobre elementos reais da página, navegando
   entre páginas quando o passo pedir.
4. Comando `trilha` / `trail` no terminal (ver passo atual, avançar, sair, listar).
5. Progresso e, só para o amigo, conquistas: em `localStorage`, com aviso de conclusão.
6. Quatro tipos de passo: **ver** (abrir/destacar algo), **fazer** (rodar um comando ou
   jogar), **achar** (segredo), **agir** (ação final: baixar, copiar, abrir).
7. Textos PT/EN de cada trilha, rascunhados e aprovados pela Duda.

## Fora de escopo

- Pontos, níveis, ranking, placar compartilhado, login ou qualquer dado no servidor.
- Conteúdo novo sobre a Duda (a trilha só encaminha para o que já existe).
- Vídeo, áudio, animações pesadas ou biblioteca de tour externa na primeira versão (decidir
  no plano; a preferência é um motor pequeno e próprio, como o roteador).
- Trilha para persona nova ou texto livre de "quem é você".
- Mudar o assistente de IA ou o conteúdo das páginas.

## Dependências

- `docs/specs/personas/` (persona atual e rotas `/r/<persona>`): a trilha parte da persona
  escolhida e o link `/r/<persona>` pode iniciar a trilha.
- Opcional: `docs/specs/assistente-ia/` (passo do `tech`).
- Skills do projeto: `content-integrity`, `terminal-command`, `terminal-design-system`.

## Riscos

| Risco | Tratamento previsto |
| --- | --- |
| Tour irritar quem só quer ler | Opcional; um clique para sair; nunca começa sozinho (exceto se o link `/r/<persona>` pedir, a decidir); lembra que foi dispensado |
| Destaque quebrar em telas pequenas ou em páginas que mudam | Alvos por `data-trail-step` estáveis; passo cujo alvo não existe é pulado e testado |
| Texto "inventar" fato ou soar exagerado | Texto vem dos dados ou é aprovado pela Duda um a um |
| Gamificação parecer infantil para recrutador | Graduada: RH e tech sem pontos; conquistas só no `amigo` |
| Peso no bundle e na manutenção | Dados + motor único e pequeno; carregamento sob demanda do tour |
| Acessibilidade do destaque (foco, leitor de tela) | Requisitos próprios e teste com teclado; anel de destaque é decorativo (`aria-hidden`) |

## Perguntas em aberto

1. **Início:** a trilha nunca começa sozinha, ou o link `/r/<persona>` (o que a Duda manda
   numa candidatura) já abre convidando a começar? Sugestão: abre o painel com o convite
   visível, sem iniciar o tour sozinho.
2. **Tamanho:** 4 a 6 passos por trilha (2 a 3 minutos). Ok?
3. **Conquistas do `amigo`:** quais segredos entram? Sugestão: os comandos que já existem
   (`fortune`, `cowsay`, `matrix`, `boot`, `rm`, campo minado, tema, idioma). Ela quer
   outros segredos novos (isso criaria conteúdo novo, a decidir)?
4. **Recompensa final:** só uma mensagem de conclusão com a ação, ou também um "selo" que
   fica no painel? Sugestão: mensagem + selo discreto, sem compartilhar nada automaticamente.
5. **Persona sem trilha concluída:** o painel continua mostrando "continuar de onde parou"
   para sempre, ou some depois de dispensada? Sugestão: some, e `trilha` traz de volta.
