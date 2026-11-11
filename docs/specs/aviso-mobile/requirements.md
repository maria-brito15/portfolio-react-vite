# Aviso de visualização em celular

Um modal, não bloqueante, avisando que o site é otimizado para desktop,
mostrado uma vez por navegador em telas estreitas.

Grupo de requisitos **MB-xx**. PRD em [prd.md](prd.md).

Arquivos: [prd.md](prd.md) · [requirements.md](requirements.md) ·
[design.md](design.md) · [tasks.md](tasks.md) · [status.md](status.md)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| MB-01 | Detecção de tela estreita | Ao carregar o site com `matchMedia('(max-width: 640px)')` verdadeiro e sem marca prévia em `localStorage`, o modal de aviso é exibido | P0 | AUT |
| MB-02 | Sem aviso em desktop | Com a media query falsa, o modal nunca é montado (não só escondido por CSS) | P0 | AUT |
| MB-03 | Uma vez por navegador | Ao fechar o modal (botão de fechar, clique fora ou Esc), uma marca é salva em `localStorage`; em um novo carregamento da página com a mesma marca presente, o modal não aparece | P0 | AUT |
| MB-04 | Não bloqueante | O modal não impede rolagem nem cliques no conteúdo por trás após ser fechado; fechar sempre funciona e não há estado em que o aviso não possa ser dispensado | P0 | AUT |
| MB-05 | Acessível como diálogo | O modal usa `role="dialog"` e `aria-modal="true"`, recebe foco ao abrir, prende o foco com Tab e fecha com Esc, devolvendo o foco ao elemento anterior — mesmo padrão do `Lightbox` | P1 | AUT |
| MB-06 | Texto nos dois idiomas | O título e o corpo do aviso existem em `src/i18n/ui.ts` para `pt` e `en`, e mudam com o idioma corrente do site | P0 | AUT |
| MB-07 | Estilo único | O modal usa somente tokens de `tokens.css` (cores, espaçamento, raio, fonte); nenhuma cor, fonte ou sombra nova é declarada no CSS do componente | P0 | AUT |
| MB-08 | `localStorage` indisponível não quebra o site | Se `localStorage` lançar erro (modo privado, bloqueio do navegador), o site continua funcionando; o aviso pode aparecer a cada visita nesse caso, mas nunca impede o uso do site | P1 | AUT |
| MB-09 | Sem aviso para robôs de busca | Com user-agent de robô de busca ou de pré-visualização (Googlebot, Bingbot, LinkedInBot…), o modal não é montado, para não ser um intersticial intrusivo no índice mobile-first. Exceção deliberada à regra "sem user-agent" do PRD: só decide se o aviso aparece, nunca o conteúdo | P1 | AUT |
