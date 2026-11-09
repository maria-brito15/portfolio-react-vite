# Descoberta: a saída ensina o próximo passo

Regra de ouro: **quem nunca entrou no site entende, só de olhar, como abrir cada seção.**
Nenhum comando pode existir só para quem leu o código.

## Padrão obrigatório para toda página com seções

(`curriculo`, `academico`, `servicos`, `projetos`, `experiencias`)

1. **Índice numerado** — `[1] resumo  quem sou, em um parágrafo` … uma linha por seção, com
   nome e descrição, mais a frase "N seções. Digite o número ou o nome para abrir aqui no terminal:".
2. **Linha de dicas** — ver uma seção (`curriculo 2` ou `curriculo competencias`), abrir a página
   (`cd curriculo`), listar de novo (`ls curriculo`), início (`cd ~`), ajuda.
3. **Itens clicáveis** — cada linha `[n]` executa `<página> n` (componente `RunCommand` em
   `src/terminal/pageIndex.jsx`); essencial no celular.
4. **Número como atalho** — `curriculo 2`; e, logo após o índice, só `2` abre a seção da
   última página aberta (a sessão guarda esse contexto). Sem contexto: mensagem
   `term.nav.noContext`.
5. **Vizinhos no fim da seção** — `próxima: curriculo 3 (…) · anterior: curriculo 1 (…) · índice: curriculo`
   (componente `SectionNav`), os três clicáveis; limites: "esta é a primeira/última seção".
6. **`proximo` / `anterior` (e `n` / `p`)** andam pelas seções da última página aberta.
7. **Erro que reensina** — `curriculo 9` / `curriculo xpto`: mensagem `term.nav.notExist(arg)` **e** o
   índice de novo.
8. **`ls <página>` e o comando da página mostram o MESMO índice** (um renderizador só: `PageIndex`).
9. **Primeira visita** — sem histórico salvo, o banner sugere `term.firstVisit`; o placeholder do
   campo nunca fica vazio e traz um exemplo (`term.try` + `curriculo`).
10. **`ajuda`** traz o bloco "como navegar" (`term.nav.howTo`/`howToSteps`): `curriculo` → `2` → `cd curriculo`.

## Onde estão as peças

- Componentes: `src/terminal/pageIndex.jsx` (`PageIndex`, `SectionNav`, `RunCommand`)
- Seções por página: `src/data/sections.js` (`sectionsOf`, `findSection`, `neighbors`)
- Textos PT/EN: `src/i18n/ui.js` → `term.nav.*`, `term.firstVisit`, `term.try`
- Visão de cada seção: `src/terminal/sectionViews.jsx`

Antes de criar texto novo, procure a chave em `ui.js`: várias já existem. Código e texto
sem uso são lacuna, não sobra para apagar (ver `docs/sdd-terminal-v2/gap-analysis.md`, DS-01 a DS-12).
