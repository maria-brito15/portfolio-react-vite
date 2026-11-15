# Portfólio da Duda
Portfólio de engenharia no formato "Letterboxd para projetos" (com filmes e livros em segundo plano). Contexto completo: @.ai/steering/product.md

## Stack
Resumo e motivos: @.ai/steering/tech-stack.md. Leia antes de decisão técnica.

## Fluxo de desenvolvimento
Este projeto usa Spec-Driven Development. Cada feature tem uma spec em `.ai/sdd/specs/NNN-nome/`.
1. Leia o `.status` da feature ANTES de implementar. Ele é a única fonte de verdade da aprovação.
2. Nunca escreva código antes de `tasks:approved`. Só a Duda promove `*:draft` para `*:approved`.
3. Ambiguidade: PARE e pergunte. A resposta volta para a spec antes do código.
4. Corrija a spec, não só o código. Nunca mude spec aprovada em silêncio.
5. Contexto: @.ai/steering/conventions.md e @.ai/steering/principles.md. Painel: @.ai/sdd/INDEX.md (não é fonte de verdade).

## Regras de toda sessão
- Verificação com evidência: comando, exit code, resumo, veredito. "Funciona" não é evidência.
- Conteúdo é dado tipado e validado, nunca texto fixo em componente. Nada de dado inventado.
- Texto de interface em PT e EN. Sem segredo no cliente nem no repo.
- Na dúvida se algo está no escopo, não está.
- Sem `git push`: tudo fica local na `main` até a Duda pedir.
