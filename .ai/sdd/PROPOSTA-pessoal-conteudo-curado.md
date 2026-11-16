# PROPOSTA: `/pessoal` como conteúdo curado (specs 008 e 011)

**Estado:** rascunho de proposta. Não promove nenhum `.status`, não altera o `PLAN.md` aprovado, não remove nada e não edita requisitos aprovados. Tudo que está como `Q?` é pergunta aberta, não decisão.

## Decisão da Duda que origina esta proposta (2026-11-15)
**Letterboxd, Hardcover e Spotify serão preenchidos MANUALMENTE.** Não haverá integração com API, token, OAuth, cache de servidor nem Netlify Function para isso. Isto **substitui** as respostas anteriores sobre "fonte dos filmes: RSS" e "TMDB com atribuição" (ver Q-P1 e Q-P2 abaixo, que perguntam o que fazer com elas).

## 1. Escopo reescrito

### 008 films-and-books (rascunho de escopo)
Páginas `/pessoal`, `/pessoal/filmes` e `/pessoal/livros` mostram **conteúdo curado pela Duda**, em arquivos `*.content.ts` validados pelos schemas da spec 001 (FR-007 a FR-012). Sem rede, sem segredo e sem servidor para esses dados. O link para o perfil do Letterboxd e do Hardcover é só um link (validado como `https`).

| Antes (PLAN aprovado e mockup) | Agora |
| --- | --- |
| Verificar termos de TMDB, Hardcover e Letterboxd e atribuição | **Sai do escopo.** Não há consumo de API, então não há termos de API a cumprir. Resta a regra de imagens de terceiros (seção 3) |
| Segredo só no servidor; cache; estado "desatualizado" por falha de fonte | **Sai.** Não existe fonte externa que possa falhar |
| "Atualizado em [data da última sincronização] · fonte: Letterboxd" | Vira "Atualizado em [data da última edição do conteúdo]" (Q-P7) |

Requisitos propostos (EARS, rascunho, sem ID definitivo):
| Proposta | Requisito |
| --- | --- |
| P-008-a | THE SYSTEM SHALL ler filmes e livros de arquivos de conteúdo validados na geração do site pelos schemas da spec 001. |
| P-008-b | IF um item de filme ou livro violar o schema, THE SYSTEM SHALL falhar a verificação com arquivo, campo e motivo (herda 001, FR-012). |
| P-008-c | THE SYSTEM SHALL NOT fazer requisição a serviço externo para obter dado de filme, livro ou música, nem na geração do site nem no navegador. |
| P-008-d | THE SYSTEM SHALL mostrar, em cada item, título, data (com mês só se confirmado, regra da spec 001), nota em estrelas com texto alternativo e, quando houver, resenha curta. |
| P-008-e | THE SYSTEM SHALL mostrar, por página, um link para o perfil de origem (Letterboxd ou Hardcover) validado como `https`. |
| P-008-f | IF não houver itens, THE SYSTEM SHALL mostrar um estado vazio explicando que a estante ainda será preenchida, em vez de uma lista em branco. |
| P-008-g | THE SYSTEM SHALL calcular os números das páginas (por exemplo, total de itens, itens do ano, nota média) do conteúdo, nunca de valor digitado à mão. |
| P-008-h | THE SYSTEM SHALL NOT publicar item com texto de exemplo ou marcador `[entre colchetes]`; a verificação falha se encontrar um (Q-P8). |

### 011 music (rascunho de escopo)
**Estado: desbloqueada.** Deixa de depender de verificar os termos do Spotify, dos endpoints de 2026, de OAuth, de Premium e do limite de 5 usuários. Continua **fora do MVP** (decisão anterior da Duda) e depende da casca (spec 002) e do schema de música (Q-P3).

Requisitos propostos:
| Proposta | Requisito |
| --- | --- |
| P-011-a | THE SYSTEM SHALL ler artistas, faixas e playlists de arquivo de conteúdo curado, validado pelos schemas da spec 001. |
| P-011-b | WHEN o visitante escolher um período (por exemplo, 4 semanas, 6 meses ou sempre), THE SYSTEM SHALL mostrar os artistas e as faixas daquele período, se o conteúdo os trouxer (Q-P3). |
| P-011-c | THE SYSTEM SHALL NOT mostrar "ouvindo agora" nem "tocada há N minutos", que dependem de dado ao vivo; o mockup mostra esses blocos e eles precisam sair ou virar "faixa do momento" escolhida à mão (Q-P9). |
| P-011-d | THE SYSTEM SHALL mostrar, por playlist, nome, quantidade de faixas informada e link `https` para a playlist. |

**Riscos e requisitos de API removidos da 011** (lista para conferência): OAuth e token de atualização no servidor; app registrado no Spotify; modo de desenvolvimento limitado a 5 usuários e conta Premium; endpoints restritos em 2026; licença de "uso pessoal privado"; cache temporário de capa e metadados e obrigação de dado "atualizado"; Branding Guidelines do Spotify para dados de API; limite de requisições; Netlify Function e segredo do Spotify. **Não restam riscos de API.**

### Impacto nas outras specs
- **012 bastidores:** não muda (já era só texto).
- **003 content-migration:** passa a conhecer os schemas de filme, livro e música (nascem na 008 e na 011, ver Q-P3).
- **PLAN aprovado:** a linha da 008 ("verificar os termos de TMDB, Hardcover e Letterboxd; atribuição") e a P-Q-003 (termos das APIs) ficam desatualizadas. **Não editei o PLAN.** Peço sua aprovação para alterá-lo: a 008 viraria "filmes e livros como conteúdo curado", a P-Q-003 seria encerrada como "não aplicável" e a 011 sairia da lista de bloqueios.
- **`design-reference/termos-de-uso-apis.md`:** passa a ser histórico (ver banner no arquivo).
- **Duas respostas anteriores perdem efeito:** "feed RSS" (Q-P1) e "TMDB com atribuição" (Q-P2).

## 2. Perguntas abertas (não decididas)
Cada pergunta traz uma sugestão minha; nenhuma está aprovada.

- **Q-P1: o `importLetterboxd.mjs` (CSV) permanece?** Hoje ele importa o export do Letterboxd e gera `netlify/personal/data/letterboxd-history.json`, que está **vazio** (`entries: []`).
  - *Sugestão:* **remover.** O conteúdo é digitado à mão (ou colado do CSV uma vez); manter um importador, um parser de CSV (`letterboxdCsv.ts`, 273 linhas) e o npm script só para uma carga eventual custa manutenção e testes.
  - *Alternativa:* manter só como ferramenta offline que **gera o arquivo `*.content.ts`** a partir do CSV, para você revisar e editar, sem rede. Útil se for registrar centenas de filmes.
- **Q-P2: o TMDB ainda entra?** Sem API não há pôster por API. Baixar pôsteres à mão do TMDB para o repositório viola os termos dele (cache de no máximo 6 meses, sem derivados, sem uso comercial). *Sugestão:* **TMDB sai de vez.** O id do TMDB deixa de ser campo.
- **Q-P3: schema de filme, livro e música.** Campos propostos para você aprovar ou cortar:
  - **Filme:** `slug` único; `titulo` (localizado? ou original); `ano` de lançamento; `diretor` (opcional); `assistidoEm` (data com mês opcional); `nota` (ver abaixo); `resenha` (texto localizado opcional); `favorito` (booleano); `capa` (ver seção 3); `link` (página do filme no Letterboxd, opcional).
  - **Livro:** `slug`; `titulo`; `autores` (lista, pode ter vários); `lidoEm` (data com mês opcional); `nota`; `resenha`; `status` (lendo, lido, quero ler, abandonado); `paginas` e `paginaAtual` (opcionais, Q-P9); `capa`; `link` (Hardcover).
  - **Música:** `tipo` (artista, faixa ou playlist); `nome`; `artista` (para faixa); `periodo` (4 semanas, 6 meses, sempre, opcional); `posicao` (para ranking); `faixas` (para playlist, número informado); `capa`; `link` (Spotify).
  - **Nota:** inteiro de 0 a 10 representando meias estrelas (0 a 5 estrelas)? Ou decimal? *Sugestão:* inteiro 0 a 10, exibido em meias estrelas, com texto alternativo ("4 e meia de 5 estrelas"). Nota ausente = sem estrelas, nunca 0.
  - **Data:** a mesma regra da spec 001 (mês opcional, ano obrigatório).
  - **Link de origem:** o schema de link da 001 (`https`, caminho interno ou `mailto:`), restrito a `https` aqui.
  - **Pergunta de fundo:** você vai registrar **todos** os filmes e livros que viu e leu, ou só favoritos e os recentes? Isso muda o tamanho do conteúdo e se "120 filmes" do mockup pode existir.
- **Q-P4: onde ficam as capas?** Ver seção 3.
- **Q-P5: quem é dono da remoção do código de API (item 4)?** Ver seção 4.
- **Q-P6: os blocos assíncronos de interface (carregando, erro, desatualizado, selo de fonte) saem?** Eles só existem para fontes externas. *Sugestão:* sair, junto com o hook `usePersonal`, porque o conteúdo é lido na geração do site e nunca falha em execução.
- **Q-P7: o rodapé de cada página.** "Atualizado em [data da última sincronização]" vira "Atualizado em [data da última edição do conteúdo]", mantida à mão ou tirada do próprio conteúdo?
- **Q-P8: guarda de produção.** Hoje o `personalGuard` bloqueia o deploy em modo `mock` (dado fictício nunca vai ao ar). Com conteúdo curado, **o mesmo risco continua**: texto de exemplo ou `[entre colchetes]` publicado por esquecimento. *Sugestão:* trocar o guarda por uma regra do schema (P-008-h) que falha a verificação ao achar marcador de exemplo.
- **Q-P9: blocos do mockup que dependem de dado ao vivo.** "Lendo agora: página X de Y · Z%" (livros) e "Ouvindo agora / tocada há N min" (música). Ficam como conteúdo editado à mão com data ("lendo desde [data]"), ou saem?
- **Q-P10: o que acontece com a decisão anterior de "RSS"?** Está superada por esta decisão (nada de API). Confirme.

## 3. Capas (sem hotlink)
Princípio: **nenhuma imagem é carregada de outro site**, em nenhuma circunstância.
- **Padrão proposto: bloco tipográfico colorido.** Um cartão com o tom de apoio do design system (pêssego, lilás, menta, limão, céu ou rosa; tons escuros no tema escuro), com o título em letra grande e o ano. É o que o mockup já mostra nas "caixas coloridas". Vantagens: zero licença, zero arquivo, sempre acessível, e o tom pode ser escolhido pelo conteúdo (`tom`) ou por posição.
- **Alternativa: foto própria**, quando houver (por exemplo, a capa do exemplar que você tem, fotografada por você). Entra como imagem do schema da 001: caminho, `alt` em PT e em EN, largura e altura, e o arquivo precisa existir. Fica em `public/` (a decidir o subdiretório).
- **Imagem de terceiros** (capa da editora, pôster do filme, capa de álbum): **só com licença registrada na spec**. O registro traz: origem, licença, texto de atribuição e data da verificação. Sem registro, a verificação recusa a imagem (princípio 5 do steering; também FR-009 da 001, que já recusa imagem externa).
- **Q-P4:** o padrão é o bloco tipográfico e a foto própria é exceção por item? Quem guarda as fotos e em que pasta?

## 4. Código de API: fica fora do MVP? Lista para aprovação (nada foi removido)
**Conclusão:** com conteúdo curado, tudo que fala com Hardcover, Letterboxd, TMDB ou Spotify, incluindo cache e servidor, fica sem função. A lista abaixo separa o que sai, o que muda e o que depende de pergunta.

### A. Sai por inteiro (função e testes)
| Item | Motivo |
| --- | --- |
| `netlify/functions/personal-books.mts`, `personal-films.mts` | Funções de API |
| `netlify/personal/books.ts`, `films.ts`, `hardcover.ts`, `letterboxd.ts`, `tmdb.ts`, `cache.ts` e os testes `books.test.ts`, `films.test.ts`, `hardcover.test.ts`, `letterboxd.test.ts`, `tmdb.test.ts`, `cache.test.ts`, `qa.test.ts` | Clientes de API, cache e matriz de falhas de fonte |
| `netlify/personal/fixtures/letterboxd-rss.xml` | Fixture do RSS |
| `scripts/hardcoverProbe.mjs` e `hardcoverProbe.test.ts`, script `personal:probe` | Sonda da API do Hardcover |
| `src/services/integrations/hardcover/*`, `letterboxd/live.ts`, `letterboxd/parse.ts`, `tmdb/*`, `source.ts`, `integrations.test.ts` | Clientes ao vivo |
| `src/data/personal/integrations.ts` (`integrated`) | Sinalizador de "integração pronta" |
| `.env.example`: `HARDCOVER_API_TOKEN`, `HARDCOVER_USERNAME`, `TMDB_API_KEY`, `LETTERBOXD_USERNAME`, `PERSONAL_HARDCOVER_TTL_MIN`, `PERSONAL_LETTERBOXD_TTL_MIN`, `PERSONAL_REFRESH_SECRET`, `PERSONAL_BUILD_HOOK_URL` | Variáveis de API |
| `envExample.test.ts` (partes que conferem essas variáveis) | Acompanha o `.env.example` |
| Variáveis no painel do Netlify (ação **sua**): `HARDCOVER_API_TOKEN`, `TMDB_API_KEY`, `PERSONAL_REFRESH_SECRET`, `PERSONAL_BUILD_HOOK_URL`, outras `PERSONAL_*` | Segredos que deixam de existir |

### B. Muda de forma (continua, mas reescrito)
| Item | O que muda |
| --- | --- |
| `src/hooks/usePersonal.ts` e `.test.tsx` | O conteúdo é lido na geração do site; o hook assíncrono sai (Q-P6) |
| `src/services/integrations/{mode.ts,parseMode.ts,manual/*}` e os `mock.ts` | `mode` e `parseMode` perdem a razão de ser (não há `mock` nem `live`). Os `mock.ts` guardam **dado fictício** e viram fixtures de teste ou saem |
| `scripts/personalGuard.ts` e `.test.ts` | Vira regra de conteúdo (Q-P8) ou sai |
| Páginas e componentes em `src/pages/personal/` e `src/components/personal/` (`FeedState`, `StaleNotice`, `SourceBadge`, `States`, `AttributionFooter`, `BookCard`, `BooksShelves`, `FilmsDiary`, `DiaryEntry`, `MusicList`, `TheaterTimeline`, `HubIndex`) | Passam a ler conteúdo curado. Os blocos de carregando, erro, desatualizado e atribuição de API saem (Q-P6) |
| `src/data/personal/types.ts` | Os tipos viram os schemas de Q-P3 |

### C. Depende da sua resposta
| Item | Pergunta |
| --- | --- |
| `netlify/personal/letterboxdCsv.ts` (+ teste), `scripts/importLetterboxd.mjs`, script `personal:import-letterboxd`, `netlify/personal/data/letterboxd-history.json` | Q-P1: permanece o importador de CSV? |
| `src/data/personal/music.ts`, `theater.ts`, `profiles.ts`, `editorial.ts` | Já são conteúdo curado manual; ficam como ponto de partida dos schemas (Q-P3) |

### D. Efeitos em cadeia que a 001 precisa saber
- **`@netlify/blobs`** é usado por `personal-*.mts`, `ask.mts` e `netlify/assistant/limiter.ts`. A 001 já remove o assistente (`ask.mts`, `limiter.ts`). Com esta decisão, **a dependência fica sem nenhum uso** e pode sair de `package.json`.
- **`netlify.toml` `[functions]`:** o Anexo B da 001 manda **manter** `directory = "netlify/functions"` porque as Functions `personal-*` continuam. Com esta decisão, o diretório fica **sem nenhuma Function** e o bloco inteiro pode sair.
- **Anexo B da 001:** as duas linhas acima, mais o fato de `personal-*` e `netlify/personal/*` estarem listados como "MVP, permanece", **ficam desatualizados**. Proponho corrigir o Anexo B depois da sua aprovação. Não o editei.
- **Quem remove:** a regra do plano é "cada spec remove o que substitui". Mas as páginas de `/pessoal` (MVP) dependem de `usePersonal` e dos clientes; apagá-los antes de reescrever as páginas quebra o MVP. *Sugestão:* a **008** é dona da remoção e da reescrita (as páginas passam a ler conteúdo no mesmo conjunto de tarefas), e a 001 só ajusta o Anexo B para não pôr essas peças na onda dela. *Alternativa:* a 001 remove só os arquivos da seção A (sem página dependente) e a 008 faz a seção B. Escolha sua (Q-P5).

## 5. O que preciso de você
1. Aprovar ou ajustar o **escopo reescrito** da 008 e da 011, e liberar a alteração do PLAN aprovado.
2. Responder Q-P1 a Q-P10 (as de maior impacto: Q-P1, Q-P2, Q-P3 e Q-P5).
3. Aprovar a lista da seção 4 (A, B e C), incluindo quem remove (Q-P5).
4. Confirmar que as respostas "feed RSS" e "TMDB com atribuição" estão **superadas** (Q-P10 e Q-P2).

## Respostas da Duda (2026-11-15) — registro (ainda proposta, nada aprovado nas specs)
| Pergunta | Resposta | Consequência para o rascunho |
| --- | --- | --- |
| Q-P1 Importador de CSV | **Manter como ferramenta offline** | `letterboxdCsv.ts`, `importLetterboxd.mjs` e o script `personal:import-letterboxd` saem do grupo C e **ficam**, mas passam a **gerar o `*.content.ts`** para você revisar, sem rede. Hoje o script importa `netlify/personal/letterboxdCsv.ts` e `tmdb.ts`, e `netlify/personal/` sai da lista A: o código que sobra precisa **mudar de lugar** (por exemplo, `scripts/`). O destino é decisão do design da 008 |
| Q-P2 TMDB | **Só referência de metadados digitados à mão** | Sem API e sem imagem do TMDB. A flag `--tmdb` e `tmdb.ts` saem. `tmdbId` deixa de ser campo. Nada é copiado automaticamente do TMDB; a fronteira entre consultar e copiar é sua |
| Q-P3 parte 1: quantidade | **Tudo que vi e li** | Histórico completo, com totais verdadeiros ("120 filmes" pode existir). O conteúdo cresce com o tempo, então o schema, a lista e a verificação precisam aguentar centenas de itens (medir na 008); o importador ajuda a carga inicial dos filmes. Livros e música são digitados à mão |
| Q-P3 parte 2: nota | **Decimal de 0 a 5** (contra a minha sugestão de inteiro) | Consistente com a nota do projeto (média simples de quatro critérios, que dá decimais). Abre a **Q-P11** abaixo. Importador do Letterboxd traz meias estrelas, que cabem no decimal |
| Q-P5 Dono da remoção | **A 008 remove e reescreve juntas** | A 001 só corrige o Anexo B (retira `personal-*`, `netlify/personal/*` e o `@netlify/blobs` da onda dela como "permanece" e registra a 008 como dona). O `/pessoal` nunca fica quebrado |

### Perguntas que nasceram dessas respostas (abertas)
- **Q-P11: precisão da nota decimal.** Quantas casas (uma, duas)? E como as estrelas arredondam (por exemplo, 4,3 mostra 4 estrelas e meia, ou 4 estrelas e 3 décimos preenchidos)? O texto alternativo diz sempre o número exato ("nota 4,3 de 5")? *Sugestão:* uma casa decimal, estrelas arredondadas para a meia estrela mais próxima, e o texto alternativo com o número exato.
- **Q-P12: nota ausente versus zero.** Item sem nota nunca mostra "0 estrelas" (0 é uma nota válida de zero estrelas?). *Sugestão:* intervalo de 0,5 a 5 e ausente = sem estrelas, porque o Letterboxd e o Hardcover não dão zero.
- **Q-P13: carga inicial dos filmes.** Como o histórico completo é grande, a primeira carga vem do CSV do Letterboxd pelo importador offline? E livros e música, de que fonte você os digita (o export do Hardcover e do Spotify ficam fora, por serem de outra ferramenta)?
- **Q-P14: onde mora o código que sobra do importador** (`letterboxdCsv.ts`, hoje em `netlify/personal/`, pasta que sai), e se o teste dele permanece.

### Q-P11 respondida (2026-11-15)
**Nota com 1 casa decimal (0 a 5); as estrelas mostram a meia estrela mais próxima; o texto alternativo traz o número exato** ("nota 4,3 de 5"). Q-P12 (nota ausente versus zero), Q-P13 (carga inicial) e Q-P14 (onde mora o código do importador) continuam abertas.

### Q-P12, Q-P13 e Q-P14 respondidas (2026-11-15)
- **Q-P12:** nota de **0,5 a 5**; **sem nota = sem estrelas**, nunca "0 estrelas". O schema recusa nota abaixo de 0,5. Item "quero ler" ou "lendo" sem nota mostra só o título.
- **Q-P13:** **livros e música à mão, aos poucos**. O importador offline cobre só os filmes (CSV do Letterboxd). Enquanto o histórico não estiver completo, os totais dizem "itens registrados". Não haverá importador do Hardcover nem do Spotify.
- **Q-P14:** o código do importador (`letterboxdCsv.ts`, o script e o teste do parser) vai para **`scripts/`**, fora do site, de Function e do pacote do navegador. A pasta `netlify/personal/` sai inteira.

**Todas as perguntas Q-P1 a Q-P14 estão respondidas.** O que falta é a sua aprovação formal: escopo reescrito da 008 e da 011, a lista da seção 4 (A, B, C e D), a alteração do `PLAN.md` e a correção do Anexo B da 001. Nada disso foi aplicado.

### Ajuste da Q-P11 (2026-11-15, decisão da Duda na rodada seguinte)
A nota passa a ser **de 0,5 a 5 em passos de 0,5** (não mais uma casa decimal livre, como "4,3"); **"sem nota" é ausência de valor, nunca 0**. Isso substitui "1 casa decimal" e fecha a Q-P12 do mesmo jeito. Está registrado como FR-018 no `requirements.md` v1.3 da spec 001. A nota de um projeto (média de quatro critérios) não cai em passos de 0,5; a spec 005 decide o arredondamento.
