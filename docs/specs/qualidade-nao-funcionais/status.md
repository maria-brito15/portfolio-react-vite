# Status — Qualidade e requisitos não funcionais

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| NF-01 | ✅ | lint limpo · `tsc --noEmit` limpo · 215/215 testes · build ok (10/11/2026, após a migração para TypeScript) |
| NF-02 | ✅ | Varredura de 09/11/2026: 33 combinações (11 rotas × 390/768/1440 px) e o fluxo `curriculo` → `2` → `proximo` → `cd curriculo` (1440 e 390 px) sem nenhum erro de console nem exceção de página |
| NF-03 | ✅ | Textos novos em `ui.ts` e nos dados; testes de idioma |
| NF-04 | ✅ | README documenta o índice numerado, o número como atalho, `proximo`/`anterior`, a primeira visita e os erros que reensinam (seção "Descobrir as seções sem saber os comandos") e os links antigos (T-L2); 12 capturas novas `docs/screenshots/terminal-{indice,numero,proximo}-{desktop,mobile}-{dark,light}.png` geradas no Chrome (sem rolagem horizontal, sem erro de console). `docs/sdd/requirements.md` marca D-04, D-10, RF-18, RF-19 e RNF-03 como superados e `docs/sdd/tasks.md` traz a contagem atual (215 testes em 20 arquivos) |

Resumo: ✅ 4 · ◐ 0 · ❌ 0 · ❔ 0
