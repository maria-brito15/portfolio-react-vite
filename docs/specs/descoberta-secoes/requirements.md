# Descoberta das seções pelo terminal

Quem nunca entrou no site aprende sozinho: índice numerado, número como atalho, vizinhos, erros que reensinam, primeira visita.

Grupo de requisitos **DS-xx**. Escrito de forma retroativa a partir do código e dos testes em 09/11/2026: a spec original é `sdd-terminal-v2/requirements.md`, e esta pasta a organiza por feature.

Arquivos: [requirements.md](requirements.md) · [design.md](design.md) · [status.md](status.md) · [tasks.md](tasks.md)

Regra de ouro (V-05): quem digita `curriculo` pela primeira vez entende, só de olhar, como abrir cada seção.
| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| DS-01 | O comando da página mostra um índice numerado | `curriculo` imprime `[1] resumo … [6] reconhecimentos`, cada linha com nome e descrição, mais a linha "digite o número ou o nome" | P0 | AUT |
| DS-02 | Linha de dicas sempre presente | O índice termina com 3 dicas em linguagem natural: ver uma seção (`curriculo 2` ou `curriculo competencias`), abrir a página (`cd curriculo`), listar de novo (`ls curriculo`), início (`cd ~`) e ajuda | P0 | AUT |
| DS-03 | `ls <página>` mostra o mesmo índice | Uma função só renderiza o índice para o comando da página e para `ls <página>` | P0 | AUT |
| DS-04 | Itens do índice são clicáveis | Cada linha `[n]` é um botão que executa `<página> n`, alcançável por teclado; funciona no toque | P0 | AUT |
| DS-05 | Número sozinho abre a seção | Depois do índice de uma página, digitar só `2` abre a seção 2 dessa página; sem índice aberto, responde "nenhum índice aberto. Digite curriculo (ou ls) para começar." | P0 | AUT |
| DS-06 | Vizinhos ao fim de cada seção | A seção termina com `próxima: curriculo 3 (experiencias) · anterior: curriculo 1 (resumo) · índice: curriculo`, os três clicáveis; na primeira/última seção, "esta é a primeira/última seção" | P0 | AUT |
| DS-07 | `proximo` e `anterior` | `proximo`/`anterior` (e `n`/`p`) andam pelas seções da última página aberta; nos limites, respondem com a mensagem de primeira/última | P1 | AUT |
| DS-08 | Primeira visita guiada | Sem histórico salvo, o banner sugere o primeiro passo ("Primeira vez? Digite ls para ver tudo, ou ajuda."); com histórico, não aparece | P1 | AUT |
| DS-09 | Placeholder com exemplo | O campo nunca fica vazio e propõe um exemplo concreto (`experimente: curriculo`) | P1 | AUT |
| DS-10 | Erros que reensinam | `curriculo 9` e `curriculo xpto` respondem com o erro (`seção "9" não existe; as seções são:`) **e** reimprimem o índice | P0 | AUT |
| DS-11 | `ajuda` com exemplo de ponta a ponta | Além da lista, um bloco "como navegar" com `curriculo` → `2` → `cd curriculo` | P1 | AUT |
| DS-12 | Mesmo padrão em todas as páginas com seções | `academico`, `servicos`, `projetos` e `experiencias` usam o mesmo índice, atalho por número, vizinhos e dicas, com rótulos de `src/i18n/ui.js` em PT e EN | P0 | AUT |
