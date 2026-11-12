# Assistente de IA: operação

Notas de operação e o resultado de **T-IA0** (conferência de termos e limites).

## T-IA0: conferido em 12/11/2026

Fontes: `aistudio.google.com/docs/terms`, `aistudio.google.com/docs/rate-limits`,
`docs.netlify.com/blobs/overview/`, páginas de preço da Netlify. As páginas foram lidas por
um resumidor automático; **antes de publicar, a Duda deve ler o trecho original dos termos**.

| Assunto | O que a documentação diz | Efeito |
| --- | --- | --- |
| Uso dos dados (Gemini gratuito) | O Google usa o conteúdo enviado e as respostas para melhorar seus serviços; revisores humanos podem ler, sem ligar à conta ou chave | Aviso de privacidade obrigatório (IA-21, IA-25) |
| Região | Só serviços pagos para clientes que atendem usuários no EEA; o mesmo vale para Reino Unido e Suíça | Bloqueio por região (IA-23) |
| Idade | Maiores de 18 anos; o cliente não pode ser voltado a menores | Aviso (IA-25) |
| Limites do Flash gratuito | **Não confirmados**: a página de limites não listou as cotas do Flash gratuito e remeteu ao painel do AI Studio | Ver pendência abaixo |
| Nome do modelo | A página citou nomes de exibição (2.5 Flash, 3.x Flash…), não IDs de API | Ler o ID no AI Studio; fica em `GEMINI_MODEL` |
| Netlify Blobs | Disponível em todos os planos, consome o pool mensal de créditos (300 no gratuito); sem TTL; consistência eventual; sem preço próprio publicado | Expiração feita à mão (IA-20); contagem aproximada |
| Plano gratuito da Netlify | Limite rígido de 300 créditos; o site pode ser pausado ao esgotar | Teto global diário (IA-24) |

## Pendências para a Duda (não dá para fazer por ela)

1. Criar a chave no Google AI Studio **sem ativar faturamento** e confirmar lá o ID do modelo
   Flash disponível no nível gratuito e as cotas (RPM/RPD) mostradas para a sua conta.
2. Cadastrar na Netlify as variáveis `GEMINI_API_KEY`, `GEMINI_MODEL` e (opcional)
   `ASK_DAILY_CAP`.
3. Conferir no painel da Netlify (Usage & billing) quantos créditos o site já usa.

## Desenvolvimento local

`npm run dev` (Vite) não executa funções: o comando `ask` responde "serviço indisponível"
(IA-22). Para testar de verdade: `npx netlify dev` com as variáveis em um `.env` local
(**ignorado pelo git**).
