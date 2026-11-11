# Requisitos — Portfólio v2 (terminal/IDE como identidade e forma de navegar)

Especificação da segunda fase do portfólio: um só estilo visual, header enxuto, terminal como acesso a **todo** o conteúdo e navegação descobrível por quem nunca entrou no site. Segue o formato de `docs/sdd/requirements.md` (TP1). O estado de cada requisito está em [`gap-analysis.md`](gap-analysis.md); a ordem de trabalho, em [`tasks.md`](tasks.md).

**Origem.** Esta spec foi reconstruída a partir de quatro prompts já escritos (`PROMPT-claude-code-navegacao-terminal.md`, `-estilo-unico.md`, `-header-e-comandos.md`, `-navegar-secoes-terminal.md`) e do pedido do dono do projeto. Ela substitui esses prompts como fonte de verdade.

**Legenda.** Prioridade: **P0** necessário · **P1** importante · **P2** desejável. Verificação: **AUT** teste automatizado · **MAN** inspeção manual no navegador.

## 1. Relação com `docs/sdd/` (TP1)

Estes requisitos **substituem** os itens abaixo do TP1, que descrevem o site antes do redesenho:

| Item do TP1 | Situação |
| --- | --- |
| D-04 e RF-19 ("preservar design atual") | Superados: o design mudou de propósito (ES-01 a ES-10) |
| RF-18 (âncoras `/#secao` na home) e a estrutura "home com seções" | Superados: a home é só o terminal; as seções viraram páginas próprias (SH-09, SH-10) |
| RNF-03 ("menu recolhível em telas pequenas") | Superado: não há mais menu de links (SH-01) |
| SH-05 (`Ctrl+K` foca a barra) | Superado em 11/11/2026: `Ctrl+K` e o botão `>_` do header abrem a paleta de comandos; `/` continua focando a barra; `?` lista os atalhos. Vale `docs/specs/shell-navegacao/` e `docs/specs/experiencia-interativa/` (JA-06, JA-08) |
| D-10 ("sem ferramentas de SDD, só 3 documentos") | Esta pasta é uma segunda spec, no mesmo formato, sem ferramenta nova |

Continuam valendo sem alteração: RF-01 a RF-05 (timeline de projetos), RF-07, RF-08, RF-10 a RF-17, RNF-05, RNF-08.

## 2. Decisões estabelecidas

| ID | Decisão |
| --- | --- |
| V-01 | Uma só linguagem visual, a de terminal/IDE; o estilo "marketing" (Syne, DM Sans, degradês, brilho) é aposentado |
| V-02 | O terminal é a identidade **e** o modo de interação; as páginas dedicadas são "janelas do mesmo ambiente", ricas, mas com a mesma pele |
| V-03 | A home é só o terminal (sem rolagem de marketing). Sobre, Habilidades, Projetos, Experiências e Contato são comandos e páginas próprias |
| V-04 | Todo destino tem sempre duas visões: **no terminal** e **página própria** |
| V-05 | A própria saída do terminal ensina o próximo passo: nenhum comando existe só para quem leu o código |
| V-06 | Sem dados inventados (notas, datas, disciplinas); as views leem de `src/data/*` |
| V-07 | A ordem **crescente** da timeline de projetos é mantida (requisito acadêmico); a ordem **decrescente** vale só para "atividades por ano" e "disciplinas" no Acadêmico |
| V-08 | Sem novas dependências |

## 3. Requisitos de estilo (ES)

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

## 4. Requisitos de shell e navegação (SH)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| SH-01 | Header em três zonas, sem menu de links | Esquerda: acesso a comandos (`>_ Ctrl K`); centro: `mariab.dev` centralizado; direita: exatamente dois controles (tema e idioma). Nenhum `☰` nem lista de páginas | P0 | AUT |
| SH-02 | Logo centralizado de verdade | O header é uma grade `1fr auto 1fr`; o logo fica no meio em qualquer largura | P1 | MAN |
| SH-03 | Barra de comandos fixa em todas as páginas | Mesma barra logo abaixo do header em todas as rotas, com a mesma sessão do terminal da home | P0 | AUT |
| SH-04 | Voltar e breadcrumb nas páginas internas | Toda página fora da home tem "← Voltar" (`history.back()` se a página anterior é do site, senão `/`) e breadcrumb (`~ / curriculo`) | P0 | AUT |
| SH-05 | Atalhos de teclado | `Ctrl+K` e `/` focam a barra, exceto dentro de campos de formulário; `Esc` fecha painel, tela cheia ou desfoca | P0 | AUT |
| SH-06 | Mobile | A barra vira o botão `>_` que a abre em tela cheia; sem rolagem horizontal em 390, 768 e 1440 px em nenhuma rota | P0 | AUT + MAN |
| SH-07 | Par de ações em toda página dedicada | A barra de título da Window mostra `[ ver no terminal ]  [ página própria ]`; o primeiro leva à home com o comando já executado (`/?cmd=…`) | P0 | AUT |
| SH-08 | Tabela única de rotas | Caminhos, nomes de comando (PT/EN), breadcrumb, `ls`, `cd` e autocompletar vêm de `src/data/routes.ts`; seções internas, de `src/data/sections.ts` | P0 | AUT |
| SH-09 | Seções antigas da home como páginas próprias | `/sobre`, `/habilidades`, `/projetos`, `/experiencias`, `/contato` existem, com aliases em inglês | P0 | AUT |
| SH-10 | Links antigos não levam a lugar nenhum | Um link antigo `/#sobre`, `/#projetos`… abre a página própria equivalente (redirecionamento no cliente) em vez de cair na home sem rolar | P1 | AUT |

## 5. Requisitos da sessão do terminal (TS)

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

## 6. Requisitos de comandos e conteúdo no terminal (CM)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| CM-01 | Inventário coerente | Nenhum nome ou apelido se repete; `ajuda` lista só comandos que existem e não esconde nenhum visível; os atalhos clicáveis são comandos reais | P0 | AUT |
| CM-02 | `ls`, `ls <página>`, `cd <página>`, `cd <página>/<seção>` | `ls` lista páginas com o número de seções; `ls <página>` lista as seções; `cd <página>` abre a página própria; `cd <página>/<seção>` abre na seção certa | P0 | AUT |
| CM-03 | `<página> <seção>` lê a seção no terminal | Aceita nome, apelido em inglês, número, barra, maiúsculas, acentos, `~`, `..`, aspas e espaços extras | P0 | AUT |
| CM-04 | Todo o conteúdo é legível no terminal | Para toda rota com seções, cada seção imprime seu conteúdo completo, lido de `src/data/*`, sem texto duplicado nem inventado | P0 | AUT |
| CM-05 | Erros nunca quebram | Argumento desconhecido devolve erro claro e amigável; nunca tela em branco nem exceção | P0 | AUT |

Seções por página (definidas em `src/data/sections.ts`): **curriculo** — resumo, competencias, experiencias, projetos, formacao, reconhecimentos; **academico** — linha-do-tempo, formacao, atividades, disciplinas; **servicos** — servicos, cases, faq, contato; **projetos** — um por projeto; **experiencias** — um por grupo.

## 7. Requisitos de descoberta (DS)

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
| DS-12 | Mesmo padrão em todas as páginas com seções | `academico`, `servicos`, `projetos` e `experiencias` usam o mesmo índice, atalho por número, vizinhos e dicas, com rótulos de `src/i18n/ui.ts` em PT e EN | P0 | AUT |

## 8. Requisitos de dados e ordem (DT)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| DT-01 | Atividades por ano, mais recentes primeiro | Anos em ordem decrescente e, dentro do ano, `02/2026` antes de `01/2026`, que vem antes de `02/2025`; item sem mês depois dos que têm mês | P0 | AUT |
| DT-02 | Timeline de projetos continua crescente | Planoriza → EcoShop → projetos de 2026 (teste existente sem alteração) | P0 | AUT |
| DT-03 | Disciplinas e notas | Quatro semestres como placeholder (01/2025, 02/2025, 01/2026 em Ciência da Computação; 02/2026 em Engenharia de Software, em andamento), do mais recente ao mais antigo, sem nota ou disciplina inventada; carga horária e média aparecem sozinhas quando houver dados | P0 | AUT |
| DT-04 | Competências com tempo | O tempo de cada tecnologia vem do primeiro projeto/curso datado que a usa; sem origem datada, não mostra tempo | P1 | AUT |

## 9. Requisitos não funcionais (NF)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| NF-01 | Qualidade automatizada | `npm run lint`, `npm test` e `npm run build` com código 0 | P0 | AUT |
| NF-02 | Sem erro de console | Nenhuma rota emite erro no console em 390, 768 e 1440 px | P1 | MAN |
| NF-03 | PT/EN completos | Todo texto novo existe nos dois idiomas, em `src/i18n/ui.ts` ou nos dados | P0 | AUT |
| NF-04 | Documentação coerente | README descreve os comandos e a navegação reais; `docs/sdd/` marca o que foi superado (§1) | P1 | MAN |
