# Navegação contextual e trilhas nas páginas: estado

Fase 3 do `roadmap-personas-site.md`. Em cima de `personas`, `trilhas`, `personas-home` e
`projetos-contextuais`. Regras em `src/data/nextActions.ts`; componente `src/components/PageNext.tsx`,
montado uma vez no `SiteShell`.

| ID | Requisito | Estado |
| --- | --- | --- |
| NV-01 | Regras declarativas: por persona e página, uma ação principal e uma secundária | ✅ `nextActions.ts`; `nextActions.test.ts` (destinos existem, sem laço, sem rascunho, PT/EN) |
| NV-02 | Faixa discreta abaixo da janela em todas as páginas, menos home e terminal | ✅ `SiteShell.tsx`; `PageNext.test.tsx` |
| NV-03 | Sem persona, ou sem regra: nada | ✅ testes |
| NV-04 | Principal e secundária distintas; muda com a persona | ✅ testes das cinco personas |
| NV-05 | Andamento da trilha em páginas que são paradas dela, ou depois de começada, com a próxima parada | ✅ lê `TrailProvider`; nada de progresso novo |
| NV-06 | Nunca abre o tour sozinho; só no clique em "Continuar" / "Fazer esta trilha" | ✅ testes (sem `dialog` na renderização) |
| NV-07 | Pausar e retomar | ✅ "Agora não" na faixa (guarda a escolha) e Esc/"Sair" no tour; retoma por "Continuar" ou pelo comando `trilha` |
| NV-08 | Trocar de persona atualiza as sugestões e preserva o progresso das outras | ✅ testes (store por persona intacto) |
| NV-09 | PT e EN | ✅ teste em EN |
| NV-10 | Visual leve, celular, impressão | ✅ 1440×900 e 390×844 (cliente, tech, rh em EN, amigo), tema escuro, sem rolagem horizontal nem erro de console; oculta em `@media print` (regra escrita, **impressão não conferida em navegador**) |
| NV-11 | Acessibilidade | ◐ `nav` com nome, botões nativos, foco visível, alvo ≥ 2,5 rem. **Falta** leitor de tela e temas claro/dracula/solarized/âmbar |

## Mapa (página → próximo passo) por persona

- **rh:** currículo → experiências / contato · experiências → contato / currículo · habilidades → experiências.
- **tech:** projetos → estudo de caso / GitHub · estudo de caso → GitHub / contato · GitHub → contato.
- **professor:** acadêmico → projetos / atividades · projetos → contexto acadêmico · experiências → atividades por ano.
- **cliente:** serviços → cases / orçamento · projetos → serviços · estudo de caso → FAQ / orçamento.
- **amigo:** sobre → projetos / jogos · projetos → jogos / terminal · jogos → terminal / sobre.

## Adaptações ao que existe

- **"Processo de trabalho" (cliente):** não há página nem texto; no lugar, estudo de caso → perguntas frequentes → orçamento.
- **"Explorar arquitetura/decisões" (tech):** não há diagrama; vai ao estudo de caso (que traz as decisões e trade-offs) e ao GitHub. O WhatsApp Dispatcher não tem repositório, então "repositório" aponta para a página do GitHub.
- A faixa **não marca passos como feitos** só por visitar a página: o progresso continua sendo só o do tour.

## Limites

- Recomendação é por página, não por "o que já foi lido".
- Páginas sem regra para uma persona (ex.: `agora` para tech) não mostram nada.
- JS inicial: 143,67 → 144,85 kB gzip (+1,2).
- Trilha em `amigo`: o contador mostra segredos ("0 de 8"), como no cartão da home.
