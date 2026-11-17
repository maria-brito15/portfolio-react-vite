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

## T1.2 Só dois temas no código (TD-011, D-002)
**Entregue:** `Theme = 'light' | 'dark'` (`src/types.ts`); `src/data/themes.ts` com 2 temas e `DEFAULT_THEME = 'light'` (por ora; a T1.3 passa a resolver pelo sistema); lista de ids do script inline do `index.html` reduzida a `['dark', 'light']`; `themes.test.tsx` ajustado. O tom `amber` de componente (`tones.ts`, `Chip`) não é tema e ficou. O seletor do cabeçalho e o comando `tema` passam a listar só os dois temas (leem `themes`).

```
Claim:     nenhuma referência aos 3 temas extras em themes.ts, types.ts, tokens.css e index.html
Command:   git grep -n -i -E "dracula|solarized|'amber'" -- src/data/themes.ts src/types.ts src/styles/tokens.css index.html
Exit code: 1 (nenhuma ocorrência)
Summary:   limpo nos 4 arquivos
Verdict:   PASS
```
```
Claim:     o comando `tema` e o seletor oferecem só os dois temas; valor antigo (`dracula`) no localStorage é ignorado
Command:   npx vitest run src/data/themes.test.tsx
Exit code: 0
Summary:   13 testes: tabela com 2 temas; `dracula`/`solarized`/`amber`/`ambar` não são tema nem são achados por `findTheme`; o script inline do index.html, executado, ignora `dracula` salvo e aplica `light`; `tema dracula` dá "tema não encontrado" e lista 2; seletor com 2 opções; `data-theme` desconhecido cai em DEFAULT_THEME
Verdict:   PASS
```
```
Claim:     o gate passa
Command:   npm run verify
Exit code: 0
Summary:   OK em 86,0 s (orçamento 180 s): formatação 3,8; lint 10,9; tipos 7,1; testes 61,2; geração 2,9
Verdict:   PASS
```

## T1.3 Módulo de boot autocontido: tema e faixa de idioma (TD-011, TD-012)
**Entregue:** `src/boot/boot.ts` (sem imports) com `resolveTheme({ stored, systemDark })`, `languageOffer({ path, storedLang, dismissed, navigatorLangs, storageOk, bare? })` e `bootSource()` (texto do script inline, montado com `Function.prototype.toString`; cada função autocontida); `src/boot/boot.test.ts` (projeto `unit`). **Ainda não é injetado no HTML** (isso é a T1.5).

**Decisões de interpretação (para a Duda conferir):**
- `languageOffer` devolve `true` quando a faixa deve aparecer (a UI e o link para o `enPath` são da T2.6).
- "O idioma preferido do navegador é o inglês" = só o **primeiro** item de `navigator.languages`, pelo subtag principal (`en`, `en-US`, `EN-gb`); `['pt-BR', 'en']` não oferece.
- Sob `/en` ou `/en/...` vale o endereço (sem faixa); `/entrada` não é inglês. Em `/xyz` inexistente a regra segue igual (a tabela só fixa o 404 no idioma do endereço).
- Com o armazenamento bloqueado, a escolha e a dispensa **não são lidas** (a faixa volta a cada visita em inglês, FR-026).
- A rota sem casca (`bare`, FR-041) nunca marca `data-lang-offer`; o script lê `data-shell="bare"` do `<html>` (o build grava na T4.1/T4.2), e a função recebeu a entrada opcional `bare`.
- Chaves lidas: `portfolio-theme`, `portfolio-lang` e `portfolio-lang-offer` (`'dismissed'`).

```
Claim:     as 7 linhas da tabela de tema e as de idioma passam; o script avaliado em vm decide igual às funções
Command:   npx vitest run src/boot/boot.test.ts
Exit code: 0
Summary:   39 testes: tema (6 linhas da tabela + valor de outro tipo; `dracula` ignorado); idioma (9 linhas da tabela e variações: `/en`, `/en/`, `/entrada`, bare, lista vazia, só o 1º idioma conta, maiúsculas); o script em vm confere com as funções em todas as combinações de tema (5 x 2) e de idioma (4 caminhos x 3 x 2 x 4 listas x 2 de armazenamento); bloqueado sem erro; sem matchMedia sem erro
Verdict:   PASS
```
```
Claim:     as funções são autocontidas e o arquivo não tem imports
Command:   (mesmo arquivo de teste) cada função avaliada sozinha em contexto vazio; varredura de `import`/`require` em boot.ts; script com identificador livre plantado; busca de `__name` no texto do script
Exit code: 0
Summary:   as duas funções rodam sem identificador livre; nenhum `import`; o identificador livre plantado (`outroModulo`) lança "is not defined" (a guarda enxerga o problema); o script não leva helpers do esbuild
Verdict:   PASS
```
```
Claim:     o gate passa
Command:   npm run verify
Exit code: 0
Summary:   OK em 80,7 s (orçamento 180 s): formatação 4,0; lint 11,7; tipos 8,2; testes 53,5; geração 3,3
Verdict:   PASS
```

## T1.4 Fontes IBM Plex, licença e teste de peso (TD-016, DQ-003)
**Entregue:** 3 WOFF2 em `public/fonts/` (Plex Sans 400 e 600, Plex Mono 400, subconjunto Latin1 oficial da IBM) e `public/fonts/LICENSE-IBM-Plex.txt` (autor, OFL 1.1 completa, origem, data, versões e SHA-256 parcial); `@font-face` em `tokens.css` com `font-display: swap` e o `unicode-range` do subconjunto oficial; duas fontes reservas com métricas ajustadas (`size-adjust`); `--font-sans` e `--font-mono` trocados; `jetbrains-mono-*.woff2` removidos; os `preload` do `index.html` passaram para as 3 fontes novas (a T1.5 só confere e acrescenta o resto do `<head>`); `scripts/assets.test.ts` novo; `styles.test.ts` ajustado (duas famílias).

**Origem oficial:** pacotes npm da IBM (`@ibm/plex-sans` 1.1.0 e `@ibm/plex-mono` 2.5.0, licença OFL-1.1, repositório `github.com/ibm/plex`), baixados com `npm pack` em pasta nova e vazia do scratchpad em 2026-11-17; arquivos copiados sem modificação (a OFL proíbe vender sozinhos e exige manter a licença). As duas `LICENSE.txt` são idênticas (conferido com `cmp`).

**Teste de peso (DQ-003):**
| Arquivo | Bytes |
| --- | --- |
| `ibm-plex-sans-latin-400.woff2` | 20.984 |
| `ibm-plex-sans-latin-600.woff2` | 22.260 |
| `ibm-plex-mono-latin-400.woff2` | 17.544 |
| **Total (3 arquivos)** | **60.788** (59,4 KB) |
Antes: `jetbrains-mono-latin.woff2` 31.432 + `-latin-ext` 11.624 = 43.056 bytes. Passou de 4 arquivos? **Não** (3). Compromete o LCP? **Não medido ainda**: o LCP real em celular é da T5.3 (Lighthouse). O que dá para dizer agora: +17.732 bytes no total, os 3 arquivos entram por `preload` e a troca (`swap`) tem reserva ajustada. **Plano B (fonte do sistema) não foi acionado.** Se a T5.3 mostrar LCP acima de 2,5 s por causa das fontes, volta à Duda.

**Fontes reservas (cálculo):** a partir das métricas dos arquivos: largura média de a-z em em/em de 0,5050 (Plex Sans) contra 0,4895 (Arial) dá `size-adjust` 103,15% (ascendente 99,4%, descendente 26,7%); Plex Mono 0,6000 contra Courier New 0,6001 dá 99,98%. É uma aproximação por letras minúsculas; o CLS real é medido na T5.3.

**Pontos para a Duda conferir:**
- O subconjunto Latin1 cobre português e os sinais de pontuação comuns, mas **não** cobre setas, símbolos de caixa nem `●`; as páginas antigas que os usam caem na fonte do sistema. (O JetBrains tinha só `↑ ↓` entre eles.)
- O peso 500 do mockup não existe: o design manda usar 400 ou 600.
- As páginas antigas continuam usando só `--font-mono`, agora Plex Mono (efeito visual: outra fonte mono, mesmas medidas aproximadas).

```
Claim:     fontes só do próprio site, no máximo 2 famílias e 4 arquivos, swap, licença e atribuição presentes
Command:   npx vitest run scripts/assets.test.ts src/styles
Exit code: 0
Summary:   37 testes (assets 10 + styles 27): 2 famílias (IBM Plex Mono e IBM Plex Sans) e 3 arquivos; swap em todo @font-face com arquivo; url() só em /fonts/*.woff2 existentes; todo arquivo de fonte é usado; fontes reservas só com local(); nenhuma URL externa em CSS nem no index.html; preloads = as 3 fontes; licença com autor, OFL 1.1, origem, data, versões e tamanho real de cada arquivo
Verdict:   PASS
```
```
Claim:     nenhum jetbrains-mono no repositório (src, index.html, public)
Command:   git grep -n -i "jetbrains" -- src index.html public
Exit code: 1 (nenhuma ocorrência)
Summary:   os 2 arquivos foram removidos (git rm); sem referência em CSS, HTML nem testes
Verdict:   PASS
```
```
Claim:     o gate passa e o build leva as fontes novas
Command:   npm run verify ; ls -l dist/fonts
Exit code: 0 ; 0
Summary:   OK em 69,1 s (orçamento 180 s): formatação 4,4; lint 11,2; tipos 7,4; testes 42,5; geração 3,7; dist/fonts com os 3 WOFF2 e a licença
Verdict:   PASS
```
