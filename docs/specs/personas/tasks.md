# Personas: tarefas

Uma tarefa por commit; a mensagem leva o ID. Teste primeiro quando o requisito é de
comportamento. Plano em `design.md`.

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-PR1 | `personas.ts` (dados, `findPersona`, `byPersona`) e `personas.test.ts` | PR-01, PR-12, PR-13 | — | Teste passa: ids existem em `routes.ts`, PT/EN completos, aliases únicos, `byPersona` não perde itens |
| T-PR2 | `usePersona.tsx` + `PersonaProvider` no `App`; padrão no `test/setup.ts` | PR-05 | T-PR1 | Testa escolher, pular, limpar, id desconhecido ignorado e `localStorage` falhando |
| T-PR3 | Rotas `/r/<id>` em `routes.ts`, página em `App.tsx`, canonical/`noindex`/meta em `seo.ts`, sitemap em `seoPlugin.ts`; ajustar `routes.test.ts`, `seo.test.ts`, `seoPlugin.test.ts` | PR-07, PR-08, PR-09 | T-PR2 | `/r/xyz` dá 404; `npm run build` grava `dist/r/*.html` fora do `sitemap.xml`, com canonical `/` e `noindex` |
| T-PR4 | Comando `visitante`/`visitor`, pergunta pendente no terminal, Enter vazio pula, entrada em `catalog.ts`, textos em `ui.ts` | PR-02, PR-03, PR-04, PR-06 | T-PR2 | Teste: `1` escolhe só com a pergunta pendente; `2` volta a ser seção depois; Tab e `ajuda` listam o comando |
| T-PR5 | `PersonaPrompt`/`PersonaBadge` na home, CTA da persona | PR-02, PR-03, PR-11, PR-15 | T-PR2 | Teste: aparece na 1ª visita, pular some e não volta; teclado completo; anunciado em `aria-live` |
| T-PR6 | Lente: `byPersona` em `Sidebar` e `QuickAccess`, destaque, sugestões no terminal | PR-10, PR-11, PR-14 | T-PR4, T-PR5 | Teste: persona ativa põe suas rotas primeiro e marcadas; todas as páginas continuam presentes |
| T-PR7 | Verificação: `/verify-site` (1440×900 e 390×844, cinco temas), currículo impresso, `status.md`, linha no `README.md` das specs | PR-14, PR-16 | T-PR3, T-PR6 | Lint, testes e build passam; capturas sem rolagem horizontal; impressão igual à de antes |

Ordem sugerida: T-PR1 → T-PR2 → T-PR3 → T-PR4 → T-PR5 → T-PR6 → T-PR7.
