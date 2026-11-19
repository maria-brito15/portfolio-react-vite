# 003 Content migration, Requirements
**Status:** approved (v1.0 aprovada pela Duda em 2026-11-19)   **Version:** 1.0   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-19

## Overview
O conteúdo existente do site (projetos, experiências, acadêmico, currículo, habilidades, canais de contato e a página "agora") é o único ativo insubstituível (auditoria §4). Esta spec o move, **sem alterar um fato**, para arquivos de conteúdo tipados e validados pelas primitivas da spec 001, nos dois idiomas. Serve à Duda (uma fonte única, validada) e a todas as specs de página, que leem daqui em vez de guardar texto.

## Goals
- Todo projeto, experiência, disciplina, competência e canal de contato existente vive em conteúdo validado, e nenhum componente guarda texto de conteúdo.
- Nenhum fato muda: o que é migrado é igual ao que existe hoje (texto, período, nota, stack).
- Paridade PT/EN verificada para todo o conteúdo migrado.
- A validação do conteúdo real custa no máximo 5 s ao comando de verificação (herda NFR-001 da 001).

## Non-Goals (v1)
- **Telas e componentes de exibição:** specs 004 a 007; aqui só os dados.
- **Filmes, livros e música:** os schemas nascem nas specs 008 e 011.
- **Critérios e nota dos projetos:** definidos na spec 005; aqui o projeto só reserva o lugar da nota (ausente = sem nota).
- **Conteúdo novo ou reescrito:** a Duda atualiza depois (P-Q-004); migrar não é editar.
- **Diário, listas e busca:** fora do MVP.
- **Remover os arquivos antigos de dados antes de a página que os usa ser reescrita:** cada spec de página remove o que substitui (P-Q-001).

## User Stories
### US-001: Conteúdo no lugar certo
**As a** Duda, **I want to** editar um projeto, uma experiência ou uma disciplina num só arquivo tipado, **so that** a mudança apareça em toda página e termos inválidos sejam recusados.
**Acceptance criteria:**
- [ ] Cada tipo de conteúdo tem um arquivo de conteúdo registrado e validado.
- [ ] Um dado inválido (data com mês 13, texto sem EN, link malformado, etiqueta repetida) quebra a verificação com arquivo, campo e motivo (herda 001, FR-012).

### US-002: Nada se perdeu e nada foi inventado
**As a** Duda, **I want to** confirmar que a migração não mudou nem acrescentou fato, **so that** o site continue verdadeiro.
**Acceptance criteria:**
- [ ] Uma conferência item a item (antigo × novo) cobre 100% dos itens migrados e termina sem diferença de fato.
- [ ] Um dado que hoje não existe (mês sem confirmação, carga horária, capa) permanece ausente, nunca preenchido.

### US-003: Contar tudo igual nos dois idiomas
**As a** entrevistador que lê em inglês, **I want to** ver o mesmo conteúdo que em português, **so that** eu não receba uma versão pela metade.
**Acceptance criteria:**
- [ ] Todo item migrado tem PT e EN não vazios.
- [ ] Remover o EN de um item faz a verificação falhar nomeando o item e o idioma.

## Functional Requirements
### FR-001: Projetos como conteúdo (Must Have) — US-001
THE SYSTEM SHALL manter cada projeto existente (hoje 6) em conteúdo validado, com identificador único, nome, data de início (ano obrigatório, mês só se confirmado), stack como etiquetas, endereço do repositório (ou ausência), endereço do estudo de caso (ou ausência), imagens (zero ou mais, regra da 001, FR-009), e texto descritivo em PT e EN, inclusive selo e versões quando existirem.

### FR-002: Nota reservada (Must Have) — US-001
THE SYSTEM SHALL permitir que um projeto não tenha nota. A nota de um projeto é definida pela spec 005; esta spec SHALL NOT atribuir nota a nenhum projeto.

### FR-003: Experiências como conteúdo (Must Have) — US-001
**Emenda (2026-11-19, resposta da Duda D2):** o requisito dizia "hoje 10"; o código tem 7 (3 + 3 + 1 em 3 grupos) e a Duda confirmou 7. Texto corrigido para "hoje 7".

THE SYSTEM SHALL manter cada experiência existente (hoje 7, em grupos) em conteúdo validado, com identificador, período, organização, papel, descrição e etiqueta opcional, PT e EN, preservando o grupo e o destaque de cada uma.

### FR-004: Acadêmico como conteúdo (Must Have) — US-001
THE SYSTEM SHALL manter a formação, a linha do tempo, as atividades por ano e as disciplinas por semestre em conteúdo validado. Nota, carga horária e modalidade de uma disciplina são opcionais; a ausência permanece ausência.

### FR-005: Currículo e habilidades como conteúdo (Must Have) — US-001
THE SYSTEM SHALL manter o texto do currículo (sobre mim, competências, formação e idiomas, reconhecimentos) e as competências com o ano de início e a fonte em conteúdo validado. Competência sem projeto datado fica sem ano, nunca com ano estimado.

### FR-006: Contato e perfil como conteúdo (Must Have) — US-001
THE SYSTEM SHALL manter os canais de contato (e-mail, e-mail de serviços, GitHub, LinkedIn) e a foto em conteúdo validado, usando o formato de link da 001 (FR-010) e a imagem da 001 (FR-009).

### FR-007: Página "agora" e setup (Should) — US-001
THE SYSTEM SHALL migrar a página "agora" (com a data da última atualização) e a de setup. A lista de setup hoje vazia permanece vazia, e a rota continua marcada como rascunho enquanto não houver itens.

### FR-008: Fidelidade da migração (Must Have) — US-002
THE SYSTEM SHALL ter um teste de equivalência que compara, item a item, o conteúdo antigo com o migrado (texto, datas, listas, ordem) e falha em qualquer diferença. O teste é descartado só quando a Duda aprovar o fechamento da spec.

### FR-009: Datas (Must Have) — US-002
THE SYSTEM SHALL aplicar a regra de datas da 001 (FR-008, FR-013): o mês só entra quando a Duda confirmou; sem mês, só o ano; a ordem entre itens do mesmo ano é indeterminada quando falta mês ou quando os meses são iguais.

### FR-010: Paridade e sem texto de reserva (Must Have) — US-003
IF um item migrado não tiver PT ou EN, THE SYSTEM SHALL falhar a verificação (herda 001, FR-014 e FR-015).

### FR-011: Registro (Must Have) — US-001
THE SYSTEM SHALL registrar todo arquivo de conteúdo migrado no registro de conteúdo; IF um arquivo de conteúdo existir sem registro, THE SYSTEM SHALL falhar a verificação (herda a lógica da 001).

### FR-012: Texto de exemplo (Must Have) — US-002
THE SYSTEM SHALL NOT aceitar, no conteúdo migrado, marcador de pendência (`[entre colchetes]`) ou texto de exemplo; a verificação falha se encontrar um.

## Non-Functional Requirements
### NFR-001: Performance
- A validação do conteúdo real acrescenta no máximo 5 s ao comando de verificação (limite herdado da 001); a medição com o conteúdo real é desta spec e falha se passar.
- O custo de leitura do conteúdo no navegador não pode aumentar o JavaScript inicial da home além do orçamento a ser fixado na spec 004 (aqui: o conteúdo de uma página é carregado só nessa página).

### NFR-002: Segurança
- Nenhum segredo no conteúdo. O e-mail e os links de contato já são públicos no site atual.
- A verificação de segredos da 001 passa sobre os novos arquivos.

### NFR-003: Acessibilidade
Parcialmente N/A (só dados). Toda imagem migrada tem texto alternativo em PT e EN (001, FR-009).

## Constraints
- Stack conforme `.ai/steering/tech-stack.md`; conteúdo em `src/content/` (conventions.md).
- O conteúdo migrado é o conteúdo atual: nada inventado (princípios do AGENTS.md).
- Branch `rebuild/sdd`; sem `push` sem pedido.
- Aprovação só pela Duda.

## Decisions
### D-001: Migrar sem editar
**Decision:** a migração copia fatos e textos como estão. **Rationale:** P-Q-004 (nada desatualizado) e a regra de não inventar. **Alternatives considered:** aproveitar para reescrever textos (mistura risco de conteúdo com risco de estrutura).

### D-002: Uma pergunta por dado ausente
**Decision:** dado que não existe hoje (mês, carga horária, capa) fica ausente. **Rationale:** FR-013 da 001 e o AGENTS.md. **Alternatives considered:** preencher com "—" no dado (o "—" é decisão de exibição, da página).

## Questions
### Q-001 (answered, 2026-11-19): imagens dos projetos
**Emenda (2026-11-19, design D1):** a premissa abaixo estava errada. O EcoShop tem 3 capturas em `public/cases/ecoshop/`; a Duda decidiu migrá-las (design §14, D1). ShortURL e File Name Standardizer não têm imagem.

**Resposta da Duda: migrar sem imagem**; a ausência fica ausente e a 005 usa bloco tipográfico. Contexto: hoje só ShortURL e File Name Standardizer têm capturas; os outros quatro não têm imagem. Migrar assim (sem imagem) ou a Duda vai enviar capturas antes?

### Q-002 (answered, 2026-11-19): notas e disciplinas
**Resposta da Duda: todas migram, sem omitir nenhuma e sem inventar escala.** Pergunta original:
O mockup mostra notas das disciplinas e a Duda respondeu "visíveis" (2026-11-15). Confirma que **todas** as notas existentes migram e nenhuma disciplina é omitida?

### Q-003 (answered, 2026-11-19): rótulo de data livre
**Resposta da Duda: migrar como dado** (campo localizado opcional, além da data; a data continua a fonte da ordenação). Pergunta original:
Alguns projetos têm um rótulo de data por extenso (`dateLabel`, como "out/2026"). Esse rótulo migra como dado ou some, já que a 001 formata a data a partir do mês confirmado?

### Q-004 (answered, 2026-11-19): currículo normalizado
**Resposta da Duda: normalizar para "um item, dois idiomas".** Pergunta original:
O currículo hoje é um objeto por idioma. Tudo bem normalizar para "um item, dois idiomas" (igual ao resto)?

### Q-005 (answered, 2026-11-19): frases do terminal
**Resposta da Duda: ficam na 009**; não migram na 003. Pergunta original:
Serviços ficou **fora** (decisão de 2026-11-19, ver 007 Q-003) e não migra. Resta: as frases do terminal (`fortunes`) são conteúdo desta migração ou ficam na spec 009?

## Implementation FAQ
**Q:** Um projeto não tem mês?
**A:** Fica só com o ano, e a ordem é indeterminada com outros do mesmo ano (FR-009).

**Q:** Uma competência não tem projeto datado?
**A:** Fica sem ano (FR-005), nunca estimado.

**Q:** Há texto só em PT?
**A:** A verificação falha (FR-010); a Duda fornece o EN antes de fechar (não se traduz no lugar dela).

**Q:** O conteúdo migrado difere do antigo em um caractere?
**A:** O teste de equivalência falha (FR-008); decide-se se foi correção aprovada ou erro.

**Q:** Lista vazia (setup, "agora" sem itens)?
**A:** É válida (001); a página decide como exibe (FR-007).

## Success Metrics
- [ ] 100% dos itens de projetos, experiências, acadêmico, currículo, habilidades e contato estão em conteúdo registrado e validado.
- [ ] O teste de equivalência passa e cobre todos os itens.
- [ ] A verificação completa passa e a validação do conteúdo real custa ≤ 5 s.
- [ ] Zero marcador `[...]` e zero dado inventado no conteúdo migrado.
- [ ] Paridade PT/EN testada para todos os itens.

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Texto do conteúdo antigo é JSX (`ReactNode`) com marcação | Alta | Médio | O design define como representar marcação no conteúdo; o teste de equivalência pega perda |
| Perda ou deformação de um fato na cópia | Média | Alto | FR-008 (equivalência item a item) |
| Páginas atuais quebram ao trocar a fonte de dados | Média | Médio | Migração em camadas: o dado novo é lido pelas páginas só na spec de cada uma |
| Validação lenta com conteúdo real | Baixa | Baixo | NFR-001 mede e falha |

## Validação: entrada → resultado
| Campo | Entrada | Resultado |
| --- | --- | --- |
| Projeto | com todos os campos, EN presente | válido |
| Projeto | sem EN na descrição | erro: `en` ausente (arquivo e campo nomeados) |
| Projeto | sem mês | válido; mostra só o ano |
| Projeto | `repo` ausente | válido; sem link de repositório |
| Projeto | etiqueta `React` repetida | erro: identificador repetido |
| Disciplina | sem nota | válida; sem nota |
| Disciplina | nota 120 | decidir na Q-002 (escala da instituição); o schema não inventa limite |
| Competência | sem projeto datado | válida sem ano |
| Contato | `https://github.com/...` | válido |
| Contato | `http://...` | erro: precisa de `https` |
| Arquivo de conteúdo sem registro | — | erro de verificação |

## Notas para o design (fora dos requisitos)
- Representação de marcação em texto (hoje `ReactNode`).
- Estrutura dos schemas de projeto, experiência, disciplina e competência.
- Estratégia de teste de equivalência (instantâneo do dado antigo).

## Confirm before building
Não avance para o design sem restatar os FRs com suas palavras. Responda Q-001 a Q-005 antes de aprovar; se um critério for ambíguo, pergunte antes.
