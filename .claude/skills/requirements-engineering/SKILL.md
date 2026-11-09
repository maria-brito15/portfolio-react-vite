---
name: "requirements-engineering"
description: "Use to elicit, analyze, validate and structure requirements before designing or coding: turning a request or idea into testable requirements with IDs, acceptance criteria and open questions."
---

# Requirements Engineering

Goal: turn a vague ask into requirements that someone can test. Do this before design or code.

## When to use
- A new feature, page, command or content area is requested.
- A request contains words like "melhor", "mais intuitivo", "bonito", "consistente" without a measurable criterion.
- Two requests may conflict, or a requirement has no owner.

## Steps
1. **Elicit.** Restate the goal in one sentence: who does what, and why. Ask only the questions that change the design.
2. **Separate kinds.** Functional behaviour, content (data the owner must supply), visual rules, non-functional (accessibility, performance, print, mobile).
3. **Write each requirement in EARS form:** "Quando <gatilho>, o sistema deve <resposta observável>." One behaviour per requirement.
4. **Give each an ID and a group prefix** (for example ES, SH, CM, DS, DT, NF) and continue the existing numbering. Do not reuse retired IDs.
5. **Attach an acceptance check** that a test or a manual step can decide, for example: "Digitar `2` após o índice abre a seção 2".
6. **Mark unknowns** as open questions with an owner. Never fill a missing fact (date, grade, company) with a guess.
7. **Validate.** Check each requirement is testable, unambiguous, consistent with the others, and necessary. Flag duplicates.

## Output
A `requirements.md` in the feature folder (see `technical-writing`), with: goal, out of scope, requirements table (ID, statement, acceptance check, status), open questions.

## Avoid
- Requirements that describe the implementation ("usar useState") instead of the behaviour.
- Adjectives without a check ("intuitivo" needs a stated test, such as a first-time user finds the section in under three commands).
- Silently dropping a requirement that the code no longer meets; record it as a gap.