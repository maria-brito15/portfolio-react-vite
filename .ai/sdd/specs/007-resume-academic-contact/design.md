# 007 Resume, academic and contact, Design
**Status:** approved (`design:approved` pela Duda em 2026-11-19; ver `.status`)   **Version:** 1.1 (emendas de 2026-11-19 em "Decisões da Duda", no fim)   **Author:** Claude   **Date:** 2026-11-19
**Base:** `requirements.md` v1.0 (aprovado em 2026-11-19), steering aprovado, specs 001 (primitivas, FR-016), 002 (casca, pré-render, tokens) e 003 (conteúdo).
**Mockups lidos:** `Curriculo.dc.html`, `Academico.dc.html`, `Contato.dc.html`.

## Executive Summary
Reescreve **no lugar** as três páginas curtas (`/curriculo`, `/academico`, `/contato`) lendo o conteúdo da spec 003, e acrescenta o que falta: impressão limpa, recolher/expandir que funciona sem JavaScript, média de semestre calculada, e um formulário que valida, conta caracteres, tem armadilha e degrada para `mailto:`.

Cinco decisões carregam o design:
1. **Envio continua pelo EmailJS**, carregado **só no envio** (import dinâmico), com os três IDs públicos como exceção já listada na 001 (TD-001). Nenhuma chave privada existe no navegador nem no repositório. Alternativas com servidor foram avaliadas e recusadas.
2. **Sem JavaScript o formulário não aparece; aparece o e-mail com `mailto:`** (Q-005). O formulário só fica visível depois da hidratação (TD-002).
3. **Limites do formulário viram uma constante única** (`CONTACT_LIMITS`: nome 2 a 100, mensagem 10 a 5000, e-mail 254) lida pela validação, pelo contador e pelos testes (TD-003, TD-004).
4. **Campo-armadilha** `inert` + `aria-hidden`, fora da tela, com nome que o preenchimento automático do navegador não reconhece (TD-005).
5. **Impressão é a mesma página** com `src/styles/print.css`: preto sobre branco, `@page` A4, `break-inside: avoid` por item, sem PDF separado (TD-006).

Escopo fechado: Serviços fora; sem PDF pronto; sem dado novo (003).

## Requirements Mapping
| ID | Resumo | Onde no design | Arquivos | Prova |
| --- | --- | --- | --- | --- |
| FR-001 | Currículo com as seis seções, lendo 003 | Architecture, Data Model, TD-009 | `src/pages/Resume.tsx` (reescrito no lugar) | V-01, V-02 |
| FR-002 | Recolher/expandir por teclado e leitor de tela; sem JS a lista é inteira | TD-007 | `src/components/ExpandableText.tsx` (novo), `resume.css` | V-03, V-10 |
| FR-003 | Impressão sem menu, rodapé nem controles; preto sobre branco; sem cortar item | TD-006 | `src/styles/print.css` (novo) | V-04, V-11 |
| FR-004 | Acadêmico: formação, linha do tempo, atividades por ano, disciplinas por semestre; média calculada | TD-008, Data Model | `src/pages/Academics.tsx` (reescrito), `src/utils/academics.ts` (ajustado) | V-05 |
| FR-005 | Ausente vira "—"; semestre atual "em andamento" | TD-008, Edge Cases | `Academics.tsx`, `src/utils/academics.ts` | V-05 |
| FR-006 | "Sobre" dentro do currículo; foto só com imagem validada | TD-009 | `Resume.tsx`, `routes.ts` (linha `sobre`) | V-01, V-12 |
| FR-007 | Canais (e-mail, LinkedIn, GitHub) do conteúdo e formulário com nome, e-mail, mensagem | Architecture, Interface Contract | `src/pages/Contact.tsx` (novo), `ContactLinks.tsx`, `ContactForm.tsx` | V-06, V-07 |
| FR-008 | Erro com ícone e texto ligado ao campo; não envia | TD-003, Interface Contract | `validateContact.ts`, `ContactForm.tsx` | V-06, V-07 |
| FR-009 | Sucesso confirma e esvazia; falha mantém texto e oferece nova tentativa ou e-mail | TD-001, Interface Contract (estados) | `ContactForm.tsx`, `emailService.ts` | V-07, V-08 |
| FR-010 | Armadilha oculta de leitor de tela e teclado; descarte sem aviso | TD-005 | `ContactForm.tsx`, `base.css` (`.hp-field`) | V-07, V-08 |
| FR-011 | Contador e recusa acima do limite | TD-004 | `validateContact.ts`, `ContactForm.tsx` | V-06, V-07 |
| FR-012 | Sem segredo no navegador nem no repositório | TD-001, Segurança | `emailService.ts`, `.env.example`, `netlify.toml`, `.env.prova` (novo) | V-09 |
| FR-013 | Três páginas em PT e EN com endereço por idioma | Architecture | `routes.ts` (já tem `/curriculo`, `/academico`, `/contato` e `/en/resume`, `/en/academics`, `/en/contact`) | V-12 |
| FR-014 | Conteúdo no HTML; formulário com `mailto:` sem JS | TD-002 | as três páginas, `contact.css` | V-10 |
| FR-015 *(emenda 2026-11-19, Should)* | Páginas `/agora` e `/setup` reescritas lendo o conteúdo da 003; estado de rascunho preservado | TD-011 | `src/pages/InfoPages.tsx` (reescrito no lugar) | V-16 |
| NFR-001 | LCP, INP, CLS; validação ≤ 200 ms | TD-010, TD-002 (CLS) | `lazyPages.ts`, `ContactForm.tsx` | V-13 |
| NFR-002 | Entrada como texto, limite, só o serviço aprovado, anti-abuso | Segurança, TD-001, TD-005 | `ContactForm.tsx`, `emailService.ts` | V-07, V-09 |
| NFR-003 | WCAG 2.1 AA, erro não só em cor, foco, contraste, impressão com contraste máximo | Interface Contract, TD-006 | páginas e CSS | V-11, V-14 |

Lacunas apontadas: nenhum FR ficou sem casa. Duas dependências externas (D-A e D-B em Riscos) e as perguntas Q-D1 a Q-D6 estão no fim.

## Architecture
```
src/content/ (spec 003)  ──►  perfil/contato · currículo · experiências · competências · acadêmico · projetos
        │ (somente leitura; este design NÃO cria campo de conteúdo)
        ▼
src/pages/Resume.tsx   ── DocPage + ExpandableText ── print.css
src/pages/Academics.tsx ── DataTable ── utils/academics.ts (média, "—")
src/pages/Contact.tsx  ── ContactLinks (canais) + ContactForm
                                 │ validateContact (puro) + CONTACT_LIMITS
                                 └─ emailService.send() ──► import('@emailjs/browser') só no envio ──► api.emailjs.com
```
- **Rotas e idiomas:** `/curriculo`, `/academico`, `/contato` e as três em `/en/...` já existem na tabela de rotas (002). Todas pré-renderizadas (002, TD-008); cada uma tem `<main>` e um `<h1>`. A 007 só entrega os componentes de página e as registra em `lazyPages.ts` (a `Contact` nova entra ali; hoje `contato` passa por `SectionPage`).
- **Alcance:** as três são itens do menu principal do mockup: 1 clique a partir da home (meta: até 2).
- **Texto:** o texto de conteúdo vem da 003; o texto de interface (rótulos, erros, contador, aviso de fallback) vive em `src/i18n/ui.ts` em PT e EN, coberto pelo teste de paridade.
- **Sem estado global novo.** O formulário é estado local do componente.

## Data Model
**Conteúdo (da 003, só leitura).** A 007 precisa destes campos; se o design da 003 não os oferecer, a divergência volta para a 003 (D-A):
| Campo | Uso | Regra |
| --- | --- | --- |
| perfil: nome, cargo/linha de apresentação, local, e-mail, GitHub, LinkedIn, foto opcional | cabeçalho do currículo, canais | links no formato da 001 (FR-010); foto com `alt` PT/EN, largura e altura (001, FR-009); foto ausente = nada renderizado |
| texto "sobre" (PT/EN) | seção 1 do currículo | parágrafos tipados, sem JSX livre |
| projetos em destaque (referência por id), experiências, competências (ano de início ou ausência), formação e idiomas, reconhecimentos | seções do currículo | competência sem ano mostra só o nome (003, FR-005) |
| acadêmico: formações, marcos da linha do tempo, atividades por ano, semestres `{ id, label, program, inProgress?, courses[{ name, hours?, modality?, grade? }] }` | `/academico` | `hours`, `modality`, `grade` opcionais; a ausência permanece ausência |
**E-mail de serviços (`servicesEmail`):** não é lido por nenhuma das três páginas (Q-002).

**Regras que cabem no dado (não só no componente).**
- `CONTACT_LIMITS = { name: {min:2,max:100}, email: {max:254}, message: {min:10,max:5000} }` em um só módulo (`src/utils/validateContact.ts`, editado no lugar). É lido pela validação, pelo contador, pelo texto de erro de interface e pelo teste. Nenhum número de limite é repetido em componente ou em `ui.ts` (o texto de erro usa os números da constante por interpolação, não digitados).
- Média do semestre: **função pura** `semesterAverage(courses)` em `src/utils/academics.ts`: soma das notas lançadas ÷ quantidade de notas lançadas, arredondada a **uma casa, meia para cima**, calculada sobre `soma*10/quantidade` (inteiros) para não depender de ponto flutuante. Sem nota lançada, devolve `null` (nunca 0). Nenhuma média vive em conteúdo (FR-004).
- A validação do conteúdo da 003 (schemas, paridade, `[marcador]`) já cobre os textos; a 007 não adiciona schema.
- O zod fica só em `devDependencies` (001, TD-001): a validação do formulário no navegador é código manual puro, sem zod.

## Interface Contract
### Currículo (`/curriculo`)
Ordem (mockup, e FR-001): cabeçalho (nome, linha de apresentação, local, e-mail, GitHub, LinkedIn, botão "Imprimir / salvar em PDF" e a dica "Use Salvar como PDF na janela de impressão"), 1 Sobre, 2 Projetos em destaque, 3 Experiências, 4 Competências, 5 Formação e idiomas, 6 Reconhecimentos. O botão chama `window.print()`; sem JavaScript fica oculto (a impressão pelo menu do navegador continua válida). Cada seção é um `<section aria-labelledby>`; índice lateral só em tela (`DocPage`, escondido na impressão).

### Acadêmico (`/academico`)
Formação (cartões, estado em texto: "cursado até 2026", "em andamento · previsão 2029"), linha do tempo (lista ordenada), "O que fiz em cada ano" (lista por ano com o tipo em texto), "Disciplinas e notas": uma `<table>` por semestre com `<caption>` (semestre · curso), colunas Disciplina, Horas, Modalidade, Nota, linha de média abaixo. As colunas Horas e Modalidade **sempre aparecem** e mostram "—" quando ausentes (Q-001; o comportamento antigo `courseColumnsVisible`, que escondia a coluna vazia, sai). Semestre `inProgress`: selo "em andamento" (texto, não só cor), sem média; sem disciplinas, a nota de rodapé do mockup ("Nenhuma disciplina concluída ainda neste semestre") vem como texto de interface.

### Contato (`/contato`)
Título, frase de abertura (conteúdo da 003), canais diretos (lista de links: e-mail com `mailto:` simples, LinkedIn e GitHub com `rel="noopener noreferrer"`), nota "Respondo por e-mail", e o formulário.

**Formulário** (`<form noValidate>`; a validação nativa do navegador é desligada para o erro ser o do site, com ícone e texto):
| Campo | Controle | Regras |
| --- | --- | --- |
| Nome | `input type=text`, `autocomplete=name` | obrigatório; 2 a 100 |
| E-mail | `input type=email`, `autocomplete=email` | obrigatório; `^[^\s@]+@[^\s@]+\.[^\s@]+$` (padrão atual, mantido) e até 254 |
| Mensagem | `textarea`, contador | obrigatório; 10 a 5000 (contagem em TD-004) |
| Armadilha | `input`, oculto (TD-005) | deve ficar vazio |
Cada campo tem `<label>` visível, `aria-invalid` e `aria-describedby` apontando para o erro; o erro é `<small>` com ícone SVG (`aria-hidden`) + texto, e o primeiro campo inválido recebe o foco ao enviar. O erro some quando o campo fica válido (comportamento atual, mantido). Um campo com `aria-invalid` tem borda e ícone, não só cor.

**Estados** (região `role="status" aria-live="polite"` presente desde a primeira renderização):
| Estado | Mensagem | Formulário | Saída |
| --- | --- | --- | --- |
| `idle` | nenhuma | editável | |
| `sending` | "Enviando…" | `aria-disabled` e `readOnly` (não `disabled`: o foco não pode ser perdido) | trava síncrona contra clique duplo (já existe) |
| `success` | confirmação | esvaziado | foco permanece no botão |
| `network` | "Sem conexão…" + link `mailto:` | texto mantido | botão "Enviar" é a nova tentativa |
| `rate-limited` (429 ou espera de 15 s) | "Aguarde alguns segundos…" + `mailto:` | texto mantido | |
| `error` | "Não foi possível enviar…" + `mailto:` | texto mantido | |
| `not-configured` | igual a `error` (sem expor o motivo técnico) | texto mantido | aviso de build (R-006) |
O `mailto:` nas mensagens de falha é sem parâmetros (001, L-003: `?subject=` e `?body=` recusados).

**Sem JavaScript (FR-014, Q-005).** Todo o HTML pré-renderizado traz os canais, o formulário e um bloco "fallback" com o e-mail em `mailto:` e uma frase ("O formulário precisa de JavaScript; escreva direto para…"). O CSS mostra o bloco e esconde o formulário até a classe de hidratação (TD-002).

## Segurança
| Ameaça | Controle | Onde |
| --- | --- | --- |
| Segredo no cliente ou repositório (FR-012, 001 FR-016) | Só os três IDs públicos do SDK (exceção nomeada na 001, TD-011 e em `netlify.toml`). Chave privada e senha do e-mail nunca entram. `VITE_EMAILJS_PRIVATE_KEY` e qualquer outro nome com `PRIVATE`/`SECRET`/`TOKEN` continuam reprovados pelo `secretGuard` | `scripts/secretScan.test.ts` (acrescenta o caso do nome de chave privada) |
| Abuso do endpoint público do EmailJS | `blockHeadless: true` e `limitRate` de 15 s por navegador (já existem), armadilha, limites de tamanho, e **lista de domínios permitidos no painel do EmailJS** (ação manual da Duda; o repositório não consegue conferir) | `emailService.ts`; ação manual |
| Spam por bot que preenche tudo | Armadilha (TD-005) | `ContactForm.tsx` |
| Injeção: nome, e-mail e mensagem tratados como texto | React escapa; nada vai a `dangerouslySetInnerHTML`; só `{ from_name, from_email, reply_to, message }` seguem ao SDK; o corpo do e-mail é escapado pelo template do EmailJS (conferência manual do template na Duda, ação manual) | `emailService.ts` |
| Requisição a terceiro além do envio (NFR-002, Non-Goals) | O SDK só é baixado (do próprio domínio) e só fala com `api.emailjs.com` **ao enviar**; a página abre sem requisição de terceiros | TD-001, V-09 |
| Vazamento do texto digitado | Nada é gravado em `localStorage`; o texto fica só no estado; `console.error` do SDK não imprime os campos (registra só o status) | `ContactForm.tsx` |
| CSP | Adiada para a 010 (002, TD-015). Registrar para ela: `connect-src` precisa de `https://api.emailjs.com` | nota |
**Ação manual da Duda (fora do repositório):** (1) restringir os domínios no painel do EmailJS ao site publicado; (2) conferir que o template escapa o conteúdo e usa `reply_to`; (3) confirmar as três variáveis no painel do Netlify. Sem (1), qualquer um pode chamar a API com os IDs públicos.

## Edge Cases
| Caso | Comportamento |
| --- | --- |
| Mensagem só com espaços | tratada como vazia (a validação usa o texto aparado) |
| Mensagem com 5000 caracteres exatos / 5001 | aceita / erro de tamanho e contador em estado de erro |
| Emoji ou letra composta | o contador conta pontos de código, não unidades UTF-16 (TD-004) |
| Colar texto acima do limite | não é cortado em silêncio: o contador vira erro e o envio é recusado |
| Armadilha preenchida | nenhuma chamada ao SDK, nada gravado; a tela mostra a confirmação normal e esvazia (descarte sem aviso) |
| Preenchimento automático do navegador | o nome da armadilha não é um nome que ele reconheça, para não descartar uma pessoa real |
| Dois cliques em Enviar | a trava síncrona impede o segundo envio |
| Falha de rede, 429, erro do serviço, variáveis ausentes | estados da tabela acima; texto mantido |
| JavaScript ativo mas o pacote falhou | o formulário não se mostra (só aparece após hidratar) e o fallback `mailto:` continua visível |
| Semestre `inProgress` sem notas | selo "em andamento", sem média |
| Semestre concluído com disciplina sem nota | nota "—"; a média usa só as notas lançadas; o rodapé diz "N disciplinas" (total de linhas) |
| Disciplina sem horas ou modalidade | "—" |
| Nenhuma média possível (0 notas, não em andamento) | "—" |
| Foto ausente | nenhuma imagem e nenhum espaço reservado |
| Competência sem ano | só o nome |
| Lista longa sem JavaScript | aparece inteira |
| Imprimir em tema escuro | preto sobre branco (os tokens de impressão da 002 + `print.css`) |
| Link externo impresso | o endereço aparece depois do texto (TD-006) |
| Idioma EN | todo texto vem do EN do conteúdo; sem EN a verificação da 001 já falha |

## Technical Decisions

### TD-001: Envio do formulário sem expor segredo
**Decision:** manter o **EmailJS pelo navegador**. O SDK `@emailjs/browser` é carregado por `import()` dinâmico dentro de `sendContactMessage`, no primeiro envio; um pré-carregamento do chunk (do nosso domínio, sem terceiros) pode ocorrer no primeiro foco de um campo para o envio não custar INP. Os três IDs (`VITE_EMAILJS_SERVICE_ID`, `_TEMPLATE_ID`, `_PUBLIC_KEY`) são públicos por desenho do SDK e são a **única exceção** à varredura (001, TD-011; `SECRETS_SCAN_OMIT_KEYS` do `netlify.toml`). A chave privada do EmailJS e a senha do e-mail não existem no navegador nem no repositório. Controles de abuso: `blockHeadless`, `limitRate` de 15 s, armadilha, limites de tamanho, domínios permitidos no painel (ação manual). Classificação de falha (`network`, `rate-limited`, `error`, `not-configured`) mantida em `classifySendError`; o texto digitado nunca é perdido (FR-009).
**Alternatives:**
- **Netlify Function como proxy** (chave privada só no servidor): é o único jeito de ter segredo de verdade, mas contraria o steering (depois da spec 008 o site "não tem nenhuma Function"), cria superfície pública nova a manter (CORS, limite, spam) e adiciona o Netlify Functions ao caminho crítico de um formulário que hoje funciona.
- **Netlify Forms** (formulário nativo, funciona até sem JavaScript, filtro de spam do próprio serviço): remove o EmailJS e a dependência, mas troca o provedor, depende de a detecção do formulário no HTML pré-renderizado funcionar, tem cota própria e muda a caixa de entrada onde a Duda já recebe. Boa alternativa futura, não esta spec (menos escopo).
- **reCAPTCHA/hCaptcha do EmailJS:** terceiro carregado na página e rastreamento, contra "sem rastreadores" e os Non-Goals.
- **Só `mailto:`** (sem formulário): contraria FR-007 a FR-011.
**Rationale:** FR-012 diz que há exceção listada na 001; é a mudança menor que cumpre "sem expor segredo" (os IDs não são segredo) sem mudar provedor nem arquitetura. O risco que resta (alguém chamar a API com os IDs públicos) é limitado pelo domínio permitido e pelo limite do plano do EmailJS (a conferir no painel), e fica dito em R-001.

### TD-002: Formulário só depois de hidratar; fallback `mailto:` sem JavaScript
**Decision:** o HTML pré-renderizado traz formulário e bloco de fallback. O componente marca o contêiner com `data-ready` em `useEffect` (só no cliente, depois da hidratação). CSS: sem `[data-ready]` o formulário fica oculto (`display: none`) e o fallback visível; com `[data-ready]` o contrário. Os dois ocupam o mesmo espaço reservado (`min-height` do formulário) para não deslocar o layout (CLS). Assim não há divergência de hidratação (o servidor sempre rende os dois) e um formulário sem manipulador nunca fica clicável.
**Alternatives:**
- **`<noscript>` com o `mailto:`:** o React 19 não hidrata `<noscript>` de forma previsível e o SPIKE-001 da 002 já descartou `<noscript>` como mecanismo de conteúdo.
- **Classe `js` do `<html>` (002, TD-010) para mostrar o formulário:** `js` é posta pelo script de boot, antes de o pacote carregar; com o pacote falho o formulário apareceria morto (envio nativo por GET). Rejeitado.
- **Formulário sempre visível com `action="mailto:"`:** abre o app de e-mail com texto cru e sem validação.
**Rationale:** Q-005 (sem JS, e-mail com `mailto:`) e princípio 2.

### TD-003: Validação como função pura com constante de limites
**Decision:** `validateContact(fields)` continua função pura que devolve `{ campo: código }`, com os códigos traduzidos em `ui.ts`; ganha `CONTACT_LIMITS` e `countChars`. Aplica-se em `onSubmit` (síncrona, ≪ 200 ms) e, depois do primeiro envio, a cada digitação do campo já em erro. A armadilha é checada **antes** da validação. `noValidate` no `<form>`.
**Alternatives:** schema zod no navegador (001, TD-001: zod nunca vai ao cliente, aumentaria o pacote); atributos nativos `required`/`minlength` (erro do navegador, sem ícone nem texto do site, e não associa `aria-describedby`); validar a cada tecla desde o início (ruído para leitor de tela).
**Rationale:** regra no dado, testável sozinha, igual para o contador e a mensagem de erro.

### TD-004: Contador e limite de 5000
**Decision:** limite da mensagem = **5000 caracteres** (o valor do formulário atual e do mockup: "104 / 5000"); mínimo 10 (como hoje). Contagem por **pontos de código do texto aparado** (`[...texto.trim()].length`), a mesma função para mostrar e para validar. O `textarea` **não** usa `maxLength` (cortaria texto colado em silêncio, e `maxLength` conta unidades UTF-16): o contador aparece como "N / 5000"; passando do limite ele ganha ícone e texto de erro ("Passou do limite em N caracteres"), liga-se ao campo por `aria-describedby` e o envio é recusado. O contador **não** é `aria-live` por tecla; o erro de tamanho é anunciado pelo mesmo mecanismo dos outros erros (ao enviar e ao cruzar o limite).
**Alternatives:** limite de 2000 ou 10000 (sem dado que justifique; 5000 é o comportamento atual e mesmo em UTF-8 de 4 bytes fica em 20 KB, abaixo do limite de tamanho do EmailJS por requisição, a conferir no painel); `maxLength` nativo (corta colado); contar unidades UTF-16 (emoji conta 2).
**Rationale:** FR-011 pede recusa acima do limite, definido no design.

### TD-005: Campo-armadilha
**Decision:** contêiner `<div class="hp-field" aria-hidden="true" inert>` com um `<input type="text" tabindex="-1" autocomplete="off">` e rótulo neutro; posicionado fora da tela por CSS (não `display: none`, que bots simples ignoram) e **sem** ficar acessível: `inert` retira o foco e a árvore de acessibilidade, `aria-hidden` redunda para leitores antigos. O `name` vem de uma constante e **não** pode ser um nome que o preenchimento automático reconheça (`website`, `url`, `company`, `phone`, `email`…), pois o `website` atual pode ser preenchido por gerenciador de senhas e descartar uma pessoa real. Se preenchido: sem chamada ao SDK, sem registro, o formulário esvazia e mostra a confirmação normal (nada avisa o remetente, FR-010).
**Alternatives:** armadilha por tempo mínimo (envio em < 3 s descartado): falso positivo com preenchimento automático; armadilha por token em JS (um bot com JS passaria); CAPTCHA (terceiro, rejeitado em TD-001).
**Rationale:** FR-010, NFR-003 (não pode ser lida nem focada) e o risco de descartar uma pessoa real.

### TD-006: Impressão do currículo
**Decision:** `src/styles/print.css` (novo) substitui os blocos `@media print` espalhados em `resume.css`, `ui.css` e `sections.css` que tratam o currículo. Regras:
- `@page { size: A4; margin: 16mm }`; corpo 10,5 a 11 pt, `line-height` 1,4.
- Ocultos: faixa decorativa (`.deco-stripe`), `.skip-link`, `.lang-offer`, cabeçalho (`.hdr`), rodapé de créditos (`.credits`), índice (`.doc-toc`), botão e dica de imprimir, botões "Mostrar mais", paleta e qualquer controle. Os seletores são **os atuais da casca da 002** (os do `resume.css` antigo, como `.site-top`, estão obsoletos); um teste confere que cada seletor oculto existe no código da casca.
- Preto sobre branco: `html, body { background: #fff; color: #000 }` e `a { color: #000; text-decoration: underline }`, sem fundos de cartão, `chip` sem fundo (borda fina), cores de capa e filete removidos. Os tokens de impressão da 002 (`tokens.css`, tema claro forçado) ficam como estão; `print.css` apenas sobrepõe o que é preciso (o fundo `--bg` creme sai).
- Quebras: `break-inside: avoid` em cada experiência, projeto em destaque, reconhecimento e bloco de formação; `break-after: avoid` em `h2`/`h3`; `orphans: 3; widows: 3`.
- Recolhidos abrem: `.xp-desc.clamped` perde o recorte e `.sk-all`/botões saem (TD-007), então a página impressa traz a lista inteira.
- Endereços: depois de cada link externo do cabeçalho e dos projetos, `a[href^="https"]::after { content: " (" attr(href) ")" }` (em papel o link não clica). O texto vem do próprio `href` (mesmo dado); nada novo é inventado.
- `print.css` é importado pela página do currículo (CSS do chunk da rota, fora do primeiro carregamento).
**Alternatives:** PDF gerado no servidor ou arquivo pronto (Non-Goal, Q-004); manter os `@media print` espalhados (já deixaram seletores obsoletos); biblioteca de PDF no cliente (peso e duas versões do currículo).
**Rationale:** US-002/FR-003; o currículo continua uma só fonte.

### TD-007: Recolher e expandir
**Decision:** componente `ExpandableText` (novo, substitui o `ExperienceCard` embutido). O servidor renderiza a descrição longa (acima de um limite fixo definido como constante) **com** a classe `clamped` e o botão no HTML; o CSS só aplica o recorte e mostra o botão sob `.js` (classe posta pelo boot da 002 antes da primeira pintura). Sem JavaScript: texto inteiro, sem botão. Com JavaScript: o botão tem `aria-expanded`, `aria-controls` e rótulo "Mostrar mais/menos" (PT/EN) e é um `<button>` nativo (Enter/Espaço). O texto completo continua na árvore de acessibilidade (o recorte é visual), então o botão anuncia o estado sem esconder conteúdo.
**Alternatives:** `<details>`/`<summary>` (anuncia sozinho e funciona sem JavaScript, mas o conteúdo fechado não é impresso de forma confiável entre navegadores e o recorte parcial de três linhas não existe); estado só em React (sem JS a lista fica recolhida e sem botão: viola FR-002); abrir tudo antes de imprimir por `beforeprint` (depende de JS; a CSS de TD-006 já resolve).
**Rationale:** FR-002 e o princípio 2, sem divergência de hidratação e sem CLS.

### TD-008: Acadêmico, média e "—"
**Decision:** a média é calculada por `semesterAverage` (Data Model) e mostrada como "média 82,0 · 7 disciplinas" (vírgula em PT, ponto em EN, uma casa). Só aparece em semestre com nota lançada e fora de `inProgress`. A coluna de notas, de horas e de modalidade aparecem sempre; ausente = "—" (texto, com `aria` normal, não ícone). O texto do mockup "nota de 0 a 100" **não** era copiado até a Q-D3; **superado em 2026-11-19**: a Duda confirmou a escala de 0 a 100 e que só há disciplinas aprovadas (ver "Decisões da Duda"). Os totais de carga (`done/total` do código antigo) saem, pois `hours` está ausente em todas as disciplinas; voltam quando a Duda informar. `yearProgress` (barra de progresso por calendário, estimativa) sai: não está no mockup nem nos FRs.
**Alternatives:** esconder a coluna vazia (comportamento antigo, contra a Q-001); mostrar a média como dado em conteúdo (digitada, viola FR-004); média ponderada por horas (as horas não existem).
**Rationale:** FR-004, FR-005, D-001, Q-001.

### TD-009: "Sobre" dentro do currículo e fim de `/sobre`
**Decision:** o "sobre" é a primeira seção do currículo (`id="sobre"`), com foto só se o perfil tiver imagem validada. A rota `sobre` sai da tabela de rotas (FR-006: "não como rota separada"). Os endereços antigos `/sobre` e `/en/about` não podem virar 404 para quem tem o link publicado: `netlify.toml` ganha dois redirecionamentos 301 para `/curriculo#sobre` e `/en/resume#sobre`, **antes** da regra de 404 (a ordem importa), e o mapa `legacyHashes` (`/#sobre`) passa a apontar para `/curriculo`. Isso toca a tabela da 002 (`routes.ts`) e o `netlify.toml`: a 007 pede, não presume (Q-D1).
**Alternatives:** manter `/sobre` como rota que só repete o texto (duas páginas com o mesmo conteúdo); deixar a rota cair no 404 (quebra links do LinkedIn/README); redirecionar só no cliente (não funciona sem JavaScript nem para buscadores).
**Rationale:** FR-006 e a regra de não quebrar endereço publicado.

### TD-010: Carga e orçamento
**Decision:** cada página é um chunk lazy (já é o padrão de `lazyPages.ts`); o SDK do EmailJS fica em chunk próprio (TD-001), então `/contato` não paga o SDK e a home nunca o carrega. Nenhuma imagem no currículo além da foto opcional (com largura e altura, `loading="lazy"` se abaixo da dobra; não é LCP).
**Alternatives:** SDK no chunk da página (+ peso no `/contato` sem necessidade); formulário no pacote da home (viola o orçamento de 100 KB da 002).
**Rationale:** NFR-001.

### TD-011 *(emenda 2026-11-19)*: Páginas "agora" e "setup"
**Decision:** `InfoPages.tsx` é reescrito no lugar e passa a ler `src/content/now.content.ts` e `uses.content.ts` (003, FR-007), com a mesma tela de hoje (título e descrição da tabela de rotas, lista de itens, linha "atualizado em"). Nenhum texto novo: se a 003 deixar `uses` vazio, a página mostra o aviso de rascunho já existente. O estado de rascunho das rotas **não muda** (003, L-003). `InfoBodies`, `data/now.ts` e `data/uses.ts` ficam para o terminal e `routeStatus.ts` até a 009; um teste descartável confere que o conteúdo novo e o antigo dizem o mesmo, para a divergência não passar em silêncio.
**Alternatives:** (a) a 003 troca a fonte dos dados (a Duda escolheu a 007 na Q-D4 da 003); (c) deixar como está até a 010 (mantém os dois leitores sem dono).
**Rationale:** decisão D4 da 003; FR-015 (Should), porque são páginas pequenas e sem dado novo.

## Arquivos que esta spec remove ou substitui (Q-001 do PLAN)
Regra: a 007 apaga o que **só** ela usava; o que ainda tem importador fora dela fica com a spec dona e é nomeado aqui (conferido com `grep` hoje).
| Arquivo | Destino | Motivo |
| --- | --- | --- |
| `src/pages/Resume.tsx`, `src/pages/Academics.tsx` | **reescritos no lugar** | mesmos caminhos, nova leitura (003) |
| `src/pages/DocPages.test.tsx` (partes de currículo e acadêmico), testes de `Resume`/`Academics` antigos | **reescritos** | o código que testavam muda |
| `src/sections/portfolio/Contact.tsx`, `src/sections/portfolio/About.tsx` | **removidos** | substituídos por `src/pages/Contact.tsx` e pela seção "sobre" do currículo; só `SectionPage` os importa |
| `src/pages/SectionPage.tsx` (entradas `sobre` e `contato`) | **ajustado** | as outras entradas (`habilidades`, `projetos`, `experiencias`) são das specs 004/005 |
| `src/components/ContactForm.tsx`, `ContactForm.test.tsx`, `ContactLinks.tsx` | **reescritos no lugar** | `ContactLinks` perde os emojis e deixa de importar `profile`; `Services.tsx` também o importa e **fica** (Serviços fora, Q-003) |
| `src/utils/validateContact.ts` (+ teste), `src/services/emailService.ts` (+ teste) | **ajustados no lugar** | constante de limites, import dinâmico |
| `src/utils/academics.ts`: `courseColumnsVisible`, `yearProgress` | **removidos** | TD-008 |
| `src/utils/academics.ts`: `summarizeSemester`, `activitiesByYear`, `academicTimeline.ts` | **ficam** | o terminal (`sectionViews`, `views`) ainda os usa; saem com a spec 009 |
| `src/utils/resume.ts` | **removido se** só `Resume.tsx` o usar; hoje o terminal e `sections.ts` também o importam, então **fica até a 009** | evitar quebra |
| `src/data/resume.ts`, `academics.ts`, `experiences.ts`, `profile.ts`, `skillTimeline.ts` | **ficam** até a 003 migrar e a 009 tirar os importadores (terminal, paleta, `seoHead`, `GithubStats`) | a 003 removeu "só quando a página que usa for reescrita" (003, Non-Goals); a última spec a deixar de importar apaga |
| `src/styles/resume.css` (regras do currículo e `@media print` antigos) | **reduzido** e as regras de impressão migram para `print.css` | TD-006 |
| `src/i18n/ui.ts` chaves `form.notConfigured` e textos do formulário antigo | **ajustados** | novos estados e contador |
| Entrada `sobre` em `src/data/routes.ts`, `sections.ts`, `legacyHashes` | **removida/ajustada** | TD-009 (Q-D1) |
| `src/pages/Services.tsx`, `services.tsx`, `services.css`, rota `servicos` | **não tocados** | Serviços fora; pendência da Duda (Q-003) |
| `src/pages/InfoPages.tsx` | **reescrito no lugar** *(emenda 2026-11-19, TD-011)*: lê `src/content/now.content.ts` e `uses.content.ts` | decisão D4 da 003 |
| `src/components/InfoBodies.tsx`, `src/data/now.ts`, `src/data/uses.ts` | **ficam** até a 009 *(emenda)* | o terminal (`sectionViews`) e `routeStatus.ts` ainda os leem; a 009 apaga |
**Arquivos novos:** `src/pages/Contact.tsx`, `src/components/ExpandableText.tsx`, `src/styles/print.css`, `src/styles/contact.css`, `.env.prova` (IDs de teste, TD em Verification), testes e e2e listados abaixo.

## Verification Strategy
O vitest roda com `css: false`: o que depende de CSS (ocultar, imprimir, recorte) é provado no e2e sobre o build pré-renderizado, como a 002 fez.
| ID | FR/NFR | Prova | Comando (exato) | Esperado |
| --- | --- | --- | --- | --- |
| V-01 | FR-001, FR-006 | seis seções com o texto da 003; foto só com imagem; "sobre" no currículo | `npx vitest run src/pages/Resume.test.tsx` | exit 0; as seis seções em PT e EN; sem foto, nenhum `<img>` |
| V-02 | FR-001 | competência sem ano mostra só o nome; equivale ao conteúdo | `npx vitest run src/pages/Resume.test.tsx -t "competência"` | exit 0 |
| V-03 | FR-002 | botão tem `aria-expanded`/`aria-controls`, alterna por teclado e anuncia o estado | `npx vitest run src/components/ExpandableText.test.tsx` | exit 0 |
| V-04 | FR-003 | `print.css` existe, tem `@page`, oculta os seletores da casca (todos existentes no código da casca), `break-inside: avoid` nos itens | `npx vitest run src/styles/print.test.ts` | exit 0 |
| V-05 | FR-004, FR-005 | média calculada igual ao mockup (82,0; 85,4; 71,8); "—"; semestre atual "em andamento" sem média; colunas sempre presentes | `npx vitest run src/utils/academics.test.ts src/pages/Academics.test.tsx` | exit 0; nenhuma média digitada no conteúdo (teste de varredura) |
| V-06 | FR-007, FR-008, FR-011 | tabela entrada → resultado da requirements: vazio, `a@`, 4999/5000/5001 caracteres, emoji, só espaços | `npx vitest run src/utils/validateContact.test.ts` | exit 0; mensagem 5001 = erro de tamanho; limites vêm de `CONTACT_LIMITS` |
| V-07 | FR-007 a FR-011, NFR-002, NFR-003 | formulário: erro com ícone e texto e `aria-describedby`; foco no 1º inválido; sucesso esvazia; falha mantém texto; armadilha não chama o SDK e mostra confirmação; contador; sem `disabled` durante o envio | `npx vitest run src/components/ContactForm.test.tsx src/pages/Contact.test.tsx` | exit 0; o SDK é mockado (nenhum e-mail real) |
| V-08 | FR-009, FR-010 | ponta a ponta no build pré-renderizado: sucesso, falha de rede, 429, armadilha (rede interceptada: `api.emailjs.com` respondida por `page.route`, nenhum envio real) | `npm run build:prova` e `npx playwright test --project=shell e2e/contact.e2e.ts` | exit 0; armadilha = 0 requisições ao EmailJS |
| V-09 | FR-012, NFR-002 | varredura: IDs públicos passam; nome de chave privada falha; nenhum segredo no bundle; o SDK só no chunk lazy; a página abre sem requisição a terceiro | `npx vitest run scripts/secretScan.test.ts scripts/secretGuard.test.ts` e `node scripts/checkDist.mjs dist` | exit 0 e exit 0; e2e confirma 0 requisições externas antes do envio |
| V-10 | FR-002, FR-014 | sem JavaScript (`javaScriptEnabled: false`): currículo, acadêmico e canais no HTML; lista longa inteira; formulário oculto e `mailto:` visível | `npx playwright test --project=shell e2e/nojs.e2e.ts` e `npx vitest run scripts/prerender.test.ts` | exit 0; as três rotas × 2 idiomas têm `<main>`, um `<h1>`, o `mailto:` |
| V-11 | FR-003, NFR-003 | com `emulateMedia({ media: 'print' })`: cabeçalho, rodapé, botões e índice ocultos; fundo branco, texto `rgb(0,0,0)`; `break-inside: avoid`; PDF gerado por `page.pdf()` com ≥ 1 página, **aberto e lido** (a Success Metric exige) | `npx playwright test --project=shell e2e/resume-print.e2e.ts` | exit 0; PDF salvo em `e2e/shots/` e conferido item a item |
| V-12 | FR-013, FR-006 | endereços por idioma e `hreflang`; `/sobre` e `/en/about` redirecionam 301 | `npx vitest run src/data/routes.test.ts scripts/headers.test.ts` e `node scripts/checkDist.mjs dist` | exit 0 |
| V-13 | NFR-001 | LCP/INP/CLS das três rotas em celular médio; validação ≤ 200 ms | `npm run prova` (estendido às três rotas) | LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 |
| V-14 | NFR-003 | axe sem violação nas três rotas × dois temas × dois idiomas; Lighthouse ≥ 95 | `npm run prova` (axe e Lighthouse da 002 estendidos) | 0 violações; ≥ 95 |
| V-15 | todos | verificação completa | `npm run verify` | exit 0 |
| V-16 | FR-015 *(emenda)* | `/agora` mostra os itens e a data de `now.content.ts`; `/setup` vazio mostra o aviso "em construção"; as duas rotas seguem rascunho; o conteúdo novo é igual ao de `data/now.ts` e `data/uses.ts` (teste descartável até a 009) | `npx vitest run src/pages/InfoPages.test.tsx src/data/routes.test.ts` | exit 0; nenhum texto novo inventado |
**Build de prova e o formulário:** o e2e precisa dos três IDs para o formulário não cair em `not-configured`. `.env.prova` (commitado, **só** com valores falsos do formato `prova-…`, carregados apenas no modo `prova` e sobrepondo `.env`) os fornece; o build publicado nunca o lê, e um teste confere que `dist/` não contém os valores de prova.
**Paridade:** o teste de paridade da 001 cobre os novos textos de interface (contador, estados, fallback, rótulos de recolher).
Todo fechamento de tarefa leva o bloco Claim, Command, Exit code, Summary, Verdict.

## Riscos
| ID | Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R-001 | Qualquer pessoa usa os IDs públicos para disparar e-mails | Média | Médio | domínios permitidos no painel (ação manual), limite do plano, `blockHeadless`, armadilha; se houver abuso, migrar para Function (alternativa registrada em TD-001) |
| R-002 | Armadilha descarta pessoa real por preenchimento automático | Baixa | Médio | nome neutro, `inert`, teste com preenchimento simulado |
| R-003 | Impressão quebra o layout ou corta item | Média | Médio | V-11 com PDF aberto e lido; `break-inside: avoid` |
| R-004 | Formulário alterna de fallback para formulário e desloca o layout (CLS) | Média | Baixo | espaço reservado; V-13 mede o CLS |
| R-005 | Seletores ocultos na impressão ficam obsoletos quando a casca muda | Média | Médio | teste que exige que cada seletor exista no código da casca (V-04) |
| R-006 | Variáveis EmailJS ausentes em produção deixam o formulário sem envio, sem que ninguém perceba | Média | Alto | aviso no build quando faltam (não falha: o `verify` local não tem `.env`); confirmar as variáveis no painel do Netlify é ação manual; o estado `not-configured` mostra o `mailto:` |
| R-007 | O terminal e a paleta importam dados antigos, então esta spec não apaga `data/resume`, `academics` etc. | Alta | Baixo | tabela de remoção acima nomeia o dono; a 009 fecha |
| R-008 | Remover `/sobre` quebra links publicados | Média | Médio | 301 (TD-009) |
| D-A | A 003 ainda não tem `design.md`; os nomes e campos de conteúdo acima podem diferir | Alta | Médio | ao aprovar a 003, conferir a lista do Data Model; divergência vai para esta spec antes do código |
| D-B | A 002 está em execução (`tasks:approved`); `print.css`, `routes.ts`, `netlify.toml` e `lazyPages.ts` encostam em arquivos dela | Média | Baixo | a 007 só começa depois da 003; mudar `routes.ts`/`netlify.toml` exige a resposta da Q-D1 |

## Perguntas para a Duda
- *(Todas respondidas em 2026-11-19; ver "Decisões da Duda".)*
- **Q-D1 (TD-009):** aprova remover a rota `/sobre` com 301 para `/curriculo#sobre` (PT e EN)? E o que fazer com `/experiencias` e `/habilidades`, que também viraram seções do currículo: redirecionar do mesmo jeito ou ficam para as specs 004/005? Sugestão: redirecionar só `/sobre` aqui.
- **Q-D2 (TD-001):** mantém o EmailJS e aceita as duas ações manuais (restringir domínios no painel e conferir o template)? Sugestão: sim; Netlify Forms fica como alternativa para depois.
- **Q-D3 (TD-008):** o mockup diz "só disciplinas aprovadas · nota de 0 a 100". A 003 (Q-002) pede "sem inventar escala". A escala é de 0 a 100 mesmo e as disciplinas listadas são só as aprovadas? Sugestão: mostrar só "Disciplinas e notas" sem escala até você confirmar.
- **Q-D4 (TD-006):** imprimir o endereço depois de cada link externo (GitHub, LinkedIn, repositórios) é aceitável? Sugestão: sim, para o papel ser útil.
- **Q-D5 (TD-004):** mantém o mínimo de 10 caracteres na mensagem e o máximo de 5000 (valores atuais)? Sugestão: manter.
- **Q-D6 (TD-005):** o que mostrar quando a armadilha é preenchida: a confirmação normal (como hoje) ou nada? Sugestão: a confirmação normal, pois "sem aviso" é o que o FR-010 pede.

## Decisões da Duda (2026-11-19)
A Duda aceitou as recomendações do design nas perguntas abaixo. Cada linha vale como resposta registrada; o texto das TD acima segue como escrito, e onde difere esta seção prevalece.
| Pergunta | Decisão | Efeito |
| --- | --- | --- |
| Q-D1 (TD-009) | `/sobre`, `/experiencias` e `/habilidades` (e `/en/about`, `/en/experience`, `/en/skills`) saem da tabela de rotas e redirecionam com **301** para a seção certa de `/curriculo` (`/en/resume` em inglês): `#sobre`, `#experiencias`, `#competencias`. `legacyHashes` aponta `/#sobre`, `/#experiencias`, `/#habilidades` para `/curriculo`. Isto toca `src/data/routes.ts` e `netlify.toml` da 002 **sem mudar o texto da spec 002**. As regras 301 ficam antes da regra de 404. `/projetos` não muda (spec 005) | amplia a TD-009; ids de seção fixos no currículo (T2.2) |
| Q-D2 (TD-001) | EmailJS mantido, SDK carregado sob demanda. **Ações manuais da Duda (2):** (1) restringir os domínios no painel do EmailJS ao site publicado; (2) conferir que o template escapa o conteúdo e usa `reply_to`. A confirmação das três variáveis no painel do Netlify continua listada na seção Segurança | sem mudança de design; registrar as ações na T6.1 |
| Q-D3 (TD-008) | Escala **0 a 100**, como está no conteúdo; **só disciplinas aprovadas**. A frase de escala vem do conteúdo da 003 se existir ali; se não, de texto de interface em PT e EN (`ui.ts`), citando esta decisão. Nota fora de 0 a 100 ou não inteira reprova um teste de varredura | substitui a parte da TD-008 que não copiava a escala |
| Q-D4 (TD-006) | Imprimir o endereço depois de cada link externo | confirma a TD-006 |
| Q-D5 (TD-004) | Mínimo 10, máximo 5000 | confirma `CONTACT_LIMITS` |
| Q-D6 (TD-005) | Armadilha preenchida mostra a confirmação normal e esvazia | confirma a TD-005 |
| D4 da 003 | A 007 reescreve as páginas `/agora` e `/setup` (FR-015, Should, emenda do requirements) | TD-011 |

## Confirm before building
Aprovar este design (`design:approved`) só pela Duda, depois de responder Q-D1 a Q-D6 e de a 003 ter design aprovado (D-A). Nenhuma tarefa nem código antes disso.
