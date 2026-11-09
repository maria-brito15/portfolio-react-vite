# Sessão do terminal

Comportamento da janela de terminal: limpar a tela por comando, carregamento antes de redirecionar, replay sem efeitos, teclado, Tab e idioma.

Grupo de requisitos **TS-xx**. Escrito de forma retroativa a partir do código e dos testes em 09/11/2026: a spec original é `sdd-terminal-v2/requirements.md`, e esta pasta a organiza por feature.

Arquivos: [requirements.md](requirements.md) · [design.md](design.md) · [status.md](status.md) · [tasks.md](tasks.md)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| TS-01 | Cada comando limpa a tela | Só o último comando e sua saída ficam visíveis; `historico` e ↑/↓ guardam tudo | P0 | AUT |
| TS-02 | Janela inicial grande | Largura máxima ~1100 px e altura útil ~75vh (mínimo ~520 px); em 390 px vai de borda a borda | P1 | MAN |
| TS-03 | Carregando antes de redirecionar | Comandos que levam a outra página mostram barra de progresso e `pronto ✓` antes de navegar; `Esc`/`Ctrl+C` cancelam; com `prefers-reduced-motion` vira texto estático | P0 | AUT |
| TS-04 | Replay sem efeitos | Restaurar o histórico ao voltar à home não navega nem anima de novo | P0 | AUT |
| TS-05 | Teclado | `↑/↓` histórico, `Ctrl+L` limpa, `Ctrl+C` cancela a linha | P0 | AUT |
| TS-06 | Tab completa | Completa comando; depois de `cd`/`ls`/`open`, a página; depois de `<página>/` ou `<página> `, a seção; lista as opções quando há mais de uma | P0 | AUT |
| TS-07 | PT/EN | Trocar de idioma redesenha a saída; nomes PT e EN funcionam sempre | P0 | AUT |
| TS-08 | Acessibilidade | Saída com `aria-live`, campo com rótulo, foco visível, itens clicáveis alcançáveis por teclado | P0 | AUT + MAN |
