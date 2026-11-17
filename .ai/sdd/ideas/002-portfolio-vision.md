# 002 — Visão do portfólio

**Data:** 2026-11-15 · **Estado:** `idea:captured` · **Fonte:** entrevista da Fase 1 e `001-current-portfolio-audit.md`

## Visão
Um portfólio que funciona como o Letterboxd, mas para o trabalho de engenharia da Duda: projetos como "filmes", com nota, diário, resenhas (casos de estudo) e listas. Filmes e livros são a personalidade, em segundo plano. Primeiro e antes de tudo, é um portfólio de engenharia que se escaneia em 60 segundos.

## Decisões da entrevista
| ID | Tema | Decisão | Motivo (dela ou da recomendação aceita) |
| --- | --- | --- | --- |
| V-D-001 | Público | RH, professores e entrevistadores | Escaneiam rápido; querem evidência, não efeito |
| V-D-002 | Hierarquia | Engenharia primeiro; filmes e livros em segundo plano | Recomendação aceita |
| V-D-003 | Escopo do MVP | Projetos, casos de estudo, currículo, acadêmico, contato e `/pessoal` | Recomendação aceita |
| V-D-004 | Terminal | Fica em `/terminal`, fora do menu principal | Diferencial para técnicos, mas não deve ser a home |
| V-D-005 | Fora do MVP | Assistente de IA, trilhas, personas, jogos | Custo de manutenção e risco; público reduzido |
| V-D-006 | Temas | Claro e escuro (hoje são 5) | Menos superfície de contraste a testar |
| V-D-007 | Idiomas | PT e EN no lançamento | Alcance internacional; exige paridade testada |
| V-D-008 | Metas | LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 em celular médio; Lighthouse ≥ 95 (acessibilidade, SEO, boas práticas); axe sem violação; WCAG 2.1 AA | Mensurável e verificável |
| V-D-009 | Autoria | Projetos e casos em arquivos tipados no git; filmes e livros via Letterboxd/Hardcover, com resenhas e notas dela em arquivo | Sem CMS nem banco |
| V-D-010 | Identidade visual | Nova, do zero (não o Caderno Vol. XI) | Escolha dela; tipografia e paleta ficam para a spec 002 (design-system-and-shell) |
| V-D-011 | Analytics | Sem cookies, métricas agregadas | Sem banner, sem peso de JS, mede as metas |
| V-D-012 | Nota dos projetos | Estrelas por critérios públicos, com regra visível | Evita autoelogio e número sem origem |
| V-D-013 | Hospedagem | Netlify atual, mesmo endereço; URLs antigas redirecionam | Reusa Functions, Blobs e variáveis |
| V-D-014 | Stack | A atual (React 19, Vite 6, TypeScript estrito, Vitest, Playwright) | Escolha dela |
| V-D-015 | Onde mora | **Corrigida em 2026-11-15:** na branch `rebuild/sdd`, com `git push` só quando a Duda pedir; merge na `main` só no lançamento (spec 010), porque o Netlify publica a partir dela. (Antes: "na mesma branch (`main`), sem `git push`") | Escolha dela |
| V-D-016 | Prazo e rigor | Sem prazo fixo; spec proporcional ao risco | Recomendação aceita |
| V-D-017 | Arquivos de entrada | `AGENTS.md` substitui `CLAUDE.md`; `.ai/sdd/` substitui `docs/specs/`; remoções só na Fase 2, com lista confirmada | Escolha dela |

## Restrições herdadas do prompt
Não copiar nome, logo, paleta ou ícones do Letterboxd; não fazer hotlink de pôsteres e capas; verificar e registrar os termos de TMDB, Hardcover e Letterboxd em `tech-stack.md`; nenhuma conta, comentário ou rede social; nada apagado sem aprovação explícita.

## Pontos a resolver nas próximas fases
- **Fraunces e JetBrains Mono:** a regra de duas vozes do `CLAUDE.md` vem do Caderno, que foi substituído. Tipografia e paleta novas são decisão da spec 002. Até lá, as fontes atuais são só ponto de partida.
- **Testes atuais:** 5 falhas em 3 arquivos e suíte de 638 s (auditoria §6). A base de código reaproveitada precisa de uma suíte rápida e verde antes de virar gate de `verify`.
- **Ferramenta de analytics:** escolher qual (Plausible, Umami ou métricas do Netlify) e o custo, em `tech-stack.md`.
- **Código atual que será reescrito ou removido:** a lista vem na Fase 2, para confirmação, antes de qualquer remoção.
- **Termos de API:** ainda não verificados para o novo uso.
