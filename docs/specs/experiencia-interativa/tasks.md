# Experiência interativa — tarefas

Uma tarefa por commit; a mensagem leva o ID. "Feito quando" é um teste que passa (e `/verify-site` nas tarefas visuais). Estado: fases 1 a 5 e T-C1 concluídas em 11/11/2026 (evidência em [status.md](status.md)). **T-C2 e T-C3 dependem de texto da Duda** (o formulário de coleta está previsto para o fim). Os commits ainda não foram feitos: cada tarefa deve virar um commit com o ID na mensagem.

## Fase 1 — Comandos de personalidade (A)

| ID | Tarefa | Requisitos | Depende | Feito quando |
| --- | --- | --- | --- | --- |
| T-X1 ✅ | Pasta `src/terminal/commands/` e registro dos comandos novos em `commands.tsx` | PE-09 | — | teste de inventário passa com um comando de exemplo |
| T-X2 ✅ | `neofetch` com monograma derivado do nome | PE-01, PE-02 | T-X1 | testes de campos e de iniciais; captura 1440 e 390 |
| T-X3 ✅ | `sudo contratar-duda`, `rm -rf`, `cowsay` | PE-03, PE-04, PE-05 | T-X1 | testes de saída PT/EN e de "sem efeito" |
| T-X4 ✅ | `fortune` com `fortunes.ts` vazio tipado | PE-07 | T-X1 | teste da lista vazia e da sorteada |
| T-X5 ✅ | Linha de humor no `historico` | PE-08 | — | teste; CM-01 segue verde |
| T-X6 ✅ | `matrix` em canvas, sob demanda | PE-06 | T-X1 | teste de encerramento por tecla e de movimento reduzido |

## Fase 2 — Temas e boot (B)

| ID | Tarefa | Requisitos | Depende | Feito quando |
| --- | --- | --- | --- | --- |
| T-T1 ✅ | `themes.ts`, `setTheme`, validação no `index.html` | TB-01, TB-03, TB-05 | — | testes de persistência e de nome desconhecido |
| T-T2 ✅ | Blocos de tokens dos 3 temas novos | TB-04 | T-T1 | `contrast.test.ts` cobre os 5 temas e passa; capturas |
| T-T3 ✅ | `tema <nome>` e `tema ls` | TB-01, TB-02 | T-T1 | testes do comando e do erro que reensina |
| T-T4 ✅ | Boot da primeira visita e `boot` | TB-06, TB-07, TB-08 | — | testes de flag, de pular e de movimento reduzido |

## Fase 3 — Acabamento sem conteúdo novo (E parcial)

| ID | Tarefa | Requisitos | Depende | Feito quando |
| --- | --- | --- | --- | --- |
| T-E1 ✅ | 404 temático com sugestões | CE-03 | — | teste da função de sugestão e da página; captura |
| T-E2 ✅ | Mensagem no `console` | CE-05 | — | teste de uma chamada, sem erro |
| T-E3 ✅ | `stats` com dados do build | CE-02 | T-X1 | teste com `__BUILD__` simulado e com `null` |
| T-E4 ✅ | `git log` da timeline de habilidades | CE-01 | T-X1 | teste de ordem, de nulos fora e da contagem |
| T-E5 ✅ | Imagem `og.png` e script (já existia, da feature seo) | CE-04 | T-T2 | arquivo 1200×630; teste do `seo.ts`; captura |

## Fase 4 — Janelas e atalhos (D)

| ID | Tarefa | Requisitos | Depende | Feito quando |
| --- | --- | --- | --- | --- |
| T-J1 ✅ | `shortcuts.ts` e overlay `?`, comando `atalhos` | JA-08, JA-09 | T-X1 | testes do overlay e da fonte única |
| T-J2 ✅ | Paleta `Ctrl+K` | JA-06, JA-07 | T-J1 | testes de busca, foco, Esc e execução pela sessão; testes de sessão ajustados |
| T-J3 ✅ | `WindowProvider`, bolinhas funcionais, minimizar/fechar | JA-04 | — | testes de recolher, restaurar e fechar |
| T-J4 ✅ | Arrasto por ponteiro e por teclado | JA-01, JA-02, JA-03 | T-J3 | testes de limite, de setas e de duplo clique; captura a 390 |
| T-J5 ✅ | Barra de tarefas | JA-05 | T-J3 | teste de aparecer/sumir e restaurar; capturas |

## Fase 5 — Campo minado (C)

| ID | Tarefa | Requisitos | Depende | Feito quando |
| --- | --- | --- | --- | --- |
| T-G1 ✅ | Lógica pura do campo minado | JG-02, JG-03 | — | testes de cascata, primeiro clique, vitória e derrota |
| T-G2 ✅ | Tabuleiro, contador, cronômetro, acessibilidade | JG-05, JG-07 | T-G1 | testes de `aria-label`, de estado e do cronômetro |
| T-G3 ✅ | Mouse, toque e teclado | JG-06 | T-G2 | testes de atalhos de teclado e do modo bandeira; captura a 390 |
| T-G4 ✅ | Comandos `minas`, `jogos`, dificuldades, `sair`, replay | JG-01, JG-04, JG-09 | T-G2, T-X1 | testes do comando e do replay |
| T-G5 ✅ | Melhor tempo no navegador | JG-08 | T-G4 | teste com armazenamento falhando |

## Fase 6 — Conteúdo (E, depende de texto da Duda)

| ID | Tarefa | Requisitos | Depende | Feito quando |
| --- | --- | --- | --- | --- |
| T-C1 ✅ | Rotas `agora` e `setup`, páginas e comandos com dados vazios | CE-06, CE-07 | T-X1 | testes de rota, `ls`, sitemap e aviso de pendência |
| T-C2 ❌ | Componente único de estudo de caso e migração do atual | CE-08 | — | teste de paridade com o conteúdo antigo |
| T-C3 ❌ | Preencher `fortunes`, `now`, `uses` e novos casos | PE-07, CE-06 a CE-08 | texto da Duda | `content-integrity` e paridade PT/EN passam |

## Fechamento

Ao fim de cada fase: `/verify-site`, `status.md` com evidências (`/sdd-spec-sync`) e atualização do índice em `docs/specs/README.md`.
