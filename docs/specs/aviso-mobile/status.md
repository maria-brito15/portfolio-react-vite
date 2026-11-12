# Status — Aviso de visualização em celular

> **Substituída (12/11/2026): o aviso foi removido.** O site agora é desenhado também para celular (barra lateral em gaveta, alvos de toque de 40–44 px, paleta e terminal usáveis por toque); um aviso geral de "feito para computador" ocupava parte da primeira tela e contradizia isso. `MobileNoticeModal`, seus estilos (`.mobile-notice`/`.mn-*`), os textos `mobileNotice` e o teste foram apagados. Limitações de desktop são comunicadas no contexto (arrastar/maximizar janelas simplesmente não são oferecidos em tela estreita; o Campo Minado tem "modo bandeira" por toque). Os requisitos abaixo ficam como histórico e não valem mais.

| ID | Requisito | Estado | Evidência |
| --- | --- | --- | --- |
| MB-01 | Detecção de tela estreita | ⛔ removido | `src/components/MobileNoticeModal.test.tsx` — "aparece em tela estreita sem marca prévia" |
| MB-02 | Sem aviso em desktop | ⛔ removido | `src/components/MobileNoticeModal.test.tsx` — "nunca é montado em desktop" |
| MB-03 | Uma vez por navegador | ⛔ removido | `src/components/MobileNoticeModal.test.tsx` — "some ao fechar e não reaparece em um novo carregamento" |
| MB-04 | Não bloqueante | ⛔ removido | `src/components/MobileNoticeModal.test.tsx` — "Esc fecha... o site continua usável depois de fechar" |
| MB-05 | Acessível como diálogo | ⛔ removido | mesmo teste acima (foco inicial, Esc, `role="dialog"`/`aria-modal`) |
| MB-06 | Texto nos dois idiomas | ⛔ removido | `src/i18n/ui.ts` (`mobileNotice` em `pt`/`en`) + teste "muda de idioma com o resto do site" |
| MB-07 | Estilo único | ⛔ removido | `src/styles/base.css` (`.mobile-notice`/`.mn-*`), só `var(--...)` de `tokens.css` |
| MB-09 | Sem aviso para robôs de busca | ⛔ removido | `src/components/MobileNoticeModal.test.tsx` — "não aparece para robôs de busca…" |
| MB-08 | `localStorage` indisponível não quebra o site | ⛔ removido | `src/components/MobileNoticeModal.test.tsx` — "não quebra o site quando localStorage lança erro" |

Resumo: 0 ativos (feature removida em 12/11/2026)

Verificação (2026-11-11): `npm run typecheck`, `npm run lint`, `npm test` (227/227) e
`npm run build` passam.
