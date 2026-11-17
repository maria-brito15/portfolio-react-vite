# Stack
**Estado:** aprovado pela Duda em 2026-11-15 · Versões só como major; as exatas vivem em `package-lock.json`. Cada item traz o motivo.

## Escolhas
- **React 19** porque a stack atual foi mantida por decisão da Duda (V-D-014) e a base de componentes e testes é reaproveitável.
- **Vite 6** porque já faz build rápido (9 s medidos na auditoria) e tem plugin próprio para gerar o HTML de cada rota (`scripts/seoPlugin.ts`).
- **TypeScript 6, modo estrito** porque o conteúdo é tipado e os erros de dado devem aparecer no `typecheck`, não em produção.
- **Roteador próprio (History API)** porque o site tem poucas páginas e a auditoria não achou motivo para uma biblioteca. Reavaliar na spec 002 se os URLs por idioma complicarem.
- **CSS puro com tokens** porque não há biblioteca de UI hoje e a regra de contraste é mais fácil de testar com uma fonte única de tokens.
- **Vitest 5 + Testing Library** porque já cobrem 1418 testes. Medido sozinho (spec 001, anexo de evidências): a suíte leva 322 s, e as falhas aparecem só sob carga; com `pool: 'vmThreads'` caiu para 91 a 112 s sem falhas. Orçamento aprovado: suíte ≤ 90 s e `verify` ≤ 180 s, com a suíte completa verde três vezes seguidas.
- **zod (só `devDependency`)** porque valida o conteúdo na geração do site e na suíte e nunca vai ao navegador (spec 001, TD-001). Já estava no lockfile.
- **Playwright** para o fluxo ponta a ponta e as capturas de acessibilidade.
- **ESLint 9 + Prettier 3** porque o `verify` exige lint com zero avisos e formatação checada.
- **@emailjs/browser** porque envia o formulário de contato sem backend próprio. Os três IDs são públicos por natureza do SDK.
- **Netlify** porque o host e as variáveis já existem sem custo novo (V-D-013). O Netlify publica a partir da `main`. As Functions e o `@netlify/blobs` só continuam até a spec 008, que remove o código de API do `/pessoal` (ver abaixo); depois disso o site não tem nenhuma Function.

## Dados de filmes, livros e música: conteúdo curado, sem API
Decisão da Duda (2026-11-15): Letterboxd, Hardcover e Spotify são preenchidos **manualmente**, em arquivos de conteúdo validados pelos schemas da spec 001. Não há integração com API, token, OAuth, cache de servidor nem Function. O importador do CSV do Letterboxd continua só como ferramenta offline em `scripts/`. **Nunca fazer hotlink de imagem de terceiro**: imagem de terceiros só com licença registrada na spec; o padrão de capa é um bloco tipográfico colorido. O código de API atual sai com a spec 008 (`.ai/sdd/PROPOSTA-pessoal-conteudo-curado.md`).

## Pendências de decisão
- Ferramenta de analytics sem cookies (Plausible, Umami ou métricas do Netlify) e o custo.
- Tipografia da identidade nova (spec 002, DQ-003): candidatas IBM Plex Sans (interface) e IBM Plex Mono (metadados, datas, código), sujeitas ao teste de peso de fonte. Fraunces e JetBrains Mono saem com o Caderno. A paleta e os tokens estão propostos no `design.md` da 002.
- Gerador de HTML por rota: manter o plugin atual ou trocá-lo, e confirmar que o conteúdo principal funciona sem JavaScript (não medido na auditoria).

## Dependências desatualizadas
eslint 10, vite 8, typescript 7, vitest e jsdom já têm major novo. Não atualizar sem spec: atualização é mudança com risco, não faxina.
