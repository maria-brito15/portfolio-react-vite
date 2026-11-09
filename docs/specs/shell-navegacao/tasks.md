# Tarefas — Shell e navegação

Tarefas que cumprem requisitos **SH-xx**. Ordem e dependências no plano geral: `docs/sdd-terminal-v2/tasks.md`.

| Tarefa | Descrição | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-L1 | 💻 Mapear hashes antigos (`#sobre`, `#habilidades`, `#projetos`, `#experiencias`, `#contato`, mais os ids em inglês de `/en`) para a página própria equivalente e redirecionar no cliente (`replaceState`, sem empilhar histórico) | SH-10 | — | Teste: abrir `/#projetos` leva a `/projetos` e o botão Voltar não volta ao link antigo; hash desconhecido não redireciona |
| T-L2 | 📝 Registrar no README que as seções da home viraram páginas e que os links antigos redirecionam | SH-10, NF-04 | T-L1 | README atualizado |
| T-A7 | 🔎 Rodar a varredura de 11 rotas × 390/768/1440 (rolagem horizontal e console) e o fluxo `curriculo` → `2` → `proximo` → `cd curriculo` | SH-06, NF-02 | T-D9 | Sem rolagem horizontal e sem erro de console |
