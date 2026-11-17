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

## T1.1 Tokens novos, matriz de contraste e regras de CSS (TD-001, TD-003, TD-004, TD-017)
**Entregue:** `src/styles/tokens.css` reescrito (claro em `:root`, escuro em `[data-theme='dark']` e no `@media (prefers-color-scheme: dark)` para `:root:not([data-theme])`; tokens por papel, `--tone-*`, `--tone-dark-*`, `--deco-1` a `--deco-5`, `--dur-*`; blocos dos 3 temas extras removidos; bloco LEGADO); `contrast.test.ts` e `styles.test.ts` reescritos; anel de foco global de 3 px em `base.css`.

**Decisões e desvios (para a Duda conferir):**
- **Isenções de hex ampliadas (aprovadas pela Duda, tasks.md v1.2):** além do `.grid-bg` e do primeiro bloco de impressão do `resume.css`, a varredura achou o segundo bloco de impressão (`resume.css`, `#000`) e o `#fff` do lightbox de `services.css` (4 linhas). O teste os isenta com dono e teto.
- **LEGADO:** `--surface-2`, `--surface-3`, `--nav-bg` e `--grid-color` viraram `color-mix` de tokens novos; `--border`, `--border-ui`, `--text-2` e `--dim` apontam para tokens novos. As cores semânticas sem equivalente no design (`--ok`, `--warn`, `--err`, `--info`, `--accent-2`) **mantêm os hex que já passavam AA** (em vez de "mapear para token novo", que não existe); um teste confere 4,5:1 em `bg` e `surface` nos dois temas.
- **Superfície do tema claro:** o design não a define; usei `#FFFFFF` (hex mais usado nos mockups depois dos tokens). Os tons escuros valem só com `--text` por cima.
- **Foco:** o teste de 3 px cobre a regra global (`a`, `button`); regras locais de páginas antigas (2 px, 1 px) ficam para a spec de cada página.
- **Visual das páginas antigas não foi conferido em navegador** (o `vite dev` não foi aberto nesta tarefa): o tema padrão ainda é o escuro pelo `data-theme="dark"` do `index.html` (T1.5), mas as cores mudaram (acento azul-lilás `#8F98FF`, novo fundo). A conferência visual é da T6.1.

```
Claim:     os testes novos de contraste e de CSS passam e reprovam um par/hex/degradê plantado
Command:   npx vitest run src/styles/contrast.test.ts src/styles/styles.test.ts ; (mutação: --control-border escuro #7a7a84 -> #3a3a44 e ".planted { color: #123456; }" em ui.css, depois restaurados)
Exit code: 0 (limpo, 27 testes) ; 1 na mutação (3 reprovados: par do tema escuro, razões do design, hex fora de tokens.css)
Summary:   as razões batem com as do design (16,82; 6,62; 7,50; 4,17; 7,98; 16,35; 7,71; 7,44; 4,54; 5,98; 6,60); acento e borda de controle sobre --tone-dark-* ficam abaixo do piso e fora da matriz (Achados 4 e 5); arquivos restaurados, git status sem ui.css
Verdict:   PASS
```
```
Claim:     só restam os 2 degradês do `.grid-bg` em src/styles (a T3.4 zera)
Command:   git grep -n -i "gradient(" -- src/styles
Exit code: 0 (achou, como previsto)
Summary:   base.css:57 e base.css:58 (.grid-bg) e a string plantada em styles.test.ts:147 (teste do detector, não é CSS)
Verdict:   PASS (conforme o tasks.md v1.2: "mostra só as 2 linhas do .grid-bg")
```
```
Claim:     o gate passa e respeita o orçamento
Command:   npm run verify
Exit code: 0
Summary:   OK em 84,8 s (formatação 6,7; lint 19,7; tipos 13,3; testes 40,5; geração 4,5). Uma execução anterior marcou 370,7 s com o lint em 306,8 s (exit 0); `npx eslint . --max-warnings 0` isolado levou 23,3 s e a repetição do verify deu 84,8 s: foi carga da máquina, não do código
Verdict:   PASS
```
