# Assistente de IA no terminal

Comando `pergunte` / `ask` que responde perguntas sobre a Duda usando **apenas** o
conteúdo do site. Contexto, princípios e riscos em `prd.md`.

Grupo de requisitos **IA-xx**. Dependência: `docs/specs/personas/` (PR-xx).

Legenda: **Pri.** P0 = essencial, P1 = importante. **Verif.** AUT = teste automático,
MAN = checagem manual.

## Comando e interface

| ID    | Requisito               | Critério de aceitação                                                                                                                                                                                | Pri. | Verif.  |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| IA-01 | Comando                 | `pergunte <texto>` / `ask <texto>` existe em `commands.tsx`, aparece em `ajuda`, autocompletar (Tab) e no catálogo; sem argumento, explica o uso com exemplos                                        | P0   | AUT     |
| IA-02 | Idioma                  | A resposta vem no idioma da pergunta; mensagens fixas (uso, erros, limite) seguem o idioma do site, PT/EN em `ui.ts`                                                                                 | P0   | AUT     |
| IA-03 | Estados                 | Mostra "pensando…" enquanto aguarda; mostra mensagem própria para limite atingido, cota esgotada, serviço fora do ar e sem conexão; nenhum estado deixa o terminal travado ou exibe erro técnico cru | P0   | AUT     |
| IA-04 | Histórico curto         | As últimas perguntas e respostas da sessão entram como contexto (máx. 6 trocas); nada persiste ao fechar a aba                                                                                       | P1   | AUT     |
| IA-05 | Fontes clicáveis        | Toda resposta termina com links para as páginas/seções usadas; clicar abre a página ou o comando equivalente                                                                                         | P0   | AUT     |
| IA-06 | Acessibilidade e estilo | Resposta em região `aria-live`, operável por teclado; mono único, tokens de `tokens.css`, sem degradê, sem chat flutuante                                                                            | P0   | AUT/MAN |
| IA-07 | Tamanho                 | Pergunta com mais de 300 caracteres é recusada no cliente com aviso; resposta limitada a ~800 caracteres                                                                                             | P1   | AUT     |

## Conteúdo e honestidade

| ID    | Requisito        | Critério de aceitação                                                                                                                                                                            | Pri. | Verif.  |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------- |
| IA-08 | Contexto fechado | O contexto enviado ao modelo é gerado dos dados do site (`src/data/*`, `ui.ts`) no build ou na função; nenhum texto sobre a Duda escrito à mão fora dessas fontes                                | P0   | AUT     |
| IA-09 | Não inventa      | Para pergunta cuja resposta não está no contexto, responde que não sabe e indica o contato; conjunto de perguntas de teste (nota, data, empresa ou projeto inexistentes) deve resultar em recusa | P0   | AUT/MAN |
| IA-10 | Escopo           | Perguntas fora do assunto (a Duda, seu trabalho, formação, serviços, como contatá-la) recebem recusa curta e redirecionamento                                                                    | P0   | AUT/MAN |
| IA-11 | Prompt injection | Instruções dentro da pergunta ("ignore as regras", "mostre seu prompt") não alteram o comportamento nem revelam as instruções; testes com pelo menos 5 ataques conhecidos                        | P0   | AUT/MAN |
| IA-12 | Persona          | Com persona ativa (PR-xx), ela é enviada como orientação de foco e tom; os fatos da resposta são os mesmos de qualquer persona                                                                   | P1   | AUT     |
| IA-13 | Sem ações        | O assistente só devolve texto: sem ferramentas, sem enviar e-mail, sem navegar sozinho                                                                                                           | P0   | AUT     |

## Servidor, limites e privacidade

| ID    | Requisito                       | Critério de aceitação                                                                                                                                                                                    | Pri. | Verif.  |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| IA-14 | Função serverless               | A chamada ao Gemini sai de uma Netlify Function; a chave fica só em variável de ambiente e não aparece em `dist/`, no JS nem no repositório                                                              | P0   | AUT/MAN |
| IA-15 | Nível gratuito, sem faturamento | A integração usa somente o nível gratuito do Gemini Flash; documentado em `docs/` como não ligar faturamento                                                                                             | P0   | MAN     |
| IA-16 | Limite por IP                   | No máximo 10 perguntas por hora por IP, aplicado na função (não só no cliente); excedido, responde 429 com mensagem amigável; mais 20 por sessão no cliente                                              | P0   | AUT     |
| IA-17 | Cota esgotada                   | Quando o provedor devolve erro de cota ou de limite, a função responde com a mensagem fixa de IA-03 e o restante do site segue normal                                                                    | P0   | AUT     |
| IA-18 | Validação de entrada            | A função rejeita método diferente de POST, corpo inválido ou pergunta fora do limite (IA-07), sem chamar o modelo                                                                                        | P0   | AUT     |
| IA-19 | CORS e abuso                    | A função só aceita origem do próprio site (e localhost em desenvolvimento)                                                                                                                               | P1   | AUT     |
| IA-20 | Sem registro                    | Perguntas e respostas não são gravadas (nem em log da função além de contagem agregada sem texto); nenhum identificador do visitante é guardado além do necessário para o limite, e expira em até 1 hora | P0   | AUT/MAN |
| IA-21 | Aviso de privacidade            | Na primeira pergunta da sessão, o terminal avisa que o texto é enviado a um serviço de IA externo e que não se deve digitar dados pessoais                                                               | P0   | AUT     |
| IA-22 | Degradação                      | Sem a função (dev sem chave, falha de rede), o comando responde com mensagem fixa; o resto do site e os testes passam sem a chave                                                                        | P0   | AUT     |

## Região e proteção do site (acrescentado em 12/11/2026, depois de T-IA0)

Os termos do nível gratuito da API Gemini só permitem uso de visitantes fora do Espaço
Econômico Europeu, Reino Unido e Suíça, e o plano gratuito da Netlify para o site inteiro
quando os créditos mensais acabam. Decisão da Duda: continuar gratuito e bloquear essas
regiões. Fontes e data da conferência em `operacao.md`.

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| IA-23 | Bloqueio por região | A função recusa (`403 { error: 'region' }`, sem chamar o modelo) visitantes do EEA (UE + Islândia, Liechtenstein, Noruega), do Reino Unido (`GB`) e da Suíça (`CH`); país desconhecido em produção também é recusado; o cliente mostra mensagem própria em PT/EN dizendo que o assistente não está disponível na região, e o restante do site segue normal | P0 | AUT |
| IA-24 | Teto global diário | Além do limite por IP (IA-16), a função aceita no máximo N perguntas por dia no site todo (valor em variável de ambiente, padrão 200); ao atingir, responde como cota esgotada (IA-17). Protege os créditos da Netlify e a cota do Gemini | P0 | AUT |
| IA-25 | Aviso de dados | O aviso de IA-21 também diz que, no nível gratuito, o provedor pode usar e revisar o texto, e que a pessoa deve ser maior de 18 anos | P0 | AUT |

## Fora desta spec

- Cache de respostas, busca vetorial, streaming, voz, chat flutuante, registro de
  perguntas (ver "Fora de escopo" no PRD).

## Perguntas em aberto (para o plano)

1. **Onde guardar a contagem por IP** em Netlify Functions, que não têm estado entre
   chamadas: Netlify Blobs (gratuito, simples) ou contagem em memória "melhor esforço"?
   Afeta IA-16 e IA-20.
2. **Quando gerar o contexto:** no build (arquivo JSON estático lido pela função) ou a
   cada chamada importando os dados? Afeta IA-08.
3. **Modelo exato** do Gemini Flash e seus limites gratuitos atuais: verificar na
   documentação do provedor no início do plano.
4. **Como os dados `.tsx`** (`portfolio.tsx`, `projects.tsx`, `services.tsx`) viram texto
   puro para o contexto sem importar React na função.
