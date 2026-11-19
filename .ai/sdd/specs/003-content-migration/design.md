# 003 Content migration, Design
**Status:** draft (ver `.status`) · **Versão:** 0.1 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada em 2026-11-19) · **Base:** schemas e validador da spec 001 (`src/content/schema/*`, `scripts/contentValidator.ts`, `src/content/registry.ts`)

## 1. Executive Summary
A migração vira três coisas: (1) **oito arquivos de conteúdo** em `src/content/` (projetos, experiências, acadêmico, currículo, competências, contato, "agora", setup), cada um validado por um schema novo montado só com as primitivas da 001 (texto localizado, data, imagem, link, etiqueta, nota); (2) **uma representação de marcação mínima** (`**negrito**` em texto simples, lida por uma função pura) no lugar do `ReactNode`; (3) **um teste de equivalência descartável** que lê os módulos antigos ao vivo, projeta os dois lados na mesma lista de "fatos" e falha em qualquer diferença.

O que a leitura do código achou e que muda o plano (detalhe nas lacunas da seção 12):
- **Só 1 texto tem marcação** (a descrição do WhatsApp Dispatcher, `<strong>`). O resto de `projects.tsx`, `experiences.ts`, `academics.ts`, `resume.ts` é texto puro. A marcação é um problema pequeno; a decisão é não importar uma biblioteca de Markdown para ele (TD-001).
- **Experiências são 7, não 10** (L-001). **EcoShop tem 3 capturas** que existem em `public/cases/ecoshop/` (1280x631), contrariando a premissa da Q-001 (L-002).
- **Nenhum arquivo antigo é removido por esta spec** (seção 8). Os módulos antigos continuam sendo lidos pelas páginas atuais e servem de gabarito vivo ao teste de equivalência. O que esta spec acrescenta é só aditivo: o JavaScript do navegador não muda (os novos arquivos ainda não têm importador em `src/`).
- A frase "texto de interface" mora hoje misturada ao currículo (`print`, `showMore`, funções `since()`…). Isso é interface, não conteúdo: **não migra**, fica para a 007 levar ao dicionário `ui` (que já tem teste de paridade).

Decisões que dependem da Duda: as perguntas Q-D1 a Q-D5 (seção 13).

## 2. Requirements Mapping
Todos os FR e NFR têm casa. Nenhum ficou sem mapeamento; as lacunas estão na seção 12.

| ID | Resumo | Onde o design resolve | Artefato | Verificação (seção 10) |
| --- | --- | --- | --- | --- |
| FR-001 | Projetos (6) validados, com id, nome, início, stack, repo, caso, imagens, texto PT/EN, selo, versões | §5.1, TD-001, TD-004, TD-005 | `schema/project.ts`, `projects.content.ts` | V-01, V-10 |
| FR-002 | Projeto sem nota; a 003 não atribui nota | §5.1 (campo `rating` **não existe**; a 005 o acrescenta) | `schema/project.ts` (strict) | V-02 |
| FR-003 | Experiências em grupos, com período, organização, papel, descrição, etiqueta, grupo e destaque | §5.2, TD-006 | `schema/experience.ts`, `experiences.content.ts` | V-03, V-10 |
| FR-004 | Formação, linha do tempo, atividades por ano, disciplinas por semestre; nota, horas e modalidade opcionais | §5.3, TD-010, TD-012 | `schema/academics.ts`, `academics.content.ts` | V-04, V-10 |
| FR-005 | Texto do currículo e competências com ano e fonte; sem projeto datado = sem ano | §5.4, §5.5, TD-008 | `schema/resume.ts`, `schema/skills.ts`, `resume.content.ts`, `skills.content.ts` | V-05, V-06 |
| FR-006 | Canais de contato e foto no formato de link e imagem da 001 | §5.6, TD-007 | `schema/contact.ts`, `contact.content.ts` | V-07 |
| FR-007 | "Agora" com data da última atualização; setup vazio permanece vazio; rota continua rascunho | §5.7, TD-014, L-003 | `schema/now.ts`, `schema/calendarDate.ts`, `now.content.ts`, `uses.content.ts` | V-08, V-14 |
| FR-008 | Teste de equivalência item a item; descartado só com aprovação da Duda | §6.3, TD-009 | `src/content/__migration__/*` | V-10, V-11 |
| FR-009 | Regra de datas da 001 (mês só se confirmado; ordem indeterminada) | §5.1, §5.2, TD-006 (reusa `ContentDate`, `compareDates`) | `schema/project.ts`, `schema/experience.ts` | V-01, V-03, V-12 |
| FR-010 | Item sem PT ou EN falha, nomeando item e idioma | §5 (todo texto usa `LocalizedTextSchema`); herda 001 FR-014/015 | todos os schemas; `parity.ts` da 001 | V-09 |
| FR-011 | Todo arquivo de conteúdo registrado; sem registro falha | §4.1, §6.4 (registro explícito; validador da 001 já cobre) | `registry.ts` | V-13 |
| FR-012 | Sem marcador `[entre colchetes]` nem texto de exemplo | §6.5, TD-011 | `schema/placeholder.ts` | V-15 |
| NFR-001 | Validação do conteúdo real ≤ 5 s; conteúdo de uma página só nela | §6.6, TD-013, TD-002 | `src/content/contentCost.test.ts`; teste de importadores | V-16, V-17 |
| NFR-002 | Sem segredo; varredura da 001 passa nos arquivos novos | §7 | `secretScan` da 001 (sem código novo) | V-18 |
| NFR-003 | Alt PT/EN em toda imagem | §5.1, §5.6 (reusa `ImageSchema`) | `schema/image.ts` da 001 | V-01, V-07 |

## 3. Escopo do design
**Entra:** os oito arquivos de conteúdo e seus schemas; `rich.ts` e `schema/rich.ts`; `schema/calendarDate.ts` e `schema/placeholder.ts`; a atualização do registro; o teste de equivalência; os testes de referência, de custo e de importadores.
**Não entra:** qualquer tela (004 a 007); critérios e nota dos projetos (005); filmes, livros (008); frases do terminal (`fortunes`, Q-005: 009); a página de serviços (fora do MVP); texto de interface do currículo (007); textos da home em `portfolio.tsx` (L-004); remoção de arquivo antigo (seção 8).

## 4. Architecture
### 4.1 Mapa de arquivos (todos novos, nenhum antigo alterado)
```
src/content/
  schema/
    rich.ts            RichTextSchema (texto localizado com marcação **…**)       [novo]
    calendarDate.ts    CalendarDateSchema (AAAA-MM-DD real)                       [novo]
    placeholder.ts     withNoPlaceholders(schema) (FR-012)                        [novo]
    project.ts · experience.ts · academics.ts · skills.ts · resume.ts · contact.ts · now.ts   [novos]
    *.test.ts          tabelas "entrada -> resultado" do requirements             [novos]
    index.ts           reexporta os novos                                         [alterado]
  rich.ts              parseRich(texto) -> segmentos; plainText(texto) (puro, vai ao navegador)  [novo]
  projects.content.ts  experiences.content.ts  academics.content.ts  skills.content.ts
  resume.content.ts    contact.content.ts      now.content.ts        uses.content.ts          [novos]
  registry.ts          + 8 entradas                                               [alterado]
  references.test.ts   referências entre arquivos (TD-010)                        [novo]
  contentCost.test.ts  NFR-001 (TD-013)                                           [novo]
  __migration__/       equivalence.test.ts, legacyFacts.ts, newFacts.ts, README   [novos; descartáveis]
```
Cada `*.content.ts` só importa `import type` do schema (regra de lint da 001). O tipo vem do schema (`z.infer`), com nome próprio (`ContentProject`, `ContentExperience`…) para não colidir com os tipos antigos (`Project`, `Experience`) enquanto os dois existirem.

### 4.2 Fluxo
```
 *.content.ts (8)  --registry.ts-->  validateAll (001)  ---> teste (etapa 4)  e  contentGuard (etapa 5)
      |                                    |
      |  schema/<x>.ts = primitivas 001 + regras de campo cruzado (período, nota, fonte, referência interna)
      |
      +-- src/data/*.ts(x) antigos (intactos) --> __migration__/equivalence.test.ts (compara os dois lados)
```
### 4.3 Camadas e fronteiras
- **Dado:** schemas em `src/content/schema/*` (só scripts e testes importam; `import type` no resto). zod continua fora do navegador (V-20 da 001).
- **Runtime do site:** só `rich.ts` (puro, sem zod) e `dates.ts`/`pick.ts` da 001. Os `*.content.ts` entram no navegador **só quando uma página os importar**; nesta spec nenhuma importa.
- **Registro:** `registry.ts` é lido só pelo `vite.config.ts` e pelos testes (Node). Um teste confirma que nada em `src/` (fora de `src/content/` e testes) o importa (TD-002, V-17).

## 5. Data Model
Regra que cabe no dado fica no schema. Todos os campos são texto, número, objeto ou lista (nada de `ReactNode`, `Date` ou função). `ausente` = campo omitido; `null` e `""` nunca valem como "ausente" (como na 001). Todo schema é `strictObject`: campo desconhecido é recusado. Todo schema raiz passa por `withNoPlaceholders` (§6.5).

### 5.1 Projeto (`ContentProject`) — FR-001, FR-002, FR-009
Arquivo `projects.content.ts` exporta `projects: ContentProject[]` (ordem do arquivo = ordem de hoje).
| Campo | Tipo | Regra | Origem (antigo) |
| --- | --- | --- | --- |
| `id` | texto | formato de id da 001 (`tagIdProblem`); único na lista | `id` |
| `name` | `LocalizedText` | PT e EN não vazios (hoje igual nos dois; ver TD-004) | `name` |
| `start` | `ContentDate` | ano obrigatório; mês só se confirmado | `date` |
| `dateLabel` | `LocalizedText`, opcional | Q-003. Precisa conter o ano de `start` (barra rótulo de outro ano) | `dateLabel` |
| `stack` | `TagSet` | etiquetas `{id,label}`; id único no conjunto; lista pode ser vazia | `tech` (TD-005) |
| `repo` | `Link`, opcional | `https`; ausente = sem repositório | `repo: null` -> ausente |
| `caseStudy` | `Link`, opcional | caminho `/…` | `caseStudy` |
| `images` | lista de `Image` (0 ou mais) | caminho existe em `public/`; alt PT/EN; largura e altura inteiras (a 001 confere o arquivo) | `gallery` (L-002) |
| `badge` | `LocalizedText`, opcional | selo | `pt.badge`/`en.badge` |
| `description` | `RichText` | PT e EN; admite `**negrito**` (TD-001) | `pt/en.description` |
| `versions` | lista, opcional | cada item abaixo | `pt/en.versions` |
| `versions[].label` | texto | `v1`, `v2`… único na lista | `label` |
| `versions[].date` | `ContentDate` | não anterior a `start` (`compareDates` != `'b-antes'`) | `date` |
| `versions[].stack` | `LocalizedText` | texto livre ("Java + Spark Framework"), não etiqueta | `stack` |
| `versions[].description` | `LocalizedText` | | `description` |
| `versions[].points` | lista (>= 1) de `LocalizedText` | um ponto = um par PT/EN (nasce pareado: PT e EN não podem ter tamanhos diferentes) | `points` |

Não existe `rating`: a 005 acrescenta o campo (`RatingSchema` da 001) com a escolha dela; "ausente = sem nota" já é a forma da 001 (FR-002). `variant` e `icon` do antigo **não migram por padrão** (Q-D3): são escolha de exibição.
Casos: sem `en` na descrição -> erro `projects[2].description.en: texto ausente` (arquivo e campo); `stack` com `React` duas vezes -> `identificador repetido`; `repo: 'http://…'` -> `precisa de https`.

### 5.2 Experiência (`ContentExperienceGroup`) — FR-003, FR-009
`experiences.content.ts` exporta `experienceGroups: ContentExperienceGroup[]`, preservando grupos (`academic`, `learning`, `awards`) e ordem.
| Campo | Tipo | Regra |
| --- | --- | --- |
| grupo: `id` | id | único entre grupos |
| grupo: `title` | `LocalizedText` | |
| grupo: `items` | lista (>= 1) | |
| item: `id` | id | **único em todos os grupos** (o acadêmico e o currículo apontam para ele) |
| item: `highlight` | booleano, opcional | ausente = sem destaque (mesmo sentido de hoje) |
| item: `period.start` | `ContentDate` | ano obrigatório; mês só se o rótulo mostra `MM/AAAA` |
| item: `period.label` | `LocalizedText` | o texto do período **como é hoje** ("02/2026", "2025–2026", "2º semestre de 2026 – em andamento") |
| item: `org` | `LocalizedText` | hoje `string` (copiado nos dois idiomas) ou localizado |
| item: `role`, `description` | `LocalizedText` | |
| item: `tag` | `LocalizedText`, opcional | |
Regra cruzada (TD-006): `period.label.pt` contém o ano de `start`; se `start.month` existe, contém `MM/AAAA`; se não existe, **não começa** com `MM/AAAA` (barra mês inventado). `period.start` é a transcrição do que `parsePeriodStart` já extrai do rótulo (o teste usa essa função como gabarito). Não há `end`: o fim vive no rótulo (YAGNI).

### 5.3 Acadêmico (`ContentAcademics`) — FR-004
`academics.content.ts` exporta `academics`.
| Campo | Regra |
| --- | --- |
| `programs[]`: `id`, `institution` (texto), `degree` (`LocalizedText`), `start`, `end` (anos de 4 dígitos, `end >= start`), `expected` (booleano opcional) | `id` único |
| `timeline[]`: `year`, `label` (`LocalizedText`) | anos inteiros de 4 dígitos |
| `years[]`: `year`, `items[]` = `{kind: 'project'\|'experience', id}` | a ordem da lista é a ordem de hoje; a existência do `id` é conferida em `references.test.ts` (TD-010) |
| `semesters[]`: `id` (`AAAA-N`), `label` (`LocalizedText`), `program` (id de `programs`, **conferido no schema**), `inProgress` (opcional), `courses[]` | `id` único; semestre em andamento pode ter `courses: []` (válido) |
| `courses[]`: `name` (`LocalizedText`), `hours` (inteiro > 0, opcional), `modality` (`presencial`\|`hibrida`\|`virtual`, opcional), `grade` (número, opcional) | **`grade`: número finito >= 0, sem teto** (Q-002: o schema não inventa escala; TD-012). `grade: null` do antigo vira ausente |
Hoje nenhuma disciplina tem `hours` nem `modality`: continuam ausentes. 13 disciplinas, todas com nota, migram sem omissão (o teste de equivalência confere a contagem).

### 5.4 Currículo normalizado (`ContentResume`) — FR-005, Q-004
`resume.content.ts` exporta `resume`: **um objeto, dois idiomas por campo** (não mais `resume.pt` / `resume.en`).
| Campo | Tipo |
| --- | --- |
| `name` | texto |
| `headline`, `location`, `languages` | `LocalizedText` |
| `summary` | lista de `LocalizedText` (parágrafos, hoje 2) |
| `skillAreas[]` | `{ label: LocalizedText, text: LocalizedText }` (as 7 áreas de hoje) |
| `featuredProjects[]` | `{ project: id, subtitle: LocalizedText, award?: LocalizedText, points: LocalizedText[] }` |
`featuredProjects[].project` aponta para o projeto (id conferido em `references.test.ts`); o **nome e os links (GitHub, estudo de caso) vêm do projeto**, não são copiados (um fato, um lugar; TD-008). O teste de equivalência confirma que o nome e o endereço derivados são iguais aos do currículo antigo. O rótulo do link ("GitHub", "Ler o estudo de caso") é texto de interface (007).
Fora do conteúdo (ficam em `resume.ts` até a 007 levá-los ao `ui`): `print`, `printHint`, `sections`, `skillsSummary`, `experienceSummary`, `awardsSummary`, `received`, `showMore`, `showLess`, `since`, `expected`, `academicsLink`, `languagesLabel`.
Formação e reconhecimentos **não são duplicados**: a formação é `academics.programs`; os reconhecimentos são o grupo `awards` de experiências e os projetos com selo. O texto do currículo diz "sem duas versões das mesmas informações" e o design mantém.

### 5.5 Competências (`ContentSkillGroup`) — FR-005
`skills.content.ts` exporta `skillGroups` (4 grupos, ordem de hoje).
| Campo | Regra |
| --- | --- |
| grupo: `id` (único), `title` (`LocalizedText`), `items` (>= 1) | |
| item: `name` | texto (nome de tecnologia; não se traduz), único no grupo |
| item: `since` | ano de 4 dígitos, opcional (`null` do antigo = ausente) |
| item: `source` | `LocalizedText`, opcional (hoje `string` copiado nos dois idiomas, ou localizado) |
Regra cruzada: **`since` e `source` aparecem juntos ou nenhum** (ano sem fonte é estimativa; fonte sem ano é ruído). `formatSince` (cálculo de "N+ anos") continua código de exibição e não migra.

### 5.6 Contato e perfil (`ContentContact`) — FR-006
`contact.content.ts` exporta `contact`: objeto de chaves fixas.
| Campo | Tipo e regra |
| --- | --- |
| `email`, `servicesEmail` | `Link` `mailto:endereço` (sem parâmetros: regra da 001) |
| `github` | `Link` `https`, host `github.com` |
| `linkedin` | `Link` `https`, host `linkedin.com` |
| `photo` | `Image`: `/assets/portfolio.jpeg`, 768x768, alt PT "Foto de Maria Eduarda Brito" / EN "Photo of Maria Eduarda Brito" (as frases que o site já usa em `photoAlt`; dimensões do `<img>` atual e do arquivo) |
O endereço puro (para exibir) é `href.slice('mailto:'.length)`, função em quem exibe. O teste de equivalência confere que o e-mail antigo é igual ao endereço do link. O e-mail de serviços migra (FR-006); se a 007 não o usar, a 007 o decide (007 Q-002).

### 5.7 "Agora" e setup — FR-007
`now.content.ts`: `{ updated?: CalendarDate, items: { label: LocalizedText, text: LocalizedText }[] }`. `uses.content.ts`: `{ updated?: CalendarDate, groups: { title: LocalizedText, items: { name: texto, note?: LocalizedText }[] }[] }`.
`CalendarDate` (`schema/calendarDate.ts`, primitiva nova, TD-014): texto `AAAA-MM-DD` que é um dia real (rejeita `2026-02-30`). Regra: **`items` não vazio exige `updated`** ("agora" sem data engana). Hoje: `now` = 1 item e `updated: '2026-11-11'`; `uses` = `{ groups: [] }` e `updated` ausente (válido).
O estado de rascunho das rotas `/agora` e `/setup` **não muda** (`routeStatus.ts` continua lendo os módulos antigos até a página ser reescrita; L-003).

### 5.8 Marcação (`RichText`) — TD-001
`RichTextSchema` = `LocalizedTextSchema` + regras sobre a marcação, em cada idioma: `**` aparece em pares (aberto e fechado), não aninha, não é vazio (`****`), e o texto **não contém tag HTML** (`<` seguido de letra ou `/`). O texto de uso comum (sem `**`) é válido sem mudança. Só os campos marcados `RichText` (hoje `projects[].description`) são lidos pelo `parseRich`; os demais campos são texto puro e `**` neles é tratado como texto.

`parseRich(text): Segment[]` com `Segment = { text: string; strong: boolean }`; `plainText(text): string` remove os `**` (para meta description, busca, teste). Sem HTML, sem `dangerouslySetInnerHTML`: quem exibe monta `<strong>` a partir dos segmentos.

## 6. Interface Contract
### 6.1 Registro (`registry.ts`)
Oito entradas novas, cada uma `{ file, schema, data }`: projects, experiences, academics, skills, resume, contact, now, uses. A entrada de `credits` (spec 002) fica como está.
### 6.2 Mensagens
As da 001 (§6.2 do design dela): `arquivo · campo · motivo`, em PT. Os schemas novos usam `superRefine` com `path` para que o campo seja nomeado (ex.: `projects[1].versions[0].date: anterior ao início do projeto`).
### 6.3 Teste de equivalência (FR-008, TD-009)
`src/content/__migration__/equivalence.test.ts`. Procedimento:
1. **Gabarito vivo:** importa os módulos antigos (`data/projects`, `experiences`, `academics`, `resume`, `skillTimeline`, `profile`, `now`, `uses`) e o conteúdo novo.
2. **Dois projetores escritos separadamente** transformam cada lado numa lista de "fatos" `caminho canônico -> texto` (por exemplo `projects/ecoshop/versions/1/points/3/en`). `legacyFacts.ts` lê a forma antiga (`pt`/`en` aninhados, `null`, `ReactNode`); `newFacts.ts` lê a forma nova. Valores ausentes não geram fato (então `null` antigo = ausente novo; um valor inventado aparece como fato a mais).
3. **Marcação:** o `ReactNode` antigo vira texto com `renderToStaticMarkup` (de `react-dom/server`, roda em Node), `<strong>x</strong>` -> `**x**`, entidades HTML (`&#x27;`) decodificadas; o lado novo é lido como está.
4. **Comparação:** igualdade das duas listas, na mesma ordem. Falha lista cada diferença como `faltando`, `a mais` ou `mudou` com o caminho (item e campo) e os dois valores.
5. **Trava de cobertura (não deixa um campo escapar em silêncio):** (a) as contagens são lidas **do módulo antigo** (projetos, grupos, experiências, semestres, disciplinas, competências, itens de "agora") e comparadas com o novo; (b) o conjunto de chaves de cada objeto antigo é conferido contra uma lista "mapeada ∪ excluída explicitamente" (hoje excluídas: `variant`, `icon`, os textos de interface de `resume.ts`); chave nova no antigo faz o teste falhar; (c) PT e EN do antigo com tamanhos de lista diferentes (pontos, resumo) falham antes da comparação (o novo formato pareia).
6. **Datas (FR-009):** o início de cada experiência no novo deve ser igual a `parsePeriodStart` do antigo; mês presente no novo sem mês no antigo falha.
Por que ao vivo e não um instantâneo (TD-009): não existe uma terceira cópia de todos os textos para manter; e se a Duda editar o dado antigo antes de o novo ser lido pelas páginas, o teste acusa a divergência (decide-se qual vale). O teste vive **inteiro** em `__migration__/`, para ser apagado de uma vez no fechamento (FR-008).

### 6.4 Registro completo
O validador da 001 já falha para `*.content.ts` sem registro e para registro sem arquivo (V-13 reaproveita; nada novo no validador).

### 6.5 Sem texto de exemplo (FR-012, TD-011)
`withNoPlaceholders(schema)` embrulha cada schema raiz: percorre todo texto do dado e acusa, com o caminho, quando casa um destes: colchetes com texto (`/\[[^\]]+\]/`), `lorem ipsum`, `TODO`, `TBD`, `FIXME`. É regra da camada de dados: roda no teste (etapa 4) e no `contentGuard` (etapa 5) pelo mesmo `validateAll`. A varredura do conteúdo atual não achou nenhum desses padrões (os `[...]` encontrados em `src/data` são sintaxe de lista, não texto).

### 6.6 Medição do NFR-001
1. **Custo de validação (≤ 5 s).** `src/content/contentCost.test.ts` mede, com `performance.now()`, `await import('./registry')` (carrega os 8 arquivos e todos os schemas) **mais** `validateAll(registry, …)` com o conteúdo real, e falha se passar de **5000 ms**. A estimativa é de centenas de ms (poucas centenas de textos). O único limite que falha é 5 s (o do requisito); acima de 1 s o teste só imprime um aviso, para o registro de evidência. O teste isola módulos por arquivo (vmThreads), então o import é frio, o pior caso.
2. **Custo no `verify`.** O comando inteiro já grava `.verify/times.jsonl` (001); o fechamento compara a duração das etapas 4 e 5 antes e depois da spec e registra a diferença (esperado: < 5 s somando validação e os novos testes).
3. **JavaScript do navegador.** Como nenhuma página importa o conteúdo novo, o build de produção não pode mudar: o fechamento compara os tamanhos dos chunks antes e depois (`vite build`, mesmos arquivos, mesmo tamanho). Um teste (V-17) falha se algum arquivo de `src/` fora de `src/content/`, de testes e de `__migration__/` importar `registry` ou `schema/*` sem ser `import type`.

## 7. Security
Sem segredo novo. Os endereços (e-mail, GitHub, LinkedIn) já são públicos no site atual e nos testes. A varredura de segredos da 001 (`secretScan`) roda sobre os arquivos novos sem alteração. Nenhuma imagem externa: o `ImageSchema` já recusa. A marcação não admite HTML (§5.8), então não há vetor de injeção de marcação vindo do conteúdo.

## 8. Arquivos antigos: o que esta spec remove
**Esta spec não remove nenhum arquivo antigo.** (P-Q-001: o código novo substitui o antigo no lugar, na spec da página que o usa.) Fica o mapa de quem remove o quê, para as specs seguintes herdarem:
| Arquivo antigo (continua até…) | Quem o lê hoje | Remove |
| --- | --- | --- |
| `src/data/projects.tsx` | home, `sections/portfolio/*`, currículo, acadêmico, terminal | **005** (catálogo), com ajuste da 004 (destaques da home) e 007 |
| `src/data/experiences.ts`, `src/data/academics.ts`, `src/data/skillTimeline.ts`, `src/data/profile.ts`, `src/data/resume.ts` | currículo, acadêmico, contato, terminal | **007** (o `resume.ts` só depois de levar os textos de interface ao `ui`) |
| `src/utils/projectDate.ts`, `utils/resume.ts`, `utils/academics.ts`, `utils/academicTimeline.ts` | os mesmos | quem remover o último importador (005/007); o cálculo de média e de "desde" fica como código |
| `src/data/now.ts`, `src/data/uses.ts` | `InfoBodies`, `routeStatus.ts`, `/agora`, `/setup` | **007** (D4, 2026-11-19; antes "sem dono", L-003) |
| `src/data/portfolio.tsx` | home atual (hero, sobre, habilidades, contato) | **004** (L-004) |
| `src/data/fortunes.ts`, `data/services.tsx` | terminal / serviços | 009 / fora do MVP (não migram aqui) |
| `src/content/__migration__/` (teste e projetores de equivalência) | só a 003 | **a 003, no fechamento, quando a Duda aprovar** (FR-008) |
Atenção ao fechamento: o gabarito vivo só existe enquanto os módulos antigos existem. Se uma spec posterior apagar um módulo antigo, ela **apaga junto o trecho correspondente** do `__migration__/` (mesma tarefa), e só pode fazer isso depois de a 003 estar fechada.

## 9. Technical Decisions
### TD-001: Representação de marcação
**Decisão:** texto simples com `**negrito**` apenas, lido por `parseRich` em segmentos `{text, strong}`; schema barra `**` desbalanceado e tag HTML. **Por quê:** só 1 texto precisa de marcação hoje; segmentos evitam HTML no dado e `dangerouslySetInnerHTML`; o parser são ~15 linhas puras e não entram dependência. **Alternativas:** (a) biblioteca de Markdown (dependência e superfície de XSS para 1 caso); (b) array de segmentos no conteúdo (PT e EN podem divergir em número de partes e o arquivo fica ilegível); (c) tirar o negrito (muda o texto que a Duda escreveu; D-001); (d) manter JSX em `.tsx` (quebra "conteúdo é dado" e o lint dos `*.content.ts`). Cresce só quando uma spec precisar (a home usa `<em>` e `<br/>` em `portfolio.tsx`; é da 004).
### TD-002: Um arquivo por domínio, sem barril
**Decisão:** 8 arquivos separados, cada página importa só o seu; nenhum `index` que reúna tudo. **Por quê:** NFR-001 (conteúdo de uma página só nela); o registro reúne tudo, mas só no Node. **Alternativas:** um `content.ts` único (a home carregaria o acadêmico e o currículo); `import.meta.glob` (o `vite.config.ts` não tem; já decidido na 001).
### TD-003: Tipos saem do schema, com nome próprio
**Decisão:** `z.infer` dá `ContentProject` etc.; os tipos antigos ficam até a remoção. **Por quê:** não colidir enquanto os dois coexistem; um schema, um tipo (princípio da 001). **Alternativa:** reaproveitar os nomes `Project`/`Experience` (as páginas atuais quebrariam ou ficariam ambíguas).
### TD-004: Texto localizado por campo (e não objetos `pt` / `en`)
**Decisão:** cada campo é `{pt, en}`; a lista de pontos é lista de pares. **Por quê:** a paridade (FR-010) vira regra de schema e uma lista PT de tamanho diferente da EN fica impossível; é o formato da 001. **Alternativa:** manter `pt:{…}`/`en:{…}` por item (paridade só por teste e listas dessincronizáveis). `name` do projeto vira `LocalizedText` (hoje igual nos dois idiomas, "Portfólio" inclusive): preserva o fato e dá onde a Duda corrigir. Nome de tecnologia em competência e em setup fica `texto`.
### TD-005: Stack como etiquetas inline, com consistência por teste
**Decisão:** cada projeto tem seu `TagSet`; o id sai do rótulo (minúsculas, não alfanumérico vira hífen: `Next.js 15` -> `next-js-15`, `CI/CD` -> `ci-cd`, `JavaScript ES6+` -> `javascript-es6`); rótulo igual nos dois idiomas. Um teste exige que **o mesmo id tenha o mesmo rótulo em todo o conteúdo** e que dois rótulos diferentes não colidam no mesmo id. **Por quê:** FR-001 pede "stack como etiquetas" e os filtros da 005 dependem de ids estáveis. **Alternativas:** catálogo central de tecnologias com referência (mais uma peça e uma referência a validar, sem ganho agora; reavaliar na 005 se os filtros pedirem); texto livre (filtro por string).
### TD-006: Período da experiência = início estruturado + rótulo literal
**Decisão:** `period: {start: ContentDate, label: LocalizedText}`, com a regra cruzada da §5.2. **Por quê:** FR-009 pede a regra de datas, e hoje o ano inicial é adivinhado com regex de um texto livre (`parsePeriodStart`); o rótulo literal preserva "2º semestre de 2026 – em andamento", que nenhuma data estruturada reproduz. **Alternativas:** só rótulo (ordem e "desde 2025" continuam por regex); data estruturada completa com `end` e `ongoing` (inventa estrutura para o que o rótulo já diz).
### TD-007: Contato como objeto de chaves fixas, com `mailto:`
**Decisão:** `{email, servicesEmail, github, linkedin, photo}`; e-mails guardados como link `mailto:` (primitiva da 001), host de GitHub e LinkedIn conferido. **Por quê:** FR-006 manda usar o formato de link e imagem da 001; as chaves são conhecidas e tipadas. **Alternativa:** lista de canais genérica `{kind, href}` (mais flexível, sem uso; "na dúvida, não está").
### TD-008: Currículo normalizado e sem duplicar fato
**Decisão:** um objeto; projetos em destaque apontam para o projeto por id (nome e links derivados); formação e reconhecimentos não são recopiados; texto de interface sai do conteúdo. **Por quê:** Q-004 e o próprio comentário do `resume.ts` ("não existam duas versões"). **Alternativa:** copiar nome e links no currículo (cada copia é um fato a mais para divergir).
### TD-009: Equivalência por gabarito vivo e dois projetores
**Decisão:** §6.3. **Alternativas:** (a) instantâneo JSON do antigo (uma terceira cópia dos textos, que pode ficar velha sem aviso); (b) comparar o novo com o antigo por um adaptador único que converte a forma (o erro do adaptador seria o mesmo dos dois lados e o teste passaria); (c) conferência só manual (não repetível). O risco do gabarito vivo (o antigo mudar sob o teste) é desejado: vira alarme, não falha silenciosa.
### TD-010: Referências entre arquivos por teste, dentro do arquivo por schema
**Decisão:** a referência dentro do mesmo arquivo (`semesters[].program` -> `programs`) é regra do schema; a referência entre arquivos (`academics.years[].items[].id`, `resume.featuredProjects[].project`) é `references.test.ts`, que roda na etapa de testes. **Por quê:** o validador da 001 valida uma entrada por vez; uma entrada de registro "sintética" seria barrada por ele (só aceita arquivos `*.content.ts` existentes) e alterá-lo mexeria em código de spec fechada. **Alternativas:** estender o `validateAll` com checagens cruzadas (melhor: a falha derrubaria também o build do Netlify; custo: emenda na 001, a levar à Duda se ela quiser); deixar as referências sem checagem. **Efeito:** uma referência quebrada falha o `verify`, mas não o `vite build` solto.
### TD-011: Texto de exemplo barrado no dado
**Decisão:** `withNoPlaceholders` no schema (§6.5). **Por quê:** é regra de dado e roda no teste e no build pelo mesmo caminho. **Alternativa:** teste que percorre o registro (só pega no `verify`).
### TD-012: Nota de disciplina sem escala
**Decisão:** número finito >= 0, sem teto; `null` vira ausente. **Por quê:** Q-002 ("sem inventar escala") e a tabela do requirements; zero é nota possível (ao contrário da nota de projeto, `RatingSchema`, que recusa 0). **Alternativa:** limite 0 a 100 (as notas de hoje cabem, mas é escala que a Duda não declarou).
### TD-013: Medir o custo no teste, não em script à parte
**Decisão:** §6.6. **Por quê:** roda no `verify` sempre e falha sozinho; o import frio é o pior caso. **Alternativa:** script manual de cronômetro (ninguém roda).
### TD-014: Primitiva de data de calendário só para "atualizado em"
**Decisão:** `CalendarDateSchema` (AAAA-MM-DD real) em `schema/calendarDate.ts`, usada por "agora" e setup. **Por quê:** `ContentDate` não tem dia, e `now.updated` é um dia (`2026-11-11`) que a página exibe. **Alternativa:** estender `ContentDate` com `day` (mexe em schema da 001 que todos usam).

## 10. Plano de teste (cada item vira verificação de uma tarefa)
| ID | O que prova | Como |
| --- | --- | --- |
| V-01 | Projeto válido passa; as linhas da tabela de validação (sem `en`, sem mês, sem `repo`, etiqueta repetida, `http`, versão antes do início, `dateLabel` de outro ano) dão o resultado esperado | `npx vitest run src/content/schema/project.test.ts` |
| V-02 | `rating` em projeto é recusado (campo desconhecido) | idem |
| V-03 | Experiência: rótulo x início (mês inventado, ano divergente), id repetido entre grupos | `…/experience.test.ts` |
| V-04 | Acadêmico: `grade` 0 e 120 válidas, `-1` e `NaN` inválidas; semestre com programa inexistente; `end < start` | `…/academics.test.ts` |
| V-05 | Currículo: lista de pontos, `project` ausente | `…/resume.test.ts` |
| V-06 | Competência: `since` sem `source` e o inverso falham; sem os dois vale | `…/skills.test.ts` |
| V-07 | Contato: `http://` falha, `github` em outro host falha, foto sem alt falha | `…/contact.test.ts` |
| V-08 | "Agora": `2026-02-30` falha; itens sem `updated` falham; vazio sem `updated` vale | `…/now.test.ts` |
| V-09 | Paridade: remover o EN de um item de cada arquivo faz o `validateAll` nomear item e idioma | `src/content/migration.parity.test.ts` (usa cópias com o EN removido, nunca altera o dado real) |
| V-10 | **Equivalência:** nenhuma diferença; contagens e chaves cobertas | `npx vitest run src/content/__migration__/equivalence.test.ts` |
| V-11 | O próprio teste de equivalência detecta: um fato alterado, um item a mais e um a menos (testes do projetor com dados de fixture) | `…/__migration__/projectors.test.ts` |
| V-12 | `rich.ts`: `parseRich`/`plainText`; `**` desbalanceado, aninhado, vazio e tag HTML falham no schema | `src/content/rich.test.ts`, `schema/rich.test.ts` |
| V-13 | Registro: os 8 arquivos estão registrados; um arquivo sem registro falha | `src/content/registry.test.ts` (conteúdo real) |
| V-14 | Rascunho preservado: `uses` sem itens e `now` com 1 item; `routes.test.ts` e `seo.test.ts` seguem verdes sem mudança | `npx vitest run src/data/routes.test.ts src/data/seo.test.ts` |
| V-15 | `withNoPlaceholders`: `[x]`, `lorem ipsum`, `TODO` falham com o caminho; texto normal passa; o conteúdo real passa | `schema/placeholder.test.ts` |
| V-16 | NFR-001: validação real <= 5 s | `npx vitest run src/content/contentCost.test.ts` |
| V-17 | Nenhum importador de `registry`/`schema` no código do site; `references.test.ts` (ids entre arquivos; mesmo id de etiqueta, mesmo rótulo) | `npx vitest run src/content/references.test.ts src/content/importers.test.ts` |
| V-18 | Segredos e geral | `npm run verify` (exit 0) |

O orçamento da suíte (90 s) é herdado: os testes novos são `.test.ts` no projeto `unit` (ambiente node, sem DOM); o de equivalência usa `react-dom/server`, que roda em Node.

## 11. Riscos
| Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- |
| Perda ou deformação de fato na cópia | Média | Alto | V-10 por fatos, com trava de cobertura (§6.3 item 5) |
| Gabarito vivo some antes de a 003 fechar | Baixa | Médio | §8: nenhuma spec remove módulo antigo antes do fechamento da 003; ordem do PLAN (003 antes de 004-007) |
| Duda edita o dado antigo no meio da migração | Média | Baixo | o teste acusa; decidir qual vale e atualizar os dois (nunca em silêncio) |
| Regra cruzada de período rejeita um rótulo legítimo | Média | Baixo | os 7 rótulos reais entram nos testes; o erro nomeia o item |
| Referência entre arquivos quebra só no `verify` (não no build do Netlify) | Baixa | Médio | TD-010 (decisão da Duda se quiser estender o validador) |
| `renderToStaticMarkup` e entidades HTML mudam o texto (`&#x27;`) | Média | Baixo | decodificação explícita e o caso `what I'd do` em V-11 |
| Ids de etiqueta colidem (`React 19` e `React`) | Baixa | Baixo | ids distintos por construção; teste de colisão (TD-005) |

## 12. Lacunas encontradas (L-NNN)
- **L-001 (FR-003):** o requisito diz "hoje 10" experiências; o código tem **7** (3 + 3 + 1 em 3 grupos). O design migra as 7 e a contagem do teste vem do módulo antigo. A Duda precisa confirmar que não falta nenhuma (Q-D2). Alteração proposta: corrigir "10" para "7" no requirements (v1.1).
- **L-002 (FR-001, Q-001):** a Q-001 foi respondida com "hoje só ShortURL e File Name Standardizer têm captura", mas o código diz o contrário: **EcoShop** tem `gallery` com 3 arquivos que existem (1280x631) e ShortURL e File Name Standardizer têm a lista vazia. "Migrar sem imagem" apagaria as 3 capturas que o site mostra hoje. Proposta: migrar as 3 do EcoShop, com alt PT/EN do modelo já usado pelo site ("EcoShop — captura de tela 1 de 3" / "screenshot 1 of 3"), e os outros 5 sem imagem. Q-D1.
- **L-003 (FR-007):** a 009 diz "as páginas `/agora` e `/setup` continuam na 003", mas a 003 não tem telas e nenhuma outra spec as assume. Sem dono, `now.ts` e `uses.ts` (e `InfoBodies`) não saem. Q-D4.
- **L-004:** `portfolio.tsx` (hero, sobre, habilidades, textos de contato da home, 26 trechos JSX) não está em nenhum FR da 003. Pela regra "na dúvida, não está", fica para a 004 (home). Os requisitos aprovados não o citam; a 004 decide o que reaproveita.
- **L-005 (FR-001):** `variant` (`card`/`evolution`/`featured`/`minor`) e `icon` (emoji) do projeto antigo não estão no FR-001. Ficam fora do conteúdo (escolha de exibição da 005) e entram na lista de exclusões explícitas do teste. Q-D3.
- **L-006 (NFR-001):** o requisito não diz como se mede "5 s"; o design fixa em §6.6 (import frio + `validateAll` real).

## 13. Perguntas abertas para a Duda
- **Q-D1 (L-002):** migrar as 3 capturas do EcoShop (existem em `public/cases/ecoshop/`), com alt gerado do modelo já usado pelo site? Ou realmente sem imagem?
- **Q-D2 (L-001):** são 7 experiências mesmo (não 10)? Falta alguma?
- **Q-D3 (L-005):** `variant` e `icon` (emoji) dos projetos não migram (a 005 decide o visual)? Ou o emoji é conteúdo que você quer manter?
- **Q-D4 (L-003):** quem reescreve `/agora` e `/setup`? Opções: (a) a 003 troca só a **fonte de dados** dessas duas páginas pequenas (mesma tela) e remove `now.ts`/`uses.ts`; (b) a 004/007 assume; (c) ficam como estão até a 010. Recomendo (b), para a 003 continuar sem tela.
- **Q-D5 (TD-001):** a marcação com `**negrito**` serve? A home (004) vai querer itálico e quebra de linha; entram então na 004, com o mesmo parser estendido.
- **Q-D6 (TD-010):** aceita a referência entre arquivos só no `verify`, ou prefere que a 003 emende o validador da 001 para falhar também o `vite build`?

## 14. Decisões da Duda (2026-11-19)
Respostas às perguntas Q-D1 a Q-D6 (a ordem D1 a D6 é a mesma). Registradas antes do `tasks.md`.
| ID | Pergunta | Resposta da Duda | Efeito |
| --- | --- | --- | --- |
| D1 (Q-D1, L-002) | Capturas do EcoShop | **Migrar as 3 capturas** do EcoShop, com o alt do modelo que o site já usa ("EcoShop — captura de tela N de 3" / "screenshot N of 3"). Os outros 5 projetos ficam sem imagem. Isto **substitui** a resposta da requirements Q-001 ("migrar sem imagem"), que partia de uma premissa errada (L-002) | §5.1 vale como escrito; teste de equivalência confere as 3 imagens (caminho, alt PT/EN, 1280x631) |
| D2 (Q-D2, L-001) | Quantas experiências | **São 7** (3 + 3 + 1). Requirements FR-003 corrigido por emenda anotada ("hoje 7") | Contagem do teste vem do módulo antigo; a emenda está em `requirements.md` |
| D3 (Q-D3, L-005) | `variant` e `icon` | **Ficam fora do conteúdo.** Entram na lista de exclusões explícitas do teste de equivalência | §5.1 vale como escrito |
| D4 (Q-D4, L-003) | Dono de `/agora` e `/setup` | **A 007 as reescreve** (opção b) e remove `now.ts`, `uses.ts` e `InfoBodies` quando o fizer. A 003 continua sem tela. Emenda anotada acrescentada à `007/requirements.md` | §8: a linha de `now.ts`/`uses.ts` passa de "sem dono" para **007** |
| D5 (Q-D5, TD-001) | Marcação | **Só `**negrito**`.** Itálico e quebra de linha, se a home precisar, entram na 004 | TD-001 confirmada sem mudança |
| D6 (Q-D6, TD-010) | Referência entre arquivos | **Só no `verify`** (`references.test.ts`). Não se emenda o validador da 001 | TD-010 confirmada sem mudança |
