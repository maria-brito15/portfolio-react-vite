# Stack
**Estado:** aprovado pela Duda em 2026-11-15 · Versões só como major; as exatas vivem em `package-lock.json`. Cada item traz o motivo.

## Escolhas
- **React 19** porque a stack atual foi mantida por decisão da Duda (V-D-014) e a base de componentes e testes é reaproveitável.
- **Vite 6** porque já faz build rápido (9 s medidos na auditoria) e tem plugin próprio para gerar o HTML de cada rota (`scripts/seoPlugin.ts`).
- **TypeScript 6, modo estrito** porque o conteúdo é tipado e os erros de dado devem aparecer no `typecheck`, não em produção.
- **Roteador próprio (History API)** porque o site tem poucas páginas e a auditoria não achou motivo para uma biblioteca. Reavaliar na spec 002 se os URLs por idioma complicarem.
- **CSS puro com tokens** porque não há biblioteca de UI hoje e a regra de contraste é mais fácil de testar com uma fonte única de tokens.
- **Vitest 5 + Testing Library** porque já cobrem 1060 testes que passam. Dívida: a suíte leva 638 s e tem 5 falhas; precisa ficar rápida e verde para ser o gate.
- **Playwright** para o fluxo ponta a ponta e as capturas de acessibilidade.
- **ESLint 9 + Prettier 3** porque o `verify` exige lint com zero avisos e formatação checada.
- **@emailjs/browser** porque envia o formulário de contato sem backend próprio. Os três IDs são públicos por natureza do SDK.
- **Netlify (Functions + Blobs)** porque o host e as variáveis já existem sem custo novo (V-D-013). As Functions de livros e filmes guardam cache em Blobs.

## Fontes de dados externas (a verificar)
Hardcover (livros), Letterboxd RSS e TMDB (filmes) já estão integrados. **Os termos e a atribuição vigentes ainda NÃO foram verificados para o uso novo.** Ficam como pendência da spec de filmes e livros; sem isso, nenhuma capa ou pôster externo é exibido. Nunca fazer hotlink de imagem de terceiro.

## Pendências de decisão
- Ferramenta de analytics sem cookies (Plausible, Umami ou métricas do Netlify) e o custo.
- Tipografia e paleta da identidade nova (spec 002). As fontes Fraunces e JetBrains Mono atuais são só ponto de partida.
- Gerador de HTML por rota: manter o plugin atual ou trocá-lo, e confirmar que o conteúdo principal funciona sem JavaScript (não medido na auditoria).

## Dependências desatualizadas
eslint 10, vite 8, typescript 7, vitest e jsdom já têm major novo. Não atualizar sem spec: atualização é mudança com risco, não faxina.
