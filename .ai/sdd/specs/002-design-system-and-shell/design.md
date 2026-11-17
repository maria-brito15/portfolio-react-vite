# 002 Design system and shell, Design
**Status:** draft (PARCIAL)   **Requirements:** @requirements.md (`requirements:approved`)   **Referência visual:** @design-reference/README.md (não é especificação)

> **Escopo desta versão:** só os tokens e as regras visuais (seção 3 do README de referência). As demais seções (arquitetura, tabela de rotas, idiomas e endereços, HTML sem JavaScript, página e build de prova, menu, cabeçalhos de segurança) **ainda não foram escritas**: dependem do SPIKE-001 e do design da spec 001. Nada aqui foi aprovado.

## Executive Summary
Um só conjunto de tokens alimenta dois temas, claro e escuro, com duas famílias de fonte (IBM Plex Sans e IBM Plex Mono). Todo par de texto e fundo é verificado por teste contra o critério da spec (FR-007), e os números abaixo foram **calculados**, não estimados.

## Requirements Mapping (parcial)
| Requisito | Decisão / seção |
| --- | --- |
| FR-001 Fonte única de tokens | TD-001, tabelas de tokens |
| FR-002 Dois temas, sem degradê | TD-001, TD-005 |
| FR-007 Contraste | TD-003 e Achados 1 a 5 |
| FR-017 Foco visível | TD-004 |
| FR-018 Movimento reduzido | TD-004 |
| FR-029 Fontes (≤ 2 famílias, texto visível durante o carregamento) | TD-002 |
| FR-003 a FR-006, FR-008 a FR-016, FR-019 a FR-028, FR-030 a FR-035 | **Pendentes** (próximas seções) |
| NFR-001 (tamanho e desempenho) | **Pendente** (SPIKE-001) |

## Tokens propostos
Valores da seção 3 do README de referência. Razões de contraste **calculadas** com a fórmula WCAG (script de conferência, 2026-11-15).

### Tema claro
| Token | Valor | Uso | Razão sobre o fundo creme `#FFF7EA` |
| --- | --- | --- | --- |
| fundo | `#FFF7EA` (ver Achado 1) | página | base |
| texto | `#17171A` | corpo | 16,82 |
| texto secundário | `#585861` | apoio | 6,62 |
| acento | `#2B36D9` | links, estrelas | 7,50 |
| borda de controle | `#77777F` | controles | 4,17 |
| divisor | `#D9D9D4` | só decoração | 1,33 |
| texto sobre acento | `#FFFFFF` | botão primário | 7,98 sobre o acento |

### Tema escuro
| Token | Valor | Uso | Razão |
| --- | --- | --- | --- |
| fundo | `#0E0E10` | página | base |
| superfície | `#17171A` | cartões | base |
| texto | `#ECECEE` | corpo | 16,35 no fundo; 15,16 na superfície |
| texto secundário | `#A3A3AC` | apoio | 7,71; 7,15 |
| acento | `#8F98FF` | links, estrelas | 7,44; 6,90 |
| borda de controle | `#7A7A84` | controles | 4,54; 4,21 |
| divisor | `#2C2C32` | só decoração | 1,39 |
| texto sobre acento | `#0E0E10` | botão primário | 7,44 sobre o acento |

### Tons de apoio (fundos de capas, números e cartões)
| Tom | Valor | Texto `#17171A` | Acento `#2B36D9` | Secundário `#585861` | Borda `#77777F` |
| --- | --- | --- | --- | --- | --- |
| pêssego | `#FFD9C7` | 13,63 | 6,08 | 5,36 | 3,38 |
| lilás | `#E4E1FF` | 14,07 | 6,27 | 5,53 | 3,49 |
| menta | `#C9EDD8` | 14,13 | 6,30 | 5,56 | 3,51 |
| limão | `#FFEEA8` | 15,37 | 6,86 | 6,05 | 3,82 |
| céu | `#CFE8FF` | 14,17 | 6,32 | 5,58 | 3,52 |
| rosa | `#FFD3E8` | 13,40 | 5,98 | 5,27 | 3,33 |

### Tons escuros equivalentes (capas no tema escuro)
| Tom | Texto `#ECECEE` | Acento `#8F98FF` | Borda `#7A7A84` |
| --- | --- | --- | --- |
| `#5A2A4E` | 9,49 | 4,32 | 2,64 |
| `#1F5A62` | 6,60 | 3,00 | 1,83 |
| `#6B3A1E` | 7,91 | 3,60 | 2,20 |
| `#2F3A9E` | 8,02 | 3,65 | 2,23 |

### Decoração sem texto
Faixa de cinco cores no topo (`aria-hidden`), bordas laterais da 404 e chips de estado do Acadêmico usam magenta, laranja e azul-petróleo (`#FF8FCB`, `#FFA36B`, `#4FD1D9` no mockup). **Só como detalhe sem texto**: o estado sempre também traz texto (ex.: "CURSADO ATÉ 2026").

## Achados da conferência (o que o README não diz ou diz diferente)
1. **Fundo do tema claro conflita.** O README e a faixa "tons de apoio" da tela Tokens dizem `#FFF7EA`, mas a lista de tokens do tema claro na mesma tela usa `#F6F6F3` (texto 16,52; acento 7,37; borda 4,10). Os dois passam. **Decisão sua: DQ-004.**
2. **Faixa de contraste do acento:** o README dá 6,1 a 7,5 sobre creme e pastéis. O cálculo dá **5,98 a 7,50** (rosa fica em 5,98). Continua acima de 4,5.
3. **Borda de controle sobre pastel não chega a 4:1.** A regra do README ("borda de controle com contraste mínimo de 4:1") vale sobre creme (4,17), cinza (4,10) e branco (4,44), mas sobre os tons de apoio fica em **3,33 a 3,82**. Isso cumpre o FR-007 (3:1 para componentes), mas **não** o 4:1 do README. Regra proposta no TD-003.
4. **Acento sobre os tons escuros não passa em texto normal:** 3,00 a 4,32, abaixo de 4,5. Nesses fundos, texto só em `#ECECEE`; o acento fica proibido como cor de texto ali.
5. **Borda de controle sobre os tons escuros fica em 1,83 a 2,64**, abaixo de 3:1. Controles não podem ficar sobre esses tons sem outra borda.
6. **O rodapé diz "sem rastreadores"**, mas a decisão V-D-011 mede visitas com analytics sem cookies. Texto mais exato: "sem cookies". Não é questão de contraste: fica na lista de lacunas abaixo.

## Technical Decisions
### TD-001: Um conjunto de tokens, dois temas, sem degradê
**Decision:** os valores das tabelas acima viram tokens nomeados; nenhum estilo usa cor literal. Os tons de apoio são tokens próprios, usados só como fundo. **Rationale:** FR-001, FR-002 e D-004; um teste lê os tokens, e o contraste vira número verificável. **Alternatives:** tokens só do tema atual (não escala para o escuro); cores literais por componente (cria deriva).

### TD-002: IBM Plex Sans e IBM Plex Mono (candidatas, a confirmar com o teste de peso)
**Decision:** Plex Sans para interface e Plex Mono para metadados, datas, etiquetas e código. São 2 famílias, cumprindo o FR-029. Pesos propostos: Sans 400 e 600, Mono 400, em latim, com fontes hospedadas no próprio site e texto visível com fonte reserva durante o carregamento. Isso dá 3 arquivos na primeira pintura (teto de 4). **Rationale:** são livres (licença OFL, a registrar com a data de verificação) e legíveis, e o português cabe no subconjunto latino. **Alternatives:** manter Fraunces e JetBrains Mono (a identidade nova substitui); fonte do sistema (sem carregamento, mas sem identidade). **DQ-003 continua aberta:** a decisão final depende do teste de peso de fonte.

### TD-003: Regras de contraste, mantendo o critério da spec
**Decision:** continua valendo o FR-007: texto normal ≥ 4,5:1, texto grande e componentes ≥ 3:1, nos dois temas. O teste automatizado percorre uma **matriz de pares permitidos** (token de texto × token de fundo) e falha se um par fora da matriz for usado. Sobre o acréscimo do README: borda de controle ≥ 4:1 **onde for possível** (creme, cinza, branco, superfícies escuras); sobre os tons de apoio vale o piso do FR-007 (3:1). Pares proibidos pela conferência: acento como texto sobre tons escuros (Achado 4) e controle com borda sobre tons escuros (Achado 5). **Rationale:** não apertar o critério aprovado sem decisão sua. **Alternatives:** exigir 4:1 em todo lugar (obriga escurecer a borda para `#6B6B73` sobre pastel, a testar); manter só 3:1 sempre (perde a vantagem do README). **Pergunta: DQ-006.**

### TD-004: Foco, alvo de toque e movimento
**Decision:** foco com anel de 3 px no acento (contra o fundo adjacente: 7,50 no creme, 5,98 a 7,50 nos pastéis, 7,44 no escuro, 3,00 a 4,32 nos tons escuros, sempre ≥ 3:1), alvo de toque mínimo de 44×44 px e nenhuma animação essencial, tudo respeitando `prefers-reduced-motion`. Estado nunca só por cor: a página atual também ganha sublinhado e peso. **Rationale:** FR-017, FR-018 e NFR-003.

### TD-005: Paleta colorida nos dois temas
**Decision (proposta, a confirmar):** no tema claro, tons pastel; no escuro, os quatro tons escuros equivalentes. **Rationale:** é o que o mockup mostra. **Alternatives:** paleta colorida só no claro, com o escuro neutro (resolve os Achados 4 e 5 sem regra nova, mas perde cor). **Pergunta: DQ-005.**

## Lacunas nos requisitos aprovados (PROPOSTAS, não aplicadas)
O mockup traz itens que a spec 002 aprovada não cobre. Pelas regras do gate, **não editei o `requirements.md` aprovado**: proponho a alteração e peço aprovação. As propostas em EARS estão em `design-reference/telas-e-requisitos.md` (P-002-a a P-002-e): rodapé de créditos, fonte única do "elenco" (stack), faixa decorativa, sugestões na 404 e estado nunca só por cor. A faixa de idioma do mockup Mobile já está coberta pelo FR-025.

## Perguntas deste design
- **DQ-003** (aberta): famílias e pesos de fonte, depois do teste de peso.
- **DQ-004 (respondida pela Duda, 2026-11-15):** fundo claro **creme `#FFF7EA`**. Os tokens do tema claro passam a usar esse valor (a lista `#F6F6F3` do mockup fica descartada).
- **DQ-005 (respondida, decisão 7 do README):** **manter a paleta colorida nos dois temas**, com regras de uso: nos tons escuros, texto só em `#ECECEE`, acento proibido como cor de texto e controle com borda proibido sobre eles (Achados 4 e 5). O teste de contraste barra os usos proibidos (TD-003, TD-005).
- **DQ-006 (respondida):** **piso de 3:1 do FR-007 sobre os tons pastel**, e 4:1 onde o fundo permite (creme, branco, superfícies escuras). Vale o TD-003 como está.
- **DQ-007 (respondida):** o rodapé diz **"sem cookies"** (em inglês, "no cookies"), não "sem rastreadores", por causa da V-D-011.
- **DQ-008** (aberta): qual das cores decorativas (magenta, laranja, azul-petróleo) entra de fato? São só detalhes sem texto.

*Os requisitos P-002-a a P-002-e (rodapé de créditos etc.) continuam propostas até você aprová-los na spec.*

## Pendente neste design
Arquitetura e tabela de rotas, idiomas e endereços, HTML sem JavaScript (depende do SPIKE-001), página e build de prova, menu e foco, cabeçalhos de segurança (e a decisão DQ-001 sobre CSP), Verification Strategy e Riscos. Termina com "Confirm before building" só quando estiver completo.

## Confirmações e pendências da rodada de 2026-11-15
- **DQ-006 confirmada como intencional pela Duda:** a borda de controle sobre os tons pastel tem **piso de 3:1** (o FR-007 aprovado da 002 pede 3:1 para componentes; o 4:1 vinha do README de referência). 4:1 continua valendo onde o fundo permite (creme, branco, superfícies escuras). Gravado no TD-003.
- **DQ-009 (nova, aberta):** a requirements desta spec diz "a reconstrução fica na `main`, sem `git push` (V-D-015)", mas o trabalho está na branch `rebuild/sdd`. É a mesma contradição da DQ-013 da spec 001 e se resolve junto com ela.
- **DQ-009 (respondida em 2026-11-15):** a regra de branch é a da DQ-013 da spec 001 (branch `rebuild/sdd`, push só quando a Duda pedir, merge na `main` no lançamento). As Constraints desta spec foram corrigidas (requirements v1.3, só Constraints).
