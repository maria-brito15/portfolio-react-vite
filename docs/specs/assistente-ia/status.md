# Assistente de IA: estado

Código pronto e testado **sem rede e sem chave**. Falta o que só a Duda pode fazer (chave,
variáveis na Netlify, rodada de avaliação com o modelo real) e a conferência em um deploy.
Plano em `design.md`; operação em `operacao.md`; avaliação em `evals.md`.

| ID | Requisito | Estado |
| --- | --- | --- |
| IA-01 | Comando `pergunte`/`ask` | ✅ `extras/ask.tsx`; `ask.test.tsx` (Tab, ajuda, catálogo, uso com exemplos) |
| IA-02 | Idioma | ◐ mensagens fixas em PT/EN testadas; que a **resposta** venha no idioma da pergunta depende do modelo (regra 5 do prompt) e fica para `evals.md` |
| IA-03 | Estados | ✅ carregando, região, limite, cota, indisponível e sem conexão; `ask.test.tsx`, `services/ask.test.ts` |
| IA-04 | Histórico curto | ✅ 6 trocas, só em memória; `ask.test.tsx` ("a 2ª pergunta leva a 1ª") |
| IA-05 | Fontes clicáveis | ✅ o servidor descarta id inventado (`handle.test.ts`) e o cliente só aceita caminho do próprio site (`ask.test.ts`) |
| IA-06 | Acessibilidade e estilo | ◐ `aria-busy`, região `aria-live` do terminal, só classes e tokens existentes. **Falta** ver a saída no navegador com a função rodando |
| IA-07 | Tamanho | ✅ 300 caracteres recusados no cliente e no servidor; resposta limitada por regra e por corte (`handle.ts`) |
| IA-08 | Contexto fechado | ✅ `scripts/assistantContext.ts`; `assistantContext.test.ts` (todo projeto, curso, nota, experiência e contato aparece; sem marcação) |
| IA-09 | Não inventa | ◐ regras e perguntas-armadilha prontas (`askEvals.cases.ts`, testadas); **falta** a rodada com o modelo real |
| IA-10 | Escopo | ◐ idem |
| IA-11 | Prompt injection | ◐ prompt e delimitadores testados (`handle.test.ts`); 7 ataques prontos; **falta** a rodada com o modelo real |
| IA-12 | Persona | ✅ `askHint` entra no prompt só como foco; cliente envia a persona (`ask.test.tsx`, `handle.test.ts`) |
| IA-13 | Sem ações | ✅ sem `tools` no pedido; saída é texto puro (`handle.test.ts`, `ask.test.tsx`) |
| IA-14 | Função serverless e chave | ◐ função e testes prontos; `secrets.test.ts` prova que a chave não está em `src/`, `dist/` nem no repositório. **Falta** cadastrar a chave na Netlify e testar o deploy |
| IA-15 | Gratuito, sem faturamento | ◐ documentado em `operacao.md`; **falta** a Duda confirmar que o faturamento está desligado |
| IA-16 | Limite por IP | ✅ 10/h por IP, 429; `limiter.test.ts`. (20 por sessão no cliente: `ask.test.tsx`) |
| IA-17 | Cota esgotada | ✅ 429 do provedor vira `quota`; `handle.test.ts` |
| IA-18 | Validação de entrada | ✅ `handle.test.ts` (nada chega ao modelo) |
| IA-19 | Origem | ✅ só o site, a URL do deploy e localhost; `handle.test.ts` |
| IA-20 | Sem registro | ✅ chaves com hash + hora, apagadas ao virar a hora; nada de pergunta em log (`limiter.test.ts`, `handle.test.ts`) |
| IA-21 | Aviso de privacidade | ✅ na 1ª pergunta da sessão; `ask.test.tsx` |
| IA-22 | Degradação | ✅ sem chave, sem contexto, 404 ou rede caída: mensagem fixa; o site e os testes passam sem a chave |
| IA-23 | Bloqueio EEA/UK/CH | ◐ lista e recusa testadas (`handle.test.ts`). **Falta** conferir num deploy que `context.geo.country.code` chega como esperado |
| IA-24 | Teto global diário | ✅ `limiter.test.ts` |
| IA-25 | Aviso de dados e idade | ✅ texto do aviso; `ask.test.tsx` |

Contagem: ✅ 17 · ◐ 8 · ❌ 0 · ❔ 0.

## Evidência

- Suíte completa na última rodada antes de `T-IA6`: 46 arquivos, 561 testes passando, lint e
  `tsc --noEmit` limpos. Depois entraram os testes de `askEvals.cases` e `secrets` (passam).
- `npm run ask:eval` sem as variáveis: o executor é ignorado (5 testes offline passam, 18
  ao vivo ficam ignorados).

## Não verificado

- Nenhuma chamada real ao Gemini foi feita (não há chave); o formato do esquema de resposta
  (`responseSchema`) e o ID do modelo precisam ser confirmados na primeira rodada.
- A função não rodou na Netlify: falta conferir `included_files` (leitura do
  `context.json`), a geolocalização e o Blobs em um deploy de preview.
- Créditos da Netlify consumidos pelo Blobs.

## Próximos passos (precisam da Duda)

1. Criar a chave no AI Studio sem faturamento e ler o ID do modelo (`operacao.md`).
2. Cadastrar `GEMINI_API_KEY` e `GEMINI_MODEL` na Netlify e fazer um deploy de preview.
3. Rodar `npm run ask:eval` e ler as 18 respostas (`evals.md`).
4. Testar `pergunte` no preview, de um país fora do EEA/UK/CH, e de um dentro (deve recusar).
