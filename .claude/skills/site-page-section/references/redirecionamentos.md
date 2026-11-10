# Redirecionamentos de links antigos (SH-10, T-L1/T-L2 do SDD)

Links antigos do tipo `/#sobre`, `/#habilidades`, `/#projetos`, `/#experiencias`, `/#contato`
existem em currículos, LinkedIn e e-mails. Não podem cair na home vazia.

Regras:
1. Tabela única `legacyHashes` (em `routes.ts` ou módulo ao lado): `{ '#sobre': { page: 'curriculo', section: 'resumo' }, … }`.
2. Ao montar a home, se `location.hash` está na tabela: `history.replaceState` para a URL nova e, se couber, executar o comando equivalente **sem** carregamento teatral.
3. Hash desconhecido: ignorar (nunca erro).
4. Teste: para cada entrada, `renderApp('/#sobre')` termina em `/curriculo` com a seção certa; hash inválido continua na home.
5. Ao remover uma rota, adicione o antigo caminho a essa tabela no mesmo commit.
6. `netlify.toml`/`vercel.json` já reescrevem para `index.html`: não é preciso redirect de servidor para hash.
