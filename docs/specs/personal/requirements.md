# Espaço cultural

Páginas editoriais de livros, filmes, música e teatro. Contexto e decisões em `prd.md` e
`README.md`; plano técnico em `design.md`; tarefas em `tasks.md`.

Grupo de requisitos **CL-xx**. Fonte única das rotas: `src/data/routes.ts`; tipos em
`src/data/personal/types.ts`; textos de interface em `src/i18n/ui.ts`.

Legenda: **Pri.** P0 = essencial, P1 = importante. **Verif.** AUT = teste automático,
MAN = checagem manual. **Fase** = fase do plano (`README.md`, seção 9).

## Rotas, navegação e persona

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-01 | Rotas em um só lugar | `routes.ts` define `pessoal`, `pessoal-livros`, `pessoal-filmes`, `pessoal-musica`, `pessoal-teatro` (paths `/pessoal`, `/pessoal/livros`…; aliases `/personal`, `/personal/books`, `/films`, `/music`, `/theater`); as subpáginas têm `parent: 'pessoal'`; nenhum outro arquivo repete caminhos | P0 | AUT | 1 |
| CL-02 | Rascunho enquanto houver mock | Com fonte em modo mock, as cinco rotas têm `draft: true`: abrem, mas ficam fora do sitemap e do índice dos buscadores (`noindex`); só o hub aparece no menu lateral e nos atalhos da home (`showInNav`, prévia com dados fictícios), e as subpáginas nunca; 404 continua 404 para o resto | P0 | AUT | 1 |
| CL-03 | Casca e navegação | Páginas carregam sob demanda (`lazyPages.ts`, com o mock em `src/test/setup.js`); `App.tsx` mapeia os ids; grupo `personal` na barra lateral; breadcrumb e título da Window (`~/pessoal/livros`) corretos em PT e EN | P0 | AUT | 1 |
| CL-04 | SEO por rota | `pageMeta` PT/EN para as cinco rotas (título ≤ ~60, descrição ≤ ~160); HTML estático por rota e canonical no caminho principal, também nos aliases | P0 | AUT | 1 |
| CL-05 | Comando no terminal | `pessoal`/`personal` (+ `livros`, `filmes`, `musica`, `teatro` e equivalentes em EN) com Tab, `ajuda`, catálogo e saída PT/EN; abre a página própria | P1 | AUT | 1 |
| CL-06 | Persona | `amigo` e `professor` destacam o espaço (ordem e bloco na home); `rh`, `tech` e `cliente` não o promovem; **nenhuma** persona perde o acesso (menu, busca, terminal) | P0 | AUT | 1 |

## Dados e contrato

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-07 | Modelo tipado | `Book`, `FilmDiaryEntry`, `FilmMeta`, `Album`, `TheaterVisit`, `PersonalFeed<T>` e `Provenance` em `types.ts`; `Source` inclui `mock`; ausência de campo é `undefined`, nunca valor presumido | P0 | AUT | 1 |
| CL-08 | Mesma interface para mock e real | `PersonalSource<T>` único; cada fonte tem `mock.ts` e `index.ts` que escolhe a implementação; as páginas e hooks só importam o `index.ts`; trocar mock por real não altera páginas | P0 | AUT | 1 |
| CL-09 | Mocks realistas e rotulados | Títulos claramente fictícios; cobrem: livro sem capa, filme sem nota, filme sem data, série, revisto, resenha longa (> 400), resenha `publish: false`, título muito longo, lista vazia, erro e `stale`; os mesmos casos viram fixtures de teste | P0 | AUT | 1 |
| CL-10 | Nada inventado | Só `provenance.source: 'mock'` carrega dado fictício; nenhum item mock usa obra real atribuída à Duda; nenhum número de interface é digitado à mão | P0 | AUT/MAN | 1 |

## Estados e transparência

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-11 | Quatro estados | Cada página trata carregando, vazio, erro (com "tentar de novo") e `stale`, em PT e EN; nunca fica em branco | P0 | AUT | 1 |
| CL-12 | Última sincronização | Rodapé de cada página mostra a data/hora da última sincronização e a fonte ("via Hardcover"); vencido mostra aviso | P0 | AUT | 1 |

## Trava de dados fictícios

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-13 | Marca visível | Enquanto o mock estiver ativo, cada página mostra o selo `DADOS FICTÍCIOS` / `PLACEHOLDER DATA` e cada item mock é marcado; legível nos cinco temas | P0 | AUT | 1 |
| CL-14 | Produção recusa mock | O build falha se a fonte estiver em modo mock em produção da Netlify (`VITE_PERSONAL_SOURCE=mock` + `CONTEXT=production` [A]); teste cobre a função de decisão | P0 | AUT | 1 |
| CL-15 | Mock isolado | Itens `mock` não entram no sitemap, no snapshot, no `context.json` do assistente, na busca nem na pré-renderização de SEO; o código do mock só é carregado em modo mock (`import()`) | P0 | AUT | 1 |

## Sistema editorial

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-16 | Um só estilo | Mono único; só variáveis de `tokens.css`; nenhum hex fora dele; sem degradê (nem sobre imagens); títulos de seção em peso 700, sem itálico sintético | P0 | AUT/MAN | 1 |
| CL-17 | Contraste, celular, movimento | AA nos cinco temas (`contrast.test.ts`); 390 px sem rolagem horizontal; `prefers-reduced-motion` respeitado | P0 | AUT/MAN | 1 |
| CL-18 | Imagens | Capas/pôsteres com `width`/`height`, `loading="lazy"` e `alt`; sem imagem, placeholder tipográfico (título + ano em bloco mono) | P0 | AUT | 1 |
| CL-19 | Linguagem editorial | Numeração editorial 001 a 005 (o hub é 001; derivada da ordem das rotas) e do índice (`01`, `02`…), kickers em caixa alta, grid assimétrico, imagens grandes e espaço em branco, com os componentes `EditorialHeader`, `SectionIndex`, `CoverFigure`, `RatingStars`, `DiaryEntry`, `BookCard`, `FilmPoster`, `StatTile`, `EditorialPage`, `EditorialSection`, `EditorialDivider`, `Loading`, `Empty`, `ErrorState`, `ShelfGrid`, `SourceBadge`, `StaleNotice` | P1 | AUT/MAN | 1 |

## Páginas

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-20 | Hub | `/pessoal` mostra o índice numerado das quatro seções e um destaque de cada (livro atual, último filme, álbum, peça), a data de atualização e as fontes | P0 | AUT | 1 |
| CL-21 | Livros | "Lendo agora", lidos (com ano), quero ler; capa ou placeholder; autores; nota quando houver | P0 | AUT | 1 |
| CL-22 | Filmes | Diário agrupado por mês e ordenado por data de exibição (`watchedDate`); nota em estrelas com rótulo acessível ("3,5 de 5"); marcas de revisto e curtido; filme sem data ou sem nota não quebra; link ao Letterboxd | P0 | AUT | 1 |
| CL-23 | Música | Lista curada com nota editorial curta; seção "Em rotação" manual; sem player nem terceiros | P1 | AUT | 1 |
| CL-24 | Teatro | Linha do tempo de peças: título, companhia, local, data, nota | P1 | AUT | 1 |
| CL-25 | Resenhas | Resenha completa até ~400 caracteres; acima, truncada com "continuar no Letterboxd →"; no diário recente só título, nota e data, com a resenha ao expandir; link canônico sempre; `publish: false` suprime | P0 | AUT | 1 |
| CL-26 | Dois idiomas | Interface PT/EN com paridade em `ui.ts`; títulos, autores e sinopses vindos de fonte não são traduzidos; notas editoriais manuais têm `Localized` | P0 | AUT | 1 |

## Integrações reais

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-27 | Letterboxd RSS | Normalizador puro lê o feed real: itens sem `watchedDate`, sem `memberRating`, série com `tmdb:tvId`; ordena por `watchedDate`; testado com fixture real | P0 | AUT | 2 |
| CL-28 | TMDB | Enriquece por `tmdbId` (pôster, diretor, gêneros, duração, sinopse PT/EN); cache permanente por filme, refaz só se faltar campo; atribuição visível; sem pôster = placeholder | P0 | AUT | 2 |
| CL-29 | Hardcover | Estantes (lendo, lido, quero ler) com nota, datas e capa, depois de uma consulta real que fixe os campos; cache de 6 h; respeita o limite da API | P0 | AUT/MAN | 3 |
| CL-30 | CSV do Letterboxd | Script importa o CSV exportado para JSON versionado (histórico além dos 50 do RSS), com `publish` por entrada; o CSV bruto não entra no repositório | P1 | AUT | 3 |
| CL-31 | Função e cache | `/api/personal/films` e `/api/personal/books` (Netlify Functions v2): somente leitura (GET), sem cabeçalho CORS (só o próprio site lê; a requisição do mesmo site não envia `Origin`, então não há checagem de origem) e sem detalhe de erro na resposta; erros tratados (fonte fora, 401, 429), cache em Blobs com revalidação; resposta traz `updatedAt` e `stale` | P0 | AUT | 2–3 |
| CL-32 | Segredos | Tokens só em variáveis de servidor; nada em `dist/`; `.env.example` lista os nomes com descrição e sem valores (feito); `ReadingStats` e `FilmStats` derivam dos itens (`data/personal/stats.ts`) | P0 | AUT/MAN | 2 |
| CL-33 | Atualização agendada | Função agendada repopula o cache (Hardcover 6 h, Letterboxd 1 h) e aciona o build hook; falha de uma fonte não derruba as outras | P1 | AUT/MAN | 4 |
| CL-34 | HTML estático | `seoPlugin` grava as listas no HTML de cada rota `/pessoal/*` a partir do snapshot; falha de fonte no build usa o snapshot anterior e não derruba o deploy | P1 | AUT | 4 |

## Qualidade

| ID | Requisito | Critério de aceitação | Pri. | Verif. | Fase |
| --- | --- | --- | --- | --- | --- |
| CL-35 | Verificação visual | `/verify-site`: lint, testes, build, capturas 1440×900 e 390×844 em claro e escuro, console sem erro | P0 | MAN | 1, 5 |
| CL-36 | Sem regressão | Testes de personas, trilhas, busca, rotas, SEO e contraste continuam verdes; JS inicial não cresce além do orçamento da spec de trilhas (páginas novas em `lazy`) | P0 | AUT | 1, 5 |
| CL-37 | Acessibilidade | Teclado e foco visíveis; estados dinâmicos em `aria-live` só quando mudam; imagens com `alt`; nota com texto equivalente | P0 | AUT/MAN | 1, 5 |
| CL-38 | Descoberta | Busca, assistente e trilhas conhecem o conteúdo **real** (nunca o mock); `searchRanking` revisado | P1 | AUT | 5 |
