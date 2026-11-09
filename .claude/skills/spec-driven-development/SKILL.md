---
name: "spec-driven-development"
description: "Use to run the specification-to-implementation workflow for a feature or change: PRD, specification, plan, tasks, implementation, verification, and keeping the spec in sync with the code. Trigger on new features, redesigns, behaviour-changing fixes, and requests to document or check a feature against its spec."
---

# Spec-Driven Development

Flow: **PRD → Specification → Plan → Tasks → Implementation → Verification**, with the spec kept in sync at the end.

## Folder per feature
```
docs/specs/<feature>/
  prd.md            # problema, objetivo, fora de escopo (opcional para ajustes pequenos)
  requirements.md   # requisitos com ID, EARS e critério de aceite (requirements-engineering)
  design.md         # decisões e arquivos afetados (software-architecture)
  tasks.md          # tarefas ordenadas, cada uma ligada a requisitos
  status.md         # tabela de status ✅ ◐ ❌ ❔ com evidência
```

## Phases and gates
1. **PRD.** Only for new features. Stop for approval.
2. **Specification.** `requirements.md`. Stop for approval before design.
3. **Plan.** `design.md`, with options considered and the chosen one. Stop for approval if a decision changes the goal.
4. **Tasks.** Each task: ID, requirements covered, depends on, "feito quando" (a test that passes). Small enough for one commit.
5. **Implementation.** One task per commit; the commit message carries the task ID. Write the failing test first when the requirement is behavioural.
6. **Verification.** Run lint, tests, build and any visual check. Then update `status.md` with evidence: file and line, or the test name. Mark ✅ only after the test ran.
7. **Sync.** If the code now differs from the spec on purpose, change the spec and say so. Never leave silent drift.

## Rules
- Do not start implementation of a new feature before its specification is approved.
- A bug fix that changes behaviour updates the requirement that covered it, or adds one.
- Compute status counts with a script rather than by hand.
- Retroactive specs are allowed for features already built: set each requirement's status from the code and tests, and mark uncertain items ❔.