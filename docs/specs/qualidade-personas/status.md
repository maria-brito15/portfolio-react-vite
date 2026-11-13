# Qualidade das personas (Fase 6): estado

Auditoria das Fases 0–5 do `roadmap-personas-site.md`, com correções. Evidência abaixo; o que não foi
feito está em "Não verificado". Scripts de navegador (Playwright no Edge) ficaram fora do repositório.

| ID | Requisito | Estado |
| --- | --- | --- |
| QA-01 | Rotas `/r/<persona>`: 200, persona aplicada, mantida após refresh e ao abrir `/`; persona inexistente → 404 sem persona | ✅ navegador (5 personas) + `PersonaFlows.test.tsx` |
| QA-02 | Voltar/avançar mantêm persona e página | ✅ navegador |
| QA-03 | Trocar de persona e voltar não zera trilha nem segredos; trilha interrompida volta a oferecer "continuar" | ✅ navegador + teste; o progresso é gravado ao interromper o tour |
| QA-04 | Site funciona com `localStorage`/`sessionStorage` bloqueados | ✅ navegador (sem erro de console) + teste |
| QA-05 | Sem rolagem horizontal, título único, sem salto de nível, nomes acessíveis, ids únicos | ✅ 375/390/768/1366/1440 × 6 contextos (sem persona + 5), PT; EN e 4 temas a 390 e 1440 |
| QA-06 | Contraste AA com fundos tingidos nos 5 temas | ✅ medido no navegador (texto real × fundo composto) na home de cada persona e na paleta; achou e corrigiu 3 falhas |
| QA-07 | Teclado: foco visível, Enter nos controles de cada experiência, paleta (foco, setas, Tab preso, Esc devolve o foco), Esc no tour | ✅ navegador |
| QA-08 | `prefers-reduced-motion` | ✅ sem animação/transição > 0,2 s na home do amigo |
| QA-09 | Alvos de toque no celular ≥ 40 px nos controles novos | ✅ `experiences.css`; desktop: `.featured-links a` ≥ 24 px |
| QA-10 | Impressão do currículo | ◐ em mídia `print` o fundo é branco e o texto preto, sem shell nem blocos de persona (estilos computados). **O PDF não foi visto** (sem rasterizador) |
| QA-11 | Peso do JS inicial (TR-27) | ◐ 146,24 → **138,45 kB gzip** (−7,8) com SEO e perspectivas sob demanda; **ainda acima do teto original** (130,84 + 3 = 133,84) |
| QA-12 | Sem persona espalhada em componentes; sem fonte de dados duplicada | ✅ nenhum `persona === '…'` fora de testes e do terminal; blocos leem dados existentes |
| QA-13 | Leitor de tela real | ❔ não testado (só árvore de acessibilidade do navegador) |

Contagem: ✅ 10 · ◐ 2 · ❌ 0 · ❔ 1.

## Problemas encontrados e correções

1. **Contraste (AA) em fundo tingido:** ícone dos atalhos (`.quick-icon`) em todos os temas (3,9–4,5:1); texto `--dim` no Dracula (4,2–4,4:1); chips no Dracula (4,48:1). Ícone passou a usar `--text` (o tom fica no fundo e no filete); chip mistura 20% de `--text` na cor; `--dim` do Dracula mais claro. `contrast.mjs` continua passando.
2. **Nome acessível:** o marcador decorativo `##` dos títulos entrava no nome (“## Explorador…”). Conteúdo gerado decorativo (`##`, `//`, `›`, `▾`, `▸`, `●`, `·`, `>`, `/`) agora tem texto alternativo vazio (`content: '##' / ''`, com a declaração simples antes como reserva).
3. **Alvos pequenos:** `summary` e botões de ligação das experiências no celular; links `.featured-links` no desktop (19 → 24 px).
4. **Peso:** `data/seo.ts` (~10 kB) e `data/projectPerspectives.ts` (~11 kB) saíram do JS inicial: `useDocumentMeta` e o novo `usePerspectives` os importam sob demanda (o HTML de cada rota já nasce com o `<head>`; sem persona nada é baixado).
5. **Falha intermitente** do teste do Ctrl+K na suíte inteira (tempo de 3 s sob carga); passa isolado.

## Peso do JS inicial (TR-27)

| Marco | gzip |
| --- | --- |
| Antes das trilhas | 130,84 kB |
| Trilhas (TR-27, teto +3) | 136,33 kB |
| Fim da Fase 5 | 146,24 kB |
| **Agora** | **138,45 kB** |

Sobra +7,6 kB sobre o marco "antes das trilhas" (+2,1 sobre o marco das trilhas). Causa: a sessão do terminal
(`commands.tsx`, `sectionViews.tsx`, `views.tsx`, ~30 kB brutos) e os dados que ela usa (`services.tsx`,
`resume.ts`, `trails.ts`) entram no pacote inicial porque a barra de comandos mora no shell de todas as páginas.
Carregá-los sob demanda exige tornar a sessão do terminal preguiçosa: refatoração maior, **não feita**.

## Decisões e observações

- A FAQ aparece na home do cliente nos dois blocos (resumo de serviços e jornada): conteúdo vem da mesma fonte; mantido.
- Erros de console nas auditorias: só `403` da API do GitHub (limite de requisições sem token, causado pelas dezenas de cargas da própria auditoria). Não vi como a interface se comporta nesse caso.
- Linhas "área do alvo < 24 px" restantes: o campo de comando do terminal no desktop (18 px de altura, linha inteira clicável; já era assim).

## Não verificado

- Leitor de tela de verdade; PDF do currículo visto; deploy (`/r/<persona>` em produção, 404 real da Netlify); suíte `npm run e2e`.
- Tema Dracula/Solarized/âmbar **a olho** além de uma captura cada (contraste foi medido).
- Dispositivo real (só emulação de tela).
