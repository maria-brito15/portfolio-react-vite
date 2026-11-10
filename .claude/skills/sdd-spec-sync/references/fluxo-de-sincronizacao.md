# Fluxo de sincronização código × spec

## Grupos de requisito

ES estilo único · SH shell/navegação · TS terminal (sessão) · CM comandos · DS descoberta ·
DT dados · NF não funcionais.

## Cruzamento completo (quando pedido "cruze o código com a spec")

1. `node .claude/skills/sdd-spec-sync/scripts/gap-summary.mjs` para ver o estado atual.
2. Para cada requisito ❌/◐/❔: localize a evidência (`rg` no `src/`), rode o teste citado.
3. Se há código sem requisito (comando, rota, componente): proponha requisito novo; não apague o código.
4. Atualize `gap-analysis.md` (status, evidência, "o que falta") e o resumo.
5. Releia `tasks.md`: tarefas cujos requisitos já estão ✅ viram feitas; se uma tarefa ficou sem requisito, aponte.
6. Entregue lista curta: mudou de status / continua aberto / divergências.

## Formato de linha na gap-analysis

`| DS-03 | ◐ | Índice existe em pageIndex.tsx mas não é usado por commands.tsx (falta T-D1) |`

A linha começa com o ID e contém **exatamente uma** marca de status (o script depende disso).

## Ordem sugerida das tarefas abertas

T-D1 (ligar `pageIndex.tsx`) → T-D2/D3 (índice e SectionNav clicáveis) → T-D4 (contexto da última página) →
T-D5 (número e vizinhos) → T-D6 (erros que reensinam) → T-D7 (primeira visita) → T-D8 (`ajuda`) → T-D9 (demais
páginas) → T-L1/L2 (hash legado) → T-A1…A7 (acabamento).
