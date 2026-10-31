# Análise de lacunas — Portfólio Duda Brito (TP1)

Relaciona cada requisito de [`requirements.md`](requirements.md) ao código existente. Base: leitura integral de `src/`, `public/`, `docs/`, configurações e README, mais execução de `npm ci`, `npm test`, `npm run lint` e `npm run build` em uma cópia do projeto. Nenhum arquivo de implementação foi alterado.

## 0. Atualização após a implementação (2026-10-31)

Resolvidos no código e cobertos por teste (46/46, lint e build ok): **RF-01 a RF-05** (ordem Planoriza → EcoShop → 2026, datas `MM/AAAA`/`AAAA`, sem "atual"/"a confirmar"), **RF-06** no que depende do código (sem galeria nada é exibido; imagem ausente é descartada), **RF-07** (Planoriza e WhatsApp Dispatcher sem link nem promessa), **RF-08** (desafio técnico de estágio, PT/EN, com escopo separado), **RF-10** (WebTech), **RF-15** (UI "não configurado" testada). As tabelas abaixo descrevem o estado **antes** da implementação.

Continuam **abertos por dependência externa**: imagens de ShortURL/File Name Standardizer (RF-06 parcial), meses de 2026 (a ordem entre esses três é indeterminada e sinalizada), EmailJS real (RF-13/14), hospedagem (RE-03/RF-18), Figma (RE-04), GitHub (RE-02), Lighthouse/axe (RNF-02–04), `ADICIONAR_*` no README (RE-01), Q-01 a Q-03, Q-07 e Q-08.

## 1. Como ler

**Estado:** ✅ atendido e comprovado · 🟡 presente no código, sem comprovação em execução real · 🔶 parcial · ❌ não atendido · ⏳ depende de ação externa.

**Evidência:** **T** teste automatizado aprovado (jsdom, não é navegador real) · **B** lint/build executado · **L** leitura direta do código · **S** captura de tela da autora em `docs/screenshots/` · **A** afirmação do README, não reproduzida · **X** não verificável sem acesso externo.

**Resultado das verificações executadas:** 5 arquivos de teste, **25/25 testes aprovados**; ESLint sem apontamentos; build de produção concluído (88 módulos; JS 400 KB, 122 KB gzip; CSS 33 KB). Nenhuma verificação em navegador real foi feita.

## 2. Requisito × código

### Projetos e timeline

| ID | Estado | Código existente | Problemas | Evidência |
| --- | --- | --- | --- | --- |
| RF-01 | ✅ | `data/projects.jsx` (5 itens), `sections/portfolio/Projects.jsx`, `ProjectCard.jsx` | — | T (`App.test.jsx`: lista de projetos), L |
| RF-02 | ❌ | `sortProjectsChronologically` ordena só por `start` numérico (ano); `start: null` vai ao fim | Planoriza (01/2025) aparece depois de WhatsApp Dispatcher. Ordem renderizada hoje: EcoShop, WhatsApp Dispatcher, Planoriza, ShortURL, File Name Standardizer. O modelo não tem mês. O teste de `App.test.jsx` fixa a ordem errada (`['EcoShop','WhatsApp Dispatcher','Planoriza']`). O comparador `Infinity - Infinity` gera `NaN` e só funciona por tolerância do `sort` | T, L |
| RF-03 | ❌ | `ui.js → timeline.periodPending`; `ProjectCard` renderiza `.date-pending`; versão v2 do EcoShop tem `current: true` e tag "v2 · 2026 · atual" | Quatro dos cinco projetos mostram "Período a confirmar" (status, não data). EcoShop mostra "2025 – 2026" e a marcação "atual" em verde | S, L |
| RF-04 | 🔶 | Campos `start` e `period` em `projects.jsx` | Nenhuma data inventada (ponto positivo, L). Mas Planoriza ficou `null` apesar de 01/2025 já confirmado, e EcoShop tem só o ano. Não há campo de mês. O README (Pendências) está desatualizado | L, A |
| RF-05 | 🔶 | `versions[]` em `projects.jsx`; `Evolution` em `ProjectCard.jsx` | Tags "v1 · 2025" e "v2 · 2026 · atual" sem mês e com status | S, L |
| RF-06 | 🔶 | `ProjectMedia.jsx` → `ImageGallery` → `Lightbox`; EcoShop com 3 JPEG (1280×631, 27–48 KB); alt traduzido via `timeline.screenshot` | Projetos sem imagem exibem "Imagem ou GIF do projeto ainda não disponível" (4 de 5). Nenhum teste cobre galeria de projeto: o lightbox só é testado na galeria BECAS de `/servicos`. ShortURL e File Name Standardizer dependem das capturas que serão enviadas | T (só BECAS), L, X |
| RF-07 | 🔶 | `RepoLink` em `ProjectCard.jsx`; `repo` em `projects.jsx` | Planoriza exibe "Repositório a divulgar", que sugere publicação futura não confirmada. WhatsApp Dispatcher exibe "Repositório privado" (depende de Q-02). Os 6 `target="_blank"` do código têm `rel="noopener noreferrer"` (✅). Não foi possível confirmar que os três repositórios públicos estão acessíveis | L, X |
| RF-08 | 🔶 | Card `featured` com `caseStudy`; páginas `case-study/WhatsAppDispatcherPt/En.jsx` (~63–68 KB cada); `CaseStudy.jsx` | A página afirma que a implementação é parcial e privada e trata "o que mudaria em produção" como não implementado (adequado). Falta qualquer menção ao **desafio técnico de estágio**: busca por "estágio/internship" não encontra esse contexto no card nem na página. O card diz "o código é privado" sem enquadrar a origem | L |
| RF-09 | 🟡 | `tech[]` em `projects.jsx` | Tecnologias do WhatsApp Dispatcher vêm do estudo de caso (consistente). A origem de "HTML5, CSS3, JavaScript" para Planoriza não está documentada; o README pede confirmação | L, A |

### Experiências

| ID | Estado | Código existente | Problemas | Evidência |
| --- | --- | --- | --- | --- |
| RF-10 | ❌ | `experiences.js` → item `webtech` | Período "Atual/Current" sem data de início. Descrição genérica (extensão com empresas parceiras), sem workshop, laboratório de SDD ou aplicação de monitorias. Itens já bem tratados: nenhum cargo inventado, "Projeto de Extensão" como tipo de atividade | L |
| RF-11 | ✅ | Demais itens e grupos de `experiences.js`; `Experience.jsx` | — | T (uma única seção "Experiências"), L |

### Contato

| ID | Estado | Código existente | Problemas | Evidência |
| --- | --- | --- | --- | --- |
| RF-12 | ✅ | `ContactForm.jsx`, `utils/validateContact.js` | — | T (4 + 5 testes), L |
| RF-13 | 🔶 ⏳ | `services/emailService.js` (SDK, 3 variáveis `VITE_*`, `EmailNotConfiguredError`), `.env.example` | Conta, serviço e template EmailJS **não existem**; nenhum envio real foi executado (o README admite). Os parâmetros precisam coincidir com o template a criar. Os testes simulam o SDK. O estado "não configurado" é testado só no serviço; a UI desse estado não tem teste (o teste do formulário substitui o serviço por um mock). Variáveis `VITE_*` são fixadas no build: precisam estar na hospedagem antes do deploy | T (mock), L, A |
| RF-14 | 🟡 ⏳ | Uma única chamada `emailjs.send` por submissão; `reply_to` serve para a autora responder | Auto-Reply é configuração do template na conta EmailJS, que não existe. O passo-a-passo do README não manda desativá-lo. O texto de sucesso ("respondo assim que puder") promete resposta humana, não automática; aceitável, mas vale revisar | L, X |
| RF-15 | ✅ | `ContactForm.jsx` (`status`, `aria-busy`, `role="status"`) | Estado `not-configured` sem teste de UI | T |

### Plataforma e preservação

| ID | Estado | Código existente | Problemas | Evidência |
| --- | --- | --- | --- | --- |
| RF-16 | ✅ | `i18n/`, `data/*` com `pt`/`en`; `projects.test.js` exige descrição nos dois idiomas | Não há teste de paridade para `ui.js` e `experiences.js`; toda mudança nova precisa ser traduzida à mão | T, L |
| RF-17 | ✅ 🟡 | `hooks/useTheme.js`; script inline em `index.html` | Alternância e persistência testadas. A ausência de flash na carga depende do script inline, só lida | T, L |
| RF-18 | 🟡 ⏳ | `router.jsx`, `App.jsx`, `NotFound.jsx`, `public/_redirects`, `vercel.json` | Rotas, 404 e ida/volta do estudo de caso testados. Rolagem por âncora não é testada (jsdom simula `scrollIntoView`). Fallback de SPA só existe como arquivo de configuração; sem site publicado não há verificação | T, L, X |
| RF-19 | 🟡 | `styles/original.css` (preservado), `portfolio.css`, `case-study.css`; 7 capturas | Não há linha de base visual automatizada. Mobile só tem captura de Projetos | S, L |

### Não funcionais

| ID | Estado | Código existente | Problemas | Evidência |
| --- | --- | --- | --- | --- |
| RNF-01 | ✅ | Scripts `lint`, `test`, `build` | Cobertura limitada a jsdom; sem E2E | B, T |
| RNF-02 | 🟡 | Rótulos, `aria-*`, FAQ com setas, lightbox com foco preso e devolvido, `prefers-reduced-motion` | Contraste dos dois temas não medido; nenhuma verificação automática de acessibilidade | L |
| RNF-03 | 🟡 | CSS responsivo, menu recolhível | Auditoria em 390/768/1440 px é afirmação do README, não reproduzida | S (só Projetos), A |
| RNF-04 | 🔶 | Build enxuto; imagens de projeto leves | `public/assets/portfolio.jpeg` é na verdade um **PNG** de 768×768 com **840 KB**, usado na seção Sobre e como ícone da aba (`index.html`). `og-image.png` tem 218 KB. Lighthouse nunca foi medido | L, X |
| RNF-05 | 🔶 ⏳ | `.gitignore` com `.env`; só Public Key no cliente; 0 usos de `dangerouslySetInnerHTML`; `rel="noopener noreferrer"` em 6/6 links | Restrição de domínio e limite de envio no EmailJS dependem da conta. O formulário não tem proteção própria contra spam (honeypot ou similar) | L, X |
| RNF-06 | 🔶 | `useDocumentMeta` ajusta título e descrição por página e idioma | Só em tempo de execução: crawlers e prévias de link veem apenas o `index.html` estático. `og:image` é caminho relativo; faltam `og:description`, `og:url` e `twitter:card` | L |
| RNF-07 | ✅ | Conteúdo em `src/data`; seções e componentes pequenos; só 3 dependências de execução | O modelo de datas é insuficiente (ver R-01) | L |
| RNF-08 | 🔶 | README declara que nada foi inventado | Riscos atuais: "Repositório a divulgar" (sugere plano), texto genérico de WebTech, "atual" na v2 do EcoShop, Pendências do README desatualizadas. Nenhuma data inventada encontrada | L |
| RNF-09 | ✅ | `package-lock.json`, `.nvmrc` (22), `engines` (≥ 20.19) | — | B (`npm ci` concluiu) |

### Entrega e documentação

| ID | Estado | Código existente | Problemas | Evidência |
| --- | --- | --- | --- | --- |
| RE-01 | ❌ | `README.md` bem organizado (links, funcionalidades, arquitetura, instalação, deploy, estrutura, demonstração, testes, pendências, autoria) | Três placeholders `ADICIONAR_*` (deploy, GitHub, Figma). Seção Pendências desatualizada (datas já conhecidas). A lista de itens obrigatórios do professor não pôde ser conferida (Q-01). "25 testes" confere com a execução | L, B |
| RE-02 | ⏳ | `.gitignore`, `.prettierignore` | O zip não tem `.git`; repositório ainda não criado | L |
| RE-03 | ⏳ | Configuração de fallback para Netlify e Vercel; instruções de deploy no README | Sem hospedagem escolhida (Q-07) nem URL | L |
| RE-04 | ❌ ⏳ | `docs/PROTOTIPOS.md` lista as telas; `docs/screenshots/` serve de base | Não há arquivo no Figma. Faltam capturas mobile de Início, Experiências, Contato, Serviços e Estudo de Caso para servir de referência | L, S |
| RE-05 | 🔶 | 7 capturas | Ficarão desatualizadas após RF-02, RF-03 e RF-10; imagens de ShortURL e File Name Standardizer ainda não entregues | S, X |
| RE-06 | ❌ | — | Sem `LICENSE`; README registra a pendência | L |

## 3. Presente no código × comprovadamente operacional

| Funcionalidade | No código | Comprovado | Como |
| --- | --- | --- | --- |
| Troca de idioma e persistência | Sim | **Sim** | T |
| Alternância e persistência do tema | Sim | **Sim** | T |
| Tema aplicado antes da hidratação | Sim | Não | Só leitura do script |
| Timeline renderiza os 5 projetos | Sim | **Sim** (ordem incorreta) | T |
| Lightbox | Sim | **Sim** na galeria BECAS; não nas galerias de projeto | T |
| Validação e estados do formulário | Sim | **Sim** | T |
| Envio real por EmailJS | Sim | **Não** | Sem credenciais, nunca executado |
| Aviso de envio inativo (UI) | Sim | Parcial | Serviço testado; UI sem teste |
| Resposta automática desativada | n/a | Não | Configuração externa inexistente |
| Rolagem por âncora entre rotas | Sim | Não | jsdom simula a rolagem |
| Recarregar `/servicos` sem 404 | Config presente | Não | Sem hospedagem |
| Responsividade 390/768/1440 | CSS presente | Não | Só captura mobile de Projetos e relato do README |
| Build de produção | Sim | **Sim** | B |

## 4. Dependências externas

| Item | Responsável | Bloqueia |
| --- | --- | --- |
| Capturas de ShortURL e File Name Standardizer | Autora | RF-06, RE-05 |
| Imagens de Planoriza e WhatsApp Dispatcher | Autora (não existem) | RF-06; decisão em Q-01 |
| Meses de início de ShortURL, File Name Standardizer, WhatsApp Dispatcher | Autora (ver primeiro commit de cada repositório) | RF-02, RF-04 |
| Conta, serviço e template EmailJS (Auto-Reply desativado, domínio restrito, limite de envio) | Autora | RF-13, RF-14, RNF-05 |
| Escolha da hospedagem e publicação | Autora | RE-03, RF-18, RNF-04, RNF-06 |
| Criação do repositório GitHub | Autora | RE-02 |
| Arquivo Figma com os wireframes | Autora | RE-04 |
| Enunciado literal do TP1 | Autora | Q-01 |
| Respostas a Q-02 a Q-05 | Autora | RF-07, RF-08, RF-09, RF-10 |

## 5. Refatorações

| ID | Mudança | Justificativa técnica | Decisão |
| --- | --- | --- | --- |
| R-01 | Trocar `start` (ano) por data estruturada `{ year, month? }` e reescrever o comparador | Sem mês, é impossível ordenar Planoriza (01/2025) e EcoShop (02/2025) e exibir `MM/AAAA`. O comparador atual também depende de `NaN` | **Justificada** |
| R-02 | Dar às versões do EcoShop um campo de data (`{ year, month }`) em vez do texto "v1 · 2025" | Mesmo motivo; remove o status "atual" dos dados | **Justificada** (parte de R-01) |
| R-03 | Ajustar `ProjectMedia` para não exibir aviso quando a galeria está vazia | Comportamento, não refatoração; depende de Q-01 | Mudança funcional |
| R-04 | Unificar os arquivos PT/EN do estudo de caso | Sem benefício para os requisitos; risco de regressão em ~130 KB de JSX | **Não justificada** |
| R-05 | Trocar o roteador próprio, migrar para TypeScript, reorganizar CSS | Nenhum requisito exige | **Não justificada** |

## 6. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Ordem entre os três projetos de 2026 não é cronológica real enquanto os meses forem desconhecidos | RF-02 só é parcialmente verificável | Exibir só o ano, não afirmar ordem; pedir os meses (Q-06) |
| Teste atual fixa a ordem incorreta | Falha esperada ao corrigir RF-02 | Atualizar o teste na mesma tarefa |
| Variáveis `VITE_*` só entram no build seguinte | Site publicado sem envio ativo | Configurar na hospedagem antes do primeiro deploy e validar em produção |
| Enunciado não conferido | Item obrigatório esquecido | Resolver Q-01 antes de iniciar a Fase 4 |
| Texto de WebTech e do Dispatcher sugerindo mais do que existe | Viola D-08 | Revisão de conteúdo por checklist (RNF-08) |
