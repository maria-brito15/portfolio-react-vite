# Acessibilidade e responsivo

- Contraste AA (4,5:1) em texto: `scripts/contrast.mjs` cobre os dois temas. Atenção ao âmbar e ao verde no claro.
- Terminal: `aria-live` na saída, input com rótulo "Linha de comando do terminal", foco visível, itens clicáveis do índice operáveis por teclado.
- Navegação: `aria-current="page"`; toggles com `aria-expanded`/`aria-pressed`; sem armadilha de foco.
- Responsivo: largura de leitura `--measure`; janela de borda a borda no celular; tabelas viram cards (<600px); sem rolagem horizontal em 390px.
- Movimento: toda animação respeita `prefers-reduced-motion` (a barra de carregamento vira texto).
- Impressão: `@media print` do currículo esconde shell/terminal e usa texto escuro sobre branco; confira o PDF real.
