# 005 Projects catalog, Requirements
**Status:** approved (v1.0 aprovada pela Duda em 2026-11-19)   **Version:** 1.0   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-19

## Overview
O catálogo de projetos é a página que mais responde à pergunta do público (RH, professores, entrevistadores): "que evidência de engenharia ela tem?". Mostra os projetos como um acervo (grade, filtros), cada um com página de detalhe e uma **nota por critérios públicos**, para que o número tenha origem visível. Lê o conteúdo migrado na spec 003. Serve a quem escaneia em 60 segundos e a Duda, que mantém tudo em arquivo.

## Goals
- O visitante encontra, filtra e abre qualquer projeto em até 2 cliques a partir da home.
- Cada projeto tem uma página de detalhe com ficha técnica, links e nota por critério.
- A nota de cada projeto tem regra e critérios visíveis; sem avaliação, mostra "sem nota", nunca 0.
- Filtros são refletidos no endereço (compartilháveis) e funcionam por teclado.

## Non-Goals (v1)
- **Estudo de caso completo:** spec 006 (aqui só o link para ele).
- **Ligação projeto ↔ filme/livro ("Moldado por"):** fora do MVP.
- **Busca global por texto:** fora do MVP; aqui só filtros.
- **Comentários, curtidas, nota de visitantes:** o produto não é rede social.
- **Critérios definidos por visitante ou mudando por projeto:** os critérios são os mesmos para todos.
- **Capas geradas por IA ou de terceiros:** só imagem da Duda ou bloco tipográfico.

## Definições
- **Critério:** uma dimensão avaliada (hoje, no mockup: clareza do código, testes e verificação, acessibilidade e desempenho, uso real/impacto).
- **Nota do projeto:** média simples dos critérios avaliados, em estrelas.

## User Stories
### US-001: Escanear projetos
**As a** recrutador, **I want to** ver os projetos agrupados por ano com stack e uma frase, **so that** eu reconheça a experiência em segundos.
**Acceptance criteria:**
- [ ] A lista agrupa por ano, do mais recente ao mais antigo.
- [ ] Cada projeto mostra nome, data, stack e uma frase.
- [ ] A ordem entre projetos do mesmo ano é marcada como indeterminada quando falta o mês (001, FR-013).

### US-002: Filtrar
**As a** entrevistador, **I want to** filtrar por stack, ano ou tipo, **so that** eu veja só o que me interessa.
**Acceptance criteria:**
- [ ] Escolher filtros mostra só os projetos que combinam, e o endereço reflete os filtros.
- [ ] Sem resultado, aparece um estado vazio com "limpar filtros".
- [ ] Todos os filtros funcionam só com teclado.

### US-003: Entender a nota
**As a** professor, **I want to** ver por que um projeto recebeu aquela nota, **so that** o número não pareça autoelogio.
**Acceptance criteria:**
- [ ] A nota é a média simples dos critérios, com cada critério e sua nota visíveis.
- [ ] A regra de cálculo e os critérios são explicados na própria página.

### US-004: Ver o projeto em detalhe
**As a** entrevistador, **I want to** abrir um projeto e ver ficha técnica e links, **so that** eu verifique o código e a demonstração.
**Acceptance criteria:**
- [ ] O detalhe mostra stack, período, papel, equipe, estado, links de demonstração e de repositório (quando existirem) e a nota por critério.

## Functional Requirements
### FR-001: Lista por ano (Must Have) — US-001
THE SYSTEM SHALL listar todos os projetos do conteúdo agrupados por ano, do mais recente ao mais antigo, cada um com nome, data (regra da 001, FR-013), stack e uma frase.

### FR-002: Ordem indeterminada (Must Have) — US-001
WHEN dois projetos do mesmo ano não tiverem ordem determinada (001, FR-013), THE SYSTEM SHALL marcar visivelmente a ordem como indeterminada e mantê-la estável entre visitas.

### FR-003: Filtros (Must Have) — US-002
WHEN o visitante escolher filtros de stack, ano ou tipo, THE SYSTEM SHALL mostrar só os projetos que combinam com todos os filtros escolhidos (E entre filtros diferentes; OU entre valores do mesmo filtro, Q-003 respondida) e refletir os filtros no endereço.

### FR-004: Estado vazio (Must Have) — US-002
IF nenhum projeto combinar com os filtros, THE SYSTEM SHALL mostrar um estado vazio com a opção de limpar os filtros, e anunciar a mudança a leitores de tela.

### FR-005: Filtro pelo endereço (Must Have) — US-002
WHEN o visitante abrir um endereço com filtros, THE SYSTEM SHALL aplicar esses filtros; IF um valor de filtro não existir, THE SYSTEM SHALL ignorá-lo e mostrar o catálogo sem aquele filtro, sem erro.

### FR-006: Detalhe do projeto (Must Have) — US-004
THE SYSTEM SHALL ter uma página por projeto com ficha técnica (stack, período, papel, equipe, estado), descrição, links de demonstração e de repositório quando existirem, imagens quando existirem e a nota por critério.

### FR-007: Endereço por idioma (Must Have) — US-004
THE SYSTEM SHALL servir cada projeto em PT e em EN, com endereço próprio por idioma (spec 002, FR-020) e a troca de idioma levando ao mesmo projeto (002, FR-021).

### FR-008: Critérios públicos (Must Have) — US-003
THE SYSTEM SHALL manter a lista de critérios e a regra de cálculo em conteúdo validado, mostrá-las na página do catálogo e na do projeto, e usar os mesmos critérios para todos os projetos.

### FR-009: Nota do projeto (Must Have) — US-003
THE SYSTEM SHALL calcular a nota do projeto como a média simples das notas dos critérios avaliados, cada critério de 0,5 a 5 em passos de 0,5 (001, FR-018), e mostrá-la com o número exato e estrelas arredondadas à meia estrela mais próxima, com texto alternativo ("nota 4,25 de 5").

### FR-010: Sem avaliação (Must Have) — US-003
WHILE um projeto não tiver nenhum critério avaliado pela Duda, THE SYSTEM SHALL mostrar "sem nota" e nenhuma estrela preenchida, e SHALL NOT mostrar 0. IF só parte dos critérios estiver avaliada, THE SYSTEM SHALL tratar o projeto como "sem nota" até os quatro critérios estarem avaliados (Q-004, respondida).

### FR-011: Capa (Must Have) — US-001
THE SYSTEM SHALL mostrar, como capa, a imagem do projeto quando existir (001, FR-009) ou um bloco tipográfico colorido com o nome; SHALL NOT carregar imagem de outro site.

### FR-012: Links (Must Have) — US-004
THE SYSTEM SHALL mostrar link de repositório e de demonstração só quando existirem no conteúdo, no formato `https` (001, FR-010), abrindo sem rastreamento de terceiros.

### FR-013: Teclado e leitor de tela (Must Have) — US-002
THE SYSTEM SHALL permitir operar filtros e abrir projetos por teclado, com foco visível, e SHALL NOT depender só de cor para indicar filtro ativo (002, FR-040).

### FR-014: Conteúdo sem JavaScript (Must Have) — US-001
THE SYSTEM SHALL entregar a lista completa e o detalhe de cada projeto no HTML, sem JavaScript; os filtros SHALL ser um aprimoramento (002, FR-028).

### FR-015: Rota na tabela (Must Have) — US-001
THE SYSTEM SHALL registrar as rotas do catálogo e do detalhe na tabela única de rotas (002, FR-009), com o catálogo no menu.

## Non-Functional Requirements
### NFR-001: Performance
- LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 em celular médio (V-D-008); filtrar atualiza a lista em ≤ 200 ms com 50 projetos.
- A página do catálogo cabe no orçamento de JavaScript a ser fixado no design.

### NFR-002: Segurança
- Valores de filtro vindos do endereço nunca são injetados como marcação (tratados como texto).
- Sem requisição a terceiros (002, FR-030).

### NFR-003: Acessibilidade
- WCAG 2.1 AA, axe sem violação; filtros com rótulo; mudança de resultado anunciada; estrelas com texto alternativo; layout sem rolagem horizontal em 390 px.

## Constraints
- Lê só o conteúdo da spec 003; nenhum texto de projeto em componente.
- Casca, tokens e rotas da spec 002.
- Branch `rebuild/sdd`; sem `push` sem pedido; aprovação só pela Duda.

## Decisions
### D-001: Nota por média simples de quatro critérios
**Decision:** a Duda respondeu (2026-11-15): quatro critérios do mockup, média simples, estrelas vazias até a avaliação. **Rationale:** regra visível, sem número sem origem (V-D-012). **Alternatives considered:** nota única digitada (sem origem).

### D-002: Capa é imagem própria ou bloco tipográfico
**Decision:** sem hotlink e sem imagem de terceiros. **Rationale:** princípio 5 e Non-Goals do produto. **Alternatives considered:** captura automática de tela (custo e licença).

## Questions
### Q-001 (answered, 2026-11-19): critérios
**Resposta da Duda: os 4 critérios do mockup são os finais.** Os nomes em EN são propostos no design e aprovados por ela. Pergunta original:
Os quatro critérios do mockup (clareza do código; testes e verificação; acessibilidade e desempenho; uso real/impacto) são os finais, com esses nomes em PT e EN? (a resposta de 2026-11-15 os aceitou, mas os nomes em EN não foram definidos).

### Q-002 (answered, 2026-11-19): arredondamento
**Resposta da Duda: número com 2 casas ("nota 4,38 de 5") e estrelas na meia mais próxima.** Pergunta original:
A média de 4 critérios em passos de 0,5 dá múltiplos de 0,125. Mostrar o número com 2 casas ("4,25") e as estrelas arredondadas à meia mais próxima — confirma? (001 deixou a regra para esta spec.)

### Q-003 (answered, 2026-11-19): lógica dos filtros
**Resposta da Duda: OU dentro de um mesmo filtro, E entre filtros diferentes.** Pergunta original:
Dois valores de stack (React e TypeScript): mostrar projetos com **qualquer um** (OU) ou **ambos** (E)? Sugestão: E entre filtros diferentes e OU dentro de um mesmo filtro.

### Q-004 (answered, 2026-11-19): avaliação parcial
**Resposta da Duda: "sem nota" até os 4 critérios estarem avaliados** (FR-010 passa a valer assim). Pergunta original:
Projeto com 2 de 4 critérios avaliados mostra média dos 2 com aviso "2 de 4", ou fica "sem nota" até os 4? Sugestão: "sem nota" até a Duda avaliar os 4, para não mostrar número enganoso.

### Q-005 (answered, 2026-11-19): filtro "tipo"
**Resposta da Duda: "com estudo de caso" é filtro; "finalista PUC Minas" é selo.** Pergunta original:
"Com estudo de caso" e "Finalista PUC Minas" são filtros ou selos? Sugestão: "com estudo de caso" é filtro; "finalista" é selo.

### Q-006 (answered, 2026-11-19): capas
**Resposta da Duda: bloco tipográfico para todos; foto própria só quando ela enviar.** Pergunta original:
Existem capturas de tela da Duda, ou fica o bloco tipográfico para todos até haver imagem? (Hoje só 2 projetos têm captura.)

## Implementation FAQ
**Q:** Um projeto não tem repositório público?
**A:** O link não aparece; a página não mostra botão quebrado (FR-012).

**Q:** Filtro por ano com um projeto sem mês?
**A:** Filtra pelo ano; a ordem interna segue indeterminada (FR-002).

**Q:** Endereço com filtro inválido (`?stack=xyz`)?
**A:** O filtro é ignorado, sem erro (FR-005).

**Q:** Nota 0?
**A:** Não existe; sem avaliação é "sem nota" (FR-010, 001 FR-018).

**Q:** JavaScript desligado?
**A:** A lista e o detalhe aparecem; os filtros não agem (FR-014).

## Success Metrics
- [ ] Catálogo e detalhe de cada projeto acessíveis em até 2 cliques da home.
- [ ] axe sem violação e Lighthouse ≥ 95 em acessibilidade, SEO e boas práticas nas duas páginas.
- [ ] Filtros testados: combinação, vazio, endereço inválido, teclado.
- [ ] A nota de cada projeto mostra a regra e os critérios; nenhum projeto mostra 0.
- [ ] Zero requisição a terceiros e zero imagem externa.

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| A nota parece autoelogio | Média | Médio | Critérios e regra públicos (FR-008) |
| Poucos projetos (6) deixam os filtros sem sentido | Alta | Baixo | Esconder um filtro com um só valor; decidir no design |
| Sem imagens, a grade fica monótona | Alta | Baixo | Bloco tipográfico colorido (D-002) |
| Filtros dependem de JS e prejudicam SEO | Baixa | Médio | Conteúdo completo no HTML (FR-014) |

## Validação: entrada → resultado
| Entrada | Resultado |
| --- | --- |
| Sem filtros | todos os projetos por ano |
| `stack=react` | só projetos com React |
| `stack=react&ano=2026` | React E 2026 |
| `stack=react,java` | React OU Java (Q-003) |
| `stack=xyz` | filtro ignorado |
| Filtros sem resultado | estado vazio + "limpar filtros" |
| Critérios 4, 4,5, 4, 5 | nota 4,38 → 4,5 estrelas; texto "nota 4,38 de 5" (Q-002) |
| Nenhum critério avaliado | "sem nota", nenhuma estrela preenchida |
| Critério com nota 0 | erro de verificação (001, FR-018) |
| Projeto sem imagem | bloco tipográfico |

## Notas para o design (fora dos requisitos)
- Estado dos filtros no endereço e hidratação.
- Geração das páginas de detalhe por idioma.
- Orçamento de JavaScript do catálogo.

## Confirm before building
Não avance para o design sem restatar os FRs. Responda Q-001 a Q-006 antes de aprovar.
