# PRD — Assistente de IA no terminal

## Problema

Mesmo com a lente de personas, a pessoa ainda precisa navegar para achar uma
resposta específica ("ela já trabalhou com TypeScript?", "qual a nota em Banco
de Dados?", "está disponível para estágio?"). Um assistente que responde em
linguagem natural encurta esse caminho e mostra, na prática, domínio de
integração com IA.

## Objetivo

Um comando de terminal (`pergunte "..."` / `ask "..."`) que responde perguntas
sobre a Duda **usando apenas o conteúdo do próprio site** (`src/data/*`,
`src/i18n/ui.ts`), no idioma da pergunta, citando de onde veio cada afirmação
e levando à página correspondente. Se a informação não estiver no site, diz que
não sabe e sugere o contato.

## Princípios (não negociáveis)

1. **Nada inventado.** Só afirma o que está no conteúdo fornecido. Sem
   resposta no conteúdo → "não sei" + caminho de contato. É a regra do projeto
   (`content-integrity`) aplicada à IA.
2. **A chave nunca vai para o navegador.** Chamada ao modelo passa por uma
   função serverless (Netlify Functions, host atual).
3. **Custo zero.** Usa o nível gratuito do Gemini Flash; nunca ligar
   faturamento. Limite por visitante e respeito à cota do provedor; ao
   estourar, o comando degrada para mensagem fixa, sem erro quebrado.
4. **Mesmo estilo.** É um comando do terminal, não um chat flutuante; saída em
   mono, tokens de `tokens.css`, sem degradê.
5. **Usa a persona.** Se houver persona escolhida, ela orienta tom e foco da
   resposta (ex.: `tech` recebe link para projeto e código), sem mudar fatos.

## Escopo

1. Comando `pergunte` / `ask` com histórico curto da sessão (sem persistir).
2. Função serverless que monta o contexto a partir dos dados do site, chama o
   modelo e devolve a resposta.
3. Resposta com fontes: links clicáveis para as páginas/seções usadas.
4. Recusa de perguntas fora do assunto (política de escopo: só sobre a Duda,
   seu trabalho e como contatá-la) e resistência a prompt injection.
5. Estados: carregando, limite atingido, serviço fora do ar, sem conexão.
6. PT/EN; acessível por teclado e leitor de tela (saída em `aria-live`).
7. Privacidade: aviso curto de que a pergunta é enviada a um serviço externo
   (modelo de IA); decisão sobre registrar ou não as perguntas (ver abertas).

## Fora de escopo

- Chat flutuante, avatar, voz, streaming de áudio.
- Memória entre visitas, conta de usuário.
- Ações fora de responder (enviar e-mail, agendar, editar o site).
- Treinar ou ajustar modelo; busca vetorial na v1 (o conteúdo do site cabe no
  contexto; reavaliar se crescer).

## Dependências

- `docs/specs/personas/` (persona como entrada opcional do assistente).
- Netlify Functions e variável de ambiente com a chave do provedor.

## Riscos

| Risco | Mitigação prevista |
| --- | --- |
| Alucinação (inventar nota, data, projeto) | Contexto fechado, instrução de recusa, resposta com fontes, conjunto de perguntas de teste que devem dar "não sei" |
| Prompt injection pela pergunta | Contexto e instruções separados da entrada; sem ferramentas nem ações; saída tratada como texto |
| Abuso / cota gratuita esgotada | Limite por IP, tamanho máximo da pergunta e da resposta, mensagem fixa quando a cota acabar |
| Vazamento de dado pessoal | O contexto usa só o que já é público no site |
| Dependência de serviço externo | Degradação graciosa; o site funciona 100% sem o assistente |

## Decisões já tomadas com a usuária

1. Provedor: **Gemini Flash, nível gratuito** (a versão exata do modelo é
   confirmada no plano, pois nomes e cotas mudam).
2. Custo: **gratuito**, sem faturamento; a cota do provedor é o teto.
3. Perguntas **não são registradas** na v1.
4. Limite: **10 perguntas por hora por IP**.

## Riscos específicos do nível gratuito

- A cota gratuita é pequena e compartilhada por todos os visitantes: o
  assistente precisa degradar bem quando ela acabar.
- No nível gratuito, o provedor pode usar as perguntas para melhorar seus
  produtos. Por isso o aviso de privacidade (escopo 7) é obrigatório e a
  pessoa não deve digitar dados pessoais.
- Disponibilidade e termos do nível gratuito variam por região e mudam com o
  tempo: verificar antes de implementar.

## Premissas assumidas (corrija se discordar)

- Sem cache de respostas na v1 (reavaliar se a cota apertar).
- Limite adicional de 20 perguntas por sessão (aba).
