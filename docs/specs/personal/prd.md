# PRD — Espaço cultural (`/pessoal`)

## Problema

O portfólio mostra a Duda como engenheira de software, mas não mostra quem ela é fora do
código. Quem visita como amiga(o), professor(a) ou curioso(a) não encontra o que ela lê,
assiste, ouve e vê no teatro. E o site, com tantas páginas de trabalho, perde a chance de
mostrar repertório e cuidado editorial.

## Objetivo

Um espaço cultural dentro do portfólio, com a cara de uma **pequena publicação editorial**,
não de um painel: um hub `/pessoal` e quatro páginas (Livros, Filmes, Música, Teatro). Os
dados atualizam sozinhos quando a fonte permite (Hardcover, Letterboxd) e são curados à
mão quando não permite (música, teatro).

## Decisões já tomadas com a Duda (13/11/2026)

Detalhe e justificativa em `README.md`, seção 11.

1. Rota `/pessoal` (alias `/personal`); estilo mono do portfólio, sem serifa; títulos de seção em peso 700.
2. Capas de livros do Hardcover; pôsteres de filmes do TMDB, com atribuição; sem imagem = placeholder tipográfico.
3. Música e teatro manuais.
4. `amigo` e `professor` destacam o espaço na home; ninguém perde acesso.
5. Listas no HTML estático (pré-renderização no build + rebuild agendado, pois o site é SPA sem ISR).
6. Resenhas do Letterboxd com limite (~400 caracteres) e `publish: false` por entrada.
7. Atualização: Hardcover 6 h, Letterboxd 1 h, TMDB permanente por filme; "última sincronização" visível.
8. **Mock primeiro:** a Fase 1 entrega a interface inteira com dados fictícios tipados, atrás da mesma interface do cliente real; as integrações entram depois trocando só a camada de serviço.

## Fora do escopo

- Scraping de qualquer site; API privada do Letterboxd; Spotify ou Last.fm.
- Backend separado (usa Netlify Functions e Blobs já presentes).
- Comentários, curtidas, contas, player de música embutido.
- Qualquer dado sobre a Duda que ela não tenha fornecido ou que não venha das fontes dela.

## Princípios (não negociáveis)

1. **Nada de dado inventado.** Mock é fictício, rotulado e impedido de ir à produção.
2. **Um só estilo visual.** Mono único, tokens de `tokens.css`, sem degradê.
3. **Dois idiomas.** Interface em PT e EN; títulos de obras não se traduzem.
4. **Rota e seção em um só lugar** (`routes.ts`); o resto lê dali.
5. **Resiliência.** Se uma fonte cair, a página continua com o último dado conhecido e diz de quando é.
6. **Segredo só no servidor.** Nenhum token no bundle; nada com prefixo `VITE_`.

## Critérios de sucesso

- Cinco páginas navegáveis em PT e EN, em 1440 px e 390 px, nos cinco temas, com contraste AA.
- Fase 1: nenhuma chamada de rede para dados culturais; badge de dados fictícios sempre visível; build de produção recusa mock.
- Fases 2 a 4: filmes e livros reais atualizam sozinhos; a primeira pintura nunca fica vazia; "última sincronização" correta.
- Nenhuma regressão: personas, trilhas, busca, SEO e assistente continuam passando.

## Riscos

Resumo; completo em `README.md` seção 10: API do Hardcover em beta e ainda não verificada
(exige token); RSS do Letterboxd limitado a ~50 itens; termos de reuso de imagens; custo de
build do rebuild agendado; conflito de linguagem editorial com a regra de estilo único.
