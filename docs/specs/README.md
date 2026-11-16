# Especificações por feature

Cada pasta segue o fluxo PRD → especificação → plano → tarefas → verificação, em arquivos separados. Quinze features cobrem o site atual; o assistente de IA foi removido do código na spec 001 (onda 1, fora do MVP); o código está na marca `arquivo/pre-remocao-fora-do-mvp`.

| Feature | Requisitos | Estado |
| --- | --- | --- |
| [Estilo único (terminal/IDE)](estilo-unico/status.md) | ES-xx | ✅ 9 · ◐ 1 · ❌ 0 · ❔ 0 |
| [Shell e navegação](shell-navegacao/status.md) | SH-xx | ✅ 10 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Sessão do terminal](sessao-terminal/status.md) | TS-xx | ✅ 8 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Comandos e conteúdo no terminal](comandos-terminal/status.md) | CM-xx | ✅ 5 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Descoberta das seções pelo terminal](descoberta-secoes/status.md) | DS-xx | ✅ 12 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Dados, ordem e competências](dados-e-ordem/status.md) | DT-xx | ✅ 4 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Qualidade e requisitos não funcionais](qualidade-nao-funcionais/status.md) | NF-xx | ✅ 4 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Aviso de visualização em celular](aviso-mobile/status.md) | MB-xx | ⛔ removido em 12/11/2026 (o site é feito para celular) |
| [SEO e descoberta em buscadores](seo/status.md) | SE-xx | ✅ 10 · ◐ 2 · ❌ 0 · ❔ 0 |
| [Experiência interativa e originalidade](experiencia-interativa/status.md) | PE/TB/JG/JA/CE-xx | ✅ 40 · ◐ 2 · ❌ 1 · ❔ 0 |
| [GitHub em números](github-stats/status.md) | GH-xx | ✅ 5 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Workspace: painel, barra lateral, Game Center](workspace/status.md) | WS-xx | ✅ 16 · ◐ 0 · ❌ 0 · ❔ 0 |
| [Personas (o site se adapta a quem visita)](personas/status.md) | PR-xx | código removido do site na spec 001 (ondas 3 e 4); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Home adaptativa por persona](personas-home/status.md) | HP-xx | código removido do site na spec 001 (ondas 3 e 4); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Projetos contextuais por persona](projetos-contextuais/status.md) | PP-xx | código removido do site na spec 001 (ondas 3 e 4); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Navegação contextual e trilhas nas páginas](navegacao-contextual/status.md) | NV-xx | código removido do site na spec 001 (ondas 3 e 4); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Experiências por persona](experiencias-persona/status.md) | EP-xx | código removido do site na spec 001 (ondas 3 e 4); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Busca e descoberta contextual](busca-contextual/status.md) | BC-xx | a ordenação por persona foi removida (spec 001, onda 4); a busca continua; código antigo guardado na marca `arquivo/pre-remocao-fora-do-mvp` |
| [Qualidade das personas (Fase 6)](qualidade-personas/status.md) | QA-xx | código removido do site na spec 001 (ondas 3 e 4); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Trilhas por persona (percurso guiado e gamificado)](trilhas/status.md) | TR-xx | código removido do site na spec 001 (ondas 3 e 4); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Espaço cultural `/pessoal` (livros, filmes, música, teatro)](personal/status.md) | CL-xx | ✅ 25 · ◐ 10 · ❌ 3 · ❔ 0 (Fase 1 com dados fictícios concluída; livros e filmes reais implementados, ainda sem validar com as contas;  [plano](personal/README.md), [checklist](personal/CHECKLIST.md)) |
| [Caderno — Vol. XI / 2026 (redesenho editorial)](caderno-vol-xi/status.md) | CD-xx | código removido do site na spec 001 (onda 2b, DQ-001); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |
| [Assistente de IA no terminal](assistente-ia/status.md) | IA-xx | código removido do site na spec 001 (onda 1); guardado na marca `arquivo/pre-remocao-fora-do-mvp` e na branch `archive/fora-do-mvp` |

Spec geral e análise de lacunas originais: `docs/sdd-terminal-v2/`. Estilo de escrita: skill `technical-writing`. Fluxo: skill `spec-driven-development`.
