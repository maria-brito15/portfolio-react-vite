# Status — Shell e navegação

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| SH-01 | ✅ | `components/shell/Header.tsx` (zonas esquerda/centro/direita, sem menu); `SiteShell.test.tsx` ("o header é o mesmo em todas as rotas…") |
| SH-02 | ✅ | `shell.css:18-29` (`grid-template-columns: 1fr auto 1fr`) |
| SH-03 | ✅ | `CommandBar.tsx` + `SiteShell.test.tsx` ("executa comandos fora da home…", "na home, a barra e o terminal compartilham…") |
| SH-04 | ✅ | `SiteShell.test.tsx` ("só as páginas internas têm Voltar e breadcrumb", "usa history.back()…", "vai para a home quando…") |
| SH-05 | ✅ | `SiteShell.test.tsx` ("/ foca a barra e Ctrl+K abre a paleta de comandos", "o botão >_ do header abre a paleta de comandos, como Ctrl+K", "os atalhos não roubam o foco de campos de formulário"); `components/Overlays.test.tsx` ("não rouba Ctrl+K nem ? de campos de formulário que não são a linha de comando") |
| SH-06 | ✅ | Varredura de responsividade em 09/11/2026 (Chrome, build de produção): 11 rotas × 17 tamanhos (320×568 a 2560×1440, inclusive celular deitado 667×375, 844×390, 932×430) × claro/escuro = 374 verificações, e 252 estados do terminal (ajuda, ls, índice, seções, erros) em 6 tamanhos: nenhum elemento passa da tela e nenhum erro de console. `html/body` têm `overflow-x: hidden` (`base.css`, `responsive.css`), que esconde a rolagem; por isso a medida foi refeita sem essa máscara (scrollWidth real) e por elemento: zero estouros; o único conteúdo "cortado" é o `hp-field` (campo-armadilha anti-spam, 1 px de propósito). Alvos de toque: o que tinha < 24 px (botões `.t-run`, `.action-link`, links do `ls`, sumário de competências, índice do estudo de caso, `.case-back`, campo do terminal) ganhou `min-height: 1.75rem` em `responsive.css` (`pointer: coarse` ou ≤ 720 px); texto < 11 px (`doc-num`, rótulos do estudo de caso) subiu para ≥ 11 px. Botão `>_` em `CommandBar.tsx`. Fluxo `curriculo` → `2` → `proximo` → `cd curriculo` conferido em 1440 e 390 px |
| SH-07 | ✅ | `SiteShell.test.tsx` ("as páginas dedicadas têm [ ver no terminal ]…", "/?cmd=servicos…") |
| SH-08 | ✅ | `data/routes.ts`, `data/sections.ts`; `routes.test.ts` |
| SH-09 | ✅ | `App.tsx` + `pages/SectionPage.tsx`; aliases `/about`, `/skills`, `/projects`, `/experience` em `routes.ts` |
| SH-10 | ✅ | Tabela `legacyHashes`/`legacyTarget` em `routes.ts` e `redirectLegacy` em `router.tsx` (`replaceState`, também no `hashchange`). Testes `src/data/legacyHashes.test.tsx` (11): `/#sobre`, `#habilidades`, `#projetos`, `#experiencias`, `#contato` e `#projects` levam à página própria sem `pushState`; `#xyz`, `#inicio` e `#%` não redirecionam e não lançam. Conferido no Chrome: `/#projetos` → `/projetos` e o Voltar vai para a página anterior (não reabre o link antigo). Corrigido junto: `scrollToHash` lançava `URIError` com hash malformado |

Resumo: ✅ 10 · ◐ 0 · ❌ 0 · ❔ 0
