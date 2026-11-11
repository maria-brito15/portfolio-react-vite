# Status — Aviso de visualização em celular

| ID | Requisito | Estado | Evidência |
| --- | --- | --- | --- |
| MB-01 | Detecção de tela estreita | ✅ | `src/components/MobileNoticeModal.test.tsx` — "aparece em tela estreita sem marca prévia" |
| MB-02 | Sem aviso em desktop | ✅ | `src/components/MobileNoticeModal.test.tsx` — "nunca é montado em desktop" |
| MB-03 | Uma vez por navegador | ✅ | `src/components/MobileNoticeModal.test.tsx` — "some ao fechar e não reaparece em um novo carregamento" |
| MB-04 | Não bloqueante | ✅ | `src/components/MobileNoticeModal.test.tsx` — "Esc fecha... o site continua usável depois de fechar" |
| MB-05 | Acessível como diálogo | ✅ | mesmo teste acima (foco inicial, Esc, `role="dialog"`/`aria-modal`) |
| MB-06 | Texto nos dois idiomas | ✅ | `src/i18n/ui.ts` (`mobileNotice` em `pt`/`en`) + teste "muda de idioma com o resto do site" |
| MB-07 | Estilo único | ✅ | `src/styles/base.css` (`.mobile-notice`/`.mn-*`), só `var(--...)` de `tokens.css` |
| MB-08 | `localStorage` indisponível não quebra o site | ✅ | `src/components/MobileNoticeModal.test.tsx` — "não quebra o site quando localStorage lança erro" |

Resumo: ✅ 8 · ◐ 0 · ❌ 0 · ❔ 0

Verificação (2026-11-11): `npm run typecheck`, `npm run lint`, `npm test` (227/227) e
`npm run build` passam.
