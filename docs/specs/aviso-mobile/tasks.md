# Tarefas — Aviso de visualização em celular

Cada tarefa é um commit. "Feito quando" é o teste que precisa passar.

## T1 — Textos PT/EN

- Requisitos: MB-06
- Depende de: —
- Mudança: adicionar bloco `mobileNotice: { title, body, dismiss }` em
  `pt` e `en` em `src/i18n/ui.ts`.
- Feito quando: `npm run typecheck` passa e as duas chaves existem com a
  mesma forma (parity PT/EN).

## T2 — Componente `MobileNoticeModal`

- Requisitos: MB-01, MB-02, MB-04, MB-05, MB-08
- Depende de: T1
- Mudança: criar `src/components/MobileNoticeModal.tsx` (modal em portal,
  usando `useMediaQuery('(max-width: 640px)')` e `localStorage` com
  `try/catch`), seguindo o padrão de foco/Esc/clique-fora do `Lightbox`.
- Feito quando: teste em `src/test/` cobrindo MB-01, MB-02, MB-04, MB-05 e
  MB-08 passa (`npm test`).

## T3 — Persistência "já visto"

- Requisitos: MB-03
- Depende de: T2
- Mudança: salvar `portfolio-mobile-notice-dismissed` ao fechar (todas as
  vias: botão, Esc, clique fora); checar a marca antes de montar o modal.
- Feito quando: teste simulando fechamento + novo "carregamento" (novo
  render) confirma que o modal não reaparece.

## T4 — Estilo

- Requisitos: MB-07
- Depende de: T2
- Mudança: classes `.mobile-notice`/`.mn-*` no arquivo CSS de componentes
  existente, só com `var(--...)` de `tokens.css`.
- Feito quando: nenhuma cor/fonte/sombra literal nova no CSS do componente;
  checagem visual manual em 390×844 claro/escuro.

## T5 — Montagem em `App.tsx`

- Requisitos: MB-01 a MB-08 (integração)
- Depende de: T2, T3, T4
- Mudança: `<MobileNoticeModal />` ao lado de `<Page />` em `src/App.tsx`.
- Feito quando: `npm run build` passa e o modal aparece/desaparece
  corretamente ao redimensionar em dev.

## T6 — Verificação

- Depende de: T1–T5
- Mudança: nenhuma, roda `/verify-site`.
- Feito quando: lint, testes, build e capturas 390×844 claro/escuro OK;
  `status.md` atualizado.
