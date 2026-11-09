---
name: "software-architecture"
description: "Use to evaluate designs, trade-offs and technical decisions: choosing a structure, a dependency, a data model or a pattern, and recording the decision as an ADR with its alternatives and consequences."
---

# Software Architecture

Goal: make a design choice explicit, compare it with real alternatives, and record why it was made.

## When to use
- A change touches more than one module, or adds a new dependency, data shape or routing rule.
- Two reasonable designs exist and the team would otherwise pick one by habit.
- A past decision is being reversed.

## Steps
1. **Name the forces.** Constraints that matter here: single source of truth for routes, no new runtime dependencies, bilingual content, mobile first, print output, testability with Vitest.
2. **List 2 to 3 options.** Include "do nothing" when it is real.
3. **Compare on the forces,** not on taste. A short table: option, what it fixes, what it costs, what it blocks.
4. **Pick one and say why** in one paragraph. Name the trade-off accepted.
5. **Record an ADR** (`docs/adr/NNNN-titulo.md`): context, decision, alternatives, consequences, status (proposed, accepted, superseded).
6. **Check the consequences** against the code: which files, which tests, which specs change.

## Project specifics for this portfolio
- The route table in `src/data/routes.js` and the sections table in `src/data/sections.js` are the single sources of truth. A design that duplicates a path elsewhere is rejected.
- The terminal and the pages share one session and one set of views. Prefer extending views over adding a second rendering path.
- Content lives in `src/data/*` and `src/i18n/ui.js`; visual rules live in `src/styles/tokens.css`.

## Avoid
- Choosing a framework or library without a stated constraint it satisfies.
- Writing an ADR after the fact to justify existing code without marking it as retroactive.
- Treating a decision as permanent: mark it superseded instead of editing history.