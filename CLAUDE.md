# Portfólio da Duda — regras para o Claude Code

React 19 + Vite 6, TypeScript (strict), roteador próprio, Vitest. Terminal na home; páginas dedicadas como janelas.
Specs por feature em `docs/specs/` (índice em `docs/specs/README.md`); spec geral e análise em `docs/sdd-terminal-v2/`.

## Sempre

- Uma rota/seção existe só em `src/data/routes.ts` / `sections.ts`; o resto lê dali.
- Texto de interface nos dois idiomas (`src/i18n/ui.ts`); saída do terminal é função de idioma.
- Um só estilo visual: mono único, tokens de `tokens.css`, sem degradê. Nada de dado inventado.
- Feature nova: PRD → especificação → plano → tarefas → código (skill `spec-driven-development`). Não codifique antes da especificação aprovada.
- Terminou? Rode `/verify-site`. Mudou comportamento? Atualize `docs/specs/<feature>/status.md` (`/sdd-spec-sync`).

## Skills do projeto (`.claude/skills/`)

Lista completa em `SKILLS.md`. Resumo:

- Produto e engenharia: `requirements-engineering` · `software-architecture` · `spec-driven-development` · `technical-writing`
- Portfólio: `terminal-command` · `site-page-section` · `terminal-design-system` · `content-integrity` · `sdd-spec-sync` · `verify-site` · `checkpoint`

## Comandos

`npm run dev` · `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`
