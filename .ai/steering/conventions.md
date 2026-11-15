# Convenções
**Estado:** aprovado pela Duda em 2026-11-15 · Só o que o linter não pega.

## Comando de verificação
`npm run verify` (a criar na spec 001) roda, nesta ordem: `prettier --check`, `eslint . --max-warnings 0`, `tsc --noEmit`, `vitest run`, `vite build`. Hoje só existem os passos soltos; o `verify` ainda não existe.

## Conteúdo
- Projetos, casos, experiências, filmes, livros e entradas de diário vivem em `src/content/`, tipados e validados por schema. Componente nenhum guarda texto de conteúdo.
- Rota e seção existem só em `src/data/routes.ts` e `sections.ts`; o resto lê dali.
- Datas: o mês só entra quando a Duda confirmou. Cada item mostra o que tem: sem mês, só o ano; com mês confirmado, mês e ano. A ordem entre itens do mesmo ano é marcada como indeterminada quando algum deles não tem mês ou quando os meses são iguais (spec 001, FR-013).
- Todo texto de interface e todo conteúdo nos dois idiomas, com teste de paridade.

## Imagens e ativos
Toda imagem tem `alt` com sentido e largura e altura explícitas. Todo ativo externo tem licença e atribuição registradas. Fotos de pessoas só se forem dela.

## Specs e evidência
- Pasta por feature em `.ai/sdd/specs/NNN-nome/`; o número vem do sistema de arquivos (maior prefixo + 1).
- IDs estáveis: US-001, FR-001, NFR-001, D-001, TD-001, Q-001, T1, T1.1. Os IDs de uma spec (US, FR, NFR, D, TD, Q) são locais a ela; decisões da visão são V-D-NNN e perguntas do plano são P-Q-NNN.
- Todo fechamento de tarefa leva um bloco de evidência: Claim, Command, Exit code, Summary, Verdict.
- Commits em português, no formato `tipo(escopo): resumo`, citando o ID da tarefa. Sem `git push` sem pedido explícito.

## Testes
Testes ficam dentro de cada tarefa. Teste de página inteira só quando o comportamento não cabe num teste de unidade; a suíte tem orçamento de tempo (definido na spec 001).
