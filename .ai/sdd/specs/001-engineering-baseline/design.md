# 001 Engineering baseline, Design
**Status:** approved (aprovado pela Duda em 2026-11-15; ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-15
**Entrada:** `requirements.md` v1.3 (aprovada em 2026-11-15) · **Anexos:** [`design.anexo-evidencias.md`](design.anexo-evidencias.md) (medições, investigação 1), [`design.anexo-fora-do-mvp.md`](design.anexo-fora-do-mvp.md) (lista para aprovar, investigação 2)

## 1. Executive Summary
A base de engenharia vira quatro coisas pequenas e testáveis: (1) um runner de verificação em Node, `npm run verify`, que roda as cinco etapas na ordem e igual em Windows e Linux; (2) schemas das cinco primitivas de conteúdo (texto localizado, data, imagem, link, etiqueta), validados por um único validador que roda no teste e no build; (3) um teste de paridade PT/EN e uma regra "sem texto de reserva"; (4) uma varredura de segredos. Em paralelo, esta spec remove o código fora do MVP (trilhas, personas, jogos, assistente de IA) em ondas, com a lista do Anexo B para a Duda aprovar.

O que a investigação achou, em números (detalhe e comandos no Anexo A):
- **A suíte não leva 638 s hoje: leva 322 s sozinha** (1418 testes). O jsdom é recriado em cada um dos 99 arquivos (52 % do tempo) e a CPU do notebook satura: 4 ou 11 workers dão o mesmo tempo. **As 5 falhas antigas não se repetem sozinhas**: com a configuração padrão (11 workers) apareceram 10 falhas em outros arquivos, quase todas "não achou o diálogo a tempo"; os mesmos arquivos passam sozinhos (E2) e com 4 workers (E3). É flakiness de carga, não teste quebrado.
- **`pool: 'vmThreads'` derruba a suíte para 91-112 s, sem falhas, em duas execuções seguidas** (E5). Remover o código fora do MVP tira mais 30 % do tempo de teste (E8). Dividir `terminal/sections.test.tsx` (19 % de todo o trabalho em um só arquivo) e rodar os `.test.ts` num ambiente sem DOM leva a estimativa a 50-60 s.
- **A meta de 60 s para a suíte é plausível, ainda não provada. A de 120 s para o `verify` é inviável**: as etapas em sequência obrigatória somam ~150 s depois da limpeza (hoje ~220 s). **Proponho suíte ≤ 90 s e `verify` ≤ 180 s** (DQ-002).
- **A formatação já falha hoje** (143 arquivos): a causa principal é CRLF do Windows (`core.autocrlf=true`, sem `.gitattributes`, `.prettierrc` sem `endOfLine`). Sem tratar isso, o passo 1 do `verify` nasce vermelho (TD-007).
- **O código fora do MVP é 50 arquivos + 30 de teste (391 testes, 30 % do tempo)**; o assistente e os jogos saem quase sem risco; trilhas e personas estão **dentro da raiz do app, da casca, da home, do terminal, da paleta e das rotas**, e precisam ser desacopladas antes (Anexo B, classe B).
- **Reaproveitamento:** a varredura de segredos é reescrita a partir de `netlify/assistant/secrets.test.ts` (metade dele sobrevive); `personalGuard.ts` e `envExample.test.ts` ficam como estão e servem de molde.

Decisões que dependem da Duda: DQ-001 (o Caderno), DQ-002 (orçamentos), DQ-003 (zod como dependência de desenvolvimento) e a aprovação do Anexo B.

## 2. Requirements Mapping
Todos os requisitos têm casa. Nenhum FR ficou sem mapeamento. Onde o requisito deixa uma lacuna, ela está na seção 12 (L-NNN) com a alteração proposta.

| ID | Resumo | Onde o design resolve | Artefato | Verificação (seção 10) |
| --- | --- | --- | --- | --- |
| FR-001 | Comando único, 5 etapas na ordem | §6.1, TD-006 | `scripts/verify.mjs`, script `verify` | V-01 |
| FR-002 | Para na primeira falha, nomeia a etapa, sai ≠ 0 | §6.1, TD-006 | `scripts/verify.mjs` | V-02 |
| FR-003 | Sucesso sai com 0 | §6.1 | `scripts/verify.mjs` | V-03 |
| FR-004 | Suíte sem falhas; falha corrigida ou removida pelo FR-006 | TD-008, TD-010, L-007 | `vite.config.ts` (pool, projetos), ondas de remoção | V-04 |
| FR-005 | Suíte ≤ 60 s, verify ≤ 120 s; medir e propor se inviável | Anexo A (E1-E9), TD-008, TD-009, DQ-002 | medição e proposta 90 s / 180 s | V-05 |
| FR-006 | Teste de código removido sai junto; lista para aprovar | Anexo B, TD-010 | lista aprovada e ondas | V-06 |
| FR-007 | Texto localizado PT+EN, não vazio após trim | §5.1 | `src/content/schema/localized.ts` | V-07 |
| FR-008 | Data: ano de 4 dígitos, mês opcional 1-12 | §5.2 | `src/content/schema/date.ts` | V-08 |
| FR-009 | Imagem: caminho, alt PT/EN, largura/altura inteiras, arquivo existe | §5.3 | `schema/image.ts` + checagem de arquivo no validador | V-09 |
| FR-010 | Link: `https`, `/caminho`, `mailto:`; recusa o resto | §5.4 | `schema/link.ts` | V-10 |
| FR-011 | Etiqueta: id `[a-z0-9-]`, rótulo localizado, id único no conjunto | §5.5 | `schema/tag.ts` | V-11 |
| FR-012 | Violação falha verificação **e** geração do site, com arquivo, campo, motivo | §6.2, TD-003 | `scripts/contentValidator.ts` + `scripts/contentGuard.ts` (plugin do Vite) | V-12 |
| FR-013 | Formatar data; expor se a ordem é indeterminada | §5.2, TD-012 | `src/content/dates.ts` | V-13 |
| FR-014 | Chave só em um idioma falha, nomeando chave e idioma | §6.3, TD-004 | `scripts/parity.ts`, `src/i18n/parity.test.ts` | V-14 |
| FR-015 | Nunca mostrar chave crua nem texto do outro idioma | TD-005, L-004, DQ-006 | `src/content/pick.ts` + teste-guarda | V-15 |
| FR-016 | Varredura de segredos (arquivo rastreado e variável pública) | §6.4, §7, TD-011 | `scripts/secretScan.ts`, `scripts/secretGuard.ts` | V-16 |
| FR-017 | CI: Won't nesta spec | §3 (não-escopo) | nenhum; não se cria `.github/workflows` | V-17 |
| FR-018 | Nota de 0,5 a 5 em passos de 0,5; ausente = sem nota, nunca 0 (requirements v1.3, L-012) | §5.6 | `src/content/schema/rating.ts` | V-21 |
| v1.3 (L-001 a L-005, L-007, L-008) | Caminho de imagem local (FR-009); `mailto:` com parâmetros, `https` com credenciais e `/\host` recusados (FR-010); hífen só entre partes (FR-011); FR-015 testável; segredo em "variável exposta ao navegador", com `VITE_*` e as 3 do EmailJS definidos aqui (§7, TD-011); suíte três vezes seguidas (FR-004); validação e varredura **dentro** das etapas de testes e geração (FR-001) | §5.3, §5.4, §5.5, TD-005, TD-011, §6.1, V-04 | schemas já previstos; sem arquivo novo além do `rating.ts` | V-22, V-04, V-15, V-16 |
| NFR-001 | Tempo da suíte e do verify; validação ≤ 5 s com 200 itens; tempo registrado | TD-008, TD-009, TD-006 | `.verify/times.jsonl`; teste de carga do validador | V-05, V-18 |
| NFR-002 | Sem segredo no repo ou em `VITE_*`; dados de teste sem credencial; `audit` = 0 | §7, TD-011 | varredura; `npm audit` | V-16, V-19 |
| NFR-003 | N/A (sem UI); alt PT/EN na camada de dados | §5.3 | `schema/image.ts` | V-09 |

## 3. Escopo do design
**Entra:** runner de verificação; as cinco primitivas, o validador, a paridade, a varredura de segredos; velocidade e saúde da suíte; remoção do Anexo B; ajuste mínimo de configuração (`.prettierrc`, `.prettierignore`, `.gitignore`, `vite.config.ts`, `package.json`, `netlify.toml`).
**Não entra:** schemas de projeto, filme, livro, diário (specs donas); migração do conteúdo (003); identidade, casca, temas, rotas por idioma (002); CI (010); atualizar majors (steering); medir desempenho de página.

## 4. Architecture
### 4.1 Mapa de arquivos (novos e alterados)
```
package.json                 scripts: verify, lint (--max-warnings 0), format:check, content:check; devDep: zod
vite.config.ts               plugins: + contentGuard, + secretGuard; - assistantContext; test: pool vmThreads + projetos
scripts/
  verify.mjs                 runner (Node, sem shell)            [novo]
  contentValidator.ts        valida o registro, devolve problemas [novo]
  contentGuard.ts            plugin do Vite (falha o build)       [novo]
  parity.ts                  diffKeys(árvoreA, árvoreB)           [novo]
  secretScan.ts              padrões, arquivos, env, bundle       [novo]
  secretGuard.ts             plugin do Vite                       [novo]
  *.test.ts                  um teste por arquivo acima           [novos]
src/content/
  schema/{localized,date,image,link,tag,index}.ts   zod; só scripts e testes importam (types: `import type`)
  dates.ts                   formatDate, compareDates (puro, vai ao navegador)
  pick.ts                    pick(localized, lang), sem reserva (vai ao navegador)
  registry.ts                lista explícita {arquivo, schema, dados}
  __fixtures__/              exemplos marcados como exemplo (nunca dado da Duda)
src/i18n/parity.test.ts      paridade de `ui` e das árvores por idioma ainda existentes
.prettierrc / .prettierignore / .gitignore    ver TD-007, TD-006
```
`src/utils/projectDate.ts` e os `.tsx` de dados atuais **ficam** até a 003 migrar (P-Q-001: a spec dona substitui no lugar). Eles têm `ReactNode` no conteúdo e `MM/AAAA` no formato; as primitivas novas são mais estritas e a 003 cuida da troca.

### 4.2 Fluxo
```
             npm run verify  (scripts/verify.mjs, node + bin de cada ferramenta, sem shell)
 [1] prettier --check .   [2] eslint . --max-warnings 0   [3] tsc --noEmit   [4] vitest run   [5] vite build
                                                                  |                               |
   etapa 4 inclui (como testes, projeto "unit"):                  |   etapa 5: plugins do Vite no `buildStart`
   - schema/*.test.ts (tabelas do requirements)                   |   - contentGuard  -> validateAll(registry)
   - contentValidator.test.ts, registry.test.ts (conteúdo real)   |   - secretGuard   -> env público + bundle
   - parity.test.ts, secretScan.test.ts (arquivos rastreados)     |   (mesma lógica, mesmos módulos das etapas de teste)
```
O Netlify roda `npm run build` (`tsc --noEmit && vite build`). Como os guardas são plugins do Vite, **um conteúdo inválido ou um segredo no bundle também derruba o deploy**, sem depender do `verify`.

### 4.3 Camadas e fronteiras
- **Dado:** `src/content/schema/*` define a regra uma vez; o tipo TypeScript sai do schema (`z.infer`), não é escrito à mão em paralelo.
- **Runtime do site:** só `dates.ts`, `pick.ts` e `import type` do schema. O zod **não entra no bundle do navegador** (é `devDependency` e só os scripts e testes o importam; confere-se no passo 5 do `verify` com `grep` no `dist/`, V-20).
- **Node (build e teste):** validador, paridade, varredura. Podem ler disco e `git`; o navegador nunca vê isso.

### 4.4 Reaproveitar ou reescrever (investigação 3)
| Existente | Decisão | Motivo |
| --- | --- | --- |
| `netlify/assistant/secrets.test.ts` | **Reescrever** como `scripts/secretScan.*`, aproveitando a ideia (percorrer arquivos + padrão `AIza…`) | Cobre um padrão só (Gemini), uma lista fixa de pastas (`src`, `netlify`, `scripts`, `docs`), e **mora na pasta do assistente que será apagada**. Dos 4 testes, 2 são genéricos (repositório inteiro, `dist/`) e **sobrevivem na varredura nova**; 2 são do assistente (`GEMINI_API_KEY` no navegador, no `netlify.toml`) e morrem com ele. **Resposta à pergunta:** sim, o assistente é dono de um teste de segredos que precisa sobreviver; o novo entra e passa antes de ele ser apagado |
| `scripts/personalGuard.ts` (+ teste) | **Manter como está; usar como molde** | Não é varredura de segredos: é a trava "dado fictício não vai à produção" do `/pessoal` (CL-14), dona da spec 008. O formato (função pura `assert…` + plugin `apply: 'build'` + `configResolved` + teste da função) é o que `contentGuard` e `secretGuard` copiam |
| `scripts/envExample.test.ts` | **Manter; dono é o `/pessoal` (008)** | Confere o `.env.example` do espaço cultural (variável secreta vazia, sem `VITE_`, descrição acima). A regra "nome com `VITE_` não sugere segredo" é reaproveitada em `secretScan` para variáveis do build, em código novo |
| `scripts/status.mjs` | **Não tocar** | É o gate SDD (fora do `verify`); ver DQ-009 sobre o Prettier |
| validação de conteúdo | **Escrever do zero** | Não existe: só testes pontuais de dado (`projects.test.ts` etc.) e `validateContact.ts` (formulário). `utils/projectDate.ts` ordena com "sem mês depois", que contradiz o FR-013 (ordem indeterminada) |
| paridade | **Escrever do zero** | Só `term.nav` (`deadCode.test.ts`) e checagens de persona/Caderno têm algo; não há teste global. A `ui` está em paridade hoje (E13: 425 folhas dos dois lados) |

## 5. Data Model
Regra que cabe no dado fica no schema, não no componente. Todos os campos são dado simples (texto, número, objeto): nada de `ReactNode`, `Date` ou função. A lista de idiomas (`pt`, `en`) vive num lugar só (`Lang` em `src/types.ts`) e o schema e a paridade leem dali.

### 5.1 Texto localizado (`LocalizedText`) — FR-007
| Campo | Tipo | Regra | Motivo do erro (PT) |
| --- | --- | --- | --- |
| `pt` | texto | obrigatório; não vazio depois de `trim` **e de remover espaços invisíveis** (`U+200B`-`U+200D`, `U+FEFF`) | `texto ausente` · `texto vazio (só espaços)` · `esperado texto, recebido número` |
| `en` | texto | idem | idem |
| qualquer outra chave | n/a | **recusada** | `idioma não suportado "de" (aceitos: pt, en)` |
Casos: `{pt:"Olá", en:"Hello"}` válido; `{pt:"Olá"}` erro `en`; `{pt:"  ", en:"Hello"}` erro `pt`.

### 5.2 Data (`ContentDate`) — FR-008, FR-013
| Campo | Tipo | Regra | Motivo do erro |
| --- | --- | --- | --- |
| `year` | inteiro | obrigatório; **1000 a 9999** (4 dígitos); não aceita texto (`"2025"`), decimal nem `null` | `ano ausente` · `ano não é inteiro` · `ano sem 4 dígitos (recebido 25)` |
| `month` | inteiro | opcional (ausente = não confirmado); se existir, **1 a 12**; `null` é recusado | `mês fora de 1 a 12 (recebido 13)` · `mês não é inteiro` |

**Exibição (runtime, `src/content/dates.ts`, sem Intl):** tabela fixa, em minúsculas, no formato `mês/ano`, para não depender da versão do ICU do Windows ou do Linux (o `Intl` de EN muda `sep`/`sept` entre versões).
| Idioma | Meses 1 a 12 |
| --- | --- |
| PT | jan fev mar abr mai jun jul ago set out nov dez |
| EN | jan feb mar apr may jun jul aug sep oct nov dec |
- `formatDate({year:2025}, lang)` → `2025`. `formatDate({year:2025, month:3}, 'pt')` → `mar/2025`. Nunca se supõe mês.
- `compareDates(a, b)` devolve `'a-antes' | 'b-antes' | 'indeterminada'`: anos diferentes → determinada pelo ano; mesmo ano com os dois meses e meses diferentes → determinada; mesmo ano com algum mês ausente **ou** meses iguais → `indeterminada`. Cobre a tabela "Exibição de data" do requirements (5 linhas).
- **Não faz parte desta spec:** ordenar listas. A ordem total de uma lista com itens indeterminados não é única (2025-03, 2025, 2025-07: o item sem mês não se compara com nenhum); quem ordena (003, 005) usa `compareDates` e decide como mostrar o par indeterminado.

### 5.3 Imagem (`Image`) — FR-009, NFR-003
| Campo | Tipo | Regra | Motivo do erro |
| --- | --- | --- | --- |
| `path` | texto | começa com `/`, **sem `..`, sem `\`, sem `//` inicial**; extensão `png jpg jpeg webp avif svg`; resolve para `public/<path>` | `caminho inválido: deve ser local, começar com "/" e não conter ".."` · `imagem externa não é aceita (sem hotlink)` (L-001) |
| `path` (arquivo) | n/a | o arquivo **existe** em `public/<path>` e o caminho resolvido **fica dentro de `public/`** | `arquivo não encontrado: /assets/x.png (procurado em public/assets/x.png)` |
| `alt` | `LocalizedText` | PT e EN obrigatórios e não vazios | `texto alternativo em "en" vazio` |
| `width`, `height` | inteiro | positivos; sem decimal | `largura não é inteiro positivo (recebido 12.5)` · `altura não é inteiro positivo (recebido 0)` |
A checagem do arquivo precisa de disco, por isso vive no validador (`scripts/contentValidator.ts`), que recebe a raiz do `public/`; o schema puro só valida forma. Imagem decorativa (sem texto alternativo) **não usa esta primitiva**: o FR-009 não prevê alt vazio.

### 5.4 Link (`Link`) — FR-010
Um texto que precisa ser **um** destes formatos (análise por `new URL` no caso do `https`, nunca por regex solta):
| Formato | Regra | Exemplos válidos |
| --- | --- | --- |
| Absoluto `https` | protocolo `https:`, host não vazio, **sem usuário nem senha** (`https://a:b@x`) | `https://exemplo.com/a` |
| Caminho interno | começa com **uma** `/`; o segundo caractere não é `/` nem `\`; sem espaço nem caractere de controle | `/projetos`, `/estudos-de-caso/x#decisoes` |
| E-mail | `mailto:` + endereço `algo@dominio.tld`, **sem `?`** (DQ-005) | `mailto:contato@exemplo.com` |
Recusados, com o motivo: `//exemplo.com/a` (`endereço sem protocolo não é aceito`), `/\exemplo.com` (idem: o navegador o trata como `//`), `http://…` (`precisa de https, recebido http`), `javascript:…`, `tel:…`, `data:…`, `exemplo.com`, `mailto:` (`e-mail ausente`), `mailto:semarroba` (`formato do e-mail inválido`) (`formato não aceito` para o resto).

### 5.5 Etiqueta (`Tag`) e conjunto (`TagSet`) — FR-011
| Campo | Tipo | Regra | Motivo do erro |
| --- | --- | --- | --- |
| `id` | texto | `^[a-z0-9]+(-[a-z0-9]+)*$` (minúsculas ASCII, números, hífen **entre** partes: sem hífen no início, no fim nem duplo — DQ-004) | `identificador "Meu Tema 19" fora do formato (minúsculas, números e hífen)` |
| `label` | `LocalizedText` | PT e EN | como em §5.1 |
| conjunto | lista de `Tag` | `id` **único** no conjunto; lista vazia é válida | `identificador repetido "react" (já usado em tags[0])` |

### 5.6 Nota (`Rating`) — FR-018 (requirements v1.3)
| Campo | Tipo | Regra | Motivo do erro |
| --- | --- | --- | --- |
| `rating` | número, **opcional** | de 0,5 a 5, em **passos de 0,5** (0,5; 1; 1,5; … 5). Ausente = "sem nota": o campo não existe, **nunca** vira 0. Valor 0, fora do intervalo, fora do passo, texto, `NaN` e `Infinity` são recusados | `nota 4,3 fora do passo de 0,5 (valores válidos: 0,5 a 5)` · `nota 0 inválida: sem nota é campo ausente` |
Todo múltiplo de 0,5 é exato em ponto flutuante, então `multipleOf(0.5)` não tem erro de arredondamento. A **exibição** em estrelas (meia estrela) e a **média** de vários critérios (a nota de um projeto, que não cai em passos de 0,5) são das specs 005 e 008; esta spec só valida a nota informada. Arquivo: `src/content/schema/rating.ts`.

## 6. Interface Contract
### 6.1 `npm run verify`
**Chamada:** `npm run verify` (PowerShell, Git Bash, Linux: o mesmo). Sem opções obrigatórias. `--dry-run` só imprime o plano (as 5 etapas e os comandos) e sai com 0. `--enforce-budget` faz o excesso de tempo falhar (padrão: só avisa).
**Etapas, sempre nesta ordem** (a ordem do steering; as validações de conteúdo e a varredura rodam **dentro** das etapas 4 e 5, não são etapas novas, L-008):
| # | Nome na saída | Comando |
| --- | --- | --- |
| 1 | `formatação` | `prettier --check .` |
| 2 | `lint` | `eslint . --max-warnings 0` |
| 3 | `tipos` | `tsc --noEmit` |
| 4 | `testes` | `vitest run` |
| 5 | `geração` | `vite build` |
**Códigos de saída:** `0` todas passaram · `1` alguma etapa falhou (a execução **para** nela) · `2` erro do próprio runner (ferramenta não encontrada, `node_modules` ausente) · `130` interrompido (Ctrl+C). As etapas seguintes à que falhou **não rodam** (FR-002).
**Saída (exemplo; o texto é o contrato, os tempos variam):**
```
verify [1/5] formatação   prettier --check .
...saída da ferramenta...
verify [1/5] formatação   OK   14,2 s
...
verify [4/5] testes       FALHOU (código 1) após 61,3 s
verify: parou na etapa 4/5 (testes). As etapas 5/5 não rodaram.
verify: FALHOU em 143,0 s
```
```
verify: OK em 148,7 s (orçamento 180 s; execução anterior: 151,0 s)
```
**Registro de tempo (NFR-001):** cada execução acrescenta uma linha em `.verify/times.jsonl` (`{em, sistema, node, etapas:{nome:segundos}, total, ok}`); a pasta entra no `.gitignore`. A saída compara com a execução anterior e avisa `AUMENTO de N %` quando uma etapa piora mais de 25 %. O orçamento (§9, TD-009) só falha com `--enforce-budget`, porque o tempo varia de máquina para máquina.
**Scripts do `package.json`:** `verify` → `node scripts/verify.mjs`; `lint` → `eslint . --max-warnings 0`; `format:check` → `prettier --check .`; `content:check` → `vitest run --project unit src/content scripts/contentValidator.test.ts`; `build` continua `tsc --noEmit && vite build` (é o que a Netlify roda).

### 6.2 Mensagens de erro de conteúdo (FR-012)
Formato fixo, uma linha por problema, em PT, **sempre com arquivo, campo e motivo**; o campo é o caminho dentro do arquivo (`lista[2].capa.alt.en`):
```
conteúdo inválido: <arquivo> › <campo> — <motivo>
```
Exemplos (um por regra do requirements):
```
conteúdo inválido: src/content/tags.content.ts › tags[1].id — identificador repetido "react" (já usado em tags[0])
conteúdo inválido: src/content/exemplo.content.ts › itens[0].capa.path — arquivo não encontrado: /assets/x.png (procurado em public/assets/x.png)
conteúdo inválido: src/content/exemplo.content.ts › itens[3].data.month — mês fora de 1 a 12 (recebido 13)
conteúdo inválido: src/content/exemplo.content.ts › itens[0].link — endereço sem protocolo não é aceito ("//exemplo.com")
conteúdo inválido: src/content/exemplo.content.ts › itens[2].titulo.en — texto ausente
```
Fecho: `N problema(s) em M arquivo(s)`. Mostra todos os problemas até 50 e depois `… mais K`. A verificação e o build **terminam com código ≠ 0** (o teste falha e o plugin lança erro). Arquivo `*.content.ts` sem entrada no registro também é problema: `conteúdo inválido: <arquivo> › (arquivo) — não está registrado em src/content/registry.ts`.

### 6.3 Mensagens de paridade (FR-014)
```
paridade: src/i18n/ui.ts › nav.projects — falta a tradução em "en"
paridade: src/i18n/ui.ts › nav.projects — existe só em "pt"   (quando a chave do outro lado não existe)
paridade: src/i18n/ui.ts › github.title — texto vazio em "en"
paridade: src/i18n/ui.ts › theme.toLight — tipo diferente (texto em "pt", função em "en")
```
Folhas comparadas por caminho; arrays comparam o tamanho e depois cada posição.

### 6.4 Mensagens da varredura de segredos (FR-016)
Nunca imprime o valor: mostra o tipo, o arquivo, a linha e os 4 primeiros caracteres seguidos de `…`.
```
segredo: <arquivo>:<linha> — padrão "chave Google (AIza…)" (início "AIza…"). Remova do arquivo e troque a credencial.
segredo: variável VITE_X_TOKEN — nome de variável pública (VITE_) que sugere segredo; ela iria para o JavaScript do navegador.
segredo: dist/static/index-ab12.js — valor da variável secreta HARDCOVER_API_TOKEN apareceu no bundle.
```

## 7. Security
| Ameaça | Controle | Onde |
| --- | --- | --- |
| Segredo no repositório (princípio 6, FR-016) | Varredura de **todos os arquivos rastreados e novos não ignorados** (`git ls-files -co --exclude-standard -z`), com os padrões: chave Google `AIza[0-9A-Za-z_-]{35}`, token GitHub `gh[pousr]_…{36,}` e `github_pat_…`, AWS `AKIA[0-9A-Z]{16}`, Slack `xox[baprs]-…`, chave privada `-----BEGIN … PRIVATE KEY-----`, JWT de três partes, `sk-…{32,}`, token Netlify `nfp_…`. Ignora binários, `package-lock.json` e arquivos > 1 MB. **Linha de base: 0 ocorrências em 522 arquivos (E12)** | `scripts/secretScan.ts`, teste na etapa 4 |
| Segredo que escorrega para o navegador | Plugin de build: (a) variável `VITE_*` cujo **nome** sugere segredo (`TOKEN\|SECRET\|PASSWORD\|API_?KEY\|PRIVATE\|HOOK`) falha, exceto as três do EmailJS (públicas por natureza do SDK, as mesmas de `SECRETS_SCAN_OMIT_KEYS` do `netlify.toml`); (b) o **valor** de uma variável secreta do ambiente (nome com esses termos, valor ≥ 8 caracteres) dentro do texto do bundle falha; (c) os padrões acima no bundle | `scripts/secretGuard.ts` |
| Link malicioso vindo do conteúdo (`javascript:`, `data:`) | O schema só aceita `https`, caminho interno e `mailto:` simples | §5.4 |
| Redirecionamento aberto (`//host`, `/\host`) | O caminho interno recusa `//` e `/\` | §5.4 |
| Caminho de imagem que sai de `public/` (`..`, `\`) | Recusado no schema **e** conferido de novo ao resolver o caminho no validador (`resolve` precisa ficar dentro de `public/`) | §5.3 |
| Imagem de terceiro por hotlink (princípio 5) | Caminho externo recusado | §5.3, L-001 |
| Execução de código do conteúdo | O conteúdo é código TypeScript **do próprio repositório** importado no build; não há entrada externa nem `eval`. Risco aceito e dito em R-007 | TD-002 |
| Injeção no runner | `spawn` **sem shell**, argumentos fixos no código, nada do ambiente ou da linha de comando é concatenado em comando | TD-006 |
| Segredo no log | O runner repassa a saída das ferramentas e **não imprime variáveis de ambiente**; a varredura mascara o valor | §6.4 |
| Dependência nova | Só o `zod`, já presente no `package-lock.json` (4.6.7, vindo de `eslint-plugin-react-hooks`), declarado como `devDependency`; nada novo em produção; `npm audit --omit=dev` = 0 hoje (E11) | TD-001 |
| Superfície removida | Sair o assistente elimina a Function pública `ask` e a variável `GEMINI_API_KEY` do servidor | Anexo B, G-1 |
**Ação manual fora do repositório (só a Duda pode):** depois da onda 1, apagar `GEMINI_API_KEY` e `GEMINI_MODEL` do painel da Netlify. O design não consegue fazer nem conferir isso.
**Exceções à varredura:** nenhuma hoje. Se um dado de teste precisar de algo com formato de segredo, ele é montado em tempo de execução no teste (`'AIza' + 'x'.repeat(35)`), nunca escrito em arquivo, e o teste é marcado como exemplo; uma exceção em arquivo só com `{arquivo, padrão, motivo}` listados no `secretScan.ts` e aprovados.

## 8. Edge Cases
| # | Caso | Resultado |
| --- | --- | --- |
| EC-01 | Texto só com espaço invisível (`U+200B`) | Erro `texto vazio` (um `trim()` simples não pegaria) |
| EC-02 | Objeto localizado com chave extra (`{pt, en, es}`) ou `{pt, em}` (erro de digitação) | Erro: idioma não suportado; e `en` ausente |
| EC-03 | `month: null`, `year: 2025.5`, `year: 99999` | Erros de §5.2 |
| EC-04 | Imagem: caminho com maiúsculas diferentes do arquivo (`/Assets/X.PNG`) | No Linux o arquivo não existe, no Windows existe. O validador compara o **nome exato** listando o diretório, então o erro aparece nos dois sistemas |
| EC-05 | Imagem: `width` declarado diferente do real | **Não** detectado (o FR-009 não pede; DQ-008) |
| EC-06 | Link `HTTPS://Exemplo.com` | Aceito (o `URL` normaliza o protocolo); a validação **não** reescreve o texto |
| EC-07 | Link `/projetos?x=1#a` | Válido; `/` sozinho é válido |
| EC-08 | Etiqueta `React` (maiúscula), `réact`, `react_19`, `-x`, `a--b` | Erro de formato |
| EC-09 | Etiquetas em dois arquivos diferentes com o mesmo `id` | A unicidade é **por conjunto**; dois conjuntos independentes não colidem. A spec dona decide se há um conjunto global (a 003/005) |
| EC-10 | Arquivo `*.content.ts` novo esquecido no registro | Problema de verificação, não passa em silêncio |
| EC-11 | Registro vazio / lista de itens vazia | Válido (FAQ do requirements) |
| EC-12 | Chave de `ui` com função num idioma e texto no outro | Erro de tipo diferente (§6.3) |
| EC-13 | EN idêntico ao PT (nomes próprios como "GitHub") | **Não** é erro; 18 casos hoje (E13). Detectar tradução copiada não é possível sem lista de exceções |
| EC-14 | `git` ausente na máquina que roda a varredura | A varredura percorre o disco (ignorando `node_modules`, `dist`, `.git`, `.verify`) e avisa `git não encontrado, varredura pelo disco`; não passa em silêncio |
| EC-15 | `verify` sem `node_modules` | Código `2` com a mensagem `rode npm ci antes`, sem despejar pilha |
| EC-16 | Windows, CRLF nos arquivos | Prettier com `endOfLine: auto` não reclama; a varredura lê CRLF e LF |
| EC-17 | Duas execuções do `verify` ao mesmo tempo | Cada uma anexa uma linha em `times.jsonl` (append); as saídas se misturam no terminal, mas o resultado de cada uma é independente. Os tempos dessas execuções não valem como medição |
| EC-18 | Ctrl+C no meio de uma etapa | O runner repassa o sinal ao filho, não imprime "OK", sai com 130 |
| EC-19 | `vmThreads` e módulos com estado global (localStorage etc.) | O `setup.ts` já limpa `localStorage` e `sessionStorage` a cada teste; a execução E5 (duas vezes, 0 falhas) é a evidência; R-001 cobre o resto |

## 9. Technical Decisions
### TD-001: Biblioteca de validação de schemas
**Decisão:** `zod` 4, como `devDependency` explícita (`^4`).
**Alternativas:** (a) **funções próprias** (~150 linhas para cinco primitivas): zero dependência, mas o tipo TypeScript e a regra são duas coisas escritas à mão que podem divergir, e cada spec dona (003 em diante) reescreveria combinadores (lista, opcional, objeto estrito, caminho do erro); (b) **valibot** 1.x: mais leve, mas não está no projeto e é outra dependência nova; (c) `ajv` + JSON Schema: bom para JSON, ruim para tipos e para mensagens em PT.
**Motivo:** o steering pede poucas dependências, e esta **não é nova**: o `package-lock.json` já traz `zod@4.6.7` (de `eslint-plugin-react-hooks`), e ela só existe em desenvolvimento (não vai ao bundle). O ganho que decide é **um schema = regra + tipo** (`z.infer`), o que cumpre "regra no dado". Custo: declarar a dependência (`npm install -D zod@^4`, precisa de aprovação, DQ-003) e escrever o conversor de erro para o formato de §6.2 (as mensagens padrão do zod são em inglês).

### TD-002: Formato e lugar do conteúdo
**Decisão:** módulos TypeScript de **dados puros** em `src/content/**/*.content.ts` (sufixo obrigatório), exportando constantes tipadas pelo schema; **sem JSX, sem função, sem `import` além de outros arquivos de conteúdo e `import type`**. Um **registro explícito** (`src/content/registry.ts`) liga cada arquivo ao seu schema; um teste confere que todo `*.content.ts` do disco está no registro e vice-versa.
**Alternativas:** (a) **JSON**: o campo "arquivo" do erro seria exato e não há código, mas não aceita comentário (a Duda anota a origem de uma data confirmada), exige `resolveJsonModule`, e o tipo vem só do schema, sem erro de digitação no editor; (b) **Markdown/YAML** com front matter: ótimo para estudo de caso longo (spec 006 decide), mas pede um parser (dependência) e não serve às primitivas; (c) manter `.tsx` com `ReactNode`: é o que há hoje (`projects.tsx`), mas mistura conteúdo e interface, impede validar o texto e quebra o princípio 1.
**Motivo:** `tsc` (etapa 3) já acusa campo errado enquanto ela digita; comentários guardam a procedência; o padrão é o dos `src/data/*.ts` atuais, o que facilita a 003. O registro explícito (em vez de `import.meta.glob`) funciona **dentro do `vite.config.ts`**, que é empacotado pelo esbuild e importa TypeScript estaticamente, como o `personalGuard.ts` já faz (um `glob` só existe em módulos que o Vite transforma).

### TD-003: Um validador, dois chamadores
**Decisão:** `scripts/contentValidator.ts` é a única implementação; é chamada por (1) `registry.test.ts` e `contentValidator.test.ts` na etapa 4 e (2) o plugin `contentGuard` no `buildStart` do `vite build`. A validação **não roda no navegador**.
**Alternativas:** só como teste (o Netlify roda `npm run build`, não `vitest`; um conteúdo inválido iria ao ar); só como plugin (o teste unitário de cada regra fica indireto); script Node avulso com `tsx` (dependência nova e Node 20 não executa TypeScript sem ela).
**Motivo:** o FR-012 exige que **a geração do site** falhe; o plugin é o único ponto que o deploy atravessa. O teste dá a mensagem boa no `verify` e a cobertura de cada regra.

### TD-004: Mecanismo de paridade de tradução
**Decisão:** `scripts/parity.ts` compara os **caminhos das folhas** de duas árvores e devolve o que falta de cada lado, o que está vazio e o que tem tipo diferente. `src/i18n/parity.test.ts` o aplica a `ui.pt` × `ui.en` e às árvores por idioma ainda existentes (`portfolio`, `resume`, `services`, `projects[].pt/en`, lista fechada que a 003 esvazia). Em conteúdo novo a paridade é **estrutural**: `LocalizedText` exige `pt` e `en`, e o validador acusa a falta (FR-007).
**Alternativas:** (a) só o sistema de tipos (`satisfies`): pega chave faltando, mas não texto vazio, e a mensagem não diz "chave e idioma"; (b) biblioteca de i18n com verificação própria (ICU, `i18next`): dependência grande para 2 idiomas; (c) script separado fora do Vitest: mais um comando para lembrar.
**Motivo:** pequeno (~40 linhas), roda no `verify`, cobre vazio e tipo, nasce verde (E13) e dá a mensagem exata do FR-014.

### TD-005: "Sem texto de reserva" (FR-015)
**Decisão:** (1) `pick(localized, lang)` devolve **só** `localized[lang]` e **lança erro** se faltar (nunca devolve o outro idioma nem a chave); (2) como o build recusa conteúdo e `ui` sem as duas línguas, a falta é **impossível em produção por construção**; (3) um teste-guarda procura em `src/content/` e `src/i18n/` os padrões `\.(pt|en)\b\s*(\?\?|\|\|)` e `\[lang\]\s*(\?\?|\|\|)\s*[^'"\s]` (reserva para outro idioma ou para id) e falha se achar.
**Alternativas:** guarda sobre todo o `src/` (hoje acusaria 5 pontos que usam `id` cru como reserva, ver DQ-006); verificação visual (não é testável).
**Motivo:** o FR diz "em produção"; o que se pode provar é que o dado não falta (build) e que o código novo não inventa reserva. Os 5 pontos antigos (`terminal/commands.tsx:206` e `extras/neofetch.tsx:34` de tema, `extras/personalView.tsx:34` e `paletteItems.ts:139` de rota, `data/routes.ts:360`) estão em código que a 002 substitui (temas, rotas); a DQ-006 pergunta se se corrige antes.

### TD-006: Como o `verify` roda igual em PowerShell, Git Bash e Linux
**Decisão:** `scripts/verify.mjs` (Node ≥ 20.19, o `engines` do projeto) executa cada etapa com `child_process.spawn(process.execPath, [binDaFerramenta, ...args], { stdio: 'inherit', shell: false })`. O `binDaFerramenta` é resolvido por `createRequire(...).resolve` a partir do `package.json` de cada pacote (`prettier/bin/prettier.cjs`, `eslint/bin/eslint.js`, `typescript/bin/tsc`, `vitest/vitest.mjs`, `vite/bin/vite.js`; os cinco existem hoje). Tempo por etapa com `performance.now()`, registro em `.verify/times.jsonl`.
**Alternativas:** (a) **`"verify": "prettier --check . && eslint . ... && vite build"`** no `package.json`: o `&&` funciona no `cmd.exe` (que o npm usa no Windows) e no Linux, mas não dá nome da etapa, nem tempo, nem registro, e a mensagem de falha seria a do `npm`; (b) `npm-run-all`/`concurrently`: dependência nova e roda em paralelo, o que contraria a ordem e a parada do FR-002; (c) script `.sh`/`.ps1`: um por sistema, é o que o Constraint proíbe; (d) `spawn('npx', …, { shell: true })`: no Windows o `npx.cmd` exige shell (desde o Node 20.12 recusa `.cmd` sem ele) e o shell muda o quoting entre PowerShell e Git Bash.
**Motivo:** sem shell e sem `.cmd`, não existe diferença entre os ambientes: o mesmo `node` executa o mesmo `.js`. Caminhos com `path`, sem `/` fixa, sem `rm`/`cp`.

### TD-007: Formatação (Prettier): escopo e fim de linha
**Decisão:** (1) `.prettierrc` ganha `"endOfLine": "auto"` (mantém o fim de linha de cada arquivo: o Windows com `autocrlf` e o Linux passam igual); (2) `.prettierignore` ganha `docs`, `.ai`, `.claude`, `*.md`, `public`, `.verify`, `test-results`, `playwright-report` e `scripts/status.mjs` (script do gate SDD, escrito sem ponto e vírgula de propósito; DQ-009); (3) **um único `prettier --write` em um commit só de formatação, depois das ondas de remoção** (o código que sai não precisa ser formatado: 22 dos 33 arquivos de código fora do formato estão no Anexo B); (4) `.gitattributes` com `* text=auto`.
**Alternativas:** (a) `endOfLine: "lf"` + `.gitattributes eol=lf` + `git add --renormalize .`: o mais "limpo", mas reescreve o fim de linha da árvore inteira de uma vez, com o trabalho da Duda em andamento; (b) `prettier --check` só em `src/`: esconde o `scripts/` e o `netlify/`, que também têm código; (c) deixar o passo 1 vermelho: o `verify` nunca passaria.
**Motivo:** menor mudança que torna o passo 1 verde nos dois sistemas e deixa a regra clara (código e configuração são checados; documentação, não).

### TD-008: Velocidade e saúde da suíte
**Decisão:** em `vite.config.ts`: (1) `test.pool: 'vmThreads'` (E5: 112 s e 91 s, 0 falhas, contra 322 s e 10 falhas); (2) **dois projetos do Vitest**: `unit` (ambiente `node`, `**/*.test.ts`, sem o `setup.ts` de DOM; arquivo que precise de DOM declara `// @vitest-environment jsdom`) e `dom` (jsdom, `**/*.test.tsx`, com `setup.ts`); (3) **dividir `terminal/sections.test.tsx`** (65 s, 52 testes) em 2 ou 3 arquivos por página, sem mudar nenhum caso; (4) manter `testTimeout: 20000` e `asyncUtilTimeout: 5000`, mas **não aumentar** mais: falha por tempo esgotado vira investigação, não folga; (5) depois da remoção, medir de novo e registrar.
**Alternativas medidas:** `--maxWorkers=4` (0 falhas, mas 320 s: não melhora o tempo, E3); `--no-isolate` (215 s, **19 falhas**: estado compartilhado, E4); aumentar timeouts (esconde, não resolve); mockar a casca nos testes de página (reescrita grande, fora do escopo "não reescrever a suíte antiga").
**Motivo:** a medição manda: 52 % do tempo era criar jsdom por arquivo (vmThreads o cria uma vez por worker, mantendo o isolamento por arquivo) e um arquivo é 19 % do trabalho. O projeto `unit` é uma estimativa (E6): precisa de medição na tarefa.

### TD-009: Orçamentos de tempo (D-001, FR-005) — **proposta para a Duda aprovar**
| Medida | Meta do requirements | Medido hoje (sozinho) | Estimativa pós-limpeza | **Proposta (orçamento)** | Esforço (meta) |
| --- | --- | --- | --- | --- | --- |
| Suíte | 60 s | 322 s (padrão) · 91-112 s (`vmThreads`) | 65-80 s; 50-60 s com projeto `unit` + divisão de `sections` | **≤ 90 s** | 60 s |
| `verify` | 120 s | ~220 s (19+55+32+~100+14) | ~150 s (15+40+25+60+12) | **≤ 180 s** | 120 s, só se lint e tipos caírem |
**Motivo:** as etapas são sequenciais por exigência (US-002, FR-002), então o `verify` é a soma; só 100 % do corte no lint (55 s) e nos tipos (32 s) chegaria a 120 s, e isso é trabalho fora do escopo. A folga de 90 s sobre ~65-80 s cobre a variação medida entre execuções (91 a 112 s hoje). A tarefa final mede 3 vezes e a Duda confirma o número; se a medição ficar abaixo de 60 s e 120 s, os números originais voltam a ser o orçamento.
**Condição de medição declarada:** a máquina da Duda (notebook i7-1355U, 17 GB), sem outro comando do projeto rodando, VS Code aberto e ocioso (L-006).

### TD-010: Remoção do código fora do MVP em ondas
**Decisão:** quatro ondas (assistente, jogos, trilhas, personas), cada uma com o gate `tsc --noEmit` + `vite build` + `vitest run` verdes e um commit; **desacoplar primeiro, apagar depois**; teste que cobre código removido sai junto e entra na lista do commit; teste misto é **editado** (só os casos do código removido saem); nunca `skip`/`todo`/`xit`. A lista é a do Anexo B e só é executada depois de a Duda aprová-la **e** de o `tasks.md` ser aprovado.
**Alternativas:** remover tudo de uma vez (um commit de ~80 arquivos que quebra em vários lugares e não se bisecciona); cada spec remover o que substitui (D-004 já recusou: a suíte não fecha); só desligar por flag (mantém o código morto e o tempo de teste).
**Motivo:** a ordem vai do menos ao mais acoplado (assistente e jogos quase sem ligação; personas por último, na casca, na home e no terminal), o que mantém cada passo pequeno e reversível. O FR-006 manda listar, e o Anexo B lista arquivo a arquivo com quem importa.

### TD-011: Varredura de segredos
**Decisão:** `scripts/secretScan.ts` (padrões e leitura) + `scripts/secretGuard.ts` (plugin) + `scripts/secretScan.test.ts`. A varredura de arquivos roda como **teste** na etapa 4 (a etapa que o requirements permite) e o plugin cobre o bundle e as variáveis públicas na etapa 5. Padrões e exceções em §7. O teste de aceite planta uma credencial montada em tempo de execução em um arquivo temporário (`os.tmpdir`) e confere que ela é achada, que a saída está mascarada e que sem ela passa.
**Alternativas:** `gitleaks`/`trufflehog` (binários externos, não portáveis entre os três ambientes, instalação por fora do `npm`); `secretlint` (dependência nova com dezenas de regras que a Duda não precisa); confiar no "secrets scanning" da Netlify (só no deploy, depois do `push`, e já tem `SECRETS_SCAN_OMIT_KEYS` para o EmailJS).
**Motivo:** poucos padrões conhecidos, já testáveis, sem dependência nova, na mesma etapa do `verify`. `npm audit` (NFR-002) fica **fora do `verify`** porque precisa de rede e falharia offline; é um comando da tarefa final (V-19).

### TD-012: Datas, funções puras e tabela fixa de meses
**Decisão:** §5.2: `formatDate` e `compareDates` em `src/content/dates.ts`, sem `Intl`, tabela de meses PT e EN em minúsculas, `mês/ano`. `utils/projectDate.ts` fica até a 003.
**Alternativas:** `Intl.DateTimeFormat` (resultado depende do ICU: `sep` × `sept`, e o Node do Netlify é outro); manter `MM/AAAA` (é o formato de hoje, mas o requirements mostra `mar/2025`).
**Motivo:** o mesmo texto no Windows, no Linux e no Netlify, e igual à tabela do requirements.

## 10. Verification Strategy
Cada FR vira pelo menos um teste automatizado ou um comando com exit code. Comando exato, o que prova.
| ID | Prova | Comando (exato) | Esperado |
| --- | --- | --- | --- |
| V-01 (FR-001) | As 5 etapas, na ordem | `npx vitest run scripts/verify.test.ts -t "ordem"` (etapas falsas com `node -e`) e `node scripts/verify.mjs --dry-run` | exit 0; a ordem `formatação, lint, tipos, testes, geração` |
| V-02 (FR-002) | Para na primeira falha, nomeia a etapa | `npx vitest run scripts/verify.test.ts -t "falha"` | exit 0 do teste; o runner sai 1 e não roda a etapa seguinte |
| V-03 (FR-003) | Sucesso sai com 0 | `npm run verify` (real) em PowerShell, em Git Bash e num clone limpo no WSL (`git clone . ~/p && cd ~/p && npm ci && npm run verify`; DQ-011) | exit 0 nos três; `.verify/times.jsonl` com `ok:true` |
| V-04 (FR-004) | Suíte sem falha, estável | `npm test` três vezes seguidas | exit 0 nas três; 0 falhas |
| V-05 (FR-005, NFR-001) | Tempo | `npm run verify` três vezes; ler `.verify/times.jsonl` | suíte ≤ orçamento aprovado, `verify` ≤ orçamento aprovado, em todas |
| V-06 (FR-006) | Nada do Anexo B sobrou e nada foi silenciado | `git grep -n -E "usePersona\|TrailProvider\|GameCenter\|netlify/assistant\|assistantContext\|pergunte\|emitTrailEvent" -- src scripts netlify vite.config.ts package.json netlify.toml` e `git grep -n -E "\b(it\|test\|describe)\.(skip\|todo)\|\bxit\b\|\bxdescribe\b" -- src scripts netlify` e `git grep -n -E "/r/|/jogos|/games|/trilha|/trail|persona|GameCenter" -- e2e public README.md docs index.html` (a varredura estendida a `e2e/`, `public/`, `README.md` e `docs/`, que pega redirecionamentos e sitemap de `/r/<persona>` e `/jogos`; qualquer ocorrência legítima, como um registro histórico, entra numa lista de exceções com motivo no commit da onda) | os três com **exit 1** (nenhuma linha); depois `npx tsc --noEmit`, `npx vite build`, `npx vitest run` exit 0 |
| V-07 (FR-007) | Tabela de texto localizado | `npx vitest run src/content/schema/localized.test.ts` | 3 linhas do requirements + espaço invisível, chave extra, não texto |
| V-08 (FR-008) | Tabela de data | `npx vitest run src/content/schema/date.test.ts` | 6 linhas do requirements + `null`, decimal, 5 dígitos |
| V-09 (FR-009, NFR-003) | Tabela de imagem, com arquivo real em pasta temporária | `npx vitest run src/content/schema/image.test.ts scripts/contentValidator.test.ts -t "imagem"` | `alt` EN vazio, largura 0 e 12,5, arquivo inexistente, `..`, caminho externo, diferença de maiúscula |
| V-10 (FR-010) | Tabela de link | `npx vitest run src/content/schema/link.test.ts` | as 9 linhas do requirements + `/\host`, `https://a:b@x`, `data:` |
| V-11 (FR-011) | Tabela de etiqueta | `npx vitest run src/content/schema/tag.test.ts` | `react-19` válida; `Meu Tema 19` e repetição falham |
| V-12 (FR-012, US-001) | Mensagem com arquivo, campo e motivo; o build também falha | `npx vitest run scripts/contentValidator.test.ts` e `npx vitest run scripts/contentGuard.test.ts` | o teste compara a **linha inteira** do §6.2; o plugin lança erro com a mesma mensagem |
| V-13 (FR-013) | Exibição e ordem | `npx vitest run src/content/dates.test.ts` | as 5 linhas da tabela "Exibição de data" em PT e EN |
| V-14 (FR-014, US-003) | Paridade | `npx vitest run src/i18n/parity.test.ts` | `ui` verde (425 folhas); árvore de teste sem uma chave EN falha nomeando a chave e `"en"` |
| V-15 (FR-015) | Sem reserva | `npx vitest run src/content/pick.test.ts` | `pick` lança erro se faltar o idioma; o guarda não acha `?? id`/`.pt ??` em `src/content` e `src/i18n` |
| V-16 (FR-016, NFR-002) | Achar e passar | `npx vitest run scripts/secretScan.test.ts` | credencial plantada **achada** (mascarada); sem ela, passa; `VITE_X_TOKEN` falha; EmailJS passa |
| V-17 (FR-017) | CI fora | `git ls-files .github` | exit 0 e saída vazia |
| V-18 (NFR-001) | Validação ≤ 5 s com 200 itens de cada tipo | `npx vitest run scripts/contentValidator.test.ts -t "carga"` | exit 0; o teste falha se passar de 5 s |
| V-19 (NFR-002) | Produção sem vulnerabilidade | `npm audit --omit=dev` | exit 0, `found 0 vulnerabilities` |
| V-20 (§4.3) | O zod não vai ao navegador | `grep -r -l "ZodError\|zod" dist/static` (Git Bash) após o build | exit 1 (nenhuma ocorrência) |
| V-21 (FR-018) | Tabela da nota | `npx vitest run src/content/schema/rating.test.ts` | `0,5`, `1`, `4,5`, `5` e ausente válidos; `0`, `0,25`, `4,3`, `5,5`, `-1`, `"4,5"`, `NaN` e `Infinity` recusados com a mensagem da §5.6; ausente nunca vira 0 |
| V-22 (v1.3: FR-009, FR-010, FR-011, FR-015) | Linhas novas das tabelas | `npx vitest run src/content/schema/image.test.ts src/content/schema/link.test.ts src/content/schema/tag.test.ts src/content/pick.test.ts` | caminho externo de imagem, `mailto:` com `?subject=`, `https://a:b@x`, `/\host`, `-react`, `react-`, `react--19` recusados; nenhuma função de leitura devolve chave nem outro idioma |
Bloco de evidência de cada tarefa: Claim, Command, Exit code, Summary, Verdict.

## 11. Riscos e Mitigações
| ID | Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R-001 | `vmThreads` tem vazamento de memória e problemas de `instanceof` entre contextos | Média | Médio | Duas execuções verdes (E5); medir a memória na tarefa; se um teste quebrar, `pool: 'forks'` com `isolate` mantido é o plano B (mais lento) |
| R-002 | O projeto em pasta do OneDrive deixa a E/S lenta (lint 55 s, tipos 32 s) | Média | Médio | Não isolado nas medições; medir uma cópia fora do OneDrive na tarefa de medição final. Se o ganho for grande, a Duda decide mover a pasta |
| R-003 | Os testes de página continuam instáveis sob carga mesmo com `vmThreads` | Média | Médio | V-04 exige 3 execuções seguidas verdes; investigar o 1º que falhar, sem aumentar timeout |
| R-004 | Desacoplar personas e trilhas quebra a casca, a home, o terminal ou o SEO | Alta | Alto | Ondas pequenas com o gate inteiro; a lista B diz quem importa; `V-06` por `git grep` |
| R-005 | A remoção some com cobertura útil (testes mistos) | Média | Médio | Teste misto só perde os casos do código removido, listados no commit; o restante permanece |
| R-006 | O formato do Prettier muda 33 arquivos e atrapalha o histórico | Baixa | Baixo | Um commit só de formatação, depois das remoções |
| R-007 | Conteúdo em `.ts` pode conter código arbitrário | Baixa | Baixo | É do próprio repositório; regra de revisão (sem `import` além de conteúdo e `import type`) e o `eslint` com `no-restricted-imports` para `src/content/**/*.content.ts`, na tarefa |
| R-008 | A meta de 60 s não é atingida | Média | Médio | Orçamento 90 s aprovado (D-001); a medição final decide |
| R-009 | Linux não verificado de verdade (CI é da 010) | Média | Médio | O runner não usa shell nem caminho fixo; o clone limpo no WSL (V-03) é a prova disponível sem `push` |
| R-010 | `src.zip` (633 kB, na raiz, não rastreado) pode conter cópia de `src/` e ser comitado por engano | Baixa | Baixo | A varredura ignora binários. **O `src.zip` é um arquivo da Duda e deve ir para o `.gitignore`** (decisão dela, 2026-11-15); a tarefa de configuração da 001 acrescenta a linha. Nenhum agente o apaga nem o comita |
| R-011 | A decisão do Caderno atrasa a onda 4 | Média | Médio | A onda 4 só começa com a DQ-001 respondida; as ondas 1 a 3 não dependem dela |

## 12. Lacunas e propostas de alteração no `requirements.md` (não editei o arquivo; a Duda decide)
| ID | Lacuna | Alteração proposta |
| --- | --- | --- |
| L-001 | FR-009 não diz se o caminho da imagem pode ser externo; o princípio 5 proíbe hotlink | Acrescentar: "o caminho SHALL ser local (começar com `/`); endereço externo é recusado" |
| L-002 | FR-011 diz "minúsculas, números e hífen", mas permite `-x`, `x-` e `a--b` | Acrescentar: "o hífen só separa partes: não pode abrir, fechar nem repetir" (DQ-004) |
| L-003 | FR-010 não trata `mailto:` com `?subject=`, `https` com usuário e senha, nem `/\host` | Acrescentar os três à tabela de links como recusados (DQ-005) |
| L-004 | FR-015 ("em produção, nunca mostrar chave crua nem texto do outro idioma") não é testável como está | Trocar por: "THE SYSTEM SHALL tornar impossível em produção a falta de um idioma (FR-007, FR-012, FR-014) e SHALL NOT devolver, em nenhuma função de leitura de texto localizado, a chave nem o outro idioma" |
| L-005 | FR-016 não define "padrão de segredo" nem "variável exposta ao público" | Definir: padrão = lista do §7; variável pública = nome com prefixo `VITE_`; exceção: as 3 do EmailJS |
| L-006 | NFR-001 diz "sem outros processos pesados", mas o VS Code estava aberto | Trocar por "sem outro comando do projeto rodando"; registrar a máquina |
| L-007 | FR-004 ("nenhum teste falha") não distingue falha fixa de falha por carga; as falhas atuais não se repetem sozinhas | Acrescentar: "a suíte completa passa **três vezes seguidas**" |
| L-008 | FR-001 lista 5 etapas; FR-012 e FR-016 exigem validação e varredura "ao rodar a verificação" | Explicitar: a validação e a varredura rodam **dentro** da etapa de testes e da de geração (§6.1) |
| L-009 | FR-013 diz que se "expõe" a ordem indeterminada, sem API | Ratificar §5.2 (`compareDates`, sem ordenar listas) |
| L-010 | FR-014 fala em "conteúdo", mas o conteúdo atual está em árvores por idioma (`portfolio[lang]`), não em `LocalizedText` | Ratificar a lista fechada de árvores em TD-004; a 003 a esvazia |
| L-011 | O steering (`tech-stack.md`) cita "1060 testes", "638 s" e "5 falhas"; o medido é 1418, 322 s, falhas por carga | Atualizar o steering depois de aprovar o design (princípio 10: a Duda diz qual documento mudar) |

## 13. Perguntas abertas (para a Duda)
| ID | Pergunta | Padrão proposto |
| --- | --- | --- |
| DQ-001 | O Caderno (`CADERNO_V2`, commit `9145f2b`, "a spec 002 o substitui") importa personas e trilhas. Remover **na 001** ou deixar para a 002 e desacoplar agora? | **Remover na 001** (Anexo B, G-5, opção 1): menos edição em código que vai sair, 78 testes e 11 s a menos; o histórico o guarda |
| DQ-002 | Aprova os orçamentos **suíte ≤ 90 s e `verify` ≤ 180 s** (60 s e 120 s como meta de esforço)? | Sim (TD-009) |
| DQ-003 | Aprova declarar o `zod` (já no lockfile) como `devDependency`? | Sim (TD-001) |
| DQ-004 | Etiqueta sem hífen no início, no fim ou duplo (mais estrito que o FR-011)? | Sim |
| DQ-005 | Recusar `mailto:` com `?subject=` nesta versão? | Sim (aceitar depois se precisar) |
| DQ-006 | Os 5 pontos com `id` cru como reserva (TD-005) são corrigidos agora ou nas specs que reescrevem tema e rotas (002/003)? | Nas 002/003; a 001 só protege o código novo |
| DQ-007 | A home provisória (sem persona) mantém o bloco "O que você procura?" (`intents`) e o bloco de jogos? | Jogos saem (G-2); **intents também sai** (muda só a ordem por persona); a composição padrão fica com `quick`, `projects`, `github` |
| DQ-008 | Conferir a largura e a altura **reais** do arquivo contra as declaradas (exige ler o cabeçalho da imagem)? | Não nesta spec |
| DQ-009 | `scripts/status.mjs` (gate SDD) e todos os `.md` ficam fora do Prettier? | Sim (TD-007) |
| DQ-010 | Imagem externa recusada (L-001)? | Sim |
| DQ-011 | O clone limpo no WSL Ubuntu (existe na máquina) vale como verificação "Linux" até a 010? | Sim |
| DQ-012 | Após a onda 1, a Duda apaga `GEMINI_API_KEY` e `GEMINI_MODEL` do painel da Netlify (ação só dela)? | Sim |

## Confirm before building
Antes de gerar o `tasks.md`, confirme:
1. **O Anexo B** (a lista do que sai, com quem importa cada arquivo) está aprovado, inclusive a decisão **DQ-001** (Caderno).
2. Os **orçamentos de tempo** (DQ-002): suíte ≤ 90 s e `verify` ≤ 180 s.
3. A **dependência** `zod` (DQ-003) e a **política de formatação** (TD-007, DQ-009).
4. As **lacunas L-001 a L-011** que a Duda quer levar para o `requirements.md` (o design não as altera sozinho).
5. Que as **ondas de remoção** acontecem na branch `rebuild/sdd`, uma por vez, cada uma com `tsc`, `vite build` e `vitest` verdes, sem `skip`.
Nada de código antes de `tasks:approved`.

## Respostas da Duda (2026-11-15) — registro, ainda sem aprovação do design
| ID | Resposta |
| --- | --- |
| DQ-001 | **Remover o Caderno na 001.** Fica no histórico (`9145f2b`). |
| DQ-002 | **Aprovados os orçamentos: suíte ≤ 90 s e `verify` ≤ 180 s** (60 s e 120 s ficam como meta de esforço). O design remede fora do OneDrive (R-002). |
| DQ-003 a DQ-012 | **Todos os padrões propostos aceitos** (`zod` como devDependency; etiqueta sem hífen no início, no fim ou duplo; recusar `mailto:` com `?subject=`; os 5 pontos com `id` cru nas specs 002/003; home provisória sem jogos e sem `intents`; sem conferir dimensões reais da imagem; Prettier ignora `status.mjs` e os `.md`; imagem externa recusada; clone limpo no WSL vale como "Linux" até a 010; a Duda apaga `GEMINI_API_KEY` e `GEMINI_MODEL` do painel do Netlify depois da onda 1). |
| Anexo B | **Ainda NÃO aprovado.** A lista do que sai (`design.anexo-fora-do-mvp.md`) precisa da sua leitura e aprovação explícita antes de qualquer remoção. |
| L-001 a L-011 | Lacunas no `requirements.md` aprovado: **continuam propostas**. Nada foi editado; peço sua aprovação para cada alteração. |

### Correção de 2026-11-15: conteúdo curado em `/pessoal`
O Anexo B foi corrigido (ver o fim de `design.anexo-fora-do-mvp.md`): o código de API do `/pessoal` (`netlify/personal/`, `personal-*.mts`, integrações, `usePersonal`) **fica fora da 001** e é removido pela 008, que também reescreve as páginas. Efeitos nesta spec: o `@netlify/blobs` e o bloco `[functions]` do `netlify.toml` permanecem até a 008; os schemas da 001 (texto, data, imagem, link, etiqueta) são a base do conteúdo curado, e a nota decimal de 0,5 a 5 (uma casa) é uma primitiva nova a avaliar como lacuna dos requisitos (L-012, a propor; nada foi editado nos requisitos aprovados).

## Ratificações e pendências da rodada de 2026-11-15
- **L-009 (ratificada, sem editar o requisito):** a ordem indeterminada do FR-013 é exposta por `compareDates` (§5.2), que **não ordena listas**.
- **L-010 (ratificada, sem editar o requisito):** vale a lista fechada de árvores por idioma do TD-004; a 003 a esvazia.
- **L-006 (não aplicada, por decisão da Duda):** o NFR-001 continua como está ("sem outros processos pesados"); o design registra a máquina e a condição de cada medição.
- **L-011 (steering):** fica para depois de a Duda aprovar este design.
- **Requisitos v1.3 aplicados:** L-001, L-002, L-003, L-004, L-005, L-007, L-008 e L-012 (FR-018, nota de 0,5 a 5 em passos de 0,5). **O FR-018 foi coberto depois** (§5.6, V-21, V-22 e linha do mapeamento) e a Duda confirmou a adição ao aprovar o design em 2026-11-15; pendência encerrada.
- **DQ-013 (nova, aberta):** **contradição entre a requirements e o design sobre o branch.** A requirements (Constraints desta spec e da 002) diz "a reconstrução fica na `main`, sem `git push` (V-D-015)", mas o design, o Anexo B (pré-condição: "branch `rebuild/sdd`") e o `AGENTS.md` usam a branch `rebuild/sdd`, onde já há 4 commits enviados ao GitHub antes de a Duda pedir "sem push" nesta rodada. Não resolvi sozinho. Perguntas: (a) a regra vigente é "branch `rebuild/sdd`, com push quando a Duda pedir"? (b) a V-D-015 e as Constraints das duas specs mudam para isso? (c) o merge na `main` só no lançamento (010), porque o Netlify publica a partir dela?

## Respostas da Duda (2026-11-15, segunda rodada)
- **DQ-013 (respondida):** vale a sugestão: o trabalho fica na branch `rebuild/sdd`, com `git push` só quando a Duda pedir, e o merge na `main` só no lançamento (spec 010), porque o Netlify publica a partir dela. A V-D-015 e as Constraints das duas specs foram corrigidas.
- **Design e Anexo B: "aprovado" pela Duda.** Registro abaixo o que isso cobre e o que ainda impede promover o `.status`:
  - A aprovação foi dada **antes** de eu cobrir o FR-018 (nota) no design. Eu o cobri depois (§5.6, V-21, V-22, linha do mapeamento). **Peço que a Duda confirme essa adição** antes de eu tratar o design como aprovado.
  - O `.status` **continua `design:draft`**: a v1.3 dos requisitos ainda não foi aprovada, e `design:approved` pressupõe `requirements:approved` (GATES.md). Eu não promovo nada até as duas aprovações existirem na ordem certa.
