# Rascunho — estudo de caso: este portfólio

**Estado: rascunho para revisão da Duda. Não está no site.** Cada afirmação factual abaixo vem do repositório e tem a fonte entre parênteses. As partes marcadas com **[DUDA]** só você pode escrever; deixei candidatos reais (coisas que de fato aconteceram) só para ajudar a lembrar, não como texto final.

Estrutura (CE-08): problema · decisão · o que deu errado · o que aprendi.

## Problema

> **[DUDA]** confirme ou reescreva com as suas palavras.

Rascunho: um portfólio de estudante costuma ser uma lista de projetos e habilidades igual à de qualquer outro. Eu queria um site que mostrasse como eu penso (decidir arquitetura antes de codar) e não só o que eu fiz, em português e inglês, sem depender de bibliotecas de interface.

## Decisão

Fatos comprovados:

- **A home é um terminal e cada página é uma janela.** Rotas, seções e comandos leem de uma tabela única (`src/data/routes.ts`, `src/data/sections.ts`), então `ls`, `cd`, breadcrumb, autocompletar e sitemap nunca divergem.
- **Specification-Driven Development.** O site foi feito por feature: PRD, requisitos com critério de aceite, desenho, tarefas e status com evidência. Hoje são 10 features em `docs/specs/`, e nenhuma feature nova começou sem especificação aprovada.
- **Sem biblioteca de interface.** As dependências de produção são só React, React DOM e EmailJS (`package.json`). O roteador, o arrasto de janela, a paleta de comandos e o campo minado são código próprio.
- **Um só estilo visual.** Fonte monoespaçada única, cores só por tokens em `tokens.css`, sem degradê, e um teste (`contrast.test.ts`) que reprova qualquer cor abaixo de contraste AA em todos os temas.
- **Nada de dado inventado.** Conteúdo ausente vira "em construção" (como `/setup`), e a página fica fora do sitemap até ter texto.

Alternativas descartadas (documentadas em `docs/specs/*/design.md`): `Ctrl+K` continuar focando a barra, em vez de abrir uma paleta; migrar o estudo de caso do WhatsApp Dispatcher para um formato novo, o que perderia conteúdo.

Números (conferidos em 11/11/2026): 45 commits desde 31/10/2026, 34 arquivos de teste com 395 testes, cerca de 21 mil linhas em `src/`.

## O que deu errado

> **[DUDA]** escolha o que foi mesmo importante para você, ou escreva outro. Só as que você viveu contam.

Candidatos que o repositório registra:

1. **Os testes passaram, mas a tela estava errada.** Na revisão visual apareceram: o rodapé desenhado por cima da janela maximizada, o `neofetch` com texto sobreposto e um link do 404 no azul padrão do navegador. Nenhum teste automático pegava isso.
2. **Mudar um atalho quebrou um requisito antigo.** `Ctrl+K` deixou de focar a barra; isso contrariava o SH-05 e um teste. Só ficou claro porque a spec existia, e então a spec e o teste foram atualizados juntos.
3. **Um bug de estado do React.** Rodar `minas` duas vezes reaproveitava a partida anterior, porque o React reutiliza a instância do componente.
4. **Um erro só do Windows.** `minesweeper.ts` e `Minesweeper.tsx` colidiam por maiúsculas e minúsculas, e o TypeScript recusou compilar.
5. **Teste instável sob carga.** Um teste de diálogo passava sozinho e falhava na suíte completa, por causa do tempo de carregamento sob demanda.

## O que aprendi

> **[DUDA]** esta parte é sua por inteiro. Se quiser, responda só: "qual foi a decisão que mais te ensinou algo, e o quê?"

Candidatos (observações que o histórico sustenta, não conclusões suas):

- Escrever a especificação antes tornou **visíveis** as mudanças de comportamento (SH-05, `tema`), em vez de silenciosas.
- Teste automático e olhar humano pegam coisas diferentes; as duas verificações valeram.
- Trabalhar com IA em modo agêntico funcionou melhor com requisitos testáveis e critérios de "pronto" escritos de antemão.

## Próximo passo

Quando você aprovar ou corrigir o texto, eu crio o componente comum de estudo de caso (T-C2), publico em PT e traduzo para EN para você revisar.
