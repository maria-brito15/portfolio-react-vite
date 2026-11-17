# 002 Design system and shell, Tasks
**Status:** approved (aprovado pela Duda em 2026-11-17; ver `.status`) · **Versão:** 1.3 (T2.2: `title`/`description` sem tocar no `desc`; sobre a 1.2 com as isenções de hex ampliadas na T1.1) · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-17
**Entrada:** `requirements.md` v1.6 (aprovada), `design.md` v2.2 (aprovado em 2026-11-17, duas revisões aplicadas), `spike-001.md`, `design-review.md`, `design-review-2.md` e `tasks-review.md` (revisão do tasks v1.0, achados A-01 a A-14 aplicados nesta versão).
**Estimativa total:** 27 tarefas, **90 h** (1 a 4 h cada), em 7 fases (0 a 6). A "Ação da Duda" (fora da contagem) está no fim.
**Mudanças da v1.1 (precisam da aprovação da Duda junto com o resto):** (1) exceção estreita à 008 para testes e casca (linha da regra "Spec 008", A-02/A-06); (2) a T1.1 isenta dois trechos legados do teste de CSS (A-01); (3) `Header` e `Footer` novos nascem como `*.next.tsx` e a T3.3 faz a troca (A-04); (4) `/_prova` só é declarada na T5.1 (A-05); (5) T2.5 sobe de 3 h para 4 h (total 90 h); (6) demais ajustes de verificação, cobertura e dependências (A-03, A-07 a A-14).

## Como ler
- **Testes ficam dentro de cada tarefa.** Não há fase de testes separada.
- **Bloco de evidência** no fechamento de toda tarefa (conventions.md): `Claim`, `Command`, `Exit code`, `Summary`, `Verdict`, em `evidence.md` nesta pasta.
- **Gate de cada tarefa:** `npm run verify` com exit 0 no fim (formatação, lint sem avisos, tipos, testes, geração). Nenhuma tarefa deixa o repositório quebrado: as páginas antigas continuam compilando pelo bloco `/* LEGADO */` de `tokens.css` (TD-017) até a spec de cada uma.
- **Commits** em português, `tipo(escopo): resumo`, citando o ID da tarefa e terminando com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. **Nenhuma tarefa inclui `git push`** e nada vai para a `main` (o Netlify publica a partir dela).
- **Tempo:** a máquina fica mais lenta com programas abertos; o orçamento da 001 vale (suíte ≤ 90 s, `verify` ≤ 180 s, metas 60/120 s). Se um `verify` estourar, repetir com a máquina ociosa antes de concluir que o código causou.
- **Nunca duas execuções de vitest ao mesmo tempo.**
- **`src.zip` é arquivo da Duda:** nenhuma tarefa o apaga, o move ou o comita.
- **Spec 008 (`netlify/personal/`, `personal-*.mts`, `scripts/personalGuard.*`, integrações, `@netlify/blobs`, bloco `[functions]`, `.env.example`): intocável.** **Única exceção, autorizada pela Duda em 2026-11-17 (DQ-017):** extrair o cálculo de `draft`/`showInNav` de `src/data/routes.ts` (T2.1), sem mudar conteúdo, comportamento, integrações nem Functions.
- **Exceção estreita proposta na v1.1 (vale só com a aprovação da Duda deste `tasks.md`; A-02, A-06):** em `src/components/personal/`, `src/pages/personal/`, `src/data/personalRoutes.test.tsx`, `src/data/personalDiscovery.test.tsx` e testes do terminal que usam `portfolio-lang`, é permitido **apenas** (a) trocar `localStorage.setItem('portfolio-lang', ...)` pelo caminho `/en/...` ou pelo `initial` do `RouterProvider` (T2.5); (b) tirar o embrulho `<SiteShell>` de `EditorialPage` e das páginas (T3.3); (c) ajustar consultas de teste que assumem a casca antiga. **Nunca** mudar asserção de comportamento, conteúdo, integração ou Function. A lista final de arquivos tocados vai para o `evidence.md`.
- **Windows:** arquivos com barra invertida, crases ou `\uXXXX` vão pelo Write, não por heredoc; nunca junction em `node_modules`.
- **Texto de interface** em PT e EN (`src/i18n/ui.ts`, paridade da 001); **conteúdo** em `src/content/`, tipado e validado; nada inventado.

## Readiness Check
| Item | Estado |
| --- | --- |
| Requisitos aprovados | OK: `requirements.md` v1.6 (`requirements:approved` desde a v1.2; v1.4, v1.5 e v1.6 aprovadas pela Duda em 2026-11-17) |
| Design aprovado | OK: `design:approved` em 2026-11-17 (`.status`), v2.2 |
| Todo Must Have coberto | OK: FR-001 a FR-032, FR-034 a FR-037, FR-040 e FR-041 e os 3 NFR na tabela Coverage; FR-033 (Won't) é conferido na T6.1; FR-038 e FR-039 (Should) também têm tarefa |
| Todo Q-* respondido | OK: Q-001 e Q-002 do requirements respondidas; DQ-001 a DQ-021 do design respondidas; **só a DQ-003 (pesos das fontes) segue aberta e é resolvida pela T1.4** |
| Toda tarefa tem dependência, critério e verificação | OK (ver cada tarefa) |
| Spike obrigatório antes do resto | **T0.1** (pré-render); a T1.1 depende dela, então nada mais começa antes do veredito. Se não fechar dentro do `vite build`, as Fases 4 e 5 voltam para a Duda. O critério (4) do spike (como `routes.ts` carrega sem `import.meta.env`) é reconferido na T2.1 |
| Pontos que dependem de medição | ponto de quebra do menu (1024 px, T3.2), peso das fontes (T1.4), 100 KB de JS e 20 KB de CSS (T5.3); se algum não couber, **parar e propor** à Duda (não aumentar o número em silêncio). A resposta volta para o documento certo: quebra do menu e fontes para o `design.md` (TD-010, TD-016); 100 KB e 20 KB para o `requirements.md` (NFR-001) |
| Estimativas de 4 h | T3.3, T3.5, T4.2 e T5.3 concentram risco; se uma estourar 4 h, **parar e avisar a Duda** antes de seguir (dividir muda o total e pede nova aprovação) |

## Coverage
| Requisito | Tarefas |
| --- | --- |
| FR-001 (fonte única de tokens) | T1.1 |
| FR-002 (dois temas, sem degradê) | T1.1, T1.2 |
| FR-003 a FR-006 (tema: 1ª visita, escolha, antes do 1º desenho, armazenamento bloqueado) | T1.3, T1.5, T4.1 (script de boot antes do CSS no HTML gerado) |
| FR-007 (contraste) | T1.1 |
| FR-008 (casca: skip link, cabeçalho, `main`, rodapé) | T3.2, T3.3 |
| FR-009 a FR-011 (tabela única, rota fora do menu, texto nos dois idiomas) | T2.1, T2.2, T2.3 |
| FR-012 (sem rolagem horizontal) | T3.2, T5.2 |
| FR-013 a FR-015 (menu estreito, foco, teclado) | T3.2, T5.2 |
| FR-016 (ordem do foco, inclusive com a faixa de idioma visível) | T3.3, T5.2 |
| FR-017 (foco visível) | T1.1, T5.2 |
| FR-018 (movimento reduzido) | T1.1 |
| FR-019 a FR-024 (idiomas, endereço por idioma, troca, `lang`, `hreflang`) | T2.2, T2.4, T2.5, T2.6, T2.3; FR-023 e FR-024 no HTML gerado: T4.1, T4.2 |
| FR-025, FR-026, FR-034, FR-035 (faixa de inglês) | T1.3, T2.6 |
| FR-027 (404 com status e por idioma) | T3.6, T3.7, T4.2 |
| FR-028 (conteúdo sem JavaScript) | T0.1, T4.1, T4.2, T4.3 |
| FR-029, FR-030 (fontes próprias, sem terceiros) | T1.4, T5.2 |
| FR-031 (cabeçalhos de segurança) | T3.7 |
| FR-032 (remoção do código antigo) | T1.2, T3.3, T3.4, T3.5, T6.1 |
| FR-033 (terminal e CI: Won't) | T6.1 (conferência) |
| FR-036, FR-037 (rodapé de créditos, elenco de uma fonte) | T3.1 |
| FR-038 (faixa decorativa) | T1.1, T3.1 |
| FR-039 (sugestões na 404) | T3.6 |
| FR-040 (estado nunca só por cor) | T3.8 |
| FR-041 (variante sem casca, sem faixa de idioma nem espaço reservado) | T1.3, T2.2, T3.3, T4.1, T4.2 |
| NFR-001 (desempenho) | T3.5, T5.1, T5.3 |
| NFR-002 (segurança) | T3.7, T5.2 |
| NFR-003 (acessibilidade) | T3.2, T5.2, T5.3 |
| Decisões: TD-008 / TD-009 / TD-011 / TD-018 / TD-025 | T0.1, T4.1, T4.2 / T5.1 / T1.3, T1.5 / T3.3 / T2.1, T3.4, T3.5 |

---

## Fase 0: Spike do pré-render
### T0.1 Spike do pré-render dentro do `vite build` (TD-008)
- **Requisito:** FR-028, R-002 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** nenhuma
- **Trabalho:** com **uma** rota (`/sobre`) e fora do repositório (um clone ou pasta no scratchpad; nada é commitado como produto), responder aos **6 critérios** do TD-008: (1) como o SSR roda por dentro de `vite build`, (2) o manifesto (`build.manifest`) e o `modulepreload` da rota, (3) a API `prerender` de `react-dom/static` com `React.lazy`, (4) como `routes.ts` carrega no contexto do config sem `import.meta.env`, (5) o build aninhado com `configFile: false`, plugins explícitos, `copyPublicDir: false`, sem recursão, (6) a limpeza de `.prerender/` e `dist/.vite/`. Medir também o aviso de hidratação num `hydrateRoot` de verdade.
- **Testes:** o próprio spike (script de medição); nada entra no `verify`.
- **Critérios de aceitação:** `spike-002.md` nesta pasta, com as 6 respostas, o comando usado e o veredito **viável / viável com ressalva / inviável**. **Se inviável ou se só fechar fora do `vite build`: parar, as Fases 4 e 5 voltam para a Duda** (mudar o runner da 001 não é desta spec).
- **Arquivos prováveis:** `.ai/sdd/specs/002-design-system-and-shell/spike-002.md`
- **Verificação:** `test -f .ai/sdd/specs/002-design-system-and-shell/spike-002.md` (exit 0); `grep -c -E "^### ?\(?[1-6]\)" spike-002.md` ou equivalente mostra as 6 respostas e `grep -n -E "viável|inviável" spike-002.md` mostra o veredito; `git status --short` só com `spike-002.md` (e `evidence.md`). Nota: o T0.1 é o spike do design (TD-008); não é o SPIKE-001 do requirements, que continua fechado. O fechamento dele usa o bloco de evidência normal.

---

## Fase 1: Fundamentos (tokens, temas, boot, fontes)
### T1.1 Tokens novos, matriz de contraste e regras de CSS (TD-001, TD-003, TD-004, TD-017)
- **Requisito:** FR-001, FR-002, FR-007, FR-017, FR-018, FR-038 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T0.1
- **Trabalho:** reescrever `src/styles/tokens.css` com os tokens nomeados por papel (`--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--on-accent`, `--control-border`, `--divider`, `--tone-*`, `--tone-dark-*`, `--deco-1` a `--deco-5`, `--space-*`, `--radius-*`, `--dur-*`) com os valores das tabelas do design: tema claro em `:root`, escuro em `[data-theme='dark']` e `@media (prefers-color-scheme: dark)` para `:root:not([data-theme])`; mover os nomes antigos que as páginas ainda usam (`--accent-2`, `--ok`, `--warn`, `--err`, `--info`, `--c-*`) para um bloco `/* LEGADO */` no mesmo arquivo, mapeados para tokens novos; remover os blocos dos 3 temas extras. Reescrever `contrast.test.ts` (matriz de pares permitidos nos dois temas; piso 3:1 sobre os pastéis e 4:1 onde o fundo permite; pares proibidos dos Achados 4 e 5 falham) e `styles.test.ts` (nenhum hex fora de `tokens.css`, sem `gradient(`, **com isenções explícitas e com dono, listadas no próprio teste** porque o código antigo ainda existe: (i) o bloco `.grid-bg` de `base.css` (dono: T3.4, que o apaga e **remove a isenção**); (ii) os dois blocos de impressão de `resume.css` (`@media print`, linhas 390 a 422 e 641 a 642: `#fff`, `#000`, `#333`; dono: spec 007 do currículo); (iii) o `#fff` do lightbox de `services.css` (linhas 408, 425, 514 e 550, texto e contorno sobre fundo escuro fixo; dono: a spec da página de serviços). **Ampliação da v1.2 (2026-11-17, aprovada pela Duda na T1.1):** a v1.1 citava só (i) e a primeira parte de (ii); a varredura da T1.1 achou (iii) e o segundo bloco de (ii). O teste falha se uma isenção crescer além dessas linhas; dentro de `prefers-reduced-motion` toda `transition` e `animation` é neutralizada, tokens `--deco-*` presentes nos dois temas, anel de foco de 3 px).
- **Testes:** `contrast.test.ts` e `styles.test.ts` reescritos (V-01).
- **Critérios de aceitação:** as razões calculadas batem com as do design; o teste falha se um par fora da matriz for usado (provar com um par plantado); o `verify` passa com as páginas antigas intactas.
- **Arquivos prováveis:** `src/styles/tokens.css`, `src/styles/contrast.test.ts`, `src/styles/styles.test.ts`
- **Verificação:** `npx vitest run src/styles/contrast.test.ts src/styles/styles.test.ts` (exit 0, com um hex e um `gradient(` plantados fora das isenções reprovando); `git grep -n -i "gradient(" -- src/styles` mostra **só** as 2 linhas do `.grid-bg` de `base.css` (a T3.4 zera); `npm run verify` (exit 0)

### T1.2 Só dois temas no código (TD-011, D-002)
- **Requisito:** FR-002, FR-032 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T1.1
- **Trabalho:** `src/types.ts` (`Theme = 'light' | 'dark'`), `src/data/themes.ts` (2 temas), `src/data/themes.test.tsx` (o comando `tema` do terminal oferece só os dois; valor antigo `dracula` no `localStorage` é ignorado), a lista de ids do script inline do `index.html` e o teste que a confere; `DEFAULT_THEME` passa a vir da resolução do sistema (T1.3), por ora `light`. O tom `amber` de componente (`tones.ts`, `Chip`) **não é tema e fica**.
- **Testes:** `themes.test.tsx` ajustado; teste do `index.html` ajustado.
- **Critérios de aceitação:** nenhuma referência aos 3 temas extras em `themes.ts`, `types.ts`, `tokens.css` e `index.html`.
- **Arquivos prováveis:** `src/types.ts`, `src/data/themes.ts`, `src/data/themes.test.tsx`, `index.html`
- **Verificação:** `git grep -n -i -E "dracula|solarized|'amber'" -- src/data/themes.ts src/types.ts src/styles/tokens.css index.html` (exit 1); `npx vitest run src/data/themes.test.tsx` (exit 0); `npm run verify` (exit 0)

### T1.3 Módulo de boot autocontido: tema e faixa de idioma (TD-011, TD-012)
- **Requisito:** FR-003, FR-004, FR-005, FR-006, FR-025, FR-026, FR-034, FR-035 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2
- **Trabalho:** criar `src/boot/boot.ts`, **sem imports**, com as funções puras `resolveTheme({ stored, systemDark })` (6 linhas da tabela do requirements) e `languageOffer({ path, storedLang, dismissed, navigatorLangs, storageOk })` (9 linhas da tabela de idioma), e `bootSource()`, que monta o texto do script inline com `Function.prototype.toString` (cada função **autocontida**: constantes dentro, nenhuma chama outra do módulo). O script lê o armazenamento sob `try/catch`, marca `data-theme`, a classe `js`, `style.colorScheme` e `data-lang-offer`, **e não marca `data-lang-offer` quando o `<html>` já tem `data-shell="bare"`** (gravado pelo build na T4.1/T4.2), para o terminal não reservar o espaço da faixa (FR-041, TD-012).
- **Testes:** `boot.test.ts` (projeto `unit`): as tabelas; o script avaliado em `vm` decide igual às funções; identificador livre falha; armazenamento bloqueado sem erro.
- **Critérios de aceitação:** as 6 linhas de tema e as 9 de idioma passam; valor `dracula` é ignorado; `/en` e `/en/x` valem como inglês; a faixa nunca é oferecida sob `/en`; com `data-shell="bare"` o script não marca `data-lang-offer` mesmo com navegador em inglês.
- **Arquivos prováveis:** `src/boot/boot.ts`, `src/boot/boot.test.ts`
- **Verificação:** `npx vitest run src/boot/boot.test.ts` (exit 0); `npm run verify` (exit 0)

### T1.4 Fontes IBM Plex, licença e teste de peso (TD-016, DQ-003)
- **Requisito:** FR-029, NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.1
- **Trabalho:** colocar em `public/fonts/` os WOFF2 latinos da Plex Sans 400 e 600 e da Plex Mono 400 (baixar cada arquivo da fonte oficial **em pasta nova e vazia**, conferir a licença OFL 1.1 e gravar `public/fonts/LICENSE-IBM-Plex.txt` com a origem e a data); `@font-face` em `tokens.css` com `font-display: swap`, `unicode-range` e métricas ajustadas (`size-adjust`) na fonte reserva; remover `jetbrains-mono-*.woff2`; trocar as famílias nos tokens. **Teste de peso (DQ-003):** registrar no `evidence.md` o tamanho de cada WOFF2 e o total; se passar de 4 arquivos ou comprometer o LCP, **parar e voltar à Duda** (plano B: fonte do sistema). O 500 do mockup vira 400 ou 600.
- **Testes:** `scripts/assets.test.ts` (≤ 2 famílias, só `/fonts/` do próprio site, `swap`, no máximo 4 arquivos de fonte, nenhuma URL externa em CSS/HTML-fonte).
- **Critérios de aceitação:** `assets.test.ts` passa; a licença e a atribuição existem; nenhum `jetbrains-mono` no repositório.
- **Arquivos prováveis:** `public/fonts/*`, `public/fonts/LICENSE-IBM-Plex.txt`, `src/styles/tokens.css`, `scripts/assets.test.ts`
- **Verificação:** `npx vitest run scripts/assets.test.ts` (exit 0); `git grep -n -i "jetbrains" -- src index.html public` (exit 1); `npm run verify` (exit 0)

### T1.5 Boot injetado no HTML e provedor de tema que só grava a escolha (TD-011, design-review S-04, S-05)
- **Requisito:** FR-003 a FR-006 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.3, T1.4
- **Trabalho:** o plugin do Vite (`scripts/seoPlugin.ts`, `transformIndexHtml`) injeta `bootSource()` no `<head>` **antes do CSS e síncrono**; `index.html` perde o `data-theme="dark"` fixo e o script inline antigo; o `theme-color` vira dois `<meta>` com `media`; entram os `<link rel="preload">` das 3 fontes. `ThemeProvider` passa a gravar `portfolio-theme` **só quando o visitante escolhe** (não ao montar). O tema do `index.html` antes do React vem do boot.
- **Testes:** `useTheme.test.tsx` (montar sem clicar **não** grava; clique grava; armazenamento bloqueado sem erro); teste do plugin (script antes do CSS, dois `theme-color`, três `preload`).
- **Critérios de aceitação:** sem `data-theme` fixo no `index.html`; V-03 completo.
- **Arquivos prováveis:** `index.html`, `scripts/seoPlugin.ts`, `scripts/seoPlugin.test.ts`, `src/hooks/useTheme.tsx`, `src/hooks/useTheme.test.tsx`
- **Verificação:** `npx vitest run src/boot/boot.test.ts src/hooks/useTheme.test.tsx scripts/seoPlugin.test.ts` (exit 0); `git grep -n 'data-theme="dark"' -- index.html` (exit 1); `npm run verify` (exit 0)

---

## Fase 2: Dados de rota e idioma
### T2.1 Extrair o cálculo de `draft` de `routes.ts` (TD-025 (b), DQ-017)
- **Requisito:** NFR-001, R-001 (design: Riscos) · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T1.2 (não usa o boot nem o tema; fica cedo para a única exceção à 008 aparecer cedo)
- **Trabalho:** criar `src/data/routeStatus.ts` com o cálculo de `draft` e `showInNav` que hoje usa `now`, `uses`, `data/personal/*` e `services/integrations/mode`; `routes.ts` **deixa de importar** esses módulos; consumidores: o plugin (Node), `HubIndex` (chunk lazy) e os testes. `seo.ts` é dividido: `metaFor` (cliente, sem `draft`) e `headTags`/`jsonLdFor` (só o plugin) leem `routeStatus`. **Mexer só nisso na 008: sem alterar conteúdo, comportamento, integrações, Functions nem `.env.example`.** O comportamento observável das rotas e do `noindex` fica igual.
- **Testes:** `routes.test.ts`, `personalRoutes.test.tsx`, `personalDiscovery.test.tsx`, `seo.test.ts` ajustados (mesmas asserções, novo ponto de leitura).
- **Critérios de aceitação:** `git grep` não acha `now`, `uses`, `personal/` nem `integrations/mode` importados em `src/data/routes.ts`; a suíte passa sem mudar uma asserção de comportamento.
- **Arquivos prováveis:** `src/data/routes.ts`, `src/data/routeStatus.ts`, `src/data/seo.ts`, `src/components/personal/HubIndex.tsx`, `scripts/seoPlugin.ts`, os 4 testes
- **Verificação:** `git grep -n -E "from '\./(now|uses)'|personal/|integrations/mode" -- src/data/routes.ts` (exit 1); `npx vitest run src/data/routes.test.ts src/data/personalRoutes.test.tsx src/data/personalDiscovery.test.tsx src/data/seo.test.ts` (exit 0); `git diff --stat -- netlify scripts/personalGuard.ts scripts/personalGuard.test.ts src/services src/data/personal .env.example` (vazio); `git diff --name-only -- src/components/personal src/pages/personal` só com `HubIndex.tsx` (e o teste da 008 listado acima); `npm run verify` (exit 0)

### T2.2 Tabela de rotas estendida, schema e `enPath` (TD-006, DQ-016, DQ-019)
- **Requisito:** FR-009, FR-010, FR-011, FR-019, FR-020, FR-041 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.1
- **Trabalho:** acrescentar a `Route` os campos `enPath`, `title`, `menu`, `order`, `prova`, `bare`; preencher `enPath` das rotas com alias em inglês a partir dos `aliases` (`/about` vira `/en/about`) e os confirmados pela Duda: `/en`, `/en/terminal`, `/en/github`, `/en/case-studies/whatsapp-dispatcher`; `title` e `description` copiados de `pageMeta` (PT e EN; o `desc` curto não muda, DQ-026 do design v2.3); `menu: true` nas 5 rotas (Projetos, Currículo, Acadêmico, Contato, Pessoal, `order` 1 a 5); `bare: true` só no terminal; o campo `prova` existe no tipo, mas **nenhuma rota é declarada com ele aqui** (a `/_prova`, o filtro `__PROVA__` e a `Prova.tsx` nascem juntos na T5.1, para o `dist/` nunca conter a rota entre uma tarefa e outra). Schema zod `src/content/schema/route.ts` (no molde da 001) e `routes.test.ts`: caminhos únicos, PT sem `/en`, EN igual a `/en` ou começando com `/en/`, `Localized` completo, `order` único, `bare` e `menu` não coexistem, só uma rota `bare`, regra de 2 interações.
- **Testes:** `route.test.ts` (mensagens de erro do Data Model) e `routes.test.ts` estendido (V-05).
- **Critérios de aceitação:** cada mensagem de erro do Data Model é provada por uma tabela quebrada de propósito; a tabela real passa.
- **Arquivos prováveis:** `src/data/routes.ts`, `src/content/schema/route.ts`, `src/content/schema/route.test.ts`, `src/data/routes.test.ts`
- **Verificação:** `npx vitest run src/content/schema/route.test.ts src/data/routes.test.ts` (exit 0); `npm run verify` (exit 0)

### T2.3 `seo.ts` lê a tabela e emite `hreflang` (TD-006, TD-013)
- **Requisito:** FR-009, FR-011, FR-024 · **Prioridade:** P1 · **Estimativa:** 3 h · **Dependências:** T2.2
- **Trabalho:** `pageMeta` deixa de ter textos próprios: `metaFor` lê `title`/`description` da tabela (uma fonte só); `headTags` emite três `<link rel="alternate">` (`pt-BR`, `en`, `x-default` para o PT); a 404 e a `/_prova` **não** emitem `hreflang` nem canonical; o comentário "não há hreflang" é corrigido.
- **Testes:** `seo.test.ts` ajustado e novo: hreflang recíproco em toda rota; nenhuma rota sem título em um idioma; um teste afirma que `seo.ts` não guarda texto de página.
- **Critérios de aceitação:** `pageMeta` sem textos; `hreflang` presente e recíproco.
- **Arquivos prováveis:** `src/data/seo.ts`, `src/data/seo.test.ts`
- **Verificação:** `npx vitest run src/data/seo.test.ts` (exit 0); `npm run verify` (exit 0)

### T2.4 Roteador: `/en/`, endereços por idioma e saída dos apelidos antigos (TD-007)
- **Requisito:** FR-020, FR-021 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T2.2
- **Trabalho:** `normalizePath('/en/')` devolve `/en`; `findPageByPath` casa `path` e `enPath`; os `aliases` em inglês antigos saem (o redirecionamento deles é da spec 010); `RouterProvider` aceita `initial` (caminho) e não lê `window` na renderização; `legacyTarget` continua para `/#hash`. Função `equivalentPath(route, lang)`.
- **Testes:** `routes.test.ts`, `legacyHashes.test.tsx` e `App.test.tsx` ajustados; casos novos de `/en`, `/en/` e rota desconhecida.
- **Critérios de aceitação:** `/en/projects` e `/projetos` abrem a mesma rota; `/en/` equivale a `/en`.
- **Arquivos prováveis:** `src/data/routes.ts`, `src/router.tsx`, `src/data/legacyHashes.test.tsx`, `src/App.test.tsx`
- **Verificação:** `npx vitest run src/data/routes.test.ts src/data/legacyHashes.test.tsx src/App.test.tsx` (exit 0); `npm run verify` (exit 0)

### T2.5 Idioma pela URL e gravação só por escolha (TD-007, design-review S-04)
- **Requisito:** FR-019, FR-021, FR-022, FR-023 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T2.4
- **Trabalho:** `LanguageProvider` deriva o idioma do caminho (`/en...` = EN) e **não** consulta o `localStorage`; grava `portfolio-lang` só em escolha explícita; `toggleLang` vira navegação ao equivalente; `useDocumentMeta` atualiza `lang`, `<title>`, descrição e `hreflang` na navegação do cliente. Os usos de `toggleLang` no terminal seguem funcionando. **Testes que dependiam de `localStorage.setItem('portfolio-lang', 'en')`** (achado A-02): `grep -rln "portfolio-lang" src` lista 14 arquivos de teste além dos abaixo (`src/components/personal/{badges,books,curated,editorial,films,foundation,hub,hubCards,pages,qa}.test.tsx`, `src/data/personalRoutes.test.tsx`, `src/terminal/extras/personal.test.tsx`, `src/terminal/sections.index.test.tsx`, conferir a lista atual no início da tarefa); cada um passa a abrir o caminho `/en/...` ou o `initial` do `RouterProvider`. Só troca de chave, sem mexer em asserção, e só dentro da exceção estreita da regra "Spec 008" (linha da v1.1).
- **Testes:** `LanguageContext.test.tsx` novo (idioma pela URL; **montar sem clicar não grava**; clique grava); `useDocumentMeta.test.tsx` ajustado; `App.test.tsx` (a afirmação de que `portfolio-lang` é gravado na montagem muda); os testes de `localStorage` acima.
- **Critérios de aceitação:** abrir `/en/about` mostra EN mesmo com `portfolio-lang=pt`; `lang` acompanha; nenhum teste da suíte depende mais de `portfolio-lang` para escolher o idioma.
- **Arquivos prováveis:** `src/i18n/LanguageContext.tsx`, `src/hooks/useDocumentMeta.ts`, os testes
- **Verificação:** `git grep -n "setItem('portfolio-lang'" -- src` só nos testes de escolha explícita (`LanguageContext`, `LanguageSwitch`); `npx vitest run src/i18n src/hooks/useDocumentMeta.test.tsx src/App.test.tsx src/components/personal src/data/personalRoutes.test.tsx src/terminal` (exit 0); `npm run verify` (exit 0)

### T2.6 Seletor PT | EN e faixa de idioma (TD-012, DQ-012, DQ-015)
- **Requisito:** FR-021, FR-022, FR-025, FR-026, FR-034, FR-035 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.3, T2.5
- **Trabalho:** `LanguageSwitch.tsx` (dois links `<a hreflang lang href>`, `aria-current` no atual, grava no clique); `LanguageOffer.tsx` só no cliente (`languageOffer` do boot), `position: fixed; top: 0`, `role="region"`, sem `autofocus`, link "Read this page in English" e botão "Dispensar" (grava `portfolio-lang-offer`); o CSS **reserva o espaço desde o 1º desenho** por `html[data-lang-offer]` (boot, T1.3) e o libera ao dispensar; textos em `src/i18n/ui.ts` (PT e EN, paridade).
- **Testes:** `LanguageSwitch.test.tsx` e `LanguageOffer.test.tsx` (as 9 linhas da tabela, dispensa, não rouba o foco, armazenamento bloqueado sem erro, **montar sem clicar não grava**) (V-08).
- **Critérios de aceitação:** a faixa nunca redireciona; em `/en/...` ou com escolha gravada não aparece.
- **Arquivos prováveis:** `src/components/shell/LanguageSwitch.tsx`, `src/components/shell/LanguageOffer.tsx`, `src/i18n/ui.ts`, `src/styles/shell.css`, os testes
- **Verificação:** `npx vitest run src/components/shell/LanguageSwitch.test.tsx src/components/shell/LanguageOffer.test.tsx src/i18n/parity.test.ts` (exit 0); `npm run verify` (exit 0)

---

## Fase 3: Casca
### T3.1 Faixa decorativa, rodapé de créditos e elenco (TD-020, TD-021)
- **Requisito:** FR-036, FR-037, FR-038 · **Prioridade:** P1 · **Estimativa:** 3 h · **Dependências:** T1.1, T1.4
- **Trabalho:** `DecorativeStripe.tsx` (`aria-hidden`, 6 px, `--deco-1` a `--deco-5`, sem texto nem foco); `src/content/credits.content.ts` (roteiro e código "Duda", filmado em "Belo Horizonte, MG", confirmados pela Duda) com schema; o **elenco** como lista declarada (`react`, `vite`, `typescript`) e a **versão maior instalada** lida de `node_modules/<nome>/package.json` no build (`define`, no molde de `__BUILD__`); `Footer.next.tsx` novo (nome provisório: o `SiteShell` antigo ainda usa o `Footer.tsx` atual, e a T3.3 faz `git mv` para `Footer.tsx` e apaga o antigo, o que exige uma frase de exceção ao "mesmo caminho" do TD-018): título, "directed by", lista de definição (roteiro e código, elenco, filmado em, fim), "sem cookies"/"no cookies" e **um único link**, para a home; rótulos em `ui.ts`. A linha "trilha sonora" **não** entra.
- **Testes:** `Footer.test.tsx` e `DecorativeStripe.test.tsx` (V-14): 4 seções, um só link, elenco = versão instalada, cada nome existe em `dependencies`/`devDependencies`, faixa com 5 cores e sem texto.
- **Critérios de aceitação:** nada de texto fixo em componente; paridade PT/EN.
- **Arquivos prováveis:** `src/components/shell/{Footer,DecorativeStripe}.tsx`, `src/content/credits.content.ts`, `vite.config.ts`, `src/i18n/ui.ts`, os testes
- **Verificação:** `npx vitest run src/components/shell/Footer.test.tsx src/components/shell/DecorativeStripe.test.tsx` (exit 0); `npm run verify` (exit 0)

### T3.2 Cabeçalho, botão de tema e menu em tela estreita (TD-010)
- **Requisito:** FR-008, FR-012, FR-013, FR-014, FR-015 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T1.5, T2.2, T2.6
- **Trabalho:** `Header.next.tsx` (nome provisório: o `SiteShell` antigo ainda passa `menuOpen`, `menuId` e `onMenu` ao `Header.tsx` atual, então reescrever o arquivo agora reprovaria o `tsc`; a T3.3 faz `git mv` para `Header.tsx` junto com a troca do `SiteShell`) (marca "duda/portfólio", `<nav aria-label>` com os itens `menu: true` na ordem de `order`, botão de tema, seletor de idioma); `ThemeToggle` (nome acessível fixo "Alternar tema", texto visível do tema de destino por CSS, `aria-pressed` após montar); `Menu.tsx`: **abaixo de 1024 px** um único botão (`aria-expanded`, `aria-controls`, alvo ≥ 44×44 px) e a lista, o tema e o idioma **dentro do painel**, na ordem do FR-016; o botão e a lista **sempre no HTML**, o CSS os esconde sem a classe `js`; foco ao 1º item ao abrir, volta ao botão ao fechar (botão, `Esc`, escolha). **Medir** a largura em que a linha única cabe e confirmar ou propor outro valor ao design (o 1024 px é estimativa). `overflow-wrap: anywhere`; sem rolagem horizontal.
- **Testes:** `Menu.test.tsx` (V-06: `aria-expanded`, foco ao abrir e ao fechar, `Esc`).
- **Critérios de aceitação:** a medição do ponto de quebra está no `evidence.md`; **se não for 1024 px, parar e propor**.
- **Arquivos prováveis:** `src/components/shell/{Header.next,Menu,ThemeToggle}.tsx`, `src/styles/shell.css`, `src/components/shell/Menu.test.tsx`
- **Verificação:** `npx vitest run src/components/shell/Menu.test.tsx` (exit 0); `npm run verify` (exit 0)

### T3.3 `SiteShell` novo no `App`, variante sem casca e páginas sem embrulho (TD-018, TD-024, DQ-018)
- **Requisito:** FR-008, FR-016, FR-041, FR-032 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.1, T3.2
- **Trabalho:** primeiro `git mv` de `Header.next.tsx` e `Footer.next.tsx` para `Header.tsx` e `Footer.tsx` (apagando os antigos) junto com a troca do `SiteShell`, no mesmo commit. `SiteShell({ routeId?, children })` novo no mesmo arquivo: faixa decorativa, skip link, faixa de idioma, `<header>`, `<main id="conteudo" tabindex="-1">`, `<footer>`, na ordem do FR-016; rota `bare` (`route.bare`) renderiza só a faixa e o `main`. `App.tsx` renderiza `<SiteShell routeId>` **fora do `Suspense`**; as **10 páginas** (`DocPage`, `EditorialPage`, `CaseStudy`, `GithubPage`, `Home`, `InfoPages`, `NotFound`, `SectionPage`, `Services`, `TerminalPage`) **param de chamar `<SiteShell>`**, **uma por vez, com o gate verde**; os atributos `badge`, `variant`, `after`, `missingPath` saem (o selo e o `CommandCatalog` do terminal vão para o `main` do terminal; o conteúdo é da spec 009). Ajuste de consultas de testes que assumem a casca antiga (nunca de comportamento); a lista dos testes ajustados vai para o `evidence.md`. `EditorialPage.tsx` e `src/pages/personal` (008) só perdem o embrulho `<SiteShell>`, dentro da exceção estreita da regra "Spec 008" (linha da v1.1).
- **Testes:** `SiteShell.test.tsx` reescrito (V-04 e V-15): skip link primeiro focável, 1 `header`/`nav`/`main`/`footer`, rota `bare` só com faixa e `main`, só uma rota `bare`; **com a faixa de idioma visível (navegador em inglês) ela vem logo depois do skip link na ordem do DOM (FR-016)**.
- **Critérios de aceitação:** nenhum `<SiteShell` fora do `App`; o `verify` passa.
- **Arquivos prováveis:** `src/components/shell/SiteShell.tsx`, `src/App.tsx`, as 10 páginas, `SiteShell.test.tsx`, testes de páginas
- **Verificação:** `git grep -n "<SiteShell" -- src` (só `App.tsx` e testes); `git ls-files src/components/shell | grep -c "\.next\."` (0); `npx vitest run src/components/shell/SiteShell.test.tsx src/App.test.tsx` (exit 0); `git diff --stat -- netlify scripts/personalGuard.ts src/services src/data/personal .env.example` (vazio); `npm run verify` (exit 0)

### T3.4 Remover a casca antiga; paleta só com destinos (TD-018, TD-025 (c), DQ-020)
- **Requisito:** FR-032 · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T3.3
- **Trabalho:** apagar `Sidebar.tsx`, `CommandBar.tsx`, `Window.tsx`, `Taskbar.tsx`, `Breadcrumb.tsx`, `windowManager.tsx`, `windowGeometry.ts`, `Windows.test.tsx`, `workspace.css` **e o `import './styles/workspace.css'` de `src/main.tsx:15`** (sem isso o `vite build` falha), o bloco `.grid-bg` de `base.css` (**e a isenção `.grid-bg` do `styles.test.ts` da T1.1**) e a parte de `shell.css` que não é da casca nova; `commandBarEvents.ts` perde `SHOW_OUTPUT` e `openShortcuts`; a paleta (`CommandPalette`, `paletteItems.ts`) oferece **só destinos de página** (os itens `run` saem até a 009) e não é montada na rota `bare` (`GlobalOverlays`); `src/data/shortcuts.ts` perde "/ foca a barra de comandos" e o teste que o cobre. `ViewActions.tsx` fica (usado por `terminal/outputs.tsx`). **`e2e/site.e2e.ts` (A-07):** ajustar só o que assume a casca antiga (a barra de comandos, a janela, a barra lateral).
- **Testes:** os testes do código removido saem junto; testes da paleta e de `shortcuts` ajustados; `e2e/site.e2e.ts` ajustado e executado (o `verify` não roda e2e).
- **Critérios de aceitação:** nenhum import dos arquivos removidos; o terminal ainda compila; `git grep -n -i "gradient(" -- src/styles` (exit 1); `e2e/site.e2e.ts` passa.
- **Arquivos prováveis:** os listados, mais `src/main.tsx`, `src/components/CommandPalette.tsx`, `src/components/paletteItems.ts`, `src/components/GlobalOverlays.tsx`, `src/data/shortcuts.ts`, `e2e/site.e2e.ts`, `src/styles/styles.test.ts`
- **Verificação:** `git grep -n -E "WindowProvider|Taskbar|components/shell/(CommandBar|Sidebar|Window)" -- src` (exit 1); `git grep -n "workspace.css" -- src index.html` (exit 1); `git grep -n -i "gradient(" -- src/styles` (exit 1); `npx playwright test e2e/site.e2e.ts` (exit 0); `npx vitest run src/components src/data/shortcuts.test.ts` (exit 0); `npm run verify` (exit 0)

### T3.5 Terminal fora do 1º acesso (TD-025 (a), R-001)
- **Requisito:** NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T3.4
- **Trabalho:** `TerminalProvider` e a sessão do terminal deixam de embrulhar toda página em `App.tsx`: ficam no chunk da rota `/terminal` e nos componentes que realmente os usam; `RunButton` degrada para navegar ao terminal ou carrega o provedor sob demanda; o provedor perde o histórico ao sair de `/terminal` (aceito). Medir o chunk de entrada (`vite build`) antes e depois e registrar no `evidence.md`.
- **Testes:** testes do terminal e de `RunButton` ajustados; um teste confere que `App.tsx` não importa `TerminalSession` de forma estática.
- **Critérios de aceitação:** `src/terminal` fora do chunk de entrada (conferido pelo build); o terminal continua funcionando em `/terminal`.
- **Arquivos prováveis:** `src/App.tsx`, `src/pages/lazyPages.ts`, `src/components/RunButton.tsx`, `src/terminal/TerminalSession.tsx`, testes
- **Verificação:** `git grep -n "TerminalSession" -- src/App.tsx` (exit 1); `npx vitest run src/terminal src/components/RunButton` (exit 0); `npm run verify` (exit 0)

### T3.6 Sugestões na 404 (TD-022)
- **Requisito:** FR-027, FR-039 · **Prioridade:** P1 · **Estimativa:** 2 h · **Dependências:** T3.3
- **Trabalho:** `suggestRoutes(path, lang)` (função pura, distância de edição sobre o último segmento, até 3 rotas `menu: true`, desempate pela ordem; sem semelhança, as 3 primeiras); `NotFound` mostra as sugestões **depois da hidratação** (o HTML estático traz as 3 primeiras), mantém os links para a home e para o menu; sem o "cd /curriculos".
- **Testes:** `suggestRoutes.test.ts` e `NotFound.test.tsx` (V-14).
- **Critérios de aceitação:** sugestões reais, no máximo 3, links presentes.
- **Arquivos prováveis:** `src/data/suggestRoutes.ts`, `src/pages/NotFound.tsx`, os testes
- **Verificação:** `npx vitest run src/data/suggestRoutes.test.ts src/pages/NotFound.test.tsx` (exit 0); `npm run verify` (exit 0)

### T3.7 Cabeçalhos de segurança e regras de 404 no `netlify.toml` (TD-014, TD-015)
- **Requisito:** FR-027, FR-031, NFR-002 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T2.4
- **Trabalho:** `scripts/headers.test.ts` lê o `netlify.toml` e falha se `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` ou uma `Permissions-Policy` com `camera=()`, `microphone=()` e `geolocation=()` faltar em `for = "/*"`; `[[redirects]]` na ordem: `/en/` → `/en` (301), `/en/*` → `/en/404.html` (404), `/*` → `/404.html` (404), sem `force`. **Não** mexer no bloco `[functions]` (008). Sem CSP (TD-015).
- **Testes:** `headers.test.ts` (V-10): os 4 cabeçalhos e a ordem das regras.
- **Critérios de aceitação:** o teste falha ao remover um cabeçalho (provar com uma cópia temporária).
- **Arquivos prováveis:** `netlify.toml`, `scripts/headers.test.ts`
- **Verificação:** `npx vitest run scripts/headers.test.ts` (exit 0); `git diff -U0 -- netlify.toml | grep -n "functions"` (exit 1, ou seja, o bloco `[functions]` não aparece no diff); `npm run verify` (exit 0)

### T3.8 Estado nunca só por cor (TD-023)
- **Requisito:** FR-040 · **Prioridade:** P1 · **Estimativa:** 2 h · **Dependências:** T3.2
- **Trabalho:** `aria-current="page"` no item atual do menu e `aria-current="true"` no idioma atual; CSS dá sublinhado e peso a `[aria-current]`, `[aria-pressed="true"]` e `[aria-expanded="true"]`; `src/styles/state.test.ts` lê o CSS e falha se uma regra de estado mudar só `color` ou `background`.
- **Testes:** `state.test.ts` (V-14).
- **Critérios de aceitação:** o teste falha com uma regra plantada que só muda a cor.
- **Arquivos prováveis:** `src/styles/shell.css`, `src/styles/state.test.ts`
- **Verificação:** `npx vitest run src/styles/state.test.ts` (exit 0); `npm run verify` (exit 0)

---

## Fase 4: Pré-render
### T4.1 `entry-server` e montador do documento (TD-008)
- **Requisito:** FR-028 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T0.1 (veredito viável), T3.3, T2.3
- **Trabalho:** `src/entry-server.tsx` com `renderRoute(path, lang)` (`prerender` de `react-dom/static`) e o **montador do documento** (`<head>` + casca + `main`, `lang`, `hreflang`, boot, `modulepreload`), exportado para o plugin e para o teste; a casca e as páginas só leem dado determinístico (nada de `window`/`localStorage`/`matchMedia` fora de `useEffect`).
- **Testes:** `scripts/prerender.test.ts` (inclui o `data-shell="bare"` no HTML do terminal e só nele) no projeto `unit` (Node, sem o `setup.ts` que troca `lazyPages`): para **cada rota × idioma**, `<main>`, **um** `<h1>`, casca, `lang`, `hreflang` recíproco (404 e `/_prova` sem), script de boot antes do CSS e síncrono (V-09).
- **Critérios de aceitação:** o HTML de cada rota × idioma é gerado em memória e passa nas checagens.
- **Arquivos prováveis:** `src/entry-server.tsx`, `src/router.tsx`, `scripts/prerender.test.ts`
- **Verificação:** `npx vitest run scripts/prerender.test.ts` (exit 0); `npm run verify` (exit 0)

### T4.2 Plugin de pré-render dentro do `vite build` (TD-008, TD-014)
- **Requisito:** FR-027, FR-028 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T4.1
- **Trabalho:** o plugin (substitui o `<noscript>` de `scripts/seoPlugin.ts`) roda em `closeBundle` e dispara o build do servidor aninhado (`configFile: false`, plugins explícitos, `copyPublicDir: false`, `emptyOutDir`, nunca o próprio plugin), lê `build.manifest: true`, grava o HTML de cada rota × idioma (`dist/<pt>.html`, `dist/en/<en>.html`, **home EN em `dist/en.html`**, PT em `dist/index.html`), `dist/404.html` e `dist/en/404.html`; **falha o build** sem `<main>` ou sem `<h1>`; grava `data-shell="bare"` no `<html>` da rota `bare` (T1.3 lê); apaga `.prerender/` (sucesso ou falha) e `dist/.vite/`. Acrescentar `.prerender` e `dist-prova` ao `.gitignore`, ao `.prettierignore` e ao `ignores` do `eslint.config.js`. `scripts/checkDist.mjs` confere o `dist` real (cada rota × idioma com `<main>` e um `<h1>`).
- **Testes:** teste do plugin (recursão evitada, limpeza, falha sem `<h1>`); `checkDist.mjs` coberto por teste unitário; `data-shell="bare"` só no HTML do terminal.
- **Critérios de aceitação:** `npm run verify` (que só roda `vite build`) já cobre o pré-render; `node scripts/checkDist.mjs dist` sai 0. **Medir e registrar no `evidence.md` o tempo da suíte e do `verify` depois do pré-render (orçamento da 001: suíte ≤ 90 s, `verify` ≤ 180 s); se estourar, parar e avisar a Duda.**
- **Arquivos prováveis:** `scripts/seoPlugin.ts`, `vite.config.ts`, `scripts/checkDist.mjs`, `.gitignore`, `.prettierignore`, `eslint.config.js`, testes
- **Verificação:** `npx vitest run scripts/seoPlugin.test.ts scripts/checkDist.test.ts` (exit 0); `npm run verify` (exit 0); `node scripts/checkDist.mjs dist` (exit 0)

### T4.3 Hidratação no cliente (TD-008)
- **Requisito:** FR-028 · **Prioridade:** P0 · **Estimativa:** 2 h · **Dependências:** T4.2
- **Trabalho:** `main.tsx` usa `hydrateRoot` quando o `#root` tem filhos e `createRoot` no `vite dev` (o import de `workspace.css` já saiu na T3.4; aqui só se confere que `shell.css` antigo não volta); `RouterProvider` e provedores iniciam do estado determinístico.
- **Testes:** `main`/`App.test.tsx` (hidratação sobre o HTML gerado por `renderRoute`, sem aviso no console).
- **Critérios de aceitação:** nenhum aviso de hidratação no teste; o `vite dev` continua abrindo o site.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.test.tsx`
- **Verificação:** `npx vitest run src/App.test.tsx` (exit 0); `npm run verify` (exit 0)

---

## Fase 5: Build de prova e medição
### T5.1 Rota `/_prova` e `build:prova` (TD-009)
- **Requisito:** FR-016, NFR-001 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T4.2
- **Trabalho:** declarar `/_prova` na tabela (`prova: true`, `prova` sem `menu`) **junto com o filtro**, na mesma tarefa: sem `__PROVA__` (cliente) e sem a opção do plugin (Node) a rota não existe nem é pré-renderizada. A página de prova (h1, h2, h3, 3 parágrafos de exemplo marcados como exemplo, link de texto, botão principal e secundário, figura com `alt` e dimensões, 5 etiquetas, rodapé com link para a home) em `src/pages/Prova.tsx`; `npm run build:prova` = `vite build --mode prova` para `dist-prova/`, com `__PROVA__` (cliente) e opção do plugin (Node), `noindex`, fora do menu e do sitemap; o publicado nunca a contém. Teste que compara as duas configurações e falha se divergirem além do `mode`, do `outDir` e do `noindex`.
- **Testes:** `routes.test.ts` (sem `__PROVA__` a rota é filtrada); teste de configuração; `checkDist.mjs` falha se achar `_prova` em `dist/`.
- **Critérios de aceitação:** `dist/` sem `_prova`; `dist-prova/` com a rota.
- **Arquivos prováveis:** `src/pages/Prova.tsx`, `vite.config.ts`, `package.json`, `scripts/checkDist.mjs`, testes
- **Verificação:** `npx vitest run src/data/routes.test.ts scripts/buildConfig.test.ts` (exit 0); `node scripts/checkDist.mjs dist` (exit 0, sem `_prova`); `npm run build:prova` (exit 0); `npm run verify` (exit 0)

### T5.2 Servidor de teste e e2e da casca (V-07, V-11)
- **Requisito:** FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-030 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T5.1
- **Trabalho:** `scripts/serveDist.mjs` (servidor estático que imita a Netlify: `/projetos` → `projetos.html`, cabeçalhos do `netlify.toml`, 404 por idioma, `/en/` → `/en`); `playwright.config.ts` com dois servidores (o `vite` atual para os e2e existentes, inclusive `e2e/site.e2e.ts`, e o estático para `dist-prova`); um caso com `locale` do navegador em inglês confere que a faixa de idioma é o 2º foco, logo depois do skip link (FR-016); `e2e/shell.e2e.ts` sobre `dist-prova`: a **sequência real de Tab** igual à do FR-016 (calculada da tabela de rotas), sem rolagem horizontal em 360, 1023, 1024 e 1920 px, botão do menu presente em 1023 px e ausente em 1024 px, todo controle do menu com `boundingBox` ≥ 44×44, anel de foco visível, console sem aviso de hidratação, **toda requisição do carregamento é da mesma origem**.
- **Testes:** `e2e/shell.e2e.ts` (V-07, V-11).
- **Critérios de aceitação:** o e2e passa nos 2 temas × 2 idiomas.
- **Arquivos prováveis:** `scripts/serveDist.mjs`, `playwright.config.ts`, `e2e/shell.e2e.ts`
- **Verificação:** `npm run build:prova && npx playwright test e2e/shell.e2e.ts` (exit 0); `npm run verify` (exit 0)

### T5.3 Medição de tamanho, desempenho e acessibilidade (TD-019, DQ-010)
- **Requisito:** NFR-001, NFR-003 · **Prioridade:** P0 · **Estimativa:** 4 h · **Dependências:** T5.2, T3.5
- **Trabalho:** adicionar `@axe-core/playwright` e `lighthouse` às `devDependencies` (só desenvolvimento); `scripts/lighthouseRun.mjs` e `scripts/inpRun.mjs` (Lighthouse usa o Chromium do Playwright via `chrome-launcher`; se não achar o Chrome, parar e avisar) e `scripts/measureBundle.mjs` (gzip de JS e CSS referenciados no HTML da `/_prova`, inclui `modulepreload`; falha se JS > **100 KB** ou CSS > **20 KB**) com teste unitário; `npm run prova` = `build:prova` + `measureBundle` + e2e + axe (0 violações nos 2 temas × 2 idiomas) + Lighthouse perfil celular (3 execuções, mediana; LCP ≤ 2,5 s, CLS ≤ 0,1 também com a faixa visível e **confirmando que o 1º desenho já reserva o espaço**, notas de acessibilidade e boas práticas ≥ 95) + INP em laboratório (CPU 4× mais lenta, ≤ 200 ms). **Se JS passar de 100 KB ou o CSS de 20 KB: parar e propor à Duda** (subir o número ou cortar escopo), sem editar a meta.
- **Testes:** teste unitário de `measureBundle`; a medição é o próprio `npm run prova`.
- **Critérios de aceitação:** os números e a versão de cada ferramenta registrados no `evidence.md`; `npm audit --omit=dev` continua 0.
- **Arquivos prováveis:** `package.json`, `package-lock.json`, `scripts/measureBundle.mjs`, `scripts/measureBundle.test.ts`, `scripts/lighthouseRun.mjs`, `scripts/inpRun.mjs`, `e2e/prova.e2e.ts`
- **Verificação:** `npx vitest run scripts/measureBundle.test.ts` (exit 0); `npm run prova` (exit 0); `npm audit --omit=dev` (exit 0); `npm run verify` (exit 0)

---

## Fase 6: Fechamento
### T6.1 Aceite final e checklist dos Success Metrics
- **Requisito:** todos, FR-033, FR-032, Success Metrics · **Prioridade:** P0 · **Estimativa:** 3 h · **Dependências:** T5.3
- **Trabalho:** `npm run verify` 3 vezes (máquina ociosa), **registrando o tempo de cada execução e da suíte contra o orçamento (suíte ≤ 90 s, `verify` ≤ 180 s)**, `npm run prova`, `node scripts/checkDist.mjs dist` (sem `_prova`), V-12 (`git grep` das peças antigas), nenhuma referência aos 3 temas extras, `git ls-files .github` e `git ls-files src.zip` vazios, `git diff --stat main...HEAD -- netlify scripts/personalGuard.ts src/services src/data/personal .env.example` sem nada da 008 (a lista fechada) e `git diff --name-only` em `src/components/personal`, `src/pages/personal` e testes da 008 só com o que a exceção estreita da v1.1 permite (T2.1, T2.5, T3.3); lista de nomes do bloco `/* LEGADO */` de `tokens.css` que ainda estão em uso (cada spec de página os apaga); checklist de cada Success Metric do requirements com o teste que o prova; `FR-033` conferido (terminal e CI fora).
- **Testes:** os comandos acima são a verificação.
- **Critérios de aceitação:** todo item do Success Metrics marcado com evidência; `src.zip` intacto e fora do repositório.
- **Arquivos prováveis:** `evidence.md`
- **Verificação:** `npm run verify` (3 vezes, exit 0); `npm run prova` (exit 0); `node scripts/checkDist.mjs dist` (exit 0); `git ls-files .github src.zip` (vazio)

---

## Phase dependencies
```
T0.1 ─► T1.1 (e tudo depois dela) ─────────────────────────────────┐
T1.1 ─► T1.2 ─► T1.3 ─┐          └─► T2.1 (depende de T1.2) ─► T2.2 │
  └────► T1.4 ───────┴─► T1.5 ─────────────────────► T2.2 ─► T2.3 ─┐          │
                                           └─► T2.4 ─► T2.5 ─► T2.6
T3.1 (T1.1, T1.4) ─┐                                    │          │
T3.2 (T1.5, T2.2, T2.6) ─► T3.3 ─► T3.4 ─► T3.5          │          │
                           ├─► T3.6                      │          │
T2.4 ─► T3.7           T3.2 ─► T3.8                      │          │
                           T3.3, T2.3, T0.1 ─► T4.1 ─► T4.2 ─► T4.3 ─► T5.1 ─► T5.2 ─► T5.3 ─► T6.1
```
- Dentro de uma fase as tarefas são sequenciais salvo as setas acima; **uma tarefa e um commit de cada vez**, cada uma com o `verify` verde.
- **A Fase 4 e a Fase 5 só começam se a T0.1 disser "viável"** e dependem da T3.3. A T3.5 vem antes da T5.3 (a medição precisa do terminal fora do 1º acesso).
- A T2.1 mexe em arquivos da 008 **só** no que a Duda autorizou (DQ-017).

## Lacunas, propostas e perguntas abertas
| ID | Lacuna ou ambiguidade | Proposta (a Duda decide) |
| --- | --- | --- |
| DQ-003 | Pesos das fontes IBM Plex dependem do teste de peso | Resolvida pela T1.4; se estourar 4 arquivos ou o LCP, volta à Duda (plano B: fonte do sistema) |
| DQ-022 | O ponto de quebra de 1024 px do menu é estimativa | A T3.2 mede e, se o valor for outro, propõe a troca (a Duda aprova) |
| DQ-023 | A meta de 100 KB (gzip) pode não caber (R-001) | A T3.5 mede o ganho e a T5.3 confere; se não couber, a Duda decide (subir o número ou cortar escopo) |
| DQ-024 | O build de pré-render pode não fechar dentro do `vite build` (R-002) | A T0.1 decide; sem "viável", as Fases 4 e 5 voltam à Duda |
| DQ-025 | A regra de 404 por idioma e de `/en` só se confirma no deploy (R-008) | Os testes cobrem o arquivo e o servidor de teste; a confirmação real é da spec 010 |
| Nota | Os arquivos `.prettierignore`, `eslint.config.js` e `.gitignore` ganham `dist-prova` e `.prerender` na T4.2 | Sem isso o `verify` seguinte reprovaria |

## Confirm before building
Antes de qualquer tarefa de implementação, o implementador **restata com as próprias palavras** e espera o **OK explícito da Duda**:
1. **FRs (resumo):** casca com skip link, cabeçalho com menu pela tabela de rotas, tema claro/escuro sem flash, idioma pela URL (PT na raiz, EN em `/en/`) com faixa de oferta que nunca redireciona, 404 por idioma com sugestões, HTML por rota com conteúdo sem JavaScript, rodapé de créditos com elenco lido do projeto, faixa decorativa, estado nunca só por cor, variante sem casca para o terminal, fontes próprias, cabeçalhos de segurança, medição num build de prova.
2. **Restrições:** branch `rebuild/sdd`, **nenhum `git push`** e nenhum merge na `main`; `src.zip` não é apagado nem comitado; nada da 008 é tocado **exceto extrair o cálculo de `draft` de `routes.ts` (T2.1) e a exceção estreita só de teste e casca (T2.5, T3.3), se a Duda aprovar este `tasks.md` com ela**; cada tarefa com `verify` verde e bloco de evidência; a página `/_prova` nunca no build publicado; meta de 100 KB (gzip) e 20 KB de CSS **não são editadas em silêncio**.
3. **Perguntas abertas:** só a DQ-003 (T1.4); DQ-022 a DQ-025 (antes TL-001 a TL-004) são conferidas por medição.
4. **Ação da Duda:** apagar `GEMINI_API_KEY` e `GEMINI_MODEL` no painel do Netlify e revogar a chave (PEND-005).
Nada de código antes de `tasks:approved`.
