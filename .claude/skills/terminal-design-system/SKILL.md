---
name: terminal-design-system
description: >
  Estilizar ou revisar o VISUAL do portfólio: CSS, tokens de cor, tipografia,
  espaçamento, componentes de `components/ui/` (Card, Chip, DataTable,
  SectionTitle, ActionLink), janela/Window, tema claro/escuro, contraste AA,
  responsivo 390px, `prefers-reduced-motion`, impressão. Garante UM só estilo
  (terminal/IDE): mono único, sem degradê, sem fonte de marketing.
when_to_use: >
  Qualquer mudança em src/styles/*.css, em classes de componentes ou em cores.
  Não usar para lógica de comando ou rotas.
effort: medium
---

# terminal-design-system

O site tem **uma** linguagem visual: terminal/IDE rico (TUI bonito). A suíte `src/styles/styles.test.js`
protege isso; esta skill ensina a trabalhar dentro dela.

## Mapa de leitura

| Tarefa | Leia antes |
| --- | --- |
| Escolher cor, fonte, espaço, raio | `references/tokens.md` |
| Montar tela com Card/Chip/DataTable/SectionTitle | `references/componentes.md` |
| Revisar acessibilidade/contraste/responsivo | `references/a11y-e-responsivo.md` + `scripts/contrast.mjs` |
| Criar ou mudar um tema | `assets/checklist-tema.md` |

## Regras

1. **Uma fonte:** só `var(--font-mono)`. Hierarquia por peso e tamanho (`--fs-*`), nunca por família.
2. **Sem texto em degradê** e sem `background-clip: text`. Destaque = cor sólida de acento ou peso.
3. **Cor com significado:** azul `--accent` = link/caminho · verde `--ok` = ok/ativo/usuário · âmbar `--warn` = comando/ação · vermelho `--err` = erro. Não use cor como enfeite.
4. **Tudo vem de token** (`var(--…)`), inclusive espaço (`--space-*`) e raio (`--radius-*`). Valor mágico novo = token novo em `tokens.css` (escuro **e** claro).
5. **Variável usada precisa estar definida** (o teste reprova).
6. **Superfície = painel:** janela com barra de título; sub-painel com borda 1px `--border` e fundo `--surface-2`. Sem card arredondado sombreado.
7. **Movimento no idioma do terminal** (cursor, barra de progresso). Tudo com `@media (prefers-reduced-motion: reduce)`.
8. **Sem rolagem horizontal em 390px** (`document.documentElement.scrollWidth === innerWidth`).
9. **Impressão do currículo** (`@media print` em `resume.css`) não se toca sem conferir o PDF.
10. Arquivo de estilo novo só se houver um domínio novo; senão, estenda o existente (`shell`, `ui`, `sections`, `terminal`…).

## Passos

1. Ler o arquivo CSS que será tocado e `tokens.css`.
2. Reaproveitar componente de `components/ui/` antes de escrever CSS novo.
3. Conferir contraste: `node .claude/skills/terminal-design-system/scripts/contrast.mjs` (exit 1 = reprovou).
4. `npm test -- styles` e depois `verify-site`.
5. Se mudou cor ou aparência visível, capture 1440×900 e 390×844, claro e escuro (ver `verify-site/references/capturas.md`).
