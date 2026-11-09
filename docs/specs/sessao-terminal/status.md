# Status — Sessão do terminal

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| TS-01 | ✅ | `TerminalSession.jsx:14`; `Terminal.test.jsx`; README |
| TS-02 | ✅ | `tokens.css`: `--win-max: 1100px`, `--win-h: 75vh`, `--win-min-h: 520px` (360 e 70vh no mobile) |
| TS-03 | ✅ | `redirect.test.jsx`; `TerminalSession.jsx:124-161` (progresso, `Esc`/`Ctrl+C`, modo reduzido) |
| TS-04 | ✅ | `redirect.test.jsx` / `Terminal.test.jsx` (replay sem navegação) |
| TS-05 | ✅ | `Terminal.test.jsx`; `TerminalSession.jsx:195` (`^C`) |
| TS-06 | ✅ | `sections.test.jsx` ("autocompletar": página, seção, lista de opções, "não inventa") |
| TS-07 | ✅ | `Terminal.test.jsx` (idioma redesenha a saída); `findCommand` com `fold()` aceita PT/EN e acentos |
| TS-08 | ✅ | `Terminal.jsx:52` e `CommandBar.jsx:131` com `aria-live="polite"`; campo com rótulo (`CommandInput.jsx`) |

Resumo: ✅ 8 · ◐ 0 · ❌ 0 · ❔ 0
