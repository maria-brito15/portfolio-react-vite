# Tarefas — Estilo único (terminal/IDE)

Tarefas que cumprem requisitos **ES-xx**. Ordem e dependências no plano geral: `docs/sdd-terminal-v2/tasks.md`.

| Tarefa | Descrição | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-A1 | 💻 Teste automatizado de contraste AA: ler os tokens de `tokens.css` nos dois temas e exigir ≥ 4,5:1 contra `--surface`, `--surface-2` e `--surface-3` | ES-05 | — | O teste falha se um acento for trocado por uma cor abaixo de 4,5:1 |
| T-A2 | 💻 Corrigir o comentário obsoleto em `src/styles/ui.css:3` (cita `original.css`) e adicionar ao `styles.test.ts` a regra "nenhum CSS cita `original.css` ou `portfolio.css`" | ES-03 | — | Teste passa; `grep original.css src` vazio |
| T-A3 | 🔎 Imprimir `/curriculo` em PDF (Chromium, `page.pdf`) e conferir: sem header, barra de comandos e moldura; sem cortes; competências e experiências abertas | ES-09 | — | PDF anexado ao PR e registrado no gap-analysis |
| T-A4 | 🔎 Revisar as capturas de `docs/screenshots/estilo-*` (43 imagens) e conferir azul/verde/âmbar/vermelho nas duas telas, nos dois temas | ES-06 | — | Estado de ES-06 vira ✅ ou lista os desvios |
