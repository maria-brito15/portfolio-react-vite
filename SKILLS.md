# Skills do projeto

Onze skills em `.claude/skills/`. Cada uma aparece sozinha quando o pedido combina com a descrição; a coluna "Chamar" diz se também dá para usar pelo nome.

## Engenharia e especificação

| Skill                      | Quando usar                                                  | Chamar                      |
| -------------------------- | ------------------------------------------------------------ | --------------------------- |
| `requirements-engineering` | levantar e validar requisitos antes de desenhar ou codificar | `/requirements-engineering` |
| `software-architecture`    | comparar desenhos, decidir e registrar ADR                   | `/software-architecture`    |
| `spec-driven-development`  | fluxo PRD → especificação → plano → tarefas → verificação    | `/spec-driven-development`  |
| `technical-writing`        | README, RFC, ADR, especificação e guias claros               | `/technical-writing`        |

## Portfólio

| Skill                    | Quando usar                                  | Chamar                            |
| ------------------------ | -------------------------------------------- | --------------------------------- |
| `terminal-command`       | comandos, autocompletar, `ajuda`, descoberta | automático                        |
| `site-page-section`      | página ou seção nova, rota, redirecionamento | automático                        |
| `terminal-design-system` | CSS, tokens, componentes, contraste          | automático                        |
| `content-integrity`      | dados, notas, datas, textos PT/EN            | automático                        |
| `sdd-spec-sync`          | fechar requisito, "o que falta"              | `/sdd-spec-sync`                  |
| `verify-site`            | antes de dizer "pronto"                      | `/verify-site`                    |
| `checkpoint`             | pausar, retomar, PR (só manual)              | `/checkpoint salvar\|retomar\|pr` |

## Scripts

- `node .claude/skills/terminal-design-system/scripts/contrast.mjs`: contraste AA nos dois temas.
- `node .claude/skills/content-integrity/scripts/check-i18n.mjs`: paridade PT/EN de `ui.ts`.
- `node .claude/skills/sdd-spec-sync/scripts/gap-summary.mjs`: resumo de status da spec.
- `node .claude/skills/verify-site/scripts/sweep.mjs`: regras mecânicas do projeto.
