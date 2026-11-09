# Dados, ordem e competências

Ordem das atividades e disciplinas, timeline de projetos crescente, semestres em placeholder e tempo por competência.

Grupo de requisitos **DT-xx**. Escrito de forma retroativa a partir do código e dos testes em 09/11/2026: a spec original é `sdd-terminal-v2/requirements.md`, e esta pasta a organiza por feature.

Arquivos: [requirements.md](requirements.md) · [design.md](design.md) · [status.md](status.md) · [tasks.md](tasks.md)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| DT-01 | Atividades por ano, mais recentes primeiro | Anos em ordem decrescente e, dentro do ano, `02/2026` antes de `01/2026`, que vem antes de `02/2025`; item sem mês depois dos que têm mês | P0 | AUT |
| DT-02 | Timeline de projetos continua crescente | Planoriza → EcoShop → projetos de 2026 (teste existente sem alteração) | P0 | AUT |
| DT-03 | Disciplinas e notas | Quatro semestres como placeholder (01/2025, 02/2025, 01/2026 em Ciência da Computação; 02/2026 em Engenharia de Software, em andamento), do mais recente ao mais antigo, sem nota ou disciplina inventada; carga horária e média aparecem sozinhas quando houver dados | P0 | AUT |
| DT-04 | Competências com tempo | O tempo de cada tecnologia vem do primeiro projeto/curso datado que a usa; sem origem datada, não mostra tempo | P1 | AUT |
