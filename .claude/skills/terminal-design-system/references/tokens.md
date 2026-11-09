# Tokens (`src/styles/tokens.css`)

Escuro é o padrão em `:root`; `[data-theme='light']` só sobrescreve o que muda.

| Papel | Token | Uso |
| --- | --- | --- |
| Fundo da página | `--bg` | atrás da janela |
| Janela | `--surface` | corpo do painel |
| Barra de título / sub-painel | `--surface-2` | cabeçalhos, tabelas, cards |
| Trilhas e realces | `--surface-3` | barras de progresso, hover |
| Borda | `--border` | 1px em tudo |
| Texto | `--text` · `--text-2` · `--dim` | principal · secundário · rótulos |
| Acento (link/caminho) | `--accent` (+ `--on-accent`) | links, caminho, foco |
| Ok/ativo | `--ok` | usuário, sucesso, "em andamento" |
| Comando/ação | `--warn` | comandos, destaques de ação |
| Erro | `--err` | mensagens de erro |

Tipografia: `--font-mono`, `--fs-chrome` (0.75rem), `--fs-body`, `--fs-mono`, `--fs-mono-sm`,
`--fs-h1` (1.9rem), `--fs-h2` (1.1rem), `--lh-mono` (1.65), `--measure` (72ch).
Espaço: `--space-1…7` (0.25→3rem), `--gutter`. Raio: `--radius-sm/md/lg/pill`.
Layout: `--win-max`, `--win-min-h`, `--win-h`, `--nav-h`, `--cmdbar-h`, `--top-h`.

Novo token: defina em `:root` **e** em `[data-theme='light']`, rode `contrast.mjs` se for cor de texto.
