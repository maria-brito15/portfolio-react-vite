# Roadmap --- Tornar as personas mais dinâmicas no portfólio

> **Estado:** Fase 0 e Fase 1 feitas (`docs/specs/personas-home/status.md`); Fase 2 feita (`docs/specs/projetos-contextuais/status.md`); Fase 3 feita (`docs/specs/navegacao-contextual/status.md`). Fase 4 feita (`docs/specs/experiencias-persona/status.md`). Fase 5 feita (`docs/specs/busca-contextual/status.md`). Fase 6 feita em parte (`docs/specs/qualidade-personas/status.md`): auditoria e correções prontas; pendentes leitor de tela, PDF do currículo, deploy e o teto de JS inicial.

**Objetivo:** fazer com que cada visitante tenha uma experiência
claramente adaptada ao seu objetivo, sem criar cinco versões do site,
duplicar conteúdo ou esconder informações.

**Escopo:** evolução da implementação existente de personas e trilhas.
Este documento considera os arquivos de especificação fornecidos em
`docs/specs/personas/` e `docs/specs/trilhas/`.

------------------------------------------------------------------------

## 1. Diagnóstico e ponto de partida

A base de personalização já está implementada:

-   Cinco personas: `rh`, `tech`, `professor`, `amigo` e `cliente`.
-   Escolha opcional, persistida localmente.
-   Rotas compartilháveis `/r/<persona>`.
-   Reordenação e destaque de páginas/atalhos.
-   CTA e sugestões contextuais.
-   Painel de trilha na home.
-   Tour guiado com destaque de elementos.
-   Progresso local por trilha.
-   Gamificação graduada: checklist para RH/tech, barra para
    professor/cliente e conquistas para amigo.

Portanto, **não reimplemente essas funcionalidades**. A próxima etapa é
aumentar a percepção de personalização e melhorar a integração entre
home, projetos, navegação e trilhas.

### Pendências já registradas nas especificações

Antes de adicionar novas funcionalidades, resolver ou decidir
explicitamente:

-   [ ] Revisar os textos de interface provisórios listados no final de
    `docs/specs/trilhas/textos.md`.
-   [ ] Implementar ou decidir o comportamento da dica do passo `achar`
    da trilha de amigo.
-   [ ] Testar o tour com leitor de tela real.
-   [ ] Conferir a impressão do currículo em navegador.
-   [ ] Conferir visualmente os temas Dracula e Solarized.
-   [ ] Validar as rotas `/r/<persona>` no deploy real.
-   [ ] Resolver o orçamento de JavaScript inicial das trilhas: o status
    registra aumento de 5,5 kB gzip, acima do limite originalmente
    definido.

------------------------------------------------------------------------

## 2. Resultado esperado

Ao final, as cinco personas devem perceber diferenças úteis na
experiência:

  -----------------------------------------------------------------------
  Persona                 Pergunta principal do   Experiência que deve
                          visitante               priorizar
  ----------------------- ----------------------- -----------------------
  RH                      "Esta pessoa tem o      Resumo profissional,
                          perfil que procuro?"    currículo, experiências
                                                  e contato

  Tech                    "Como ela pensa e       Projetos, arquitetura,
                          constrói software?"     decisões técnicas,
                                                  GitHub e stack

  Professor               "Qual é sua trajetória  Formação, disciplinas,
                          acadêmica?"             notas, projetos e
                                                  atividades

  Cliente                 "Ela consegue resolver  Serviços, processo,
                          meu problema?"          cases, FAQ e contato

  Amigo                   "O que existe de        Sobre, projetos
                          interessante por aqui?" pessoais, jogos e
                                                  segredos
  -----------------------------------------------------------------------

A diferença não deve depender apenas da ordem dos links. Ela deve
aparecer no conteúdo em destaque, nos próximos passos sugeridos e nas
formas de explorar cada projeto.

------------------------------------------------------------------------

# Fase 0 --- Preparação e auditoria

## Passo 1. Conferir a implementação atual

Leia antes de alterar:

-   `docs/specs/personas/prd.md`
-   `docs/specs/personas/design.md`
-   `docs/specs/personas/requirements.md`
-   `docs/specs/personas/status.md`
-   `docs/specs/trilhas/prd.md`
-   `docs/specs/trilhas/design.md`
-   `docs/specs/trilhas/requirements.md`
-   `docs/specs/trilhas/status.md`
-   `docs/specs/trilhas/textos.md`

Depois, confira no código:

-   `src/data/personas.ts`
-   `src/data/trails.ts`
-   `src/hooks/usePersona.tsx`
-   `src/trails/TrailProvider.tsx`
-   `src/components/PersonaPrompt.tsx`
-   `src/components/TrailCard.tsx`
-   `src/pages/Home.tsx`
-   `src/components/shell/Sidebar.tsx`
-   `src/components/dashboard/QuickAccess.tsx`

**Não presuma que o código está exatamente igual à documentação:**
valide os nomes e a estrutura reais do repositório.

### Critério de conclusão

-   [ ] A implementação existente foi identificada.
-   [ ] As pendências documentadas foram separadas de novas
    funcionalidades.
-   [ ] Nenhum componente ou fluxo existente será duplicado.

## Passo 2. Registrar uma linha de base

Antes de implementar:

1.  Rode lint, typecheck, testes e build.
2.  Abra o site em desktop e mobile.
3.  Capture a home com cada uma das cinco personas.
4.  Registre quais elementos mudam e quais permanecem iguais.
5.  Observe se a persona ativa fica evidente sem ocupar espaço
    excessivo.

### Critério de conclusão

-   [ ] Há capturas de referência para as cinco personas.
-   [ ] Os comandos de validação passam ou as falhas preexistentes estão
    registradas.
-   [ ] Existe uma lista objetiva dos pontos em que as experiências
    ainda parecem iguais.

------------------------------------------------------------------------

# Fase 1 --- Dashboard inicial realmente adaptativo

**Prioridade: P0**

A home deve responder rapidamente à principal pergunta de cada persona.
A estrutura geral permanece compartilhada, mas os blocos prioritários,
descrições e chamadas para ação mudam.

## Passo 3. Definir a composição da home por persona

Crie uma configuração declarativa para a composição da home. Não espalhe
condicionais como `persona === 'tech'` por vários componentes.

Sugestão conceitual:

``` ts
interface PersonaHomeConfig {
  featuredSections: string[];
  featuredProjects: string[];
  primaryAction: string;
  secondaryActions: string[];
  introduction: Localized;
}
```

Ajuste os tipos à arquitetura já existente. Evite duplicar campos que já
estejam disponíveis em `personas.ts`.

Defina a intenção de cada composição:

### RH

-   Resumo profissional.
-   Formação e competências.
-   Experiências e atividades.
-   Currículo e contato como ações principais.

### Tech

-   Projetos técnicos.
-   Estudo de caso.
-   Stack e GitHub.
-   Acesso a decisões arquiteturais.

### Professor

-   Trajetória acadêmica.
-   Formação e disciplinas.
-   Projetos e atividades acadêmicas.
-   Currículo como ação complementar.

### Cliente

-   Serviços.
-   Cases.
-   Processo de trabalho e FAQ.
-   Formulário de contato como ação principal.

### Amigo

-   Sobre.
-   Projetos pessoais.
-   Jogos e comandos divertidos.
-   Exploração livre.

## Passo 4. Implementar os blocos adaptativos

1.  Identifique os componentes da home que podem ser reutilizados.
2.  Crie um componente de composição, por exemplo `PersonaHomeSections`.
3.  Leia a configuração da persona ativa.
4.  Renderize os blocos na ordem definida.
5.  Preserve os blocos não prioritários em outras áreas da home ou da
    navegação.
6.  Não remova conteúdo por causa da persona.
7.  Mantenha uma composição padrão quando não houver persona
    selecionada.

**Importante:** não transforme a home em cinco páginas independentes.
Reutilize os mesmos componentes e dados.

## Passo 5. Diferenciar a introdução e a ação principal

A introdução deve explicar o que aquela pessoa encontrará, sem inventar
informações sobre a candidata.

Exemplos de intenção:

-   RH: "Acesse um resumo da formação, competências e experiências."
-   Tech: "Explore projetos, decisões de arquitetura e repositórios."
-   Professor: "Conheça a trajetória acadêmica e os projetos
    desenvolvidos."
-   Cliente: "Veja os serviços, exemplos de entrega e formas de
    contato."
-   Amigo: "Explore projetos, interesses e algumas surpresas."

Cada persona deve ter uma ação principal coerente. Reaproveite os
destinos e CTAs já existentes sempre que possível.

### Critérios de aceite da Fase 1

-   [ ] A home apresenta uma composição perceptivelmente diferente para
    cada persona.
-   [ ] A ação principal corresponde ao objetivo da persona.
-   [ ] Todos os conteúdos continuam acessíveis.
-   [ ] A experiência padrão continua funcionando sem persona.
-   [ ] PT e EN estão completos.
-   [ ] Desktop e mobile foram verificados.

------------------------------------------------------------------------

# Fase 2 --- Cards de projetos com perspectivas contextuais

**Prioridade: P0**

Um mesmo projeto pode ser interessante por motivos diferentes. O card
deve ajudar cada visitante a perceber o aspecto mais relevante, sem
alterar os fatos do projeto.

## Passo 6. Mapear os projetos e seus aspectos relevantes

Para cada projeto, identifique informações verdadeiras que já existem no
conteúdo:

-   Problema abordado.
-   Solução implementada.
-   Tecnologias utilizadas.
-   Arquitetura e decisões técnicas.
-   Resultado ou reconhecimento, quando documentado.
-   Repositório e estudo de caso, quando disponíveis.

Não crie métricas, resultados ou responsabilidades que não estejam
documentados.

## Passo 7. Criar perspectivas por persona

Comece pelos projetos de maior destaque, em vez de tentar adaptar todos
de uma vez.

Exemplo: EcoShop.

  -----------------------------------------------------------------------
  Persona                             Perspectiva do mesmo projeto
  ----------------------------------- -----------------------------------
  RH                                  Competências demonstradas e
                                      participação no projeto

  Tech                                Arquitetura, stack, integração com
                                      IA e evolução entre versões

  Professor                           Problema estudado, aplicação e
                                      contexto acadêmico

  Cliente                             Problema resolvido e valor da
                                      solução

  Amigo                               Ideia do projeto e experiência de
                                      uso
  -----------------------------------------------------------------------

A perspectiva deve selecionar e organizar informações existentes. Não
deve produzir uma descrição fictícia.

## Passo 8. Implementar o card contextual

1.  Localize o componente atual de card de projeto.
2.  Preserve o modelo de dados original do projeto.
3.  Adicione uma camada de apresentação contextual, preferencialmente
    baseada em configuração.
4.  Exiba um resumo adequado à persona ativa.
5.  Ofereça acesso aos detalhes completos do projeto.
6.  Se não existir conteúdo específico para determinada combinação, use
    a descrição padrão.
7.  Não duplique o projeto no banco de dados ou nos arquivos de
    conteúdo.

Uma opção de interação é permitir alternar entre perspectivas, mas isso
não deve ser obrigatório. A persona ativa já deve selecionar a
perspectiva inicial.

### Critérios de aceite da Fase 2

-   [ ] O mesmo projeto continua tendo uma única fonte de dados.
-   [ ] A apresentação muda conforme a persona.
-   [ ] Nenhuma informação factual foi inventada.
-   [ ] A descrição padrão funciona como fallback.
-   [ ] Links, repositórios e estudos de caso continuam funcionando.
-   [ ] A apresentação contextual funciona em PT e EN.

------------------------------------------------------------------------

# Fase 3 --- Integrar melhor as trilhas à navegação

**Prioridade: P1**

As trilhas já existem. O objetivo agora é fazer com que elas pareçam
parte natural da navegação, e não uma funcionalidade isolada na home.

## Passo 9. Conectar páginas e trilhas

Ao entrar em uma página relevante para a trilha:

1.  Identifique se a página corresponde a uma etapa.
2.  Mostre o progresso de maneira discreta.
3.  Permita continuar a trilha sem obrigar o visitante a fazê-lo.
4.  Não abra automaticamente o tour a cada navegação.
5.  Preserve o botão de sair e a possibilidade de continuar depois.

Não crie um segundo mecanismo de progresso. Use `TrailProvider` e o
armazenamento já implementados.

## Passo 10. Adicionar próximas ações contextuais

Ao final de uma página ou de um projeto, sugira uma próxima ação
coerente.

Exemplos:

-   RH, depois do currículo: conhecer experiências ou entrar em contato.
-   Tech, depois de um projeto: abrir o estudo de caso ou o repositório.
-   Professor, depois da página acadêmica: explorar projetos
    relacionados.
-   Cliente, depois de um case: conhecer os serviços ou solicitar
    orçamento.
-   Amigo, depois de um jogo: explorar outro jogo ou voltar à página
    sobre.

Regras:

-   Mostrar poucas sugestões, preferencialmente uma principal e uma
    secundária.
-   Evitar repetir o mesmo CTA em todos os blocos.
-   Não cobrir o conteúdo principal.
-   Não interromper a leitura com pop-ups.

## Passo 11. Melhorar a continuidade da experiência

Quando a pessoa trocar de página ou voltar à home:

-   Mantenha a persona selecionada.
-   Mantenha o progresso da trilha.
-   Mostre uma opção clara para continuar.
-   Permita trocar de persona sem apagar o progresso das outras.
-   Se a pessoa não iniciou uma trilha, não mostre mensagens de
    progresso fictícias.

### Critérios de aceite da Fase 3

-   [ ] A navegação oferece próximos passos relevantes.
-   [ ] O tour não começa sozinho.
-   [ ] O progresso permanece consistente entre páginas.
-   [ ] Trocar de persona não apaga o progresso anterior.
-   [ ] Não há excesso de banners, pop-ups ou CTAs.

------------------------------------------------------------------------

# Fase 4 --- Experiências específicas por persona

**Prioridade: P1/P2**

Implementar somente interações que acrescentem valor real. Não é
necessário criar uma funcionalidade complexa para todas as personas.

## Passo 12. RH --- Visão profissional resumida

Objetivo: reduzir o tempo necessário para avaliar o perfil.

Implementar:

1.  Um resumo profissional visível na home.
2.  Acesso rápido ao currículo.
3.  Destaque para formação, competências e experiências.
4.  Uma ação clara para contato.
5.  Uma navegação que permita aprofundar cada informação.

Evite criar um segundo currículo dentro da home. O resumo deve
encaminhar para a versão completa.

## Passo 13. Tech --- Exploração de arquitetura

Objetivo: demonstrar raciocínio de engenharia, não apenas listar
tecnologias.

Implementar:

1.  Selecionar um projeto com estudo de caso documentado.
2.  Apresentar um diagrama real da arquitetura.
3.  Permitir explorar componentes e suas responsabilidades.
4.  Explicar decisões técnicas e trade-offs já documentados.
5.  Conectar cada parte do diagrama ao trecho correspondente do estudo
    de caso.
6.  Oferecer acesso ao repositório.

Comece com um único projeto. Só expanda depois de validar a experiência.

## Passo 14. Professor --- Linha do tempo acadêmica

Objetivo: facilitar a compreensão da evolução acadêmica.

Implementar:

1.  Reutilizar os dados acadêmicos existentes.
2.  Organizar formação, disciplinas e atividades em uma linha do tempo.
3.  Permitir expandir cada período.
4.  Conectar atividades aos projetos relacionados.
5.  Manter notas e informações acadêmicas consistentes com a página
    original.

Não duplique dados acadêmicos em um novo arquivo se já houver uma fonte
única.

## Passo 15. Cliente --- Jornada de solução

Objetivo: mostrar como o trabalho pode atender a uma necessidade
concreta.

Implementar:

1.  Destacar os serviços disponíveis.
2.  Explicar o processo de trabalho.
3.  Conectar cada serviço a exemplos reais.
4.  Apresentar FAQ relevante.
5.  Facilitar o acesso ao formulário de contato.
6.  Manter informações comerciais e condições atualizadas.

Não invente preços, prazos ou garantias.

## Passo 16. Amigo --- Exploração e descobertas

Objetivo: tornar a navegação mais descontraída.

Reaproveitar:

-   Jogos existentes.
-   Comandos de personalidade.
-   Campo minado.
-   Troca de tema e idioma.
-   Conquistas e contador de segredos já implementados.

Melhorias possíveis:

1.  Criar uma entrada visual para a área de exploração.
2.  Mostrar dicas progressivas sem revelar todos os segredos.
3.  Conectar as conquistas à trilha existente.
4.  Permitir reiniciar a exploração.
5.  Evitar adicionar animações pesadas ou distrações permanentes.

### Critério de aceite da Fase 4

Cada experiência deve ser útil, acessível, opcional e baseada em
funcionalidades ou fatos existentes.

------------------------------------------------------------------------

# Fase 5 --- Busca e descoberta contextual

**Prioridade: P2**

## Passo 17. Tornar a busca sensível à persona

Se o site já possui busca, adapte a ordenação dos resultados:

-   Tech: projetos, GitHub, stack e estudos de caso primeiro.
-   RH: currículo, experiências e contato primeiro.
-   Professor: acadêmico, formação e projetos primeiro.
-   Cliente: serviços, cases e contato primeiro.
-   Amigo: sobre, jogos e projetos pessoais primeiro.

A busca não deve esconder resultados. Apenas priorizar os mais
relevantes.

## Passo 18. Criar uma área "O que você procura?"

Como alternativa ou complemento à busca, ofereça atalhos por intenção:

-   Conhecer competências.
-   Avaliar projetos.
-   Entender a trajetória acadêmica.
-   Encontrar serviços.
-   Conhecer a pessoa.

Ao selecionar uma intenção, encaminhe o visitante para o conteúdo
adequado. Não é necessário pedir novamente a persona se ela já estiver
definida.

### Critérios de aceite da Fase 5

-   [x] Resultados são priorizados conforme a persona.
-   [x] Nenhum resultado relevante desaparece.
-   [x] A busca funciona sem persona.
-   [x] A navegação por intenção não cria uma segunda estrutura de rotas
    desnecessária.

------------------------------------------------------------------------

# Fase 6 --- Qualidade, acessibilidade e validação

**Prioridade: P0 antes de publicar cada fase**

## Passo 19. Validar os cinco contextos

Para cada persona:

1.  Acesse a home sem persona.
2.  Escolha a persona.
3.  Confira introdução, blocos e CTA.
4.  Abra um projeto contextual.
5.  Navegue para outra página.
6.  Confira as próximas ações.
7.  Inicie e interrompa a trilha.
8.  Troque de persona.
9.  Volte à persona anterior e confira a persistência.

## Passo 20. Validar desktop e mobile

Testar pelo menos:

-   Desktop: `1440 × 900`.
-   Mobile: `390 × 844`.

Verificar:

-   Sem rolagem horizontal.
-   Cards sem conteúdo cortado.
-   CTAs acessíveis.
-   Tour sem cobrir o elemento destacado.
-   Texto legível.
-   Menu e navegação funcionais.
-   Sem sobreposição entre avisos, painéis e conteúdo.

## Passo 21. Validar acessibilidade

-   Navegação completa por teclado.
-   Foco visível.
-   Estados anunciados com `aria-live` quando necessário.
-   Botões com nomes acessíveis.
-   Contraste AA.
-   Respeito a `prefers-reduced-motion`.
-   Teste com leitor de tela.
-   Nenhuma interação dependente exclusivamente de hover.

## Passo 22. Validar desempenho e manutenção

-   Lazy-load de componentes pesados quando apropriado.
-   Evitar carregar cinco composições completas simultaneamente.
-   Evitar bibliotecas externas para interações simples.
-   Manter dados de persona centralizados.
-   Não duplicar conteúdo entre PT e EN de forma inconsistente.
-   Verificar o tamanho do JS inicial.
-   Confirmar que o site continua funcional com `localStorage`
    indisponível.

## Passo 23. Executar a validação técnica

Ajuste os comandos conforme os scripts reais do `package.json`.

``` bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Se o projeto usar pnpm, use os equivalentes com `pnpm`.

Depois:

1.  Rode a verificação visual do projeto (`/verify-site`, se
    disponível).
2.  Confira as rotas `/r/rh`, `/r/tech`, `/r/professor`, `/r/amigo` e
    `/r/cliente`.
3.  Confira PT e EN.
4.  Teste a impressão do currículo.
5.  Confira o console do navegador.
6.  Atualize `status.md` com evidências reais.

------------------------------------------------------------------------

# 3. Ordem recomendada de implementação

Não implemente todas as fases ao mesmo tempo. Trabalhe em entregas
pequenas.

  Ordem   Entrega                                           Prioridade
  ------- ------------------------------------------------- ------------
  1       Auditoria das personas e trilhas existentes       P0
  2       Resolver pendências críticas documentadas         P0
  3       Dashboard adaptativo na home                      P0
  4       Cards de projetos contextuais                     P0
  5       Próximas ações integradas à navegação             P1
  6       Melhorias de continuidade das trilhas             P1
  7       Experiência técnica com diagrama de arquitetura   P2
  8       Experiência acadêmica em linha do tempo           P2
  9       Jornada contextual do cliente                     P2
  10      Busca e descoberta contextual                     P2
  11      Refinamentos da experiência de amigo              P2
  12      Auditoria final e documentação                    P0

------------------------------------------------------------------------

# 4. Organização sugerida das tarefas

Uma tarefa por commit, com escopo pequeno e testável.

Sugestão de identificadores:

-   `PER-01`: auditoria e linha de base.
-   `PER-02`: composição adaptativa da home.
-   `PER-03`: introduções e CTAs contextuais.
-   `PER-04`: modelo de perspectivas dos projetos.
-   `PER-05`: cards contextuais.
-   `PER-06`: próximas ações por página.
-   `PER-07`: integração da navegação com as trilhas.
-   `PER-08`: exploração de arquitetura para tech.
-   `PER-09`: linha do tempo acadêmica.
-   `PER-10`: jornada de solução para cliente.
-   `PER-11`: busca contextual.
-   `PER-12`: validação final e documentação.

Antes de começar cada tarefa:

1.  Leia os arquivos relacionados.
2.  Escreva os critérios de aceite.
3.  Implemente o menor incremento funcional.
4.  Crie ou atualize testes.
5.  Rode as verificações.
6.  Faça captura visual quando houver mudança de interface.
7.  Atualize o status da tarefa.
8.  Faça um commit com o identificador da tarefa.

------------------------------------------------------------------------

# 5. Regras de arquitetura que não devem ser quebradas

1.  **Uma fonte de verdade:** persona e trilha continuam sendo dados
    centralizados.
2.  **Uma aplicação:** não criar cinco sites ou cinco homes
    independentes.
3.  **Conteúdo preservado:** a persona altera prioridade e apresentação,
    nunca remove conteúdo relevante.
4.  **Sem fatos inventados:** todo texto contextual deve ser sustentado
    pelo conteúdo real do portfólio.
5.  **Privacidade:** escolha e progresso permanecem locais; não
    adicionar rastreamento por persona.
6.  **PT/EN:** toda nova experiência deve ter paridade de idioma.
7.  **Acessibilidade:** nenhuma funcionalidade pode depender apenas de
    mouse, cor ou animação.
8.  **Mobile-first:** cada componente contextual precisa funcionar em
    telas pequenas.
9.  **Reutilização:** adaptar componentes existentes antes de criar
    novos.
10. **Progressividade:** a experiência deve continuar útil mesmo sem
    persona escolhida, sem trilha iniciada ou com armazenamento local
    bloqueado.

------------------------------------------------------------------------

# 6. Definição de pronto

A evolução estará pronta quando:

-   [ ] Cada persona tiver uma home com prioridades claramente
    diferentes.
-   [ ] Os projetos apresentarem perspectivas adequadas ao visitante.
-   [ ] A navegação sugerir próximos passos coerentes.
-   [ ] As trilhas estiverem integradas à experiência sem serem
    intrusivas.
-   [ ] Nenhum conteúdo tiver sido escondido ou inventado.
-   [ ] Todas as experiências funcionarem em PT e EN.
-   [ ] Desktop e mobile estiverem validados.
-   [ ] Acessibilidade e desempenho estiverem verificados.
-   [ ] Testes, lint, typecheck e build passarem.
-   [ ] A documentação refletir o estado real da implementação.

## Recomendação final

Comece pelas **Fases 0, 1 e 2**. Elas entregam a maior diferença
percebida: o visitante entende imediatamente que o site se adaptou ao
seu objetivo e encontra projetos apresentados sob a perspectiva que mais
importa para ele.

As experiências específicas das Fases 4 e 5 devem vir depois. O
principal diferencial não será ter muitas animações ou efeitos, mas
fazer cada visitante encontrar a informação certa, na ordem certa e com
o contexto certo.
