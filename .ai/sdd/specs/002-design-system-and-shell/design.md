# 002 Design system and shell, Design
**Status:** approved (aprovado pela Duda em 2026-11-17; ver `.status`) · **Versão:** 2.4 (T5.3: DQ-027, nome acessível do botão de tema com o destino; antes, v2.3: T2.2: campos `title` e `description` na tabela de rotas, sem tocar no `desc` curto, DQ-026; sobre a 2.2 com as duas revisões em contexto novo aplicadas) · **Autor:** Claude (rascunho para a Duda) · **Data:** 2026-11-17
**Entrada:** `requirements.md` v1.6 (aprovada em 2026-11-17), `spike-001.md` (medição do `dist`), `design-reference/README.md` e `telas-e-requisitos.md` (referência visual, não é especificação) e as telas `mockup/Tokens`, `Mobile`, `NotFound`, `Projetos` e `Terminal` (lidas em 2026-11-17; ver "Divergências entre o mockup e este design"), `.ai/steering/*` e o design da 001 (`review:done`).

## Executive Summary
A casca nova substitui no lugar a casca "terminal/IDE" de hoje (cabeçalho, barra de comandos, barra lateral, janela, barra de tarefas). Ela entrega, em toda página: link "ir para o conteúdo", cabeçalho com menu lido da tabela de rotas, seletor de tema (claro e escuro) e de idioma (PT na raiz, EN sob `/en/`), `main` e rodapé. Seis decisões sustentam o resto:
1. **Um conjunto de tokens, dois temas** (tokens e contraste já calculados, seção "Tokens propostos").
2. **A URL decide o idioma**, nunca o `localStorage`: nada redireciona; a escolha gravada só silencia a faixa de oferta do inglês (TD-007, TD-012).
3. **Pré-render por rota** no build, com hidratação no cliente, para o HTML já trazer casca e conteúdo sem JavaScript (FR-028, TD-008). O SPIKE-001 mediu que o HTML de hoje não cumpre isso: só tem um `<h1>`, uma frase e 11 links fixos.
4. **Build de prova** (`vite build --mode prova`) com a rota `/_prova`, onde se medem tamanho, desempenho, acessibilidade e ordem do foco (TD-009).
5. **Orçamento de JavaScript de 100 KB (gzip).** O piso do React é 67,5 KB; sobram ~32,5 KB para a casca e o que ela carrega no 1º acesso (hoje o código do site no 1º acesso é ~50,7 KB). O terminal e `src/data` saem do 1º acesso (TD-025).
6. **Tabela de rotas estendida em `src/data/routes.ts`**, não reescrita, para o terminal e as specs seguintes continuarem lendo dela (TD-006).

Nada aqui foi aprovado. Onde há escolha que é da Duda, está marcada como `DQ-NNN` com a minha recomendação.

## Requirements Mapping
| Requisito | Decisão / seção | Verificação |
| --- | --- | --- |
| FR-001 Fonte única de tokens | TD-001, TD-017 | V-01 |
| FR-002 Dois temas, sem degradê | TD-001, TD-005, TD-011 | V-02 |
| FR-003 Tema da primeira visita | TD-011 | V-03 |
| FR-004 Escolha do tema | TD-011 | V-03 |
| FR-005 Tema antes do 1º desenho | TD-011 (script de boot no `<head>`) | V-03, V-09 |
| FR-006 Armazenamento bloqueado e o tema | TD-011 | V-03 |
| FR-007 Contraste | TD-003 | V-01 |
| FR-008 Casca (skip link, cabeçalho, `main`, rodapé) | Interface Contract, TD-010, TD-024 (exceção do terminal) | V-04 |
| FR-009 Tabela única de rotas | TD-006 | V-05 |
| FR-010 Rota fora do menu | TD-006 | V-05 |
| FR-011 Rota sem texto em um idioma | TD-006 (schema + paridade da 001) | V-05 |
| FR-012 Sem rolagem horizontal (360 a 1920 px) | TD-010, TD-017 | V-07 |
| FR-013 Menu em tela estreita | TD-010 (ponto de quebra 1024 px) | V-06, V-07 |
| FR-014 Foco no menu | TD-010 | V-06 |
| FR-015 Alcance por teclado | TD-010 | V-06, V-07 |
| FR-016 Ordem do foco | Interface Contract (ordem do DOM), TD-009 | V-07 |
| FR-017 Foco visível ≥ 3:1 | TD-004 | V-01, V-07 |
| FR-018 Movimento reduzido | TD-004 | V-01 (CSS lido) |
| FR-019 Idiomas PT e EN | TD-007 | V-05, V-08 |
| FR-020 Endereço por idioma | TD-006, TD-007 | V-05 |
| FR-021 Troca leva à mesma página | TD-007 | V-08 |
| FR-022 Escolha de idioma gravada | TD-007, TD-012 | V-08 |
| FR-023 `lang` do documento | TD-013 | V-09 |
| FR-024 `hreflang` | TD-013 | V-09 |
| FR-025 Faixa de inglês na 1ª visita | TD-012 | V-08 |
| FR-026 Armazenamento bloqueado e o idioma | TD-012 | V-08 |
| FR-027 404 com status e por idioma | TD-014 | V-09, V-10 |
| FR-028 Conteúdo sem JavaScript | TD-008 | V-09 |
| FR-029 Fontes do próprio site, ≤ 2 famílias | TD-016 | V-11 |
| FR-030 Sem requisição a terceiros | TD-016, TD-015 | V-11 |
| FR-031 Cabeçalhos de segurança | TD-015 | V-10 |
| FR-032 Remoção do código antigo | TD-018 e a lista "Arquivos que esta spec remove" | V-12 |
| FR-033 Terminal e CI (Won't) | fora (specs 009 e 010) | — |
| FR-034 Dispensar a faixa | TD-012 | V-08 |
| FR-035 Quando a faixa não aparece | TD-012 | V-08 |
| FR-036 Rodapé de créditos | TD-020, Interface Contract | V-14 |
| FR-037 Elenco de uma única fonte | TD-020 | V-14 |
| FR-038 Faixa decorativa | TD-021, tokens `--deco-1` a `--deco-5` | V-01, V-14 |
| FR-039 Sugestões na 404 | TD-022 | V-14 |
| FR-040 Estado nunca só por cor | TD-023 | V-14 |
| FR-041 Variante sem casca para o terminal | TD-024, Data Model (campo `bare`) | V-15 |
| NFR-001 Performance | TD-009, TD-019 | V-13 |
| NFR-002 Segurança | TD-015 | V-10, V-11 |
| NFR-003 Acessibilidade | TD-004, TD-010, TD-019 | V-01, V-07, V-13 |

Todo FR e NFR tem casa. Os itens P-002-a a P-002-e viraram FR-036 a FR-040 na v1.5 do requirements (aprovados pela Duda em 2026-11-17). **Ficam de fora**, por decisão dela: a linha "trilha sonora" do rodapé (depende da Música e de uma playlist) e o motivo "cd /curriculos" da 404.

## Tokens propostos
Valores da seção 3 do README de referência. Razões de contraste **calculadas** com a fórmula WCAG (script de conferência, 2026-11-15). Os valores concretos entram em `src/styles/tokens.css` na tarefa (TD-017).

### Tema claro
| Token | Valor | Uso | Razão sobre o fundo creme `#FFF7EA` |
| --- | --- | --- | --- |
| fundo | `#FFF7EA` (DQ-004) | página | base |
| texto | `#17171A` | corpo | 16,82 |
| texto secundário | `#585861` | apoio | 6,62 |
| acento | `#2B36D9` | links, estrelas | 7,50 |
| borda de controle | `#77777F` | controles | 4,17 |
| divisor | `#D9D9D4` | só decoração | 1,33 |
| texto sobre acento | `#FFFFFF` | botão primário | 7,98 sobre o acento |

### Tema escuro
| Token | Valor | Uso | Razão |
| --- | --- | --- | --- |
| fundo | `#0E0E10` | página | base |
| superfície | `#17171A` | cartões | base |
| texto | `#ECECEE` | corpo | 16,35 no fundo; 15,16 na superfície |
| texto secundário | `#A3A3AC` | apoio | 7,71; 7,15 |
| acento | `#8F98FF` | links, estrelas | 7,44; 6,90 |
| borda de controle | `#7A7A84` | controles | 4,54; 4,21 |
| divisor | `#2C2C32` | só decoração | 1,39 |
| texto sobre acento | `#0E0E10` | botão primário | 7,44 sobre o acento |

### Tons de apoio (fundos de capas, números e cartões)
| Tom | Valor | Texto `#17171A` | Acento `#2B36D9` | Secundário `#585861` | Borda `#77777F` |
| --- | --- | --- | --- | --- | --- |
| pêssego | `#FFD9C7` | 13,63 | 6,08 | 5,36 | 3,38 |
| lilás | `#E4E1FF` | 14,07 | 6,27 | 5,53 | 3,49 |
| menta | `#C9EDD8` | 14,13 | 6,30 | 5,56 | 3,51 |
| limão | `#FFEEA8` | 15,37 | 6,86 | 6,05 | 3,82 |
| céu | `#CFE8FF` | 14,17 | 6,32 | 5,58 | 3,52 |
| rosa | `#FFD3E8` | 13,40 | 5,98 | 5,27 | 3,33 |

### Tons escuros equivalentes (capas no tema escuro)
| Tom | Texto `#ECECEE` | Acento `#8F98FF` | Borda `#7A7A84` |
| --- | --- | --- | --- |
| `#5A2A4E` | 9,49 | 4,32 | 2,64 |
| `#1F5A62` | 6,60 | 3,00 | 1,83 |
| `#6B3A1E` | 7,91 | 3,60 | 2,20 |
| `#2F3A9E` | 8,02 | 3,65 | 2,23 |

### Decoração sem texto
Faixa de cinco cores no topo de toda página (`aria-hidden`, 6 px de altura, sem texto, FR-038). Valores lidos do mockup, um conjunto por tema, só decoração (sem requisito de contraste): **claro** `#2B36D9`, `#B4308A`, `#0A6E78`, `#B4410F`, `#E0A800`; **escuro** `#8F98FF`, `#FF8FCB`, `#4FD1D9`, `#FFA36B`, `#FFD84D`. Viram os tokens `--deco-1` a `--deco-5`. Bordas laterais da 404 e chips de estado do Acadêmico (magenta, laranja, azul-petróleo) são das specs 007 e seguintes; o estado sempre também traz texto (ex.: "CURSADO ATÉ 2026").

## Achados da conferência (o que o README não diz ou diz diferente)
1. **Fundo do tema claro conflita.** O README e a faixa "tons de apoio" da tela Tokens dizem `#FFF7EA`, mas a lista de tokens do tema claro na mesma tela usa `#F6F6F3` (texto 16,52; acento 7,37; borda 4,10). Resolvido pela DQ-004: creme `#FFF7EA`.
2. **Faixa de contraste do acento:** o README dá 6,1 a 7,5 sobre creme e pastéis. O cálculo dá **5,98 a 7,50** (rosa fica em 5,98). Continua acima de 4,5.
3. **Borda de controle sobre pastel não chega a 4:1.** A regra do README ("borda de controle com contraste mínimo de 4:1") vale sobre creme (4,17), cinza (4,10) e branco (4,44), mas sobre os tons de apoio fica em **3,33 a 3,82**. Cumpre o FR-007 (3:1 para componentes), mas **não** o 4:1 do README (TD-003, DQ-006).
4. **Acento sobre os tons escuros não passa em texto normal:** 3,00 a 4,32, abaixo de 4,5. Nesses fundos, texto só em `#ECECEE`; o acento fica proibido como cor de texto ali.
5. **Borda de controle sobre os tons escuros fica em 1,83 a 2,64**, abaixo de 3:1. Controles não podem ficar sobre esses tons sem outra borda.
6. **O rodapé diz "sem rastreadores"** no mockup, mas a decisão V-D-011 mede visitas com analytics sem cookies. Resolvido pela DQ-007: "sem cookies".

## Architecture
```
 build (Node)                                                runtime (navegador)
 ────────────                                                ───────────────────
 src/data/routes.ts ──┐                                       HTML da rota (já com casca e <main>)
 src/i18n/ui.ts ──────┼─► entry-server.tsx ─► prerender ──►   + <head> (lang, hreflang, meta)
 src/pages/* ─────────┘     (react-dom/static)  por rota×idioma   │
 tokens.css, fontes ─► vite build (client) ─► JS/CSS com hash ────►│  hydrateRoot(#root)
                                                                   ▼
                                                    RouterProvider (lê a URL) ─► SiteShell ─► página
```
- **Dois bundles, um só comando:** o do cliente (o que o visitante baixa) e um de servidor (`entry-server`), que só roda em Node e **nunca vai para `dist/static`**. O plugin de pré-render (TD-008) dispara o build do servidor por dentro do próprio `vite build` (API programática `build({ build: { ssr } })`), então `npm run verify`, que só executa `vite build`, já cobre o pré-render. `react-dom/static` fica só no servidor (V-09 confere pelo HTML gerado, não por `grep` no bundle: o bundler não deixa o nome do módulo no código).
- **Dois alvos do mesmo build:** `dist/` (publicado, sem `/_prova`) e `dist-prova/` (com `/_prova`), pela mesma configuração; mudam só o `mode` (`vite build --mode prova`), o `outDir` e o `noindex` (TD-009).
- **Rota → arquivo:** cada rota gera dois HTML, `dist/<caminho pt>.html` e `dist/en/<caminho en>.html`; **a home em inglês é `dist/en.html`** (a Netlify serve `/en` sem barra e sem confundir com a pasta `en/`), e a home em português é `dist/index.html`. Mais `dist/404.html` e `dist/en/404.html` (TD-014). A Netlify serve `/projetos` sem a barra final (`.html`, como hoje, ver comentário em `netlify.toml`).
- **Estado de visitante:** só tema (`portfolio-theme`), escolha de idioma (`portfolio-lang`) e dispensa da faixa (`portfolio-lang-offer`). Nada vai ao servidor.

## Data Model
**Tabela de rotas** (extensão de `src/data/routes.ts`, TD-006). Campos novos em `Route`:
| Campo | Tipo | Regra | Mensagem de erro do teste |
| --- | --- | --- | --- |
| `enPath` | texto | é `/en` (a home EN) ou começa com `/en/`; sem repetição; não colide com nenhum `path` | `rota <id>: endereço em inglês <x> repetido ou fora de /en` |
| `path` (existente, PT) | texto | começa com `/`; **não** começa com `/en/`; sem repetição | `rota <id>: endereço em português <x> começa com /en ou repete` |
| `title` | `Localized` | PT e EN não vazios | `rota <id>: título sem <lang>` |
| `description` (novo, texto de SEO) | `Localized` | PT e EN não vazios; migra de `pageMeta` | `rota <id>: descrição sem <lang>` |
| `desc` (existente, dica curta do terminal, da paleta e da barra lateral) | `Localized` | **não muda**; quando existe, PT e EN não vazios | `rota <id>: dica sem <lang>` |
| `label` (existente) | `Localized` | PT e EN não vazios | `rota <id>: rótulo sem <lang>` |
| `menu` | booleano | `true` só nos itens do menu principal; `order` define a posição | — |
| `order` | número | obrigatório quando `menu` é `true`; sem repetição entre itens do menu | `menu: ordem <n> repetida` |
| `prova` | `true` opcional | só a rota `/_prova`; fora do menu, do sitemap e do índice; existe só no build de prova | — |
| `bare` | `true` opcional | rota renderizada **sem casca** (só a faixa decorativa e o `main`); hoje só `terminal`; a rota `bare` não entra no menu nem recebe a faixa de idioma (FR-041) | `rota <id>: bare e menu juntos` |
Os campos do terminal (`name`, `alias`, `command`, `group`, `hidden`, `showInNav`) ficam como estão (spec 009 e 008). `aliases` com caminhos em inglês antigos (`/about`) **deixam de existir** na 002: os endereços EN passam a ser `enPath`; o redirecionamento dos endereços antigos é da spec 010 (Non-Goals da 002).

**De onde vêm os textos novos (nada é reescrito nem inventado):** `title` e `description` (texto de SEO) **migram** de `pageMeta` em `src/data/seo.ts` (o `desc` curto que o terminal, a paleta e a barra lateral usam **não muda**: DQ-026) (que já guarda título e descrição por rota nos dois idiomas) e `seo.ts` passa a lê-los da tabela, para haver uma fonte só (FR-009); os `enPath` das rotas que já têm alias em inglês saem desses `aliases` (`/about` vira `/en/about`). **Rotas sem alias em inglês hoje: os `enPath` abaixo foram propostos por mim e **confirmados pela Duda em 2026-11-17 (DQ-016)**:** a home em inglês `/en`; o terminal `/en/terminal`; o GitHub `/en/github`; e o estudo de caso `whatsapp-dispatcher` `/en/case-studies/whatsapp-dispatcher` (a tradução do padrão atual, `/estudos-de-caso/` vira `/case-studies/`), cujo `title` e `desc` já existem em `pageMeta`, em PT e EN.

**Quem entra no menu na entrega da 002 (DQ-019, resposta da Duda):** as rotas atuais já são `menu: true`, apontando para as páginas de hoje: **Projetos, Currículo, Acadêmico, Contato, Pessoal** (nessa ordem, `order` 1 a 5). A US-001 manda que projetos, currículo e contato sejam itens de menu quando as specs 005 e 007 chegarem; aqui eles já constam, e essas specs só trocam a página. `pessoal` está em `draft` enquanto usa dados fictícios (`showInNav`), e o menu a mostra do mesmo jeito.

**Chaves de armazenamento** (reaproveitadas, como as Notas do requirements sugeriram):
| Chave | Valores | Quem escreve | Quem lê |
| --- | --- | --- | --- |
| `portfolio-theme` | `light` \| `dark` (outro valor é ignorado) | `ThemeProvider` (escolha manual) | script de boot, `ThemeProvider` |
| `portfolio-lang` | `pt` \| `en` | seletor e faixa de idioma (FR-022) | faixa de idioma (FR-035) |
| `portfolio-lang-offer` | `dismissed` | botão "dispensar" da faixa (FR-034) | faixa de idioma |

**Nada é gravado ao montar.** Os provedores de hoje gravam `portfolio-lang` e `portfolio-theme` em todo efeito, inclusive no padrão, o que transformaria a 1ª visita numa "escolha" e apagaria a faixa de inglês (FR-025, FR-035) e congelaria o tema do sistema (FR-003, FR-004). `LanguageProvider` e `ThemeProvider` passam a gravar **só quando o visitante escolhe** (clique no seletor, na faixa ou no botão de tema); V-03 e V-08 têm um caso "montar sem clicar não grava".

**Resolução do tema** (função pura `resolveTheme({ stored, systemDark })`, tabela do requirements):
| `stored` | `systemDark` | Resultado |
| --- | --- | --- |
| ausente ou ilegível | falso / verdadeiro | `light` / `dark` |
| `light` | verdadeiro | `light` |
| `dark` | falso | `dark` |
| qualquer outro (`dracula`) | falso | `light` (ignora o valor) |

**Oferta de inglês** (função pura `languageOffer(...)`, 9 linhas da tabela do requirements): entradas `{ path, storedLang, dismissed, navigatorLangs, storageOk }`; saída `{ show: boolean }`. Mostra se, e só se: `path` não está sob `/en`, não há `storedLang`, não foi dispensada, e `navigatorLangs[0]` começa com `en`. Com `storageOk = false`, `storedLang` e `dismissed` valem "ausente" (a faixa volta em toda visita, FR-026).

## Interface Contract
**`SiteShell`** (substitui o atual no mesmo arquivo, `src/components/shell/SiteShell.tsx`) **sobe para o `App`** (**DQ-018, resposta da Duda**), fora do `Suspense` das páginas: `App` renderiza `<SiteShell routeId={route?.id}>` e, dentro dele, o `Suspense` com a página. Hoje cada página embrulha o próprio `SiteShell` dentro do `Suspense fallback={null}` lazy, então a casca sumiria a cada navegação até o chunk da rota chegar, o menu e a faixa perderiam estado (FR-014) e a hidratação da casca esperaria o chunk. Com a casca no `App`, ela hidrata e fica interativa sem esperar nenhuma página. As páginas (`DocPage`, `EditorialPage`, `CaseStudy`, `GithubPage`, `Home`, `InfoPages`, `NotFound`, `SectionPage`, `Services`, `TerminalPage`) **param de chamar `<SiteShell>`** e passam a devolver só o conteúdo do `main`; isso é mais que o "ajuste mecânico" que eu tinha prometido, e é um `Page` por vez, com o gate verde. Assinatura: `({ routeId?, children }) => JSX`; a variante vem da tabela de rotas (`route.bare`), não de uma propriedade: uma rota `bare` (hoje só o terminal) renderiza **apenas a faixa decorativa e o `main`**, sem skip link, cabeçalho, seletores, rodapé nem faixa de idioma (FR-041; o primeiro item focável dela é da spec 009, por exemplo "Sair do terminal"). Os atributos antigos `badge`, `variant`, `after`, `missingPath` saem.

**Ordem do DOM da casca (é a ordem do foco, FR-016):**
0. faixa decorativa de cinco cores (`aria-hidden`, não focável), antes de tudo, sem alterar a ordem do foco (FR-038);
1. link "ir para o conteúdo" (`<a href="#conteudo">`);
2. faixa de idioma (só quando visível, FR-016; entra no DOM depois do carregamento, sem roubar o foco);
3. `<header>`: marca do site → `<nav aria-label>` com os itens do menu na ordem de `order` → seletor de tema → seletor de idioma;
4. `<main id="conteudo" tabindex="-1">` (o conteúdo da página);
5. `<footer>` (rodapé de créditos, FR-036): título do portfólio, "directed by", roteiro e código, elenco, local e "fim", o texto "sem cookies" / "no cookies" (DQ-007) e **um único link**, para a home (FR-016 prevê um só link de rodapé).
Só há um `header`, um `nav` principal, um `main` e um `footer` por página (NFR-003). A rota `/_prova` renderiza dentro do `main` o conteúdo da definição do requirements (h1, h2, h3, 3 parágrafos de exemplo, link de texto, botão principal e secundário, figura com `alt` e dimensões, 5 etiquetas).

**Seletor de tema:** um `<button type="button" aria-pressed>` com nome acessível **"Alternar tema: <tema de destino>"** / "Toggle theme: <target>" (DQ-027; igual no servidor e no cliente, pois o destino do HTML gerado é o padrão e nada do markup depende dele além do texto escondido por CSS). O texto visível mostra o tema de destino como no mockup ("Claro" quando o tema é escuro): o HTML traz as duas palavras e o CSS esconde uma por `[data-theme]`. `aria-pressed` é atualizado depois da montagem.
**Seletor de idioma:** um controle segmentado **PT | EN** (como no mockup) feito de **dois links** `<a hreflang lang href>`, cada um para a mesma página no idioma indicado; o do idioma atual leva `aria-current="true"`. Funciona sem JavaScript (DQ-002). No clique grava `portfolio-lang` e navega pelo roteador. (O mockup usa dois botões com `aria-pressed`; links são necessários para o FR-021 e o FR-024 sem JavaScript.)
**Textos de interface** ("Read this page in English", "Dispensar", "Alternar tema", "Switch theme", rótulos do rodapé etc.) ficam em `src/i18n/ui.ts`, em PT e EN, com a paridade da 001 (nada de texto fixo em componente).
**O botão do menu está sempre no HTML pré-renderizado**; sem a classe `js` o CSS o esconde e a lista aparece como lista normal (assim não há divergência de hidratação). Na navegação do cliente (PT para EN sem recarregar), `lang`, `<title>`, descrição e `hreflang` são atualizados pelo hook `useDocumentMeta` (já existe) a partir de `enPath`/`path`.

## Segurança
- Os 4 cabeçalhos do FR-031 já estão em `netlify.toml` (`for = "/*"`); falta o teste que falha se algum faltar (V-10).
- Nenhuma requisição a terceiros no carregamento (FR-030): fontes e imagens do próprio site, nenhum `<script>`/`<link>` com origem externa. O formulário de contato (EmailJS) só chama a API no envio, e a 002 não o toca (spec 007).
- Os `<script>` inline (script de boot do tema, JSON-LD) são gerados no build; nenhum recebe dado do visitante. O JSON-LD escapa `<` (já faz hoje).
- A CSP é decisão do TD-015 (DQ-001).
- Sem segredo novo; `scripts/secretGuard` continua valendo.

## Edge Cases
| Caso | Comportamento | Onde |
| --- | --- | --- |
| Armazenamento bloqueado | tema segue o sistema; faixa em toda visita; nenhum erro visível | TD-011, TD-012 (`try/catch`, testado) |
| Valor de tema gravado inválido | ignorado | `resolveTheme` |
| Link em PT, navegador em inglês, sem JavaScript | página em PT, sem faixa, com o seletor de idioma (são links) | TD-007, TD-012 |
| Endereço `/en/...` com escolha gravada em PT | EN (o endereço vence), sem faixa | `languageOffer` |
| Caminho inexistente | 404 no idioma do endereço | TD-014 |
| Título longo, acento, 80 caracteres sem espaço | cabeçalho e menu quebram linha ou truncam com `title`; `overflow-wrap: anywhere`; sem rolagem horizontal | TD-017, V-07 (larguras 360, 1023, 1024 e 1920) |
| Rota sem rótulo, título ou descrição em um idioma | a verificação falha | V-05 |
| Caminho repetido ou PT começando com `/en/` | a verificação falha | V-05 |
| Par de cores só em hover ou foco | entra no teste de contraste | V-01 |
| JavaScript desligado e menu | os links do menu aparecem sempre; o botão está no HTML, mas o CSS o esconde sem a classe `js` (colocada pelo script de boot), então a lista aparece normal | TD-010 |
| Hidratação com conteúdo diferente do HTML | a casca usa só dado determinístico (URL, tabela, textos); nada lido do `window` na renderização | TD-008 |

## Technical Decisions
### TD-001 a TD-005 (mantidos do rascunho parcial)
**TD-001** Um conjunto de tokens, dois temas, sem degradê: os valores das tabelas "Tokens propostos" viram tokens nomeados; nenhum estilo usa cor literal; os tons de apoio são tokens próprios, só como fundo (FR-001, FR-002, D-004). **TD-002** IBM Plex Sans (400 e 600) e IBM Plex Mono (400), 2 famílias, 3 arquivos na 1ª pintura, hospedadas no próprio site, `font-display: swap`; refinada em **TD-016**. **TD-003** FR-007 mantido (4,5:1 texto normal; 3:1 texto grande e componentes); o teste percorre uma **matriz de pares permitidos** e falha se um par fora dela for usado; piso de 3:1 sobre os pastéis e 4:1 onde o fundo permite (DQ-006). **TD-004** foco com anel de 3 px no acento (sempre ≥ 3:1 contra o fundo adjacente), alvo de toque de 44×44 px, nenhuma animação essencial, tudo sob `prefers-reduced-motion`; estado nunca só por cor (a página atual do menu ganha sublinhado e peso). **TD-005** paleta colorida nos dois temas, com as regras de uso do Achado 4 e 5 (DQ-005 respondida).

### TD-006: A tabela de rotas é estendida, não reescrita
**Decision:** `src/data/routes.ts` ganha `enPath`, `menu`, `order`, `prova` e `bare` (Data Model) e passa a ser a fonte de `title`/`description`, **migrados** de `pageMeta` em `seo.ts`, que passa a lê-los da tabela (uma fonte só); a navegação, o `<title>`/descrição e a 404 leem dela. Os campos do terminal continuam. Um **schema zod** (`src/content/schema/route.ts`, no molde da 001) e um teste `routes.test.ts` verificam: caminhos únicos, PT sem `/en`, EN com `/en`, `Localized` completo (paridade da 001, FR-014 dela), `order` único, nenhuma rota `prova` no build publicado, e a regra de 2 interações (menu com todos os itens em qualquer rota: 1 interação em tela larga, 2 com o botão do menu). **Rationale:** FR-009 a FR-011 e a 001 já exigem tabela única; reescrever quebraria o terminal (009), a busca e o SEO, que leem `routes`. **Alternatives:** tabela nova só da casca (duplica rotas: viola FR-009); reescrita total (aumenta o raio de dano e a lista de testes quebrados); duplicar `title` em `seo.ts` e na tabela (duas fontes, viola FR-009).

### TD-007: A URL decide o idioma
**Decision:** o idioma é derivado do caminho (`/en` ou `/en/...` = EN; o resto = PT). `LanguageProvider` lê do roteador e **não** consulta o `localStorage` para decidir. O `localStorage` só guarda a escolha (FR-022) para a faixa. Trocar de idioma navega ao `enPath`/`path` equivalente da rota atual; rota desconhecida cai na home do idioma. `normalizePath('/en/')` devolve `/en` (a barra final é descartada, como já é para os outros caminhos). **Gravação só por escolha:** nada é gravado ao montar (ver Data Model). **Rationale:** FR-020 a FR-023, FR-025: o endereço aberto é sempre o que o visitante vê, e o servidor (estático) precisa entregar o HTML certo. **Alternatives:** idioma pelo `localStorage` (o HTML pré-renderizado ficaria no idioma errado, quebra FR-028 e FR-024); redirecionar por `Accept-Language` (rejeitado na v1.2).

### TD-008: Pré-render por rota, com hidratação
**Decision:** novo `src/entry-server.tsx` exporta `renderRoute(path, lang)` que usa **`prerender` de `react-dom/static`** (a API com Web Streams, que o Node 22 tem; não `prerenderToNodeStream`) para esperar os componentes `lazy` e devolver HTML. **Mecânica (revisão T-01):** um plugin do Vite (que substitui o `<noscript>` do `scripts/seoPlugin.ts`) roda em `closeBundle` e dispara **dentro do mesmo `vite build`** um segundo build programático do servidor (`build({ configFile: false, plugins: [react()], define: { __BUILD__ }, build: { ssr: 'src/entry-server.tsx', outDir: '.prerender', copyPublicDir: false, emptyOutDir: true } })`), com `configFile: false` e plugins explícitos **para o plugin de pré-render nunca ser instanciado no build aninhado** (senão o `closeBundle` dele dispararia outro build, em laço), sem copiar `public/` e sem repetir os guardas (`personalGuard`, `contentGuard`, `secretGuard`), que já rodaram no build do cliente, carrega o resultado e grava, para cada rota × idioma, o HTML com `<div id="root">…</div>` já preenchido (casca + `main`), o `<head>` por rota e `lang`/`hreflang` (TD-013). O cliente usa `build.manifest: true` para o plugin descobrir o chunk de cada rota e escrever o `modulepreload` dele no HTML. Como `npm run verify` só executa `vite build`, a verificação já cobre o pré-render; **se o pré-render não fechar dentro do `vite build`, a decisão volta para a Duda** (mudar o runner é da spec 001). O cliente troca `createRoot` por `hydrateRoot` quando o `#root` tem filhos. O `RouterProvider` aceita um `initial` (caminho) para o servidor (hoje ele lê `window` no inicializador). A casca e as páginas só leem **dado determinístico** na renderização (URL, tabela, textos); `window`, `localStorage` e `matchMedia` ficam em `useEffect`. O plugin **expõe a função que monta o documento** (`<head>` + casca + `main`) e **falha o build** se uma rota gerar HTML sem `<main>` ou sem `<h1>`. **Os testes de HTML gerado (V-09) rodam no vitest, antes do build, no projeto `unit` (Node, sem o `setup.ts` que troca `lazyPages`, então o `lazy` funciona de verdade):** importam `renderRoute` e o montador do documento e geram o HTML de cada rota × idioma em memória; o que depende do `dist` real é conferido por `scripts/checkDist.mjs` (V-09, V-12). `react-dom/static` nunca entra em `dist/static`. **Rationale:** FR-028 e princípio 2 do steering; o SPIKE-001 provou que o HTML de hoje não traz o conteúdo. A mesma fonte de componentes gera o HTML e o cliente (sem marcação duplicada). **Alternatives:** manter `<noscript>` (não cumpre FR-028: o conteúdo só aparece com JavaScript); gerador de HTML separado, com marcação duplicada (deriva e dobra a manutenção); adotar um framework com SSR (muda a stack, contraria V-D-014). **Risco:** R-002; o primeiro item da lista de tarefas (T0, spike técnico com uma rota) tem como critério responder **(1)** como o SSR roda dentro de `vite build`, **(2)** o manifesto e o `modulepreload`, **(3)** a API `prerender` com `lazy`, **(4)** como `routes.ts` carrega no contexto do config sem `import.meta.env`, **(5)** o build aninhado sem recursão, sem `public/` e com `define`/`react()` explícitos, e **(6)** a limpeza: o plugin apaga `.prerender/` ao terminar, com sucesso ou falha, e o `dist/.vite/manifest.json` depois de usá-lo; e a prova de hidratação com `lazy` é um **teste ponta a ponta sobre `dist-prova`** (console sem aviso de hidratação), não o vitest, que troca `lazyPages` por imports diretos (`src/test/setup.ts`).

### TD-009: Build de prova e a rota `/_prova`
**Decision:** `npm run build:prova` roda `vite build --mode prova` (funciona igual em PowerShell, Git Bash e Linux; **não** `PROVA=1 vite build`, que não roda no PowerShell) para `dist-prova/`; é a mesma configuração do build publicado: **só** o `mode`, o `outDir` e o `noindex` mudam. A flag **não** é lida de variável de ambiente nem de `import.meta.env.PROVA` (o Vite só expõe ao cliente variáveis `VITE_*`, e `import.meta.env` não existe no contexto do config): o config recebe `mode` no callback de `defineConfig`, passa `prova` como **opção do plugin** de pré-render (Node) e como `define: { __PROVA__ }` para o cliente. A tabela sempre declara a rota `/_prova` (`prova: true`) e quem a consome filtra por `__PROVA__` (cliente) ou pela opção do plugin (build): assim cliente e HTML pré-renderizado concordam. O build publicado (`dist/`) nunca contém `/_prova`: V-12 confere com `node scripts/checkDist.mjs dist` (falha se achar `_prova`) e o teste da tabela (sem `__PROVA__` a rota é filtrada). Um teste compara as duas configurações e falha se divergirem além dessas três coisas. A página de prova é o conteúdo da definição do requirements; é nela que rodam V-07 (foco) e V-13 (medição). **Rationale:** NFR-001 manda medir num build otimizado como o de produção. **Alternatives:** medir no `vite dev` (valores sem minificação: enganam); rota de prova sempre incluída no publicado (vaza para produção: risco R-004); rota protegida por variável de runtime (não existe servidor); variável de ambiente `PROVA` (não chega ao cliente e a sintaxe não roda no PowerShell).

### TD-010: Menu em tela estreita, foco e teclado
**Decision:** ponto de quebra **1024 px** (64 rem). Abaixo dele, o cabeçalho mostra só a marca e **um** `<button type="button" aria-expanded aria-controls>` (alvo ≥ 44×44 px); a lista de itens, o seletor de tema e o seletor de idioma ficam **dentro do painel** que o botão abre, ainda dentro do `<header>` e na ordem do FR-016 (itens, tema, idioma). (O mockup do celular põe o botão de tema na barra, ao lado do botão do menu, e não mostra o seletor de idioma; manter essa disposição quebraria a ordem do DOM do FR-016 ou exigiria reordenar só por CSS. **DQ-013.**) A lista **sempre está no HTML**; a regra "gaveta" só vale com a classe `js` no `<html>` (colocada pelo script de boot), então sem JavaScript os links aparecem como lista normal (DQ-002). Ao abrir: o foco vai ao primeiro item; ao fechar (botão, `Esc`, escolha de item): o foco volta ao botão (FR-014). Itens, seletor de tema e seletor de idioma são controles nativos (`a`, `button`): alcançáveis por Tab sem `tabindex`. **Verificação:** o vitest roda com `css: false`, então o ponto de quebra **não** se prova por ele: o e2e sobre `dist-prova` confere, em 1023 e em 1024 px, que o botão aparece e some, e mede com `boundingBox` que todo controle do menu tem ao menos 44×44 px (V-07). **Rationale:** FR-013 a FR-015 e NFR-003. O mockup **não define ponto de quebra** (são dois quadros fixos, 1280 e 390 px, sem `@media`). Estimativa minha, não medição: com os valores do mockup (itens de 44 px de altura com 14 px de recuo lateral, controle PT|EN de 88 px, botão de tema, `gap` de 16 px) marca + 5 itens + os dois seletores pedem ~850 a 900 px de conteúdo; em 768 px a linha quebraria. Por isso 1024 px, que a tarefa confirma medindo antes de fixar. **Alternatives:** `<details>` (não gerencia o foco como exige o FR-014); biblioteca de menu (viola "CSS puro, sem biblioteca de UI").

### TD-011: Tema, boot sem flash e resolução
**Decision:** dois temas, `light` e `dark` (`dracula`, `solarized`, `amber` saem, D-002). O `data-theme` é aplicado por um **script de boot inline no `<head>`**, gerado de **um único módulo sem imports**, `src/boot/boot.ts`, que exporta as funções puras `resolveTheme` e `languageOffer` e `bootSource()` (o texto do script, montado das próprias funções por `Function.prototype.toString`, sem helpers do esbuild). Os componentes e os testes importam **as mesmas funções**; o plugin injeta `bootSource()` no `<head>` de cada HTML. Assim não há "duas listas copiadas", e um teste avalia o script inline em `vm` e confere que ele decide igual às funções nas linhas das tabelas de tema e de idioma. O script lê `portfolio-theme`, valida contra `['light','dark']`, senão usa `matchMedia('(prefers-color-scheme: dark)')`, define `data-theme`, a classe `js` e `style.colorScheme`; tudo em `try/catch` (FR-006). **O `index.html` deixa de trazer `data-theme="dark"` fixo** (hoje o ramo CSS sem JavaScript nunca valeria, porque o atributo já nasce `dark`) e o `theme-color` fixo vira **dois** `<meta name="theme-color">` com `media="(prefers-color-scheme: …)"`, um por tema (`#FFF7EA` e `#0E0E10`). Em CSS, `:root:not([data-theme])` com `@media (prefers-color-scheme: dark)` cobre quem desliga o JavaScript (FR-003 sem JavaScript). `ThemeProvider` inicia pelo `data-theme` já aplicado e **grava só a escolha manual**. **Regra do boot serializado:** cada função serializada é **autocontida** (constantes, como `['light','dark']`, ficam dentro dela; nenhuma chama outra do módulo), porque `toString` não leva declarações vizinhas; o teste em `vm` falha se um identificador ficar livre, e `bootSource()` só é chamado pelo plugin (um teste de `measureBundle` pega se entrar no bundle do cliente). **Rationale:** FR-002 a FR-006. **Alternatives:** classe no `body` por React (flash do tema errado); manter 5 temas (rejeitado, D-002); copiar a regra no script e no componente (a deriva que o design quer evitar).

### TD-012: Faixa de idioma (DQ-002) e a regra de não deslocar
**Decision:** componente `LanguageOffer`, **só no cliente** (entra depois da montagem), que chama `languageOffer(...)`; lê `navigator.languages` (o que o navegador envia em `Accept-Language`; o site é estático, não há servidor para ler o cabeçalho). Posição (**DQ-012, resposta (b) da Duda em 2026-11-17**): **`position: fixed; top: 0`, largura total, por cima do cabeçalho**, com `role="region"` e nome acessível; **não** entra no fluxo do documento, então não desloca o conteúdo e o CLS é 0 (FR-035). O visual segue o mockup (`Mobile`: fundo de superfície, borda inferior, texto de 14 px, botão de 44 px de altura). No DOM ela vem logo depois do link "ir para o conteúdo" (ordem do foco, FR-016), sem `autofocus` e sem `aria-live` agressivo. Dois controles: um link "Read this page in English" para o `enPath` da rota atual (grava `portfolio-lang=en`, FR-022) e um botão "Dispensar" (grava `portfolio-lang-offer=dismissed`, FR-034). **Rationale:** FR-025, FR-026, FR-034, FR-035. **Alternatives:** faixa no topo, em fluxo, como o mockup (desloca o conteúdo: CLS e FR-035); fixa embaixo (descartada pela Duda); redirecionamento (rejeitado pela Duda); modal (rouba o foco). **Consequência e mitigação decidida (DQ-015, resposta M1 da Duda em 2026-11-17):** uma faixa fixa no topo cobriria a marca e os controles do cabeçalho, e o foco do teclado passaria por eles encoberto. A mitigação é: o script de boot do `<head>`, que já roda antes do primeiro desenho, calcula a mesma regra de `languageOffer` (caminho, escolha gravada, dispensa, `navigator.languages`) e marca `<html data-lang-offer>`; o CSS então **reserva, desde o primeiro desenho, um espaço no topo com a altura da faixa**, e a faixa, montada depois da hidratação, ocupa esse espaço (por cima dele, `position: fixed`). Nada se desloca depois do primeiro desenho (CLS 0, FR-035) e o cabeçalho nunca fica coberto. Ao dispensar, o espaço some: é uma mudança causada pelo visitante (não conta no CLS). **O boot também precisa saber duas coisas do HTML:** se a rota é `bare` (FR-041, sem faixa) e o idioma do endereço; o build grava `data-shell="bare"` no `<html>` das rotas `bare`, e o idioma sai do prefixo `/en` do caminho, que funciona também na 404, onde o caminho é arbitrário. Os textos da faixa ficam em `src/i18n/ui.ts`. **Efeito dito:** o espaço pode ficar em branco por instantes entre o primeiro desenho e a montagem da faixa, e **para sempre** se o JavaScript principal falhar (aceito; a faixa monta depois da hidratação, que já não espera nenhuma página, TD-018). V-13 mede o CLS **e** confere que o primeiro desenho já tem o espaço. Alternativas descartadas: a faixa cobrir só parte do cabeçalho (M2) e a faixa por último na ordem do foco (M3, contraria o FR-016).

### TD-013: `lang` e `hreflang`
**Decision:** cada HTML pré-renderizado tem `<html lang="pt-BR">` ou `<html lang="en">`; `seo.ts` ganha, em `headTags`, três `<link rel="alternate">`: `hreflang="pt-BR"`, `hreflang="en"` e `hreflang="x-default"` (aponta para o PT). O comentário de `seo.ts` que diz "não há hreflang" é corrigido. O script de boot deixa de definir `lang` pelo `localStorage` (a URL decide). Sitemap, Open Graph e JSON-LD são da spec 010. **A 404 e a `/_prova` não emitem `hreflang` nem canonical** (não há página equivalente). Na navegação do cliente, `useDocumentMeta` atualiza `lang`, `<title>`, descrição e `hreflang`. **Rationale:** FR-023, FR-024; endereço próprio por idioma já existe pelo TD-007. **Alternatives:** `lang` só no cliente (o HTML estático ficaria no idioma errado).

### TD-014: 404 com status real, por idioma
**Decision:** o build grava `dist/404.html` (PT) e `dist/en/404.html` (EN), ambos com a casca, o título "não encontrada" e links para a home e para os itens do menu (lidos da tabela). `netlify.toml` ganha duas regras de status 404: `/en/*` → `/en/404.html` e `/*` → `/404.html` (`status = 404`, sem `force`, então só valem quando não há arquivo; **a regra de `/en/*` vem primeiro**, porque a Netlify aplica a primeira que casa). A página 404 não emite `hreflang` nem canonical. **`/en/` (com barra final):** a home em inglês é `dist/en.html` (`/en`), então `netlify.toml` ganha, **antes** das regras de 404, uma regra `/en/` → `/en` (301, DQ-021), e `normalizePath('/en/')` devolve `/en` no roteador; testes cobrem `/en` e `/en/` (V-08, V-10). O roteador do cliente, para um caminho que não está na tabela, também renderiza a 404 no idioma do caminho. **Rationale:** FR-027 e a linha `/xyz` da tabela de idioma; a Netlify serve um único `404.html` por padrão, sem escolher idioma. **Risco:** R-008: o comportamento da regra só se confirma no deploy (spec 010); o teste de hoje cobre a regra no arquivo e os dois HTML gerados. **Alternatives:** um só 404 em PT (quebra "no idioma do endereço"); redirecionar `/en/*` ao 404 PT (perde o idioma).

### TD-015: Cabeçalhos e CSP (DQ-001)
**Decision:** manter os 4 cabeçalhos do FR-031 em `netlify.toml` e acrescentar `scripts/headers.test.ts`, que lê o arquivo e falha se `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` ou uma `Permissions-Policy` com `camera=()`, `microphone=()` e `geolocation=()` faltar no bloco `for = "/*"`. **CSP: não nesta spec.** Motivos: o HTML tem scripts inline (boot do tema, JSON-LD) e os elementos renderizados no servidor trazem atributos `style`, então uma CSP útil exigiria hashes gerados no build e uma lista de exceções para o EmailJS (spec 007); o requirements não a exige e o risco desta casca (sem dado de visitante, sem terceiros no carregamento) é baixo. A decisão fica registrada para a spec 010 (tem o deploy e o analytics). **Alternatives:** CSP agora com `'unsafe-inline'` (não protege de nada, só dá a impressão); CSP estrita com hashes (correta, mas depende do EmailJS e do analytics, que ainda não existem). **DQ-001 respondida pelo design** (aprovar o design = aceitar).

### TD-016: Fontes, licença e primeira pintura
**Decision:** IBM Plex Sans (400, 600) e IBM Plex Mono (400), WOFF2 subconjunto latino, em `public/fonts/`, `@font-face` com `font-display: swap` e `unicode-range`; **os três arquivos são pré-carregados** (3 de no máximo 4, NFR-001): a Sans 600 (título de página, 60/63 px no mockup, candidato ao LCP), a Sans 400 (texto corrido) e a Mono 400 (o mockup a usa em ~250 das ~280 declarações de família: cabeçalho, datas e etiquetas; carregá-la depois da primeira pintura trocaria a fonte à vista e poderia piorar o CLS). A fonte reserva leva métricas ajustadas (`size-adjust`) para a troca, se houver, mudar pouco o layout; o CLS medido decide. O mockup também usa o peso 500 (67 declarações), que **não está** na tabela de tipografia dele; este design só carrega 400 e 600 (Sans) e 400 (Mono), e o 500 vira 400 ou 600 na tarefa. A licença (OFL 1.1) e a atribuição entram em `public/fonts/LICENSE-IBM-Plex.txt`, com a data e a origem do arquivo, na tarefa (princípio 5 do steering). Substituem `jetbrains-mono-*.woff2`. **Rationale:** FR-029, NFR-001. **DQ-003 continua aberta:** o "teste de peso de fonte" é a tarefa que mede o peso dos WOFF2 e confirma o subconjunto; se algum passar de 4 arquivos ou comprometer o LCP, volta para a Duda.
**Alternatives:** fonte do sistema (sem carregamento, mas sem identidade; é o plano B se o peso estourar); três famílias (viola FR-029).

### TD-017: Tokens, CSS e a transição das páginas antigas
**Decision:** `src/styles/tokens.css` passa a ser a **única** fonte: `:root` = tema claro, `[data-theme='dark']` = escuro, e o `@media (prefers-color-scheme: dark)` para `:root:not([data-theme])` (TD-011). Nomes novos por papel (`--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--on-accent`, `--control-border`, `--divider`, `--tone-*`, `--tone-dark-*`, `--space-*`, `--radius-*`, `--dur-*`). **Os nomes antigos** que as páginas ainda não migradas usam (`--accent-2`, `--ok`, `--warn`, `--err`, `--info`, `--c-*`, `data-tone`) ficam num bloco `/* LEGADO */` dentro do mesmo arquivo, mapeados para tokens novos, e cada spec de página (003 a 009) apaga os que parar de usar. Isso mantém `verify` verde a cada tarefa (regra da 001) sem manter duas fontes de cor. Um teste confere que **nenhum hex aparece fora de `tokens.css`** e que não há `gradient(` em CSS. **Rationale:** FR-001, FR-002, D-001, e o gate de cada tarefa. **Alternatives:** renomear tudo de uma vez (quebra todas as páginas e ~4.000 linhas de CSS de uma vez); aliases fora do arquivo (duas fontes).

### TD-018: Substituição no lugar e arquivos removidos
**Decision:** `SiteShell`, `Header` e `Footer` mudam de conteúdo **no mesmo caminho**; o resto da casca antiga é apagado. `SiteShell` sobe para o `App` (Interface Contract, DQ-018). A lista completa está em "Arquivos que esta spec remove ou substitui". Cada remoção acontece na mesma tarefa que cria a peça nova, com o gate verde (FR-032 e regra de testes da 001: o teste do código removido sai junto). **Rationale:** P-Q-001 (o código novo substitui o antigo no lugar) e D-001. **Alternatives:** manter as duas cascas atrás de uma chave (dobra o código; rejeitado em D-001).

### TD-019: Como se mede o NFR-001 (e as ferramentas)
**Decision:** a medição roda sobre `dist-prova/`, na rota `/_prova`, nos 2 temas × 2 idiomas:
- **JS e CSS (gzip):** `scripts/measureBundle.mjs` (parte do SPIKE-001): soma o gzip dos arquivos de `.js` e `.css` referenciados no HTML da `/_prova` (inclui `modulepreload`). Falha se JS > 100 KB ou CSS > 20 KB. Roda em `npm run prova`, fora do `verify` (como o `npm audit`); um teste unitário cobre a função de soma.
- **LCP e CLS:** Lighthouse no perfil de celular (emulação de celular médio, 4× CPU, rede 4G lenta simulada), 3 execuções, mediana; CLS também com a faixa de idioma visível (limpando `portfolio-lang`; o idioma do navegador vem de `--chrome-flags="--lang=en"` mais o cabeçalho `Accept-Language: en`, porque o Lighthouse não tem opção direta para `navigator.languages`). O `vite preview` e o servidor de teste não comprimem, então o LCP de laboratório é **mais pessimista** que o da Netlify (conservador).
- **INP em laboratório:** Playwright, Chrome com CPU 4× mais lenta (CDP `Emulation.setCPUThrottlingRate`), script de interações (abrir/fechar o menu, alternar tema, trocar idioma); a métrica é o maior `duration` de `PerformanceEventTiming` do script; passa com ≤ 200 ms.
- **Acessibilidade:** axe sobre `/_prova`, 2 temas × 2 idiomas, 0 violações; notas de acessibilidade e boas práticas ≥ 95 no Lighthouse.
- **Servidor de teste:** o `playwright.config.ts` de hoje sobe o `vite` de desenvolvimento (`testMatch: '*.e2e.ts'`); para V-07 e V-11 a tarefa acrescenta um servidor estático pequeno (`scripts/serveDist.mjs`) que imita a Netlify: resolve `/projetos` para `projetos.html`, entrega os cabeçalhos do `netlify.toml` e responde 404 por idioma. Sem ele, os testes ponta a ponta olhariam o `index.html` sem pré-render e dariam falso positivo.
**DQ-010 (respondida pela Duda, 2026-11-17: sim):** Lighthouse e axe **não estão** nas `devDependencies`. Adicionar `@axe-core/playwright` e `lighthouse` (só desenvolvimento, nunca no cliente). Alternativa: rodá-los uma vez, à mão, com `npx` e registrar o resultado na evidência (sem dependência nova, sem teste repetível). **Rationale:** NFR-001 e NFR-003 pedem números; o SPIKE-001 mostrou o piso do React (67,5 KB gzip). **Alternatives:** medir só tamanho (não cobre LCP/INP/CLS pedidos).
**Como cumprir os 100 KB:** o que realmente sai do 1º acesso (terminal, sessão do terminal, conteúdo de `routes.ts`) está nomeado no **TD-025**; o SPIKE-001 não mediu o ganho isolado, então **a conferência é a medição da tarefa**, e se não couber a Duda decide (subir a meta ou cortar escopo da casca), sem editar o número em silêncio.

### TD-020: Rodapé de créditos e elenco de uma única fonte (FR-036, FR-037)
**Decision:** `Footer.tsx` renderiza, nesta ordem: "UM PORTFÓLIO DE ENGENHARIA", "DIRECTED BY DUDA", e uma lista de definição com **roteiro e código**, **elenco**, **filmado em** e **fim**, mais "sem cookies" e o link para a home. A linha "trilha sonora" do mockup **não entra** (Música e playlist, fora do MVP). Os rótulos ficam em `src/i18n/ui.ts` (PT e EN, paridade da 001); os valores sobre a Duda (nome, local) ficam em `src/content/credits.content.ts`, validados por schema, **valores vindos do mockup (`Projetos.dc.html`, rodapé) e confirmados pela Duda em 2026-11-17, nesta sessão** ("Roteiro e código: Duda" e "Filmado em: Belo Horizonte, MG"; nada é inventado). O **elenco** é uma lista **declarada** de nomes (`react`, `vite`, `typescript`) em `credits.content.ts`, com um teste que confere que cada nome existe em `dependencies` ou `devDependencies`; a **versão maior** vem da versão **instalada** (`node_modules/<nome>/package.json`, não da faixa `^19.1.0`) no build (no molde de `__BUILD__` em `vite.config.ts`: `define`), então "React 19 · Vite 6 · TypeScript 6" nunca fica desatualizado (steering: versões só como major). **Rationale:** FR-036, FR-037. **Alternatives:** texto fixo no componente (viola "conteúdo é dado" e envelhece); ler do `package-lock.json` (mais pesado, sem ganho).

### TD-021: Faixa decorativa (FR-038)
**Decision:** um `<div aria-hidden="true">` de 6 px de altura com cinco `<span>` de largura igual, fundo `var(--deco-1)` a `var(--deco-5)`, no topo do `body`; sem texto, sem foco, sem `role`. Nenhum dado é passado por cor. **Rationale:** FR-038 e o mockup. **Alternatives:** imagem ou SVG (peso e requisição a mais).

### TD-022: Sugestões na 404 (FR-039)
**Decision:** `suggestRoutes(path, lang)` (função pura) pontua as rotas com `menu: true` pela semelhança entre o caminho digitado e o caminho da rota (distância de edição sobre o último segmento) e devolve até 3, desempatando pela ordem do menu; sem nenhuma semelhança, as 3 primeiras do menu. O HTML estático da 404 (`dist/404.html`, que não sabe o caminho digitado) traz as 3 primeiras do menu; o cliente troca pela lista pontuada **depois da hidratação** (mesmo HTML no primeiro desenho, sem divergência). O status 404 e os links para a home e para o menu (TD-014) não mudam. O motivo "cd /curriculos" do mockup **não** entra (pergunta aberta). **Rationale:** FR-039 e FR-027. **Alternatives:** sugestão calculada no build (não conhece o caminho digitado); sem pontuação (perde o "você quis dizer").

### TD-023: Estado nunca só por cor (FR-040)
**Decision:** a página atual do menu usa `aria-current="page"` e o CSS dá sublinhado e peso a `[aria-current]`; o idioma selecionado no controle PT | EN usa `aria-current="true"` com o mesmo tratamento. Um teste (`src/styles/state.test.ts`) lê o CSS e falha se uma regra de estado (`[aria-current]`, `[aria-pressed="true"]`, `[aria-expanded="true"]`) mudar só `color` ou `background` sem `text-decoration` ou `font-weight`. **Rationale:** FR-040, TD-004 e o WCAG 1.4.1. **Alternatives:** só conferir à mão (não protege contra regressão).

### TD-024: Variante sem casca para o `/terminal` (FR-041)
**Decision:** a tabela de rotas ganha `bare?: true` e só a rota do terminal o usa. `SiteShell` lê `routeById(routeId).bare`: se verdadeiro, renderiza `<DecorativeStripe />` e `<main id="conteudo">{children}</main>` e nada mais; o cabeçalho, o menu, os seletores de tema e idioma, o rodapé e a faixa de idioma **não são montados**. O tema ainda é aplicado pelo script de boot (a página `bare` também tem `data-theme`, `lang` e `hreflang`). O pré-render (TD-008) gera o HTML `bare` do mesmo jeito. A exceção do FR-008 e da US-004 está escrita no requirements v1.6. **Rationale:** o mockup do terminal (`Terminal.dc.html`) é assim, e a Duda decidiu pela variante sem casca em 2026-11-17. **Alternatives:** o terminal com a casca completa (diverge do mockup, mas sem exceção ao FR-008); deixar para a spec 009 (a 009 pode exigir mudar a casca depois). **Consequência dita:** na rota `bare` não há seletor de tema nem de idioma; a spec 009 decide se o terminal oferece comandos para isso (hoje o comando `tema` existe).

### TD-025: O que de fato sai do 1º acesso (revisão S-01, S-02; DQ-017)
**Decision:** para o orçamento de 100 KB deixar de ser uma torcida, quatro mudanças nomeadas: **(a)** `TerminalProvider` e a sessão do terminal deixam de embrulhar toda página em `App.tsx`: ficam no chunk do terminal (a rota `/terminal`) e nos componentes que realmente os usam; `RunButton` passa a funcionar sem o provedor (degrada para navegar ao terminal) ou o carrega sob demanda; o provedor no chunk do terminal **perde o histórico de comandos ao sair de `/terminal`** (aceito). **(b)** `routes.ts` **deixa de importar** `now`, `uses`, `data/personal/*` e `services/integrations/mode` para decidir `draft`: o cálculo de `draft` e de `showInNav` vai para `src/data/routeStatus.ts`, importado **só** pelo plugin (Node), por `HubIndex` (chunk lazy de `/pessoal`) e pelos testes. O cliente não precisa de `draft` na 1ª pintura: o `noindex` já vem no HTML pré-renderizado, e `useDocumentMeta` só atualiza título e descrição. `seo.ts` é dividido: `metaFor` (cliente, sem `draft`) fica; `headTags` e `jsonLdFor` (só o plugin as chama) leem `routeStatus`. `pessoal` aparece no menu por `menu: true` (DQ-019), não por `showInNav` calculado. Testes ajustados: `routes.test.ts`, `personalRoutes.test.tsx`, `personalDiscovery.test.tsx`, `seo.test.ts`. **Isso encosta na spec 008 (`data/personal`, `integrations/mode`) e a Duda autorizou em 2026-11-17 mexer só nisso** (extrair o cálculo de `draft`, sem alterar conteúdo, comportamento, integrações, Functions nem `.env.example`). **(c)** o evento `SHOW_OUTPUT` e o `openShortcuts` de `commandBarEvents.ts` perdem o ouvinte quando o `CommandBar`, o botão `>_` do `Header` e o `Sidebar` saem: a 002 remove os dois. **A paleta (Ctrl+K) oferece só destinos de página** (itens `to`) **(DQ-020, resposta da Duda)**: os itens de comando (`run`: `cd`, `ajuda`, `stats`…) saem até a spec 009, porque o `?cmd=` do terminal só executa comandos de página e a barra que mostrava a saída deixa de existir; a paleta continua montada nas rotas com casca e **não** na rota `bare`; `src/data/shortcuts.ts` perde "/ foca a barra de comandos" (e o teste que o cobre); o `CommandCatalog` e o selo do terminal são renderizados **dentro do `main` do terminal, pela spec 009** (a 002 só passa `children`). **(d)** a medição da tarefa diz quanto isso pesa; **o CSS** também é medido (R-012). **Rationale:** R-001, TD-019 e o orçamento de 100 KB (gzip) do requirements v1.4. **Alternatives:** manter tudo no 1º acesso e subir a meta (decisão que volta para a Duda se o número não couber); estender o `?cmd=` do terminal agora (mexe na spec 009); mexer na 008 além do `draft` (fora do que foi autorizado).

## Verification Strategy
Cada FR vira um teste automatizado ou um comando com exit code. Os testes ficam dentro de cada tarefa (convenção da 001) e passam em `npm run verify`, exceto V-07, V-13 e as checagens de `dist` (`npm run prova` e comandos de aceite, como o `npm audit` da 001).
| ID | Cobre | Comando | Passa quando |
| --- | --- | --- | --- |
| V-01 | FR-001, FR-007, FR-017, FR-018, FR-038 (tokens `--deco-1` a `--deco-5`) | `npx vitest run src/styles/contrast.test.ts src/styles/styles.test.ts` | toda razão da matriz de pares cumpre o piso; nenhum hex fora de `tokens.css`; sem `gradient(`; dentro de `prefers-reduced-motion` toda regra de `transition` e `animation` é neutralizada (`none` ou duração 0); pares proibidos (Achados 4 e 5) falham o teste |
| V-02 | FR-002 | `npx vitest run src/data/themes.test.tsx` e `git grep -n -i -E "dracula|solarized|'amber'" -- src/data/themes.ts src/types.ts src/styles/tokens.css index.html` (exit 1; o tom `amber` de `Chip`/`tones.ts` não é tema e fica) | só `light` e `dark`; valor antigo no `localStorage` é ignorado |
| V-03 | FR-003 a FR-006 | `npx vitest run src/boot/boot.test.ts src/hooks/useTheme.test.tsx` | as 6 linhas da tabela de resolução; o script inline, avaliado em `vm`, decide igual às funções; boot dentro de `try/catch`; armazenamento bloqueado sem erro; **montar sem clicar não grava `portfolio-theme`** |
| V-04 | FR-008 | `npx vitest run src/components/shell/SiteShell.test.tsx` | skip link é o 1º focável; 1 `header`, 1 `nav`, 1 `main`, 1 `footer`; seletores de tema e idioma presentes |
| V-05 | FR-009 a FR-011, FR-019, FR-020 | `npx vitest run src/data/routes.test.ts src/content/schema/route.test.ts` | schema e tabela (Data Model); regra de 2 interações; `Localized` completo |
| V-06 | FR-013 a FR-015 | `npx vitest run src/components/shell/Menu.test.tsx` | botão com `aria-expanded`; foco ao abrir e ao fechar; `Esc` fecha |
| V-07 | FR-012, FR-013, FR-015, FR-016, FR-017 | `npx playwright test e2e/shell.e2e.ts` (sobre `dist-prova`) | sequência real de Tab = sequência do FR-016 (calculada da tabela); sem rolagem horizontal em 360, 1023, 1024 e 1920 px; botão do menu presente em 1023 px e ausente em 1024 px; todo controle do menu com ao menos 44×44 px (`boundingBox`); anel de foco visível; console sem aviso de hidratação |
| V-08 | FR-021, FR-022, FR-025, FR-026, FR-034, FR-035 | `npx vitest run src/boot/boot.test.ts src/components/shell/LanguageOffer.test.tsx src/components/shell/LanguageSwitch.test.tsx` | as 9 linhas da tabela de idioma; o seletor PT \| EN tem `href` e `hreflang` para a mesma página no outro idioma, `aria-current` no atual e grava `portfolio-lang` só no clique; **montar sem clicar não grava `portfolio-lang`**; dispensa gravada; faixa não rouba o foco; sem erro com armazenamento bloqueado |
| V-09 | FR-005, FR-023, FR-024, FR-027, FR-028 | `npx vitest run scripts/prerender.test.ts` (projeto `unit`: gera o HTML de cada rota × idioma em memória) e, depois do build, `node scripts/checkDist.mjs dist` | cada rota × idioma tem `<main>`, **um** `<h1>`, casca, `lang`, `hreflang` recíproco (a 404 e a `/_prova` não emitem); o `<script>` do boot vem antes do CSS e é síncrono; nenhum chunk de `dist/static` importa `entry-server`; `checkDist` sai 0 |
| V-10 | FR-027, FR-031, NFR-002 | `npx vitest run scripts/headers.test.ts` | 4 cabeçalhos em `for = "/*"`; as duas regras de status 404 e a regra 301 de `/en/` para `/en` existem, nessa ordem de prioridade |
| V-11 | FR-029, FR-030 | `npx vitest run scripts/assets.test.ts` e o e2e da V-07 (`page.on('request')`) | ≤ 2 famílias, só `/fonts/` do próprio site, `swap`; no máximo 4 arquivos de fonte e a fonte crítica com `<link rel="preload">`; toda requisição do carregamento é da mesma origem |
| V-12 | FR-032, TD-009 | `node scripts/checkDist.mjs dist` (falha se achar `_prova`) e `git grep -n -E "WindowProvider|Taskbar|components/shell/(CommandBar|Sidebar|Window)" -- src` (exit 1; `commandBarEvents.ts` fica e não casa) | `/_prova` fora do publicado; peças antigas fora do código |
| V-13 | NFR-001, NFR-003 | `npm run prova` | JS ≤ 100 KB e CSS ≤ 20 KB (gzip); LCP ≤ 2,5 s, CLS ≤ 0,1 (também com a faixa), INP ≤ 200 ms; axe 0; notas ≥ 95 |
| V-14 | FR-036 a FR-040 | `npx vitest run src/components/shell/Footer.test.tsx src/components/shell/DecorativeStripe.test.tsx src/pages/NotFound.test.tsx src/data/suggestRoutes.test.ts src/styles/state.test.ts` | rodapé com as 4 seções, "sem cookies" e um único link; elenco = versão maior **instalada** de cada nome declarado (e cada nome existe em `dependencies` ou `devDependencies`); faixa `aria-hidden` com 5 cores e sem texto; 404 sugere até 3 rotas do menu e mantém os links; regra de estado com sublinhado ou peso |
| V-15 | FR-041, FR-008 (exceção) | `npx vitest run src/components/shell/SiteShell.test.tsx src/data/routes.test.ts` | a rota `bare` renderiza só a faixa e o `main` (sem `header`, `nav`, `footer`, seletores nem faixa de idioma); só uma rota é `bare`; `bare` e `menu` não coexistem; toda outra rota tem a casca completa |
Nenhum teste pode ser pulado (`skip`/`todo`) e a suíte continua dentro do orçamento de 90 s (001).

## Arquivos que esta spec remove ou substitui (FR-032)
| Arquivo | Destino | Motivo |
| --- | --- | --- |
| `src/components/shell/Header.tsx`, `Footer.tsx`, `SiteShell.tsx` | **substituídos no lugar** | casca nova |
| `src/components/shell/Sidebar.tsx`, `CommandBar.tsx`, `Window.tsx`, `Taskbar.tsx`, `Breadcrumb.tsx`, `windowManager.tsx`, `windowGeometry.ts` | **removidos** | só `SiteShell` os importa (conferido); `windowManager` também em `App.tsx` (o `WindowProvider` sai) |
| `src/components/shell/SiteShell.test.tsx`, `Windows.test.tsx` | reescrito (SiteShell) / **removido** (Windows) | o código testado sai junto |
| `src/styles/workspace.css`, `shell.css`, o bloco `.grid-bg` de `base.css` | **removidos** / reescrito | estilos da casca antiga |
| `src/data/themes.ts` (3 temas), `src/types.ts` (`Theme`), `src/data/themes.test.tsx` | **ajustados** | só 2 temas; o comando `tema` do terminal passa a oferecer só os dois (spec 009 refina) |
| `index.html` (script inline) e `scripts/seoPlugin.ts` (bloco `<noscript>`) | **substituídos** | TD-008, TD-011 |
| `public/fonts/jetbrains-mono-*.woff2` | **removidos** | TD-016 |
| `e2e/site.e2e.ts` | **ajustado** só no que assume a casca antiga | o resto é da spec dona de cada página |
| `src/main.tsx` (`createRoot` vira `hydrateRoot`, sem `shell.css`/`workspace.css`), `src/App.tsx` (`SiteShell` sobe para cá; sai o `WindowProvider`; o `TerminalProvider` sai do 1º acesso, TD-025), `src/router.tsx` (aceita `initial`; não lê `window` na renderização), `src/i18n/LanguageContext.tsx` e `src/hooks/useTheme.tsx` (idioma pela URL; gravam só a escolha), `src/data/seo.ts` (`title`/`desc` migram para a tabela; `hreflang`) | **ajustados** | TD-007, TD-008, TD-011, TD-013, TD-018 |
| `src/data/routes.ts` (cálculo de `draft` para `src/data/routeStatus.ts`, TD-025), `src/data/seo.ts` (dividido), `src/components/shell/commandBarEvents.ts` (sai `SHOW_OUTPUT` e `openShortcuts`), `src/components/CommandPalette.tsx` e `paletteItems.ts` (só destinos de página), `src/components/GlobalOverlays.tsx` (a paleta não monta na rota `bare`), `src/data/shortcuts.ts` (sai "foca a barra de comandos") e o teste dele, as 10 páginas que chamam `<SiteShell>` | **ajustados** | TD-025, Interface Contract |
| `scripts/seoPlugin.test.ts`, `src/data/seo.test.ts`, `src/data/legacyHashes.test.tsx`, `src/App.test.tsx` (afirma `portfolio-lang` e `portfolio-theme` gravados na montagem), `src/styles/contrast.test.ts` (o teste "cada tema extra tem bloco próprio") | **reescritos ou removidos** | o código que testavam muda |
| `.gitignore`, `.prettierignore` e o `ignores` do `eslint.config.js` (`dist-prova`, `.prerender`: senão o `verify` seguinte os reprovaria), `package.json` (`build:prova`, `prova` e as duas `devDependencies` da DQ-010), `playwright.config.ts` (dois servidores: o de desenvolvimento para os e2e atuais e `scripts/serveDist.mjs` para os de `dist-prova`) | **acrescentados** | TD-008, TD-009, TD-019 |
| **Arquivos novos** (a spec de tarefas os lista): `src/boot/boot.ts` e `boot.test.ts`; `src/entry-server.tsx`; `src/data/routeStatus.ts`; `src/data/suggestRoutes.ts` e `.test.ts`; `src/content/schema/route.ts` e `route.test.ts`; `src/content/credits.content.ts`; `src/components/shell/{Menu,LanguageOffer,LanguageSwitch,DecorativeStripe}.tsx` e os testes; `src/hooks/useTheme.test.tsx`; `src/styles/state.test.ts`; `scripts/{prerender,headers,assets}.test.ts`, `scripts/checkDist.mjs`, `scripts/measureBundle.mjs`, `scripts/serveDist.mjs`; `e2e/shell.e2e.ts`; `public/fonts/` (Plex) e `LICENSE-IBM-Plex.txt` | **novos** | TD-006 a TD-025 |
**Ficam** (têm dono em outra spec): `ViewActions.tsx` (usado por `terminal/outputs.tsx`, spec 009), `commandBarEvents.ts`, `CommandPalette.tsx`, `GlobalOverlays.tsx`. Os componentes de página e seus CSS (`sections.css`, `services.css`, `resume.css`, `personal.css`, `case-study.css`, `terminal.css`) ficam até a spec de cada página; a casca nova só os embrulha.

## Divergências entre o mockup e este design
O mockup (`design-reference/mockup/*.dc.html`) é só referência visual. Li `Tokens`, `Mobile`, `NotFound` e `Projetos` (cabeçalho, faixa, 404, rodapé) e `telas-e-requisitos.md` inteiro em 2026-11-17. Em uma segunda leitura varri as outras onze telas só atrás de padrões da casca (cabeçalho, menu, rodapé, foco) e li o `Terminal`; **o conteúdo** de `Academico`, `Bastidores`, `Caso`, `Contato`, `Curriculo`, `Filmes`, `Livros`, `Musica`, `Pessoal` e `Projeto` é das specs 004 a 009 e não foi lido, e `termos-de-uso-apis.md` (spec 008, superado pela decisão de conteúdo curado) também não.
| # | O mockup mostra | Este design | Por quê / pergunta |
| --- | --- | --- | --- |
| 1 | Faixa de idioma no **topo, em fluxo**, antes do cabeçalho (`Mobile`) | **Fixa no topo, por cima do cabeçalho** (DQ-012 (b), escolha da Duda) | O visual é o do mockup; não entra no fluxo (FR-035). **Consequência: cobre o cabeçalho; ver DQ-015.** |
| 2 | No celular: botão de tema ao lado do botão do menu; **sem seletor de idioma** na barra | Tema e idioma dentro do painel do menu | **DQ-013 respondida pela Duda:** dentro do painel (mantém a ordem do FR-016 e o seletor de idioma no cabeçalho). |
| 3 | Seletor de idioma como dois botões `aria-pressed` (PT, EN) | Dois links PT \| EN com `aria-current` | Precisa funcionar sem JavaScript e ter `hreflang` (FR-021, FR-024) |
| 4 | Botão de tema com rótulo que muda ("Mudar para o tema claro") | Nome acessível "Alternar tema: <destino>" (contém o texto visível, WCAG 2.5.3, DQ-027); texto visível do tema de destino por CSS | Hidratação sem divergência (TD-008) |
| 5 | Sem link "ir para o conteúdo" | Primeiro item focável | FR-008, FR-016, US-004 |
| 6 | Fontes pelo Google Fonts (`fonts.googleapis.com`) | Fontes do próprio site | FR-029, FR-030; o mockup é só visual |
| 7 | Plex Sans 400/500/600 e Plex Mono 400/500 | Sans 400 e 600, Mono 400 | NFR-001 (≤ 4 arquivos); a tabela de tipografia do próprio mockup só lista 400 e 600 (Sans) e 400 (Mono) |
| 8 | Menu com 6 itens: Projetos, **Casos**, Currículo, Acadêmico, Contato, Pessoal | 5 itens, sem Casos | **DQ-011 respondida pela Duda** (Casos não tem página-índice) |
| 9 | 404 com sugestões de rotas e o motivo "cd /curriculos", faixa decorativa de 5 cores, rodapé de créditos ("elenco", "trilha sonora") | Sugestões, faixa e rodapé **implementados** (FR-036 a FR-039); **sem** "trilha sonora" e **sem** "cd /curriculos" | **DQ-014 respondida pela Duda** (v1.5 do requirements). |
| 10 | Rodapé: "sem rastreadores" | "sem cookies" | DQ-007 respondida pela Duda |
| 11 | Dois quadros fixos (1280 e 390 px), **sem ponto de quebra** | Ponto de quebra 1024 px (estimado; a tarefa mede) | O mockup não define; ver TD-010 |
| 12 | Título de página 60/63 px em Plex Sans 600 | Preload da Sans 600 e da 400 | Candidato ao LCP; ver TD-016 |
| 13 | `/terminal` sem cabeçalho, menu, rodapé nem seletores (só a faixa e o `main`, "Sair do terminal" primeiro) | **Variante sem casca** para a rota do terminal (FR-041, TD-024) | A Duda escolheu a variante em 2026-11-17 (requirements v1.6) |
O que o design **acertou**: tokens e contrastes (igual à seção 3 do README e à tela `Tokens`), duas famílias, alvo de toque de 44×44 px, foco com anel de 3 px no acento, estado nunca só por cor, página atual com sublinhado e peso, sem degradê.

## Riscos
| ID | Risco | Prob. | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R-001 | 100 KB (gzip) não cabe mesmo com terminal e dados fora do 1º acesso | Média | Médio | medir cedo na tarefa de divisão por rota; se não couber, a Duda decide (subir o número ou cortar escopo), sem editar em silêncio |
| R-002 | Pré-render com `lazy` ou hidratação gera divergência (avisos de hidratação, flash) ou não fecha dentro do `vite build` | Média | Alto | T0: spike técnico com uma rota e os 4 critérios do TD-008; `prerender` espera o `lazy`; casca só com dado determinístico, fora do `Suspense` (TD-018); a prova de hidratação é o e2e sobre `dist-prova` (V-07), não o vitest; se não fechar, volta para a Duda |
| R-003 | Reescrever a casca quebra muitos testes (terminal, busca, e2e) que assumem a casca antiga | Alta | Médio | ajuste mecânico de consultas, nunca de comportamento; lista dos testes quebrados registrada na evidência; um commit por tarefa com o gate verde |
| R-004 | Página de prova escapa para o build publicado | Baixa | Médio | V-12 (`grep` exit 1) e teste da tabela |
| R-005 | Build de prova diverge do publicado e a medição deixa de valer | Média | Médio | teste que compara as duas configurações (TD-009) |
| R-006 | Faixa de idioma desloca o conteúdo e piora o CLS | Média | Médio | `position: fixed` (TD-012); CLS medido com a faixa visível |
| R-007 | Faixa depende de JavaScript para ler o idioma do navegador | Alta | Baixo | sem JavaScript o visitante usa o seletor (um link); nenhum redirecionamento |
| R-008 | A regra de status 404 por idioma e o tratamento de `/en`, `/en/` e das URLs sem barra só se confirmam no deploy | Média | Baixo | cobertura de arquivo hoje (V-10: regras e a ordem delas); confirmação na spec 010; nada é publicado antes (D-001) |
| R-009 | Plex Sans pesa mais do que o previsto e estoura o LCP | Baixa | Médio | DQ-003: o teste de peso decide; plano B: fonte do sistema |
| R-010 | O tom `amber` de `Chip` (tom de componente) é confundido com o tema `amber` | Baixa | Baixo | V-02 olha só `themes.ts`, o `Theme` e o CSS de tema; o tom `amber` de componente não é tema e fica |
| R-011 | A faixa de idioma, fixa no topo, encobre controles que recebem foco (marca, menu, seletores) | Alta | Médio | DQ-015 (M1): o script de boot reserva o espaço desde o primeiro desenho; teste de foco e de CLS com a faixa visível |
| R-012 | O CSS passa de 20 KB (gzip): `main.tsx` importa todos os CSS no 1º acesso e o bloco `/* LEGADO */` fica; o SPIKE mediu 16,1 KB, com folga de ~3,9 KB | Média | Médio | medir o CSS junto com o JS (V-13); o CSS de página sai do 1º acesso quando der; se não couber, volta para a Duda |

## Perguntas deste design
- **DQ-001 (respondida pelo design, aguarda aprovação):** CSP não nesta spec (TD-015).
- **DQ-002 (respondida pelo design, aguarda aprovação):** menu a 1024 px (TD-010); faixa de idioma fixa **no topo**, só no cliente, via `navigator.languages` (TD-012, DQ-012 e DQ-015); sem JavaScript o seletor de idioma é um link (Interface Contract).
- **DQ-003 (aberta):** famílias e pesos de fonte, depois do teste de peso (TD-016).
- **DQ-004 a DQ-007, DQ-009 (respondidas pela Duda):** creme `#FFF7EA`; paleta colorida nos dois temas; piso de 3:1 sobre os pastéis; "sem cookies"; regra de branch.
- **DQ-008 (resolvida):** as cinco cores da faixa decorativa vêm do mockup, nos dois temas (Tokens, "Decoração sem texto"); a faixa entrou como FR-038.
- **DQ-010 (respondida pela Duda, 2026-11-17: sim):** adicionar `@axe-core/playwright` e `lighthouse` como `devDependencies` (TD-019), recomendado.
- **DQ-011 (respondida pela Duda, 2026-11-17):** os itens do menu são **Projetos, Currículo, Acadêmico, Contato, Pessoal**; "Casos" do mockup não tem página-índice. As rotas de projetos, currículo e contato **já entram como `menu: true` na 002** (DQ-019); as specs 005 e 007 só trocam a página.
- **DQ-012 (respondida pela Duda, 2026-11-17, na reabertura):** faixa de idioma **fixa no topo, por cima do cabeçalho** (opção (b), TD-012). Resolve o desvio do mockup sem deslocar o conteúdo, e abre a DQ-015.
- **DQ-013 (respondida pela Duda, 2026-11-17):** no celular, tema e idioma ficam **dentro do painel do menu** (TD-010).
- **DQ-014 (respondida pela Duda, 2026-11-17):** os cinco itens P-002-a a P-002-e viraram FR-036 a FR-040 (requirements v1.5).
- **DQ-015 (respondida pela Duda, 2026-11-17):** **M1**: o script de boot reserva o espaço da faixa desde o primeiro desenho, então ela não cobre o cabeçalho nem desloca nada (TD-012).
- **DQ-026 (respondida pela Duda, 2026-11-17, durante a T2.2):** o `desc` da rota é a dica curta do terminal, da paleta e da barra lateral; o texto de SEO do `pageMeta` vira o campo novo `description` (e `title`), sem sobrescrever o `desc`. Corrige o Data Model e o TD-006 da v2.2.
- **DQ-016 (respondida pela Duda, 2026-11-17: reaproveitar o que existe):** título e descrição do estudo de caso vêm de `pageMeta`. Os `enPath` de `/en`, `/en/terminal`, `/en/github` e `/en/case-studies/whatsapp-dispatcher` foram propostos por mim e **confirmados pela Duda em 2026-11-17**.
- **DQ-017 (respondida pela Duda, 2026-11-17):** sim, extrair só o cálculo de `draft` de `routes.ts`, sem mudar conteúdo nem comportamento da 008 (TD-025).
- **DQ-018 (respondida pela Duda, 2026-11-17):** sim, o `SiteShell` sobe para o `App`, e as páginas param de chamar `<SiteShell>` (Interface Contract, TD-018).
- **DQ-019 (respondida pela Duda, 2026-11-17):** as rotas atuais já entram como `menu: true` (Data Model).
- **DQ-020 (respondida pela Duda, 2026-11-17):** a paleta da 002 oferece só destinos de página; os comandos ficam para a spec 009 (TD-025).
- **DQ-021 (respondida pela Duda, 2026-11-17):** `/en/` (com barra final) redireciona 301 para `/en` (TD-014).

## Confirm before building
Antes de qualquer tarefa de implementação, o implementador restata, com as próprias palavras, e espera o OK da Duda:
1. **FRs (resumo):** casca com skip link, cabeçalho, menu pela tabela de rotas, tema claro/escuro sem flash, idioma por URL (PT na raiz, EN em `/en/`) com faixa de oferta sem redirecionar, 404 por idioma com sugestões, HTML por rota com conteúdo sem JavaScript, rodapé de créditos com elenco lido do `package.json`, faixa decorativa, estado nunca só por cor, fontes próprias, cabeçalhos de segurança, medição num build de prova.
2. **Restrições:** branch `rebuild/sdd`, nenhum `git push`, nada na `main`; nada da 008 (`netlify/personal/`, `personal-*.mts`, integrações, `@netlify/blobs`, `[functions]`), **exceto extrair o cálculo de `draft` de `routes.ts` (TD-025, autorizado em 2026-11-17)**; `src.zip` intacto; cada tarefa com `verify` verde e bloco de evidência; a página `/_prova` nunca no build publicado.
3. **Perguntas abertas:** DQ-003 (teste de peso das fontes) fica aberta até a tarefa que mede o peso dos arquivos. DQ-008 e DQ-010 a DQ-021 foram respondidas, inclusive a confirmação dos quatro `enPath` (DQ-016).
4. **Estado:** o gate da implementação é `tasks:approved`; este documento é `design:draft`.

- **DQ-027 (respondida pela Duda, 2026-11-18, durante a T5.3):** o axe reprovou o botão de tema por `label-content-name-mismatch` (WCAG 2.5.3, nível A): o texto visível é o tema de destino ("escuro"/"claro") e o nome acessível fixo ("Alternar tema") não o contém. A Duda escolheu que o **nome acessível inclua o destino**: "Alternar tema: escuro" / "Toggle theme: dark" (muda com o tema, mantém o visual). Altera o TD-010 (nome fixo) e a linha 4 da tabela de divergências do mockup; `ThemeToggle.tsx` e os testes foram ajustados (design v2.4, tasks v1.4).
