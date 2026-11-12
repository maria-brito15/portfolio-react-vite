# Assistente de IA: tarefas

Uma tarefa por commit; a mensagem leva o ID. Plano em `design.md`.

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-IA0 | ✅ feito em 12/11/2026: termos, limites e Blobs conferidos; resultado em `operacao.md` (EEA/UK/CH bloqueados, teto global, pendências da Duda) | IA-15, IA-16, IA-20 | — | `operacao.md` cita fonte e data |
| T-IA1 | Plugin `assistantContext.ts`: dados do site → `context.json` por seção (`toText` para JSX) | IA-08 | — | Teste: toda página, projeto e seção aparece; sem tags; PT e EN; build falha com aviso se passar do limite |
| T-IA2 | Função `ask.mts` + `lib/`: validação, origem, prompt, chamada ao Gemini, fontes validadas, erros; `[functions]` no `netlify.toml` | IA-13, IA-14, IA-17, IA-18, IA-19, IA-23 | T-IA0, T-IA1 | Testes com `fetch` simulado: entrada inválida não chama o modelo; cota vira `quota`; fonte inventada é descartada; sem chave vira `down` |
| T-IA3 | Limite por IP com Blobs (reserva em memória) e política de não registrar | IA-16, IA-20, IA-24 | T-IA2 | Teste: 11ª pergunta na hora dá 429; chave expira com a hora; nenhum texto de pergunta em log |
| T-IA4 | `src/services/ask.ts` tipado | IA-02, IA-03, IA-07, IA-22 | T-IA2 | Testes: cada `error` vira estado; rede caída → `offline`; 404 em dev → `down`; >300 caracteres nem sai |
| T-IA5 | Comando `pergunte`/`ask` + `AskAnswer`: estados, fontes clicáveis, histórico (6), contador (20), aviso de privacidade, persona, `catalog.ts`, `ui.ts` | IA-01, IA-02, IA-03, IA-04, IA-05, IA-06, IA-12, IA-21, IA-25 | T-IA4 | Teste: replay não chama a rede; aviso só na 1ª pergunta; saída em `aria-live`; link de fonte abre a página; `ajuda` e Tab listam o comando |
| T-IA6 | `askEvals.ts` e `evals.md`; rodar com o modelo real | IA-09, IA-10, IA-11 | T-IA2 | Todas as perguntas "não sei", fora de escopo e os 5+ ataques passam; resultado registrado em `status.md` |
| T-IA7 | Publicação: chave `GEMINI_API_KEY` na Netlify, `.gitignore`, varredura do `dist/` sem a chave, `operacao.md` final, `/verify-site`, `status.md`, linha no `README.md` das specs | IA-14, IA-15, IA-06 | T-IA5, T-IA6 | Build sem a chave no `dist/`; preview do deploy responde; faturamento desligado, confirmado pela Duda |

Dependência opcional: T-IA5 usa a persona (IA-12) quando `personas` já estiver pronto; sem
ela, o campo `persona` simplesmente não é enviado.

Ordem sugerida: T-IA0 → T-IA1 → T-IA2 → T-IA3 → T-IA4 → T-IA5 → T-IA6 → T-IA7.
