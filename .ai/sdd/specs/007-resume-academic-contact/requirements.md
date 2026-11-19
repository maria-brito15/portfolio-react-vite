# 007 Resume, academic and contact, Requirements
**Status:** approved (v1.0 aprovada pela Duda em 2026-11-19)   **Version:** 1.1 (emenda 2026-11-19: FR-015)   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-19

## Overview
Currículo, acadêmico e contato são as páginas curtas que RH e professores procuram primeiro. Esta spec as entrega com o conteúdo atual (migrado na 003), legíveis em tela e em papel, e com um formulário de contato que recusa e-mail inválido. Cobre "sobre" dentro do currículo.

## Goals
- Currículo, acadêmico e contato alcançáveis em até 2 cliques da home.
- O currículo imprime e salva em PDF com o mesmo conteúdo da página, legível em papel.
- O formulário de contato valida, envia e confirma, sem expor segredo.
- Tudo em PT e EN, acessível por teclado.

## Non-Goals (v1)
- **Gerar o PDF no servidor ou manter um PDF separado:** depende da Q-004.
- **Editar o conteúdo do currículo:** só migração (003).
- **Escrever texto novo para `/agora` e `/setup`:** só leitura do conteúdo da 003 (emenda 2026-11-19).
- **Rede social, comentários, chat:** o produto não é isso.
- **Rastreamento do formulário por terceiros além do envio de e-mail.**
- **Download de dados pessoais além do que o currículo já mostra.**

## User Stories
### US-001: Currículo escaneável
**As a** recrutador, **I want to** o currículo com as seções sobre mim, projetos em destaque, experiências, competências, formação e idiomas, reconhecimentos, **so that** eu o leia em 60 s.
**Acceptance criteria:**
- [ ] As seis seções aparecem com o texto atual.
- [ ] Listas longas recolhidas têm controle acessível que anuncia o estado.

### US-002: Imprimir o currículo
**As a** recrutador, **I want to** salvar em PDF, **so that** eu o arquive.
**Acceptance criteria:**
- [ ] Imprimir gera o mesmo conteúdo da página, sem menu nem controles, legível em papel.

### US-003: Ver a trajetória acadêmica
**As a** professor, **I want to** formação, linha do tempo, atividades por ano e disciplinas por semestre, **so that** eu avalie a trajetória.
**Acceptance criteria:**
- [ ] Disciplinas por semestre com nota (decisão 2026-11-15: visíveis); carga e modalidade ausentes aparecem como "—".

### US-004: Entrar em contato
**As a** entrevistador, **I want to** enviar uma mensagem, **so that** eu fale com a Duda.
**Acceptance criteria:**
- [ ] E-mail incompleto mostra erro com ícone e texto, e nada é enviado.
- [ ] Envio bem-sucedido mostra confirmação e esvazia o formulário.

### US-005: Ler "agora" e "setup" *(emenda 2026-11-19)*
**As a** visitante, **I want to** ver no que a Duda está focada e quais ferramentas usa, **so that** eu a conheça melhor.
**Acceptance criteria:**
- [ ] "Agora" mostra os itens e a data de atualização do conteúdo; "setup" sem itens mostra o aviso de rascunho, sem texto inventado.

## Emenda 2026-11-19 (decisão D4 da 003)
A Duda decidiu que a 007 reescreve as páginas `/agora` e `/setup`, que a 003 deixou sem dono (L-003). Acrescenta-se **US-005** e **FR-015 (Should)**; nada mais muda. Como a v1.0 já estava aprovada, esta emenda é rastreada aqui e precisa do aceite da Duda junto com o `tasks.md`.

## Functional Requirements
### FR-001: Currículo (Must Have) — US-001
THE SYSTEM SHALL mostrar o currículo com as seções sobre mim, projetos em destaque, experiências, competências (com tempo de uso quando houver, 003 FR-005), formação e idiomas, e reconhecimentos, lendo o conteúdo da spec 003.

### FR-002: Recolher e expandir (Must Have) — US-001
WHILE uma lista longa estiver recolhida, THE SYSTEM SHALL manter o controle que a expande operável por teclado e leitor de tela, anunciando recolhida ou expandida; WITHOUT JavaScript, a lista SHALL aparecer inteira.

### FR-003: Impressão (Must Have) — US-002
WHEN o visitante imprimir ou salvar em PDF, THE SYSTEM SHALL gerar o conteúdo do currículo sem menu, rodapé de créditos nem controles, em preto sobre branco, com quebras de página que não cortam um item.

### FR-004: Acadêmico (Must Have) — US-003
THE SYSTEM SHALL mostrar formação, linha do tempo, atividades por ano e disciplinas por semestre, com a média do semestre calculada do conteúdo e nunca digitada.

### FR-005: Dado ausente (Must Have) — US-003
WHERE carga horária, modalidade ou nota não existirem no conteúdo, THE SYSTEM SHALL mostrar "—" (ou "em andamento" para semestre atual) e SHALL NOT estimar valor.

### FR-006: Sobre (Should) — US-001
THE SYSTEM SHALL mostrar o "sobre" como parte do currículo (não como rota separada), com foto apenas se houver imagem validada (001, FR-009).

### FR-007: Contato (Must Have) — US-004
THE SYSTEM SHALL mostrar os canais de contato (e-mail, LinkedIn, GitHub) do conteúdo e um formulário com nome, e-mail e mensagem.

### FR-008: Validação do formulário (Must Have) — US-004
WHEN o visitante enviar o formulário com campo obrigatório vazio ou e-mail de formato inválido, THE SYSTEM SHALL mostrar erro com ícone e texto associado ao campo e SHALL NOT enviar.

### FR-009: Envio e confirmação (Must Have) — US-004
WHEN o envio for bem-sucedido, THE SYSTEM SHALL mostrar a confirmação e esvaziar o formulário; IF o envio falhar, THE SYSTEM SHALL manter o texto digitado e mostrar mensagem de falha com a opção de tentar de novo ou usar o e-mail direto.

### FR-010: Contra envio automático (Must Have) — US-004
THE SYSTEM SHALL incluir um campo-armadilha oculto de leitores de tela e de teclado, e SHALL descartar sem aviso ao remetente um envio que o preencha.

### FR-011: Contador de caracteres (Should) — US-004
THE SYSTEM SHALL mostrar o contador de caracteres da mensagem e recusar mensagem acima do limite (definido no design).

### FR-012: Sem segredo (Must Have) — US-004
THE SYSTEM SHALL NOT expor segredo no navegador nem no repositório; a forma de envio é definida no design (hoje há EmailJS como exceção listada na 001, FR-016).

### FR-013: Idiomas e endereços (Must Have) — US-001
THE SYSTEM SHALL servir as três páginas em PT e EN com endereço por idioma (002, FR-020).

### FR-014: Sem JavaScript (Must Have) — US-001
THE SYSTEM SHALL entregar currículo, acadêmico e canais de contato no HTML; o formulário SHALL oferecer pelo menos o `mailto:` quando não houver JavaScript (Q-005).

### FR-015: Agora e setup (Should) — US-005 *(emenda 2026-11-19)*
THE SYSTEM SHALL mostrar as páginas `/agora` e `/setup` lendo o conteúdo da spec 003 (FR-007), em PT e EN, com a data de atualização quando houver, e SHALL manter ambas como rascunho enquanto o conteúdo da 003 mantiver o estado atual; WHERE `setup` não tiver itens, THE SYSTEM SHALL mostrar o aviso de rascunho existente e SHALL NOT inventar texto.

## Non-Functional Requirements
### NFR-001: Performance
LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; validação do formulário responde em ≤ 200 ms.
### NFR-002: Segurança
Entrada do formulário tratada como texto; limite de tamanho; sem requisição a terceiros além do serviço de envio aprovado no design; anti-abuso (FR-010).
### NFR-003: Acessibilidade
WCAG 2.1 AA; erros associados ao campo, anunciados e não só em cor; foco visível; contraste ≥ 4,5:1; texto em impressão com contraste máximo.

## Constraints
- Conteúdo só da spec 003; nenhum dado novo.
- Branch `rebuild/sdd`; sem `push` sem pedido; aprovação só pela Duda.

## Decisions
### D-001: Notas das disciplinas visíveis
**Decision:** a Duda decidiu (2026-11-15): visíveis. **Rationale:** transparência; ela mantém o histórico. **Alternatives considered:** esconder.

### D-002: Contato dentro desta spec
**Decision:** currículo, acadêmico e contato juntos (PLAN). **Rationale:** mesmo público, páginas curtas.

## Questions
### Q-001 (answered, 2026-11-19): carga horária e modalidade
**Resposta da Duda: mostrar "—".** Pergunta original:
Ficam como "—" até a Duda informar, ou saem da tela? Sugestão: "—".

### Q-002 (answered, 2026-11-19): canais oficiais
**Resposta da Duda: e-mail, LinkedIn e GitHub atuais; o e-mail de serviços fica fora.** Pergunta original:
O e-mail `mariaeduardadepaulabrito@gmail.com` e o LinkedIn atuais, mais o e-mail de serviços (`servicesEmail`), são os canais oficiais? O e-mail de serviços aparece em Contato ou só em Serviços?

### Q-003 (answered, 2026-11-19): página de Serviços
A Duda decidiu: **fora da 007** (e fora do MVP, V-D-003). Vira pendência para depois; o e-mail de serviços só aparece se a Q-002 o mantiver em Contato.

### Q-004 (answered, 2026-11-19): PDF do currículo
**Resposta da Duda: só impressão do navegador, sem arquivo pronto.** Pergunta original:
Impressão do navegador (sem arquivo) ou um PDF pronto para baixar? Sugestão: só impressão, para não manter duas versões.

### Q-005 (answered, 2026-11-19): formulário sem JavaScript
**Resposta da Duda: sem JavaScript aparece o e-mail com link `mailto:`** no lugar do formulário. Pergunta original:
Aceita `mailto:` como alternativa quando não há JavaScript? Hoje o envio é pelo EmailJS, que exige JavaScript.

### Q-006 (answered, 2026-11-19): reconhecimentos
**Resposta da Duda: migram como estão**, sem link novo. Pergunta original:
O que entra em "reconhecimentos" já está no conteúdo; confirma que nenhum precisa de comprovação ou link novo?

## Implementation FAQ
**Q:** E-mail sem `@`?
**A:** Erro com ícone e texto, não envia (FR-008).

**Q:** O campo-armadilha foi preenchido?
**A:** Descarta sem aviso (FR-010).

**Q:** O envio falha por rede?
**A:** Mantém o texto e oferece tentar de novo ou o e-mail direto (FR-009).

**Q:** Semestre em andamento sem notas?
**A:** Mostra "em andamento"; não calcula média (FR-005).

**Q:** Impressão com tema escuro?
**A:** Sai em preto sobre branco (FR-003).

## Success Metrics
- [ ] Currículo, acadêmico e contato a até 2 cliques da home.
- [ ] Impressão do currículo conferida (PDF gerado e lido).
- [ ] Formulário testado: vazio, e-mail inválido, armadilha, falha de rede, sucesso.
- [ ] axe sem violação; Lighthouse ≥ 95; zero segredo.
- [ ] Média do semestre calculada e igual ao conteúdo.

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Serviço de envio exige chave no navegador | Média | Alto | Design define exceção listada ou envio pelo servidor |
| Spam no formulário | Média | Médio | FR-010 e limite de tamanho |
| Impressão quebra o layout | Média | Médio | FR-003 testado em PDF |
| Escopo cresce com Serviços | Média | Médio | Q-003 antes de aprovar |

## Validação: entrada → resultado
| Entrada | Resultado |
| --- | --- |
| Nome, e-mail válido, mensagem | enviado, confirmação, formulário vazio |
| E-mail `a@` | erro de formato, não envia |
| Mensagem vazia | erro de campo obrigatório |
| Mensagem acima do limite | erro de tamanho |
| Armadilha preenchida | descartado sem aviso |
| Rede indisponível | falha, texto mantido |
| Disciplina sem carga horária | "—" |
| Semestre atual | "em andamento", sem média |

## Confirm before building
Responda Q-001 a Q-006 antes de aprovar; restate os FRs antes do design.
