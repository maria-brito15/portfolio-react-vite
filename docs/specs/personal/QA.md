# Espaço cultural: relatório de QA (Fase 6, 14/11/2026)

Resultado: **NÃO está pronto para produção.** O que dá para provar sem contas reais e sem navegador
passou e ficou protegido por teste; o que depende de token, Netlify real ou olho humano está aberto e
listado abaixo. Nenhuma verificação de segurança foi desligada.

Legenda: ✅ verificado com evidência · ◐ parcial · ❌ não feito / não dá para fazer daqui.

## Evidência rodada

- `npm run typecheck` e `npm run lint`: sem erros.
- `npm test`: 1269 passam; 7 falharam na execução completa por **tempo** (waitFor de 1 s sob carga do
  Vitest em paralelo, 6–14 s por teste) e **passam isolados** (F-09).
- Novos: `netlify/personal/qa.test.ts` (12) e `src/components/personal/qa.test.tsx` (15), verdes.
- `npm run build` com `VITE_PERSONAL_SOURCE=live`, `CONTEXT=production` e valores falsos reconhecíveis
  em `HARDCOVER_API_TOKEN`, `TMDB_API_KEY`, `PERSONAL_REFRESH_SECRET`, `PERSONAL_BUILD_HOOK_URL`: build ok.

## 1. Sincronização

| Item | Estado | Nota |
| --- | --- | --- |
| Falhas 403, 429, 500, timeout no RSS | ✅ | `qa.test.ts`: com snapshot vencido → 200 `stale`; sem snapshot e com CSV → CSV `stale`; sem nada → 503 genérico `no-store` |
| Hardcover 401/403/429/5xx/timeout | ✅ | já cobertos em `hardcover.test.ts` (Retry-After, esgotar tentativas, abort) |
| TMDB 401/404/429/5xx | ✅ | `tmdb.test.ts`; falha do TMDB nunca torna a resposta `stale` |
| "Última sincronização" exata | ✅ | `updatedAt` = instante da última leitura boa (teste fixa o valor), nunca o da falha |
| Deduplicação RSS × CSV | ✅ | `letterboxdCsv.test.ts` + `films.test.ts` (51 itens = 50 RSS + 1 CSV; "Wildwood" uma vez); **só com CSV sintético** |
| Sincronização **agendada** | ❌ | **F-01**: não existe função agendada, build hook nem uso de `PERSONAL_REFRESH_SECRET`/`PERSONAL_BUILD_HOOK_URL` (Fase 4 do plano nunca foi feita). Hoje o cache é só sob demanda (TTL 6 h livros, 1 h filmes) |
| Contra as contas reais | ❌ | **F-02**: token do Hardcover, `TMDB_API_KEY` e export real do CSV ainda não existem |

## 2. Segurança

- ✅ `dist/` inteiro sem os nomes `HARDCOVER_API_TOKEN`, `TMDB_API_KEY`, `PERSONAL_REFRESH_SECRET`,
  `PERSONAL_BUILD_HOOK_URL` nem os valores falsos injetados (grep recursivo vazio).
- ✅ Sem source maps: nenhum `.map` e nenhum `sourceMappingURL` em `dist/` (`build.sourcemap` não está ligado).
- ✅ Erros: 503 devolve só `{ "error": "unavailable" }`; testes garantem token fora de resposta e log.
- ✅ `.env` e `.env.zip` ignorados pelo git; `git ls-files` só rastreia `.env.example`. O `.env` local
  só tem os 3 IDs públicos do EmailJS (nada de Hardcover/TMDB).
- ✅ `.env.example`: 8 variáveis pessoais + `VITE_PERSONAL_SOURCE`, segredos vazios (`envExample.test.ts`).
- ◐ **F-03**: o grep acima é do bundle do cliente. Falta o equivalente para o pacote das funções
  (dependem da primeira publicação) e um teste automatizado de "nada em `dist/`" (CL-32).

## 3. Acessibilidade

- ✅ (automatizado, `qa.test.tsx`, 5 rotas × PT/EN × 5 perfis) um `<main>`, um `<h1>`, títulos sem saltos
  de nível, nenhum `undefined`/`NaN`/chave crua em título, `lang` do documento igual ao idioma.
- ✅ Foco visível: regra global `a:focus-visible, button:focus-visible` (2 px, `--accent`) em `base.css`,
  mais a do índice em `personal.css`.
- ◐ **F-04**: o teste de rotas roda com o mock, que **não tem imagens**; `alt`/`width`/`height`/`lazy`
  seguem garantidos só pelos testes de componente (`CoverFigure`, `FilmPoster`). Pôster: `título (ano)`.
  Capa de livro: só o título, porque o modelo `Book` **não tem ano** (não inventei um).
- ✅ Contraste AA nos 5 temas: `contrast.test.ts` (Fase 1).
- ❌ **F-05**: navegação por teclado à mão e leitor de tela **não foram passados** (CL-37 continua ◐).
  O terminal Playwright (`e2e/`) não foi rodado aqui.

## 4. Internacionalização

- ✅ PT e EN das 5 rotas sem chave faltando (paridade em `i18n/personal.test.ts` + `qa.test.tsx`).
- ✅ Datas via `Intl.DateTimeFormat` (`pt-BR`/`en-US`), milhares via `toLocaleString(lang)`, média com
  vírgula em PT (`formatAverage`).

## 5. Perfis

- ✅ rh, tech, professor, cliente e amigo abrem as 5 páginas completas (mesmos 5 `<h1>` distintos,
  mesma estrutura). `amigo` e `professor` só destacam; ninguém perde conteúdo.
- ❌ **F-06**: layouts quebrados e a ordem do bloco da home por perfil só se veem no navegador (CL-06).

## 6. Desempenho

- ✅ Imagens: `loading="lazy"`, `decoding="async"`, `width`/`height`; `srcset` do pôster TMDB (w185/w342).
- ✅ Cache: API `public, max-age=60, stale-while-revalidate=300` (200) e `no-store` (503/erro);
  `/static/*` e `/fonts/*` imutáveis; HTML sem regra própria (revalida).
- ◐ **F-07**: capas do Hardcover não têm tamanho alternativo (limite da fonte).
- ❌ **F-08**: Lighthouse/web vitals **não medidos** (precisa do site publicado). JS inicial: bundle
  principal 442 kB / 140 kB gzip (`index-*.js`); o orçamento de +3 kB da Fase 0 foi conferido na Fase 1
  (+1,37 kB), não refeito agora.

## 7. Deploy

- ✅ Rotas diretas: `dist/pessoal.html`, `dist/pessoal/{livros,filmes,musica,teatro}.html` e os aliases
  `dist/personal*` existem (HTML por rota, sem regra de fallback para o SPA).
- ✅ `sitemap.xml` com hub, livros, filmes e música; teatro (sem conteúdo) fica `noindex, follow`.
- ✅ Build passa com `live`; a trava recusa `mock` em `CONTEXT=production`.
- ❌ **F-10**: build na Netlify, valor real de `CONTEXT`, variáveis no painel e a primeira leitura a
  frio das funções **não verificados** (sem acesso ao painel).

## Achados

| ID | Gravidade | Achado | Estado |
| --- | --- | --- | --- |
| F-01 | **Bloqueia** | Sem sincronização agendada nem build hook (Fase 4 não feita) | Aberto: precisa de decisão de escopo (função agendada + `PERSONAL_BUILD_HOOK_URL`) |
| F-02 | **Bloqueia** | Nenhuma integração validada com dados reais (Hardcover `probe`, TMDB, CSV) | Aberto: depende de token, chave e export da Duda |
| F-10 | **Bloqueia** | Deploy real, `CONTEXT` e variáveis no painel não conferidos | Aberto: depende do painel da Netlify |
| F-05 | Alta | Teclado e leitor de tela sem passada manual | Aberto |
| F-08 | Alta | Lighthouse não medido | Aberto (precisa de URL publicada) |
| F-06 | Média | Capturas 1440×900 / 390×844 (claro/escuro) do hub, música e teatro: `/verify-site` não rodado | Aberto |
| F-03 | Média | Sem teste automatizado "nada em `dist/`" e sem varredura do pacote das funções | Aberto |
| F-09 | Baixa | 7 testes de outras áreas estouram o `waitFor` padrão com o suite inteiro em paralelo (passam isolados) | Aberto: não é do espaço cultural; sugerir `testTimeout`/`waitFor` maiores ou menos workers |
| F-04 | Baixa | Rota do mock não tem imagens; capa de livro sem ano no `alt` | Aceito (modelo sem ano) |
| F-07 | Baixa | Capas do Hardcover sem `srcset` | Aceito |
| F-11 | Baixa | Teatro sem conteúdo: segue `noindex` e fora do menu | Aceito até a Duda enviar conteúdo |

Nada foi corrigido em código de produção: os achados bloqueantes são de escopo (F-01) ou de
dependência externa (F-02, F-10), e esta fase só adicionou testes.

## Próximos passos

1. Duda: gerar `HARDCOVER_API_TOKEN` e `TMDB_API_KEY`, subir o export do Letterboxd; depois
   `npm run personal:probe` e `npm run personal:import-letterboxd -- --tmdb`.
2. Decidir F-01 (função agendada + build hook) e implementar a Fase 4.
3. Publicar um deploy de preview, definir as variáveis no painel, medir Lighthouse e repetir F-05/F-06.
4. Só então marcar a Fase 5 do `CHECKLIST.md` e tirar `draft` onde couber.
