# 009 Terminal, Design
**Status:** draft   **Version:** 0.1   **Author:** Claude (arquiteto)   **Date:** 2026-11-19
**Entrada:** `requirements.md` v1.0 (aprovada em 2026-11-19), `.ai/steering/*`, `design.md` e `requirements.md` da 002 (FR-008, FR-009, FR-010, FR-018, FR-021, FR-027, FR-039, FR-041; TD-006, TD-014, TD-022, TD-024, TD-025), `requirements.md` da 003 (sem design ainda), o mockup `Terminal.dc.html`, e o código atual de `src/terminal/*`, `src/pages/TerminalPage.tsx` e `src/pages/NotFound.tsx` (lidos em 2026-11-19).

## Executive Summary
O terminal atual tem cerca de 3 800 linhas (interpretador de 930 linhas, 20 comandos, extras, índice de seções, redirecionamento com barra de carregamento, sessão com replay). Os FRs aprovados pedem oito comandos sem argumento. Por isso este design **reescreve o terminal no lugar** (Q-001 do PLAN) num módulo pequeno e remove o resto. Sete decisões sustentam o resto:
1. **Comando é dado, saída é dado.** Cada comando devolve uma lista de blocos tipados por idioma, não JSX. O mesmo resultado serve ao desenho, ao teste e à região ao vivo (TD-001, TD-002).
2. **Região ao vivo:** o registro de saída é um `role="log"` com `aria-live="polite"` que **recebe entradas novas** (append), nunca é refeito (TD-003).
3. **Autocompletar com Tab e histórico com setas**, sem caixa de sugestões flutuante; candidatos aparecem como linha no registro; Tab nunca prende o foco (TD-004, TD-005).
4. **O comando de página resume e dá o link**; só `home` navega. Sem barra de carregamento nem animação de digitação (TD-007).
5. **Todo dado vem do conteúdo da 003**, por um único adaptador `sources.ts` (TD-008). Esta spec só desenha depois que a 003 fechar o conteúdo.
6. **O terminal só existe no cliente**; o HTML estático de `/terminal` traz "Sair", o título, a mensagem sem JavaScript e a lista de páginas em texto normal (TD-009).
7. **A 404 hospeda o terminal sob demanda:** um botão "Abrir o terminal" (lazy, só no cliente) irmão do `NotFound` no `App`; o `import()` do terminal ocorre no clique. `NotFound.tsx` e o texto da 002 não mudam (TD-010).

## Requirements Mapping
| FR | Decisões | Verificação |
| --- | --- | --- |
| FR-001 Rota fora do menu, sem casca | TD-009; usa `bare` da 002 (TD-024 da 002); nenhuma mudança na tabela de rotas além da limpeza de TD-013 | V-01 |
| FR-002 "Sair do terminal" primeiro e leva à home | TD-014, TD-009 | V-02, V-08 |
| FR-003 Anúncio em região ao vivo educada | TD-003 | V-03 |
| FR-004 Desconhecido: "digite ajuda" e mais parecido | TD-006 (reusa `levenshtein` de `src/utils/suggest.ts`) | V-04 |
| FR-005 Conjunto exato de oito comandos, atalho clicável, nenhum removido | TD-006, TD-007, TD-014 | V-04, V-05 |
| FR-006 Mesmo conteúdo das páginas; rota equivalente na tabela | TD-008 | V-06 |
| FR-007 Teclado: Tab, setas, foco visível | TD-004, TD-005, TD-014 | V-02, V-07, V-08 |
| FR-008 Idioma da rota; mesmo estado ao trocar | TD-002 (saída é função do idioma, re-desenhada sem reexecutar) | V-09 |
| FR-009 Sem JavaScript: mensagem com links | TD-009 | V-10 |
| FR-010 Movimento reduzido | TD-007 (não há animação de digitação em lugar nenhum; ver DQ-003) | V-11 |
| FR-011 Remoção do código morto | "Lista de remoção" abaixo; TD-001, TD-013 | V-12 |
| FR-012 Terminal na 404 | TD-010 | V-13 |
| FR-013 Dica de primeira visita; armazenamento bloqueado | TD-012 | V-14 |
| NFR-001 Carga sob demanda, INP ≤ 200 ms | TD-011 | V-15, V-16 |
| NFR-002 Entrada é texto; sem terceiros | TD-015 | V-17 |
| NFR-003 WCAG 2.1 AA, foco nunca preso, equivalente em texto normal | TD-003, TD-004, TD-009, TD-014 | V-08, V-18 |

Todos os FRs e NFRs têm mapeamento. Nenhuma lacuna de requisito; as lacunas de decisão estão em "Perguntas".

## Architecture
Estado final de `src/terminal/` (arquivos novos ou reescritos no lugar; nomes só indicam o papel):

| Arquivo | Papel |
| --- | --- |
| `blocks.ts` | Tipo `Block` (ver Data Model). |
| `commands.ts` | Tabela dos oito comandos e `runCommand(input, lang)`. Puro, sem DOM. |
| `match.ts` | `fold`, candidatos de autocompletar, "mais parecido" (usa `levenshtein`). Puro. |
| `sources.ts` | **Único** arquivo que importa conteúdo (003) e a tabela de rotas; devolve os dados que cada comando mostra. |
| `useTerminal.ts` | Estado do terminal (`useReducer`): entradas, histórico, rascunho, cursor. Teclas. |
| `TerminalOutput.tsx` | Desenha `Block[]` como HTML (texto, linhas chave/valor, links). |
| `Terminal.tsx` | O terminal inteiro: introdução, registro (`role="log"`), linha de comando, atalhos. Importa seu CSS. |
| `hint.ts` | Marca de "dica já vista" (TD-012). |
| `NotFoundTerminal.tsx` | O botão "Abrir o terminal" da 404 (chunk próprio, minúsculo; TD-010). |

Páginas e ligações:
- `src/pages/TerminalPage.tsx` (reescrito no lugar): `main` da rota `bare` com "Sair do terminal", `h1`, dica, o `Terminal` (só no cliente), a lista de páginas em texto normal e a mensagem sem JavaScript.
- `src/App.tsx`: no `default` do `Page` (rota inexistente), renderiza `<NotFound />` e, depois dele, o lançador carregado por `lazy` (`lazyPages.ts`). Nenhuma outra rota muda.
- Fluxo de um comando: `Enter` → `runCommand(texto, lang)` → `Entry { id, input, output(lang) }` → acrescentada ao registro → aparece e é anunciada. O estado vive no componente `Terminal`, não num provedor global (não há mais `TerminalProvider` em lugar nenhum; `RunButton` e `CommandCatalog` saem).

## Data Model
```
Block =
  | { kind: 'line'; text: string; tone?: 'dim' | 'ok' | 'err' }
  | { kind: 'rows'; rows: { key: string; value: string; href?: string }[] }   // chave/valor, valor pode ser link
  | { kind: 'link'; label: string; href: string }                              // href sempre da tabela de rotas ou do conteúdo
Entry   = { id: number; input: string; output: (lang: Lang) => Block[] }
Command = { id: CommandId; names: { pt: string; en: string }; routeId?: RouteId; run: (lang: Lang) => Block[] | { navigate: string } }
CommandId = 'ajuda' | 'ls' | 'whoami' | 'projetos' | 'curriculo' | 'academico' | 'contato' | 'home'
```
Regras e onde moram:
- **Texto de interface do terminal** (introdução, descrições dos comandos, erros, dica, "Sair do terminal", mensagem sem JavaScript) fica em `src/i18n/ui.ts`, bloco `terminal` novo, PT e EN, com teste de paridade de chaves (a regra cabe no dado: chave faltando quebra o teste, não a tela). O bloco `term` antigo e `ws.terminal` saem.
- **Conteúdo** (nome, cargo, projetos, curso, canais) **não** é copiado: vem do conteúdo da 003 por `sources.ts` (FR-006).
- **Rotas equivalentes:** cada comando de página carrega `routeId`; um teste exige que exista na tabela (`routeById`) e que o `href` da saída seja `pathInLang(route.path, lang)`. O `ls` lê a tabela (`menu: true`, ordenada por `order`) e usa o `desc` de cada rota; nenhum caminho fica escrito no terminal.
- `home` não tem `routeId` de conteúdo: navega para `pathInLang('/', lang)`.
- Os oito comandos moram em código, não em `src/content/`: são interface, não conteúdo (convenção: conteúdo é projeto, caso, experiência, filme, livro, diário).

### Saída de cada comando
| Comando (PT / EN) | Saída | Fonte | Link |
| --- | --- | --- | --- |
| `ajuda` / `help` | oito linhas: nome no idioma da rota e descrição curta (as do mockup) | `ui.terminal` | nenhum |
| `ls` | as rotas com `menu: true`, em ordem: rótulo, descrição, link | tabela de rotas | cada rota |
| `whoami` | nome, cargo/curso em uma linha | conteúdo de perfil (003) | `/curriculo` (DQ-001) |
| `projetos` / `projects` | uma linha por projeto: ano (mês só se confirmado, regra 001/FR-013) e nome; frase "Para ver os detalhes, abra /projetos" | conteúdo de projetos (003) | `/projetos` |
| `curriculo` / `resume` | primeira frase de "sobre mim", curso atual, competências em contagem; **campos exatos fixados quando o design da 003 existir** | conteúdo do currículo (003) | `/curriculo` |
| `academico` / `academics` | curso, instituição, período ou previsão (nada que não exista no conteúdo) | conteúdo acadêmico (003) | `/academico` |
| `contato` / `contact` | e-mail, GitHub, LinkedIn, e link para o formulário | conteúdo de contato (003) | `/contato` |
| `home` | navega para a home no idioma da rota; sem saída | rota `home` | (navegação) |

## Edge Cases
- Entrada vazia ou só espaços: nada é registrado, nada é anunciado, não entra no histórico (Implementation FAQ).
- `Projetos`, `PROJETOS`, `projêtos`: tolerados (`fold`: minúsculas e sem acento). Nome em inglês na rota em português (e o inverso) também vale; `ajuda` mostra os nomes do idioma da rota.
- Argumento (`projetos xyz`, `ls abc`): erro com a forma certa (`uso: projetos`) e "digite ajuda". Nenhum comando aceita argumento.
- Comando removido (`trilhas`, `neofetch`, `fortunes`, `agora`, `setup`, `cd`, `tema`, `idioma`): desconhecido; só ganha "quis dizer" se for parecido com um dos oito.
- Mais de 50 entradas: as mais antigas saem do registro (o histórico de setas guarda as últimas 50 digitações).
- Entrada com mais de 200 caracteres: o campo recusa (`maxLength`); texto longo colado é cortado.
- Armazenamento bloqueado: `hint.ts` captura o erro e devolve "não vista"; nada mais usa armazenamento.
- JavaScript desligado: ver TD-009. Falha ao carregar o chunk na 404: o botão volta ao estado inicial com a mensagem "não foi possível abrir o terminal; use os links acima" (texto normal já presente na 404).

## Segurança
- A entrada é sempre texto: nunca `eval`, `Function`, `dangerouslySetInnerHTML` nem interpolação em atributo. Todo `href` vem da tabela de rotas ou do conteúdo validado (formato de link da 001). O eco do comando desconhecido é um nó de texto do React.
- Nenhuma requisição a terceiros; o terminal não faz `fetch`. O mockup referencia Google Fonts; **isso não é copiado** (fontes são da 002).
- Sem segredo: o terminal não lê variável de ambiente.

## Technical Decisions

### TD-001: Reescrever o terminal no lugar, em módulo pequeno
**Decision:** manter só os nomes que continuam fazendo sentido (`Terminal.tsx`, `TerminalOutput.tsx`, `useTerminal.ts`, `commands`) e reescrevê-los; apagar o restante (Lista de remoção). **Rationale:** 8 comandos sem argumento não justificam um interpretador com seções, contexto de navegação, replay e redirecionamento; e o PLAN (Q-001) manda o código novo substituir o antigo no lugar. **Alternatives:** podar o `commands.tsx` atual (mantém o modelo de `ReactNode`, de `NavContext` e de `replay`, que não servem aos FRs e custam JS); deixar o código antigo e criar um `terminal2` (dois terminais; viola Q-001).

### TD-002: Saída como dados (`Block[]`), função do idioma
**Decision:** `run` devolve blocos; `Entry.output(lang)` é pura e é chamada no desenho. Trocar de idioma (possível na 404, onde a casca tem seletor) re-desenha as entradas existentes sem reexecutar. **Rationale:** testável sem DOM, texto plano derivável para os testes de equivalência e paridade, idioma re-desenhável (FR-008). **Alternatives:** JSX direto (como hoje): não dá para testar o texto sem montar, e mistura conteúdo e marcação; guardar o texto já traduzido na entrada (trocar de idioma deixaria a saída no idioma errado).

### TD-003: Região ao vivo é o próprio registro, com acréscimo
**Decision:** o registro é `<div role="log" aria-live="polite">` presente no DOM desde a montagem do terminal, vazio. Cada comando acrescenta **um nó** (eco `$ comando` com o prompt `aria-hidden`, mais a saída). Nada dentro do registro é substituído; a introdução e a dica ficam **fora** dele (não são anunciadas ao abrir). Erros não usam `role="alert"` (evita anúncio duplo). Re-desenhar por troca de idioma altera texto existente e não é "adição", então não é re-anunciado. **Rationale:** FR-003 e o mockup ("a saída fica numa região que é anunciada a cada comando"); o padrão `log` é o previsto para saída de console. **Alternatives:** (a) uma região oculta só com um resumo falado: duplicaria texto e dessincroniza do visível (NFR-003 quer equivalente em texto); (b) manter só a última entrada e refazer a região (como hoje, `term-log` re-renderizado): leitores de tela lêem de forma inconsistente quando o nó inteiro é trocado, e o mockup mostra o registro acumulado.
**Consequência:** o registro cresce a página; sem contêiner com rolagem interna (evita o achado do axe "scrollable-region-focusable" e um tab stop extra). Após cada comando a linha de comando é rolada para dentro da tela (`block: 'nearest'`, sem animação quando há preferência por movimento reduzido).

### TD-004: Autocompletar com Tab, sem caixa flutuante
**Decision:** só há um token (nenhum comando tem argumento). Tab com texto: candidatos = nomes (idioma da rota primeiro, depois o outro) cujo `fold` começa com o digitado. Um candidato: completa. Vários: completa até o prefixo comum e escreve os candidatos numa linha do registro (anunciada). Nenhum: **não** intercepta a tecla (o foco segue), assim Tab nunca prende. Tab com campo vazio: navegação normal. **Rationale:** FR-007; a lista no registro funciona com leitor de tela sem componente `combobox`; o botão de sugestões atual (`ul` de botões) sumiria no foco. **Alternatives:** `combobox` ARIA com `listbox` (mais código e mais risco de acessibilidade por ganho mínimo com 8 comandos); autocompletar também de argumentos (não há argumentos).

### TD-005: Histórico só em memória, 50 digitações, com rascunho
**Decision:** setas ↑/↓ percorrem as últimas 50 digitações **aceitas** (sem vazias; sem repetir a anterior); ↓ no fim restaura o texto que estava sendo digitado (rascunho). O histórico vive no estado do componente e some ao sair da página. **Rationale:** o `sessionStorage` atual exige replay do histórico e coluna de código para efeitos; não há FR que o peça. **Alternatives:** persistir em `sessionStorage` (mais código, estado entre rotas, ainda sem FR); não ter histórico (viola FR-007). **Aceito:** perde-se o histórico ao sair de `/terminal` (já aceito na TD-025 da 002).

### TD-006: Comandos sem argumento; português e inglês valem nos dois idiomas
**Decision:** `runCommand` faz `fold` do primeiro token e procura nos nomes PT e EN dos oito. Qualquer argumento extra gera o erro `uso: <nome>` + "digite ajuda". Desconhecido: `<texto>: comando não encontrado. Digite “ajuda”.` e, se o menor `levenshtein` (≤ 2, e menos que metade do tamanho) apontar um comando, acrescenta `Quis dizer “projetos”?`. Não há apelidos (`cv`, `dir`, `abrir`, `n`, números, `pwd`, `sudo` saem). **Rationale:** FR-004, FR-005 ("exatamente estes comandos") e a FAQ (tolerância a acento e caixa). **Alternatives:** manter apelidos (cada apelido é comando fora da lista aprovada).

### TD-007: Comando de página resume e dá o link; só `home` navega; sem animação
**Decision:** `projetos`, `curriculo`, `academico`, `contato`, `whoami`, `ls` imprimem o resumo e um link normal para a página (US-001: "abre ou resume"). `home` navega na hora com `navigate` do roteador, igual ao "Sair do terminal". Nenhuma barra de carregamento, sequência de boot nem efeito de digitação. **Rationale:** a barra de 800 ms atual (`TerminalSession`) existe só para simular carregamento e exigiu ~280 linhas de estado e cancelamento por Esc/Ctrl+C; o mockup não a tem. Sem animação, FR-010 vale por construção e o CSS da 002 (V-01 da 002, que neutraliza `transition`/`animation` sob movimento reduzido) cobre o resto. **Alternatives:** manter a barra com versão reduzida (código e teste para um efeito sem FR); abrir a página automaticamente em todo comando (tira o visitante do terminal sem avisar).

### TD-008: O conteúdo vem do adaptador `sources.ts` (dependência da 003)
**Decision:** nenhum outro arquivo do terminal importa conteúdo. `sources.ts` expõe funções puras por idioma (`profileLine`, `projectLines`, `resumeSummary`, `academicSummary`, `contactChannels`) lendo os módulos de conteúdo registrados na 003 e os formatadores de data da 001 (`src/content/dates.ts`, `pick.ts`). **Rationale:** FR-006 (sem texto duplicado) e isolar a única parte que depende de nomes que o design da 003 ainda vai fixar. Enquanto a 003 não existir, as tarefas desta spec **não começam** (dependência dura). **Alternatives:** ler os arquivos atuais `src/data/*` (seriam apagados pela 003; retrabalho); copiar dados no terminal (viola conteúdo-é-dado). **Teste de equivalência (V-06):** o conjunto de nomes de projeto na saída de `projetos` é igual ao do conteúdo, e a contagem bate.

### TD-009: Terminal só no cliente; o HTML estático traz o essencial em texto normal
**Decision:** o pré-render de `/terminal` e `/en/terminal` (002, TD-008) emite, dentro do `main`: `a` "Sair do terminal" (primeiro item focável), `h1` "Terminal", a dica, a lista **"Prefere sem terminal?"** com um link por rota de menu (lida da tabela, texto normal, sempre visível) e um `<noscript>` com "O terminal precisa de JavaScript. Use as páginas acima". A seção interativa só monta depois da hidratação (`useSyncExternalStore` com snapshot de servidor `false`, o mesmo padrão do `NotFound`), sem divergência de hidratação. **Rationale:** FR-009, US-003, NFR-003 e princípio 2 (conteúdo principal funciona sem JavaScript). A lista permanente de links é o "equivalente em texto normal" do NFR-003. **Alternatives:** renderizar o formulário no servidor (um campo que não faz nada sem JavaScript engana o visitante); só `<noscript>` (a lista some para quem tem JS e não ajuda leitores de tela que preferem links). **Risco:** conferir que o `prerender` da 002 emite o conteúdo do `<noscript>`; se não emitir, a mensagem vira parágrafo com `hidden` revelado só sem JS por CSS (V-10 decide).

### TD-010: A 404 hospeda o terminal por um lançador `lazy`, sem editar a 002
**Decision:** `App.tsx`, no `default` do `Page`, devolve `<><NotFound /><Suspense fallback={null}><NotFoundTerminal /></Suspense></>`, com `NotFoundTerminal` em `lazyPages.ts`. O lançador é um botão "Abrir o terminal" que só aparece após a hidratação (gate igual ao das sugestões da 404) e reserva a altura de 44 px no HTML estático para não empurrar o rodapé (CLS). No foco ou no ponteiro sobre o botão, faz `import('./Terminal')` antecipado; no clique, aguarda o import (botão `aria-busy`, texto "Abrindo…") e monta o `Terminal` no lugar do botão, com o foco indo para a linha de comando. O terminal da 404 tem, como primeiro item, um botão "Fechar o terminal" que desmonta e devolve o foco ao botão "Abrir o terminal"; `home` navega para a home. `NotFound.tsx`, o texto da 002 e as sugestões ficam como estão: a informação da 404 nunca depende do terminal (FR-012). O status 404 é do `netlify.toml` e do `dist/404.html` e não é tocado.
**Rationale:** FR-012 pede "acrescentar" sem alterar o texto da 002; o `App` já é o lugar que escolhe a página da rota (e já tem o `default`). O lançador não pesa no 1º acesso: é um chunk próprio, só baixado na 404; o terminal é outro, só baixado no clique. **Alternatives:** (a) editar `NotFound.tsx` para ter um slot (mexe no arquivo da 002 e arrasta o `Terminal` para o 1º acesso por import estático); (b) abrir a 404 já com o terminal montado (peso na 404 e foco/leitor de tela começam dentro de algo que ninguém pediu); (c) um link da 404 para `/terminal` (não é terminal "na própria 404"; Q-002 respondida: funcional na própria página).
**O que acontece com o `Prompt.tsx`:** o `NotFound` da 002 o importa, então ele **fica** (ver "Fica") e o terminal novo usa o próprio prompt `$` do mockup.

### TD-011: Orçamento de JavaScript e de CSS do terminal
**Decision:** (propostos pela arquitetura; a Duda confirma, DQ-005)
- **1º acesso de qualquer rota: +0 byte medido.** O `App` ganha só um `lazy()` na rota 404; o `TerminalPage` já é `lazy`. O CSS do terminal **deixa de ser importado por `main.tsx`** e passa a ser importado por `Terminal.tsx` (vira CSS do chunk).
- **Chunk do terminal (JS gzip, sem React nem chunks compartilhados): ≤ 10 KB**, e **CSS do terminal ≤ 3 KB gzip.** O lançador da 404: ≤ 1 KB gzip. Ponto de partida: 8 comandos e ~600 linhas contra 3 800 hoje.
- **INP ≤ 200 ms por comando:** `runCommand` é síncrono e puro; o registro tem no máximo 50 entradas.
- A medição é a primeira tarefa (linha de base de `scripts/measureBundle.mjs`) e a última (comparação). Se não couber, a Duda decide (subir o número ou cortar escopo); o número não é editado em silêncio, como na 002.
**Rationale:** NFR-001 e o orçamento de 100 KB da 002 (TD-025). **Alternatives:** terminal no 1º acesso da 404 (peso numa página de erro); carregar o terminal só no `hover` sem o lançador (inalcançável por teclado).

### TD-012: Dica de primeira visita
**Decision:** a dica "digite ajuda" do canto superior do `/terminal` (mockup) aparece enquanto `localStorage['portfolio-terminal-hint']` não existir; a marca é gravada ao abrir. Leitura com `useSyncExternalStore` (servidor: "não vista", então o HTML estático a traz e a hidratação a esconde com `hidden`, sem mudar a altura da linha). Com `localStorage` bloqueado, a leitura e a escrita ficam em `try/catch`, o resultado é "não vista" e a dica reaparece a cada visita, sem erro (Q-003). A introdução dentro do terminal ("digite ajuda para ver os comandos") é fixa e não depende da marca. Na 404 não há dica separada (o botão e a introdução já convidam). **Alternatives:** gravar só depois do primeiro comando (a visita "passa" sem a marca se o visitante sair sem digitar); `sessionStorage` (reaparece a cada sessão, mais ruído que "primeira visita").

### TD-013: Sem `?cmd=`; limpeza da tabela de rotas
**Decision:** `/terminal?cmd=<comando>` deixa de existir (nenhum FR o pede, e a 002 já desligou a paleta que o usava). Saem de `src/data/routes.ts`: `terminalUrl` e o campo `command` das rotas (inclui `command: 'stats'`, `'agora'`, `'setup'`, `'pessoal …'`, que apontam para comandos que não existem mais). `legacyCommandTarget` e o seu uso no `router.tsx` ficam, **simplificados** para levar `/?cmd=…` a `/terminal` sem query, para os links já publicados continuarem chegando. **Rationale:** FR-011 (código que o terminal novo não usa). **Toca arquivos da 002 (código, não texto); depende da resposta DQ-006.** **Alternatives:** manter `?cmd=` (novo código de efeito na URL para um recurso sem FR); apagar também `legacyCommandTarget` (quebra links publicados no LinkedIn).

### TD-014: Foco e teclado
**Decision:** ordem do `main`: "Sair do terminal" → (na 404, "Fechar o terminal") → linha de comando → atalhos clicáveis (um botão por comando, em `role="group"` com nome). **Sem autofoco ao abrir `/terminal`:** o primeiro item focável é "Sair" (FR-002) e quem usa leitor de tela começa no topo. Atalho clicado executa o comando pela mesma função do Enter e devolve o foco à linha de comando. Foco visível e alvo ≥ 44 px (o mockup usa `min-height:44px`). Teclas: Enter, Tab, ↑/↓. **Não** há Ctrl+L, Ctrl+C, Esc com efeito nem outras teclas (nada além do FR-007). Campo: `<label>` oculto "Comando", `$` com `aria-hidden`, `autocomplete="off"`, `autocapitalize="none"`, `spellcheck="false"`, `enterkeyhint="send"`. **Rationale:** FR-002, FR-007, NFR-003 e o mockup. **Alternatives:** autofoco na linha (esconde o "Sair" como primeiro item); `Esc` para sair (atalho invisível sem FR).

### TD-015: Entrada é só texto
**Decision:** `maxLength=200`; o texto digitado só passa por `fold`, `split` e comparação; é ecoado como nó de texto. **Rationale:** NFR-002. **Alternatives:** nenhuma razoável.

## Interface Contract
- **Rotas:** `/terminal` e `/en/terminal` (tabela de rotas, `bare: true`, `menu` ausente). Idioma pela URL (002 FR-020); o `Terminal` lê `useLanguage()`.
- **Marcos de página:** `main` (da 002) contém: `a` "Sair do terminal"; `h1` "Terminal"; `section aria-label="Terminal"` (introdução, `role="log"`, formulário, atalhos); `nav aria-label="Páginas"` (a lista de texto normal). Um só `h1`.
- **Texto da interface** (PT / EN, em `ui.terminal`): `exit`, `title`, `hint`, `intro`, `commandLabel`, `shortcutsLabel`, `usage(name)`, `notFound(text)`, `didYouMean(name)`, `candidates`, `noJs`, `openOn404`, `closeOn404`, `opening`, `openFailed`, e as oito descrições.
- **Teclas:** Enter executa; Tab completa; ↑/↓ histórico; Tab com campo vazio, ou sem candidato, segue o foco.

## Verification Strategy
Cada FR vira teste automatizado ou comando com exit code; os testes ficam dentro das tarefas e passam em `npm run verify`, exceto V-15, V-16 e V-18 (que rodam em `dist`/navegador, como o `npm run prova` da 002).
| ID | Cobre | Comando | Passa quando |
| --- | --- | --- | --- |
| V-01 | FR-001 | `npx vitest run src/data/routes.test.ts src/terminal/Terminal.test.tsx` | `terminal` é `bare`, fora do menu, não aparece em `ls` nem na navegação; `/en/terminal` existe |
| V-02 | FR-002, FR-007 | `npx vitest run src/terminal/Terminal.test.tsx` | o primeiro item focável do `main` é "Sair do terminal" (link para `pathInLang('/', lang)`); sem autofoco |
| V-03 | FR-003 | `npx vitest run src/terminal/Terminal.test.tsx` | o `role="log"` existe antes do 1º comando, tem `aria-live="polite"`, cada comando **acrescenta** um nó (os anteriores permanecem), a introdução e a dica ficam fora dele |
| V-04 | FR-004, FR-005 | `npx vitest run src/terminal/commands.test.ts src/terminal/match.test.ts` | cada um dos oito comandos, PT e EN, com maiúscula e sem acento; desconhecido tem "digite ajuda"; `projt` sugere `projetos`; `trilhas` não sugere nada; argumento extra dá `uso:`; vazio não gera entrada |
| V-05 | FR-005 | `npx vitest run src/terminal/removed.test.ts` | o conjunto de comandos é exatamente os oito (inventário); `neofetch`, `fortunes`, `agora`, `setup`, `cd`, `tema`, `idioma`, `trilhas`, `personas`, `jogos`, `assistente` respondem como desconhecidos; nenhum arquivo de `src/` contém `neofetch`, `fortune`, `Matrix`, `BootSequence`; cada comando tem atalho clicável |
| V-06 | FR-006 | `npx vitest run src/terminal/equivalence.test.ts` | todo `routeId` existe na tabela; todo `href` da saída é uma rota (ou canal) do conteúdo; os nomes de projeto da saída são exatamente os do conteúdo; nenhum texto de conteúdo literal em `src/terminal/*.ts(x)` (varredura) |
| V-07 | FR-007 | `npx vitest run src/terminal/Terminal.test.tsx` | Tab completa; Tab ambíguo lista candidatos no registro; Tab sem candidato **não** chama `preventDefault`; ↑/↓ percorrem o histórico e ↓ restaura o rascunho; máximo de 50 |
| V-08 | FR-002, NFR-003 | `npx playwright test e2e/terminal.e2e.ts` | só teclado: da abertura ao `home`; foco visível; foco nunca preso (Tab e Shift+Tab saem do campo); axe sem violação em `/terminal` e `/en/terminal`, claro e escuro |
| V-09 | FR-008 | `npx vitest run src/terminal/Terminal.test.tsx src/terminal/parity.test.ts` | as chaves de `ui.pt.terminal` e `ui.en.terminal` são as mesmas; cada comando tem saída não vazia nos dois idiomas; trocar o idioma re-desenha o registro sem reexecutar e sem perder entradas |
| V-10 | FR-009 | `npx vitest run scripts/prerenderTerminal.test.ts` | o HTML de `/terminal` e de `/en/terminal` tem um `h1`, "Sair do terminal" primeiro, a lista de rotas do menu como links, a mensagem sem JavaScript, e **não** tem o formulário |
| V-11 | FR-010 | `npx vitest run src/styles/styles.test.ts src/terminal/removed.test.ts` | o CSS do terminal não tem `animation` nem `transition` fora do neutralizado por movimento reduzido; não há timer de digitação no código |
| V-12 | FR-011 | `git grep -n -i -E "neofetch\|fortune\|BootSequence\|TerminalProvider\|RunButton\|CommandCatalog\|terminalUrl" -- src e2e` (exit 1) e `npm run verify` | nenhum resíduo; o `verify` passa (inclusive `tsc`, que pega import quebrado) |
| V-13 | FR-012 | `npx vitest run src/terminal/NotFoundTerminal.test.tsx` e `npx playwright test e2e/terminal.e2e.ts -g 404` | em rota inexistente: o texto, as sugestões e os links da 002 continuam; "Abrir o terminal" só depois da hidratação; clicar monta o terminal com foco na linha; oito comandos funcionam; "Fechar" devolve o foco ao botão; `home` navega; o status é 404 (`dist/404.html` + regra do `netlify.toml`, já cobertos pelos testes da 002) |
| V-14 | FR-013 | `npx vitest run src/terminal/hint.test.ts` | 1ª visita mostra; 2ª não; com `localStorage` que lança erro, mostra em toda visita e não lança |
| V-15 | NFR-001 | `npm run build:prova && node scripts/measureBundle.mjs dist-prova` e a nova checagem de chunk da tarefa | JS do 1º acesso ≤ 100 KB e sem aumento medido contra a linha de base; chunk do terminal ≤ 10 KB e CSS ≤ 3 KB (gzip); `main.tsx` não importa `terminal.css` |
| V-16 | NFR-001 | `npx playwright test e2e/terminal.e2e.ts -g INP` | INP ≤ 200 ms em `ajuda` e `projetos` (PerformanceObserver de `event`); a checagem vive em e2e novo, sem alterar `scripts/inpRun.mjs` |
| V-17 | NFR-002 | `npx vitest run src/terminal/commands.test.ts` | `<img onerror=...>`, `javascript:` e `{{7*7}}` aparecem como texto; nenhum `fetch` no módulo (varredura) |
| V-18 | NFR-003 | `npx playwright test e2e/terminal.e2e.ts -g axe` | contraste ≥ 4,5:1 e axe sem violação com saída longa e com erro, nos dois temas |

## Lista de remoção do código do terminal (FR-011) — para a Duda aprovar
**Nada foi removido por este design.** As remoções acontecem nas tarefas, depois de `tasks:approved`, e cada tarefa remove o que o código novo substitui.

### Remover (dentro de `src/terminal/`)
| Arquivo | Motivo |
| --- | --- |
| `extras/` inteira: `index.ts`, `neofetch.tsx`, `fun.tsx`, `gitlog.tsx`, `stats.tsx`, `pages.tsx` (`agora`, `setup`), `personal.tsx`, `personalView.tsx`, `ascii.ts`, `Matrix.tsx`, `Boot.tsx` e os testes `ascii.test.ts`, `Boot.test.tsx`, `extras.test.tsx`, `personal.test.tsx`, `phase3.test.tsx` | Q-004 (extras saem) e comandos de funcionalidade removida (`pessoal`, `stats`, `git log`, `matrix`, `rm`, `cow`, `sudo hire`) |
| `commands.tsx` (930 linhas) | reescrito como `commands.ts` com os oito comandos |
| `TerminalSession.tsx`, `sessionContext.ts` | sessão com replay, barra de carregamento, `?cmd=`, Esc/Ctrl+C; estado passa a ser `useTerminal` |
| `outputs.tsx`, `views.tsx`, `sectionViews.tsx`, `sectionsHelpers.ts`, `pageIndex.tsx` | saída em JSX, visões por seção e índice de seções; substituídos por `blocks.ts` + `TerminalOutput.tsx` + `sources.ts` |
| `catalog.ts` | só alimentava o `CommandCatalog` |
| `CommandInput.tsx` | `CommandInput` unia a barra e o terminal; a linha de comando passa a viver no `Terminal.tsx` |
| Testes: `deadCode.test.ts`, `redirect.test.tsx`, `sections.index.test.tsx`, `sections.nav.test.tsx`, `sections.pagesA.test.tsx`, `sections.pagesB.test.tsx`, `Terminal.test.tsx` (antigo) | testam código removido; os novos testes (V-01 a V-18) substituem |

### Reescrever no lugar (mesmo nome, conteúdo novo)
`Terminal.tsx`, `TerminalOutput.tsx`, `useTerminal.ts`, `src/pages/TerminalPage.tsx`, `src/styles/terminal.css` (607 linhas, encolhe; o que a 404 da 002 usa e continua sendo necessário no 1º acesso é conferido na tarefa, ver Riscos), o bloco `terminal` de `src/i18n/ui.ts`.

### Remover (fora de `src/terminal/`)
| Arquivo ou trecho | Motivo |
| --- | --- |
| `src/components/CommandCatalog.tsx`, `src/components/RunButton.tsx` | documentação de comandos e botão que rodavam comandos na sessão; sem o catálogo, `ajuda` e os atalhos fazem o papel |
| `src/data/fortunes.ts` | as frases saem com o comando (003, Q-005) |
| `src/i18n/ui.ts`: `term` (inclui `term.nav.*`, `firstVisit`, `try`, `degrees`, `hours`…) e `ws.terminal.*` (catálogo) | só o terminal antigo as lia; conferir `cmdbar.*` e `ws.*` antes (tarefa) |
| `e2e/site.e2e.ts`: teste "comando stats no terminal" | comando removido; o e2e novo cobre os oito |
| Trechos de testes que dirigem o terminal antigo: `src/components/Overlays.test.tsx` (linhas do `terminalInput`/`atalhos`/`ajuda`), `src/pages/InfoPages.test.tsx`, `src/pages/Workspace.test.tsx`, `src/appImports.test.ts` (atualizar o caso do `TerminalProvider`/`RunButton`/`CommandCatalog`), `src/data/routes.test.ts` (`command`, `terminalUrl`) | ajuste, não apagar o arquivo; **`src/App.test.tsx` está com alterações não commitadas de outra tarefa: o implementador confere antes de editar** |

### Proposto, mas toca código da 002 (precisa de OK explícito, DQ-006)
`src/data/routes.ts`: remover `terminalUrl` e o campo `command` das rotas; `legacyCommandTarget` simplificado; `src/router.tsx`: uso de `legacyCommandTarget` mantido. `src/App.tsx`: acréscimo do lançador no `default`. `src/main.tsx`: remover `import './styles/terminal.css'`.

### Fica
`src/terminal/Prompt.tsx` (o `NotFound` da 002 o importa), `src/utils/suggest.ts` (`levenshtein`, também da 404), `src/data/suggestRoutes.ts`, `src/data/shortcuts.ts` e `src/data/sections.ts` (a paleta e o `ShortcutsHelp` os usam; a tarefa confere que nada do terminal os importava a mais), `src/pages/lazyPages.ts` (continua com `TerminalPage`), as páginas `/agora` e `/setup` e seus dados (003). Os dados de `src/data/personal/*` ficam para a 008.

## Riscos
| Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- |
| A 003 muda os nomes dos módulos de conteúdo | Alta | Médio | só `sources.ts` importa conteúdo (TD-008); tarefas da 009 só começam com a 003 em `implementation:done` |
| `terminal.css` tem regras que a 404 da 002 usa (`.term-line`, `.t-prompt`, `.t-err`, `.not-found-cmd`) e hoje carrega no 1º acesso | Alta | Médio | tarefa 1 lista as classes usadas por `NotFound`; elas migram para o CSS da 404 (casca) antes de o resto do `terminal.css` virar chunk; V-15 mede o CSS |
| `<noscript>` não sai no pré-render | Média | Médio | fallback do TD-009; V-10 pega |
| Leitores de tela divergem no anúncio de `role="log"` com tabelas | Média | Médio | saída em linhas curtas, sem tabela real; teste manual com NVDA e VoiceOver antes do aceite (evidência na tarefa) |
| Mudança de idioma na 404 com o terminal aberto re-desenha o registro | Baixa | Baixo | TD-002/TD-003; coberto por V-09 |
| Alterar `App.tsx` quebra o `App.test.tsx` não commitado | Média | Baixo | teste novo em arquivo próprio; conferir o diff antes (Remoção) |
| Orçamento de 10 KB/3 KB é chute de arquitetura | Média | Baixo | linha de base medida na tarefa 1; decisão da Duda se não couber |
| A 404 pré-renderizada muda de HTML | Baixa | Alto | o lançador renderiza altura reservada e nada de conteúdo no servidor; V-13 compara com o HTML da 002 |

## Divergências entre o mockup e este design
| # | Mockup | Este design | Motivo |
| --- | --- | --- | --- |
| 1 | só o terminal e uma nota | acrescenta a lista permanente "Prefere sem terminal?" | FR-009 e NFR-003 (equivalente em texto normal) |
| 2 | `$ abrir` → `bash: abrir: comando não encontrado` | `<texto>: comando não encontrado. Digite “ajuda”.` (mantém a forma; `bash:` fora) | evita nomear um shell que não existe (DQ-009) |
| 3 | `<link>` do Google Fonts | não copiado | NFR-002; fontes são da 002 |
| 4 | rótulo `$` ligado ao campo | `$` com `aria-hidden` e rótulo oculto "Comando" | `$` não é nome acessível |

## Perguntas deste design (para a Duda)
- **DQ-001 `whoami`:** a rota `sobre` não está no menu e a 003 põe "sobre mim" no currículo. Posso apontar o `whoami` para `/curriculo`? (Se preferir `/sobre`, a 009 depende de a rota continuar existindo.)
- **DQ-002 Idioma no `/terminal`:** a variante sem casca não tem seletor de idioma (002, TD-024). Quem está em `/terminal` em PT só chega ao EN pela URL. Aceito, ou o terminal ganha um link de texto "English" ao lado de "Sair" (um acréscimo ao mockup)?
- **DQ-003 Sem animação:** posso cortar a barra "abrindo… [■■■□□□□□]", o boot e qualquer digitação animada? FR-010 passa a valer por construção.
- **DQ-004 Lista de páginas visível:** aceita a lista "Prefere sem terminal?" sempre visível abaixo do terminal (divergência 1)?
- **DQ-005 Orçamento:** chunk do terminal ≤ 10 KB JS e ≤ 3 KB CSS (gzip), lançador da 404 ≤ 1 KB, 1º acesso sem aumento. Confirma os números?
- **DQ-006 Código da 002:** posso, nas tarefas, (a) acrescentar o lançador no `default` do `App.tsx`, (b) tirar `import terminal.css` do `main.tsx`, (c) remover `terminalUrl` e o campo `command` de `routes.ts` e simplificar `legacyCommandTarget`? Nenhum texto da spec 002 muda.
- **DQ-007 Histórico:** só em memória, perdido ao sair de `/terminal`. Serve?
- **DQ-008 Dica:** gravar a marca ao abrir (não ao primeiro comando). Serve?
- **DQ-009 Mensagem de erro:** manter `bash:` do mockup ou tirar (proposta: tirar)?
- **DQ-010 Lista de remoção:** aprova a lista acima, em especial `fortunes.ts`, `CommandCatalog`, `RunButton`, `?cmd=` e o bloco `ui.term`?

## Decisões da Duda (2026-11-19)
A Duda aceitou as recomendações do arquiteto em todas as perguntas DQ-001 a DQ-010. Registro (sem mudar o texto das TD acima, que já refletem essas recomendações):
| DQ | Decisão |
| --- | --- |
| DQ-001 | `whoami` aponta para `/curriculo` (não depende da rota `sobre`). |
| DQ-002 | Sem seletor de idioma em `/terminal`: quem está na variante sem casca troca de idioma pela URL (`/en/terminal`). Nenhum link "English" é acrescentado. |
| DQ-003 | Sem barra de carregamento, sem sequência de boot e sem animação de digitação. FR-010 vale por construção. |
| DQ-004 | A lista "Prefere sem terminal?" fica sempre visível (divergência 1 do mockup aceita). |
| DQ-005 | Orçamento confirmado: chunk do terminal ≤ 10 KB de JS e ≤ 3 KB de CSS (gzip), lançador da 404 ≤ 1 KB, 1º acesso sem aumento. Se não couber, volta para a Duda; o número não é editado em silêncio. |
| DQ-006 | Pode mexer no **código** da 002 sem alterar o **texto** da spec 002: (a) lançador no `default` do `App.tsx`; (b) tirar `import './styles/terminal.css'` do `main.tsx` (o CSS passa a ser importado por `Terminal.tsx`); (c) remover `terminalUrl` e o campo `command` de `src/data/routes.ts`, com `legacyCommandTarget` simplificado. |
| DQ-007 | Histórico só em memória, perdido ao sair de `/terminal`. |
| DQ-008 | A marca da dica é gravada ao abrir o terminal (não no primeiro comando). |
| DQ-009 | Sem prefixo `bash:` na mensagem de erro (divergência 2 do mockup). |
| DQ-010 | **Lista de remoção APROVADA** (inclui `fortunes.ts`, `CommandCatalog`, `RunButton`, `?cmd=` e o bloco `ui.term`). A remoção só acontece **nas tarefas**, e só **depois que a spec 003 fechar**. Este design não removeu nada. |

Cuidado herdado: `src/App.test.tsx` tem alterações **não commitadas** de outra tarefa. O implementador confere o diff (`git diff src/App.test.tsx`) antes de editar esse arquivo e registra a conferência na evidência.

## Confirm before building
Só após `design:approved`: responder DQ-001 a DQ-010, e aguardar o design e o fechamento da 003 (dependência dura, TD-008). Os campos exatos do resumo do `curriculo` e do `academico` são fixados quando o design da 003 existir.
