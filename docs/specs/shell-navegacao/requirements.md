# Shell e navegação

Header em três zonas, barra de comandos fixa, voltar e breadcrumb, atalhos, mobile, rotas únicas e links antigos.

Grupo de requisitos **SH-xx**. Escrito de forma retroativa a partir do código e dos testes em 09/11/2026: a spec original é `sdd-terminal-v2/requirements.md`, e esta pasta a organiza por feature.

Arquivos: [requirements.md](requirements.md) · [design.md](design.md) · [status.md](status.md) · [tasks.md](tasks.md)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| SH-01 | Header em três zonas, sem menu de links | Esquerda: acesso a comandos (`>_ Ctrl K`); centro: `mariab.dev` centralizado; direita: exatamente dois controles (tema e idioma). Nenhum `☰` nem lista de páginas | P0 | AUT |
| SH-02 | Logo centralizado de verdade | O header é uma grade `1fr auto 1fr`; o logo fica no meio em qualquer largura | P1 | MAN |
| SH-03 | Barra de comandos fixa em todas as páginas | Mesma barra logo abaixo do header em todas as rotas, com a mesma sessão do terminal da home | P0 | AUT |
| SH-04 | Voltar e breadcrumb nas páginas internas | Toda página fora da home tem "← Voltar" (`history.back()` se a página anterior é do site, senão `/`) e breadcrumb (`~ / curriculo`) | P0 | AUT |
| SH-05 | Atalhos de teclado | `/` foca a barra, exceto dentro de campos de formulário; `Ctrl+K` e o botão `>_` do header abrem a paleta de comandos (o atalho vale também com o foco na linha de comando, não em outros campos); `?` abre a lista de atalhos; `Esc` fecha painel, diálogo ou tela cheia, ou desfoca. **Alterado em 11/11/2026** (feature `experiencia-interativa`, JA-06/JA-08): antes `Ctrl+K` focava a barra | P0 | AUT |
| SH-06 | Mobile | A barra vira o botão `>_` que a abre em tela cheia; sem rolagem horizontal em 390, 768 e 1440 px em nenhuma rota | P0 | AUT + MAN |
| SH-07 | Par de ações em toda página dedicada | A barra de título da Window mostra `[ ver no terminal ]  [ página própria ]`; o primeiro leva à home com o comando já executado (`/?cmd=…`) | P0 | AUT |
| SH-08 | Tabela única de rotas | Caminhos, nomes de comando (PT/EN), breadcrumb, `ls`, `cd` e autocompletar vêm de `src/data/routes.ts`; seções internas, de `src/data/sections.ts` | P0 | AUT |
| SH-09 | Seções antigas da home como páginas próprias | `/sobre`, `/habilidades`, `/projetos`, `/experiencias`, `/contato` existem, com aliases em inglês | P0 | AUT |
| SH-10 | Links antigos não levam a lugar nenhum | Um link antigo `/#sobre`, `/#projetos`… abre a página própria equivalente (redirecionamento no cliente) em vez de cair na home sem rolar | P1 | AUT |
