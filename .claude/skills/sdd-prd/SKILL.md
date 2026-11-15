---
name: "sdd-prd"
description: "Escreve requirements.md (o quê e o porquê) de uma feature nova em .ai/sdd/specs/NNN-nome/, em EARS com MoSCoW, e deixa .status em requirements:draft. Não escreve design, tarefas nem código e nunca marca nada como approved."
---

# sdd-prd
1. Leia `AGENTS.md`, `.ai/steering/*` e `.ai/sdd/PLAN.md`. O número NNN vem do sistema de arquivos (maior prefixo em `.ai/sdd/specs/` + 1), nunca da memória.
2. Escreva `requirements.md` pelo modelo: Overview, Goals, Non-Goals (≥ 3), User Stories com critérios testáveis, FRs em EARS (SHALL nunca vira "should"), NFRs com número (desempenho, segurança, acessibilidade), Constraints, Decisions, Questions, Implementation FAQ, Success Metrics, Risks e "Confirm before building".
3. Sem tecnologia aqui: se disser "React", pertence ao design. Tabelas entrada → saída para validação, filtro, ordenação e estados vazios.
4. Grave `requirements:draft` no `.status`. NUNCA `requirements:approved`: só a Duda promove.
5. Passe a checklist do §6 do prompt mestre (3 itens desmarcados = não está pronto), resuma em até 15 linhas e pare.
