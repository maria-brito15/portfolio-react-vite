# Espaço cultural (`/pessoal`): estado

**Fase 1 (Foundation com dados fictícios) concluída em 14/11/2026**, tarefas `T-CL1` a `T-CL9`
(ver `tasks.md`), na branch `feat/espaco-cultural`. Requisitos em `requirements.md`; decisões e
viabilidade em `README.md`; plano em `design.md`.

Em modo `mock` a interface mostra **dados fictícios** (selo `DADOS FICTÍCIOS`) e o build de produção
da Netlify recusa esse modo. Em modo `live`, **Livros** (Hardcover) e **Filmes** (Letterboxd RSS + CSV +
TMDB, `films.md`) já leem as funções do servidor, **ainda sem validação com as contas reais** (token do
Hardcover, chave do TMDB e export do CSV pendentes). Música e Teatro seguem em rascunho; sincronização
agendada e HTML estático (Fases 4 e 5) não foram começados.

Legenda: ✅ feito e verificado · ◐ feito, com ressalva anotada · ❌ não começado (fase futura).

| ID | Requisito | Estado |
| --- | --- | --- |
| CL-01 | Rotas em um só lugar | ✅ 5 rotas em `routes.ts`, aliases `/personal/*`; `personalRoutes.test.tsx` |
| CL-02 | Rascunho enquanto houver mock | ✅ `draft` por modo, com `showInNav` só no hub (menu e home na prévia; ver abaixo); build `live` indexa só hub, Livros e Filmes (música e teatro, vazios, seguem rascunho); verificado em `dist/sitemap.xml` |
| CL-03 | Casca e navegação | ✅ páginas lazy, `App.tsx`, mock em `setup.ts`, breadcrumb `~/pessoal/livros` e `~/personal/books`; 24 capturas |
| CL-04 | SEO por rota | ✅ meta PT/EN, canonical no caminho principal também nos aliases, HTML estático por rota (`dist/pessoal/*.html`) |
| CL-05 | Comando no terminal | ✅ `pessoal`/`personal` com seções, Tab (nome e seção), ajuda, catálogo e erro que reensina; `personal.test.tsx` (23) e captura PT/EN |
| CL-06 | Persona | ◐ `amigo`/`professor` destacam (ordem + bloco da home), os outros só no menu, ninguém perde o acesso; o bloco da home foi testado só por teste automático (com `draft` desligado), **não visto no navegador** |
| CL-07 | Modelo tipado | ✅ `src/data/personal/types.ts` (+ `Album.inRotation`) |
| CL-08 | Mesma interface para mock e real | ✅ `PersonalSource<T>`; teste varre `src/` e só os 4 `index.ts` importam `mock.ts` |
| CL-09 | Mocks realistas e rotulados | ✅ casos incômodos presentes (livro sem capa, filme sem nota/data, série, revisto, resenha longa, `publish:false`, vazio, erro, vencido) |
| CL-10 | Nada inventado | ✅ títulos "… de exemplo", `provenance.source: 'mock'`; nenhum mock tem URL de imagem |
| CL-11 | Quatro estados | ✅ carregando, erro com "tentar de novo", vazio, vencido, em todas as páginas e no terminal |
| CL-12 | Última sincronização | ✅ rodapé por página; hub reúne uma linha por seção; dado manual mostra "Atualizado em" sem hora |
| CL-13 | Marca visível | ✅ `PlaceholderBadge` e `SourceBadge`; presentes nas 24 capturas |
| CL-14 | Produção recusa mock | ◐ `assertSourceMode` testada e build com `CONTEXT=production` falha; o valor `CONTEXT` da Netlify é suposição (**falta confirmar num deploy real**) |
| CL-15 | Mock isolado | ◐ fora do sitemap, da busca e do bundle `live` (verificado no `dist/`); **snapshot e pré-renderização ainda não existem** (teste deles na Fase 4) |
| CL-16 | Um só estilo | ✅ `personal.css` só com tokens, sem degradê, sem itálico, peso 700 nos títulos; teste lê o CSS |
| CL-17 | Contraste, celular, movimento | ✅ `contrast.mjs` e `contrast.test.ts` passam nos 5 temas; 390 px sem rolagem horizontal (claro e escuro); a folha não tem animação |
| CL-18 | Imagens | ✅ `CoverFigure`: `width`/`height`/`lazy`/`alt`, placeholder tipográfico, imagem quebrada cai nele |
| CL-19 | Linguagem editorial | ✅ numeração 001–005, kickers, grade 7/5, `EditorialPage/Section/Divider`, `StatTile`, `BookCard`, `FilmPoster`, `DiaryEntry`, estados `Loading/Empty/ErrorState/StaleNotice` com a mesma geometria |
| CL-20 | Hub | ✅ índice numerado, um destaque por seção, fontes e datas |
| CL-21 | Livros | ✅ lendo, lidos por ano, pausados/abandonados, quero ler |
| CL-22 | Filmes | ✅ diário por mês, nota acessível, marcas, sem data no fim, link ao Letterboxd; com dados reais: pôsteres, créditos TMDB, exibições por ano, aviso de spoiler (`films.test.tsx`) |
| CL-23 | Música | ✅ instrumentos (dados dela), prática atual, artistas, músicas, "Em rotação" e discos, tudo opcional e vindo de `data/personal/music.ts`; sem player nem iframe (teste). Fora do rascunho |
| CL-24 | Teatro | ✅ linha do tempo por ano, vivências, favoritas, observações e referências (`data/personal/theater.ts`, hoje vazio: segue rascunho) |
| CL-25 | Resenhas | ✅ truncamento em ~400 com link canônico, expansão, `publish:false` fora do DOM |
| CL-26 | Dois idiomas | ✅ paridade de chaves, tipos e textos em `i18n/personal.test.ts` (o `check-i18n.mjs` da skill **não carrega** o `ui.ts`, já na base: importa `./ws` sem extensão) |
| CL-27 | Letterboxd RSS | ✅ normalizador testado com o **feed real** (50 itens: 3 sem data, 5 sem nota, 1 série, 13 resenhas, 1 com spoiler); `netlify/personal/letterboxd.test.ts`. URL descoberta e conferida em 14/11/2026 |
| CL-28 | TMDB | ◐ cliente, cache permanente por filme, limite por requisição e atribuição implementados e testados **sem rede**; **não validado com a chave real** (forma da resposta do TMDB assumida da documentação); falta confirmar termos e limites |
| CL-29 | Hardcover | ◐ cliente, normalização, cache e página implementados e testados sem rede (`hardcover.md`); **não validado com o Hardcover real**: o esquema é assumido até rodar `npm run personal:probe` com o token. Listas, metas e favoritos nativos não feitos |
| CL-30 | CSV do Letterboxd | ◐ importador (`npm run personal:import-letterboxd`), deduplicação e `publish` testados com CSV **sintético**; **falta o export real** para confirmar as colunas. Watchlist e listas do CSV não importadas (`films.md`) |
| CL-31 | Função e cache | ◐ `/api/personal/books` e `/api/personal/films` prontas (cache em Blobs, snapshot de reserva, 503 genérico); nenhuma foi executada na Netlify real |
| CL-32 | Segredos | ◐ `.env.example` e teste; testes garantem que a chave do TMDB não aparece em resposta nem em log; falta o teste de "nada em `dist/`" (Fase 5) |
| CL-33 | Atualização agendada | ❌ Fase 4 |
| CL-34 | HTML estático | ❌ Fase 4 |
| CL-35 | Verificação visual | ◐ Fase 1 verificada (abaixo); repetir na Fase 5 |
| CL-36 | Sem regressão | ✅ testes verdes; JS inicial **+1,37 kB gzip** sobre a base (orçamento +3 kB): o texto do espaço cultural saiu do `ui.ts` (`usePersonalText`, lazy) e o bloco da home é lazy |
| CL-37 | Acessibilidade | ◐ rótulos, `alt`, `role`/`aria` testados; **foco por teclado e leitor de tela não foram passados à mão** |
| CL-38 | Descoberta | ❌ Fase 5 (hoje a busca só conhece as páginas, nunca o mock) |

Resumo: ✅ 24 · ◐ 8 · ❌ 6 · ❔ 0.

## Evidência da Fase 1 (14/11/2026)

- `npm run lint` sem erros; `npm run typecheck` sem erros.
- `npm test`: 1104 testes passaram, 18 pulados (arquivos novos do espaço cultural incluídos).
- `npm run build`: passa com `CONTEXT=deploy-preview`; falha com `CONTEXT=production` sem `VITE_PERSONAL_SOURCE=live` (esperado); passa com `live`. Nenhum título fictício no `dist/` do build `live`.
- `sweep.mjs` (estilo único, variáveis CSS, rotas, SDD): "Varredura limpa". `contrast.mjs`: todos os pares passam AA. `gap-summary.mjs`: 50 ✅ · 3 ◐ · 0 ❌ (não cobre esta feature).
- Navegador (build servido por `vite preview`): 6 rotas × 1440×900 e 390×844 × claro e escuro = 24 capturas, todas sem rolagem horizontal, com um `h1`, selo de dados fictícios e `noindex`; console sem erro nos 4 contextos. Terminal capturado em PT, EN e celular.
- Peso: JS inicial 441,54 kB (139,83 kB gzip) contra 437,93 kB (138,46 kB gzip) do commit anterior ao espaço cultural (+1,37 kB gzip). Ficam fora do JS inicial: a visão do comando `pessoal` (`personalView`), o bloco da home (`PersonalSpace`) e todo o texto de interface do espaço (`usePersonalText`); testes impedem as três importações estáticas.

## Livros reais (Hardcover), 14/11/2026

Implementação e testes sem rede em `hardcover.md`: cliente e normalização (`netlify/personal/hardcover.ts`), cache com snapshot (`cache.ts`), função (`personal-books.mts`), fonte `live` e página de livros. Testes novos: `hardcover.test.ts` (35), `cache.test.ts`, `books.test.ts` (servidor, 57 no total), `live.test.ts` (13), `books.test.tsx` (18), `hardcoverProbe.test.ts` (4).

**Não verificado:** qualquer chamada ao Hardcover real (falta o token), a função na Netlify real, o esquema assumido (rodar `npm run personal:probe`) e a leitura a frio dentro do tempo limite.

## Reconciliação em 14/11/2026

Um segundo pedido de "Fase 1" chegou depois da conclusão. O cruzamento item a item está em `CHECKLIST.md`. O que faltava foi feito: `.env.example`, numeração editorial 001–005, `StatTile`, `EditorialPage/Section/Divider`, `BookCard`, `FilmPoster`, `DiaryEntry`, estados `Loading/Empty/ErrorState`, tipos `ReadingStats`/`FilmStats`/`MusicItem`/`TheaterItem` e a entrada no menu (`showInNav`). Divergências deliberadas: caminho principal `/pessoal` (alias `/personal`), modelos em `src/data/personal/` e dados fictícios rotulados em vez de stubs vazios.

## Pendências e decisões

- **Textos de interface a aprovar** (escritos por Claude, em primeira pessoa): decks do hub, de Livros, Filmes, Música e Teatro, e os rótulos em `src/i18n/personal.ts`.
- **Menu e prévia (decidido em 14/11/2026):** o hub aparece no menu lateral e nos atalhos da home mesmo com dados fictícios (`showInNav`); o sitemap e o `noindex` continuam como rascunho, e a trava de build impede o mock em produção. As subpáginas não entram no menu.
- **Atribuição do TMDB:** o texto do rodapé (em inglês nos dois idiomas) é suposição até aceitar os termos.
- **Não verificado:** impressão, foco por teclado, leitor de tela, o valor real de `CONTEXT` na Netlify, funções agendadas e *build hook* (planos da conta).
- **README principal** não foi atualizado: só documenta páginas publicadas. Entra na Fase 5.
