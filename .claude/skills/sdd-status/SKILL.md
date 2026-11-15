---
name: "sdd-status"
description: "Painel somente leitura: lê o .status de cada feature em .ai/sdd/ e diz onde o projeto está e qual é o próximo passo seguro. Não altera arquivos nem promove .status."
---

# sdd-status
1. Rode `node scripts/status.mjs list` e leia `.ai/sdd/.status` (plano) e `.ai/sdd/INDEX.md`. O `.status` manda; o INDEX é só painel. Se os dois divergirem, diga qual é qual e pare.
2. Para cada feature mostre estado e o próximo passo seguro (ex.: `requirements:draft` → aguardar aprovação da Duda).
3. Nunca edite nada, nunca promova estado.
