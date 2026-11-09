# Status — Shell e navegação

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| SH-01 | ✅ | `components/shell/Header.jsx` (zonas esquerda/centro/direita, sem menu); `SiteShell.test.jsx` ("o header é o mesmo em todas as rotas…") |
| SH-02 | ✅ | `shell.css:18-29` (`grid-template-columns: 1fr auto 1fr`) |
| SH-03 | ✅ | `CommandBar.jsx` + `SiteShell.test.jsx` ("executa comandos fora da home…", "na home, a barra e o terminal compartilham…") |
| SH-04 | ✅ | `SiteShell.test.jsx` ("só as páginas internas têm Voltar e breadcrumb", "usa history.back()…", "vai para a home quando…") |
| SH-05 | ✅ | `SiteShell.test.jsx` ("Ctrl+K e / focam a barra", "os atalhos não roubam o foco de campos de formulário") |
| SH-06 | ✅ | Varredura: nenhuma das 11 rotas tem rolagem horizontal em 390, 768 e 1440 px; botão `>_` em `CommandBar.jsx` |
| SH-07 | ✅ | `SiteShell.test.jsx` ("as páginas dedicadas têm [ ver no terminal ]…", "/?cmd=servicos…") |
| SH-08 | ✅ | `data/routes.js`, `data/sections.js`; `routes.test.js` |
| SH-09 | ✅ | `App.jsx` + `pages/SectionPage.jsx`; aliases `/about`, `/skills`, `/projects`, `/experience` em `routes.js` |
| SH-10 | ❌ | Não há tratamento de `/#sobre`, `/#projetos` etc.: o roteador só rola até o id e, como a home é só o terminal, o link antigo cai na home sem destino. Afeta links já publicados (LinkedIn, currículo, README) |

Resumo: ✅ 9 · ◐ 0 · ❌ 1 · ❔ 0
