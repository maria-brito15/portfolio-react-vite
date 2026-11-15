# 001 — Auditoria do portfólio atual

**Data:** 2026-11-15 · **Escopo:** somente leitura (única escrita: este arquivo e o `.status`) · **Estado:** `idea:captured`

## Decisões já dadas pela Duda (pré-Fase 1)
- D-A: `AGENTS.md` é o arquivo de entrada; `CLAUDE.md` será **removido na Fase 2** (diff mostrado antes).
- D-B: `.ai/sdd/` **substitui** `docs/specs/`. Apagar só na Fase 2, com a lista para confirmar.
- D-C: os arquivos deletados no working tree (`docs/specs/*`, `docs/sdd-terminal-v2/*`, `docs/screenshots/*`) são o estado atual; nada foi restaurado.

## 1. Inventário
- **Stack:** React 19, Vite 6.4, TypeScript 6 (strict), Vitest 5 + Testing Library, Playwright (e2e), ESLint 9 + Prettier 3 (`package.json`).
- **Dependências de produção (só 3):** `react`, `react-dom`, `@emailjs/browser`, `@netlify/blobs` (4 no total). Sem roteador, sem biblioteca de UI/CSS (`router.tsx`: History API própria).
- **Desatualizadas (`npm outdated`):** majors à frente em eslint 10, vite 8, typescript 7, vitest/jsdom/plugin-react; `@emailjs/browser` 4→5. Nenhuma urgente.
- **Vulnerabilidades:** `npm audit --omit=dev` → 0.
- **Scripts:** dev, build (`tsc --noEmit && vite build`), typecheck, lint, test, e2e, `ask:eval`, `personal:probe`, `personal:import-letterboxd`.
- **Deploy:** Netlify (`netlify.toml`: headers de segurança, cache imutável em `/static` e `/fonts`, functions em `netlify/functions`). `vercel.json` (`cleanUrls`) é resquício de outro host.
- **CI:** **não há** `.github/` nem pipeline. A verificação é só local.
- **Env (`.env.example`):** EmailJS (3 IDs públicos), Hardcover, TMDB, Letterboxd, segredos de refresh/build hook, `VITE_CADERNO_V2`. `.env` existe localmente, está no `.gitignore` e **não** está versionado (`git check-ignore`). Não li os valores.

## 2. Arquitetura
- SPA com **prerender de HTML por rota**: `scripts/seoPlugin.ts` grava um `.html` por rota em `dist/` (ex.: `projetos.html`, `pessoal.html`) e o Netlify serve `404.html` com status 404 real. O núcleo funciona sem JS só para meta/SEO; o conteúdo depende do React (a verificar na Fase 3, ver §7).
- Rotas e seções numa tabela única: `src/data/routes.ts` (415 linhas) e `sections.ts` (260). Terminal é a home original; hoje recua para `/terminal` atrás da flag `CADERNO_V2` (`src/config.ts`).
- i18n PT/EN em `src/i18n/ui.ts`; conteúdo em `src/data/*` (44 arquivos).
- Backend leve: 3 Netlify Functions (`ask.mts` assistente com Gemini; `personal-books.mts` Hardcover; `personal-films.mts` Letterboxd RSS + TMDB), com cache em Netlify Blobs e limite por IP.
- Estilo: CSS puro por arquivo (`src/styles/*.css`, 15), tokens em `tokens.css`, 5 temas.

## 3. Páginas, rotas e componentes (321 arquivos em `src/`)
Páginas: Home, Terminal, Currículo, Acadêmico, Serviços, Projetos/SectionPage, CaseStudy (3 casos: agape, becas, ecoshop), GameCenter, GitHub, Info, NotFound, e o espaço `/pessoal` (livros, filmes, música, teatro; 38 componentes). Extras com custo de manutenção alto e relação fraca com "portfólio de engenharia": trilhas gamificadas (`src/trails`), personas, jogos de terminal, assistente de IA, 5 temas.
Reuso potencial alto: `components/personal/*` (RatingStars, ShelfGrid, DiaryEntry, FilmPoster, CoverFigure) são o embrião do conceito Letterboxd.

## 4. Conteúdo e ativos a migrar
- **Projetos:** `src/data/projects.tsx` (Planoriza, ShortURL, File Name Standardizer, WhatsApp Dispatcher e outros), com datas só de ano em alguns casos e pendências declaradas no próprio arquivo (meses, capturas).
- Experiências, acadêmico (disciplinas e notas), currículo, habilidades com `skillTimeline`, serviços, textos PT/EN.
- Imagens: `public/cases/{agape,becas,ecoshop}`, `public/assets/{og-image.png,portfolio.jpeg}` (foto da autora), ícones. Fontes self-hosted: JetBrains Mono e Fraunces (OFL).
- Dados culturais: `netlify/personal/data`, `src/data/personal/*` (curadoria manual de música e teatro). O CSV do Letterboxd é ignorado pelo git de propósito.
- Site original estático em `docs/site-original/{pt,en}` (referência histórica).

## 5. Design
Tokens em `tokens.css`, duas famílias (JetBrains Mono + Fraunces), sem degradê, 5 temas (dark, light, dracula, solarized, amber), teste de contraste (`contrast.test.ts`), `responsive.css`, `resume.css` para impressão. A regra "mono único" foi substituída por duas vozes pela spec `caderno-vol-xi`.

## 6. Sinais de qualidade (comandos reais, 2026-11-15)
| Claim | Comando | Exit | Resumo | Veredito |
| --- | --- | --- | --- | --- |
| Tipos estritos | `npm run typecheck` | 0 | sem erros | PASS |
| Lint | `npm run lint` | 0 | sem saída de erro | PASS |
| Testes | `npm test` | 1 | 3 arquivos falharam, 73 passaram, 1 ignorado (77); 5 testes falharam, 1060 passaram, 18 ignorados; 22 erros; duração 638 s. Falhas em `experiences.test.tsx`, `trails/gamification.test.tsx` e `data/trails.test.tsx` (testes de página inteira, 5–22 s cada). Rodou concorrente com `npm outdated`/`audit`, o que pode ter inflado o tempo; a causa não foi investigada | **FAIL** |
| Build | `npm run build` | 0 | built in 9 s; maior chunk `index` 450 kB (143 kB gzip), `CaseStudy` 113 kB (32 kB gzip) | PASS |
Observação: 97 arquivos de teste. Muitos renderizam o site inteiro em jsdom e levam 5–45 s cada; a suíte é lenta o bastante para ser desincentivo a rodá-la. Um primeiro `typecheck` registrou exit 1 por erro meu de redirecionamento de log (permissão), não do código; a repetição deu 0.

## 7. Não funcionais
- **Bundle (dist):** 807 KB de JS em 44 chunks e 128 KB de CSS (totais em disco, sem gzip); `dist` inteiro 2,5 MB. A spec antiga registra TR-27 (peso acima do teto) como decisão pendente.
- **Imagens:** poucas e pequenas (`public` 1,2 MB). Falta checar dimensões explícitas e alt text por amostragem (Fase de design).
- **A11y/SEO/Core Web Vitals:** não medidos nesta auditoria (sem Lighthouse/axe rodado). Há SEO por rota, canonical, JSON-LD, `robots`/noindex em rotas de persona, `theme-color`, manifest. Registrar como lacuna.
- **Segurança:** headers básicos no Netlify (nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy). **Sem CSP.** Segredos só no servidor; há teste de varredura (`netlify/assistant/secrets.test.ts`, `personalGuard`). IDs do EmailJS são públicos por design.
- **Termos de API:** Hardcover/TMDB/Letterboxd já integrados. Verificar atribuição e termos vigentes antes de reaproveitar (exigência do §2.3 do prompt); o código tem `AttributionFooter`.

## 8. Dívida técnica e código morto
- `vercel.json` sem uso aparente; `LEIA-ME-skills.md`, `SKILLS.md`, `roadmap-personas-site.md` (25 KB) e README de 35 KB sobrepõem-se e envelhecem.
- Arquivos com marcadores TODO/FIXME: `notebook/Cover.tsx`, `data/notebook/cover.ts`, `personal/music.ts`, `personal/theater.ts`.
- Flag `CADERNO_V2` mantém dois sites em paralelo (shell antigo e editorial): complexidade dobrada até a decisão final.
- `.claude/settings.local.json` guarda caminhos absolutos de outra máquina/sessão (`Downloads/portfolio-react-vite`).
- Superfície grande para um portfólio: personas, trilhas, jogos, assistente, 5 temas.

## 9. Histórico git
94 commits, quase todos entre 2026-11-12 e 11-14: sprint de features (trilhas, personas, assistente de IA, `/pessoal`, gate SDD). Maior churn: `docs/specs/README.md`, `docs/sdd-terminal-v2/*`, `src/i18n/ui.ts`, `src/terminal/commands.tsx`, `routes.ts`, `tokens.css`. Abandonado: aviso-mobile (removido), trilhas com TR-27 pendente. Há **215 mudanças não commitadas** (deleção das specs e capturas, `.env.example` e `CLAUDE.md` alterados).

## 10. Docs e arquivos de agente
`CLAUDE.md` (2,4 KB, gate `.status` + regras; modificado, não commitado), README (35 KB), `SKILLS.md`, `LEIA-ME-skills.md`, 11 skills em `.claude/skills/` (7 mais específicas do site atual, 4 genéricas de engenharia). `docs/specs/` no HEAD tinha 22 specs com `.status` em `requirements:draft`; no working tree só restam `GATES.md` e `README.md`.

## 11. Conhecimento tácito (insumo para steering e Implementation FAQ)
- Datas de projeto: o mês só entra quando a autora confirma; sem mês, mostra só o ano e marca a ordem como indeterminada.
- "Nada de dado inventado": mocks em `/pessoal` são bloqueados no build de produção (`personalGuard`).
- Texto de interface sempre nos dois idiomas; saída do terminal é função do idioma.
- Uma rota/seção só existe em `routes.ts`/`sections.ts`.
- Dois botões de segredo: IDs EmailJS públicos vs. tokens só no servidor.
- Cache dos livros 6 h e do diário de filmes 1 h (decisão D9 da spec `personal`).
- Datas e fonte dos dados de Hardcover/Letterboxd dependem de contas reais ainda "não validadas" segundo a spec.

## 12. Manter / Reescrever / Descartar / Migrar como conteúdo
| Item | Veredito | Motivo |
| --- | --- | --- |
| Conteúdo (projetos, experiências, acadêmico, currículo, textos PT/EN) | **Migrar como conteúdo** | É o ativo insubstituível; vira conteúdo tipado e validado |
| Imagens de casos, foto, og-image | **Migrar** | Próprias da autora; revisar alt e dimensões |
| Fontes self-hosted (JetBrains Mono, Fraunces) | **Manter (a decidir na Fase 1)** | Livres (OFL), já otimizadas; depende da identidade visual nova |
| Integração Hardcover/Letterboxd/TMDB (`netlify/personal`, `services/integrations`) | **Manter/adaptar** | Já resolve filmes e livros, com cache e testes; reaproveitar termos verificados |
| Componentes `components/personal/*` | **Reescrever a partir deles** | Bons como molde do Letterboxd, acoplados ao design atual |
| Terminal, jogos, trilhas, personas, assistente de IA | **Decidir na Fase 1** | Grande custo de manutenção; alinhamento com "engenharia primeiro" incerto. Nenhum será apagado sem sua aprovação |
| Roteador próprio, i18n, SEO plugin por rota | **Decidir (design)** | Funcionam; avaliar se um framework com prerender simplifica |
| `docs/specs/*`, `docs/sdd-terminal-v2` | **Substituir** (D-B) | Origem de requisitos a migrar para `.ai/sdd/`; apagar só na Fase 2 |
| `CLAUDE.md`, `SKILLS.md`, `LEIA-ME-skills.md`, `roadmap-personas-site.md` | **Descartar/condensar** (D-A) | Substituídos por `AGENTS.md` e steering; confirmar na Fase 2 |
| `vercel.json` | **Descartar (confirmar)** | Deploy é Netlify |
| CI | **Criar** | Hoje não existe; o `verify` precisa de gate automático |

## Lacunas desta auditoria (não medi)
Lighthouse/CWV, axe, contraste real nas telas, amostragem de alt text, cobertura de testes, conteúdo sem JS, uso real de cada dependência e de cada rota (sem analytics). Ficam como entrada da Fase 1.

## Perguntas para a Fase 1
Público e metas mensuráveis; peso do conteúdo cultural; destino do terminal/jogos/trilhas/personas/assistente; onde a reconstrução mora (novo repo ou branch); stack alvo e motivo; analytics e privacidade; um idioma ou dois.
