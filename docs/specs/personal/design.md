# Espaço cultural: plano técnico

Requisitos em `requirements.md` (CL-01 a CL-38). Arquitetura de contexto, viabilidade das
integrações e riscos em `README.md`. Este arquivo fixa o que a **Fase 1** constrói e o contrato
que as Fases 2 a 4 respeitam. Parte do código atual: `routes.ts`, `App.tsx`, `lazyPages.ts`,
`seo.ts`, `personas.ts`, `SiteShell`, `DocPage`, `components/ui/*`, `services/github.ts` (padrão
de serviço com estados) e `netlify/assistant/*` (padrão de função com núcleo testável).

## Decisões

| # | Decisão | Alternativa descartada | Por quê |
| --- | --- | --- | --- |
| D1 | Contrato `PersonalSource<T> { load(signal?): Promise<PersonalFeed<T>> }`; cada fonte tem `mock.ts`, `live.ts` (Fases 2–3) e `index.ts` | Páginas importando o mock | CL-08: trocar fonte = trocar um export |
| D2 | O modo vem de `VITE_PERSONAL_SOURCE` (`mock` \| `live`), padrão `mock` até a Fase 2, lido em `src/services/integrations/mode.ts` | Detectar mock por `import.meta.env.DEV` | Explícito e testável; o build de produção pode recusar |
| D3 | Trava no build: função pura `assertSourceMode({ mode, context })` chamada em `scripts/personalGuard.ts` (plugin Vite `buildStart`); lança se `mode === 'mock'` e `context === 'production'` | Só aviso no console | CL-14: esquecer o mock não pode publicar dado falso |
| D4 | `draft` das rotas deriva do modo: `draft: personalMode === 'mock'` em `routes.ts` | Alterar `draft` à mão | Mesmo padrão de `agora`/`setup`; some do sitemap sozinho |
| D5 | Mock carregado por `import()` dentro de `index.ts` só no modo mock; Vite elimina o ramo em `live` | Import estático | CL-15: não pesa nem aparece no bundle real |
| D6 | Itens mock têm `provenance.source: 'mock'`; `SourceBadge` e `PlaceholderBadge` leem isso, não o modo global | Badge só pelo modo | O selo acompanha o item mesmo se alguém misturar fontes |
| D7 | Hook por domínio (`usePersonalFilms`, `usePersonalBooks`) com estados `loading\|error\|ready` como `useGithubStats`; música e teatro são dado estático e não precisam de hook | Um hook genérico único | Padrão já usado; tipos específicos |
| D8 | Páginas em `src/pages/personal/*.tsx` (lazy); componentes em `src/components/personal/*`; CSS em `src/styles/personal.css` | Estilo dentro dos componentes | Convenção: um arquivo CSS por área, só tokens |
| D9 | Editorial em mono: título de seção `font-weight: 700`; numeração e kickers em caixa alta com `letter-spacing`; grid CSS de 12 colunas com assimetria 7/5 no desktop, coluna única no celular | Serifa; itálico | A fonte hospedada só tem estilo normal; D2 do README |
| D10 | Truncamento de resenha por função pura `truncateReview(text, 400)` que corta em limite de palavra e devolve `{ text, truncated }` | CSS `line-clamp` | Testável e independe de largura |
| D11 | Notas como `Rating` (0,5 a 5); `RatingStars` renderiza `★★★½` com `aria-label` "3,5 de 5" / "3.5 out of 5" | Imagem ou SVG de estrelas | Texto, mono, acessível, sem asset |
| D12 | Agrupar diário por mês com `groupByMonth(entries)`; sem `watchedDate` vai ao grupo "sem data" no fim | Descartar o item | O feed real tem itens sem data (verificado) |

## Estrutura de arquivos (Fase 1)

```
src/data/personal/
  types.ts            tipos da seção 7 do README
  music.ts, theater.ts   dado manual (vazio até a Duda fornecer; ver abaixo)
  editorial.ts        textos editoriais Localized (hub, kickers)
  review.ts           truncateReview, groupByMonth, formatRating (puras, testadas)
src/services/integrations/
  mode.ts             personalMode, assertSourceMode
  types.ts            PersonalSource<T>
  hardcover/{mock.ts,index.ts}
  letterboxd/{mock.ts,index.ts}
  tmdb/{mock.ts,index.ts}
src/hooks/usePersonal.ts
src/pages/personal/{PersonalHub,Books,Films,Music,Theater}.tsx
src/components/personal/*   EditorialHeader, SectionIndex, CoverFigure, RatingStars,
                            DiaryRow, ShelfGrid, SourceBadge, PlaceholderBadge, StaleNotice,
                            ReviewBlock, AttributionFooter
src/styles/personal.css
scripts/personalGuard.ts
```

Música e teatro: na Fase 1 ficam com **itens fictícios de mock** (mesma regra, mesmo selo)
para validar o layout. Os dados reais da Duda entram só na Fase 5.

## Tocar em arquivos existentes (e o que testar)

| Arquivo | Mudança | Teste a conferir |
| --- | --- | --- |
| `data/routes.ts` | 5 rotas, `group: 'personal'` só no hub, `draft` por modo | `routes.test.ts`, `personaRoutes.test.tsx` |
| `App.tsx`, `pages/lazyPages.ts`, `src/test/setup.js` | `case` por id; `lazy`; mock de teste | `App.test.tsx` |
| `data/seo.ts` | `pageMeta` PT/EN das 5 rotas | `seo.test.ts` |
| `i18n/ui.ts` | textos de interface PT/EN (`ui.personal`) | paridade PT/EN |
| `data/personas.ts` | `pessoal` em `amigo` e `professor` | `personas.test.ts` |
| `data/personaHome.ts` | bloco do espaço para `amigo` e `professor` | `personaHome.test.ts` |
| `data/searchRanking.ts` | palavras-chave PT/EN | `search.test.ts` |
| `terminal/commands.tsx` (+ catálogo) | comando `pessoal`/`personal` | testes de comando |
| `data/tones.ts` | já mapeia `personal: 'amber'` (verificado) | `ui.test.tsx` |
| `vite.config.ts` | registrar `personalGuard` | `scripts/*.test.ts` |

Há trabalho recente nesses arquivos (commit `ad2575d`), então cada alteração parte do estado
atual e roda a suíte inteira antes do commit.

## Contratos para as Fases 2 a 4

- `live.ts` de cada fonte chama `/api/personal/<films|books>`; o formato de resposta é `PersonalFeed<T>` sem mudança.
- A função (`netlify/functions/personal.mts`, núcleo em `netlify/personal/*`) normaliza para os mesmos tipos; fixtures reais do RSS em `netlify/personal/__fixtures__/`.
- `index.ts` passa a exportar `live` quando `VITE_PERSONAL_SOURCE=live`; nenhum arquivo em `pages/` muda.
- Snapshot em `src/data/personal/*.snapshot.json`, gerado por `npm run personal:snapshot`, **nunca** contém itens `mock` (teste).
- `seoPlugin` ganha `renderList(routeId)` lendo o snapshot (Fase 4).

## Verificação (Fase 1)

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (com `VITE_PERSONAL_SOURCE=mock`
local; o build com `CONTEXT=production` deve falhar), `/verify-site` (capturas 1440×900 e
390×844 em claro e escuro, console sem erro, sem rolagem horizontal) e `status.md`.
