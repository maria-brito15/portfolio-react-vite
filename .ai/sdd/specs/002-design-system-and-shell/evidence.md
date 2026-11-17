# 002 Design system and shell, evidência
Um bloco por tarefa fechada (conventions.md): Claim, Command, Exit code, Summary, Verdict.

## T0.1 Spike do pré-render dentro do `vite build` (TD-008)
**Entregue:** `spike-002.md` (6 respostas, comandos, veredito **viável com ressalva**). O spike rodou fora do repositório (scratchpad); nada dele foi commitado e nenhum código do site mudou.

```
Claim:     spike-002.md existe, responde às 6 perguntas do TD-008 e traz o veredito
Command:   test -f .ai/sdd/specs/002-design-system-and-shell/spike-002.md; grep -c -E "^### [1-6]\)" spike-002.md; grep -n -E "^\*\*Viável" spike-002.md
Exit code: 0 ; 0 ; 0
Summary:   arquivo presente; 6 respostas (### 1) a ### 6)); veredito na linha 61: "Viável com ressalva"
Verdict:   PASS
```
```
Claim:     o pré-render fecha dentro de um único `vite build` (os detalhes e a hidratação estão no spike-002.md)
Command:   (scratchpad) npm ci --ignore-scripts; npx vite build; node hydrate.mjs; node hydrate.mjs mismatch; node real.mjs
Exit code: 0; 0; 0; 0; 0 (o script do App real captura o erro)
Summary:   dist/sobre.html com <h1> e <main>, modulepreload do chunk lazy, .prerender/ e dist/.vite/ removidos; hidratação igual ao HTML sem aviso e divergência detectada (controle); o App real falha com "window is not defined" (esperado, T2.4/T2.5/T3.3)
Verdict:   PASS (mecanismo); ressalvas registradas no spike-002.md
```
```
Claim:     nada fora de spike-002.md e evidence.md mudou no repositório e o gate passa
Command:   git status --short; npm run verify
Exit code: 0 ; 0
Summary:   só spike-002.md e evidence.md (novos); verify: OK em 114,8 s (orçamento 180 s; execução anterior 168,5 s); 5 de 5 etapas OK
Verdict:   PASS
```
