# 008 Films and books, Requirements
**Status:** approved (v1.0 aprovada pela Duda em 2026-11-19)   **Version:** 1.0   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-19

## Overview
`/pessoal` mostra a personalidade da Duda (filmes e livros) em segundo plano, sem disputar a atenção da engenharia. O conteúdo é **curado por ela, à mão**, em arquivos validados; não há API, token, cache de servidor nem Function (decisão de 2026-11-15, PLAN). Esta spec também remove o código de API antigo e reescreve as páginas juntos, para o `/pessoal` nunca ficar quebrado. Origem das decisões: `PROPOSTA-pessoal-conteudo-curado.md` (Q-P1 a Q-P14, todas respondidas).

## Goals
- `/pessoal`, `/pessoal/filmes` e `/pessoal/livros` leem só conteúdo curado e validado.
- Nenhuma requisição a serviço externo para filmes ou livros, na geração e no navegador.
- Totais e médias são calculados do conteúdo; enquanto o histórico não estiver completo, dizem "itens registrados".
- O código de API, os blocos assíncronos e o guarda de modo `mock` saem juntos com a reescrita.

## Non-Goals (v1)
- **Música e Bastidores:** specs 011 e 012, fora do MVP.
- **Diário, listas e busca, ligações projeto ↔ filme:** fora do MVP.
- **Qualquer integração com API (Letterboxd, Hardcover, TMDB, Spotify).**
- **Importador de Hardcover ou Spotify:** só o de CSV do Letterboxd, offline.
- **Pôsteres e capas de terceiros sem licença registrada.**
- **Comentários, curtidas, seguidores.**

## User Stories
### US-001: Conhecer o gosto dela
**As a** entrevistador, **I want to** ver filmes e livros em páginas simples, **so that** eu conheça a pessoa sem atrapalhar a avaliação técnica.
**Acceptance criteria:**
- [ ] Cada item mostra título, data (regra da 001), nota em estrelas com texto alternativo e, se houver, resenha curta.
- [ ] `/pessoal` não aparece com mais destaque que a engenharia na home e no menu (hierarquia do produto).

### US-002: Manter a estante
**As a** Duda, **I want to** adicionar um filme ou livro num arquivo, **so that** a página atualize sem servidor.
**Acceptance criteria:**
- [ ] Um item inválido quebra a verificação com arquivo, campo e motivo.
- [ ] Um item com marcador de exemplo (`[...]`) quebra a verificação (Q-P8).

### US-003: Carga inicial
**As a** Duda, **I want to** importar meu CSV do Letterboxd, **so that** eu não digite centenas de filmes.
**Acceptance criteria:**
- [ ] O importador roda offline, sem rede, e gera o arquivo de conteúdo para eu revisar.

## Functional Requirements
### FR-001: Conteúdo curado (Must Have) — US-002
THE SYSTEM SHALL ler filmes e livros de arquivos de conteúdo validados na geração do site pelos schemas da 001.

### FR-002: Falha de validação (Must Have) — US-002
IF um item violar o schema, THE SYSTEM SHALL falhar a verificação com arquivo, campo e motivo (001, FR-012).

### FR-003: Sem serviço externo (Must Have) — US-002
THE SYSTEM SHALL NOT fazer requisição a serviço externo para dados de filme, livro ou música, nem na geração nem no navegador.

### FR-004: Item de filme (Must Have) — US-001
THE SYSTEM SHALL mostrar, para cada filme, título, ano de lançamento, data em que foi visto (mês só se confirmado), nota quando houver e resenha curta quando houver.

### FR-005: Item de livro (Must Have) — US-001
THE SYSTEM SHALL mostrar, para cada livro, título, autores, estado (lendo, lido, quero ler, abandonado), data de leitura quando houver, nota quando houver e resenha curta quando houver.

### FR-006: Nota (Must Have) — US-001
THE SYSTEM SHALL validar a nota de 0,5 a 5 em passos de 0,5 (001, FR-018) e mostrá-la em estrelas com texto alternativo com o número exato. Item sem nota (inclusive "quero ler" e "lendo") mostra só o título, nunca "0 estrelas".

### FR-007: Capa (Must Have) — US-001
THE SYSTEM SHALL mostrar como capa um bloco tipográfico colorido (título e ano) ou foto própria validada pela 001 (FR-009); imagem de terceiros SHALL exigir registro de origem, licença, atribuição e data de verificação na spec, e sem o registro a verificação recusa a imagem. SHALL NOT haver hotlink.

### FR-008: Totais e médias (Must Have) — US-001
THE SYSTEM SHALL calcular totais e médias do conteúdo e, enquanto a Duda não declarar o histórico completo, rotulá-los como "itens registrados".

### FR-009: Link de origem (Must Have) — US-001
THE SYSTEM SHALL mostrar por página um link para o perfil de origem (Letterboxd ou Hardcover) no formato `https` (001, FR-010), quando existir.

### FR-010: Estado vazio (Must Have) — US-001
IF não houver itens, THE SYSTEM SHALL mostrar um estado vazio que explica que a estante ainda será preenchida.

### FR-011: Sem marcador de exemplo (Must Have) — US-002
THE SYSTEM SHALL falhar a verificação se um item publicado tiver texto de exemplo ou marcador `[entre colchetes]` (substitui o guarda de modo `mock`).

### FR-012: Importador offline (Should) — US-003
THE SYSTEM SHALL oferecer uma ferramenta offline, em `scripts/`, que converte o CSV do Letterboxd em arquivo de conteúdo; SHALL NOT usar rede, TMDB nem gerar `tmdbId`. A ferramenta nunca roda no site nem entra no pacote do navegador.

### FR-013: Remoção do código de API (Must Have) — US-002
THE SYSTEM SHALL remover, nas tarefas desta spec e junto com a reescrita das páginas, o código de API, cache, Functions e blocos assíncronos listados nas seções A e B da proposta, e SHALL NOT remover nada antes de a Duda aprovar a lista no `design.md`.

### FR-014: Escala (Must Have) — US-002
THE SYSTEM SHALL aguentar centenas de itens: a página lista com paginação ou carregamento sob demanda, e a verificação de conteúdo cabe no limite de 5 s da 001 (medida com 500 itens).

### FR-015: Idiomas, rota e sem JavaScript (Must Have) — US-001
THE SYSTEM SHALL servir as três páginas em PT e EN (002, FR-020), com o texto de interface em PT/EN e a resenha no idioma em que a Duda escreveu (Q-003), e entregar a lista no HTML sem JavaScript.

## Non-Functional Requirements
### NFR-001: Performance
LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; validação de 500 itens ≤ 5 s.
### NFR-002: Segurança
Sem segredo; sem variável de API no `.env.example`, no cliente ou no painel (a Duda apaga os do Netlify); sem requisição a terceiros.
### NFR-003: Acessibilidade
WCAG 2.1 AA; estrelas com texto alternativo; estado nunca só por cor; blocos coloridos com contraste ≥ 4,5:1 para o texto e 3:1 para a borda.

## Constraints
- Conteúdo curado, schemas da 001; datas pela regra da 001.
- Branch `rebuild/sdd`; sem `push` sem pedido; aprovação só pela Duda.
- Nada inventado: a estante só tem o que a Duda registrou.

## Decisions
### D-001: Conteúdo à mão, sem API (2026-11-15)
**Decision:** Letterboxd, Hardcover e Spotify manualmente. **Rationale:** corta termos, segredo, cache e falha de fonte. **Alternatives considered:** RSS/API (superado).

### D-002: A 008 remove e reescreve juntas (Q-P5)
**Decision:** a 008 é dona da remoção do código de API. **Rationale:** `/pessoal` nunca quebra.

### D-003: Importador só para filmes, em `scripts/` (Q-P1, Q-P13, Q-P14)
**Decision:** CSV do Letterboxd offline; livros e música à mão. **Rationale:** a carga é grande só nos filmes.

## Questions
### Q-001 (answered, 2026-11-19): `@netlify/blobs` e `[functions]`
**Resposta da Duda: a 008 remove**, junto com o código de API. Pergunta original:
A PEND-001 já foi resolvida na 001. O `@netlify/blobs` e o bloco `[functions]` do `netlify.toml` ficam sem uso: removo na 008 (proposta, seção D) ou isso é da 010?

### Q-002 (answered, 2026-11-19): histórico completo
**Resposta da Duda: um campo no conteúdo que só ela liga**; até lá, "itens registrados". Pergunta original:
Quando a Duda declara "o histórico está completo", o rótulo "itens registrados" sai? Onde está essa declaração (um campo no conteúdo)?

### Q-003 (answered, 2026-11-19): idioma da resenha
**Resposta da Duda: resenha em PT e EN** (paridade da 001); ela fornece os dois textos. Pergunta original:
Resenha em PT e EN (paridade, 001) ou só no idioma escrito? A regra da 001 pede os dois; confirma que resenha curta também terá EN?

### Q-004 (answered, 2026-11-19): rodapé "atualizado em"
**Resposta da Duda: tirada do conteúdo** (maior data de edição dos itens). Pergunta original:
A data é mantida à mão ou tirada do conteúdo (maior data de edição)? (Q-P7.)

### Q-005 (answered, 2026-11-19): "lendo agora"
**Resposta da Duda: "lendo desde [data]"**, livro com estado "lendo" e data de início, editado à mão. Pergunta original:
Sem dado ao vivo: "lendo desde [data]" à mão, ou sai? (Q-P9.)

### Q-006 (answered, 2026-11-19): tamanho da página
**Resposta da Duda: agrupar por ano, com anos recolhíveis**, tudo no HTML (FR-014 vale assim). Pergunta original:
Centenas de filmes: paginação, "carregar mais" ou lista agrupada por ano? Sugestão: agrupar por ano com recolher.

### Q-007 (answered, 2026-11-19): `/pessoal` no menu
**Resposta da Duda: último item do menu**, como no mockup. Pergunta original:
O mockup traz Pessoal no menu. A hierarquia do produto manda a engenharia primeiro; fica no menu em último, como no mockup?

## Implementation FAQ
**Q:** Filme sem mês?
**A:** Mostra só o ano; ordem indeterminada (001, FR-013).

**Q:** Nota 0 ou 4,3?
**A:** Erro de verificação (001, FR-018).

**Q:** CSV traz uma nota que não é múltipla de 0,5?
**A:** O importador recusa a linha e a lista no relatório, sem adivinhar.

**Q:** Imagem de capa vem de outro site?
**A:** Recusada (FR-007).

**Q:** Estante vazia?
**A:** Estado vazio explicativo (FR-010).

## Success Metrics
- [ ] Nenhuma requisição externa em `/pessoal` (verificada).
- [ ] Item inválido, item com `[...]`, nota 0 e imagem externa quebram a verificação (testado).
- [ ] 500 itens de exemplo: validação ≤ 5 s e página dentro das metas de desempenho.
- [ ] Código de API removido da lista aprovada; `verify` e a suíte passam.
- [ ] axe sem violação; Lighthouse ≥ 95.

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Remover código de API quebra `/pessoal` | Média | Alto | D-002: remove e reescreve juntos |
| Centenas de itens pesam a página | Média | Médio | FR-014 |
| Importador gera nota inválida | Média | Baixo | Recusa e relatório |
| Capa de terceiros sem licença | Baixa | Alto | FR-007 |
| Variáveis de API ficam no painel do Netlify | Média | Médio | Ação da Duda (PEND-005) |

## Validação: entrada → resultado
| Entrada | Resultado |
| --- | --- |
| Filme com nota 4,5 | "nota 4,5 de 5", estrelas 4,5 |
| Filme sem nota | só título |
| Filme com nota 0 | erro |
| Livro "quero ler" sem nota | só título e estado |
| Item com `[exemplo]` | erro de verificação |
| Capa `https://...` | erro: externa |
| Perfil `http://letterboxd...` | erro: precisa de `https` |
| Sem itens | estado vazio |

## Confirm before building
Responda Q-001 a Q-007 antes de aprovar. A lista de remoção (seções A, B, C e D da proposta) só é aprovada no `design.md`.
