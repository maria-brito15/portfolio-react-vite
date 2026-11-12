# Trilhas por persona: estado

Implementado em `T-TR1` a `T-TR7` (ver `tasks.md`). Requisitos em `requirements.md`; textos
em `textos.md`; plano em `design.md`.

| ID | Requisito | Estado |
| --- | --- | --- |
| TR-01 | Trilhas como dado | ✅ `src/data/trails.ts`; `trails.test.tsx` |
| TR-02 | Passos válidos | ✅ ids de rota, comando e ação existem; as âncoras existem nas páginas **renderizadas** (`trails.test.tsx`) |
| TR-03 | Nada inventado | ✅ todo número de texto sai dos dados (teste); só ações que existem no site |
| TR-04 | Textos aprovados | ◐ textos de `textos.md` aprovados em 12/11/2026; **faltam** as palavras de interface acrescentadas na implementação (lista "a aprovar" no fim de `textos.md`) |
| TR-05 | Assistente opcional | ✅ `stepsOf`/`when: 'assistant'`; ativa com `VITE_ASK_ENABLED=true` (ver `assistente-ia/operacao.md`) |
| TR-06 | Painel na home | ✅ `TrailCard.tsx`; `TrailCard.test.tsx` |
| TR-07 | Nunca começa sozinha | ✅ `/r/<persona>` só convida (teste) |
| TR-08 | Dispensar | ✅ "Agora não" lembrado; `trilha iniciar` traz de volta |
| TR-09 | Comando `trilha`/`trail` | ✅ `extras/trilha.tsx`; `trilha.test.tsx` (Tab, ajuda, catálogo, subcomandos, sem persona, replay) |
| TR-10 | Persona trocada | ✅ progresso separado por persona (`TrailProvider.test.tsx`) |
| TR-11 | Destaque sobre a página | ✅ `Tour.tsx`; testes e capturas (anel, cartão, contador, botões) |
| TR-12 | Sair a qualquer hora | ✅ Esc, "Sair" e `trilha sair`; foco volta a quem abriu; reabrir retoma |
| TR-13 | Alvo ausente | ✅ cartão sem anel (teste); todos os alvos conferidos em páginas reais |
| TR-14 | Passo "ver" | ✅ conclui ao chegar |
| TR-15 | Passo "fazer" | ✅ botão "rodar" e conclusão pelo evento do comando |
| TR-16 | Passo "achar" | ◐ conclui com qualquer segredo; **a dica "só se pedida" não foi feita**: exigiria um texto novo que você ainda não aprovou |
| TR-17 | Passo "agir" | ✅ link, impressão e formulário; conclui ao acionar |
| TR-18 | Progresso local | ✅ `portfolio-trail`; nada é gravado de quem não usa trilha; `localStorage` bloqueado funciona |
| TR-19 | Gamificação graduada | ✅ checklist (rh, tech), barra (professor, cliente), conquistas (amigo); `gamification.test.tsx` |
| TR-20 | Conquistas do `amigo` | ✅ 8 segredos detectados por comando, tema e idioma; aviso em `aria-live`, só para o amigo, sem som |
| TR-21 | Conclusão | ✅ mensagem final (texto aprovado) no tour e no cartão, selo, "Refazer"; nada é compartilhado |
| TR-22 | Teclado e leitor de tela | ◐ foco no cartão, Esc, `aria-live`, anel `aria-hidden` (testes). **Falta** passar com leitor de tela de verdade |
| TR-23 | Movimento reduzido | ✅ rolagem instantânea (teste) e regra global de CSS |
| TR-24 | Celular | ✅ 390×844 conferido em imagens: cartão embaixo, começo da seção à vista, sem rolagem horizontal. (Corrigido durante a verificação: o cartão cobria o alvo) |
| TR-25 | Estilo único e contraste | ◐ só tokens; `contrast.mjs` passa nos cinco temas; tour e cartão capturados nos cinco temas, **vistos** em escuro, claro e âmbar. Faltam olhar dracula e solarized |
| TR-26 | Impressão e robôs | ◐ robôs: testado. Impressão: regras `@media print` escritas, **não conferidas** num navegador |
| TR-27 | Peso | ❌ **+5,5 kB gzip** no JS inicial (410,57 → 427,55 kB; gzip 130,84 → 136,33) contra o teto de +3 kB. O `Tour` (1,8 kB gzip) já é carregado sob demanda |

Contagem: ✅ 21 · ◐ 5 · ❌ 1 · ❔ 0.

## Corrigido durante a verificação

- **Celular:** o cartão subia e cobria o começo da seção destacada.
- **Botão "rodar stats"** aparecia como "rodarstats" (espaço perdido em `inline-flex`).
- **Tema claro:** o botão principal (`.dash-btn--primary`) ficava ilegível com o mouse em cima.
  O bug era antigo (o `:hover` genérico trocava o fundo); o tour o expôs. Corrigido em
  `workspace.css`.
- **Aviso de segredo:** cobria o botão "Atalhos de teclado"; foi para o topo. Também deixou de
  existir como região `aria-live` nas páginas que não são do amigo (quebrava um teste do
  campo minado e era ruído para leitor de tela).
- **Mensagem final** das trilhas existia nos dados mas não aparecia em lugar nenhum (TR-21).

## Evidência

- `npm run lint` e `tsc --noEmit` limpos; `sweep.mjs`: varredura limpa; `contrast.mjs`: todos
  os pares passam AA.
- Testes das trilhas (4 arquivos, 54 testes), do comando e dos dados: passam. Nesta máquina a
  suíte completa fica lenta e instável quando há outros processos rodando (aqui havia vários
  de outro projeto); por isso os arquivos foram rodados em sequência.
- Capturas (1440×900 e 390×844): cartão e tour nos cinco temas, passo de terminal, conquistas
  do amigo, barra do cliente e do professor no celular: sem rolagem horizontal e sem erro de
  console.

## Não verificado

- Leitor de tela real; impressão em navegador; temas dracula e solarized a olho.
- Deploy real (`/r/<persona>` com o tour, em produção).
- A dica do passo "achar" (precisa de texto aprovado).

## Decisão pendente (TR-27)

O peso passou do teto que eu mesmo estimei. Opções: aceitar +5,5 kB gzip (cerca de 4% do JS
inicial; o ganho é a experiência guiada), ou carregar os dados das trilhas sob demanda
(trabalho extra: o cartão e o comando passam a esperar o carregamento). Sugestão: aceitar e
ajustar o teto do requisito para o valor medido.
