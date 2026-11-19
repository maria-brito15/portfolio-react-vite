# 009 Terminal, Requirements
**Status:** approved (v1.0 aprovada pela Duda em 2026-11-19)   **Version:** 1.0   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-19

## Overview
O terminal é um diferencial para quem é técnico: uma forma alternativa de navegar o portfólio por comandos. Fica em `/terminal`, **fora do menu principal** (V-D-004), numa variante sem casca (spec 002, FR-041), e nunca é a única forma de ver uma informação. Esta spec o faz funcionar na casca nova, acessível, e sem comandos de funcionalidade removida.

## Goals
- `/terminal` abre e responde aos comandos finais, acessível a teclado e leitor de tela.
- Toda informação do terminal existe também nas páginas normais.
- Nenhum comando ou texto de funcionalidade fora do MVP (trilhas, personas, jogos, assistente de IA).
- Saída em PT e EN com paridade testada.

## Non-Goals (v1)
- **Terminal como home ou item do menu principal.**
- **Assistente de IA, jogos, easter eggs com estado persistente.**
- **Executar código real ou acessar rede.**
- **Cobrir todas as páginas futuras:** só as rotas existentes.
- **Redesenhar a casca:** é da 002.

## User Stories
### US-001: Navegar por comando
**As a** técnico curioso, **I want to** digitar comandos e abrir páginas, **so that** eu explore do meu jeito.
**Acceptance criteria:**
- [ ] `ajuda` lista os comandos; um comando de página abre ou resume a página.
- [ ] Comando desconhecido responde "digite ajuda".

### US-002: Usar sem mouse e com leitor de tela
**As a** leitor de tela, **I want to** que a saída seja anunciada, **so that** eu acompanhe o terminal.
**Acceptance criteria:**
- [ ] A saída de cada comando é anunciada numa região ao vivo.
- [ ] O primeiro item focável é "Sair do terminal".

### US-003: Nunca depender do terminal
**As a** RH, **I want to** achar tudo nas páginas normais, **so that** eu não precise do terminal.
**Acceptance criteria:**
- [ ] Cada informação do terminal tem página equivalente.

## Functional Requirements
### FR-001: Rota fora do menu (Must Have) — US-003
THE SYSTEM SHALL oferecer o terminal em `/terminal` (e `/en/terminal`), fora do menu principal e da navegação (002, FR-010), sem casca (002, FR-041).

### FR-002: Sair (Must Have) — US-002
THE SYSTEM SHALL ter "Sair do terminal" como primeiro item focável, que leva à home.

### FR-003: Anúncio (Must Have) — US-002
WHEN o visitante executar um comando, THE SYSTEM SHALL anunciar a saída numa região ao vivo educada.

### FR-004: Comando desconhecido (Must Have) — US-001
IF o comando não existir, THE SYSTEM SHALL responder com a dica "digite ajuda" e sugerir o comando mais parecido quando houver.

### FR-005: Conjunto de comandos (Must Have) — US-001
THE SYSTEM SHALL oferecer exatamente estes comandos (Q-001, respondida): `ajuda`, `ls`, `whoami`, `projetos`, `curriculo`, `academico`, `contato`, `home`; cada um com saída em PT e EN e atalho clicável; SHALL NOT existir comando de trilhas, personas, jogos, assistente de IA, `neofetch`, `fortunes`, `agora` ou `setup` (Q-004, respondida).

### FR-006: Equivalência (Must Have) — US-003
THE SYSTEM SHALL ler toda informação do terminal do mesmo conteúdo que as páginas (003), sem texto duplicado em comando; e cada comando de página SHALL ter rota equivalente na tabela única de rotas (002, FR-009).

### FR-007: Teclado (Must Have) — US-002
THE SYSTEM SHALL permitir operar tudo por teclado, com Tab para autocompletar, histórico por seta e foco visível.

### FR-008: Idiomas (Must Have) — US-001
THE SYSTEM SHALL mostrar a saída no idioma da rota e manter a troca de idioma levando ao mesmo estado (002, FR-021).

### FR-009: Sem JavaScript (Must Have) — US-003
THE SYSTEM SHALL mostrar, sem JavaScript, uma mensagem com links para as páginas normais.

### FR-010: Movimento reduzido (Should) — US-002
WHILE o visitante preferir movimento reduzido, THE SYSTEM SHALL desligar animações de digitação (002, FR-018).

### FR-011: Remoção de código morto (Must Have) — US-001
THE SYSTEM SHALL remover o código do terminal de funcionalidades removidas e o que a 002 e a 003 substituírem, nas tarefas desta spec.

### FR-012: Terminal na 404 (Must Have) — US-001, US-003
WHEN a página 404 base entregue pela spec 002 (FR-027, FR-039) existir, THE SYSTEM SHALL acrescentar a ela um terminal funcional, com o mesmo conjunto de comandos do FR-005 e os mesmos requisitos de acessibilidade do FR-003 e FR-007. A 404 SHALL manter o status 404 e as sugestões de rotas reais em texto normal, de modo que a informação não dependa do terminal. Esta spec SHALL NOT alterar o texto aprovado da spec 002.

### FR-013: Dica de primeira visita (Should) — US-001
THE SYSTEM SHALL mostrar a dica "digite ajuda" na primeira visita ao terminal; WHEN o armazenamento estiver bloqueado, THE SYSTEM SHALL mostrá-la a cada visita, sem erro (Q-003).

## Non-Functional Requirements
### NFR-001: Performance
O terminal carrega sob demanda e não aumenta o JavaScript inicial das outras páginas; INP ≤ 200 ms por comando.
### NFR-002: Segurança
Entrada tratada como texto (nunca avaliada como código nem injetada como marcação); sem requisição a terceiros.
### NFR-003: Acessibilidade
WCAG 2.1 AA; contraste ≥ 4,5:1; região ao vivo; foco nunca preso; saída em estilo de terminal tem equivalente em texto normal.

## Constraints
- Variante sem casca da 002; rotas só na tabela única.
- Branch `rebuild/sdd`; sem `push` sem pedido; aprovação só pela Duda.

## Decisions
### D-001: Terminal em `/terminal`, fora do menu (V-D-004).
**Rationale:** diferencial técnico que não deve ser a home.

## Questions
### Q-001 (answered, 2026-11-19): conjunto final de comandos
**Resposta da Duda: só os do mockup** (`ajuda, ls, whoami, projetos, curriculo, academico, contato, home`). Pergunta original:
O mockup mostra `ajuda, ls, whoami, projetos, curriculo, academico, contato, home`. É o conjunto final? Falta `pessoal`/`casos`/`idioma`/`tema`? Sobram os atuais (neofetch, fortunes, `cd`, número como atalho)?

### Q-002 (answered, 2026-11-19, com consequência pendente): 404 em estilo de terminal
**Resposta da Duda: funcional** (o visitante digita comandos na própria 404). Isso toca a 404 da spec 002 (aprovada, FR-027 e FR-039): ver Q-005 abaixo. Pergunta original:
O 404 em estilo de terminal (`cd /curriculos`) é decorativo ou funcional?

### Q-003 (answered, 2026-11-19): primeira visita
**Resposta da Duda: manter a dica**; com armazenamento bloqueado ela reaparece a cada visita. Pergunta original:
Mantém a dica de primeira visita? Onde guardar "já viu" quando o armazenamento está bloqueado?

### Q-004 (answered, 2026-11-19): extras atuais
**Resposta da Duda: saem** (neofetch, fortunes, agora, setup no terminal). As páginas `/agora` e `/setup` continuam na 003; só os comandos saem. As frases `fortunes` somem com eles (a 003 Q-005 as deixava para a 009). Pergunta original:
`fortunes`, `neofetch`, `agora`, `setup` ficam? (Há código em `src/terminal/extras`.)

### Q-005 (answered, 2026-11-19): onde mora o 404 funcional
**Resposta da Duda: entra na 009**; a 002 não muda (FR-012 abaixo). Pergunta original:
A 404 é da spec 002, aprovada, e não pode mudar em silêncio. O requisito do 404 funcional entra aqui na 009 (a 009 acrescenta o terminal à página que a 002 entrega) ou pede uma emenda à 002?

## Implementation FAQ
**Q:** Comando com maiúsculas ou acento?
**A:** Tolerante: `Projetos` e `projetos` funcionam; apelidos sem acento também.

**Q:** Argumento inválido (`projetos xyz`)?
**A:** Mensagem de erro com a forma certa e a dica de ajuda.

**Q:** Entrada vazia?
**A:** Nada acontece e nada é anunciado.

**Q:** Armazenamento bloqueado?
**A:** O terminal funciona; só a dica de primeira visita volta a aparecer.

## Success Metrics
- [ ] Todos os comandos aprovados testados em PT e EN.
- [ ] Nenhum comando de funcionalidade removida (teste).
- [ ] Região ao vivo e ordem do foco testadas; axe sem violação.
- [ ] Toda informação do terminal tem página equivalente (teste de rotas).

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Código antigo do terminal acoplado a módulos removidos | Alta | Médio | FR-011; teste de código morto já existe |
| Conjunto de comandos cresce sem fim | Média | Baixo | Q-001 fecha a lista |
| Terminal vira única fonte de algo | Baixa | Alto | FR-006 |

## Validação: entrada → resultado
| Entrada | Resultado |
| --- | --- |
| `ajuda` | lista os comandos |
| `projetos` | resumo e link para `/projetos` |
| `xyz` | "digite ajuda" |
| `proj` + Tab | autocompleta `projetos` |
| `projetos xyz` | erro com forma correta |
| (vazio) | nada |
| `trilhas` | desconhecido (removido) |

## Confirm before building
Responda Q-001 a Q-004 antes de aprovar; restate os FRs antes do design.
