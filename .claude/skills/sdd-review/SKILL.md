---
name: "sdd-review"
description: "Revisa uma feature contra requisitos, design e tarefas com evidência de execução, usando o agente reviewer em contexto novo, e escreve review.md. Não adiciona requisitos, não conserta código e não promove .status."
---

# sdd-review
1. Confirme `implementation:done`. Lance o agente `reviewer` (contexto novo) com o caminho da feature.
2. O `review.md` traz um bloco de evidência por tarefa, FR e NFR, a cobertura US → FR → TD → T → evidência e a lista Gaps (só lacunas, sem requisito novo).
3. FAIL significa spec errada ou incompleta: corrija o documento (com aprovação) e regenere o código; nunca remende o código e deixe a spec para trás.
4. `review:done` só depois da confirmação da Duda.
