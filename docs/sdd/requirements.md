# Requisitos — Portfólio Duda Brito (TP1)

Documento de requisitos do portfólio React + Vite. Cada requisito tem identificador único, critério de aceitação verificável e método de verificação. O estado atual de cada um está em [`gap-analysis.md`](gap-analysis.md); a ordem de implementação, em [`tasks.md`](tasks.md).

## 1. Fontes e limites desta especificação

| Fonte | Uso |
| --- | --- |
| Briefing da autora (decisões D-01 a D-10 abaixo) | Fonte primária de escopo e de fatos (datas, WebTech, repositórios) |
| Código, `README.md`, `docs/PROTOTIPOS.md`, `docs/site-original/` | Estado atual e conteúdo já publicado |
| **Enunciado do Trabalho Prático 1** | **Não estava no `portfolio.zip` e não foi localizado publicamente.** Os requisitos que dependem dele estão marcados com ⚠️ e listados em Q-01 |

> Antes de fechar a entrega, compare esta lista com o enunciado original (principalmente RE-01, RE-04 e RF-06).

**Legenda.** Prioridade: **P0** necessário para a entrega · **P1** importante · **P2** desejável. Verificação: **AUT** teste automatizado · **MAN** inspeção manual no navegador · **EXT** evidência externa (URL, e-mail recebido, link).

## 2. Decisões estabelecidas

| ID | Decisão |
| --- | --- |
| D-01 | Manter os cinco projetos: EcoShop, Planoriza, ShortURL, File Name Standardizer, WhatsApp Dispatcher |
| D-02 | Timeline cronológica, do mais antigo ao mais recente, exibindo **apenas datas**, sem indicadores de status |
| D-03 | Usar galerias de imagens quando houver imagens |
| D-04 | Preservar design atual, i18n PT/EN, tema claro/escuro e estrutura geral. **Superado em 09/11/2026 por `docs/sdd-terminal-v2/`:** o design foi trocado de propósito por um estilo único (terminal/IDE); i18n PT/EN e tema claro/escuro continuam valendo |
| D-05 | Recebimento de mensagens via EmailJS, **sem** respostas automáticas |
| D-06 | Manter a organização atual do README, garantindo os itens obrigatórios do professor |
| D-07 | Refatorar somente com justificativa técnica registrada em `tasks.md` |
| D-08 | Não inventar datas, cargos ou funcionalidades; o planejado nunca é apresentado como implementado |
| D-09 | Wireframes derivados do design atual |
| D-10 | Sem ferramentas ou frameworks de SDD; apenas estes três documentos. **Superado em 09/11/2026 por `docs/sdd-terminal-v2/`:** a spec geral e a análise ficam lá, e cada feature tem sua pasta em `docs/specs/`; a skill `spec-driven-development` define o fluxo |

> **Nota de implementação (2026-10-31):** a autora pediu que projetos com ordem cronológica não determinável sejam identificados como tal. A nota "ordem entre os projetos de AAAA indeterminada" na timeline atende esse pedido e é tratada como informação sobre a precisão da data, não como indicador de status (RF-03).

## 3. Fatos de referência (únicos valores de data autorizados)

| Item | Data confirmada | Não confirmado |
| --- | --- | --- |
| Planoriza | início em 01/2025 | — |
| EcoShop v1 | 02/2025 | — |
| EcoShop v2 | 01/2026 | — |
| ShortURL | ano 2026 | mês de início |
| File Name Standardizer | ano 2026 | mês de início |
| WhatsApp Dispatcher | ano 2026 | mês de início |
| WebTech | início no 2º semestre de 2026; em andamento | mês de início; cargo formal (não existe) |

## 4. Requisitos funcionais

### 4.1 Projetos e timeline

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| RF-01 | A timeline contém os cinco projetos, uma vez cada | A seção `#projetos` lista exatamente os ids `planoriza`, `ecoshop`, `shorturl`, `file-name-standardizer`, `whatsapp-dispatcher`, sem duplicatas | P0 | AUT |
| RF-02 | Ordem cronológica crescente por início, com precisão de mês quando conhecido | Planoriza (01/2025) vem antes de EcoShop (02/2025); ambos antes dos três projetos de 2026. Entre projetos com mesmo ano e mês desconhecido a ordem é estável e **não** é apresentada como cronológica. Teste unitário cobre ano+mês e mês ausente | P0 | AUT |
| RF-03 | Cada item exibe somente data, sem indicador de status | O rótulo de data é `MM/AAAA` ou `AAAA` (mês não confirmado). Nenhum texto como "atual", "current", "em andamento", "concluído", "período a confirmar", "to be confirmed" aparece na timeline, em PT ou EN. Teste varre o DOM nos dois idiomas | P0 | AUT |
| RF-04 | Só datas confirmadas entram nos dados | Os valores do §3 são os únicos usados. Nenhum mês é preenchido para ShortURL, File Name Standardizer e WhatsApp Dispatcher até a confirmação (Q-06). Cada data nova registra sua fonte em `tasks.md` | P0 | MAN |
| RF-05 | EcoShop preserva a evolução v1 → v2 com as datas conhecidas | Os rótulos das versões mostram `02/2025` e `01/2026`; a marcação "atual" é removida; texto e pontos técnicos permanecem idênticos | P0 | AUT |
| RF-06 | Galerias de imagens quando disponíveis ⚠️ | Projeto com ≥1 arquivo em `gallery` renderiza `ImageGallery` com lightbox e `alt` nos dois idiomas. Projeto sem imagens não exibe imagem quebrada nem aviso de "imagem indisponível" (Q-01 pode alterar). Imagens em JPEG/PNG/WebP, ≤ 300 KB cada. Teste cobre um projeto com e outro sem galeria | P0 | AUT |
| RF-07 | Links de repositório corretos e honestos | EcoShop, ShortURL e File Name Standardizer apontam para os URLs atuais de `projects.jsx`, em nova aba com `rel="noopener noreferrer"`. Planoriza não exibe link nem promessa de publicação. WhatsApp Dispatcher exibe apenas o link do estudo de caso | P0 | AUT + EXT |
| RF-08 | WhatsApp Dispatcher é apresentado como estudo de caso de um desafio técnico de estágio | Card e página do estudo de caso (PT/EN) dizem que se trata de estudo de caso de desafio técnico de estágio, com documentação HTML. Qualquer menção a evolução futura usa linguagem de intenção ("possível evolução"), sem listar recurso como existente. A página continua afirmando que a implementação é parcial | P0 | MAN |
| RF-09 | Tecnologias por projeto são confirmadas pela autora | Cada projeto tem ≥1 tecnologia; as de Planoriza e WhatsApp Dispatcher foram confirmadas (Q-03) | P1 | MAN |

### 4.2 Experiências

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| RF-10 | A experiência WebTech reflete a atividade real | Período exibido: início no 2º semestre de 2026, em andamento (sem mês). Descrição cita a preparação de workshop e laboratório de Spec-Driven Development e a referência a uma **futura** aplicação de monitorias universitárias, sem tratá-la como entregue. Nenhum cargo formal é criado: o campo mantém "Projeto de Extensão" como tipo de atividade. PT e EN | P0 | AUT + MAN |
| RF-11 | As demais experiências e reconhecimentos permanecem inalteradas | Conteúdo e agrupamento de `experiences.js` (exceto WebTech) idênticos; sem seção duplicada | P1 | AUT |

### 4.3 Contato

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| RF-12 | Formulário com nome, e-mail e mensagem, validação acessível | Campos vazios ou inválidos impedem o envio, mostram erro textual traduzido, marcam `aria-invalid` e focam o primeiro erro; limites 2–100 (nome) e 10–5000 (mensagem) | P0 | AUT |
| RF-13 | O envio usa EmailJS e a mensagem chega à caixa de destino | Com `VITE_EMAILJS_*` definidas, o envio chama `emailjs.send` com `from_name`, `from_email`, `reply_to`, `message`. Em ambiente publicado, uma mensagem de teste é recebida na caixa de destino (print do e-mail como evidência). Sem variáveis, o formulário informa que o envio está inativo e **nunca** simula sucesso | P0 | AUT + EXT |
| RF-14 | Nenhuma resposta automática | O template EmailJS tem Auto-Reply desativado; cada submissão faz exatamente uma chamada de envio; o texto de sucesso não diz que um e-mail foi enviado ao visitante; o README documenta a configuração | P0 | AUT + EXT |
| RF-15 | Estados de carregamento, sucesso e erro | Botão desabilitado com `aria-busy` durante o envio; sucesso limpa os campos; falha preserva o texto digitado; região `role="status"` anuncia o resultado | P1 | AUT |

### 4.4 Plataforma e preservação

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| RF-16 | Internacionalização PT/EN completa | Todo texto novo ou alterado existe nos dois idiomas; a troca mantém rota e seção, persiste em `localStorage` e atualiza `<html lang>`; não há chave faltante | P0 | AUT |
| RF-17 | Tema claro/escuro | O botão alterna o tema, persiste a escolha e o tema salvo é aplicado antes da hidratação (sem flash) | P1 | AUT + MAN |
| RF-18 | Rotas e navegação preservadas | `/`, `/servicos`, `/estudos-de-caso/whatsapp-dispatcher` e 404 funcionam; âncoras `/#secao` rolam até a seção; recarregar qualquer rota na hospedagem não retorna 404 | P0 | AUT + EXT |
|  | | **Superado em 09/11/2026 por `docs/sdd-terminal-v2/` (SH-10):** a home é só o terminal e as seções viraram páginas próprias; `/#secao` agora redireciona para a página equivalente. Rotas, 404 e recarga seguem valendo | | |
| RF-19 | Design e estrutura preservados | Nenhuma alteração em tokens de cor, tipografia ou grid fora do estritamente necessário para data e galeria; comparação visual com `docs/screenshots/` em 1440 px e 390 px não mostra regressão | P0 | MAN |
|  | | **Superado em 09/11/2026 por `docs/sdd-terminal-v2/` (ES-xx):** o design foi refeito de propósito em um estilo único; as capturas `docs/screenshots/estilo-*` o documentam | | |

## 5. Requisitos não funcionais

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| RNF-01 | Qualidade automatizada | `npm run lint`, `npm test` e `npm run build` terminam com código 0 a cada tarefa concluída; todo comportamento novo tem teste | P0 | AUT |
| RNF-02 | Acessibilidade | Navegação por teclado em menu, formulário, FAQ e lightbox; contraste AA nos dois temas; Lighthouse Accessibility ≥ 90 na URL publicada | P1 | MAN |
| RNF-03 | Responsividade | Sem rolagem horizontal em 390, 768 e 1440 px; menu recolhível em telas pequenas | P1 | MAN |
|  | | **Parcialmente superado em 09/11/2026 por `docs/sdd-terminal-v2/` (SH-xx):** não há mais menu de links (o "menu" é o terminal); a parte "sem rolagem horizontal em 390, 768 e 1440 px" continua valendo | | |
| RNF-04 | Desempenho | LCP ≤ 2,5 s no mobile (Lighthouse, URL publicada); imagens otimizadas, incluindo a foto de perfil usada como ícone | P1 | MAN |
| RNF-05 | Segurança e privacidade | Nenhum segredo versionado; `.env` ignorado; só a Public Key do EmailJS no cliente; links externos com `noopener`; sem `dangerouslySetInnerHTML`; restrição de domínio e limite de envios ativados na conta EmailJS | P0 | AUT + EXT |
| RNF-06 | SEO e compartilhamento | `title` e `description` por página e idioma; `og:image` com URL absoluta da hospedagem; `og:description` e `og:url` presentes; ícone da aba dedicado ou leve | P2 | MAN |
| RNF-07 | Manutenibilidade | Conteúdo em `src/data`; nenhuma dependência nova sem justificativa; refatoração só conforme D-07 | P1 | MAN |
| RNF-08 | Integridade do conteúdo | Todo fato público (data, cargo, tecnologia, link, recurso) é rastreável ao briefing ou ao repositório; nada planejado aparece como implementado | P0 | MAN |
| RNF-09 | Reprodutibilidade | `npm ci` e `npm run dev` funcionam com Node ≥ 20.19 seguindo só o README | P1 | AUT |

## 6. Entrega e documentação

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| RE-01 | README mantém a organização e cobre os itens obrigatórios ⚠️ | Nenhum placeholder `ADICIONAR_*`; status e pendências refletem a realidade; contagem de testes e comandos corretos; links de site, repositório e Figma preenchidos | P0 | MAN |
| RE-02 | Repositório GitHub criado | Repositório acessível ao professor, com histórico, `.gitignore` efetivo, sem `.env`; URL no README | P0 | EXT |
| RE-03 | Site publicado | URL pública estável; `/servicos` recarrega sem 404; variáveis `VITE_EMAILJS_*` configuradas na hospedagem; URL no README | P0 | EXT |
| RE-04 | Wireframes no Figma a partir do design atual ⚠️ | Média fidelidade, desktop 1440 e mobile 390: Início, Sobre, Habilidades, Projetos (timeline), Experiências, Contato; mais Serviços e Estudo de Caso; link com acesso de visualização no README e em `docs/PROTOTIPOS.md` | P0 | EXT |
| RE-05 | Demonstração atualizada | Capturas de timeline e experiências regeradas após as mudanças; imagens de ShortURL e File Name Standardizer incorporadas quando fornecidas | P1 | MAN |
| RE-06 | Licença definida | Arquivo `LICENSE` ou decisão registrada de não ter | P2 | MAN |

## 7. Perguntas em aberto

| ID | Pergunta | Afeta |
| --- | --- | --- |
| Q-01 | Qual a lista literal de itens obrigatórios do enunciado (README, imagens/GIF por projeto, Figma, link de repositório para projetos sem repositório público)? | RF-06, RF-07, RE-01, RE-04 |
| Q-02 | O código do WhatsApp Dispatcher é privado ou apenas não publicado? Hoje o site diz "privado" | RF-07, RF-08 |
| Q-03 | As tecnologias de Planoriza (hoje HTML5, CSS3, JavaScript) estão corretas? | RF-09 |
| Q-04 | EcoShop permanece como um único card na posição de 02/2025, com v2 dentro do card? (recomendado: sim, preserva o design) | RF-02, RF-05 |
| Q-05 | Texto exato do período de WebTech: "2º semestre de 2026"? | RF-10 |
| Q-06 | Meses de início de ShortURL, File Name Standardizer e WhatsApp Dispatcher (podem ser conferidos no primeiro commit de cada repositório) | RF-02, RF-04 |
| Q-07 | Hospedagem (Netlify ou Vercel) e domínio | RE-03 |
| Q-08 | E-mail de destino e plano do EmailJS (conferir limites mensais do plano) | RF-13 |
