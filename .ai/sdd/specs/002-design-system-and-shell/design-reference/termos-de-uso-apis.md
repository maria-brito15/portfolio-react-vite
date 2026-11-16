# Termos de uso das APIs — verificação (rascunho, 2026-11-15)

> **SUPERADO em 2026-11-15:** a Duda decidiu preencher Letterboxd, Hardcover e Spotify **manualmente**, sem API. Este arquivo vira **histórico**: os termos abaixo só importam se uma integração por API voltar ao escopo. O que continua valendo para conteúdo curado é a regra de imagens de terceiros (licença registrada na spec) em `.ai/sdd/PROPOSTA-pessoal-conteudo-curado.md`. A decisão "usar o TMDB com atribuição" registrada no fim deste arquivo também está superada (Q-P2).

**Estado:** rascunho de pesquisa. Não é aconselhamento jurídico e não aprova nada. Nenhum requisito que dependa de uma API pode ser escrito como "decidido" enquanto os itens marcados **NÃO CONFIRMADO** não forem conferidos por você nas páginas oficiais.

| API | O que li | Como li | Confiança |
| --- | --- | --- | --- |
| TMDB | Termos de 20/10/2023 | Página oficial lida | Confirmado |
| Spotify | Developer Terms v10 (15/05/2025) e aviso de fev/2026 | Páginas oficiais lidas | Confirmado nos termos; endpoints **NÃO CONFIRMADO** |
| Letterboxd | API só por pedido, sem acesso para projetos pessoais | Busca (a página devolveu 403 na leitura direta) | **NÃO CONFIRMADO** na fonte |
| Hardcover | Sem termos oficiais encontrados | Busca; só fontes da comunidade (a página oficial devolveu 403) | **NÃO CONFIRMADO** |

## TMDB (pôsteres e metadados de filmes) — confirmado
- Licença **sem uso comercial**: "does not permit any commercial use". O TMDB decide o que é comercial; usar o TMDB "para gerar tráfego ou receita para um site" é citado como exemplo comercial. **Dúvida aberta:** um portfólio usado para conseguir estágio conta como comercial? Só o TMDB responde.
- **Atribuição obrigatória:** logotipo do TMDB (menos destacado que a sua marca) e um aviso visível dizendo que o site usa o TMDB e não é endossado por ele.
- **Cache no máximo 6 meses.** Dado do TMDB guardado há mais que isso viola os termos. Isso afeta qualquer cópia ou snapshot guardado no repositório.
- Proibido fazer "derivados" do conteúdo; o texto não define o termo, então cortar ou editar pôsteres é risco.
- O TMDB pode encerrar a licença a qualquer momento.

## Spotify (música) — termos confirmados, endpoints não
- A licença é para "private personal use". **Dúvida aberta:** exibir publicamente o seu "mais ouvidos" a visitantes cabe nisso? Os termos não dizem. Só o Spotify responde.
- "Não armazene conteúdo do Spotify indefinidamente"; o dado exibido deve ser "o mais atual disponível"; capa e metadados só podem ser guardados em cache temporário, "estritamente necessário" para o desempenho. Isso **conflita com guardar cópia estática** no site e pede cache curto e renovado.
- Capa e metadados podem ser redimensionados, mas **não alterados** (sem filtros nem sobreposições).
- Proibido sugerir parceria ou endosso e usar a marca Spotify no nome do serviço; seguir as Branding Guidelines (não lidas).
- O token fica só no servidor.
- Modo de desenvolvimento (o único possível para uma pessoa física desde maio/2025): exige conta **Premium** do dono, 1 Client ID e até **5 usuários autorizados**; o app para de funcionar se o Premium acabar. O acesso estendido exige empresa registrada e 250 mil usuários ativos por mês.
- Fev/2026: o acesso fica limitado a "um conjunto menor de endpoints". **NÃO CONFIRMADO** se "mais ouvidos", "tocada recentemente", "tocando agora" e playlists continuam disponíveis: a página não os nomeia. É a primeira coisa a conferir antes de qualquer requisito de Música.

## Letterboxd (diário de filmes) — não confirmado na fonte
- Segundo a busca, a página de API diz que o acesso é só por pedido e que não concede para "projetos privados ou pessoais". Para esse caso ela aponta o **feed RSS** do perfil (entradas do diário, resenhas e listas).
- Segundo a busca, os termos proíbem extração automática ("scrapers") sem autorização. O RSS é o caminho mais seguro; o código atual (`netlify/personal/letterboxd.ts`) já o usa, e há importação de CSV.
- Metadados de filme (elenco, sinopse) o próprio Letterboxd manda buscar no TMDB. Ou seja, pôster e metadados dependem dos termos do TMDB acima.
- **Você precisa abrir** https://letterboxd.com/api-beta/ e https://letterboxd.com/terms e confirmar o texto.

## Hardcover (livros) — não confirmado
- Não achei termos oficiais. Fontes da comunidade (não oficiais) dizem: GraphQL com token pessoal, limite de **60 requisições por minuto**, a API está em **beta** e pode quebrar, e imagens enviadas por usuários exibidas em público exigem uma política de remoção por DMCA.
- Nada disso é confirmado. O código atual já usa o Hardcover no servidor, com cache.

## O que isso muda nos requisitos (sem decidir por você)
1. Nada que dependa de TMDB, Hardcover, Spotify ou do Letterboxd vira requisito "Must" até você conferir as fontes oficiais; até lá, são requisitos **condicionais** (marcados "bloqueado pela verificação") e as telas mostram só os cartões cinzas de exemplo.
2. Qualquer requisito de cache precisa de um **prazo máximo declarado**, porque TMDB (6 meses) e Spotify ("não indefinido", dado atual) limitam o que se guarda.
3. O requisito "sem capa ou pôster externo antes da verificação" (princípio 5 do steering) continua valendo para os quatro serviços.

## Fontes
- https://www.themoviedb.org/api-terms-of-use
- https://developer.spotify.com/terms
- https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security
- https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- https://letterboxd.com/api-beta/ (via busca; leitura direta bloqueada)
- https://letterboxd.com/terms (via busca; leitura direta bloqueada)
- Hardcover: sem fonte oficial lida; fontes da comunidade citadas por busca

## Decisão da Duda sobre o TMDB (2026-11-15)
A Duda escolheu **usar o TMDB com atribuição** (logotipo e aviso de não endosso). **Risco aceito por ela:** o TMDB decide o que é uso comercial e um portfólio para conseguir estágio pode ser enquadrado como tal; a licença pode ser revogada a qualquer momento. Condições que a spec 008 deve cumprir: atribuição visível, cache de no máximo 6 meses, nenhuma edição das imagens. Esta decisão não elimina a pergunta ao TMDB; apenas escolhe o caminho padrão.
