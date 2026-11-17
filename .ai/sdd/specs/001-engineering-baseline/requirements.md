# 001 Engineering baseline, Requirements
**Status:** approved (v1.3 aprovada pela Duda em 2026-11-15)   **Version:** 1.3   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-15

## Changes since first draft
### Versão 1.3 (a pedido da Duda; aplica só L-001, L-002, L-003, L-004, L-005, L-007, L-008 e L-012 do `design.md`)
1. **L-001, FR-009:** o caminho da imagem precisa ser local (começar com uma única `/`); endereço externo é recusado (princípio 5, sem hotlink).
2. **L-002, FR-011:** o hífen do identificador da etiqueta só separa partes: não abre, não fecha nem se repete.
3. **L-003, FR-010:** também são recusados `mailto:` com parâmetros (`?subject=`, que a Duda decidiu não aceitar nesta versão), `https` com usuário e senha, e `/\host`.
4. **L-004, FR-015:** reescrito para ser testável: a falta de um idioma fica impossível em produção, e nenhuma função de leitura de texto localizado devolve a chave nem o outro idioma.
5. **L-005, FR-016:** "variável exposta ao navegador" substitui "variável exposta ao público". A lista de padrões, o prefixo `VITE_` e as exceções (EmailJS) ficam no design, não no requisito.
6. **L-007, FR-004:** a suíte completa passa **três vezes seguidas**.
7. **L-008, FR-001:** a validação de conteúdo e a varredura de segredos rodam **dentro** da etapa de testes e da de geração do site, não como etapas à parte.
8. **L-012, FR-018 (novo):** nota de 0,5 a 5 em passos de 0,5; "sem nota" é ausência de valor, nunca 0.
9. **Não aplicadas, por decisão da Duda:** L-006 (o NFR-001 continua como está), L-009 e L-010 (só ratificadas no design, sem editar o requisito) e L-011 (steering, depois de aprovar o design).
10. **Constraints (branch):** a regra de branch foi corrigida (ver Constraints): `rebuild/sdd`, push só quando a Duda pedir, merge na `main` no lançamento.
11. **Estado:** v1.3 **aprovada pela Duda em 2026-11-15**; o `.status` passa a `design:approved` junto com a aprovação do design.

### Versão 1.2
1. **NFR-001:** o custo de 5 s da validação passou a ser medido com conteúdo de exemplo (a migração é a spec 003, que herda a medição com o conteúdo real).
2. **FR-010 e a tabela de links:** `//host` (sem protocolo) é recusado e `mailto:` é aceito (decisão da Duda), com linhas novas na tabela e uma entrada na FAQ.
3. **Dono da remoção fora do MVP:** a 001 lista, no `design.md`, o código e os testes de trilhas, personas, jogos e assistente de IA para a Duda aprovar, e remove nas suas tarefas (FR-004, FR-006, D-004, FAQ). Os 3 temas extras saem com a 002.
4. **FR-016 (varredura de segredos)** passou de Should para Must, alinhando-o aos Goals, aos Success Metrics e ao princípio 6 do steering.
5. **FR-009:** o arquivo da imagem precisa existir no caminho informado. **FR-013:** "oferecer" virou "formatar".

### Versão 1.1
Esta spec nasceu da divisão da antiga `001-foundation-and-design-system` (a outra metade é a `002-design-system-and-shell`). A tabela de rastreio no fim mostra o ID antigo de cada item.
1. **Divisão:** a base de engenharia (verificação, testes, schemas, paridade de idiomas, datas) virou esta spec e vem primeiro.
2. **Perguntas respondidas:** Q-001 (orçamento de tempo) respondida; a integração contínua saiu da spec e foi para a 010.
3. **Datas:** a regra "cada item mostra o que tem" vale no FR-013 e na FAQ (antes elas se contradiziam).
4. **Sem nome de ferramenta nos requisitos:** `npm`, `vitest` e afins foram para as "Notas para o design".
5. **Requisitos compostos separados:** o antigo FR-017 virou FR-001 a FR-003 e o antigo FR-012 virou FR-007 a FR-012.
6. **IDs:** os `D-` e `Q-` são locais a esta spec; as decisões da visão aparecem como `V-D-NNN` e as perguntas do plano como `P-Q-NNN`.
7. **Orçamento de tempo** passou a ser meta a confirmar no design, com a condição de medição declarada (a medição de 638 s da auditoria rodou junto com outros comandos e a causa nunca foi investigada).

## Overview
A base de engenharia é o que garante que o resto do site seja construído sobre chão firme: um único comando que diz se está tudo certo, uma suíte de testes sem falhas e rápida, regras de dados que recusam conteúdo errado antes de ir ao ar, e a garantia de que nenhum texto fica sem tradução. Vem antes de tudo porque não depende da identidade visual e porque todas as outras specs a usam. Serve à Duda, que adiciona conteúdo e precisa saber que nada quebrou.

## Goals
- Um único comando de verificação roda formatação, lint sem avisos, tipos estritos, testes e a geração do site, e termina em até 120 s (meta; o design confirma, ver Q-001).
- A suíte de testes termina em até 60 s e sem nenhuma falha (meta; o design confirma).
- Conteúdo inválido (data, imagem sem texto alternativo, texto sem PT ou EN, link malformado, etiqueta repetida) quebra a verificação com o arquivo, o campo e o motivo.
- Texto de interface ou de conteúdo faltando em um dos idiomas quebra a verificação.
- Nenhum segredo conhecido no código rastreado.

## Non-Goals (v1)
- **Identidade visual, casca, temas, navegação e endereços por idioma:** spec 002.
- **Integração contínua:** spec 010 (a Duda não dá `push` por enquanto, então um CI agora não rodaria).
- **Schemas de projeto, filme, livro e diário:** cada um nasce na spec dona; aqui só as primitivas que todos reutilizam.
- **Migração do conteúdo existente:** spec 003.
- **Atualizar versões maiores de dependências:** o steering manda não atualizar sem spec.
- **Medir desempenho de página e acessibilidade:** specs 002 e 010; esta spec só mede o tempo da própria verificação.
- **Reescrever toda a suíte antiga:** só se corrige ou remove o que falha ou o que cobre código removido (FR-004, FR-006).
- **Remover os 3 temas extras (dracula, solarized, amber):** saem com a spec 002, que substitui o sistema de temas.

## User Stories
### US-001: Adicionar conteúdo sem medo
**As a** Duda, **I want to** que a verificação recuse conteúdo errado, **so that** nada inválido chegue ao ar.
**Acceptance criteria:**
- [x] Uma data com mês 13, uma imagem sem `alt` ou com caminho externo, um texto sem PT ou EN, ou uma nota de 4,3 fazem a verificação falhar.
- [x] A mensagem de erro diz o arquivo, o campo e o motivo.
- [x] Conteúdo válido passa sem erro.

### US-002: Confiar em um comando
**As a** Duda, **I want to** rodar um comando e saber se está tudo certo, **so that** eu não precise lembrar de cinco.
**Acceptance criteria:**
- [x] O comando termina com código 0 quando todas as etapas passam e com código diferente de 0 se qualquer etapa falhar.
- [x] A saída diz qual etapa falhou.
- [x] As cinco etapas rodam na mesma ordem toda vez.
- [x] A verificação falha se houver um segredo conhecido em arquivo rastreado (FR-016).

### US-003: Nenhum texto sem tradução
**As a** Duda, **I want to** que a falta de uma tradução seja pega antes do lançamento, **so that** um entrevistador não veja texto cru ou em outro idioma.
**Acceptance criteria:**
- [x] Remover a tradução EN de uma chave faz a verificação falhar nomeando a chave e o idioma que falta.
- [x] Em produção, nunca aparece a chave crua nem o texto do outro idioma como reserva.

### US-004: Uma suíte em que eu confio
**As a** Duda, **I want to** uma suíte rápida e sem falhas, **so that** eu a rode toda vez e uma falha signifique um problema real.
**Acceptance criteria:**
- [x] A suíte completa termina com 0 falhas.
- [x] A suíte termina dentro do orçamento (FR-005), medida sem outros processos pesados rodando.

## Functional Requirements
### FR-001: Comando único de verificação (Must Have) — US-002
THE SYSTEM SHALL oferecer um único comando de verificação que executa, nesta ordem: checagem de formatação, lint com zero avisos, verificação estrita de tipos, testes e geração do site. A validação de conteúdo (FR-007 a FR-012, FR-018) e a varredura de segredos (FR-016) rodam dentro da etapa de testes e da etapa de geração do site, e não como etapas à parte.

### FR-002: Parada na primeira falha (Must Have) — US-002
WHEN qualquer etapa do comando de verificação falhar, THE SYSTEM SHALL parar, indicar qual etapa falhou e sair com código diferente de 0.

### FR-003: Sucesso (Must Have) — US-002
WHEN todas as etapas passarem, THE SYSTEM SHALL sair com código 0.

### FR-004: Suíte sem falhas (Must Have) — US-004
THE SYSTEM SHALL ter uma suíte de testes em que nenhum teste falha: a suíte completa SHALL passar três vezes seguidas, e cada teste que falha hoje SHALL ser corrigido ou removido conforme o FR-006. Esta spec é a dona dessa limpeza, inclusive da remoção do código fora do MVP (trilhas, personas, jogos e assistente de IA), nos termos do FR-006.

### FR-005: Orçamento de tempo (Must Have) — US-004
THE SYSTEM SHALL executar a suíte completa em até 60 s e o comando de verificação completo em até 120 s, medidos com a máquina sem outros processos pesados.
O design mede o tempo real e, se a meta for inviável, propõe outro número para a Duda aprovar antes de seguir.

### FR-006: Teste de código removido (Must Have) — US-004
IF um teste falhar porque cobre código que esta ou outra spec remove, THE SYSTEM SHALL remover o teste junto com o código e listar os dois no `design.md`.
IF um teste falhar e cobrir comportamento que permanece, THE SYSTEM SHALL corrigir o código ou o teste, e não o silenciar nem pular.
THE `design.md` desta spec SHALL listar, para a Duda aprovar, os arquivos e os testes de cada funcionalidade fora do MVP (trilhas, personas, jogos e assistente de IA); a remoção SHALL acontecer nas tarefas desta spec, e só depois de a Duda aprovar a lista.
Os 3 temas extras saem com a spec 002 (que substitui o sistema de temas), e o código substituído por qualquer outra spec sai nas tarefas dela.

### FR-007: Texto localizado (Must Have) — US-001
THE SYSTEM SHALL validar todo texto de conteúdo com versão em PT e em EN, ambas obrigatórias e não vazias depois de remover espaços das pontas.

### FR-008: Data (Must Have) — US-001
THE SYSTEM SHALL validar toda data com ano obrigatório de 4 dígitos e mês opcional entre 1 e 12.

### FR-009: Imagem (Must Have) — US-001
THE SYSTEM SHALL validar toda imagem com caminho, texto alternativo em PT e em EN (não vazios), largura e altura em pixels (inteiros positivos), e o arquivo da imagem SHALL existir no caminho informado; sem isso a página mostraria uma imagem quebrada. O caminho SHALL ser local (começar com uma única `/`); endereço externo é recusado.

### FR-010: Link (Must Have) — US-001
THE SYSTEM SHALL validar todo link como um destes três formatos: endereço absoluto `https`; caminho interno que começa com uma única `/`; ou `mailto:` seguido de um endereço de e-mail de formato válido. THE SYSTEM SHALL recusar endereço sem protocolo (`//host`), `http`, `javascript:`, `tel:` e qualquer outro formato. THE SYSTEM SHALL recusar também `mailto:` com parâmetros (por exemplo `?subject=`), `https` com usuário e senha (`https://usuario:senha@host`) e a forma `/\host`.

### FR-011: Etiqueta (Must Have) — US-001
THE SYSTEM SHALL validar toda etiqueta (tag) com identificador em minúsculas, números e hífen e rótulo localizado, e o identificador SHALL ser único no conjunto de etiquetas. O hífen só separa partes: o identificador não pode começar com hífen, terminar com hífen nem ter dois hífens seguidos.

### FR-012: Falha de validação (Must Have) — US-001
IF um conteúdo violar qualquer regra dos FR-007 a FR-011, THE SYSTEM SHALL falhar a verificação e a geração do site, com a mensagem indicando arquivo, campo e motivo.

### FR-013: Exibição de data (Must Have) — US-001
THE SYSTEM SHALL formatar cada data com o que ela tem: sem mês, só o ano; com mês, mês abreviado e ano.
THE SYSTEM SHALL expor, para cada par de itens do mesmo ano, se a ordem entre eles é indeterminada: é indeterminada quando algum dos dois não tem mês ou quando os meses são iguais. Nunca se supõe um mês.

### FR-014: Paridade de tradução (Must Have) — US-003
IF uma chave de texto de interface ou de conteúdo existir em só um idioma, THE SYSTEM SHALL falhar a verificação indicando a chave e o idioma que faltam.

### FR-015: Sem texto de reserva (Must Have) — US-003
THE SYSTEM SHALL tornar impossível, em produção, a falta de um idioma (FR-007, FR-012 e FR-014), e SHALL NOT devolver, em nenhuma função de leitura de texto localizado, a chave crua nem o texto do outro idioma como reserva.

### FR-016: Varredura de segredos (Must Have) — US-002
WHEN o comando de verificação rodar, THE SYSTEM SHALL falhar se encontrar padrão de segredo em arquivo rastreado ou em variável exposta ao navegador. A lista de padrões, o critério de "variável exposta ao navegador" e as exceções são definidos no design.

### FR-017: Integração contínua (Won't nesta spec)
THE SYSTEM WON'T rodar a verificação em integração contínua nesta spec; vai para a 010.

### FR-018: Nota (Must Have) — US-001
THE SYSTEM SHALL validar toda nota como número de 0,5 a 5 em passos de 0,5 (0,5; 1; 1,5; … 5). A nota ausente SHALL significar "sem nota" e SHALL NOT ser tratada como 0; o valor 0 e qualquer valor fora do passo de 0,5 ou do intervalo são recusados.

## Non-Functional Requirements
### NFR-001: Performance
- Suíte completa ≤ 60 s e verificação completa ≤ 120 s, na máquina de desenvolvimento da Duda, sem outros processos pesados (metas; ver FR-005).
- A validação de conteúdo (FR-007 a FR-012) acrescenta no máximo 5 s ao comando de verificação, medida com conteúdo de exemplo de 200 itens de cada tipo. A migração é a spec 003, que repete a medição com o conteúdo real e falha se passar de 5 s.
- O tempo é registrado a cada execução do comando de verificação, para a regressão aparecer.

### NFR-002: Segurança
- Nenhum segredo no código rastreado nem em variável exposta ao navegador (FR-016).
- Nenhum dado de teste contém credencial real.
- Os pacotes de produção não têm vulnerabilidade conhecida reportada pela ferramenta de auditoria de dependências (hoje: 0).

### NFR-003: Acessibilidade
Parcialmente N/A: esta spec não renderiza interface. Ela só garante, na camada de dados, que toda imagem tem texto alternativo em PT e em EN (FR-009). Contraste, teclado e leitores de tela são da spec 002.

## Constraints
- Stack e host conforme `.ai/steering/tech-stack.md` (V-D-014, V-D-013).
- A reconstrução fica na branch `rebuild/sdd`, com `git push` só quando a Duda pedir; o merge na `main` só no lançamento (spec 010), porque o Netlify publica a partir dela (V-D-015, corrigida em 2026-11-15); o código novo substitui o antigo no lugar (P-Q-001).
- O comando de verificação roda no Windows (PowerShell e Git Bash) e em Linux, sem depender de recursos de um só.
- Nenhum dado inventado: conteúdo de exemplo nos testes é marcado como exemplo.
- Aprovação só pela Duda.

## Decisions
### D-001: Metas de tempo como metas, não como fatos
**Decision:** 60 s para a suíte e 120 s para a verificação são metas; o design mede e confirma. **Rationale:** a medição de 638 s da auditoria rodou concorrente com outros comandos e a causa nunca foi investigada. **Alternatives considered:** fixar os números sem medir (arrisca uma meta inviável); adiar o número (a pergunta ficaria aberta).

### D-002: Integração contínua sai desta spec
**Decision:** vai para a 010. **Rationale:** sem `push` não existe repositório remoto para rodar o CI. **Alternatives considered:** criar o fluxo agora sem efeito (trabalho sem retorno).

### D-003: Cada item mostra o que tem
**Decision:** item sem mês mostra só o ano, item com mês mostra mês e ano, e a ordem é marcada como indeterminada quando não dá para decidir. **Rationale:** não esconde um mês que a Duda confirmou e nunca supõe um mês que ela não deu. **Alternatives considered:** todos os itens do ano mostram só o ano se algum não tem mês (uniforme, mas esconde dado confirmado).

### D-004: A 001 é dona da remoção do código fora do MVP
**Decision:** o `design.md` desta spec lista o código e os testes de trilhas, personas, jogos e assistente de IA; a Duda aprova a lista; a remoção acontece nas tarefas desta spec. Os 3 temas extras saem com a 002. **Rationale:** tira os testes que falham hoje (trilhas) antes de a suíte virar gate, e dá um dono único à remoção. **Alternatives considered:** cada spec remove o que substitui (o código morto e os testes que falham ficariam por muito tempo e a suíte não fecharia).

### D-005: Varredura de segredos é Must
**Decision:** FR-016 é obrigatório. **Rationale:** o princípio 6 do steering proíbe segredo no cliente e no repositório, e os Goals e os Success Metrics já o prometem. **Alternatives considered:** deixá-lo Should e tirar a promessa dos Goals e das métricas (menos escopo, mais risco).

## Questions
### Q-001 (answered): orçamento de tempo
A Duda confirmou suíte de testes ≤ 60 s e verificação completa ≤ 120 s como metas. O design as confirma por medição (D-001).

### Q-002 (answered): integração contínua
A Duda decidiu mover o CI para a spec 010 (D-002).

## Implementation FAQ
**Q:** Uma data tem o mês 13, o mês 0 ou só o mês, sem ano?
**A:** Todas são inválidas e quebram a verificação: o ano de 4 dígitos é obrigatório e o mês vai de 1 a 12 (FR-008).

**Q:** Uma tradução existe só em PT, ou só em EN?
**A:** A verificação falha nomeando a chave e o idioma que falta (FR-014). Em produção não há texto de reserva (FR-015).

**Q:** Um texto é só espaços, ou vazio?
**A:** É tratado como ausente e falha (FR-007).

**Q:** Duas etiquetas têm o mesmo identificador?
**A:** A segunda é um erro de verificação (FR-011).

**Q:** Um item sem mês e outro com mês no mesmo ano: o que cada um mostra e qual vem primeiro?
**A:** Cada um mostra o que tem: um mostra só o ano, o outro mostra mês e ano. A ordem entre eles é marcada como indeterminada, porque o mês do primeiro não existe (FR-013).

**Q:** Dois itens do mesmo ano têm o mesmo mês?
**A:** A ordem entre eles também é indeterminada (FR-013).

**Q:** Um teste que falha cobre uma funcionalidade fora do MVP (por exemplo as trilhas)?
**A:** Esta spec é a dona da remoção (FR-004, FR-006): o `design.md` lista o código e os testes de trilhas, personas, jogos e assistente de IA, a Duda aprova a lista e a remoção acontece nas tarefas desta spec. Nunca se silencia o teste.

**Q:** O código que será removido é importado por uma página do MVP?
**A:** O design confere isso ao montar a lista: a lista mostra os arquivos que importam o código removido, e a remoção só segue com a geração do site e a suíte passando. Se uma página do MVP depender do código, o design propõe como separá-lo, e a Duda aprova.

**Q:** Os 3 temas extras (dracula, solarized, amber) saem aqui?
**A:** Não: saem com a spec 002, que substitui o sistema de temas.

**Q:** Um link é `//exemplo.com`, `mailto:` sem endereço ou `tel:123`?
**A:** Os três são erros de verificação (FR-010). `mailto:` com e-mail de formato válido é aceito.

**Q:** Uma imagem aponta para `https://...` (hotlink)?
**A:** A verificação falha: o caminho precisa ser local (FR-009, princípio 5 do steering).

**Q:** Um item não tem nota, ou tem nota 0?
**A:** Sem nota é ausência de valor e mostra sem estrelas. Nota 0 é erro, porque o intervalo vai de 0,5 a 5 em passos de 0,5 (FR-018). A média de vários critérios (a nota de um projeto) é calculada pela spec dona do catálogo (005), que decide o arredondamento; esta spec só valida as notas informadas.

**Q:** A suíte passa uma vez e falha na segunda por carga?
**A:** Conta como falha: a suíte completa precisa passar três vezes seguidas (FR-004).

**Q:** O caminho de uma imagem está certo mas o arquivo foi renomeado ou apagado?
**A:** A verificação falha com "arquivo não encontrado" (FR-009), em vez de publicar uma imagem quebrada.

**Q:** Um teste falha porque o código dele foi substituído por uma spec que ainda não foi implementada?
**A:** Não se remove antes da hora: a remoção acontece na tarefa da spec que remove o código. Até lá, o teste fica na lista de pendências do design (dependência entre specs).

**Q:** O comando de verificação passa na minha máquina e falha em outra?
**A:** O comando não depende de recursos de um só sistema (Constraints). Uma diferença entre máquinas é um defeito do comando.

**Q:** O conteúdo está vazio (nenhum projeto ainda)?
**A:** Uma lista vazia é válida; o schema valida os itens, não a quantidade. A spec dona do conteúdo diz se a página aceita lista vazia.

## Success Metrics
- [x] O comando de verificação sai com 0 numa máquina limpa, em até 120 s.
- [x] A suíte completa termina com 0 falhas, três vezes seguidas, em até 60 s (meta; o tempo aprovado pelo design é registrado no design).
- [x] Uma data inválida, uma imagem sem `alt` ou com arquivo inexistente, um link `//host`, uma tradução removida e uma etiqueta repetida quebram a verificação, cada uma com mensagem de arquivo, campo e motivo (testado).
- [x] O código fora do MVP (trilhas, personas, jogos, assistente de IA) foi removido na lista aprovada pela Duda, e a geração e a suíte passam.
- [x] O tempo de cada execução fica registrado.
- [x] A varredura de segredos acha uma credencial de teste plantada e passa sem ela.

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| A meta de 60 s é inviável com a suíte atual | Média | Médio | D-001: o design mede e propõe outro número; a Duda aprova |
| Os 638 s tinham outra causa (por exemplo um teste que não termina) | Média | Médio | Investigar a causa no design antes de reescrever testes |
| Remover testes de código antigo some com cobertura útil | Média | Médio | FR-006: lista aprovada pela Duda; nunca silenciar |
| O código fora do MVP é importado por página do MVP | Média | Médio | O design lista quem importa cada arquivo; a remoção só segue com geração e suíte passando |
| A varredura de segredos dá falso positivo em dado de teste | Média | Baixo | Dados de teste marcados como exemplo; exceções listadas com motivo no design |
| Schemas rígidos demais barram conteúdo legítimo | Baixa | Baixo | Tabelas de entrada e saída abaixo; ajustar com aprovação |
| O comando não roda igual no Windows e em Linux | Média | Médio | Constraint de ambos; verificação nos dois |

## Validação: entrada → resultado
| Campo | Entrada | Resultado |
| --- | --- | --- |
| Texto localizado | `{pt:"Olá", en:"Hello"}` | válido |
| Texto localizado | `{pt:"Olá"}` | erro: `en` ausente |
| Texto localizado | `{pt:"  ", en:"Hello"}` | erro: `pt` vazio |
| Data | `{year:2025, month:3}` | válida |
| Data | `{year:2025}` | válida |
| Data | `{year:2025, month:13}` | erro: mês fora de 1 a 12 |
| Data | `{year:2025, month:0}` | erro: mês fora de 1 a 12 |
| Data | `{month:3}` | erro: ano ausente |
| Data | `{year:"2025"}` | erro: ano não é inteiro |
| Data | `{year:25}` | erro: ano sem 4 dígitos |
| Imagem | caminho, alt PT e EN, 800×600 | válida |
| Imagem | alt EN vazio | erro: texto alternativo |
| Imagem | largura 0 ou 12,5 | erro: dimensão |
| Imagem | caminho que não existe no disco | erro: arquivo não encontrado |
| Imagem | caminho `https://exemplo.com/x.png` | erro: caminho externo (precisa ser local) |
| Imagem | caminho `//cdn.exemplo.com/x.png` | erro: caminho externo (precisa ser local) |
| Link | `https://exemplo.com/a` | válido |
| Link | `/projetos` | válido |
| Link | `mailto:contato@exemplo.com` | válido |
| Link | `mailto:` (sem endereço) | erro: e-mail ausente |
| Link | `mailto:semarroba` | erro: formato do e-mail |
| Link | `mailto:contato@exemplo.com?subject=oi` | erro: `mailto:` com parâmetros |
| Link | `https://usuario:senha@exemplo.com` | erro: `https` com usuário e senha |
| Link | `/\exemplo.com` | erro: forma `/\host` |
| Link | `//exemplo.com/a` | erro: endereço sem protocolo |
| Link | `http://exemplo.com` | erro: precisa de `https` |
| Link | `javascript:alert(1)` | erro: formato não aceito |
| Link | `tel:123` | erro: formato não aceito |
| Link | `exemplo.com` | erro: formato |
| Etiqueta | `react-19` | válida |
| Etiqueta | `Meu Tema 19` | erro: formato do identificador |
| Etiqueta | `-react` | erro: hífen no início |
| Etiqueta | `react-` | erro: hífen no fim |
| Etiqueta | `react--19` | erro: dois hífens seguidos |
| Nota | `4,5` | válida |
| Nota | `0,5` e `5` | válidas (limites) |
| Nota | ausente | válida: "sem nota" (nunca 0) |
| Nota | `0` | erro: fora do intervalo (0,5 a 5) |
| Nota | `4,3` | erro: fora do passo de 0,5 |
| Nota | `5,5` | erro: fora do intervalo |
| Nota | `"4,5"` (texto) | erro: não é número |
| Etiqueta | `react` duas vezes | erro: identificador repetido |

## Exibição de data
| Item A | Item B | A mostra | B mostra | Ordem A × B |
| --- | --- | --- | --- | --- |
| 2025-03 | 2025-07 | mar/2025 | jul/2025 | determinada (A antes de B) |
| 2025-03 | 2025 | mar/2025 | 2025 | indeterminada (B sem mês) |
| 2025 | 2025 | 2025 | 2025 | indeterminada |
| 2025-03 | 2025-03 | mar/2025 | mar/2025 | indeterminada (meses iguais) |
| 2024-12 | 2025 | dez/2024 | 2025 | determinada (anos diferentes) |

## Notas para o design (ferramentas, fora dos requisitos)
- O comando de verificação será `npm run verify`, com Prettier, ESLint, `tsc --noEmit`, Vitest e `vite build`.
- Os schemas podem usar uma biblioteca de validação ou funções próprias; decide-se com motivo no design.
- Varredura de segredos: avaliar o que já existe em `netlify/assistant/secrets.test.ts` e `scripts/personalGuard.ts`.
- Formato exato do mês abreviado em PT e EN: definido no design.

## Rastreio com o primeiro rascunho
| ID no primeiro rascunho | ID aqui |
| --- | --- |
| US-005 | US-001 |
| US-006 | US-002 e US-004 |
| US-003 (parte da paridade) | US-003 |
| FR-017 | FR-001, FR-002, FR-003 |
| FR-018 | FR-004, FR-005, FR-006 (v1.2: a 001 é dona da remoção fora do MVP, D-004) |
| FR-016 (varredura de segredos, nasceu na divisão como Should) | FR-016 (v1.2: Must, D-005; v1.3: "variável exposta ao navegador", L-005) |
| (v1.3, L-001) | FR-009 (caminho local) |
| (v1.3, L-002) | FR-011 (hífen) |
| (v1.3, L-003) | FR-010 (`mailto:` com parâmetros, `https` com credenciais, `/\host`) |
| (v1.3, L-004) | FR-015 (testável) |
| (v1.3, L-007) | FR-004 (três vezes seguidas) |
| (v1.3, L-008) | FR-001 (validação e varredura dentro das etapas) |
| (v1.3, L-012) | FR-018 (novo: nota de 0,5 a 5 em passos de 0,5) |
| L-006, L-009, L-010, L-011 | Não aplicadas ao requisito por decisão da Duda (ver "Versão 1.3"); L-009 e L-010 são ratificadas no design |
| FR-012 | FR-007 a FR-012 |
| FR-013 | FR-013 |
| FR-011 | FR-014, FR-015 |
| NFR-001 (tempo de verificação) | NFR-001 |
| NFR-002 (segredos) | NFR-002, FR-016 |
| FR-020 (CI) | FR-017 (Won't; vai para a spec 010) |
| Q-002, Q-004 | Q-001, Q-002 |
| FR-001 a FR-010, FR-014, FR-015, FR-016, FR-019, FR-021 | spec 002 |

## Confirm before building
Não avance para o design sem restatar os FRs com suas palavras. Todas as perguntas Q-* desta spec já estão respondidas; se um critério for ambíguo, pergunte antes.
