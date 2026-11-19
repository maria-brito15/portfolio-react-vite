# 006 Case studies, Requirements
**Status:** approved (v1.0 aprovada pela Duda em 2026-11-19)   **Version:** 1.0   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-19

## Overview
O estudo de caso é a "resenha" do projeto: mostra **como a Duda pensa** (decisões, trade-offs, resultado), que é a evidência de engenharia mais valiosa para entrevistadores. Reaproveita o detalhe do projeto (spec 005) e migra os casos existentes sem acrescentar texto.

## Goals
- Cada caso mostra escopo, índice das seções, decisões com ganho e custo, e resultado.
- O texto atual dos casos é preservado, em PT e EN.
- O visitante navega entre seções por um índice acessível, sem depender só de cor.

## Non-Goals (v1)
- **Escrever casos novos ou ampliar os atuais:** só migração; texto novo é da Duda.
- **Comentários e compartilhamento social:** o produto não é rede social nem blog.
- **CMS ou editor:** casos vivem em arquivo.
- **Diário e ligações com filmes:** fora do MVP.

## User Stories
### US-001: Ler como ela decidiu
**As a** entrevistador, **I want to** ver cada decisão com seu ganho e seu custo, **so that** eu avalie o raciocínio.
**Acceptance criteria:**
- [ ] Cada decisão do caso tem ganho e custo visíveis.
- [ ] O caso diz o escopo do material (o que cobre e o que não cobre).

### US-002: Navegar pelo caso
**As a** leitor com pouco tempo, **I want to** um índice das seções, **so that** eu pule para o que interessa.
**Acceptance criteria:**
- [ ] Escolher uma seção no índice leva a ela e a destaca no índice, sem depender só de cor.
- [ ] O índice funciona por teclado.

### US-003: Casos fiéis
**As a** Duda, **I want to** que o caso migrado seja idêntico ao atual, **so that** nada seja inventado.
**Acceptance criteria:**
- [ ] Teste de equivalência: o texto do caso migrado é igual ao atual.

## Functional Requirements
### FR-001: Caso como conteúdo (Must Have) — US-003
THE SYSTEM SHALL manter cada estudo de caso em conteúdo validado (spec 003), com projeto de origem, escopo, seções, decisões, resultado e texto em PT e EN; nenhum texto de caso em componente.

### FR-002: Decisões (Must Have) — US-001
THE SYSTEM SHALL mostrar, para cada decisão, o que foi decidido, o ganho e o custo (trade-off), em tabela legível por leitor de tela.

### FR-003: Escopo do material (Must Have) — US-001
THE SYSTEM SHALL mostrar, no início do caso, o escopo do material.

### FR-004: Índice lateral (Must Have) — US-002
THE SYSTEM SHALL mostrar um índice das seções e, WHEN o visitante escolher uma seção, levá-lo a ela e destacá-la no índice com sublinhado ou peso, além da cor (002, FR-040).

### FR-005: Tela estreita (Should) — US-002
WHILE a largura for menor que o ponto de quebra do design, THE SYSTEM SHALL apresentar o índice como lista no topo, sem rolagem horizontal (Q-002).

### FR-006: Ligação com o projeto (Must Have) — US-001
THE SYSTEM SHALL ligar o caso ao seu projeto (e o projeto ao caso) e SHALL permitir que um projeto não tenha caso.

### FR-007: Fidelidade (Must Have) — US-003
THE SYSTEM SHALL ter teste de equivalência entre o texto atual e o migrado e SHALL NOT acrescentar nem resumir texto (os `[...]` do mockup são só ilustração).

### FR-008: Idiomas e endereço (Must Have) — US-003
THE SYSTEM SHALL servir cada caso em PT e EN com endereço por idioma (002, FR-020), a troca de idioma levando ao mesmo caso, e redirecionar o endereço antigo `/estudos-de-caso/whatsapp-dispatcher` (spec 010 faz o redirecionamento no lançamento; aqui o destino existe).

### FR-009: Sem JavaScript (Must Have) — US-002
THE SYSTEM SHALL entregar o caso inteiro no HTML sem JavaScript; o destaque da seção atual é aprimoramento.

## Non-Functional Requirements
### NFR-001: Performance
LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 em celular médio; o caso não carrega código de outras páginas.
### NFR-002: Segurança
Sem requisição a terceiros; sem HTML injetado a partir de texto de conteúdo.
### NFR-003: Acessibilidade
WCAG 2.1 AA; axe sem violação; hierarquia de títulos correta; âncoras com foco visível; tabela com cabeçalhos associados.

## Constraints
- Depende das specs 003 (conteúdo) e 005 (detalhe do projeto).
- Branch `rebuild/sdd`; sem `push` sem pedido; aprovação só pela Duda.

## Decisions
### D-001: Só migrar
**Decision:** nenhum texto novo. **Rationale:** AGENTS.md (nada inventado). **Alternatives considered:** completar os casos faltantes (conteúdo é da Duda).

## Questions
### Q-001 (answered, 2026-11-19): quantos casos?
O PLAN falava em "3 casos existentes", mas o código só tem **1** (WhatsApp Dispatcher). A Duda confirmou: **é 1 caso**. O PLAN foi corrigido (ver "Mudanças desde o plano"). A spec migra 1 caso; casos novos são conteúdo futuro da Duda.

### Q-002 (answered, 2026-11-19): índice em tela estreita
**Resposta da Duda: lista no topo** (FR-005 vale assim). Pergunta original:
Lista no topo, ou recolhível? Sugestão: lista no topo.

### Q-003 (answered, 2026-11-19): estrutura do caso
**Resposta da Duda: modelo fixo** (escopo, contexto, decisões com ganho e custo, resultado). Pergunta original:
As seções variam por caso, ou há um modelo fixo (contexto, decisões, resultado)? Define o schema.

### Q-004 (answered, 2026-11-19): marcação
**Resposta da Duda: aceita um conjunto pequeno de marcações** (parágrafo, lista, código, ênfase), com o teste de equivalência. Pergunta original:
Os casos atuais são componentes com marcação própria. Aceita que o conteúdo migrado use um conjunto pequeno de marcações (parágrafo, lista, código, ênfase)?

## Implementation FAQ
**Q:** Um projeto sem caso?
**A:** A página do projeto não mostra link de caso (FR-006).

**Q:** Uma decisão sem custo informado?
**A:** Erro de verificação: ganho e custo são obrigatórios (FR-002).

**Q:** Um caso só existe em PT?
**A:** A verificação falha (001, FR-014).

## Success Metrics
- [ ] Todos os casos existentes migrados e com teste de equivalência verde.
- [ ] axe sem violação; Lighthouse ≥ 95 em acessibilidade, SEO e boas práticas.
- [ ] Índice por teclado e destaque sem depender só de cor, testados.
- [ ] Caso legível sem JavaScript.

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Caso hoje é JSX difícil de converter em dados | Alta | Médio | Q-004 e teste de equivalência |
| Poucos casos (1) deixam a página pobre | Alta | Baixo | Sem inventar; a Duda decide escrever mais depois |
| PLAN e código divergem (3 × 1) | Alta | Baixo | Q-001 antes de aprovar |

## Validação: entrada → resultado
| Entrada | Resultado |
| --- | --- |
| Decisão com ganho e custo | válida |
| Decisão sem custo | erro: custo ausente |
| Caso sem EN | erro: `en` ausente |
| Caso sem projeto de origem | erro de verificação |
| Âncora para seção inexistente | erro de verificação |

## Confirm before building
Responda Q-001 a Q-004 antes de aprovar; restate os FRs antes do design.
