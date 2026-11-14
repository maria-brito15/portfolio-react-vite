# Espaço cultural (`/pessoal`): estado

**Fase 1 (Foundation com dados fictícios) concluída em 14/11/2026**, tarefas `T-CL1` a `T-CL9`
(ver `tasks.md`), na branch `feat/espaco-cultural`. Requisitos em `requirements.md`; decisões e
viabilidade em `README.md`; plano em `design.md`.

Tudo o que a interface mostra hoje vem de **dados fictícios** (selo `DADOS FICTÍCIOS` em cada
página e item). As rotas são rascunho (`noindex`, fora do sitemap e da barra lateral) e o build de
produção da Netlify recusa o modo mock. As Fases 2 a 5 (integrações reais, sincronização,
publicação) **não foram começadas**.

Legenda: ✅ feito e verificado · ◐ feito, com ressalva anotada · ❌ não começado (fase futura).

| ID | Requisito | Estado |
| --- | --- | --- |
| CL-01 | Rotas em um só lugar | ✅ 5 rotas em `routes.ts`, aliases `/personal/*`; `personalRoutes.test.tsx` |
| CL-02 | Rascunho enquanto houver mock | ✅ `draft` por modo; build `live` indexa só hub, Livros e Filmes (música e teatro, vazios, seguem rascunho); verificado em `dist/sitemap.xml` |
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
| CL-19 | Linguagem editorial | ✅ numeração, kickers, grade 7/5, componentes listados na spec |
| CL-20 | Hub | ✅ índice numerado, um destaque por seção, fontes e datas |
| CL-21 | Livros | ✅ lendo, lidos por ano, pausados/abandonados, quero ler |
| CL-22 | Filmes | ✅ diário por mês, nota acessível, marcas, sem data no fim, link ao Letterboxd |
| CL-23 | Música | ✅ "Em rotação" e lista, nota curta, sem player nem iframe (teste) |
| CL-24 | Teatro | ✅ linha do tempo por ano |
| CL-25 | Resenhas | ✅ truncamento em ~400 com link canônico, expansão, `publish:false` fora do DOM |
| CL-26 | Dois idiomas | ✅ paridade de chaves, tipos e textos em `i18n/personal.test.ts` (o `check-i18n.mjs` da skill **não carrega** o `ui.ts`, já na base: importa `./ws` sem extensão) |
| CL-27 | Letterboxd RSS | ❌ Fase 2 |
| CL-28 | TMDB | ❌ Fase 2 |
| CL-29 | Hardcover | ❌ Fase 3 (depende do token) |
| CL-30 | CSV do Letterboxd | ❌ Fase 3 |
| CL-31 | Função e cache | ❌ Fases 2 e 3 |
| CL-32 | Segredos | ❌ Fase 2 (`.env.zip` já está no `.gitignore`) |
| CL-33 | Atualização agendada | ❌ Fase 4 |
| CL-34 | HTML estático | ❌ Fase 4 |
| CL-35 | Verificação visual | ◐ Fase 1 verificada (abaixo); repetir na Fase 5 |
| CL-36 | Sem regressão | ✅ 1047+ testes verdes; JS inicial **+2,95 kB gzip** sobre a base (orçamento +3 kB), com pouca folga |
| CL-37 | Acessibilidade | ◐ rótulos, `alt`, `role`/`aria` testados; **foco por teclado e leitor de tela não foram passados à mão** |
| CL-38 | Descoberta | ❌ Fase 5 (hoje a busca só conhece as páginas, nunca o mock) |

Resumo: ✅ 24 · ◐ 5 · ❌ 9 · ❔ 0.

## Evidência da Fase 1 (14/11/2026)

- `npm run lint` sem erros; `npm run typecheck` sem erros.
- `npm test`: 1047 testes passaram, 18 pulados (arquivos novos do espaço cultural incluídos).
- `npm run build`: passa com `CONTEXT=deploy-preview`; falha com `CONTEXT=production` sem `VITE_PERSONAL_SOURCE=live` (esperado); passa com `live`. Nenhum título fictício no `dist/` do build `live`.
- `sweep.mjs` (estilo único, variáveis CSS, rotas, SDD): "Varredura limpa". `contrast.mjs`: todos os pares passam AA. `gap-summary.mjs`: 50 ✅ · 3 ◐ · 0 ❌ (não cobre esta feature).
- Navegador (build servido por `vite preview`): 6 rotas × 1440×900 e 390×844 × claro e escuro = 24 capturas, todas sem rolagem horizontal, com um `h1`, selo de dados fictícios e `noindex`; console sem erro nos 4 contextos. Terminal capturado em PT, EN e celular.
- Peso: JS inicial 446,55 kB (141,41 kB gzip) contra 437,93 kB (138,46 kB gzip) do commit anterior ao espaço cultural. A visão do comando `pessoal` é carregada sob demanda (`personalView`); um teste impede importá-la estaticamente.

## Pendências e decisões

- **Textos de interface a aprovar** (escritos por Claude, em primeira pessoa): decks do hub, de Livros, Filmes, Música e Teatro, e os rótulos em `src/i18n/personal.ts`.
- **Visibilidade na prévia:** com dados fictícios o espaço fica fora da barra lateral e da home (regra de rascunho); só se chega por URL, terminal ou busca. Se preferir vê-lo já na prévia, é uma mudança de condição.
- **Atribuição do TMDB:** o texto do rodapé (em inglês nos dois idiomas) é suposição até aceitar os termos.
- **Não verificado:** impressão, foco por teclado, leitor de tela, o valor real de `CONTEXT` na Netlify, funções agendadas e *build hook* (planos da conta).
- **README principal** não foi atualizado: só documenta páginas publicadas. Entra na Fase 5.
