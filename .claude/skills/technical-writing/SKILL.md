---
name: "technical-writing"
description: "Use to produce clear, consistent technical documentation: READMEs, RFCs, ADRs, specifications, how-to guides and changelogs, in Portuguese or English with the same structure and terms. Trigger when the user asks to document, write up, explain for a reader, or update docs after a change."
---

# Technical Writing

Goal: a reader who did not write the code can find, understand and use it, without asking.

## Principles
1. **Lead with the answer.** First paragraph: what it is and what the reader can do with it.
2. **One term per concept.** Choose the Portuguese term once (for example "seção", "comando", "página própria") and keep it. Give the English term in parentheses only once, where needed.
3. **Show, do not describe.** A command, a file path, a table, a short example. Every example must run or match the real code.
4. **Facts only.** Cite the file, test or commit that backs a claim. If unknown, write "não verificado".
5. **Short sentences.** Active voice. No marketing words ("incrível", "poderoso").
6. **Same skeleton for the same kind of doc.** See the templates below.

## Templates

**README (per project):** o que é · como rodar (`npm run dev`) · como testar · estrutura de pastas · onde ficam os dados · links para `docs/`.

**Feature doc (per feature, in `docs/specs/<feature>/`):** o que faz · como usar (passo a passo) · regras · limites · requisitos e status (link para `status.md`).

**ADR:** título · status · contexto · decisão · alternativas · consequências.

**RFC:** problema · proposta · alternativas · riscos · perguntas em aberto · decisão pedida.

**Changelog entry:** o que mudou para quem usa · o que quebrou (se houver) · ID da tarefa ou PR.

## Checks before delivering
- Every command in the doc runs as written.
- Every file path exists.
- PT and EN use the same structure and the same facts.
- No placeholder is left unmarked (use "TODO" with an owner, or "não verificado").