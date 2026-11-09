# Checklist: página nova (ou removida)

- [ ] `src/data/routes.js`: entrada com `id`, `kind: 'page'`, `path`, `label` e `desc` (`L(pt, en)`), `name`/`alias`, `command`, `parent`. Sem importar nada (o arquivo é Node-importável).
- [ ] `src/pages/<Nome>.jsx`: usa `SiteShell`/`Window` como as irmãs; título via `SectionTitle`; conteúdo de `src/data`.
- [ ] `src/router.jsx`: nada a fazer se a rota vem da tabela; se precisar de componente, mapear aqui.
- [ ] Breadcrumb e `windowPath` já saem de `routes.js` (confira `~/<id>` na barra de título).
- [ ] Visão em terminal: função em `views.jsx` devolvendo resumo + `PageIndex` (se tiver seções).
- [ ] Comando: entrada `route: '<id>'` em `commands.jsx` (PT/EN, `desc`).
- [ ] `ViewActions` aparece com o par ver-no-terminal / abrir-página-própria.
- [ ] Teste em `routes.test.js` (rota resolve, `findPageByPath`, `crumbsFor`) e na matriz do shell.
- [ ] Remoção: apagar rota, página, comando, testes **e** deixar redirecionamento (ver `redirecionamentos.md`).
- [ ] README (tabela de rotas e comandos) e SDD atualizados.
