# Plano de implementação — Portfólio Duda Brito (TP1)

Plano incremental derivado de [`gap-analysis.md`](gap-analysis.md) para cumprir [`requirements.md`](requirements.md). Cada tarefa é pequena o bastante para um commit e termina com um critério verificável.

**Definição de pronto (vale para toda tarefa de código):** `npm run lint`, `npm test` e `npm run build` com código 0 · textos novos em PT e EN · nenhum dado inventado · teste cobrindo o comportamento novo · linha de estado correspondente em `gap-analysis.md` atualizada.

**Legenda:** 👩 ação da autora (externa) · 💻 código · 📝 conteúdo/documentação · ⛓ dependência.

## Progresso da implementação (2026-10-31)

Verificação: `npm run lint` sem apontamentos · `npm test` 53/53 · `npm run build` concluído. Testes em jsdom; nenhuma verificação em navegador real.

> **Atualização (09/11/2026):** a suíte tem hoje **215 testes em 20 arquivos** (os 53 acima são de 31/10). O site foi refeito depois deste plano; o plano vigente é [`../sdd-terminal-v2/tasks.md`](../sdd-terminal-v2/tasks.md). Requisitos do TP1 superados estão marcados em `requirements.md` (D-04, D-10, RF-18, RF-19, RNF-03).

| Tarefa | Estado | Observação |
| --- | --- | --- |
| T-10 | ✅ | `date: { year, month? }` + `utils/projectDate.js` (comparação por tupla, sem sentinela); testes em `projectDate.test.js` e `projects.test.js` |
| T-11 | ✅ | Planoriza 01/2025 → EcoShop 02/2025 → 2026 (ordem declarada). Nenhum mês inventado |
| T-12 | ✅ | Rótulo `MM/AAAA`/`AAAA`; removidos `periodPending`, `.date-pending`, `current`/"atual". **Decisão:** projetos de 2026 sem mês mostram a nota "ordem entre os projetos de 2026 indeterminada" (pedido explícito da autora; é uma sinalização de precisão da data, não um status do projeto) |
| T-13 | ✅ | `App.test.jsx` e novo `Projects.test.jsx` |
| T-20 | ✅ | `RepoLink` não renderiza nada sem repositório (Planoriza e WhatsApp Dispatcher); removidos "Repositório a divulgar/privado". Q-02 segue aberta: a página do estudo de caso não afirma mais "privado", só "parcial" |
| T-21 | ✅ | Card e página (PT/EN): "Desafio Técnico de Estágio"; bloco "Escopo deste material" separa implementação original, análises posteriores e possíveis evoluções (SDD, agêntico, n8n) em linguagem de intenção |
| T-22 | ✅ | WebTech: "2º semestre de 2026 – em andamento", workshop e laboratório de SDD, futura aplicação de monitorias, sem cargo |
| T-23 | ⏳ | Tecnologias aguardam confirmação (Q-03); nada alterado |
| T-30 | ✅ | `ProjectMedia` retorna `null` sem galeria; `mediaPending`/`.media-pending` removidos. `ImageGallery` descarta imagens que falham ao carregar |
| T-31 | ⏳ | Aguardam as capturas reais de ShortURL e File Name Standardizer; nenhuma imagem fictícia criada |
| T-32 | ✅ | Planoriza e WhatsApp Dispatcher seguem sem imagens (não existem); nada é exibido no lugar |
| T-41 | ✅ | Revisão do contato (2026-10-31): trava síncrona contra envio duplicado, campo-armadilha, `blockHeadless` e `limitRate` do SDK 4.4.1, mensagens distintas para rede/limite/falha/não configurado, `required`/`maxLength`, tutorial no README. 53 testes (mocks). **Não prova envio real** |
| T-40, T-42, T-50–T-52, T-60 | ⏳ | Dependem da autora (EmailJS, hospedagem, Figma, Lighthouse/axe). **Não concluídos** |
| T-53, T-54, T-61–T-64 | ⏳ | Não iniciados (README parcialmente atualizado: contagem de testes, Pendências, Auto-Reply; `ADICIONAR_*` permanecem) |

### Documentação e entrega (2026-10-31)

| Tarefa | Estado | Observação |
| --- | --- | --- |
| T-54 | 🔶 | README revisado contra o template do professor (organização própria mantida; adicionados versões, decisões de arquitetura, Contribuição, status real). `ADICIONAR_*` seguem, por falta de repositório, deploy e Figma |
| T-52 | 🔶 | `docs/PROTOTIPOS.md` virou guia de wireframes; **nenhum Figma foi criado** |
| T-50 | ⏳ | Netlify recomendado; `netlify.toml` e `docs/DEPLOY.md` prontos. Nada publicado |
| T-01 | ⏳ | Procedimento em `docs/DEPLOY.md`; a pasta continua sem Git |

## Visão geral da ordem

```text
Fase 0  Desbloqueio ──► Fase 1  Timeline ──► Fase 2  Conteúdo ──┐
                                                                 ├─► Fase 4  EmailJS ─► Fase 5  Entrega ─► Fase 6  Qualidade
                          Fase 3  Galerias (paralela à 2) ───────┘
```

Fases 1 e 2 entregam os requisitos P0 que não dependem de terceiros. A Fase 4 depende da conta EmailJS (👩) e a Fase 5, da hospedagem e do Figma (👩).

## Fase 0 — Desbloqueio (sem código)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-00 | 👩 Responder Q-01 a Q-08 de `requirements.md`, em especial o enunciado literal (Q-01) e os meses de início (Q-06; o primeiro commit de cada repositório é a fonte mais segura) | todos | — | Cada pergunta respondida ou explicitamente adiada; valores registrados na tabela da seção "Fontes das datas" abaixo |
| T-01 | 👩 Criar o repositório GitHub e enviar o estado atual como primeiro commit, antes de qualquer mudança | RE-02 | — | Repositório acessível; sem `.env` no histórico; `git log` mostra o commit de base |

## Fase 1 — Timeline cronológica só com datas (P0)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-10 | 💻 **R-01.** Substituir `start`/`period` por `date: { year, month? }` em `data/projects.jsx` e reescrever `sortProjectsChronologically` (chave `ano*12+mês`, ausência de mês estável, sem `NaN`). Ajustar `projects.test.js` | RF-02, RF-04 | T-00 (Q-04) | Testes unitários: ano+mês ordena corretamente; mês ausente mantém ordem declarada; sem duplicar nem perder projetos |
| T-11 | 💻📝 Preencher os dados confirmados: Planoriza `01/2025`; EcoShop `02/2025`; v1 `02/2025`; v2 `01/2026`; ShortURL, File Name Standardizer e WhatsApp Dispatcher apenas `2026` | RF-02, RF-04, RF-05 | T-10 | Ordem renderizada: Planoriza → EcoShop → projetos de 2026; nenhum mês preenchido sem confirmação |
| T-12 | 💻 Exibir somente a data: formato `MM/AAAA` ou `AAAA` em `ProjectCard`; remover `periodPending` (`ui.js`), o estilo `.date-pending` não utilizado e a marcação `current`/"atual" da v2 do EcoShop | RF-03, RF-05, RF-19 | T-11 | Teste varre o DOM em PT e EN e não encontra "atual", "current", "a confirmar", "to be confirmed", "em andamento", "concluído"; visual do card idêntico ao atual, exceto o rótulo |
| T-13 | 💻 Atualizar `App.test.jsx` (hoje fixa a ordem errada) para a ordem nova e para os cinco ids | RF-01, RF-02 | T-11 | Teste falha se qualquer projeto sair da posição esperada |

**Marco 1:** RF-01 a RF-05 atendidos. Mesmo se os meses de 2026 continuarem desconhecidos, a ordem entre eles é estável e não é apresentada como cronológica.

## Fase 2 — Conteúdo fiel ao que existe (P0)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-20 | 💻📝 Links de repositório: Planoriza sem link e sem "Repositório a divulgar"; WhatsApp Dispatcher conforme Q-02; revisar `RepoLink` | RF-07, RNF-08 | T-00 (Q-02) | Teste: Planoriza não tem link nem texto de promessa; os outros três repositórios mantêm `rel="noopener noreferrer"` |
| T-21 | 📝 Enquadrar o WhatsApp Dispatcher como estudo de caso de desafio técnico de estágio (PT/EN) no card e no cabeçalho da página; qualquer evolução futura em linguagem de intenção | RF-08 | T-00 | Texto presente nos dois idiomas; revisão manual confirma que nenhum recurso planejado aparece como existente |
| T-22 | 💻📝 Atualizar WebTech em `experiences.js`: início no 2º semestre de 2026, em andamento; preparação de workshop e laboratório de Spec-Driven Development usando como referência uma futura aplicação de monitorias universitárias; sem cargo formal | RF-10 | T-00 (Q-05) | Teste confirma o texto nos dois idiomas; revisão confirma ausência de cargo, mês e entrega inventados |
| T-23 | 📝 Confirmar tecnologias de Planoriza e WhatsApp Dispatcher | RF-09 | T-00 (Q-03) | Lista aprovada pela autora; `projects.jsx` atualizado se necessário |

**Marco 2:** conteúdo dos cinco projetos e de WebTech alinhado ao briefing (RNF-08).

## Fase 3 — Galerias (P0, em paralelo à Fase 2)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-30 | 💻 `ProjectMedia`: não renderizar aviso quando `gallery` está vazia (sujeito a Q-01); remover `mediaPending` e `.media-pending` se ficarem sem uso | RF-06 | T-00 (Q-01) | Teste com um projeto com galeria (abre lightbox, `alt` PT/EN) e outro sem (nada renderizado) |
| T-31 | 👩💻 Receber capturas de ShortURL e File Name Standardizer; otimizar (JPEG/PNG/WebP, ≤ 300 KB), salvar em `public/cases/<id>/` e listar em `gallery` | RF-06, RE-05 | Imagens da autora | Galerias abrem no lightbox em ambos os temas e idiomas; arquivos dentro do limite |
| T-32 | 📝 Registrar que Planoriza e WhatsApp Dispatcher seguem sem imagens (não existem) e o tratamento acordado em Q-01 | RF-06 | T-30 | Decisão registrada neste arquivo e no README |

**Marco 3:** RF-06 atendido para todos os projetos que têm imagens.

## Fase 4 — Mensagens por EmailJS, sem resposta automática (P0)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-40 | 👩 Criar conta, serviço e template no EmailJS com `from_name`, `from_email`, `reply_to`, `message`; **Auto-Reply desativado**; destino conforme Q-08 | RF-13, RF-14 | T-00 | IDs e Public Key em mãos; template salvo sem resposta automática |
| T-41 | 💻📝 Teste de UI do estado "não configurado"; README: passo explícito para desativar Auto-Reply; rever o texto de sucesso para não sugerir e-mail automático | RF-14, RF-15 | — | Teste cobre os cinco estados do formulário; README atualizado |
| T-42 | 👩 Preencher `.env` local, enviar mensagem de teste e anexar a evidência | RF-13 | T-40 | Mensagem recebida na caixa de destino; nenhuma resposta automática chegou ao remetente de teste; print arquivado |

**Marco 4:** RF-12 a RF-15 atendidos e comprovados localmente. A prova em produção fecha em T-51.

## Fase 5 — Entrega (P0)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-50 | 👩 Escolher hospedagem (Q-07), cadastrar `VITE_EMAILJS_*` **antes** do build e publicar | RE-03 | T-01, T-40 | URL pública estável |
| T-51 | 👩 Verificar em produção: recarregar `/servicos` e o estudo de caso (sem 404), âncoras, troca de idioma e tema, envio real pelo formulário. Restringir o domínio e definir limite de envios no EmailJS | RF-13, RF-18, RNF-05 | T-50 | Checklist preenchida; e-mail de teste recebido via site publicado |
| T-52 | 👩 Montar os wireframes no Figma a partir do design final e de `docs/screenshots/`: 1440 e 390 px; Início, Sobre, Habilidades, Projetos, Experiências, Contato, Serviços, Estudo de Caso | RE-04 | Marcos 1 a 3 | Link com acesso de visualização funcionando |
| T-53 | 📝 Regerar as capturas de timeline e experiências; acrescentar as mobile que faltam | RE-05 | Marcos 1 a 3 | Imagens em `docs/screenshots/` refletem o site final |
| T-54 | 📝 README: preencher URLs de site, GitHub e Figma; remover os três `ADICIONAR_*`; reescrever Pendências e a tabela de status conforme a realidade; conferir todos os itens do enunciado; atualizar `docs/PROTOTIPOS.md` | RE-01 | T-50, T-52, T-00 (Q-01) | Busca por `ADICIONAR_` retorna zero; cada afirmação do README é verdadeira na data do commit |

**Marco 5:** entrega completa (todos os P0).

## Fase 6 — Qualidade e acabamento (P1/P2)

| ID | Tarefa | Req. | ⛓ | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T-60 | 👩💻 Rodar Lighthouse e axe na URL publicada, medir contraste nos dois temas, conferir 390/768/1440 px; corrigir o que ficar abaixo das metas | RNF-02, RNF-03, RNF-04 | T-50 | Relatórios arquivados; metas de `requirements.md` atingidas ou desvios justificados |
| T-61 | 💻 Otimizar a foto de perfil (hoje PNG de 840 KB com extensão `.jpeg`) e usar ícone de aba dedicado e leve | RNF-04, RNF-06 | — | Imagem corrigida e visual da seção Sobre inalterado |
| T-62 | 💻 `og:image` com URL absoluta; adicionar `og:description`, `og:url`, `twitter:card` | RNF-06 | T-50 | Prévia de link correta em um validador de compartilhamento |
| T-63 | 💻 Teste de paridade PT/EN para `ui.js` e `experiences.js` | RF-16 | — | Teste falha se faltar chave em um dos idiomas |
| T-64 | 📝 Decidir licença e adicionar `LICENSE`, ou registrar que não haverá | RE-06 | — | Decisão visível no README |

## Ordem recomendada

1. **T-00 e T-01** (autora): sem elas, quase tudo fica bloqueado ou arriscado.
2. **T-10 a T-13:** é o maior defeito atual e não depende de terceiros.
3. **T-20 a T-23:** correções de conteúdo, baratas e de alto risco se ficarem erradas.
4. **T-30** e, quando as imagens chegarem, **T-31**.
5. **T-40 a T-42:** a conta EmailJS tem prazo externo; peça cedo, mesmo que o código só seja tocado agora.
6. **T-50 a T-54:** só depois do conteúdo estável, para que Figma, capturas e README mostrem o site final.
7. **T-60 a T-64:** acabamento, medido sobre a URL publicada.

## Fontes das datas (RF-04)

| Item | Valor | Fonte | Confirmado por |
| --- | --- | --- | --- |
| Planoriza | 01/2025 | Briefing | Autora |
| EcoShop v1 | 02/2025 | Briefing | Autora |
| EcoShop v2 | 01/2026 | Briefing | Autora |
| ShortURL | 2026, mês pendente | Briefing | — |
| File Name Standardizer | 2026, mês pendente | Briefing | — |
| WhatsApp Dispatcher | 2026, mês pendente | Briefing | — |
| WebTech | 2º semestre de 2026, em andamento | Briefing | Autora |
