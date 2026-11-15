# PLAN — Portfólio da Duda
**Estado:** `plan:approved` (ver `.ai/sdd/.status`) · Fontes: `ideas/001`, `ideas/002`, `steering/`

## Mudanças desde o plano aprovado (a pedido da Duda)
- A spec 001 foi **dividida**: `001-engineering-baseline` (vem primeiro) e `002-design-system-and-shell`. As demais specs foram renumeradas (+1).
- IDs: as decisões da visão passaram a `V-D-NNN` e as perguntas deste plano a `P-Q-NNN`, para não colidir com os `D-` e `Q-` locais de cada spec.
- A integração contínua (antigo FR-020 da 001) foi para `010-quality-and-launch`.
- Rodapé do estado corrigido: o plano está `plan:approved`, como em `.status` e `INDEX.md`.
- A spec 001 é a dona da remoção do código fora do MVP (a Duda aprova a lista no `design.md`); os 3 temas extras saem com a 002.
- Netlify publica a partir da `main`: nada é publicado só enquanto a Duda não der `push`.

## Como este plano muda a proposta inicial
- **Cortei do MVP:** diário, listas, busca e "ano em revisão". O MVP definido na entrevista (V-D-003) é projetos, casos, currículo, acadêmico, contato e `/pessoal`. Esses quatro ficam em "Fora do MVP".
- **Adicionei `003-content-migration`:** o conteúdo existente é o único ativo insubstituível (auditoria §4) e precisa de spec própria, com o schema e as regras de data.
- **Fundi** "about-and-contact" com currículo e acadêmico, que já são páginas curtas e do mesmo público.
- **Adicionei `009-terminal`:** o terminal fica em `/terminal` (V-D-004) e precisa de uma spec pequena para sobreviver à nova casca.
- **A saúde dos testes vai para a 001:** a suíte atual falha (5 testes) e leva 638 s; o `verify` não pode nascer sobre isso. A medição de 638 s rodou junto com outros comandos e a causa nunca foi investigada.

## Features
| # | Spec | Cobre | Risco |
|---|---|---|---|
| 001 | engineering-baseline | Comando único de verificação, suíte de testes verde e rápida, schemas de conteúdo validados, paridade PT/EN, regra de datas, varredura de segredos e remoção do código fora do MVP (trilhas, personas, jogos, assistente de IA; lista aprovada no `design.md`) | Médio |
| 002 | design-system-and-shell | Identidade nova (tokens, tipografia, paleta), casca, navegação, tabela de rotas, temas claro e escuro, acessibilidade, idiomas e endereços, 404, HTML sem JS | Alto |
| 003 | content-migration | Projetos, experiências, acadêmico, currículo e habilidades para conteúdo tipado e validado; paridade PT/EN; regra de datas | Médio |
| 004 | profile-home | Cabeçalho do perfil, quatro destaques, atividade recente, números; escaneável em 60 s | Médio |
| 005 | projects-catalog | Grade de capas, filtros (stack, domínio, ano, nota), detalhe, nota por critérios públicos | Alto |
| 006 | case-studies | Estudos de caso (decisões, trade-offs, resultado); migra os 3 casos existentes | Médio |
| 007 | resume-academic-contact | Currículo (inclui impressão), acadêmico, sobre, contato com formulário | Baixo |
| 008 | films-and-books | `/pessoal`: filmes e livros, notas e resenhas; verificar os termos de TMDB, Hardcover e Letterboxd; atribuição | Alto |
| 009 | terminal | `/terminal` fora do menu principal, funcionando na casca nova | Baixo |
| 010 | quality-and-launch | SEO por idioma, OG, analytics sem cookies, integração contínua, auditorias de desempenho e acessibilidade, redirecionamento das URLs antigas, deploy | Alto |

## Dependências e paralelismo
```
001 ──► 002 ──► 003 ──┬─► 004 ─────────────┐
                      ├─► 005 ──► 006 ─────┤
                      └─► 007 ─────────────┼─► 010
              002 ──► 008 (também depende da verificação dos termos de API) ─┤
              002 ──► 009 ───────────────────────────────┘
```
- **001 vai primeiro:** não depende da identidade visual e os schemas, o `verify` e a suíte verde são a base de todas as outras. Pode ser construída enquanto a 002 amadurece o design.
- **Paralelizáveis depois da 003:** 004, 005 e 007. A 006 espera a 005 (usa o detalhe do projeto).
- **008 e 009** dependem da 002 e podem andar em paralelo com o resto.
- **010** vem por último e depende de todas.
- Ordem sugerida para aprovação: 001, 002, 003, 005, 004, 006, 007, 008, 009, 010.

## Fora do MVP
- Diário (log datado em projetos, filmes e livros).
- Listas curadas que misturam projetos, filmes e livros.
- Busca global e páginas de tag e gênero.
- Ano em revisão e ligações "este projeto foi moldado por este filme".
- Assistente de IA, trilhas, personas, jogos (V-D-005) e temas além de claro e escuro (V-D-006).

## Perguntas do plano
- **P-Q-001 (respondida):** a reconstrução **substitui o código antigo no lugar**, na mesma branch. Consequência: cada spec lista, no `design.md`, os arquivos antigos que remove, e a remoção acontece dentro das tarefas dela. A suíte antiga pode ficar parcialmente quebrada durante a transição; a 001 define como isso é tratado.
- **P-Q-002 (aberta):** ferramenta de analytics sem cookies e o custo (spec 010). Pode ficar para quando a 010 chegar.
- **P-Q-003 (aberta):** termos de TMDB, Hardcover e Letterboxd (spec 008). Eu verifico, a decisão é sua.
- **P-Q-004 (respondida):** nenhum dado do currículo e do acadêmico está desatualizado; a Duda atualiza ao longo do tempo se precisar. A 003 migra o conteúdo como está.
