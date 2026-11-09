# Status — Shell e navegação

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| SH-01 | ✅ | `components/shell/Header.jsx` (zonas esquerda/centro/direita, sem menu); `SiteShell.test.jsx` ("o header é o mesmo em todas as rotas…") |
| SH-02 | ✅ | `shell.css:18-29` (`grid-template-columns: 1fr auto 1fr`) |
| SH-03 | ✅ | `CommandBar.jsx` + `SiteShell.test.jsx` ("executa comandos fora da home…", "na home, a barra e o terminal compartilham…") |
| SH-04 | ✅ | `SiteShell.test.jsx` ("só as páginas internas têm Voltar e breadcrumb", "usa history.back()…", "vai para a home quando…") |
| SH-05 | ✅ | `SiteShell.test.jsx` ("Ctrl+K e / focam a barra", "os atalhos não roubam o foco de campos de formulário") |
| SH-06 | ✅ | Varredura repetida em 09/11/2026 depois de DS e links antigos (Chrome, build de produção): 11 rotas (as 10 de `routes.js` + um 404) × 390, 768 e 1440 px = 33 combinações, nenhuma com rolagem horizontal; botão `>_` em `CommandBar.jsx`. Fluxo `curriculo` → `2` → `proximo` → `cd curriculo` em 1440 e 390 px: seção 2, seção 3 e chega em `/curriculo` |
| SH-07 | ✅ | `SiteShell.test.jsx` ("as páginas dedicadas têm [ ver no terminal ]…", "/?cmd=servicos…") |
| SH-08 | ✅ | `data/routes.js`, `data/sections.js`; `routes.test.js` |
| SH-09 | ✅ | `App.jsx` + `pages/SectionPage.jsx`; aliases `/about`, `/skills`, `/projects`, `/experience` em `routes.js` |
| SH-10 | ✅ | Tabela `legacyHashes`/`legacyTarget` em `routes.js` e `redirectLegacy` em `router.jsx` (`replaceState`, também no `hashchange`). Testes `src/data/legacyHashes.test.jsx` (11): `/#sobre`, `#habilidades`, `#projetos`, `#experiencias`, `#contato` e `#projects` levam à página própria sem `pushState`; `#xyz`, `#inicio` e `#%` não redirecionam e não lançam. Conferido no Chrome: `/#projetos` → `/projetos` e o Voltar vai para a página anterior (não reabre o link antigo). Corrigido junto: `scrollToHash` lançava `URIError` com hash malformado |

Resumo: ✅ 10 · ◐ 0 · ❌ 0 · ❔ 0
