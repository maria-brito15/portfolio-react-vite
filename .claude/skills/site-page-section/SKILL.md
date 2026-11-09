---
name: site-page-section
description: >
  Adicionar, mover, renomear ou remover uma PÁGINA ou SEÇÃO do portfólio
  (Currículo, Acadêmico, Serviços, Projetos, Experiências, Contato, estudo de
  caso, 404): rota nova, seção nova dentro de uma página, item de breadcrumb,
  visão em terminal da página, par "ver no terminal / abrir página própria",
  redirecionamento de link antigo (`/#sobre`).
when_to_use: >
  Quando o pedido cria ou reorganiza destinos navegáveis. Não usar para só
  trocar texto de conteúdo (content-integrity) nem para criar um comando sem
  página (terminal-command).
argument-hint: "<página ou seção> [ação]"
effort: high
---

# site-page-section

Regra central: **uma página ou seção existe em UM lugar e todo o resto lê dali.**
Rota em `src/data/routes.js`, seção em `src/data/sections.js`, conteúdo em `src/data/*`.

## Mapa de leitura

| Tarefa | Leia antes |
| --- | --- |
| Rota/página nova ou removida | `references/checklist-pagina.md` |
| Seção nova dentro de página existente | `references/checklist-secao.md` |
| Link antigo (`/#sobre`) ou mudança de URL | `references/redirecionamentos.md` |

## Invariantes

1. Navegação, breadcrumb, `ls`, `cd`, autocompletar e o par `[ ver no terminal ] [ abrir página própria ↗ ]` derivam de `routes.js`. Nunca escreva `'/curriculo'` à mão em componente (o `sweep.mjs` avisa).
2. Toda página tem as duas visões: **terminal** (resumo + índice numerado) e **página própria** (dentro de `Window`, no `SiteShell`).
3. Toda seção alcançável por URL **e** por comando (`<página> <n|nome>`).
4. Conteúdo vem de `src/data/*` nos dois idiomas; página nova não duplica texto que o terminal já mostra.
5. Visual: só componentes de `components/ui/` e tokens (skill `terminal-design-system`).
6. Rota nova → teste em `routes.test.js` e na matriz de consistência do shell (um Header, uma CommandBar, uma Window, um Footer).
7. Impressão do currículo (`@media print`) e ordem crescente da timeline de projetos não mudam.

## Passos

1. Ler `routes.js`, `sections.js`, a página mais parecida em `src/pages/` e o `references/` indicado.
2. Registrar rota/seção (id, nomes PT/EN, apelidos, descrição).
3. Criar a página (ou a seção) e a visão em terminal (`views.jsx`/`sectionViews.jsx`).
4. Ligar comando: se a página é nova, entrada em `commands.jsx` com `route` (skill `terminal-command`).
5. Textos PT/EN em `ui.js`; `node .claude/skills/content-integrity/scripts/check-i18n.mjs`.
6. Testes, depois `verify-site`.
7. Atualizar `docs/sdd-terminal-v2/` (skill `sdd-spec-sync`) e a seção de rotas do README.
