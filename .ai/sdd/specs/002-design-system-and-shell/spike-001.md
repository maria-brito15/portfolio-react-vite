# SPIKE-001: tamanho de JavaScript e conteúdo do HTML pré-renderizado
**Data:** 2026-11-17 · **Autor:** Claude · **Autorizado pela Duda:** sim (2026-11-17) · **Natureza:** só medição; não altera código do site, não fecha tarefa e não aprova nada.

## Pergunta
(1) O que o HTML pré-renderizado de hoje contém sem JavaScript (FR-028)? (2) A meta de **JavaScript ≤ 90 KB e CSS ≤ 20 KB comprimidos** (NFR-001) é viável com o roteador e a i18n atuais?

## Como medi (e limites)
- **Build medido:** o `dist/` do commit `61bea26` (`npm run verify`, `vite build` normal). **Não é o "build de prova"** que o requirements define (com `/_prova`), porque ele ainda não existe; não há `/_prova` neste `dist`. Pelo requirements, a medição que vale para a meta é a do build de prova: **esta é uma medição de partida, não a conferência final.**
- **Compressão:** `zlib` do Node, gzip (padrão) e brotli (qualidade padrão do Node). O requirements não diz qual das duas vale ("comprimidos"); registro as duas.
- **Contagem:** os arquivos `js` e `css` referenciados pelo HTML de cada página (o que carrega no 1º acesso). Chunks carregados depois (`React.lazy`) não entram.
- **Script:** `scratchpad/spike001.mjs` (fora do repositório). Comando: `node spike001.mjs dist index.html about.html academico.html 404.html`.

## Resultado
| Página | Arquivos js/css no HTML | JS (raw / gzip / brotli) | CSS (raw / gzip / brotli) |
| --- | --- | --- | --- |
| `index.html`, `about.html`, `academico.html`, `404.html` | 2 (os mesmos nas quatro) | 372,2 / **118,2** / **101,3** KB | 83,0 / **16,1** / 14,2 KB |

- Todos os chunks de JS somados: 592,7 KB bruto, 192,2 KB gzip, 166,0 KB brotli. O JS do 1º acesso é o chunk `index` (a casca e o terminal atuais); o resto é lazy.
- **JS contra a meta de 90 KB:** 118,2 KB gzip é **31 % acima**; 101,3 KB brotli é **13 % acima**. **Nas duas compressões o JS de hoje passa de 90 KB.**
- **CSS contra a meta de 20 KB:** 16,1 KB gzip e 14,2 KB brotli **cabem**.
- O requirements cita 143 KB comprimidos para o chunk principal; hoje o `index` mede 118,2 KB gzip (a spec 001 removeu trilhas, personas, jogos, assistente e Caderno). Os 143 KB não são mais o ponto de partida.

## O que o HTML contém sem JavaScript (FR-028)
| Página | Texto no corpo (sem scripts) | Links | `<h1>` |
| --- | --- | --- | --- |
| `index.html` | 437 caracteres | 11 | "Duda Brito \| Engenharia de Software e Arquitetura de Software" |
| `about.html` | 424 | 11 | "Sobre Duda Brito \| Estudante de Engenharia de Software" |
| `academico.html` | 403 | 11 | "Acadêmico \| Duda Brito, Engenharia de Software na PUC Minas" |
| `404.html` | 324 | 11 | "Página não encontrada \| Duda Brito" |

- O HTML tem um `<h1>`, uma frase de apresentação e 11 links (os mesmos em todas as páginas, ou seja, um bloco de reserva fixo), com 3,9 a 6,7 KB. É um texto de reserva para buscadores, **não o conteúdo da página**: o 404 diz que o portfólio "é um terminal interativo e precisa de JavaScript". O conteúdo real de cada página só aparece depois do JavaScript.
- **Conclusão para o FR-028:** o HTML de hoje **não** cumpre "conteúdo sem JavaScript". Cumprir exige mudar a renderização (pré-render do conteúdo por rota), que é exatamente o risco "Média/Alto" do requirements. O design da 002 precisa decidir isso e registrar como TD.

## Veredito de viabilidade
- **CSS ≤ 20 KB: viável** (16,1 KB gzip).
- **JS ≤ 90 KB: não é viável com o chunk de hoje.** Depende do design: a casca nova não carrega o terminal no 1º acesso e divide o código, e o `index` de hoje inclui roteador, i18n e o terminal. Não medi o que explica os 118,2 KB (falta uma análise do conteúdo do chunk), então **não afirmo** que a meta é alcançável.
- **O que a Duda decide** (o requirements manda ajustar o número ou a arquitetura **com aprovação**): (a) manter 90 KB e exigir, no design, que o terminal e a i18n completa saiam do 1º acesso; (b) subir a meta (por exemplo, 100 KB brotli como teto realista hoje); (c) pedir uma análise do conteúdo do chunk `index` (um relatório de bundle) antes de decidir.

## Pendências
- Medir de novo no build de prova quando ele existir (tarefa da 002).
- Esta medição não mede LCP, INP nem CLS; isso é do NFR-001 em página de prova.
