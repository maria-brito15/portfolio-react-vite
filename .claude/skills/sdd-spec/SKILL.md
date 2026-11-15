---
name: "sdd-spec"
description: "Escreve design.md de uma feature com requirements:approved, incluindo a tabela Requirements Mapping e os TD-NNN. Deixa .status em design:draft. Não escreve tarefas nem código e nunca marca nada como approved."
---

# sdd-spec
1. Confirme com `node scripts/status.mjs check <feature> requirements:approved`. Se falhar ou o `.status` faltar, pare e pergunte.
2. Leia requisitos aprovados e todo o steering. Escreva `design.md`: Executive Summary, Requirements Mapping (todo FR tem casa), Architecture, Data Model, Interface Contract, Segurança, Edge Cases, Technical Decisions (`TD-NNN`, com alternativas e motivo), Verification Strategy e Riscos.
3. Regra que cabe no dado vai para schema e validação. Liste os arquivos antigos que a feature remove (o código novo substitui o antigo no lugar).
4. Grave `design:draft`. NUNCA `design:approved`. Resuma em até 15 linhas e pare.
