# 007 Resume, academic and contact, Tasks
**Status:** draft (aguarda aprovação da Duda; ver `.status`) · **Versão:** 1.0 · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-19
**Entrada:** `requirements.md` v1.1 (v1.0 aprovada; a emenda FR-015 pede aceite junto com este arquivo), `design.md` v1.1 (aprovado em 2026-11-19; decisões Q-D1 a Q-D6 e TD-011 registradas em "Decisões da Duda").
**Estimativa total:** 19 tarefas, **60 h** (1 a 4 h cada), em 6 fases. A "Ação da Duda" (fora da contagem) está no fim.

## Como ler
- **Testes ficam dentro de cada tarefa.** Não há fase de testes separada.
- **Bloco de evidência** no fechamento de toda tarefa (conventions.md), em `evidence.md` nesta pasta, neste formato:
  ```
  Claim:      o que se afirma
  Command:    comando exato
  Exit code:  0
  Summary:    o que a saída mostrou
  Verdict:    PASS | FAIL
  ```
- **Gate de cada tarefa:** `npm run verify` com exit 0 no fim. Nenhuma tarefa deixa o repositório quebrado.
- **Commits** em português, `tipo(escopo): resumo`, citando o ID da tarefa, terminando com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. **Nenhuma tarefa inclui `git push`**; nada vai para a `main` (o Netlify publica a partir dela).
- **Nunca duas execuções de vitest ao mesmo tempo.** Orçamento da 001: suíte ≤ 90 s, `verify` ≤ 180 s; se estourar, repetir com a máquina ociosa antes de culpar o código.
- **Windows:** arquivos com barra invertida, crases ou `\uXXXX` vão pelo Write, não por heredoc.
- **Intocáveis:** `src.zip`; spec 008 (`netlify/personal/`, `personal-*.mts`, `scripts/personalGuard.*`, integrações, `@netlify/blobs`, bloco `[functions]`, `.env.example`); `src/pages/Services.tsx`, `services.tsx`, `services.css` e a rota `servicos` (Serviços fora, Q-003).
- **Arquivos da 002 que a 007 toca, só no que o design pede:** `src/data/routes.ts`, `netlify.toml`, `src/pages/lazyPages.ts`, `src/styles/styles.test.ts` (tirar a isenção de hex da impressão do currículo, que a T1.1 da 002 deixou com a 007 como dona), `scripts/serveDist.mjs` (só se não honrar redirecionamentos). O texto da spec 002 não muda.
- **Ambiguidade:** parar e perguntar; a resposta volta para a spec antes do código. Conteúdo só da 003, nada inventado; texto de interface em PT e EN com paridade.
- **O CSS não roda no vitest (`css: false`):** o que depende de CSS é provado no e2e sobre o build pré-renderizado (T5.x).

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados | OK: v1.0 aprovada em 2026-11-19. **Pendente de aceite:** emenda v1.1 (US-005, FR-015, Should), pedida pela Duda (D4 da 003) |
| Design aprovado | OK: `design:approved` em 2026-11-19 (`.status`); v1.1 com "Decisões da Duda" e TD-011 |
| Todo Must Have coberto | OK: FR-001 a FR-014 e os 3 NFR na tabela Coverage; FR-015 (Should) também tem tarefa (T2.7) |
| Todo Q-* respondido | OK: Q-001 a Q-006 do requirements; Q-D1 a Q-D6 do design (2026-11-19). Nenhuma pergunta aberta |
| Toda tarefa tem dependência, critério e verificação | OK (ver cada tarefa) |
| **Dependência dura: a spec 003 implementada** | **NÃO verificada.** Hoje `src/content/` só tem `credits.content.ts`. A **T1.1 é a trava**: se o conteúdo e o schema da 003 (perfil, contato, currículo, competências, acadêmico, "agora", setup) não existirem ou não tiverem os campos do Data Model, **parar e voltar à Duda** (risco D-A, D-B do design) |
| Pontos que dependem de medição | LCP, INP e CLS das três rotas (T5.4); tempo de validação do formulário ≤ 200 ms (T2.5). Se algum não couber, parar e propor (não alterar a meta em silêncio) |
| Estimativas de 4 h | T2.2, T2.3, T2.5, T3.1, T4.1 e T5.4 concentram risco; se uma estourar 4 h, **parar e avisar a Duda** antes de seguir |
| Ações manuais da Duda | 3 itens, fora do repositório, no fim deste arquivo; nenhuma tarefa as presume feitas |

## Coverage
| Requisito | Tarefas |
| --- | --- |
| FR-001 (currículo, seis seções) | T1.1, T2.2 |
| FR-002 (recolher/expandir, sem JS lista inteira) | T2.1, T2.2, T5.2 |
| FR-003 (impressão) | T4.1, T5.3 |
| FR-004 (acadêmico, média calculada) | T1.3, T2.3 |
| FR-005 (dado ausente "—", "em andamento") | T1.3, T2.3 |
| FR-006 (sobre dentro do currículo, foto opcional) | T2.2, T3.1 |
| FR-007 (canais e formulário) | T2.4, T2.5 |
| FR-008 (validação com ícone e texto) | T1.2, T2.5 |
| FR-009 (sucesso, falha mantém texto) | T1.4, T2.5, T5.1 |
| FR-010 (armadilha) | T2.5, T2.6, T5.1 |
| FR-011 (contador e limite) | T1.2, T2.5 |
| FR-012 (sem segredo) | T1.4, T1.5, T5.1 |
| FR-013 (PT e EN, endereço por idioma) | T2.2, T2.3, T2.4, T3.1 |
| FR-014 (sem JavaScript, `mailto:`) | T2.6, T5.2 |
| FR-015 (agora e setup, Should, emenda) | T1.1, T2.7 |
| NFR-001 (desempenho) | T2.5, T5.4 |
| NFR-002 (segurança) | T1.4, T1.5, T5.1 |
| NFR-003 (acessibilidade) | T2.5, T4.1, T5.3, T5.4 |
| Decisões: Q-D1 / Q-D2 / Q-D3 / Q-D4 / Q-D5 / Q-D6 / D4 da 003 | T3.1 / T1.4, T6.1 / T1.3, T2.3 / T4.1 / T1.2 / T2.5 / T2.7 |
| Remoções do design (tabela "Arquivos que esta spec remove") | T1.3, T2.2, T2.4, T2.5, T3.1, T4.1, T6.1 |

---

## Fase 1: Trava de entrada e camada de dados
### T1.1 Conferir a spec 003 e a lista de campos (D-A)
- **Requisito:** FR-001, FR-015 (insumo de todos) · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** nenhuma
- **Trabalho:** conferir, por leitura e comando, que existem em `src/content/` e no `registry` os oito arquivos da 003 (projetos, experiências, acadêmico, currículo, competências, contato, "agora", setup) e que oferecem cada campo da tabela Data Model do design (perfil: nome, apresentação, local, e-mail, GitHub, LinkedIn, foto opcional; texto "sobre"; destaque por id; competência com ano ou ausência; acadêmico `hours?`, `modality?`, `grade?`, `inProgress?`; `now` e `uses` com `updated`). Registrar no `evidence.md` o nome real de cada módulo e campo (as tarefas seguintes usam esses nomes). **Se faltar algo: parar; a divergência vai para a 003 ou para o design da 007 antes do código** (D-A). Registrar também se o conteúdo traz a frase da escala de notas (Q-D3).
- **Testes:** nenhum novo; usa os da 003.
- **Critérios de aceitação:** tabela "campo do design → módulo e campo real" no `evidence.md`, sem lacuna; `servicesEmail` confirmado como não lido pelas três páginas (Q-002).
- **Arquivos prováveis:** `evidence.md`
- **Verificação:** `node scripts/status.mjs read 003-content-migration` (valor `tasks:approved` ou posterior e a 003 com `review:done` ou equivalente na linha do INDEX; se não, parar); `npx vitest run src/content` (exit 0); `npm run verify` (exit 0)

### T1.2 `CONTACT_LIMITS`, `countChars` e `validateContact` (TD-003, TD-004, Q-D5)
- **Requisito:** FR-008, FR-011 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:** em `src/utils/validateContact.ts` (no lugar) exportar `CONTACT_LIMITS = { name:{min:2,max:100}, email:{max:254}, message:{min:10,max:5000} }`, `countChars(text)` (`[...text.trim()].length`) e `validateContact(fields)` devolvendo `{ campo: código }` (obrigatório, formato, curto, longo). O padrão de e-mail atual `^[^\s@]+@[^\s@]+\.[^\s@]+$` fica. Os textos de erro em `src/i18n/ui.ts` (PT e EN) interpolam os números da constante; nenhum limite repetido em `ui.ts` ou componente. A armadilha é checada antes (fica para a T2.5). Sem zod no navegador.
- **Testes:** `validateContact.test.ts` reescrito com a tabela entrada → resultado do requirements: tudo vazio, `a@`, mensagem só com espaços, 9/10 caracteres, 4999/5000/5001, emoji e letra composta contados como um ponto de código, nome com 1/2/100/101, e-mail com 254/255; um teste que lê `ui.ts` e prova que os limites vêm da constante (varredura: os literais `5000`, `254`, `100` não aparecem nas mensagens de erro).
- **Critérios de aceitação:** 5001 = erro de tamanho, 5000 aceita; paridade PT e EN dos novos textos passa.
- **Arquivos prováveis:** `src/utils/validateContact.ts`, `src/utils/validateContact.test.ts`, `src/i18n/ui.ts`
- **Verificação:** `npx vitest run src/utils/validateContact.test.ts scripts/parity.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.3 `semesterAverage`, remoção do que sai e varredura de notas (TD-008, Q-D3, Q-001)
- **Requisito:** FR-004, FR-005 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T1.1
- **Trabalho:** em `src/utils/academics.ts` acrescentar `semesterAverage(courses)`: soma das notas lançadas × 10 ÷ quantidade (inteiros), arredondada a uma casa com meia para cima, `null` sem nota (nunca 0). **Remover** `courseColumnsVisible` e `yearProgress` (TD-008) **e os testes que só eles tinham**. **Ficam** `summarizeSemester`, `activitiesByYear` e `academicTimeline.ts` (o terminal os usa; saem na 009). `summarizeSemester` continua com a média antiga para o terminal: um teste confere que as duas médias coincidem, para não haver duas verdades.
- **Testes:** `academics.test.ts`: casos da média (82,0; 85,4; 71,8 do mockup, calculados sobre as notas reais do conteúdo, não digitados), `.x5` arredonda para cima, sem nota = `null`, disciplina sem nota fora da média; **varredura sobre o conteúdo da 003**: toda `grade` é inteiro de 0 a 100 (Q-D3) e nenhum campo `average` ou `media` existe em conteúdo (FR-004).
- **Critérios de aceitação:** `git grep -n -E "courseColumnsVisible|yearProgress" -- src scripts` sem resultado (exit 1).
- **Arquivos prováveis:** `src/utils/academics.ts`, `src/utils/academics.test.ts`
- **Verificação:** `npx vitest run src/utils/academics.test.ts` (exit 0); `git grep -n -E "courseColumnsVisible|yearProgress" -- src scripts` (exit 1); `npm run verify` (exit 0)

### T1.4 `emailService` com import dinâmico e sem segredo (TD-001, Q-D2)
- **Requisito:** FR-009, FR-012, NFR-002 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:** em `src/services/emailService.ts` carregar `@emailjs/browser` por `import()` dentro de `sendContactMessage` (chunk próprio, nada do SDK no pacote da página); manter `blockHeadless`, `limitRate` de 15 s, `classifySendError` (`network`, `rate-limited`, `error`, `not-configured`); enviar só `{ from_name, from_email, reply_to, message }`; `console.error` registra só o status, nunca os campos; nada em `localStorage`. Pré-carga opcional do chunk no primeiro foco de um campo (exportar `preloadEmailService()`, sem terceiros). Acrescentar a `scripts/secretScan.test.ts` o caso `VITE_EMAILJS_PRIVATE_KEY` (e nomes com `PRIVATE`, `SECRET`, `TOKEN`) reprovando, e os três IDs públicos passando.
- **Testes:** `emailService.test.ts` ajustado (SDK mockado, nenhum e-mail real): sucesso, rede, 429, erro, variáveis ausentes, payload sem campos extras, chamada só após o `import()`; `secretScan.test.ts` e `secretGuard.test.ts` com o caso novo.
- **Critérios de aceitação:** `git grep -n -i "emailjs" -- src` só em `emailService.ts`, no teste e em tipos; nenhuma chave privada no repositório.
- **Arquivos prováveis:** `src/services/emailService.ts`, `src/services/emailService.test.ts`, `scripts/secretScan.test.ts`
- **Verificação:** `npx vitest run src/services/emailService.test.ts scripts/secretScan.test.ts scripts/secretGuard.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.5 `.env.prova` e aviso de build sem variáveis (R-006, V-08)
- **Requisito:** FR-012, NFR-002 · **Prioridade:** P1 · **Estimativa:** 2 h · **Dependências:** T1.4
- **Trabalho:** criar `.env.prova` (commitado) **só com valores falsos** `prova-…` para os três IDs, lido apenas no modo `prova` e sobrepondo `.env`; um aviso (não falha) no build quando faltam as variáveis fora do modo `prova` (o `verify` local não tem `.env`); um teste confere que `dist/` (build normal) **não** contém os valores de `prova`. Não tocar `.env.example` (008).
- **Testes:** `scripts/buildConfig.test.ts` (ou teste irmão): valores do `.env.prova` com prefixo `prova-`; o aviso aparece sem variáveis e some com elas; `checkDist` reprova valor de prova em `dist/`.
- **Critérios de aceitação:** `npm run build` com exit 0 e aviso visível quando faltam variáveis; `npm run build:prova` com exit 0 e formulário configurado.
- **Arquivos prováveis:** `.env.prova`, `vite.config.ts`, `scripts/checkDist.mjs`, `scripts/buildConfig.test.ts`
- **Verificação:** `npx vitest run scripts/buildConfig.test.ts scripts/checkDist.test.ts` (exit 0); `npm run build:prova` (exit 0); `node scripts/checkDist.mjs dist` (exit 0); `npm run verify` (exit 0)

---

## Fase 2: Componentes e páginas
### T2.1 `ExpandableText` (TD-007)
- **Requisito:** FR-002 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:** criar `src/components/ExpandableText.tsx`: o servidor rende a descrição longa (acima do limite, constante nomeada) com a classe `clamped` **e** o botão no HTML; o recorte e o botão só existem sob `.js` (CSS no `resume.css`); `<button>` nativo com `aria-expanded`, `aria-controls` e rótulo "Mostrar mais/menos" (PT e EN em `ui.ts`); o texto completo fica na árvore de acessibilidade. Substitui o `ExperienceCard` embutido (a troca de uso entra na T2.2).
- **Testes:** `ExpandableText.test.tsx`: estado inicial recolhido, Enter e Espaço alternam, `aria-expanded` e `aria-controls` coerentes, texto curto não mostra botão, texto completo sempre presente no DOM, rótulo nos dois idiomas.
- **Critérios de aceitação:** sem estado que dependa só de React para a lista aparecer inteira (a prova sem JavaScript é a T5.2).
- **Arquivos prováveis:** `src/components/ExpandableText.tsx`, `src/components/ExpandableText.test.tsx`, `src/styles/resume.css`, `src/i18n/ui.ts`
- **Verificação:** `npx vitest run src/components/ExpandableText.test.tsx scripts/parity.test.ts` (exit 0); `npm run verify` (exit 0)

### T2.2 Currículo reescrito: seis seções, "sobre" e foto opcional (TD-009, Q-D1)
- **Requisito:** FR-001, FR-002, FR-006, FR-013 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.1, T2.1
- **Trabalho:** reescrever `src/pages/Resume.tsx` no lugar, lendo só o conteúdo da 003 (nomes da T1.1): cabeçalho (nome, apresentação, local, e-mail, GitHub, LinkedIn, botão "Imprimir / salvar em PDF" que chama `window.print()` e a dica), e as seis seções em `<section aria-labelledby>` com **ids fixos**: `sobre`, `projetos-em-destaque`, `experiencias`, `competencias`, `formacao`, `reconhecimentos` (os redirecionamentos da T3.1 usam `#sobre`, `#experiencias` e `#competencias`). Foto só se o perfil tiver imagem validada (`alt` PT/EN, largura e altura); sem foto, nenhum `<img>` e nenhum espaço. Competência sem ano mostra só o nome. Índice lateral só em tela (`DocPage`). Registrar a página no `lazyPages.ts`. Texto de interface em `ui.ts` (PT e EN).
- **Testes:** `Resume.test.tsx`: as seis seções em PT e EN com o texto do conteúdo, cada uma ligada ao seu título; ids das seções; "sobre" sem foto sem `<img>` e com foto com `alt`, largura e altura; competência sem ano; um `<h1>`; botão de imprimir chama `window.print` (mock); `DocPages.test.tsx` ajustado (parte do currículo).
- **Critérios de aceitação:** nenhum texto de conteúdo no componente (varredura do teste de conteúdo da 001 passa); `src/sections/portfolio/About.tsx` ainda não é removido aqui (T3.1).
- **Arquivos prováveis:** `src/pages/Resume.tsx`, `src/pages/Resume.test.tsx`, `src/pages/DocPages.test.tsx`, `src/pages/lazyPages.ts`, `src/styles/resume.css`, `src/i18n/ui.ts`
- **Verificação:** `npx vitest run src/pages/Resume.test.tsx src/pages/DocPages.test.tsx` (exit 0); `npx vitest run src/pages/Resume.test.tsx -t "competência"` (exit 0); `npm run verify` (exit 0)

### T2.3 Acadêmico reescrito: tabelas por semestre e média (TD-008, Q-D3)
- **Requisito:** FR-004, FR-005, FR-013 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.1, T1.3
- **Trabalho:** reescrever `src/pages/Academics.tsx` no lugar: formação (cartões; estado em texto "cursado até…", "em andamento · previsão…"), linha do tempo (lista ordenada), "O que fiz em cada ano" (tipo em texto), e "Disciplinas e notas": uma `<table>` por semestre com `<caption>`, colunas Disciplina, Horas, Modalidade e Nota **sempre presentes**, ausente = "—", linha "média 82,0 · N disciplinas" (vírgula em PT, ponto em EN; uma casa) só em semestre concluído com nota; `inProgress` = selo "em andamento" em texto, sem média, com a nota de rodapé de texto de interface quando vazio. **Escala 0 a 100 e "só disciplinas aprovadas" (Q-D3):** a frase vem do conteúdo se a T1.1 achou ali; senão, de `ui.ts` com comentário citando a decisão da Duda de 2026-11-19; nada de escala inventada fora disso. Os totais `done/total` de carga e a barra `yearProgress` não voltam. Registrar no `lazyPages.ts` se preciso.
- **Testes:** `Academics.test.tsx`: média igual à calculada do conteúdo em PT e EN, "—" nas três colunas, semestre atual "em andamento" sem média, semestre concluído com disciplina sem nota (média só das lançadas, rodapé conta todas as linhas), `<caption>` e cabeçalhos de coluna, a frase da escala, nenhuma barra de progresso.
- **Critérios de aceitação:** a média vem só da função pura; o teste de varredura da T1.3 segue verde.
- **Arquivos prováveis:** `src/pages/Academics.tsx`, `src/pages/Academics.test.tsx`, `src/pages/DocPages.test.tsx`, `src/styles/resume.css` (ou `academics.css` se já existir), `src/i18n/ui.ts`
- **Verificação:** `npx vitest run src/utils/academics.test.ts src/pages/Academics.test.tsx` (exit 0); `npm run verify` (exit 0)

### T2.4 `Contact.tsx` e canais (FR-007; remove a `Contact` e a `About` antigas)
- **Requisito:** FR-007, FR-013 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:** criar `src/pages/Contact.tsx` (título, frase de abertura do conteúdo, `ContactLinks`, nota "Respondo por e-mail", e o `ContactForm` entra na T2.5; por ora um espaço reservado sem lógica) e registrar em `lazyPages.ts` (hoje `contato` passa por `SectionPage`). Reescrever `ContactLinks.tsx`: sem emojis, lendo o conteúdo de contato da 003, e-mail com `mailto:` simples, LinkedIn e GitHub com `rel="noopener noreferrer"`; **não importa mais `profile`** e `servicesEmail` não aparece (Q-002). **Remover** `src/sections/portfolio/Contact.tsx` e ajustar `SectionPage.tsx` (entrada `contato`; `sobre` fica para a T3.1); `Services.tsx` continua importando o que usa de `ContactLinks`, então conferir que não quebra.
- **Testes:** `Contact.test.tsx` (parte dos canais): três canais com os endereços do conteúdo, `rel` nos externos, sem `servicesEmail`, um `<h1>`, PT e EN; `ContactLinks` sem emoji; testes de `SectionPage`/`Services` seguem verdes.
- **Critérios de aceitação:** `git grep -n "sections/portfolio/Contact" -- src` sem resultado; `Services.tsx` sem alteração além do que o `ContactLinks` novo exige (se exigir, parar e perguntar).
- **Arquivos prováveis:** `src/pages/Contact.tsx`, `src/pages/Contact.test.tsx`, `src/components/ContactLinks.tsx`, `src/pages/lazyPages.ts`, `src/pages/SectionPage.tsx`; removido `src/sections/portfolio/Contact.tsx`
- **Verificação:** `npx vitest run src/pages/Contact.test.tsx src/pages/Workspace.test.tsx` (exit 0); `git grep -n "sections/portfolio/Contact" -- src` (exit 1); `npm run verify` (exit 0)

### T2.5 `ContactForm`: validação, contador, armadilha e estados (TD-003, TD-004, TD-005, Q-D5, Q-D6)
- **Requisito:** FR-007, FR-008, FR-009, FR-010, FR-011, NFR-001, NFR-002, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.2, T1.4, T2.4
- **Trabalho:** reescrever `ContactForm.tsx` no lugar: `<form noValidate>`, campos Nome, E-mail e Mensagem com `<label>`, `autocomplete`, `aria-invalid` e `aria-describedby`; erro = `<small>` com ícone SVG `aria-hidden` + texto; foco no primeiro campo inválido ao enviar; o erro some quando o campo fica válido. Contador "N / 5000" (de `CONTACT_LIMITS`), sem `maxLength`, sem `aria-live` por tecla; acima do limite vira erro com texto "Passou do limite em N caracteres" e o envio é recusado. **Armadilha:** `<div class="hp-field" aria-hidden="true" inert>` com `<input tabindex="-1" autocomplete="off">` e `name` de uma constante que não é nome reconhecido pelo preenchimento automático (nunca `website`, `url`, `company`, `phone`, `email`); checada **antes** da validação; preenchida = nenhuma chamada ao SDK, nada gravado, **mostra a confirmação normal e esvazia** (Q-D6). Região `role="status" aria-live="polite"` desde a primeira renderização; estados `idle`, `sending` (`aria-disabled` + `readOnly`, nunca `disabled`; trava síncrona contra clique duplo), `success` (foco permanece no botão), `network`, `rate-limited`, `error`, `not-configured` (igual a `error`), todos com `mailto:` sem parâmetros e texto mantido. `preloadEmailService()` no primeiro foco de campo. Nada em `localStorage`. Textos em `ui.ts` (PT e EN).
- **Testes:** `ContactForm.test.tsx` (SDK mockado): vazio e `a@` mostram erro com ícone, texto e `aria-describedby`, sem chamada ao SDK; foco no primeiro inválido; 4999/5000/5001; colar acima do limite não corta; sucesso esvazia; falha de rede, 429 e erro mantêm o texto e mostram `mailto:`; armadilha preenchida não chama o SDK e mostra a confirmação; `inert` e `aria-hidden` presentes e `name` fora da lista proibida; sem `disabled` durante o envio; dois cliques = uma chamada; validação medida com `performance.now()` ≪ 200 ms; PT e EN.
- **Critérios de aceitação:** nenhum limite digitado no componente; nada além de `{ from_name, from_email, reply_to, message }` segue ao serviço.
- **Arquivos prováveis:** `src/components/ContactForm.tsx`, `src/components/ContactForm.test.tsx`, `src/pages/Contact.tsx`, `src/styles/contact.css` (novo), `src/styles/base.css` (`.hp-field`), `src/i18n/ui.ts`
- **Verificação:** `npx vitest run src/components/ContactForm.test.tsx src/pages/Contact.test.tsx scripts/parity.test.ts` (exit 0); `npm run verify` (exit 0)

### T2.6 Fallback `mailto:` sem JavaScript e espaço reservado (TD-002, Q-005)
- **Requisito:** FR-010, FR-014 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T2.5
- **Trabalho:** o contêiner do formulário recebe `data-ready` em `useEffect` (só no cliente); o servidor rende sempre formulário e o bloco de fallback ("O formulário precisa de JavaScript; escreva direto para…", e-mail em `mailto:`); em `contact.css`, sem `[data-ready]` o formulário fica `display: none` e o fallback visível, com `[data-ready]` o contrário, ambos num contêiner com `min-height` reservado (CLS). Sem `<noscript>`, sem a classe `js` do `<html>` para isso.
- **Testes:** `ContactForm.test.tsx`/`Contact.test.tsx`: renderização no servidor (`renderToString`) traz formulário e fallback, sem `data-ready`; após montar, `data-ready` presente; o fallback usa o e-mail do conteúdo; `scripts/prerender.test.ts` confere o `mailto:` no HTML das duas rotas de contato. O comportamento visual é provado na T5.2.
- **Critérios de aceitação:** sem aviso de hidratação (o servidor e o primeiro render do cliente são iguais).
- **Arquivos prováveis:** `src/components/ContactForm.tsx`, `src/styles/contact.css`, testes, `scripts/prerender.test.ts`
- **Verificação:** `npx vitest run src/components/ContactForm.test.tsx src/pages/Contact.test.tsx scripts/prerender.test.ts` (exit 0); `npm run verify` (exit 0)

### T2.7 `/agora` e `/setup` reescritas (FR-015, TD-011, D4 da 003)
- **Requisito:** FR-015 · **Prioridade:** P2 (Should) · **Estimativa:** 3 h · **Dependências:** T1.1
- **Trabalho:** reescrever `src/pages/InfoPages.tsx` no lugar para ler `src/content/now.content.ts` e `uses.content.ts` (nomes confirmados na T1.1), com a mesma tela de hoje (título e descrição da tabela de rotas, lista de itens, "atualizado em" com a data do conteúdo, aviso de rascunho quando `uses` não tem itens). **Nenhum texto novo.** O estado de rascunho das rotas **não muda** (`routeStatus.ts` continua lendo os módulos antigos). `InfoBodies.tsx`, `data/now.ts` e `data/uses.ts` **ficam** (o terminal os usa; a 009 apaga). Teste descartável de equivalência entre o conteúdo novo e `data/now.ts`/`data/uses.ts`, com um comentário "remover na 009".
- **Testes:** `InfoPages.test.tsx`: `/agora` mostra o item e a data, PT e EN; `/setup` vazio mostra o aviso e nenhuma lista; as duas rotas continuam `draft` em `routes.test.ts`; equivalência passa; um `<h1>`.
- **Critérios de aceitação:** nenhum diff em `routeStatus.ts`; as páginas não importam mais `data/now.ts` nem `data/uses.ts`.
- **Arquivos prováveis:** `src/pages/InfoPages.tsx`, `src/pages/InfoPages.test.tsx`, teste de equivalência
- **Verificação:** `npx vitest run src/pages/InfoPages.test.tsx src/data/routes.test.ts src/data/seo.test.ts` (exit 0); `git grep -n -E "data/(now|uses)" -- src/pages` (exit 1); `npm run verify` (exit 0)

---

## Fase 3: Rotas e endereços antigos
### T3.1 Sair `/sobre`, `/experiencias`, `/habilidades`, com 301 para o currículo (TD-009, Q-D1)
- **Requisito:** FR-006, FR-013 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.2, T2.4
- **Trabalho:** **antes de mexer, `git grep` das entradas `sobre`, `habilidades` e `experiencias` em `src` e `scripts`** (terminal e paleta usam `command`, `sections.ts`, `routeStatus`): se algum dono fora da 007 (terminal, 009) depender dessas entradas e a remoção quebrar, **parar e perguntar** em vez de seguir. Se for seguro: retirar as três entradas de `src/data/routes.ts` (e de `sections.ts`), `legacyHashes` com `/#sobre`, `/#experiencias`, `/#habilidades` apontando para `/curriculo`; remover `src/sections/portfolio/About.tsx` e as entradas `sobre` de `SectionPage.tsx` (as de `projetos` e demais são das 004/005). Em `netlify.toml` acrescentar **antes da regra de 404** seis 301 (sem `force`): `/sobre` → `/curriculo#sobre`, `/experiencias` → `/curriculo#experiencias`, `/habilidades` → `/curriculo#competencias`, e `/en/about` → `/en/resume#sobre`, `/en/experience` → `/en/resume#experiencias`, `/en/skills` → `/en/resume#competencias`. Conferir que `scripts/serveDist.mjs` honra redirecionamentos do `netlify.toml`; se não, estender só isso. O texto da spec 002 não muda; registrar no `evidence.md` o diff de `routes.ts` e `netlify.toml`.
- **Testes:** `routes.test.ts` e `legacyHashes.test.tsx` ajustados (os três ids saem; hashes antigos levam a `/curriculo`); `headers.test.ts`/`serveDist.test.ts`: cada uma das seis regras responde 301 com o destino certo e vem antes do 404; `checkDist` e `prerender.test.ts`: não existe `sobre.html` nem `en/about.html`; cada destino do redirecionamento tem o `id` correspondente no HTML do currículo (liga com os ids da T2.2); sitemap e `hreflang` sem as três rotas.
- **Critérios de aceitação:** nenhum link interno do site aponta para as rotas removidas (`git grep` das três rotas em `src`, `public`, `README.md` só em contexto de redirecionamento/teste).
- **Arquivos prováveis:** `src/data/routes.ts`, `src/data/sections.ts`, `src/pages/SectionPage.tsx`, `netlify.toml`, `scripts/serveDist.mjs`, testes; removido `src/sections/portfolio/About.tsx`
- **Verificação:** `npx vitest run src/data/routes.test.ts src/data/legacyHashes.test.tsx scripts/headers.test.ts scripts/serveDist.test.ts scripts/prerender.test.ts` (exit 0); `npm run build` e `node scripts/checkDist.mjs dist` (exit 0); `git grep -n "sections/portfolio/About" -- src` (exit 1); `npm run verify` (exit 0)

---

## Fase 4: Impressão
### T4.1 `print.css` e migração dos `@media print` antigos (TD-006, Q-D4)
- **Requisito:** FR-003, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.2
- **Trabalho:** criar `src/styles/print.css`, importado pela página do currículo (CSS do chunk da rota): `@page { size: A4; margin: 16mm }`; 10,5 a 11 pt, `line-height` 1,4; ocultar os seletores **atuais da casca da 002** (faixa decorativa, `.skip-link`, `.lang-offer`, `.hdr`, `.credits`, `.doc-toc`, botão e dica de imprimir, "Mostrar mais/menos", paleta, qualquer controle); preto sobre branco; links sublinhados em preto; `chip` sem fundo; `break-inside: avoid` em cada experiência, projeto em destaque, reconhecimento e bloco de formação, `break-after: avoid` em `h2`/`h3`, `orphans: 3; widows: 3`; recolhidos abrem (`.clamped` sem recorte); **depois de cada link externo, o endereço** (`a[href^="https"]::after { content: " (" attr(href) ")" }`, Q-D4). **Sem valores hex** (o `styles.test.ts` proíbe fora de `tokens.css`): usar os tokens de impressão da 002 ou palavras-chave de cor. **Remover** os `@media print` antigos de `resume.css`, `ui.css` e `sections.css` que tratam o currículo, e **a isenção (ii) de hex da impressão do currículo em `styles.test.ts`** (a 002 deixou a 007 como dona).
- **Testes:** `src/styles/print.test.ts`: existe `@page`, `break-inside: avoid` nos itens, cada seletor oculto **existe no código da casca** (R-005: falha se ficar obsoleto), nenhum hex, a regra do endereço existe; `styles.test.ts` sem a isenção (ii) e verde; um teste mostra que a isenção removida de fato reprovaria um hex plantado.
- **Critérios de aceitação:** nenhum `@media print` de currículo fora de `print.css`; a impressão real é provada na T5.3.
- **Arquivos prováveis:** `src/styles/print.css`, `src/styles/print.test.ts`, `src/styles/resume.css`, `src/styles/ui.css`, `src/styles/sections.css`, `src/styles/styles.test.ts`, `src/pages/Resume.tsx`
- **Verificação:** `npx vitest run src/styles/print.test.ts src/styles/styles.test.ts` (exit 0); `git grep -n "@media print" -- src/styles` (só `print.css`, e a de `services.css`/outras fora do currículo, nomeadas no `evidence.md`); `npm run verify` (exit 0)

---

## Fase 5: Provas no navegador
### T5.1 e2e do contato (V-08, V-09)
- **Requisito:** FR-009, FR-010, FR-012, NFR-002 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.5, T2.6
- **Trabalho:** `e2e/contact.e2e.ts` sobre `dist-prova` (formulário configurado pelo `.env.prova`): `api.emailjs.com` respondida por `page.route` (nenhum envio real). Casos: sucesso (confirmação e formulário vazio), falha de rede, 429, **armadilha preenchida = 0 requisições ao EmailJS e confirmação normal**, e-mail inválido sem requisição, 5001 caracteres recusados, duplo clique = 1 requisição; **a página abre sem nenhuma requisição de terceiro** e o chunk do SDK só baixa no primeiro foco ou envio; Tab não alcança a armadilha; sem aviso de hidratação. Acrescentar ao `checkDist` (ou teste) a conferência de que o SDK não está no chunk da página nem no pacote da home e de que `dist/` não tem os valores de prova nem segredo.
- **Testes:** o próprio e2e e `checkDist.test.ts`.
- **Critérios de aceitação:** passa nos 2 temas × 2 idiomas.
- **Arquivos prováveis:** `e2e/contact.e2e.ts`, `scripts/checkDist.mjs`, `scripts/checkDist.test.ts`
- **Verificação:** `npm run build:prova` (exit 0); `npx playwright test --project=shell e2e/contact.e2e.ts` (exit 0); `node scripts/checkDist.mjs dist` (exit 0); `npm run verify` (exit 0)

### T5.2 e2e sem JavaScript (V-10)
- **Requisito:** FR-002, FR-014 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.3, T2.6, T3.1
- **Trabalho:** `e2e/nojs.e2e.ts` com `javaScriptEnabled: false` sobre `dist-prova`: `/curriculo`, `/academico` e `/contato` (e `/en/resume`, `/en/academics`, `/en/contact`) têm `<main>`, um `<h1>` e o conteúdo no HTML; lista longa inteira e sem botão "Mostrar mais"; formulário oculto e `mailto:` visível; e CLS sem salto entre fallback e formulário com JavaScript ligado. Conferir também os redirecionamentos 301 no servidor de teste.
- **Testes:** o próprio e2e e `prerender.test.ts`.
- **Critérios de aceitação:** passa nos 2 idiomas; sem rolagem horizontal em 360 px nas três páginas.
- **Arquivos prováveis:** `e2e/nojs.e2e.ts`, `scripts/prerender.test.ts`
- **Verificação:** `npm run build:prova` (exit 0); `npx playwright test --project=shell e2e/nojs.e2e.ts` (exit 0); `npx vitest run scripts/prerender.test.ts` (exit 0); `npm run verify` (exit 0)

### T5.3 e2e da impressão com PDF aberto e lido (V-11)
- **Requisito:** FR-003, NFR-003 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T4.1
- **Trabalho:** `e2e/resume-print.e2e.ts` com `emulateMedia({ media: 'print' })`: cabeçalho, rodapé de créditos, faixa de idioma, índice, botões e o botão de imprimir ocultos; fundo `rgb(255, 255, 255)`, texto `rgb(0, 0, 0)`; `break-inside: avoid` nos itens; com o site em tema escuro o resultado é o mesmo; gerar o PDF por `page.pdf()` (PT e EN) em `e2e/shots/`, conferir ≥ 1 página, extrair o texto e confirmar as seis seções e um endereço depois de cada link externo, e **abrir e ler o PDF** (Read com `pages`), anotando no `evidence.md` o que foi visto, item a item (a Success Metric exige). Se um item estiver cortado entre páginas, voltar à T4.1.
- **Testes:** o próprio e2e.
- **Critérios de aceitação:** PDF salvo, lido e conferido; nenhum item cortado.
- **Arquivos prováveis:** `e2e/resume-print.e2e.ts`, `e2e/shots/` (PDFs; não vão ao commit se `e2e/shots` já é ignorado, conferir), `evidence.md`
- **Verificação:** `npm run build:prova` (exit 0); `npx playwright test --project=shell e2e/resume-print.e2e.ts` (exit 0); leitura do PDF registrada; `npm run verify` (exit 0)

### T5.4 Medição: LCP, INP, CLS, axe e Lighthouse nas três rotas (V-13, V-14)
- **Requisito:** NFR-001, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T5.1, T5.2, T5.3
- **Trabalho:** estender `npm run prova` (`scripts/lighthouseRun.mjs`, `scripts/inpRun.mjs`, `e2e/prova.e2e.ts`) às rotas `/curriculo`, `/academico` e `/contato` (e as `/en/...`): axe com 0 violações em 2 temas × 2 idiomas; Lighthouse perfil celular (3 execuções, mediana) com acessibilidade, SEO e boas práticas ≥ 95; LCP ≤ 2,5 s, CLS ≤ 0,1 (incluindo a troca fallback → formulário), INP ≤ 200 ms; o orçamento de JS e CSS da 002 (`measureBundle`) segue verde (o SDK em chunk próprio não conta na home). `/agora` e `/setup` são rascunho e ficam fora da medição. **Se algum número não couber: parar e propor** à Duda, sem editar a meta.
- **Testes:** `scripts/prova.test.ts` ajustado para a lista de rotas; a medição é o próprio `npm run prova`.
- **Critérios de aceitação:** números e versões das ferramentas no `evidence.md`; `npm audit --omit=dev` continua 0.
- **Arquivos prováveis:** `scripts/lighthouseRun.mjs`, `scripts/inpRun.mjs`, `scripts/prova.test.ts`, `e2e/prova.e2e.ts`
- **Verificação:** `npx vitest run scripts/prova.test.ts` (exit 0); `npm run prova` (exit 0); `npm audit --omit=dev` (exit 0); `npm run verify` (exit 0)

---

## Fase 6: Fechamento
### T6.1 Remoções, aceite final e Success Metrics
- **Requisito:** todos, Success Metrics, tabela "Arquivos que esta spec remove" · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.4, T2.7, T3.1
- **Trabalho:** conferir a lista de remoções do design com `git grep` (`sections/portfolio/Contact`, `sections/portfolio/About`, `courseColumnsVisible`, `yearProgress`, `@media print` do currículo fora de `print.css`, rotas `/sobre`, `/experiencias`, `/habilidades` fora dos redirecionamentos) e confirmar que **ficaram** os arquivos que o terminal ainda usa (`data/resume`, `academics`, `experiences`, `profile`, `skillTimeline`, `now`, `uses`, `utils/resume.ts`, `summarizeSemester`, `activitiesByYear`, `academicTimeline.ts`, `InfoBodies`) com o dono "009" no `evidence.md`; `Services.tsx`, `services.*` e a rota `servicos` sem diff. `npm run verify` 3 vezes (máquina ociosa) com o tempo de cada um e da suíte; `npm run prova`; `node scripts/checkDist.mjs dist`; `git diff --stat main...HEAD -- netlify scripts/personalGuard.ts src/services/integrations .env.example` sem nada da 008 (exceto `netlify.toml` nas regras 301); `git ls-files src.zip` vazio. Checklist de cada Success Metric com o teste que o prova (2 cliques, PDF lido, formulário nos cinco casos, axe/Lighthouse, zero segredo, média igual ao conteúdo). Registrar as três **ações manuais da Duda** como pendentes ou feitas, e o item de CSP para a 010 (`connect-src` com `https://api.emailjs.com`). Atualizar `INDEX.md` não faz parte (painel da Duda).
- **Testes:** os comandos acima são a verificação.
- **Critérios de aceitação:** todo item de Success Metrics marcado com evidência; nenhuma remoção do design sem conferência; `src.zip` intacto.
- **Arquivos prováveis:** `evidence.md`
- **Verificação:** `npm run verify` (3 vezes, exit 0); `npm run prova` (exit 0); `node scripts/checkDist.mjs dist` (exit 0); `git grep -n -E "courseColumnsVisible|yearProgress|sections/portfolio/(Contact|About)" -- src scripts` (exit 1); `git ls-files src.zip` (vazio)

---

## Phase dependencies
```
T1.1 ─┬─► T1.2 ─────────────────────────────┐
      ├─► T1.3 ─► T2.3 ─────────────────────┼─► T5.2 ─┐
      ├─► T1.4 ─► T1.5 ──────────┐          │          │
      ├─► T2.1 ─► T2.2 ─┬─► T4.1 ─► T5.3 ───┼──────────┤
      │                 └─► T3.1 ───────────┘          │
      ├─► T2.4 ─► T2.5 (T1.2, T1.4) ─► T2.6 ─► T5.1 ───┼─► T5.4 ─► T6.1
      │          T2.4 ─► T3.1                            │
      └─► T2.7 ─────────────────────────────────────────┘ (entra no T6.1)
```
- **A T1.1 é a trava:** sem a 003 implementada, nada começa. Uma tarefa e um commit de cada vez, cada uma com o `verify` verde.
- A T2.2 precisa dos ids de seção que a T3.1 usa nos redirecionamentos; a T3.1 só depois dela.

## Lacunas, propostas e perguntas abertas
| ID | Lacuna ou ambiguidade | Proposta (a Duda decide) |
| --- | --- | --- |
| TQ-001 | A 003 não está implementada e não se sabe os nomes finais dos módulos de conteúdo | A T1.1 mapeia os nomes reais; falta de campo volta para a 003 |
| TQ-002 | As entradas `sobre`, `habilidades` e `experiencias` de `routes.ts` podem ser usadas pelo terminal e pela paleta (donos: 009) | A T3.1 faz `git grep` antes e **para e pergunta** se a remoção quebrar algo fora da 007 |
| TQ-003 | A frase "nota de 0 a 100 · só disciplinas aprovadas" pode não existir no conteúdo da 003 | Se não existir, vai em `ui.ts` citando a decisão de 2026-11-19 (T2.3); a Duda pode preferir mover para o conteúdo |
| TQ-004 | A emenda FR-015 altera um requirements já aprovado | Aceite junto com este `tasks.md`; se recusada, a T2.7 sai (−3 h) e as páginas continuam sem dono |
| TQ-005 | Ids de seção `projetos-em-destaque`, `formacao`, `reconhecimentos` são proposta (só `sobre`, `experiencias`, `competencias` são exigidos por Q-D1) | Aceitar ou trocar antes de aprovar |
| TQ-006 | Os PDFs de `e2e/shots/` podem ou não estar no `.gitignore` | A T5.3 confere; a Duda decide se vão ao repositório |

## Ação da Duda (fora da contagem, fora do repositório)
1. **Restringir os domínios** no painel do EmailJS ao site publicado (sem isso, qualquer um chama a API com os IDs públicos).
2. **Conferir que o template do EmailJS escapa o conteúdo** e usa `reply_to`.
3. **Confirmar as três variáveis** (`VITE_EMAILJS_SERVICE_ID`, `_TEMPLATE_ID`, `_PUBLIC_KEY`) no painel do Netlify.

## Confirm before building
Antes de qualquer tarefa de implementação, o implementador **restata com as próprias palavras** e espera o **OK explícito da Duda**:
1. **FRs (resumo):** currículo com seis seções e "sobre" dentro dele; recolher/expandir que funciona sem JavaScript; impressão limpa em preto sobre branco com endereço após os links; acadêmico com média calculada e "—"; contato com canais e formulário que valida, conta caracteres (10 a 5000), tem armadilha invisível e degrada para `mailto:`; EmailJS carregado só no envio, sem segredo; `/sobre`, `/experiencias` e `/habilidades` com 301 para o currículo; `/agora` e `/setup` lendo a 003 (Should).
2. **Restrições:** branch `rebuild/sdd`, nenhum `git push`, nada na `main`; spec 008, Serviços e `src.zip` intocáveis; só o conteúdo da 003; a 007 só começa com a 003 implementada (T1.1).
3. **Perguntas abertas:** TQ-001 a TQ-006 acima.
4. **Ação da Duda:** os três itens manuais do EmailJS e do Netlify.
Nada de código antes de `tasks:approved`.
