# Status — Estilo único (terminal/IDE)

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| ES-01 | ✅ | `src/styles/styles.test.js` ("a única família de fonte…"); `index.html` carrega só JetBrains Mono |
| ES-02 | ✅ | `styles.test.js` ("não sobra Syne, DM Sans nem degradê"); varredura de `src` e `index.html` sem ocorrência fora do teste |
| ES-03 | ◐ | Arquivos removidos e testado, mas `src/styles/ui.css:3` ainda cita "cores gerais, de original.css" (comentário obsoleto) |
| ES-04 | ✅ | `styles.test.js` ("toda variável usada está definida"); `tokens.css` com temas claro e escuro |
| ES-05 | ✅ | Teste `src/styles/contrast.test.js` (8): lê `tokens.css` nos dois temas e exige ≥ 4,5:1 de accent, ok, warn, err, text, text-2 e dim contra surface, surface-2 e surface-3, mais on-accent sobre accent. Verificado por mutação: com `--warn` escuro trocado por `#6b4a22` o teste falha (2,40:1); tokens restaurados |
| ES-06 | ❔ | Regra declarada no README e nos tokens; não conferi visualmente todas as telas |
| ES-07 | ✅ | `src/components/shell/SiteShell.test.jsx` (layout das rotas); `App.jsx` envolve todas as páginas |
| ES-08 | ✅ | `components/ui/` (Card, Chip, DataTable, SectionTitle, ActionLink) importado por Resume, Academics, Services e `sections/portfolio/*`; `ui.test.jsx` |
| ES-09 | ◐ | Há `@media print` em `resume.css`, `shell.css` e `ui.css`; **não há teste nem captura de PDF** nesta análise (MAN pendente) |
| ES-10 | ✅ | `Reveal` não existe mais; só restam `@keyframes term-blink` e `term-type`; `TerminalSession.jsx:27` respeita `prefers-reduced-motion` |

Resumo: ✅ 7 · ◐ 2 · ❌ 0 · ❔ 1
