# Estilo único (terminal/IDE)

Uma só linguagem visual: mono, paleta de terminal, sem degradê, janelas com a mesma pele.

Grupo de requisitos **ES-xx**. Escrito de forma retroativa a partir do código e dos testes em 09/11/2026: a spec original é `sdd-terminal-v2/requirements.md`, e esta pasta a organiza por feature.

Arquivos: [requirements.md](requirements.md) · [design.md](design.md) · [status.md](status.md) · [tasks.md](tasks.md)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| ES-01 | Uma única família de fonte | A única `font-family` declarada em `src/styles/*.css` é JetBrains Mono (em `tokens.css`) ou `var(--font-mono)`; `index.html` só carrega JetBrains Mono | P0 | AUT |
| ES-02 | Sem Syne, DM Sans nem texto em degradê | Nenhum CSS ou HTML contém `Syne`, `DM Sans`, `grad-text`, `grad-warm` ou `background-clip` | P0 | AUT |
| ES-03 | O CSS do "mundo marketing" não existe | Não há `original.css` nem `portfolio.css`; nenhum comentário ou import os cita | P1 | AUT |
| ES-04 | Tokens únicos | Toda variável CSS usada está definida; cores, espaçamentos, raios e sombras vêm de `tokens.css`, nos temas claro e escuro | P0 | AUT |
| ES-05 | Contraste AA | Texto e acentos têm razão ≥ 4,5:1 sobre `--surface`, `--surface-2` e `--surface-3`, nos dois temas | P0 | AUT |
| ES-06 | Cor com significado fixo | Azul = links/caminhos, verde = ok/ativo, âmbar = comando/ação, vermelho = erro, em páginas e terminal | P1 | MAN |
| ES-07 | Todas as páginas dentro de uma `Window` | Home, Currículo, Acadêmico, Serviços, Estudo de caso, páginas de seção e 404 usam o mesmo `SiteShell` (Header → barra de comandos → Window → Footer) | P0 | AUT |
| ES-08 | Componentes compartilhados | Card, Chip, DataTable, SectionTitle e ActionLink têm uma só implementação, usada pelas páginas; sem estilo de card próprio por página | P1 | MAN |
| ES-09 | Impressão do currículo | `/curriculo` impresso (PDF) não mostra header, barra de comandos nem moldura; o conteúdo cabe sem cortes | P0 | MAN |
| ES-10 | Movimento no idioma do terminal | Sem animações genéricas de entrada (fade/slide); movimento limitado a cursor, barra de progresso e digitação; respeita `prefers-reduced-motion` | P1 | AUT + MAN |
