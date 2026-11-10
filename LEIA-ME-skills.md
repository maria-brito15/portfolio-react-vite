# Skills do Claude Code para o portfólio da Duda

Onze skills no formato de `SKILL.md` (lista completa em `SKILLS.md`) (frontmatter + corpo curto + `references/` carregadas sob demanda),
seguindo os artigos de Felipe Fontoura sobre criação de skills e estrutura do frontmatter.

## Instalar

Copie para a raiz do repositório `portfolio-react-vite`:

```bash
unzip claude-skills.zip -d /caminho/do/portfolio-react-vite
```

Isto cria `.claude/skills/` (onde o Claude Code procura skills do projeto), `docs/sdd-terminal-v2/` (a spec),
`SKILLS.md` (lista das onze skills) e um `CLAUDE.md` curto. Se você já tem `CLAUDE.md`, copie só o bloco "Skills do projeto".
O artigo usa `.agents/skills/`; no Claude Code o caminho é `.claude/skills/`. Se usar outro agente, mova a pasta.
Depois, reinicie a sessão e digite `/` para ver as skills listadas.

## As skills

| Skill                      | Quando dispara                                            | Traz                                                         |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `terminal-command`         | mexer em comandos, autocompletar, ajuda, descoberta       | anatomia do comando, regras de descoberta, receitas de teste |
| `site-page-section`        | página/seção nova, rota, redirecionamento                 | checklists de página e seção, hash legado (`/#sobre`)        |
| `terminal-design-system`   | CSS, cores, componentes, a11y                             | tokens, componentes, `contrast.mjs`                          |
| `content-integrity`        | dados, notas, datas, textos PT/EN                         | regras de dados, `check-i18n.mjs`, modelo de semestre        |
| `sdd-spec-sync`            | fechar requisito, "o que falta"                           | fluxo código × spec, `gap-summary.mjs`, modelos              |
| `verify-site`              | antes de dizer "pronto"                                   | portões de verificação, `sweep.mjs`, capturas Playwright     |
| `checkpoint`               | pausar/retomar, PR (só manual: `/checkpoint`)             | modelos de estado e de PR                                    |
| `requirements-engineering` | levantar e validar requisitos antes de codificar          | requisitos em EARS, critério de aceite, perguntas em aberto  |
| `software-architecture`    | decisões de desenho e trade-offs                          | opções comparadas, ADR, consequências                        |
| `spec-driven-development`  | fluxo PRD → especificação → plano → tarefas → verificação | pasta `docs/specs/<feature>/` e portões de aprovação         |
| `technical-writing`        | README, RFC, ADR, guias                                   | modelos por tipo de documento e checagens antes de entregar  |

## Scripts (Node, sem dependências; rode na raiz do repo)

| Script                                        | Para quê                                                          | Saída                                                     |
| --------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| `terminal-design-system/scripts/contrast.mjs` | contraste AA dos tokens, tema escuro e claro                      | exit 1 se reprovar                                        |
| `content-integrity/scripts/check-i18n.mjs`    | paridade PT/EN de `ui.ts` (chaves e tipos)                        | exit 1 se divergir                                        |
| `sdd-spec-sync/scripts/gap-summary.mjs`       | tabela-resumo ✅◐❌❔ da gap-analysis                             | exit 1 se faltar marca                                    |
| `verify-site/scripts/sweep.mjs`               | Syne/degradê/CSS legado, `var()` indefinida, `.only`, SDD ausente | exit 1 se violar; rotas escritas à mão saem só como aviso |

Testados no código do `src.zip` mais recente: contraste passa nos dois temas, 119 chaves em paridade,
resumo da spec bate com a gap-analysis (35 ✅, 9 ◐, 8 ❌, 1 ❔) e a varredura sai limpa (com 11 avisos de rota escrita à mão).

## Como cada skill foi desenhada (resumo das regras dos artigos)

- `description` é o gatilho: começa pelo sinal mais forte, usa o vocabulário de quem pede, deixa as exclusões por último; `when_to_use` complementa. Todos ficam abaixo do limite de 1.536 caracteres.
- Corpo com menos de 500 linhas e uma **tabela de leitura** que diz qual `reference` abrir para cada tarefa.
- Detalhes por domínio de decisão em `references/`; ferramentas determinísticas em `scripts/`; modelos em `assets/`.
- Frontmatter extra só onde ajuda: `effort`, `argument-hint`, `allowed-tools` (verify-site) e `disable-model-invocation` (checkpoint, só manual).

## Primeiro uso sugerido

As skills de engenharia valem para qualquer feature nova. Para uma feature, comece com `/spec-driven-development`.

1. `/sdd-spec-sync` para ver o estado da spec.
2. Peça: "faça a tarefa T-D1" (liga `pageIndex.tsx` ao comando `curriculo`): `terminal-command` e `verify-site` entram sozinhas.
3. No fim da sessão: `/checkpoint salvar`.
