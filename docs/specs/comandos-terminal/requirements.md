# Comandos e conteúdo no terminal

Inventário de comandos, ls/cd, acesso a qualquer seção, conteúdo completo lido dos dados e erros que não quebram.

Grupo de requisitos **CM-xx**. Escrito de forma retroativa a partir do código e dos testes em 09/11/2026: a spec original é `sdd-terminal-v2/requirements.md`, e esta pasta a organiza por feature.

Arquivos: [requirements.md](requirements.md) · [design.md](design.md) · [status.md](status.md) · [tasks.md](tasks.md)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| CM-01 | Inventário coerente | Nenhum nome ou apelido se repete; `ajuda` lista só comandos que existem e não esconde nenhum visível; os atalhos clicáveis são comandos reais | P0 | AUT |
| CM-02 | `ls`, `ls <página>`, `cd <página>`, `cd <página>/<seção>` | `ls` lista páginas com o número de seções; `ls <página>` lista as seções; `cd <página>` abre a página própria; `cd <página>/<seção>` abre na seção certa | P0 | AUT |
| CM-03 | `<página> <seção>` lê a seção no terminal | Aceita nome, apelido em inglês, número, barra, maiúsculas, acentos, `~`, `..`, aspas e espaços extras | P0 | AUT |
| CM-04 | Todo o conteúdo é legível no terminal | Para toda rota com seções, cada seção imprime seu conteúdo completo, lido de `src/data/*`, sem texto duplicado nem inventado | P0 | AUT |
| CM-05 | Erros nunca quebram | Argumento desconhecido devolve erro claro e amigável; nunca tela em branco nem exceção | P0 | AUT |
Nota de 11/11/2026 (feature [experiencia-interativa](../experiencia-interativa/requirements.md)): o inventário de CM-01 passou a incluir os comandos de personalidade, jogos e páginas novas (`neofetch`, `stats`, `git log`, `minas`, `jogos`, `atalhos`, `agora`, `setup`, ocultos como `matrix`, `cowsay`, `boot`, `rm`, `sair`), e `tema` agora aceita um nome (`tema dracula`, `tema ls`); sem argumento continua alternando claro/escuro. A evidência está no `status.md` daquela feature.

Seções por página (definidas em `src/data/sections.ts`): **curriculo** — resumo, competencias, experiencias, projetos, formacao, reconhecimentos; **academico** — linha-do-tempo, formacao, atividades, disciplinas; **servicos** — servicos, cases, faq, contato; **projetos** — um por projeto; **experiencias** — um por grupo.
