# 006 Case studies, Design
**Status:** draft (ver `.status`) · **Versão:** 0.1 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada em 2026-11-19). **Depende de:** spec 001 (schemas, registro, validador, paridade), 002 (rotas, casca, pré-render, tokens), 003 (conteúdo dos projetos) e 005 (página de detalhe do projeto).

## 1. Executive Summary
O estudo de caso deixa de ser dois componentes de 2.387 linhas de JSX (`WhatsAppDispatcherPt.tsx` e `...En.tsx`, 1.233 e 1.154 linhas, texto fixo em marcação) e vira **um arquivo de conteúdo tipado** (`src/content/cases/whatsapp-dispatcher.content.ts`), validado por um schema novo e desenhado por **componentes pequenos que só sabem desenhar blocos**. A página lê o conteúdo, monta o índice a partir das seções (por isso o índice nunca aponta para uma seção que não existe) e entrega tudo no HTML do pré-render, sem JavaScript.

O que a leitura do código e do mockup mostrou, e que muda o desenho (detalhes nas seções citadas):
- **O caso atual não cabe só em "parágrafo, lista, código e ênfase".** Ele tem 3 tabelas (termos do domínio, decisões com ganho e custo, glossário), 3 subtítulos `h3`, 14 blocos "Em termos técnicos", 2 destaques (callout), 2 exemplos rotulados e lista de escopo. Q-004 autorizou só a marcação **dentro do texto**; a **estrutura** dos blocos é nova e precisa da confirmação da Duda (TD-003, pergunta 1).
- **PT e EN não têm a mesma marcação.** No PT há 79 quebras de linha (`<br />`), no EN 14; o PT tem 139 `<strong>`, o EN 90; no glossário o PT separa "Exemplo:" em outro parágrafo e o EN o deixa na mesma frase. O schema aceita marcação **por idioma** e o teste de equivalência compara **texto**, não marcação (TD-002, TD-004, TD-006).
- **O rótulo do índice é diferente do título da seção** (ex.: índice "Separação em Camadas", título "Por que separar o sistema em camadas"), e as âncoras diferem por idioma (`#contexto` × `#context`). Preservo os dois (TD-010; o mockup usa o título no índice, pergunta 4).
- **O mockup mostra coisas que o código atual não tem** (tags de stack, item "Casos" no menu, cartões dos "três processos", texto do botão final). Seguem o código atual, não o mockup, porque FR-007 proíbe acrescentar texto (seção 12).
- **Hoje existem 14 seções, e Q-003 pede "escopo, contexto, decisões com ganho e custo, resultado".** O caso não tem uma seção chamada "resultado". Proponho um modelo fixo por **papéis** (`context`, `body`, `decisions`, `outcome`, `glossary`) e marco a seção "O que mudaria para um cenário real de produção" como `outcome`; é a pergunta 2.

Decisões que dependem da Duda: perguntas 1 a 6 (seção 13).

## 2. Requirements Mapping
Todo FR, NFR e US tem casa. Nenhum ficou sem mapeamento. Onde o requisito deixa lacuna, ela está na seção 13.

| ID | Resumo | Onde o design resolve | Artefato | Verificação (seção 9) |
| --- | --- | --- | --- | --- |
| FR-001 | Caso como conteúdo validado, PT e EN, sem texto em componente | TD-001, TD-002, TD-003, §5.1 | `src/content/schema/case.ts`, `src/content/cases/whatsapp-dispatcher.content.ts`, `registry.ts` | V-01, V-02, V-12 |
| FR-002 | Decisão com o que foi decidido, ganho e custo, em tabela para leitor de tela | §5.1 (`decisions`), TD-012 | `DecisionsTable.tsx`, schema (ganho e custo obrigatórios) | V-03, V-09 |
| FR-003 | Escopo do material no início | §5.1 (`scope`), §6 | `CaseScope.tsx` | V-04 |
| FR-004 | Índice; escolher leva à seção e a destaca com sublinhado ou peso | TD-007 | `CaseIndex.tsx`, `useCurrentSection.ts`, `case-study.css` | V-05, V-06, V-10 |
| FR-005 | Tela estreita: índice como lista no topo, sem rolagem horizontal | TD-008 | `case-study.css`, ordem do DOM | V-07 |
| FR-006 | Caso ligado ao projeto e o projeto ao caso; projeto sem caso é válido | TD-009 | campo `project`, `src/content/cases.ts`, teste de consistência | V-08 |
| FR-007 | Equivalência do texto; nada acrescentado nem resumido | TD-005, TD-006, §9 | `case.golden.pt.json`, `.en.json`, `caseEquivalence.test.tsx` | V-11 |
| FR-008 | PT e EN, endereço por idioma, troca leva ao mesmo caso, endereço antigo tem destino | TD-009, TD-010 | `routes.ts` (entrada existente), `parity` | V-08, V-13 |
| FR-009 | Caso inteiro no HTML sem JavaScript; destaque é aprimoramento | TD-007, TD-013 | pré-render da 002, `CaseStudy.tsx` | V-12 |
| NFR-001 | LCP, INP, CLS; sem código de outras páginas | TD-013 | chunk `lazy` da rota, medição da 002 (TD-019 da 002) | V-14 |
| NFR-002 | Sem terceiros; sem HTML injetado a partir de texto | TD-002, §7 | nenhum `dangerouslySetInnerHTML`; regra de lint e teste | V-15 |
| NFR-003 | WCAG 2.1 AA, axe, títulos, foco, cabeçalhos de tabela | TD-007, TD-012, §6 | marcação semântica, `case-study.css` | V-09, V-10 |
| US-001 a US-003 | Ver decisão com ganho e custo; navegar; fidelidade | FR-002, FR-003; FR-004, FR-005; FR-007 | ver acima | ver acima |

## 3. Architecture
```
src/content/schema/case.ts            schema zod do caso (blocos, marcação, papéis das seções)
src/content/cases/*.content.ts        um arquivo por caso (hoje 1), dados puros
src/content/registry.ts               + entrada do caso (explícito, TD-002 da 001)
src/content/cases.ts                  leitura: caseByRoute(id), caseByProject(projectId)  [sem sufixo .content]
src/pages/CaseStudy.tsx               lê o caso da rota, monta a página
src/components/case/
  CaseHeader.tsx                      selo, h1, resumo
  CaseScope.tsx                       "Escopo deste material" (dl)
  CaseIndex.tsx                       índice (nav + ol), aprimoramento do destaque
  CaseSection.tsx                     h2 + blocos
  CaseBlocks.tsx                      renderiza p, h3, list, callout, tech, example, terms
  Inline.tsx                          renderiza a marcação (string, code, strong, em)
  DecisionsTable.tsx                  tabela Decisão | Ganho | Custo aceito
src/hooks/useCurrentSection.ts        hashchange (e leitura do hash inicial) -> id atual
src/styles/case-study.css             reescrito com os tokens da 002
src/i18n/ui.ts                        + chaves `case.*` (texto de interface, PT e EN)
```
Fluxo: o validador (001) lê o arquivo de conteúdo pelo registro, na suíte e no `vite build` (TD-003 da 001). Na página, `CaseStudy` importa **o arquivo do caso direto** (não o registro, que puxa o `zod`), de modo que o chunk da rota contém só o caso e os componentes (TD-013). O pré-render da 002 gera o HTML de `/estudos-de-caso/whatsapp-dispatcher` e `/en/case-studies/whatsapp-dispatcher`; o cliente hidrata.

Ordem do DOM (decisiva para FR-005 e leitor de tela): cabeçalho, escopo, **índice**, artigo, botões finais. Em tela larga, o CSS põe o índice numa coluna lateral fixa (`position: sticky`); em tela estreita ele já está no topo, na ordem natural.

## 4. Mudança de unidade: o que é "texto" e o que é "interface"
- **Conteúdo** (vai para `.content.ts`, entra na equivalência): selo, título, resumo, escopo (3 pares), todos os títulos de seção, rótulos do índice, todos os blocos, decisões, cabeçalhos das duas tabelas de termos ("Termo", "O que significa aqui", "Definição e exemplo"), rótulos dos 2 exemplos, "Exemplo:" dentro do glossário PT.
- **Interface** (`src/i18n/ui.ts`, chaves `case.*`, igual ao texto atual, também na equivalência): "Neste estudo de caso" / "In this case study" (título do índice), "Escopo deste material", "Em termos técnicos" (rótulo dos blocos técnicos), "Decisão / Ganho / Custo aceito" (cabeçalho da tabela de decisões), "← Voltar aos projetos", "Vamos conversar sobre isso →" (e os equivalentes em EN).
Motivo da divisória: o que repete em todo caso (rótulo do bloco técnico, cabeçalho da tabela de decisões) é interface; o que é próprio deste caso é conteúdo. A paridade da 001 cobre os dois lados.

## 5. Data Model
### 5.1 Schema (`src/content/schema/case.ts`; regra que cabe no dado fica aqui)
Todo campo é dado simples (001, §5): nada de `ReactNode`, função ou HTML.

```
Inline   = string                       texto
         | { code:   string }           trecho de código
         | { strong: Inline | Inline[] } ênfase forte (aninhável)
         | { em:     Inline | Inline[] } ênfase (aninhável)
Rich     = Inline[]                     um parágrafo
Flow     = Rich[]                       um ou mais parágrafos (célula, item, bloco)
LocOf<T> = { pt: T, en: T }             por idioma; os dois obrigatórios e não vazios (001, FR-007, FR-014)

Block =
  | { kind: 'p',       text: LocOf<Rich> }
  | { kind: 'h3',      text: LocalizedText }                  // 001: texto localizado simples
  | { kind: 'list',    items: LocOf<Flow>[] }                 // sem aninhar listas
  | { kind: 'callout', text: LocOf<Flow> }
  | { kind: 'tech',    text: LocOf<Flow> }                    // "Em termos técnicos"
  | { kind: 'example', label: LocalizedText, text: LocOf<Flow> }
  | { kind: 'terms',   headers: [LocalizedText, LocalizedText],
                       rows: { term: LocOf<Rich>, text: LocOf<Flow> }[] }

Section = { id: LocalizedText          // âncora, por idioma (TD-010)
            role: 'context' | 'body' | 'decisions' | 'outcome' | 'glossary'
            tocLabel: LocalizedText     // rótulo do índice
            title: LocalizedText        // h2
            blocks: Block[] }

Decision = { decision: LocalizedText, gain: LocalizedText, cost: LocalizedText }   // os três obrigatórios

Case = { id: string                    // slug estável, igual ao id da rota
         route: string                 // id em routes.ts
         project: string               // id do projeto (003)
         badge: LocalizedText
         title: LocalizedText
         summary: LocOf<Rich>
         scope: { label: LocalizedText, text: LocOf<Rich> }[]     // 1 a N; hoje 3
         sections: Section[]
         decisions: Decision[] }       // 1 a N; hoje 4
```
Regras do schema (cada uma com mensagem "arquivo, campo, motivo", 001 FR-012):
| Regra | Entrada que viola | Mensagem |
| --- | --- | --- |
| `decisions` tem ao menos 1 linha; `gain` e `cost` não vazios (FR-002) | decisão sem `cost` | `cases/whatsapp-dispatcher.content.ts: decisions[2].cost: texto ausente` |
| `en` obrigatório em todo `LocOf` e em todo `LocalizedText` | sem EN | `...: en ausente` |
| `Rich` e `Flow` não vazios; nenhum texto só de espaços | parágrafo `['  ']` | `texto vazio (só espaços)` |
| exatamente uma seção `context` (a primeira), exatamente uma `decisions`, no máximo uma `outcome` e uma `glossary` | duas `decisions` | `sections: papel 'decisions' repetido` |
| `Section.id` único **por idioma** e sem espaço, sem acento no formato `^[a-z0-9-]+$` | `id` repetido | `sections[4].id.en: repetido` |
| aninhamento de `Inline` com profundidade ≤ 3 | profundidade 4 | `profundidade de marcação > 3` |
| nenhum marcador de pendência `[entre colchetes]` nem texto de exemplo (003, FR-012) | `[...]` | herdado do guarda da 001/003 |
| `project` existe no conteúdo de projetos (003) e o projeto, se tiver o campo de endereço do caso, aponta para este caso (TD-009) | `project: 'xyz'` | erro de verificação (FR-006) |
| `route` existe em `routes.ts` com o mesmo `id` | rota inexistente | erro de verificação |

A paridade estrutural vem de graça: **os blocos são compartilhados**, só as folhas variam por idioma. Um caso só em PT é impossível de escrever; o validador acusa o `en` ausente.

### 5.2 O arquivo de conteúdo
`src/content/cases/whatsapp-dispatcher.content.ts` segue TD-002 da 001: dados puros, sem JSX, sem função, sem `import` além de `import type`. Comentários guardam a procedência ("migrado de `WhatsAppDispatcherPt.tsx` em `<commit>`"). Tamanho estimado: ~2.500 a 3.000 linhas formatadas (o caso tem ~60 trechos de código, 29 ênfases, 139 negritos no PT). É grande e aceito (TD-001, risco R-02).

### 5.3 Leitura
`src/content/cases.ts` (sem sufixo `.content`, não passa pelo registro): `caseByRoute(routeId)`, `caseByProject(projectId)` (devolve `undefined` quando o projeto não tem caso, FR-006). A página do projeto (005) usa `caseByProject` para mostrar ou não o link. Dado do caso é lido **na página**, nunca copiado para o projeto.

## 6. Interface Contract
**Página** `CaseStudy` (rota `whatsapp-dispatcher` em `routes.ts`, entrada já existente): `<main>` com, em ordem:
1. Link "← Voltar aos projetos" (interface).
2. `<header>`: selo (`badge`), `<h1>` (título), resumo.
3. `<aside aria-labelledby>` "Escopo deste material": `<dl>` com `<dt>`/`<dd>` (FR-003).
4. `<nav aria-labelledby>` índice: `<ol>` de `<a href="#id">`; o destaque usa `aria-current="location"` na âncora atual, com sublinhado e peso no CSS (FR-004; mesma regra do TD-023 da 002, e o teste `state.test.ts` da 002 vale para esta regra).
5. `<article>`: cada seção é `<section aria-labelledby>` com `<h2 id>` (`scroll-margin-top` pela altura do cabeçalho). Hierarquia: `h1` > `h2` > `h3` sem saltos (NFR-003).
6. Botões finais "← Voltar aos projetos" e "Vamos conversar sobre isso →" (interface; este vai a `/contato`).

**Blocos:** `p` vira `<p>`; `list` vira `<ul><li>` (cada parágrafo de `Flow` vira `<p>` dentro do `<li>`); `callout` vira `<div role="note">` (um `<aside>` criaria landmark extra); `tech` e `example` viram `<div>` com rótulo em `<span>`; `terms` vira `<table>` com `<th scope="col">` no cabeçalho e **`<th scope="row">` no termo** (hoje é `<td>`; o texto é o mesmo, a associação de cabeçalhos é nova e atende NFR-003); `decisions` vira `<table>` com `<caption>` visualmente oculto (o título da seção) e `<th scope="col">` Decisão, Ganho, Custo aceito.
**Marcação:** `string` vira texto; `{code}` `<code>`; `{strong}` `<strong>`; `{em}` `<em>`. Nada mais (TD-002).
**Aprimoramento (`useCurrentSection`):** lê `location.hash` ao montar e em `hashchange`; marca `aria-current="location"` na âncora do índice cujo `href` bate. Sem JavaScript as âncoras funcionam do mesmo jeito (navegação nativa); só o destaque some (FR-009). Não há rastreamento de rolagem (pergunta 7).

## 7. Segurança
- Nenhum `dangerouslySetInnerHTML` e nenhum parser de HTML ou Markdown no navegador: a marcação é dado tipado e vira elemento React (NFR-002). Um teste de lint-por-texto falha se `dangerouslySetInnerHTML` aparecer em `src/components/case/` ou `src/pages/CaseStudy.tsx`.
- Não há link dentro do texto do caso (os 14 `<a>` do código atual são o índice). Por isso o `Inline` **não** tem tipo `link`: sem link, não há `href` vindo de dado a validar. Se a Duda quiser links no texto no futuro, é mudança de spec.
- O hash da URL só é comparado com os `id` do conteúdo (igualdade de texto), nunca injetado.
- Sem requisição a terceiros: nenhuma imagem, fonte ou script novo. O caso atual não tem imagem.

## 8. Edge Cases
| ID | Caso | Comportamento |
| --- | --- | --- |
| EC-01 | Decisão sem custo | erro do schema, falha a verificação e o build (FR-002) |
| EC-02 | Caso sem `en` em um parágrafo | erro do schema nomeando o campo |
| EC-03 | Caso sem `project`, ou `project` inexistente | erro de verificação |
| EC-04 | Projeto sem caso | `caseByProject` devolve `undefined`; a 005 não mostra link; válido |
| EC-05 | Caso cujo projeto aponta para outro endereço | erro de consistência (TD-009) |
| EC-06 | Hash na URL que não existe (`#xyz`) | nada é destacado, sem erro; o navegador não rola |
| EC-07 | Hash de outro idioma (`/en/...#contexto`) | não destaca; não redireciona (TD-010, pergunta 6) |
| EC-08 | Texto com `*` (marcador do glossário, ex.: `Domain-Driven Design*`) | é texto literal; não existe sintaxe de marcação em string (TD-002) |
| EC-09 | Tabela larga em 390 px | rola **dentro** de uma região focável; a página não rola (TD-012) |
| EC-10 | Teclado no índice | Tab percorre as âncoras; Enter leva à seção; foco visível (NFR-003) |
| EC-11 | `prefers-reduced-motion` | rolagem sem animação (a âncora nativa já é instantânea; não se usa `scroll-behavior: smooth`) |
| EC-12 | Dois casos com o mesmo `route` ou `id` | erro de verificação |
| EC-13 | Um segundo caso no futuro | adicionar arquivo, entrada no registro e entrada em `routes.ts`; o teste de consistência acusa se faltar uma das três (TD-009) |

## 9. Verification Strategy
Comando-base de cada tarefa: `npm run verify`. Testes vivem dentro das tarefas (conventions.md). Verificações:

| ID | Prova | Como |
| --- | --- | --- |
| V-01 | Schema aceita o caso real e recusa as 5 linhas da tabela "Validação" do requirements | `src/content/schema/case.test.ts`: caso válido; decisão sem custo; caso sem EN; caso sem `project`; `id` repetido; papel repetido |
| V-02 | Caso registrado; arquivo fora do registro falha | `registry.test.ts` (001) já cobre; este caso entra na lista |
| V-03 | Tabela de decisões acessível | `CaseStudy.test.tsx`: `columnheader` Decisão, Ganho, Custo aceito; 4 linhas; cada linha com 3 células; `caption` presente |
| V-04 | Escopo no início | teste de ordem do DOM: `dl` do escopo antes do primeiro `h2` do artigo |
| V-05 | Índice leva à seção | teste: todo `href="#x"` do índice tem elemento com `id="x"` no artigo, nos dois idiomas |
| V-06 | Destaque sem depender de cor | teste de unidade: `hashchange` define `aria-current="location"` na âncora certa; `state.test.ts` (002) confere que a regra de `[aria-current]` muda `text-decoration` ou `font-weight` |
| V-07 | Tela estreita | e2e sobre `dist-prova` em 390 px: `scrollWidth <= clientWidth` do `document`, índice acima do artigo (`boundingBox`) |
| V-08 | Ligação projeto ↔ caso e rota | teste de consistência: todo `Case.project` existe; todo `Case.route` existe em `routes.ts`; todo projeto com campo de caso aponta para o endereço do caso; toda rota "estudo de caso" tem caso |
| V-09 | axe sem violação, cabeçalhos de tabela | e2e (`@axe-core/playwright` da 002) nas duas URLs, tema claro e escuro |
| V-10 | Teclado | e2e: Tab até um item do índice, Enter, a URL ganha o hash e `aria-current` muda |
| V-11 | **Equivalência de texto** (FR-007) | ver 9.1 |
| V-12 | Sem JavaScript | `renderRoute` (002) em vitest: HTML da rota contém os 14 `h2`, as 3 tabelas e o índice; `checkDist.mjs` confere o `dist` |
| V-13 | Idiomas e troca | teste: `/estudos-de-caso/whatsapp-dispatcher` e `/en/case-studies/whatsapp-dispatcher` renderizam o mesmo caso; a troca de idioma (002, FR-021) leva de um ao outro |
| V-14 | Orçamento | medição do chunk da rota pelo `measureBundle` (002); a página não importa código de outras páginas (teste de importação) |
| V-15 | Sem HTML injetado | teste de texto sobre os arquivos de `src/components/case/` e `CaseStudy.tsx` (sem `dangerouslySetInnerHTML`) |

### 9.1 Plano de teste de equivalência (US-003, FR-007)
**Problema:** o código antigo some na mesma spec (P-Q-001), então a referência precisa ser **congelada antes**.
1. **Congelar.** Com os componentes antigos ainda no repositório, um script de uma vez só renderiza `WhatsAppDispatcherPt` e `WhatsAppDispatcherEn` (e o `CaseStudy` por idioma, que traz o texto de interface) com `renderToStaticMarkup`, percorre o HTML e grava **uma lista de linhas** `tag: texto` por idioma em `src/content/__fixtures__/case-whatsapp-dispatcher.golden.pt.json` e `.en.json`, com o hash do commit de origem no cabeçalho. O script não é mantido (nasce e morre na tarefa; fica no histórico do git).
2. **Normalização** (a mesma nos dois lados, função única em `src/content/__fixtures__/normalize.ts`): espaços colapsados, `<br>` e fronteira de bloco viram um espaço, aspas e caracteres Unicode **não** são alterados (NFC apenas). Cada linha guarda a etiqueta (`h1`, `h2`, `h3`, `p`, `li`, `th`, `td`, `dt`, `dd`, `code`, `strong`, `em`) e o texto.
3. **Comparar.** `caseEquivalence.test.tsx` renderiza a **página nova** (mesma função de extração) nos dois idiomas e exige: (a) mesma **sequência de textos de bloco** (parágrafo a parágrafo, linha de tabela a linha de tabela, item a item), com igualdade exata após a normalização; (b) mesma **contagem** de `h2`, `h3`, `li` do corpo, linhas de tabela, `code` e itens do índice. Falha mostra a primeira diferença com o trecho e o idioma.
4. **Duas diferenças permitidas e declaradas no teste** (nada mais): `td` de termo vira `th scope="row"` (a etiqueta é comparada como "célula de termo") e a quebra `<br>` vira parágrafo (o texto normalizado é igual). Qualquer outra diferença falha.
5. **Vida do teste:** como em 003 (FR-008), os dourados e o teste ficam até a Duda aprovar o fechamento; depois a Duda decide removê-los.
**Limite honesto:** a equivalência prova **texto e estrutura de blocos**, não aparência. A aparência muda de propósito (tokens novos, `br` em parágrafo) e é conferida por captura de tela do Playwright para a Duda olhar, sem baseline automático.

## 10. Technical Decisions
### TD-001: Formato do conteúdo do caso
**Decisão:** arquivo TypeScript de dados puros em `src/content/cases/*.content.ts`, validado por zod, como o resto do conteúdo (TD-002 da 001, que deixou este ponto para a 006).
**Alternativas:** (a) **Markdown com front matter** (bom de escrever; precisa de parser como dependência nova, transforma texto em HTML no build ou no cliente, o que abre o risco de HTML injetado (NFR-002) e não valida "decisão com ganho e custo", que é estrutura); (b) **MDX** (mistura código e texto, contra o princípio 1); (c) **JSON** (não aceita comentário de procedência e o editor não dá erro de tipo); (d) manter **JSX** (é o que há; viola FR-001).
**Motivo:** o schema garante estrutura (ganho e custo obrigatórios, PT e EN) e o `tsc` acusa erro enquanto a Duda edita. **Custo aceito:** escrever um caso novo em dados é mais verboso que em Markdown (cada negrito é um objeto). Se a Duda for escrever muitos casos, a escolha deve ser revista (pergunta 8).

### TD-002: Como representar a marcação dentro do texto
**Decisão:** lista de trechos tipados (`string | {code} | {strong} | {em}`), aninhável até profundidade 3. Não existe sintaxe dentro de string.
**Alternativas:** (a) **mini-sintaxe em string** (`**negrito**`, `*itálico*`, `` `código` ``): mais curta de escrever, mas o texto usa `*` literal (marcadores como `Domain-Driven Design*`, que aparecem várias vezes), então seria preciso escapar e um erro de escape muda texto em silêncio; (b) **HTML em string** (`<strong>`): precisa de `dangerouslySetInnerHTML` ou de parser, risco do NFR-002; (c) **só texto plano** (perde ênfase e código, que Q-004 pediu).
**Motivo:** nenhum caractere é especial, a equivalência é exata e a renderização é por elemento React. O código atual tem 29 `<em>`, quase todos dentro de `<strong>`, e ao menos 2 casos de `strong > strong > em` (`Circuit breaker*`, `dead-letter queue*`): o aninhamento é preciso para reproduzir fielmente; a limitação de profundidade 3 evita abuso. **Custo:** verboso.

### TD-003: Modelo fixo por papéis e blocos estruturais
**Decisão:** Q-003 (modelo fixo) vira o campo `role` das seções, com as regras da tabela de §5.1, mais `scope` e `decisions` como campos obrigatórios do caso. Os blocos além de parágrafo, lista, código e ênfase são `h3`, `callout`, `tech`, `example` e `terms`.
**Alternativas:** (a) **seções livres sem papel** (não garante o modelo da Duda nem que as decisões existam); (b) **só `p`/`list`** como Q-004 literal: obriga a achatar 3 tabelas, 14 blocos técnicos, os destaques e os exemplos em parágrafos, o que **perde** o rótulo visual "Em termos técnicos" e a tabela do glossário; mudaria a leitura do caso e contraria "nada de resumo" (FR-007) na prática; (c) **bloco `html` livre** (derrota o schema).
**Motivo:** a marcação que a Duda aceitou (Q-004) é a **dentro do texto**; os blocos já existem no caso atual, e tirá-los seria mudar o conteúdo. **Precisa da confirmação da Duda** (pergunta 1). Os 6 tipos de bloco cobrem 100% do caso atual (conferido contra os dois componentes: 3 `h3`, 14 `tech`, 2 `callout`, 2 `example`, 3 tabelas, 2 `ul`).

### TD-004: PT e EN com o mesmo desenho
**Decisão:** o componente desenha PT e EN **do mesmo jeito**: `Flow` vira um `<p>` por parágrafo; item de lista com título e corpo (PT) vira dois parágrafos dentro do `<li>`, e o EN, que hoje põe tudo seguido, fica com um parágrafo. O "Exemplo:" do glossário PT é o segundo parágrafo da célula.
**Alternativas:** (a) **reproduzir `<br>` por idioma** (precisaria de um tipo `{br}` em `Inline`, e o PT e o EN continuariam visualmente diferentes por acidente histórico); (b) **forçar a mesma estrutura nos dois** (mudaria o texto de um idioma: proibido por FR-007).
**Motivo:** cada idioma é dado independente (cada um declara seus parágrafos), então o texto fica idêntico e o código não tem ramo por idioma. O que muda é só o espaçamento. **Custo:** diferença visual pequena no PT (quebra de linha vira espaço entre parágrafos). Pergunta 5.

### TD-005: Migrar por gerador de uma vez só, revisado pela equivalência
**Decisão:** o conteúdo é gerado a partir do **HTML renderizado** dos componentes antigos (parse com `jsdom`, que já é `devDependency`), formatado pelo Prettier e então tratado como fonte; o gerador é descartado depois. A revisão é a equivalência (§9.1) mais leitura da Duda das seções 1 e 2 do arquivo.
**Alternativas:** (a) **digitar à mão** 2.387 linhas: risco alto de erro de caractere (R-01), tarefa longa e sem ganho; (b) **conversor permanente** (código que nunca mais é usado); (c) **copiar o JSX com busca e substituição**: frágil com `{' '}` e aninhamentos.
**Motivo:** o HTML renderizado já resolve `{' '}`, entidades e aspas; o parse para o schema é mecânico e o teste de equivalência compara a saída com o **mesmo HTML antigo** (por isso o dourado nasce antes de o gerador rodar e de o código antigo sair). **Risco:** o gerador e o dourado partem da mesma fonte; um erro de leitura comum a ambos passaria. Mitigação: o dourado guarda linhas de texto sem interpretar marcação, e o gerador é testado com 3 trechos conferidos à mão (um parágrafo com `strong > em`, uma lista, uma linha de glossário).

### TD-006: Equivalência por texto normalizado, com referência congelada
Ver §9.1. **Alternativas:** (a) **snapshot do HTML inteiro** (acusa toda mudança de marcação, inclusive as permitidas; ruído que se aprova sem ler); (b) **comparação por hash do texto** (não mostra onde difere); (c) **manter os componentes antigos até o fim para comparar ao vivo** (viola P-Q-001 e deixa 2.387 linhas mortas no repositório).
**Motivo:** a lista de linhas mostra a primeira diferença legível e dispensa o código antigo.

### TD-007: Destaque da seção atual
**Decisão:** `aria-current="location"` na âncora do índice, definido por `hashchange` e pelo hash inicial; CSS dá sublinhado e peso (002, FR-040, TD-023). Sem rastreamento de rolagem.
**Alternativas:** (a) **`:target` em CSS puro** (funciona sem JavaScript, mas só destaca o título da seção, não o item do índice; o requisito é destacar no índice); (b) **CSS `:has(#id:target)` com uma regra por seção** (CSS gerado por caso; frágil, `:has` e CSS por dado); (c) **scroll-spy com `IntersectionObserver`** (destaca enquanto se lê; mais código e mais INP; o requisito pede "escolher uma seção", não "acompanhar a leitura": pelo princípio 9, fica fora, pergunta 7).
**Motivo:** cumpre FR-004 e FR-009 com ~15 linhas; sem JavaScript as âncoras nativas ainda funcionam. `aria-current="location"` informa leitor de tela, e o estilo não depende só de cor.

### TD-008: Tela estreita
**Decisão:** abaixo de 1024 px (o ponto de quebra da 002, TD-010) o grid vira uma coluna; o índice, que já vem antes do artigo no DOM, aparece como lista no topo, **expandido** (Q-002 respondida: lista no topo, não recolhível). Com 14 itens, ocupa ~14 × 44 px; aceito.
**Alternativas:** `<details>` recolhível (Q-002 recusou); índice fixo no rodapé (esconde conteúdo).
**Motivo:** é o que a Duda respondeu, e a ordem do DOM serve leitor de tela, teclado e a leitura sem CSS.

### TD-009: Ligação projeto ↔ caso, rota e URL
**Decisão:** **uma fonte** para a ligação: `Case.project` e `Case.route`. O projeto não guarda cópia do endereço; a página do projeto (005) chama `caseByProject`. Se o conteúdo migrado dos projetos (003, FR-001) ainda tiver o campo de endereço do caso, um teste de consistência exige que ele seja igual ao endereço da rota do caso. A rota segue como entrada **escrita** em `routes.ts` (a tabela única da 002), com um teste que liga cada caso a uma rota e vice-versa.
**Endereço:** mantenho `/estudos-de-caso/whatsapp-dispatcher` e `/en/case-studies/whatsapp-dispatcher` (as rotas atuais). FR-008 pede que o endereço antigo "redirecione" e que "o destino exista"; se o endereço não mudar, o redirecionamento da spec 010 é vazio. **Pergunta 3:** a Duda quer outro endereço (por exemplo, sob `/projetos/...`)?
**Alternativas:** (a) **gerar a rota do conteúdo** (poupa uma linha por caso, mas `routes.ts` deixaria de ser a única tabela, regra do conventions.md); (b) **gravar o endereço no projeto e no caso** (duas fontes; deriva).
**Motivo:** a tabela única continua única; o teste pega esquecimento. Custo: um caso novo exige editar 3 lugares (arquivo, registro, rota), e o teste acusa a falta.

### TD-010: Âncoras por idioma e rótulo do índice
**Decisão:** `Section.id` é `LocalizedText` (preserva `#contexto` e `#context`, ou seja, os links que já circulam), e `tocLabel` fica separado de `title` (preserva o texto atual do índice, FR-007).
**Alternativas:** (a) **um `id` neutro para os dois idiomas** (links externos antigos com hash quebram; ganho: trocar o idioma mantém a seção, pergunta 6); (b) **o índice usar o título** (como o mockup; muda texto do índice, e FR-007 proíbe).
**Motivo:** fidelidade. A troca de idioma leva ao **mesmo caso** (FR-008), não necessariamente à mesma seção: ela preserva só o caminho, como o resto do site (002, FR-021).

### TD-011: Texto de interface fora do conteúdo
**Decisão:** ver §4. **Alternativa:** pôr tudo (inclusive "Em termos técnicos") no arquivo do caso: repete o mesmo texto 14 vezes e deixa a Duda editando rótulos de interface em dado. **Motivo:** o rótulo do bloco é decisão de interface, uma vez só.

### TD-012: Tabelas: semântica e tela estreita
**Decisão:** `<table>` real com `<caption>` (oculto visualmente), `<th scope="col">` e `<th scope="row">` no termo/decisão. Em 390 px a tabela fica dentro de um contêiner `overflow-x: auto` com `tabindex="0"`, `role="region"` e `aria-label` (exigência do axe `scrollable-region-focusable`); a **página** não rola na horizontal.
**Alternativas:** (a) **empilhar as linhas em cartões por CSS** (`display: block` em células tira a semântica de tabela em alguns leitores, e FR-002 exige "legível por leitor de tela"); (b) **trocar a tabela por lista de definição** (perde a leitura de linha e coluna).
**Motivo:** a tabela de decisões tem 3 colunas e texto longo; a rolagem **interna** é o menor custo que preserva a semântica. O glossário (2 colunas) cabe sem rolagem. **Custo:** uma região rolável dentro da página em celular (R-04, pergunta 9).

### TD-013: Desempenho e carregamento
**Decisão:** `CaseStudy` continua `lazy` (`pages/lazyPages.ts`); importa o arquivo do caso direto, nunca o registro nem o `zod`. O pré-render (002, TD-008) entrega o HTML completo, então o LCP é do HTML; o hook de destaque é o único JavaScript novo. O texto longo (tamanho não medido; o V-14 mede) está **uma vez** (PT e EN no mesmo módulo): **Alternativa:** um módulo por idioma, carregado sob demanda (poupa ~50% do chunk do caso, mas duplica estrutura e quebra o "um arquivo por caso" e a paridade estrutural). **Motivo:** hoje cada idioma é um componente separado carregado junto no mesmo chunk, então o tamanho não piora; medir no V-14 e abrir questão se o chunk passar do orçamento da 002.

## 11. Arquivos que esta spec remove, substitui ou cria (P-Q-001: o novo substitui o antigo no lugar)
| Arquivo | Destino | Motivo |
| --- | --- | --- |
| `src/pages/case-study/WhatsAppDispatcherPt.tsx` | **removido** | texto passa para o conteúdo; só após o dourado e a equivalência verdes |
| `src/pages/case-study/WhatsAppDispatcherEn.tsx` | **removido** | idem |
| `src/pages/case-study/` (pasta) | **removida** | fica vazia |
| `src/pages/CaseStudy.tsx` | **reescrito** | escolhe PT/EN por componente hoje; passa a ler o caso por rota |
| `src/styles/case-study.css` | **reescrito** (classes `.case-*` antigas saem, tokens da 002; apaga do bloco LEGADO os tokens que parar de usar) | casca e tokens novos |
| `src/data/resume.ts` (links `to: '/estudos-de-caso/whatsapp-dispatcher'`) | **fica** (a 007 migra o currículo); como o endereço não muda (TD-009), nada quebra | dono é a spec 003/007 |
| `src/data/projects.tsx` (`caseStudy: '/estudos-de-caso/...'`) | **fica** até a 003 migrar | dono é a 003; o teste de consistência (V-08) lê o conteúdo migrado |
| `src/data/routes.ts` entrada `whatsapp-dispatcher` | **fica** (título, descrição e caminhos já corretos) | TD-009 |
| `scripts/prerender.ts` (mapa `'whatsapp-dispatcher': 'src/pages/CaseStudy.tsx'`) e `src/test/setup.ts` | **ficam** (a rota e o arquivo da página não mudam) | não há mudança de endereço |
| **Novos:** `src/content/schema/case.ts` e `case.test.ts`; `src/content/cases/whatsapp-dispatcher.content.ts`; `src/content/cases.ts` e `.test.ts`; `src/content/__fixtures__/case-whatsapp-dispatcher.golden.{pt,en}.json` e `normalize.ts`; `src/components/case/*` (7 arquivos) com testes; `src/hooks/useCurrentSection.ts` e teste; `src/content/caseEquivalence.test.tsx`; chaves `case.*` em `src/i18n/ui.ts` | criados | seção 3 |
Conferido: só `CaseStudy.tsx` importa os dois componentes antigos (`grep`).

## 12. Divergências entre o mockup e este design
| # | Mockup (`Caso.dc.html`) | Este design | Motivo |
| --- | --- | --- | --- |
| 1 | Trechos com `[...]` | Texto integral migrado | FR-007 (os `[...]` são ilustração) |
| 2 | Índice usa o **título** da seção ("Linguagem do domínio") | Índice usa o **rótulo atual** ("Linguagem do Domínio") | FR-007; pergunta 4 |
| 3 | Título do índice "NESTA PÁGINA" | "Neste estudo de caso" | texto atual; pergunta 4 |
| 4 | Tags de stack (BullMQ, Redis, ...) sob o resumo | **Fora** do caso. Se a Duda quiser, vêm da stack do projeto (003), sem texto novo | o código atual não as mostra; na dúvida, fora do escopo |
| 5 | Item "Casos" no menu | **Não existe**: nenhum requisito pede lista de casos | FR-006 liga o caso ao projeto; sem página de lista não há destino |
| 6 | Seção com 3 cartões "Os três processos" | Seção com 3 `h3` e parágrafos como hoje | texto atual |
| 7 | Botão "Conversar sobre este caso" | "Vamos conversar sobre isso →" (texto atual, leva a `/contato`) | FR-007 |
| 8 | Tabela com `min-width: 560px` e rolagem do contêiner | idem, mas com região focável | axe (TD-012) |
| 9 | Realce do item atual por cor da borda | sublinhado e peso, além da cor | 002, FR-040 |
| 10 | "Voltar aos projetos" no topo e no fim | idem | igual |

## 13. Riscos
| ID | Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R-01 | Perda ou deformação de texto na migração | Média | Alto | Gerador a partir do HTML + dourado congelado antes + equivalência exata (TD-005, TD-006) |
| R-02 | Arquivo de conteúdo muito grande e difícil de editar | Alta | Médio | Comentário por seção; Prettier; se a Duda for escrever mais casos, rever o formato (pergunta 8) |
| R-03 | O gerador e o dourado compartilham um erro de leitura | Baixa | Médio | Dourado em texto cru; 3 trechos conferidos à mão (TD-005) |
| R-04 | Tabela de decisões em 390 px fica difícil de ler (rolagem interna) | Média | Baixo | TD-012; captura de tela para a Duda decidir |
| R-05 | Os blocos além da marcação aceita em Q-004 não são aprovados | Média | Médio | Pergunta 1; alternativa (b) do TD-003 reduz o caso a parágrafos e muda o conteúdo |
| R-06 | A 003 e a 005 ainda não têm design: o campo do projeto para o caso e o endereço do detalhe não estão fixados | Alta | Médio | O contrato (TD-009) só exige `caseByProject` e um teste de consistência; se a 003 trocar o campo, ajusta-se o teste, não o schema |
| R-07 | Chunk da rota acima do orçamento | Baixa | Médio | V-14 mede; plano B do TD-013 |
| R-08 | O destaque do índice não aparece sem JavaScript | Alta | Baixo | Aceito: FR-009 trata como aprimoramento |

## 14. Perguntas para a Duda
1. **Blocos novos (TD-003, R-05):** Q-004 aceitou a marcação **dentro do texto** (parágrafo, lista, código, ênfase). O caso atual também tem tabelas, subtítulos, destaques, exemplos rotulados e blocos "Em termos técnicos". Aceita esses blocos como estrutura do caso? Sem eles, o caso vira só parágrafos e muda de leitura.
2. **"Resultado" (Q-003):** o caso não tem uma seção "Resultado". Marco "O que mudaria para um cenário real de produção" como `outcome`, e o glossário como `glossary`. Confirma, ou o `outcome` fica ausente?
3. **Endereço (TD-009):** mantenho `/estudos-de-caso/whatsapp-dispatcher` e `/en/case-studies/whatsapp-dispatcher`. FR-008 fala em redirecionar o "antigo". Quer outro endereço?
4. **Índice:** manter os rótulos atuais ("Separação em Camadas") ou usar o título da seção como no mockup? E o título "Neste estudo de caso" ou "NESTA PÁGINA"? (Mudar é alterar texto, então precisa da sua autorização.)
5. **Quebra de linha do PT (TD-004):** o PT usa `<br>` dentro de itens e do glossário; o EN não. Aceita desenho único (parágrafos), com a diferença só visual?
6. **Âncoras (TD-010):** manter `#contexto`/`#context` por idioma, ou um id neutro (a troca de idioma passa a manter a seção, mas links antigos com hash mudam)?
7. **Destaque:** só ao escolher uma seção (como pede o requisito), ou também acompanhando a rolagem (mais código, fora do requisito)?
8. **Casos futuros:** se você pretende escrever mais casos, o formato em dados (TD-001) é verboso; quer reavaliar Markdown quando houver o segundo caso?
9. **Tabela em celular (TD-012):** aceita rolagem **dentro** da tabela de decisões em 390 px, ou prefere cartões (com o custo de perder a semântica de tabela)?

## 14.1 Decisões da Duda (2026-11-19)
A Duda aceitou as recomendações do agente nas 9 perguntas da seção 14. Registro (o `.status` continua sendo a fonte de verdade da aprovação):

| # | Pergunta | Decisão da Duda | Efeito no design |
| --- | --- | --- | --- |
| 1 | Blocos novos | **Aceitos** como estrutura do caso: tabelas, subtítulos (`h3`), destaques (`callout`), exemplos e "Em termos técnicos" (`tech`) | TD-003 fica como está (R-05 encerrado); Q-004 vale para a marcação dentro do texto e esta decisão para a estrutura |
| 2 | "Resultado" | "O que mudaria para um cenário real de produção" é o `outcome`; o glossário é o `glossary` | papéis de §5.1 confirmados |
| 3 | Endereço | **Atuais mantidos** (`/estudos-de-caso/whatsapp-dispatcher` e `/en/case-studies/whatsapp-dispatcher`) | TD-009: nada muda em `routes.ts`; o redirecionamento da spec 010 fica vazio para este caso |
| 4 | Índice | **Mantém os rótulos atuais** e o título "Neste estudo de caso" | TD-010: `tocLabel` separado de `title`; divergências 2 e 3 da §12 confirmadas |
| 5 | Quebra de linha do PT | **Desenho único** PT/EN (parágrafos), diferença só visual | TD-004 confirmado |
| 6 | Âncoras | **Por idioma** (`#contexto` e `#context`) | TD-010 confirmado; trocar o idioma leva ao mesmo caso, não à mesma seção |
| 7 | Destaque | **Só ao escolher a seção**, sem acompanhar a rolagem | TD-007 confirmado |
| 8 | Casos futuros | **Markdown só será reavaliado se houver um 2º caso** | TD-001 confirmado; sem trabalho nesta spec |
| 9 | Tabela em celular | **Rola numa região focável** em 390 px | TD-012 confirmado (R-04 aceito) |

## 15. Confirm before building
Responda as perguntas 1 a 3 antes de aprovar o design (mudam o schema e a rota); 4 a 9 têm resposta padrão marcada acima. A tarefa que congela o dourado precisa ser a **primeira** (antes de qualquer remoção), e a remoção dos componentes antigos a **última**.
