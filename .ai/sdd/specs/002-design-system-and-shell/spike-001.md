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

## Adendo (2026-11-17): análise do chunk `index`, pedida pela Duda antes de decidir a meta
**Como medi:** um `vite build` com uma config temporária (fora do repositório, em `scratchpad/analyze.config.ts`) que reaproveita a config do projeto e imprime, por módulo, o tamanho **antes de minificar** (`renderedLength`), agrupado por pacote ou pasta de `src`; o build foi para uma pasta fora do repositório (o `git status` ficou limpo). Mais um bundle mínimo de React (`esbuild`, minificado) para medir o **piso**. Os percentuais são de tamanho renderizado, não de gzip: indicam proporção, não bytes comprimidos.

**O chunk `index` (923,3 KB renderizados, 369,9 KB minificados):**
| Parte | KB (renderizado) | % |
| --- | --- | --- |
| `react-dom` | 638,4 | 69,1 |
| `src/data` (conteúdo e tabelas carregados no 1º acesso) | 75,8 | 8,2 |
| `src/terminal` (+ `extras` 16,9) | 70,2 (+ 16,9) | 7,6 (+ 1,8) |
| `src/components/shell` | 24,8 | 2,7 |
| `react` | 20,6 | 2,2 |
| `src/i18n` | 19,1 | 2,1 |
| `scheduler` | 11,2 | 1,2 |
| `src/components` (outros), `utils`, `pages`, `dashboard`, `hooks`, `router`, `services`, `App`, `main` | ~33 | ~3,6 |
- React (`react-dom` + `react` + `scheduler`) é 72,6 % do renderizado. **Não há biblioteca de roteamento no chunk**: o roteador é próprio (`src/router.tsx`, 2,9 KB). A `i18n` também é própria (19,1 KB). Não há pacote de terceiros além do React.
- O terminal (`src/terminal` e `extras`, 87,1 KB renderizados) e os dados (`src/data`, 75,8 KB) **estão no 1º acesso**, embora o site novo vá priorizar engenharia e deixar o terminal em `/terminal`, fora do menu.

**Piso do React (React 19.3.1, só `react` + `react-dom/client`, sem código do site):** 217,7 KB bruto, **67,5 KB gzip, 57,9 KB brotli**.

**Conta que decide a meta de 90 KB:**
| | gzip | brotli |
| --- | --- | --- |
| JS no 1º acesso hoje | 118,2 | 101,3 |
| Piso do React | 67,5 | 57,9 |
| **Código do site no 1º acesso hoje** (diferença) | **~50,7** | **~43,4** |
| **Folga para o código do site com a meta de 90 KB** | **22,5** | **32,1** |
| Corte necessário no código do site | ~56 % | ~26 % |
- Só o React ocupa 75 % (gzip) ou 64 % (brotli) da meta de 90 KB. A meta é **alcançável apenas se o código do site no 1º acesso cair de ~51 KB para ~22 KB (gzip)** ou de ~43 KB para ~32 KB (brotli). Se "comprimido" quer dizer gzip, a meta é muito apertada; se quer dizer brotli (o que a Netlify serve a navegadores que aceitam), é plausível com o terminal e os dados fora do 1º acesso.
- **Estimativa, não medição:** o ganho de tirar o terminal e `src/data` do 1º acesso. Os dois somam ~163 KB renderizados (~18 % do chunk); o gzip desse trecho não foi medido isoladamente.

**Decisões que isto deixa para a Duda** (o requirements pede aprovação para ajustar o número ou a arquitetura):
1. Definir **qual compressão vale** para o NFR-001: gzip ou brotli. Isso muda a meta de "muito apertada" para "plausível".
2. Se vale brotli: manter os 90 KB e exigir no design que o terminal e `src/data` saiam do 1º acesso (divisão de código por rota, `React.lazy`).
3. Se vale gzip: ou subir a meta (por exemplo, 100 a 110 KB), ou aceitar que a casca nova quase não tem orçamento para código próprio.
4. Qualquer uma das opções precisa ser conferida no build de prova, que ainda não existe.

**Resposta da Duda (2026-11-17):** a escolha entre gzip e brotli para o NFR-001 foi **adiada** ("decidir depois"). A pergunta segue aberta; o requirements e o design não foram alterados. O requirements v1.3 também continua sem aprovação dela.
