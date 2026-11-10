# Status — Sessão do terminal

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| TS-01 | ✅ | `TerminalSession.tsx:14`; `Terminal.test.tsx`; README |
| TS-02 | ◐ | Divergência deliberada (pedido da Duda em 10/11/2026: janela adaptável à tela): `tokens.css` agora usa `--win-max: clamp(1100px, 78vw, 1480px)` e altura `clamp(--win-min-h, 100dvh − --win-chrome, --win-cap-h)` (`terminal.css`), com mínimos menores em ≤720 px e em telas baixas; conferido no Edge headless em 1366×768 (janela inteira cabe) e 1920×1080/2560×1440 (cresce). O critério (~1100 px, ~75vh, mínimo ~520 px) não foi reescrito: aguarda confirmação para atualizar o requisito. Falta conferir 390 px em dispositivo real |
| TS-03 | ✅ | `redirect.test.tsx`; `TerminalSession.tsx:124-161` (progresso, `Esc`/`Ctrl+C`, modo reduzido) |
| TS-04 | ✅ | `redirect.test.tsx` / `Terminal.test.tsx` (replay sem navegação) |
| TS-05 | ✅ | `Terminal.test.tsx`; `TerminalSession.tsx:195` (`^C`) |
| TS-06 | ✅ | `sections.test.tsx` ("autocompletar": página, seção, lista de opções, "não inventa") |
| TS-07 | ✅ | `Terminal.test.tsx` (idioma redesenha a saída); `findCommand` com `fold()` aceita PT/EN e acentos |
| TS-08 | ✅ | `Terminal.tsx:52` e `CommandBar.tsx:131` com `aria-live="polite"`; campo com rótulo (`CommandInput.tsx`) |

Resumo: ✅ 8 · ◐ 0 · ❌ 0 · ❔ 0
