# Status — Estilo único (terminal/IDE)

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Fonte: análise de lacunas de 09/11/2026.

| ID | Estado | Evidência |
| --- | --- | --- |
| ES-01 | ✅ | `src/styles/styles.test.js` ("a única família de fonte…"); `index.html` carrega só JetBrains Mono |
| ES-02 | ✅ | `styles.test.js` ("não sobra Syne, DM Sans nem degradê"); varredura de `src` e `index.html` sem ocorrência fora do teste |
| ES-03 | ✅ | Arquivos antigos removidos e testado (`styles.test.js`); o comentário obsoleto de `ui.css:3` foi corrigido e o teste "nenhum CSS cita folhas que não existem mais" barra `original.css`/`portfolio.css` em qualquer CSS (verificado por mutação com um CSS temporário). `grep original.css src --include=*.css` vazio |
| ES-04 | ✅ | `styles.test.js` ("toda variável usada está definida"); `tokens.css` com temas claro e escuro |
| ES-05 | ✅ | Teste `src/styles/contrast.test.js` (8): lê `tokens.css` nos dois temas e exige ≥ 4,5:1 de accent, ok, warn, err, text, text-2 e dim contra surface, surface-2 e surface-3, mais on-accent sobre accent. Verificado por mutação: com `--warn` escuro trocado por `#6b4a22` o teste falha (2,40:1); tokens restaurados |
| ES-06 | ◐ | Auditoria das cores computadas no Chrome (10 rotas × claro/escuro × 1440/390 px, texto com cor de token) + 3 das 43 capturas vistas (`estilo-home-desktop-dark`, `estilo-curriculo-desktop-light`, `estilo-projetos-mobile-dark`); as outras 40 não foram abertas uma a uma. **Conforme:** vermelho só em erro (nenhuma ocorrência fora do terminal); verde em `t-user` (prompt) e chips de "ok"; âmbar nos botões, `>_` do header e comandos; azul em links, caminhos e `code`. **Desvios** (o token é de outro papel): (1) âmbar em selos/destaques — `proj-bdg`, `extra-bdg`, `doc-award`, `design-disclaimer-label` ("Finalista · PUC Minas"), que não são comando nem ação; (2) azul em texto decorativo — título "Duda Brito" e linha de cargos da home, números `doc-num`/`xp-num`, `sk-time`, `chip`, `case-tech-label`, "destaque" no título de Projetos — não são link nem caminho; (3) emojis coloridos (🌐 ☀ 📅 🏆) fora da paleta. Decisão de design pendente: ajustar o uso ou declarar no README que azul também marca ênfase e âmbar também marca destaque |
| ES-07 | ✅ | `src/components/shell/SiteShell.test.jsx` (layout das rotas); `App.jsx` envolve todas as páginas |
| ES-08 | ✅ | `components/ui/` (Card, Chip, DataTable, SectionTitle, ActionLink) importado por Resume, Academics, Services e `sections/portfolio/*`; `ui.test.jsx` |
| ES-09 | ✅ | Conferido no Chrome em modo de impressão (A4, `/curriculo`): sem header, barra de comandos, moldura, rodapé nem botão de imprimir; competências e experiências abertas; ~3 páginas A4. Dois desvios achados e corrigidos: o botão "Imprimir" saía no papel (`.doc-actions` agora oculto, `resume.css`) e no tema escuro o texto saía cinza-claro sobre branco (`tokens.css` usa os tokens claros em `@media print`; teste `contrast.test.js` › "a impressão usa os mesmos tokens do tema claro"). PDF em `docs/screenshots/curriculo-impressao.pdf`. **Limite:** as quebras de página foram vistas na renderização em modo de impressão, não rasterizando o PDF (sem `pdftoppm` aqui) |
| ES-10 | ✅ | `Reveal` não existe mais; só restam `@keyframes term-blink` e `term-type`; `TerminalSession.jsx:27` respeita `prefers-reduced-motion` |

Resumo: ✅ 9 · ◐ 1 · ❌ 0 · ❔ 0
