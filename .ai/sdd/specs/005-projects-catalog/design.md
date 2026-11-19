# 005 Projects catalog, Design
**Status:** draft (aguarda a Duda; ver `.status`) · **Versão:** 0.1 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada em 2026-11-19; Q-001 a Q-006 respondidas), `003-content-migration/requirements.md` v1.0 (o design da 003 **ainda não existe**: ver "Contrato esperado da 003"), `002-design-system-and-shell/design.md` v2.4 e `evidence.md` (orçamento medido), `001-engineering-baseline/design.md` (primitivas), `AGENTS.md`, `.ai/steering/*`, os mockups `Projetos.dc.html` e `Projeto.dc.html` (referência visual, não especificação) e o código atual (`src/router.tsx`, `src/data/routes.ts`, `scripts/prerender.ts`, `scripts/measureBundle.mjs`).

## Executive Summary
O catálogo é a página `/projetos` (grade agrupada por ano, filtros) e uma página de detalhe por projeto, nos dois idiomas, lendo o conteúdo da 003. Sete decisões sustentam o resto:
1. **Filtros no endereço por query string** (`?stack=react,java&ano=2026&tipo=estudo-de-caso`), só com valores conhecidos (lista fechada, nunca texto livre), gravados com `replaceState`. O HTML gerado é sempre o catálogo **inteiro**; os filtros são aprimoramento aplicado **depois** da hidratação (TD-001, TD-002).
2. **Detalhe por uma rota-padrão na tabela de rotas** (`/projetos/:slug`, `/en/projects/:slug`), com as páginas geradas no build a partir do conteúdo; **slug = `id` do projeto**, igual nos dois idiomas (TD-003, TD-004). A tabela não ganha uma linha por projeto, para não crescer o chunk de entrada (que já está em 97,9 KB de 100).
3. **Critérios e nota são conteúdo validado**: `rubric.content.ts` (4 critérios + regra) e `projectCatalog.content.ts` (uma frase, papel, equipe, estado, demonstração e notas por critério, por projeto). Esse segundo arquivo existe porque a 003 não tem esses campos e a 003 está fechada (TD-005).
4. **A nota é calculada em inteiros**, sem ponto flutuante: média com 2 casas (arredonda meio para cima) e estrelas na meia mais próxima (meio para cima). Qualquer critério faltando = "sem nota" (TD-006, TD-007).
5. **Capa é um bloco tipográfico**: inicial grande, selo (só quando existe no dado), tom estável pela posição do projeto no conteúdo; imagem própria só se o dado trouxer (TD-008).
6. **Orçamento de JavaScript:** o chunk de entrada **não cresce além de 0,5 KB**; cada página do catálogo cabe em **110 KB (gzip) no total** (entrada + página), com a página em ≤ 12 KB. O número de 110 KB é uma proposta que a Duda precisa confirmar (TD-011, DQ-001).
7. **O código novo substitui o antigo no lugar** (P-Q-001): a página antiga de projetos (`src/sections/portfolio/Project*.tsx`) sai nesta spec (TD-014).

Nada aqui foi aprovado. Onde há escolha que é da Duda, está marcada como `DQ-NNN` com a minha recomendação.

## Requirements Mapping
| Requisito | Decisão / seção | Verificação |
| --- | --- | --- |
| FR-001 Lista por ano | TD-009, Interface Contract (catálogo) | V-01, V-05 |
| FR-002 Ordem indeterminada | TD-009 | V-01, V-05 |
| FR-003 Filtros (E entre grupos, OU dentro) | TD-001, TD-010, Data Model (filtros) | V-02 |
| FR-004 Estado vazio e anúncio | TD-002, TD-012 | V-02, V-06 |
| FR-005 Filtro pelo endereço, valor inválido ignorado | TD-001 | V-02 |
| FR-006 Detalhe do projeto | TD-003, TD-012, Interface Contract (detalhe) | V-04, V-05 |
| FR-007 Endereço por idioma, troca leva ao mesmo projeto | TD-003, TD-004 | V-03, V-05 |
| FR-008 Critérios públicos, mesma lista para todos | TD-005, TD-006, Data Model (rubrica) | V-07, V-08 |
| FR-009 Nota: média, 2 casas, estrelas na meia, texto alternativo | TD-006, TD-007 | V-07 |
| FR-010 Sem avaliação / avaliação parcial = "sem nota" | TD-006, TD-007 | V-07 |
| FR-011 Capa (imagem própria ou bloco; sem imagem de terceiro) | TD-008 | V-09 |
| FR-012 Links só quando existem, `https`, sem rastreamento | TD-012, Data Model (`demo`) | V-04, V-08 |
| FR-013 Teclado, foco visível, estado sem depender de cor | TD-002, TD-012 | V-06 |
| FR-014 Conteúdo sem JavaScript; filtros só aprimoramento | TD-002, TD-003 | V-03, V-05 |
| FR-015 Rotas na tabela, catálogo no menu | TD-003 | V-03 |
| NFR-001 Performance (LCP, INP, CLS, 200 ms, orçamento de JS) | TD-011 | V-10 |
| NFR-002 Segurança (valor do endereço nunca vira marcação; sem terceiros) | TD-001, Segurança | V-02, V-06 |
| NFR-003 Acessibilidade | TD-007, TD-012 | V-06, V-10 |

Todo FR e NFR tem casa; nenhuma lacuna de mapeamento. **Lacunas de conteúdo (não de mapeamento)**, que a Duda precisa decidir, estão em "Lacunas do requirements" abaixo (papel, equipe, estado e demonstração não existem hoje; "uma frase" não existe na 003).

## Lacunas do requirements (apontadas, não resolvidas em silêncio)
1. **"Uma frase" por projeto (FR-001) não existe no conteúdo.** O dado atual só tem a descrição longa. As frases do mockup (`blurb`) foram escritas para o mockup, não vêm da Duda. Pelo AGENTS.md ("nada de dado inventado"), cada `summary` PT e EN é conteúdo que ela escreve ou aprova (DQ-002). Sem eles a verificação falha (paridade, 001).
2. **Papel, equipe, estado e demonstração (FR-006, US-004) não existem hoje.** O `Project` atual não tem esses campos e a 003 (FR-001) não os lista. Proposta: campos opcionais no arquivo da 005 (TD-005); a ficha mostra só as linhas que existem (DQ-003). Nenhum é preenchido por mim.
3. **O texto da página de catálogo** (`h1`, introdução, rótulos) é texto de interface em PT e EN. O mockup traz uma introdução ("Seis projetos, do primeiro trabalho de faculdade a um sistema reescrito do zero...") que não existe hoje e tem um número fixo que envelheceria. A introdução atual (em `portfolio.tsx`) fala de dividir projetos "por propósito", o que o catálogo novo não faz. Proposta: a contagem é calculada ("6 projetos") e a introdução é uma frase que a Duda aprova (DQ-004).
4. **Ficha com campo ausente:** o requirements não diz se a linha some ou mostra "—". Proposta: a linha some (DQ-003).

## Contrato esperado da 003 (o design dela não existe; isto é suposição a confirmar)
A 005 lê, de `src/content/projects.content.ts` (nome ainda não definido), um projeto com o que a 003 FR-001 já lista: `id` (kebab, `^[a-z0-9]+(-[a-z0-9]+)*$`), `name` (texto, **não** localizado: é o nome próprio), `date` (`ContentDate`), `dateLabel?` (`LocalizedText`), `stack` (`TagSet`), `repo?` (`Link` `https`), `caseStudy?` (`Link` interno), `images` (`Image[]`, hoje vazio nos 6), `badge?` e `description` (`LocalizedText` ou estrutura da marcação, a 003 decide) e `versions?`. **Se a 003 nomear ou formatar diferente, só o adaptador `src/catalog/projectView.ts` muda** (TD-005). O registro `registry.ts` é editado pelas duas specs: a ordem de entrada na `main` evita conflito (R-007).

## Architecture
```
 conteúdo (Node + página)                         build (Node)                         navegador
 ─────────────────────────                        ─────────────                        ──────────
 projects.content.ts   (003) ──┐
 rubric.content.ts     (005) ──┼─► src/catalog/projectView.ts ─► pages/Projects.tsx  ─► HTML /projetos (lista inteira)
 projectCatalog.content.ts(005)┘      (junção + ordem + nota)   pages/ProjectDetail.tsx   HTML /projetos/<id> (um por projeto × idioma)
                                                                       ▲                          │ hidratação
 scripts/prerender.ts ── prerenderPaths() expande a rota-padrão ───────┘                          ▼
   por projeto × idioma, lendo o conteúdo direto (Node)                         filtros: lê ?query, aplica, replaceState
```
- **Dois chunks lazy novos** (`ProjectsCatalog`, `ProjectDetail`) em `src/pages/lazyPages.ts`, mais um **chunk compartilhado** (capa, estrelas, explicação da rubrica, junção do conteúdo) que o Rollup separa sozinho. O conteúdo de projetos **só** entra nesses chunks (003 NFR-001: o conteúdo de uma página é carregado só nela).
- **Dado e Node:** os schemas (zod) só valem nos scripts e testes (`devDependency`, 001 TD-001); o navegador recebe os mesmos dados tipados por `import type` e as funções puras `score.ts`, `filters.ts`, `order.ts`.
- **CSS:** `src/styles/catalog.css` é importado pelo módulo da página (não por `main.tsx`), então o Vite o emite no chunk da página e `chunkAssets` do pré-render já o referencia (hoje faz isso para as outras páginas). Zero cor literal: só tokens da 002.
- **Estado de visitante:** nenhum novo. Os filtros vivem só no endereço da aba; nada vai a `localStorage` nem ao servidor.

## Data Model
Regra que cabe no dado fica no schema (steering; 001 §5). Todos os campos são dado simples.

### Rubrica (`src/content/rubric.content.ts`, schema `src/content/schema/rubric.ts`)
| Campo | Tipo | Regra | Motivo do erro (PT) |
| --- | --- | --- | --- |
| `criteria` | lista de `{ id, label, description }` | ao menos 1; `id` kebab e **único** (como `TagSet`); `label` e `description` com `LocalizedText` completo | `identificador repetido "code-clarity" (já usado em criteria[0])` |
| `rule` | `LocalizedText` | PT e EN | `texto ausente` |
| escala (0,5 a 5, passo 0,5) | **não é campo** | vem de `RATING_MIN`, `RATING_MAX`, `RATING_STEP` (`schema/rating.ts`, 001); a 005 não repete o número | n/a |
A quantidade de critérios é dado, não código: todo cálculo usa `criteria.length` (N). Um teste do **conteúdo real** fixa N = 4 e os quatro ids (Q-001 respondida); o schema aceita N ≥ 1.

**Os quatro critérios (ids e nomes PT/EN propostos; a Duda aprova, Q-001):**
| `id` | PT | EN |
| --- | --- | --- |
| `code-clarity` | Clareza do código | Code clarity |
| `tests-verification` | Testes e verificação | Tests and verification |
| `a11y-performance` | Acessibilidade e desempenho | Accessibility and performance |
| `real-use-impact` | Uso real / impacto | Real use / impact |
Os textos de `description` (o que significa cada critério) e de `rule` são **conteúdo que a Duda escreve ou aprova** (DQ-005). Proposta de `rule`: PT "A nota do projeto é a média simples dos quatro critérios, cada um de 0,5 a 5 em passos de 0,5. Enquanto os quatro não forem avaliados, o projeto aparece como sem nota." / EN "A project's rating is the simple average of the four criteria, each from 0.5 to 5 in steps of 0.5. Until all four are rated, the project shows as unrated." (o número "quatro" sai do dado ao gerar o texto: uma frase com `{n}`; ver TD-006).

### Entrada do catálogo (`src/content/projectCatalog.content.ts`, schema `src/content/schema/projectCatalog.ts`)
Lista com **uma** entrada por projeto, `id` igual ao da 003.
| Campo | Tipo | Regra | Motivo do erro (PT) |
| --- | --- | --- | --- |
| `id` | kebab | **existe** em `projects` (003); único; todo projeto tem entrada | `projeto "xyz" não existe no conteúdo` · `projeto "ecoshop" sem entrada no catálogo` · `identificador repetido` |
| `summary` | `LocalizedText` | obrigatório; uma frase: sem quebra de linha e ≤ 200 caracteres (cabe no cartão) | `texto ausente` · `frase com quebra de linha` · `frase com 240 caracteres (máximo 200)` |
| `role` | `LocalizedText`, opcional | PT e EN se existir | idem |
| `team` | `LocalizedText`, opcional | PT e EN se existir | idem |
| `status` | `LocalizedText`, opcional | PT e EN se existir; **texto livre dela, não enumeração** (nenhum estado é inventado) | idem |
| `demo` | `Link`, opcional | **só `https`** (FR-012): caminho interno e `mailto:` são recusados aqui | `demonstração precisa de https` |
| `scores` | objeto, opcional | chaves **só** ids da rubrica (chave desconhecida é recusada); cada valor passa em `ratingProblem` (001: 0,5 a 5, passo 0,5; `0`, `null`, texto, `NaN` recusados); **cada chave pode faltar** (avaliação em andamento) | `critério "foo" não existe (aceitos: code-clarity, ...)` · `nota 4,3 fora do passo de 0,5` · `nota 0 inválida: sem nota é campo ausente` |
O schema é uma **fábrica** `makeProjectCatalogSchema({ projectIds, criteriaIds })`, e o registro a chama com os ids lidos dos outros dois arquivos de conteúdo: a regra "entre arquivos" (id existe, todo projeto tem entrada, chave de nota é critério) fica no dado e usa o validador de 001 sem mudá-lo (TD-005).
**Estado inicial do conteúdo real:** `scores` ausente nos 6 projetos (a Duda ainda não avaliou nenhum, mockup e D-001 do requirements): o site entra no ar mostrando "sem nota" em todos. Isso é o resultado correto, não defeito.

### Tipos derivados e funções puras (runtime, sem zod)
| Arquivo | Função | Contrato |
| --- | --- | --- |
| `src/catalog/score.ts` | `projectScore(scores, criteria)` | devolve `{ state: 'none' \| 'partial' \| 'complete', rated, total, centis?, halfStars? }`. Ver TD-006 |
| `src/catalog/score.ts` | `formatScore(centis, lang)`, `formatCriterion(value, lang)` | `438` → `4,38` (PT) / `4.38` (EN); critério com 1 casa (`4,0`) |
| `src/catalog/order.ts` | `groupByYear(projects)` | `[{ year, items, indeterminate }]`, anos decrescentes; ver TD-009 |
| `src/catalog/filters.ts` | `filterOptions(projects)`, `parseFilters(search, options)`, `serializeFilters(state, options)`, `applyFilters(projects, state)` | ver TD-001, TD-010 |
| `src/catalog/cover.ts` | `coverTone(index)`, `coverInitial(name)` | ver TD-008 |
| `src/catalog/projectView.ts` | `catalogProjects()` | junta projeto (003) + entrada + rubrica; é o **único** lugar que conhece os nomes de campo da 003 |

### Filtros (estado e endereço)
| Chave na query | Valores aceitos | Combinação |
| --- | --- | --- |
| `stack` | `id` de etiqueta de stack usada por **≥ 2 projetos** (TD-010), separados por vírgula | OU dentro do grupo |
| `ano` | ano de início de algum projeto (4 dígitos) | OU dentro do grupo |
| `tipo` | `estudo-de-caso` (projeto com `caseStudy`) | só um valor, mas segue a mesma regra |
Entre grupos diferentes: **E** (Q-003). As chaves são as mesmas em PT e em EN (o requirements fixa `stack` e `ano`); os **valores** são identificadores neutros. "Finalista PUC Minas" **não** é filtro: é selo (Q-005).

| Entrada (`location.search`) | Estado aplicado | Endereço depois |
| --- | --- | --- |
| (vazio) | nenhum filtro | sem query |
| `?stack=react` | stack = {react} | igual |
| `?stack=react,java&ano=2026` | stack {react, java} E ano {2026} | igual (ordem canônica: a do catálogo) |
| `?stack=xyz` | filtro ignorado | **limpo**: `/projetos` (replaceState) |
| `?stack=react,xyz` | stack {react} | `?stack=react` |
| `?stack=react,react` | stack {react} | `?stack=react` |
| `?ano=abc` ou `?ano=20266` | ignorado | limpo |
| `?tipo=estudo-de-caso` | só os com `caseStudy` | igual |
| `?foo=bar&stack=react` | `foo` ignorado, stack {react} | `?stack=react` (chave desconhecida some) |
| `?stack=__proto__,constructor` | ignorados (não são ids) | limpo |
| `?stack=` + 5 000 caracteres | só se for id exato; senão ignorado; o texto lido é cortado em 2 000 caracteres e 20 valores antes de comparar | limpo |
| `?stack=<img onerror=x>` | ignorado; **nunca** vira marcação nem texto na tela (só rótulos do conteúdo aparecem) | limpo |

## Interface Contract
### Endereços
| Rota (id) | PT | EN | Menu |
| --- | --- | --- | --- |
| `projetos` (existe) | `/projetos` | `/en/projects` | sim (`order` 1, DQ-019 da 002) |
| `projeto` (**nova**, rota-padrão) | `/projetos/:slug` | `/en/projects/:slug` | não (`hidden: true`, fora do `ls` e do menu) |
A rota `projeto` é a única linha nova da tabela. Os arquivos gerados são `dist/projetos.html`, `dist/projetos/<id>.html`, `dist/en/projects.html` e `dist/en/projects/<id>.html`. A pasta `projetos/` convive com `projetos.html` como `en/` convive com `en.html` (002 TD-008).

### Catálogo (`/projetos`)
Ordem do DOM de `main` (é a ordem do foco, 002 FR-016):
1. `h1` (rótulo da rota) e a introdução (DQ-004).
2. Seção de filtros `<section aria-labelledby>` com **um grupo por filtro** (`role="group"` com rótulo visível: "Stack", "Ano", "Tipo"); cada opção é `<button type="button" aria-pressed>` de **44×44 px mínimo**; o botão ativo traz **marca de seleção (✓) e peso**, nunca só cor (002 TD-023, FR-013). Botão "Limpar filtros" (visível quando há filtro ativo).
3. Linha de estado `<p role="status">` (mockup): "6 projetos · nenhum filtro ativo · mais recentes primeiro" / "2 de 6 projetos · stack: React · ano: 2026". É o anúncio da mudança (FR-004, NFR-003); a contagem é **calculada**, nunca fixa.
4. Resultados: um `<section aria-labelledby>` por ano com `h2` (o ano) e a nota de ordem; dentro, `<ul>` de cartões (4 colunas em 1280 px, 2 em 768 px, 1 em 390 px, sem rolagem horizontal).
5. Estado vazio (só quando 0 resultado): bloco com o texto e o botão "Limpar filtros".
6. Explicação da nota (`RubricExplainer`): os critérios com a definição de cada um e a regra (FR-008, US-003).
**Cartão:** `<li>` com `h3` contendo o único `<a>` do cartão (o link "esticado" por `::after` cobre o cartão inteiro, então o nome acessível do link é o **nome do projeto**, não o texto todo); capa (`aria-hidden`); estrelas e nota; data; stack (etiquetas em mono); a frase (`summary`); selo, quando existe (texto "Finalista · PUC Minas" do dado); "Estudo de caso" (derivado de `caseStudy`, texto de interface).
**Sem JavaScript:** a seção de filtros fica escondida por CSS (`html:not(.js)`, a mesma classe do script de boot, 002 TD-010/TD-011): o HTML traz o catálogo completo e **nenhum controle que não faria nada** (FR-014, DQ-002 da 002).

### Detalhe (`/projetos/<id>`)
Ordem do DOM: trilha `<nav aria-label>` (Projetos / nome) → `h1` (nome) → cabeçalho com capa, linha "ano · papel · estado" (**só as partes que existem**), estrelas e nota ("4,38 · média de 4 critérios" ou "sem nota"), `summary`, etiquetas de stack, ações (demonstração, repositório, estudo de caso, **só as que existem**) → `h2` Ficha técnica (`<dl>`: stack, período, e papel, equipe, estado quando existirem) → `h2` Sobre o projeto (descrição da 003) → `h2` Versões (só se o projeto tem `versions`, com data e pontos) → imagens (só se existirem, `<figure>` com `alt`, largura e altura, `loading="lazy"`; **sem lightbox**) → `h2` Nota por critério (`RubricExplainer` com a nota de cada critério, barra decorativa `aria-hidden`, e a regra). O bloco "Moldado por" do mockup **não** existe (fora do MVP). O estudo de caso é só um link (spec 006).
Slug desconhecido na navegação do cliente: a página renderiza o `NotFound` do idioma (sem status; o status 404 real vem do servidor, que não tem o arquivo: 002 TD-014).

### Textos de interface
Um bloco novo `catalog` em `src/i18n/ui.ts`, PT e EN, com a paridade da 001: rótulos de filtro, linha de estado (com plural), estado vazio, "Limpar filtros", "sem nota", "n de N critérios avaliados", "nota X de 5" / "rated X out of 5", rótulos da ficha, "Ver demonstração", "Código no repositório", "Ler o estudo de caso", título da seção da nota, `title` dos detalhes. O bloco `timeline.orderUndetermined` do `ui.ts` atual é reaproveitado se a frase servir ("ordem entre os projetos de 2026 indeterminada", sem mudar o texto); senão sai com a página antiga.

## Segurança
- Nenhum valor do endereço chega ao DOM como texto ou marcação: o parser só **escolhe** ids de uma lista fechada (os do conteúdo) e a tela mostra o rótulo do conteúdo. A lista é consultada com `Map`/`Set` (nunca `obj[chave]`), então `__proto__`, `constructor` e `hasOwnProperty` não existem como valor (NFR-002).
- Links `https` do conteúdo (repositório, demonstração) com `rel="noopener noreferrer"`; sem `target="_blank"` forçado; sem `ping`, sem parâmetro de rastreamento, sem script ou imagem de terceiros (FR-012, FR-030 da 002). Teste e2e registra as requisições do carregamento: todas da mesma origem.
- O CSP continua fora (002 TD-015, spec 010).
- Sem segredo novo; o conteúdo novo passa pela varredura da 001.

## Edge Cases
| Caso | Comportamento | Onde |
| --- | --- | --- |
| 0 projeto no conteúdo | a verificação da 003 falha antes; a página, se renderizada, mostra o estado vazio sem erro | V-05 |
| Todos os filtros ligados sem resultado | estado vazio + "Limpar filtros"; anúncio "0 de 6 projetos"; foco vai ao `h2` dos resultados | TD-012, V-06 |
| "Limpar filtros" apertado no estado vazio | o botão some; o foco vai ao título dos resultados (`tabindex="-1"`), nunca se perde no `body` | TD-012 |
| Projeto sem mês ao lado de projeto com mês no mesmo ano | cada um mostra o que tem; o ano ganha a nota de ordem indeterminada; ordem estável | TD-009 |
| Dois projetos com o mesmo mês | idem (001 FR-013: meses iguais = indeterminada) | TD-009 |
| Projeto sem `scores` / parcial (2 de 4) | "sem nota" + "2 de 4 critérios avaliados"; nenhuma estrela preenchida; os critérios avaliados aparecem na página de detalhe, os demais como "ainda não avaliado" | TD-006, TD-007 |
| Nota 0 no conteúdo | a verificação falha | Data Model |
| Nome que começa com símbolo ou emoji | `coverInitial` usa o primeiro caractere **alfanumérico**; se não houver, o primeiro grapheme | TD-008 |
| Nome longo (80 caracteres sem espaço) | quebra (`overflow-wrap: anywhere`); sem rolagem horizontal em 390 px | V-06 |
| `repo` ou `demo` ausente | o botão não existe; nunca um botão quebrado | FR-012, V-04 |
| Projeto com `caseStudy` | aparece o filtro "Estudo de caso" e o link no detalhe; sem `caseStudy` o link não aparece | V-04 |
| Link `?stack=react` aberto e a tela já hidratada | a lista encolhe depois da hidratação (ver R-003); o conteúdo completo estava no HTML | TD-002 |
| Voltar do detalhe ao catálogo | o navegador restaura o endereço com a query e a página relê os filtros ao montar | TD-001 |
| Troca de idioma com filtros ativos | **os filtros não passam** para o outro idioma (o link do seletor é estático e sai do HTML gerado) | TD-001 (consequência dita) |
| Slug com maiúscula ou barra final | `/projetos/EcoShop` é 404 (arquivo não existe); `/projetos/ecoshop/` segue a regra de barra final da 002 (R-008 lá) | R-006 |
| JavaScript desligado | lista completa e detalhe, filtros escondidos | TD-002 |
| Armazenamento bloqueado | irrelevante: a 005 não grava nada | — |

## Technical Decisions
### TD-001: Estado dos filtros no endereço
**Decision:** a fonte da verdade é a **query string**. Leitura: ao montar (depois da hidratação), `parseFilters(location.search, options)` produz o estado; **qualquer valor que não seja um id conhecido é descartado** (tabela do Data Model). Escrita: a cada clique, `applyFilters` recalcula a lista e a página chama `history.replaceState(history.state, '', path + serialize(state))`, **sem** passar por `router.navigate`. Formato: uma chave por filtro, valores separados por vírgula, ordem canônica (a do catálogo), chave ausente quando o grupo está vazio. Depois do parse, se o endereço diferir do canônico (valor inválido, repetido, chave estranha), o endereço é **reescrito** com `replaceState`, para a barra refletir o que a tela mostra (FR-005). `popstate` não precisa de ouvinte: `replaceState` não cria entrada, e ao voltar de outra página a rota monta de novo e lê a query.
**Rationale:** o requirements fixa `stack`, `ano` e `tipo` (tabela "entrada → resultado"); `replaceState` direto evita um efeito colateral do roteador atual: `navigate` muda `location` e o `useEffect` de `router.tsx` rola a página ao topo a cada troca (`window.scrollTo(0, 0)`), o que a cada clique de filtro jogaria o visitante para cima. Preservar `history.state` mantém o `idx` do roteador (o "Voltar" do site continua correto).
**Alternatives:** (a) `router.navigate(..., { replace: true })` e ler `router.search`: sem código novo, mas rola ao topo; **exigiria uma opção `scroll: false` no roteador da 002** (mudança em código aprovado de outra spec; recusada aqui, mas é a saída se o `replaceState` direto der problema). (b) `pushState` a cada clique: o "Voltar" desfaz um filtro, mas a pilha enche (6 projetos e 10 cliques = 10 entradas) e o roteador teria de ouvir; recusada. (c) filtros no `hash` (`#stack=react`): não chega ao servidor nem a ferramentas de análise e conflita com as âncoras do roteador (`legacyHashes`); recusada. (d) estado só em memória (sem endereço): viola FR-003/FR-005. (e) uma rota por filtro (`/projetos/stack/react`): geraria páginas estáticas de filtro (SEO), mas é escopo novo.
**Consequência dita:** o `href` do seletor de idioma vem do HTML estático e **não leva a query**: ao trocar o idioma, os filtros zeram. Aceito (os rótulos mudam de idioma e os ids são os mesmos, então refazer é um clique); preservar exigiria o seletor ler `location.search` depois da hidratação (DQ-006, recomendo não fazer agora). Em PT e EN as chaves são iguais (`ano` também em inglês), para o endereço copiado em um idioma funcionar no outro se alguém trocar o prefixo à mão.

### TD-002: Filtros como aprimoramento, sem divergência de hidratação
**Decision:** o servidor renderiza o **estado sem filtros** (a lista inteira, a linha "6 projetos · nenhum filtro ativo"). Na montagem, um `useEffect` (nunca `useState(() => ler a URL)`, que daria HTML diferente) lê a query e aplica. Os botões de filtro estão no HTML (com `aria-pressed="false"`) mas só funcionam com a classe `js`; sem ela o CSS os esconde. A linha de estado é `role="status"` (`aria-live="polite"`) e a atualização do texto é o anúncio; ela **não** é anunciada no carregamento (já vem pronta no HTML). A seleção com teclado usa `<button>`: `Tab` entra no grupo, `Espaço` e `Enter` alternam; sem armadilha de foco e sem atalho novo.
**Rationale:** FR-014 e a regra da 002 (TD-008: a casca e as páginas só leem dado determinístico na renderização). **Alternatives:** gerar um HTML por combinação de filtros (explosão de páginas; descartado); `<form method="get">` com submit (funciona sem JavaScript, mas o HTML estático da Netlify ignora a query: o formulário pareceria quebrado; descartado); `<select multiple>` (pior de usar no celular); `<input type="checkbox">` (também serve, mas o mockup usa botões e o estado `aria-pressed` já está testado na casca).
**Custo dito:** um link com filtro (`/projetos?stack=react`) mostra a lista inteira por um instante e depois a encolhe: pode contar para o CLS (R-003). A medição do CLS inclui um endereço filtrado; se passar de 0,1, a saída é esconder a lista por CSS até a hidratação **só quando há query** (classe posta pelo script de boot, que já lê o endereço), decisão que voltaria à Duda.

### TD-003: Páginas de detalhe, por rota-padrão e geração no build
**Decision:** a tabela ganha **uma** rota, `projeto`, com `path: '/projetos/:slug'`, `enPath: '/en/projects/:slug'`, `hidden: true`, `parent: 'projetos'` e `pattern: true` (campo novo, opcional). `findPageByPath` casa o padrão (um segmento depois do prefixo, só `[a-z0-9-]`); `equivalentPath(route, lang, slug)` troca o prefixo e **mantém o slug**; todos os consumidores da tabela que listam rotas concretas (menu, `suggestRoutes`, terminal `ls`/`cd`, paleta, `legacyHashes`) **pulam** rota com `pattern` (um teste percorre cada consumidor). `prerenderPaths()` (scripts/prerender.ts) expande a rota-padrão em `(slug × idioma)` lendo o conteúdo direto em Node (os `id` do arquivo de projetos); `outputFileFor` já produz `projetos/<id>.html` e `en/projects/<id>.html`. O `title` e a `description` de cada detalhe saem de uma função `projectMeta(project, lang)` usada **pelo pré-render e por `useDocumentMeta`** (título "Nome: projeto | Duda Brito" / "Name: project | Duda Brito" por um texto de `ui.ts`; descrição = `summary`), de modo que a tabela guarda só os textos genéricos da rota-padrão. `hreflang` recíproco vem do mecanismo da 002 (TD-013) com o slug.
**Rationale:** FR-006, FR-007, FR-015, FR-028 da 002 (HTML por rota). Uma linha por projeto em `routes.ts` obrigaria o chunk de entrada (hoje 97,9 KB de 100; folga ~2 KB) a carregar os 6 títulos e descrições em 2 idiomas (~1,5 KB gzip estimado, **não medido**) ou um índice à parte; a rota-padrão custa ~0,3 KB estimados. A medição real é a primeira verificação da tarefa de rota (V-03, V-10).
**Alternatives:** (a) **uma rota concreta por projeto, gerada na tabela a partir do conteúdo:** simples para quem consome a tabela (nenhum consumidor muda), mas o conteúdo entra na entrada, ou exige um índice mínimo (id, nome) também carregado na entrada; é a alternativa se a rota-padrão se mostrar cara de integrar (o spike da primeira tarefa decide, ver R-002). (b) **entradas escritas à mão** (6 linhas, repetidas a cada projeto novo): duas fontes de verdade, viola "tabela única e dado em um lugar"; recusada. (c) **detalhe por query** (`/projetos?p=ecoshop`): uma página só, sem HTML próprio, sem SEO e sem endereço por idioma (FR-007, FR-014); recusada. (d) **pasta com `index.html`** (`projetos/ecoshop/index.html`): muda a convenção `.html` da 002 e do `serveDist`; recusada.
**Consequência dita:** isto toca `routes.ts`, `router.tsx`/`findPageByPath`, `seo.ts`, `prerender.ts` e `serveDist.mjs`, que são de 002 já aprovada e fechada; são **extensões** (um campo e uma função), não reescrita, e cada uma tem teste. Risco R-002.

### TD-004: O slug é o `id`, igual nos dois idiomas
**Decision:** `/projetos/ecoshop` e `/en/projects/ecoshop`. O `id` já é kebab e único (001 `Tag`, 003 FR-001), logo é seguro como segmento de endereço. **Rationale:** FR-007 pede "endereço próprio por idioma" (o prefixo e a palavra `projetos`/`projects` já diferem) e "a troca leva ao mesmo projeto" (basta manter o id); slug traduzido exigiria um campo a mais por projeto e uma tabela de equivalência a manter. **Alternatives:** slug localizado por idioma (campo novo, mais uma coisa que a Duda mantém; ganho só estético); id numérico (pior para quem lê o endereço). **Regra no dado:** mudar um `id` muda o endereço publicado; o teste do conteúdo real guarda a lista de ids publicados (`['ecoshop', ...]`) para a mudança ser deliberada (a 010 cuida de redirecionamento).

### TD-005: Notas, frase e ficha em arquivo próprio, não no projeto da 003
**Decision:** `src/content/projectCatalog.content.ts` (Data Model) guarda o que a 003 não tem. A 003 não muda. A junção acontece em `src/catalog/projectView.ts`.
**Rationale:** 003 FR-002 diz que a nota "é definida pela spec 005" e proíbe a 003 de atribuí-la; `summary`, papel, equipe, estado e demonstração não estão no FR-001 da 003, e emendar uma spec aprovada exigiria que ela a reabrisse. O arquivo tem **uma** entrada por projeto e uma regra entre arquivos validada no dado (a fábrica de schema), então não há deriva silenciosa.
**Alternatives:** (a) **campos no schema de projeto da 003:** uma fonte por projeto, o melhor para a Duda editar; **recomendo-a se a 003 ainda não foi implementada** (o design dela não existe), pedindo à Duda para emendar o FR-001 da 003 (DQ-007); (b) **JSON/arquivo por projeto com tudo:** reescreve a 003. (c) **calcular `summary` pela primeira frase da descrição:** sem texto novo, mas a primeira frase de, por exemplo, Planoriza tem 3 linhas; recusada.
**Se a Duda escolher (a),** só muda onde os campos moram: Data Model, adaptador e registro; os TDs 006 a 014 não mudam.

### TD-006: Nota em aritmética inteira
**Decision:** cada nota de critério é `k/2` (k inteiro de 1 a 10). `projectScore` soma `h = Σ(2·nota)` (inteiro), com `N = criteria.length`:
- **Estado:** `rated` = quantos critérios do projeto têm nota; `total = N`. `rated = 0` → `none`; `0 < rated < N` → `partial`; `rated = N` → `complete`. **Só `complete` tem nota** (Q-004). `none` e `partial` mostram "sem nota" e nenhuma estrela preenchida; `partial` acrescenta "`rated` de `N` critérios avaliados" (um contador, não nota).
- **Número (2 casas), meio para cima:** `centis = floor((100·h + N) / (2N))`. Ex.: 4; 4,5; 4; 5 → `h = 35`, `centis = floor((3500+4)/8) = 438` → "4,38". Média 4,25 (`h = 34`): `floor(3404/8) = 425` → "4,25" (o exemplo do FR-009). Média 4,125 (`h = 33`): `413` → "4,13".
- **Estrelas na meia mais próxima, meio para cima:** `halfStars = floor((2h + N) / (2N))`. `h = 35` → `floor(74/8) = 9` → 4,5 estrelas ✓ (tabela do requirements). `h = 34` (média 4,25, empate entre 4,0 e 4,5) → `floor(72/8) = 9` → 4,5. `h = 33` (4,125) → `floor(70/8) = 8` → 4 estrelas.
- **Texto:** PT "nota 4,38 de 5"; EN "rated 4.38 out of 5" (separador decimal do idioma; mês e data seguem a regra da 001).
**Rationale:** o ponto flutuante não erra aqui (todo múltiplo de 0,125 é exato), mas `toFixed` e `Math.round` têm regras de empate que variam entre leitura e implementação; com inteiros a regra de empate fica escrita e testável. A regra "só com os N" vem do requirements (FR-010, Q-004), mas o **N vem do dado** (`criteria.length`): se a Duda acrescentar um quinto critério, os projetos com 4 viram "parcial" até ela completar, e o teste do conteúdo real falha se isso acontecer sem aviso (aceito: é a regra dela).
**Alternatives:** `toFixed(2)` e `Math.round(x*2)/2` (empate depende do motor; sem teste de tabela); biblioteca de decimais (dependência por 5 linhas); média só dos critérios avaliados com aviso (recusada pela Duda, Q-004).
**Empate das estrelas (DQ-008):** meio para cima é a minha proposta; o requirements não define o desempate (4,25 fica entre 4,0 e 4,5). Pede-se a confirmação.

### TD-007: Estrelas, texto alternativo e "sem nota"
**Decision:** componente `Stars` com 5 posições, cada uma um `<svg aria-hidden="true">` com um dos três estados (cheia, meia, vazia), a partir de três `<symbol>` definidos **uma vez por página**; o contêiner é `role="img"` com `aria-label`: "nota 4,38 de 5" (completo) ou "sem nota" (none e partial); o número visível ao lado (`4,38`, `sem nota`, `2 de 4 critérios avaliados`) faz parte do mesmo `role="img"`, então um leitor de tela lê uma frase só. Sem nota: **5 estrelas vazias (só contorno)**, nenhuma preenchida e **nenhum zero** (FR-010). Preenchida = token `--accent`; contorno = `--control-border` (contraste não textual ≥ 3:1 sobre `--bg` e `--surface`, que o teste de contraste da 002 confere; adicionar o par à matriz). O estado nunca depende só de cor: forma (cheia/meia/vazia) e texto.
**Rationale:** o glifo `★` do mockup depende de fonte do sistema (Plex não o tem), muda de tamanho e não tem meia estrela; SVG dá forma igual nos dois temas e no HTML gerado. **Alternatives:** glifos de texto (inconsistente); `<meter>`/`<progress>` (a leitura de "meia estrela" é ruim); imagem (requisição a mais, sem tema).

### TD-008: Capa, o bloco tipográfico
**Decision:** `Cover` é um `<div>` de proporção 2:3 (`aspect-ratio: 2/3`, tamanho reservado, CLS 0) com o fundo de um **tom de apoio** e o texto em `--text`: canto superior esquerdo o **selo do dado** (só se `badge` existe; "este site" e "estudo de caso" do mockup **não** vêm do dado e não entram), canto inferior a **inicial** do nome em mono 56 px (`aria-hidden`; o nome está no cartão). **Tom:** `coverTone(i) = i mod 6` pelo índice do projeto na ordem **declarada** do conteúdo (estável; filtrar ou reordenar não muda a cor de um projeto; um projeto novo no fim não muda os outros). No tema claro os 6 tons de apoio (pêssego, lilás, menta, limão, céu, rosa); no escuro os 4 tons escuros, com os índices 4 e 5 reaproveitando o 0 e o 1 (alias `--cover-1` a `--cover-6` num bloco de `catalog.css`, sem cor literal). **Contraste (002, Achados 3 a 5):** texto sempre `--text` (13,4 a 15,4 no claro; 6,6 a 9,5 no escuro); o acento **nunca** é cor de texto sobre a capa; a borda do cartão é decoração (a borda não é controle); o anel de foco fica no `<a>` com `outline-offset` sobre o fundo da página, não sobre o tom (o acento no tom escuro `#1F5A62` dá 3,00, no limite). Com imagem própria (`images[0]`, 001 FR-009): `<img>` com `alt`, `width`, `height` do dado, `object-fit: cover` na mesma caixa 2:3. Hoje nenhum dos 6 tem (Q-006): os 6 usam bloco.
**Rationale:** FR-011, D-002, steering (nunca imagem de terceiro), Q-006. **Alternatives:** tom por hash do `id` (independe da ordem, mas colide e fica irregular com 6 itens); tom escolhido no dado (campo a mais, validar contra os tokens; escopo novo); `nth-child` como o mockup (a cor mudaria quando um filtro esconde um projeto); SVG gerado (peso sem ganho).

### TD-009: Ordem por ano e a ordem indeterminada
**Decision:** `groupByYear` agrupa pelo **ano de início**, anos do mais recente ao mais antigo. Dentro do ano: **primeiro os que têm mês, do mais recente ao mais antigo; depois os sem mês, na ordem em que aparecem no conteúdo**; empate de mês também segue a ordem do conteúdo. É uma ordem total, determinística, igual em toda visita (FR-002, "estável"). O grupo ganha `indeterminate = true` quando algum par do ano devolve `'indeterminada'` em `compareDates` (001); o `h2` do ano recebe, ao lado, a nota "ordem entre os projetos de 2026 indeterminada" (a frase existente, `t.timeline.orderUndetermined`). A nota é do **grupo**, não de cada cartão (menos ruído e o mesmo efeito para o leitor). O mockup traz também a nota "ordem determinada" para anos completos; **não entra** (informação sem decisão). Filtros **não** mudam a ordem nem o `indeterminate` (a nota usa o grupo **visível**: se só um projeto do ano sobra, a nota some, pois não há par). A data do cartão: `dateLabel[lang]` se existir; senão `formatDate(date)` (001); com `versions`, o cartão mostra "início → fim" só quando as duas datas existem no dado (EcoShop: "fev/2025 → jan/2026"); sem mês, só o ano.
**Rationale:** 001 deixou "como mostrar o par indeterminado" para a 005. **Alternatives:** não ordenar (os sem mês ficariam na ordem do arquivo, mas sem regra escrita); sem mês por último (contradiz o FR-013 da 001, que o atual `projectDate.ts` usa); ordenar por mês presumido (inventa dado, proibido).

### TD-010: Que valores de filtro aparecem
**Decision:** o conjunto de opções sai do conteúdo, nunca é escrito à mão. **Stack:** só etiquetas usadas por **≥ 2 projetos** (constante `MIN_PROJECTS_PER_STACK_FILTER = 2`); **Ano:** todo ano com projeto, e o grupo só aparece se houver **≥ 2 anos**; **Tipo:** a opção "Estudo de caso" só aparece se **algum** projeto tem `caseStudy` **e algum não tem**. Grupo sem opção não é renderizado. O parser só aceita o que aparece na tela (valor de uma tag usada uma vez é "ignorado", como valor inexistente, FR-005). O número `2` fica numa constante e num teste, para a Duda mudar.
**Rationale:** risco do requirements ("poucos projetos deixam os filtros sem sentido"); ~15 etiquetas de stack em 6 projetos, a maioria usada uma só vez, tornariam a barra ruído. Uma etiqueta usada uma vez filtra para um único cartão, que já está visível. **Alternatives:** todas as etiquetas (barra enorme); limite 3 (só 1 ou 2 chips com 6 projetos); lista curada à mão (dado fora do conteúdo). **Pergunta:** DQ-009.

### TD-011: Orçamento de JavaScript e CSS, e como se mede
**Decision (números propostos, DQ-001):**
| Item | Limite (gzip) | Base medida (002, T5.3) |
| --- | --- | --- |
| Chunk de entrada (`index-*.js`) | **não cresce mais de 0,5 KB** além de 97,9 KB | 97,9 KB |
| JS total de `/projetos` (entrada + chunks da página) | **≤ 110 KB** | entrada 97,9 + página |
| JS total de `/projetos/<id>` (PT e EN) | **≤ 110 KB** | idem |
| Chunk da página do catálogo (sem o compartilhado) | ≤ 8 KB | n/a |
| Chunk da página de detalhe (sem o compartilhado) | ≤ 8 KB | n/a |
| Compartilhado (capa, estrelas, rubrica, junção, conteúdo de projetos) | ≤ 6 KB; conta **uma vez** por página | n/a |
| CSS total da página | ≤ 20 KB (limite da 002); `catalog.css` ≤ 4 KB | 13,6 KB (casca) |
**Por que 110 e não 100:** o orçamento de 100 KB da 002 foi fixado e medido **na `/_prova`**, uma página vazia, e o chunk de entrada sozinho já é 97,9 KB: nenhuma página real cabe em 100 KB sem cortar a casca. A 002 já previu esse caso ("se não couber a Duda decide, sem editar o número em silêncio" no TD-019). A soma 97,9 + 8 + 6 = 111,9 passa de 110: por isso **o compartilhado conta dentro dos limites de 8 KB**, e a soma real vale a regra de 110 KB. Estes números **não são medidos** (ainda não existe código); a primeira entrega (a rota-padrão e uma página vazia) mede a entrada, e se 110 KB não couber a Duda decide (subir ou cortar), sem edição silenciosa.
**Como se mede:** `scripts/measureBundle.mjs` (002) é **estendido** para aceitar páginas e limites por argumento (`node scripts/measureBundle.mjs dist --pages projetos.html,projetos/ecoshop.html,en/projects.html,en/projects/ecoshop.html --max-js 110000 --max-css 20000`), com teste de unidade da função de julgamento; roda sobre o `dist` real depois do `vite build`, em `npm run prova` (fora do `verify`, como a 002). Lighthouse e INP (`lighthouseRun.mjs`, `inpRun.mjs`) ganham a lista de URLs por argumento; o INP inclui um roteiro de filtros (abrir, alternar 3 chips, limpar) com a CPU 4× mais lenta (meta ≤ 200 ms).
**NFR-001 "filtrar em ≤ 200 ms com 50 projetos":** não há 50 projetos reais. Cobertura: (1) teste de unidade de `filterOptions`/`applyFilters` com 50 projetos de fixture (corretude; passada única); (2) o INP medido nos 6 reais, com meta interna ≤ 100 ms, como indício. **Não é uma medição de 50 itens**: o tempo de parede com 50 só se mede com conteúdo de teste num build à parte, que não proponho (custo e suíte lenta); a Duda decide se aceita (DQ-010).
**Alternatives:** cortar o conteúdo de projetos do chunk compartilhado por um `import()` por projeto (só se estourar; está em R-001); aceitar 100 KB e tirar partes da casca (decisão da 002, não desta).

### TD-012: Estrutura, foco e leitura por leitor de tela
**Decision:** cabeçalhos: `h1` (página) → `h2` por ano → `h3` por projeto (o nome, com o link). Link esticado (`a::after { position: absolute; inset: 0 }` no cartão `position: relative`) para o nome acessível do link ser o nome do projeto. O resto do cartão é texto normal. Anúncio: só `role="status"` (uma região, polida). **Foco depois de "Limpar filtros":** o foco vai para o `h2` "Projetos" dos resultados (`tabindex="-1"`, rótulo visível ou `visually-hidden`), porque o botão clicado deixa de existir. Depois de alternar um chip, o foco **fica no chip**. Foco visível: o anel da 002 (3 px, ≥ 3:1). Estado ativo do chip: `aria-pressed="true"` + ✓ + peso (002 TD-023 e o teste `state.test.ts` ampliado: a regra `[aria-pressed="true"]` do catálogo tem de mudar mais que cor). Links externos mostram texto claro ("Código no repositório"), sem ícone mudo. Detalhe: ficha em `<dl>`; barra do critério `aria-hidden` (o número está no texto); estrelas conforme TD-007.
**Rationale:** FR-013, NFR-003. **Alternatives:** `aria-live="assertive"` (interrompe); mover o foco para a lista a cada clique (tira o visitante do chip e atrapalha a seleção múltipla); cartão inteiro como `<a>` (o nome acessível vira um parágrafo, como no mockup).

### TD-013: Meta de SEO dos detalhes
**Decision:** `projectMeta` (TD-003): `<title>` "Nome: projeto | Duda Brito" / "Name: project | Duda Brito"; `description` = `summary` no idioma; canonical e `hreflang` pelo mecanismo da 002 (com o slug); a query do catálogo **não** muda canonical (o HTML é o mesmo). `og:` e JSON-LD de projeto e sitemap ficam na spec 010. **Alternatives:** descrição = primeiros 160 caracteres da descrição longa (texto cortado no meio da frase).

### TD-014: Substituição no lugar e remoção do código antigo
**Decision:** a página nova substitui a antiga no mesmo passo (P-Q-001). A lista está em "Arquivos que esta spec remove ou substitui". Regra: cada remoção na tarefa que cria a peça nova, com o `verify` verde e o teste do código removido saindo junto (regra da 001). `src/data/projects.tsx` **fica** (tem consumidores de outras specs: home 004, terminal 009, currículo e acadêmico 007); a spec que apagar o último consumidor apaga o arquivo.

## Verification Strategy
Cada FR vira teste automatizado ou comando com exit code; os testes ficam dentro de cada tarefa. Nenhum `skip`/`todo`; suíte dentro do orçamento da 001.
| ID | Cobre | Comando | Passa quando |
| --- | --- | --- | --- |
| V-01 | FR-001, FR-002 | `npx vitest run src/catalog/order.test.ts` | agrupa por ano decrescente; com mês antes de sem mês; empate pela ordem do conteúdo; `indeterminate` nos casos da tabela da 001 (5 linhas) e nenhum projeto some |
| V-02 | FR-003, FR-004, FR-005, NFR-002 | `npx vitest run src/catalog/filters.test.ts src/pages/Projects.test.tsx` | todas as linhas da tabela de entrada do Data Model (inclui `__proto__`, `<img onerror>`, 5 000 caracteres, repetido, chave estranha); E entre grupos, OU dentro; 50 projetos de fixture; estado vazio com "Limpar filtros"; a query é reescrita para a forma canônica; nenhum valor do endereço aparece no DOM |
| V-03 | FR-007, FR-015, FR-014 | `npx vitest run src/data/routes.test.ts scripts/prerender.test.ts` | a rota `projeto` existe, `hidden`, `pattern`, fora do menu; `equivalentPath` mantém o slug; **cada** consumidor da tabela pula `pattern`; o pré-render lista `projetos/<id>` e `en/projects/<id>` para **todo** `id` do conteúdo, nenhum extra |
| V-04 | FR-006, FR-012 | `npx vitest run src/pages/ProjectDetail.test.tsx` | ficha com as linhas que existem e **sem** linha vazia; botões só quando `repo`, `demo` e `caseStudy` existem; `rel="noopener noreferrer"`; versões e imagens só quando existem; slug desconhecido renderiza o `NotFound` |
| V-05 | FR-001, FR-006, FR-007, FR-014 | `npx vitest run scripts/prerender.test.ts` e, depois do build, `node scripts/checkDist.mjs dist` | cada detalhe e o catálogo, nos dois idiomas, têm `<main>`, um `<h1>`, a lista completa (6 cartões) / a ficha no HTML, `lang` e `hreflang` recíproco; `checkDist` sai 0 |
| V-06 | FR-013, NFR-003 | `npx playwright test e2e/catalog.e2e.ts` (sobre `dist` via `serveDist`) | só com teclado: alternar chips, limpar, abrir um projeto; foco visível; foco no título após "Limpar"; `aria-pressed` e ✓; sem rolagem horizontal em 390 px; axe 0 em `/projetos`, `/projetos/<id>` e as versões EN, tema claro e escuro; todas as requisições da mesma origem; console sem aviso de hidratação (inclui um endereço com `?stack=`) |
| V-07 | FR-008, FR-009, FR-010 | `npx vitest run src/catalog/score.test.ts src/components/catalog/Stars.test.tsx` | tabela de entrada: 4; 4,5; 4; 5 → `438` / 4,5 estrelas / "nota 4,38 de 5"; 4,25 → 4,5 estrelas (empate para cima); nenhum, 1, 2, 3 de 4 critérios → "sem nota", 0 estrelas cheias, **nunca** "0"; EN usa ponto; `role="img"` com o texto |
| V-08 | FR-008, FR-012 | `npx vitest run src/content/schema/rubric.test.ts src/content/schema/projectCatalog.test.ts src/content/catalog.content.test.ts` | nota 0, 4,3, `null`, chave desconhecida, id inexistente, projeto sem entrada, `summary` sem EN ou com quebra de linha, `demo` `http:` e `/rota` são recusados com arquivo, campo e motivo; o conteúdo real tem 4 critérios e os 6 projetos; paridade PT/EN |
| V-09 | FR-011 | `npx vitest run src/components/catalog/Cover.test.tsx src/catalog/cover.test.ts` | bloco com o nome e a inicial (`coverInitial` com emoji e acento); selo só quando existe; tom = índice mod 6; com `images[0]` renderiza `<img>` com `alt`, `width`, `height` e nunca `src` de outro site |
| V-10 | NFR-001, NFR-003 | `npm run prova` (estendido, TD-011) | os 4 totais de JS ≤ 110 KB e a entrada +≤ 0,5 KB; CSS ≤ 20 KB; LCP ≤ 2,5 s, CLS ≤ 0,1 (também em `/projetos?stack=react`), INP ≤ 200 ms (e ≤ 100 ms como indício dos 50 projetos); Lighthouse ≥ 95 em acessibilidade, SEO e boas práticas |
| V-11 | TD-014 | `git grep -n -E "sections/portfolio/(Projects|ProjectCard|ProjectMedia)" -- src` (exit 1) | peças antigas fora do código; `npm run verify` verde |
| V-12 | paridade | `npx vitest run src/i18n/parity.test.ts` | o bloco `catalog` de `ui.ts` em PT e EN, mesmas chaves |

## Arquivos que esta spec remove ou substitui
| Arquivo | Destino | Motivo |
| --- | --- | --- |
| `src/sections/portfolio/Projects.tsx`, `Projects.test.tsx`, `ProjectCard.tsx`, `ProjectMedia.tsx` | **removidos** | a página antiga de projetos (linha do tempo, cartões, galeria) |
| `src/pages/SectionPage.tsx` (a chave `projetos` do mapa e o import) | **ajustado** | `projetos` deixa de ser uma seção; as outras 4 ficam até a 007 |
| `src/pages/lazyPages.ts` e `scripts/prerender.ts` (`LAZY_SOURCE.projetos`, mais a entrada de `projeto`) | **ajustados** | novas páginas e chunk por rota |
| `src/data/portfolio.tsx` (bloco `projects`: divisor, título, introdução) | **removido** | texto da página antiga; os textos novos vão para `ui.ts` (DQ-004) |
| `src/i18n/ui.ts` (`timeline.*` de projetos, se nada mais usar) | **ajustado** | substituído pelo bloco `catalog` |
| `src/styles/sections.css` (regras de `.project-*` e da linha do tempo de projetos) | **removidas** | substituídas por `catalog.css` |
| `src/components/ImageGallery.tsx`, `Lightbox.tsx` | **removidos só se nenhum outro arquivo os importar** (hoje `Services.tsx` os importa: conferir com `git grep` na tarefa; se `Services` ficar, os dois ficam) | a galeria deixa de existir no detalhe (sem lightbox) |
| `src/data/routes.ts`, `src/router.tsx`, `src/data/seo.ts`/`seoHead.ts`, `scripts/serveDist.mjs`, `scripts/measureBundle.mjs`, `scripts/lighthouseRun.mjs`, `scripts/inpRun.mjs`, `src/content/registry.ts` | **ajustados** | rota-padrão, meta por projeto, medição por página |
| `src/pages/Projects.tsx`, `ProjectDetail.tsx`, `src/components/catalog/*`, `src/catalog/*`, `src/styles/catalog.css`, `src/content/{rubric,projectCatalog}.content.ts`, `src/content/schema/{rubric,projectCatalog}.ts`, `e2e/catalog.e2e.ts` e os testes de cada um | **novos** | esta spec |
**Ficam** (têm dono em outra spec): `src/data/projects.tsx` e `src/utils/projectDate.ts` (consumidores: home 004, terminal 009, currículo/acadêmico 007), `public/cases/**` (as capturas do EcoShop; a 003 migra sem imagem, Q-001: a Duda decide se apaga os arquivos, DQ-011), `src/pages/CaseStudy.tsx` e `case-study/*` (spec 006), `FeaturedProjects.tsx` (home).

## Divergências entre o mockup e este design
Li `Projetos.dc.html` e `Projeto.dc.html` inteiros em 2026-11-19. O mockup é referência visual.
| # | O mockup mostra | Este design | Por quê |
| --- | --- | --- | --- |
| 1 | Menu com "Casos" | Sem "Casos" | DQ-011 da 002 (a Duda já decidiu) |
| 2 | Capa com selo "este site" e "estudo de caso" | Selo só se existir no dado (Finalista · PUC Minas); "Estudo de caso" derivado de `caseStudy` | nada inventado; "este site" não é dado |
| 3 | Frases (`blurb`) escritas no mockup | `summary` que a Duda escreve ou aprova | lacuna 1 |
| 4 | Duas notas de ordem ("indeterminada" e "determinada") | Só a indeterminada | a outra não ajuda a decidir nada |
| 5 | Introdução com "Seis projetos..." | Contagem calculada + frase aprovada por ela | número fixo envelhece (lacuna 3) |
| 6 | Estrelas como texto `★★★★½` e `☆☆☆☆☆` | SVG, 3 estados, `role="img"` | fonte e meia estrela (TD-007) |
| 7 | Cartão inteiro dentro de um `<a>` | Link esticado no nome | nome acessível curto (TD-012) |
| 8 | Seletor de idioma de dois botões | Dois links (002) | já decidido na casca |
| 9 | Cor da capa por `nth-child(6n+k)` | Cor pelo índice declarado | não muda quando um filtro esconde um projeto (TD-008) |
| 10 | Detalhe com estudo de caso completo e "Moldado por" | Só link para o caso; sem "Moldado por" | 006 e fora do MVP |
| 11 | Ficha com 5 linhas sempre | Só as que existem | nada inventado (lacuna 2) |
| 12 | Aviso "ainda não existe nenhuma nota sua" (nota do mockup) | Sai: é aviso do mockup; a página mostra "sem nota" e a explicação da regra | o aviso era para a Duda |
| 13 | Fontes pelo Google Fonts | Fontes do próprio site | 002 FR-029 |
O que o design **manteve**: grade por ano de 4 colunas, capas 2:3, filtros em chips de 44 px, linha `role="status"`, ficha técnica, painel "Nota por critério" com barras.

## Riscos
| ID | Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R-001 | 110 KB não cabe (entrada 97,9 KB + página + conteúdo) | Média | Médio | medir na primeira entrega; chunk por `import()` por projeto; se não couber, a Duda decide (subir ou cortar), sem editar em silêncio |
| R-002 | A rota-padrão quebra consumidores da tabela (terminal, menu, `suggestRoutes`, paleta, testes de unicidade) ou o `serveDist`/Netlify não resolve `/projetos/<id>` | Média | Alto | primeira tarefa é um spike com **um** detalhe de ponta a ponta (rota, pré-render, `serveDist`, e2e); se a rota-padrão sair cara, voltar à alternativa (a) do TD-003 (rota concreta por projeto) |
| R-003 | Link filtrado mostra a lista inteira e depois encolhe, piorando o CLS | Baixa | Médio | CLS medido em `/projetos?stack=react`; saída descrita no TD-002 (volta à Duda) |
| R-004 | O design da 003 nomeia os campos diferente ou muda a marcação do texto (`ReactNode`) | Alta | Baixo | o adaptador `projectView.ts` é o único ponto; o design deve ser revisto quando a 003 tiver design aprovado (DQ-007) |
| R-005 | `summary`, critérios (`description`, `rule`) e notas dependem da Duda; sem eles a verificação falha | Alta | Médio | pedir os textos antes da tarefa de conteúdo; as tarefas de código usam fixture marcada como exemplo (001), nunca dado da Duda |
| R-006 | Netlify trata `/projetos/` (barra final) ou `projetos/` + `projetos.html` de modo inesperado | Média | Baixo | mesma natureza do R-008 da 002; teste de arquivo hoje; confirmação no deploy (010); sem regra nova até lá |
| R-007 | Conflito de edição no `registry.ts` entre 003 e 005 | Média | Baixo | a 005 só entra depois da 003 fechada; entradas em ordem alfabética |
| R-008 | O pré-render com 12 páginas a mais alonga o `vite build` e o `verify` (≤ 180 s) | Baixa | Baixo | medido na tarefa; o pré-render é por rota e já gera ~40 arquivos |
| R-009 | Estrelas vazias (só contorno) com contraste fraco sobre `--surface` | Baixa | Médio | par `--control-border` × `--bg`/`--surface` na matriz de contraste (V-10 e `contrast.test.ts`) |
| R-010 | "Sem nota" em 6 de 6 projetos faz o catálogo parecer incompleto | Alta | Baixo | é o estado verdadeiro; a explicação da regra fica visível; a Duda avalia quando quiser (arquivo de conteúdo) |

## Perguntas deste design (para a Duda)
- **DQ-001 (aberta):** aceita **110 KB (gzip)** por página do catálogo (a casca sozinha já usa 97,9 KB dos 100 KB fixados na 002), com a entrada sem crescer mais que 0,5 KB? (TD-011)
- **DQ-002 (aberta):** as 6 frases (`summary`, PT e EN) são suas. Posso colocar as do mockup como **proposta** para você aprovar ou reescrever? Sem elas o catálogo não valida.
- **DQ-003 (aberta):** papel, equipe, estado e link de demonstração **não existem** nos seus dados. Você me passa os que quiser mostrar? A ficha técnica mostra só as linhas preenchidas (recomendado) ou "—" nas vazias?
- **DQ-004 (aberta):** o texto do `h1` e a introdução da página `/projetos` (PT e EN): quer a introdução atual do site, a do mockup, ou escreve outra? A contagem de projetos será calculada.
- **DQ-005 (aberta):** aprova os nomes EN dos critérios (tabela do Data Model) e escreve (ou aprova minha proposta de) a frase de cada critério e a regra de cálculo?
- **DQ-006 (aberta):** ao trocar o idioma, os filtros ativos zeram (o seletor é um link estático). Aceita assim (recomendado) ou quer que passem?
- **DQ-007 (aberta):** `summary`, papel, equipe, estado, demonstração e notas ficam **em arquivo próprio da 005** (recomendado enquanto a 003 não tem design) ou você prefere emendar o FR-001 da 003 para tudo morar no projeto? (TD-005)
- **DQ-008 (aberta):** nas estrelas, um empate (média 4,25, entre 4,0 e 4,5) vai para **cima** (4,5)? O requirements não define o desempate.
- **DQ-009 (aberta):** a stack só aparece como filtro quando usada por **2 ou mais** projetos (recomendado)? Ou todas as etiquetas?
- **DQ-010 (aberta):** o "50 projetos em ≤ 200 ms" será coberto por teste funcional com 50 e pelo INP nos 6 reais (não é medição de 50). Aceita?
- **DQ-011 (aberta):** as capturas do EcoShop em `public/cases/` (que a 003 não migra) ficam no disco ou saem do repositório quando a página antiga sair?

## Decisões da Duda (2026-11-19)
A Duda aceitou as recomendações do agente nas DQ-001 a DQ-011 (registrado a pedido dela; as DQ acima ficam como histórico da pergunta). O que cada aceite fixa:
| DQ | Decisão | Efeito |
| --- | --- | --- |
| DQ-001 | **110 KB (gzip) por página**, entrada sem crescer mais que 0,5 KB | vale o TD-011; se a medição não couber, volta à Duda, sem edição em silêncio |
| DQ-002, DQ-003, DQ-007 | **Arquivo próprio da 005** (`projectCatalog.content.ts`) para frase, papel, equipe, estado e demonstração; **linha vazia some** na ficha | vale o TD-005 (alternativa a descartada); a 003 não muda |
| DQ-004 | `h1` e introdução de `/projetos` (PT e EN) **são conteúdo dela** | o agente não escreve; tarefa bloqueada por conteúdo |
| DQ-005 | Nomes EN dos critérios, descrição de cada critério e a regra de cálculo **são conteúdo dela** | idem; os nomes EN da tabela do Data Model e a `rule` proposta valem **só como proposta** |
| DQ-002 (frases) | As 6 frases PT/EN **são dela**; as do mockup entram só como proposta marcada | nenhum `summary` entra no arquivo sem a aprovação dela |
| DQ-006 | Filtros **zeram** ao trocar de idioma | vale a consequência dita do TD-001 |
| DQ-008 | Empate nas estrelas **sobe** (4,25 vira 4,5) | vale o TD-006 |
| DQ-009 | Stack vira filtro **só com 2 ou mais projetos** | vale o TD-010 (`MIN_PROJECTS_PER_STACK_FILTER = 2`) |
| DQ-010 | **Cobertura indireta** dos 50 projetos (teste funcional com 50 de fixture, mais o INP nos 6 reais) | vale o TD-011 |
| DQ-011 | As capturas do EcoShop em `public/cases/` **ficam no disco** (decisão da 003) | nenhuma tarefa da 005 apaga `public/cases/**` |
Regra para quem implementa: texto que a Duda não aprovou **não entra** em arquivo de conteúdo nem em `ui.ts`; o teste de código usa fixture marcada como exemplo (001).

## Confirm before building
Antes de qualquer tarefa de implementação, o implementador restata, com as próprias palavras, e espera o OK da Duda:
1. **FRs (resumo):** catálogo agrupado por ano com ordem indeterminada marcada; filtros por stack, ano e tipo (E entre grupos, OU dentro) no endereço, com valor inválido ignorado e estado vazio; detalhe por projeto nos dois idiomas com ficha, links e nota por critério; critérios e regra públicos; nota = média simples (2 casas), estrelas na meia mais próxima, "sem nota" até os critérios todos; capa de bloco tipográfico; tudo no HTML sem JavaScript.
2. **Restrições:** branch `rebuild/sdd`, nenhum `git push`, nada na `main`; a 005 só lê o conteúdo da 003 (que precisa estar fechada); nada de dado inventado (frases, notas, papel, equipe, estado); a entrada não cresce além de 0,5 KB.
3. **Perguntas abertas:** DQ-001 a DQ-011.
4. **Estado:** o gate da implementação é `tasks:approved`; este documento é `design:draft`.
