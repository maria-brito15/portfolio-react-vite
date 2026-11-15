---
name: "sdd-exec"
description: "Implementa uma tarefa de tasks.md quando o .status é tasks:approved ou além: confirma antes de construir, para em ambiguidade e fecha com bloco de evidência. Não roda sem o gate e não promove .status."
---

# sdd-exec
1. `node scripts/status.mjs check <feature> tasks:approved`. Código diferente de 0 ou `.status` ausente: PARE e pergunte.
2. Antes da primeira tarefa, restate os FRs e as restrições com suas palavras e espere o OK da Duda.
3. Uma tarefa por vez, com os testes da tarefa. Os requisitos em EARS são o critério de aceitação. Ambiguidade: pare, pergunte e leve a resposta para a spec antes do código.
4. Feche a tarefa com Claim, Command, Exit code, Summary, Verdict. Sem comando: verificação manual com a limitação declarada.
5. `implementation:in-progress` ao começar; `implementation:done` só com a confirmação da Duda. Sem `git push`.
