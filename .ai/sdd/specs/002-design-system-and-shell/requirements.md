# 002 Design system and shell, Requirements
**Status:** approved (v1.4 aprovada pela Duda em 2026-11-17)   **Version:** 1.4   **Author:** Claude (rascunho para a Duda)   **Date:** 2026-11-17   **Depende de:** 001-engineering-baseline

## Changes since first draft
### Versão 1.4 (2026-11-17, aprovada pela Duda junto com as v1.1 a v1.3)
Pelo SPIKE-001 (`spike-001.md`): o JavaScript do 1º acesso hoje mede 118,2 KB em gzip e o piso do React sozinho é 67,5 KB. A Duda decidiu que a compressão que vale é **gzip** e que a meta de JavaScript passa de 90 KB para **100 KB**. O CSS segue em 20 KB (hoje 16,1 KB). Mudam a meta da seção de objetivos, o NFR-001, a FAQ, os Riscos e as Success Metrics. A referência a "143 KB" (medida antiga) foi trocada pela medição do SPIKE-001. Nenhum outro requisito mudou.

### Versão 1.3 (correção só das Constraints, autorizada pela Duda em 2026-11-15)
A regra de branch passou de "`main`, sem push" para "branch `rebuild/sdd`, push só quando a Duda pedir, merge na `main` no lançamento" (V-D-015 corrigida). Nenhum requisito funcional mudou.

### Versão 1.2
1. **Build de prova:** as metas de tamanho e desempenho agora se medem num build de prova otimizado como o de produção, com `/_prova` habilitada; o build publicado continua sem `/_prova`, com teste. Mudam as Definições, o NFR-001, os Riscos e as Success Metrics.
2. **Idioma na primeira visita (decisão da Duda):** em vez de redirecionar, uma faixa oferece o inglês quando o navegador prefere inglês. Mudam FR-022, FR-025, FR-026 (e FR-034 e FR-035, novos), a tabela de idiomas, DQ-002, a FAQ e os Riscos.
3. **US-001:** a referência às specs corrigida para o PLAN real: projetos é a 005, currículo e contato são a 007.
4. **Rodapé:** a página de prova ganhou um link de rodapé, para a sequência de foco do FR-016 ser testável.
5. **D-001:** "nada é publicado" vale só enquanto a Duda não der push, porque o Netlify publica a partir da `main`.
6. **FR-032:** passou a citar os 3 temas extras, que saem nesta spec. A remoção do resto do código fora do MVP é da spec 001 (D-004 dela).

### Versão 1.1
Esta spec é a metade visual da antiga `001-foundation-and-design-system` (a outra metade virou a `001-engineering-baseline`). A tabela de rastreio no fim mostra o ID antigo de cada item.
1. **Divisão:** a pasta foi renomeada de `001-foundation-and-design-system` para `002-design-system-and-shell`; verificação, testes, schemas, paridade e datas foram para a 001.
2. **Perguntas respondidas:** Q-001 (direção visual: usar o fallback) e Q-002 (endereços: PT na raiz, EN em `/en/`, com `hreflang`). Removida a linha que dizia que a Q-001 não bloqueava a aprovação.
3. **Integração contínua** (antigo FR-020) saiu e foi para a spec 010.
4. **Idioma na primeira visita e com armazenamento bloqueado** ganhou FRs próprios (FR-025 e FR-026), alinhados com a FAQ.
5. **Requisitos compostos separados:** o antigo FR-003 virou FR-003 a FR-006, e o antigo FR-010 virou FR-019 a FR-026.
6. **"Página de prova da casca" definida** (rota, conteúdo e uso), e o critério de "2 toques" passou a ser testado contra a tabela de rotas, não contra páginas que ainda não existem.
7. **Itens não testáveis:** o FR-016 define a ordem de foco com uma sequência esperada; a linha de CSP virou o FR-031 (cabeçalhos presentes, passa ou falha) e a pergunta DQ-001 para o design.
8. **Sem nome de ferramenta nos requisitos:** Lighthouse, axe, `npm` e afins foram para as "Notas para o design".
9. **Risco do FR-028:** registrado um SPIKE (a rodar no início do design, não agora) que mede o que o HTML pré-renderizado contém hoje e confere a meta de JavaScript contra ele.
10. **IDs:** `D-` e `Q-` são locais a esta spec; a visão aparece como `V-D-NNN` e o plano como `P-Q-NNN`.

## Overview
A casca é o que o visitante vê em toda página: a identidade visual nova, o cabeçalho com navegação, os temas claro e escuro, a troca de PT/EN com endereço próprio, o rodapé e a página de erro. Ela precisa funcionar de 360 a 1920 px, por teclado e sem JavaScript no conteúdo principal. Serve a RH, professores e entrevistadores, que escaneiam em 60 s (V-D-001), e é a base visual de todas as specs seguintes. Depende da 001 (esquemas de conteúdo, paridade de tradução e o comando de verificação).

## Goals
- Uma só fonte de tokens (cor, tipo, espaço, movimento) alimenta os dois temas, e todo par texto/fundo passa em contraste AA, verificado por teste.
- A casca funciona de 360 a 1920 px, sem rolagem horizontal, com tudo alcançável pelo teclado.
- Cada idioma tem endereço próprio (PT na raiz, EN sob `/en/`) e a troca de idioma leva à mesma página no outro idioma.
- A casca, medida na página de prova do build de prova (ver Definições), transfere no máximo 100 KB de JavaScript e 20 KB de CSS comprimidos em gzip (o JavaScript do 1º acesso de hoje tem 118,2 KB em gzip, medido no SPIKE-001).
- LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 na página de prova do build de prova, em perfil de celular médio.

## Non-Goals (v1)
- **Conteúdo de qualquer página** (home, projetos, casos, currículo, `/pessoal`): specs 003 a 008.
- **Analytics, mapa do site, Open Graph, redirecionamento das URLs antigas e integração contínua:** spec 010. Esta spec só deixa título, descrição e idioma por rota no dado.
- **Mais de dois temas:** os 3 temas extras de hoje (dracula, solarized, amber) saem (V-D-006).
- **Componentes de feature** (grade de pôsteres, estrelas, diário): cada um nasce na spec dona.
- **Biblioteca de UI ou framework de CSS de terceiros:** o steering mantém CSS puro com tokens.
- **O terminal:** spec 009; aqui só se garante que uma rota fora do menu não aparece na navegação (FR-010).
- **Contas, comentários e login:** o produto não é uma rede social.

## Definições
- **Tabela de rotas:** o único lugar onde cada rota do site é declarada, com caminho em PT, caminho em EN, rótulo, título e descrição nos dois idiomas, e se aparece no menu. Navegação, título da página e página de erro leem dela.
- **Página de prova da casca:** a rota `/_prova`, que existe só no build de prova e nunca no build publicado (fora do menu e da indexação). Contém: link "ir para o conteúdo", cabeçalho com a navegação lida da tabela de rotas, seletores de tema e de idioma, um título `h1`, um `h2` e um `h3`, três parágrafos de texto de exemplo (marcados como exemplo, sem dado sobre a Duda), um link de texto, um botão principal e um secundário, uma figura com imagem de exemplo com texto alternativo e dimensões, uma lista de cinco etiquetas e um rodapé com um link para a home. É nela que se medem tamanho, desempenho e acessibilidade da casca, nos dois temas e nos dois idiomas, e é nela que se testa a ordem do foco (FR-016).
- **Build de prova:** a geração do site com as mesmas otimizações do build publicado (minificação, divisão de código e compressão), mais a rota `/_prova`. As metas de tamanho e desempenho do NFR-001 são medidas nele. O build publicado não contém `/_prova`, e um teste confere isso. Fora a rota `/_prova`, o build de prova e o publicado usam a mesma configuração, para a medição valer para o que vai ao ar.

## User Stories
### US-001: Escanear o site rápido
**As a** recrutadora, **I want to** achar currículo, projetos e contato logo, **so that** eu decida em 60 s se vale chamar a Duda.
**Acceptance criteria:**
- [ ] Para toda rota marcada como item de menu na tabela de rotas, a distância a partir de qualquer outra rota é de no máximo 2 interações (teste sobre a tabela, não sobre páginas que ainda não existem).
- [ ] Quando as specs 005 (projetos) e 007 (currículo e contato) chegarem a `implementation:done`, as rotas de projetos, currículo e contato constam na tabela como itens de menu.
- [ ] Nenhuma página tem rolagem horizontal entre 360 e 1920 px.

### US-002: Escolher o tema
**As a** professor, **I want to** ler no claro ou no escuro, **so that** a leitura fique confortável.
**Acceptance criteria:**
- [ ] Na primeira visita o tema segue a preferência do sistema.
- [ ] A escolha manual persiste entre visitas.
- [ ] Não há flash do tema errado antes do primeiro desenho.

### US-003: Trocar o idioma
**As a** entrevistador de empresa internacional, **I want to** ler em inglês, **so that** eu entenda sem traduzir.
**Acceptance criteria:**
- [ ] Um seletor de idioma está no cabeçalho de toda página.
- [ ] Ao trocar, a página aberta é a mesma, no outro idioma, em endereço próprio, e o atributo `lang` acompanha.
- [ ] Na primeira visita com navegador em inglês, o visitante vê uma faixa que oferece o inglês, sem ser redirecionado (FR-025).

### US-004: Navegar por teclado e leitor de tela
**As a** pessoa que não usa mouse, **I want to** chegar a tudo pelo teclado, **so that** eu use o site como qualquer outra.
**Acceptance criteria:**
- [ ] O primeiro item focável é o link "ir para o conteúdo".
- [ ] Todo controle tem foco visível com contraste de pelo menos 3:1.
- [ ] A ordem de foco na página de prova é a sequência do FR-016.
- [ ] A casca tem marcos de leitor de tela (`header`, `nav`, `main`, `footer`) sem repetição indevida.

## Functional Requirements
### FR-001: Fonte única de tokens (Must Have) — US-002, US-004
THE SYSTEM SHALL definir toda cor, família e escala tipográfica, espaçamento, raio e duração de movimento num único conjunto de tokens.

### FR-002: Dois temas (Must Have) — US-002
THE SYSTEM SHALL oferecer exatamente dois temas, claro e escuro, ambos derivados dos mesmos tokens, sem degradê e sem valor literal de cor fora dos tokens.

### FR-003: Tema da primeira visita (Must Have) — US-002
WHEN o visitante abre o site sem escolha gravada, THE SYSTEM SHALL aplicar o tema de `prefers-color-scheme`.

### FR-004: Escolha do tema (Must Have) — US-002
WHEN o visitante escolher um tema, THE SYSTEM SHALL gravar a escolha e usá-la nas visitas seguintes.

### FR-005: Tema antes do primeiro desenho (Must Have) — US-002
THE SYSTEM SHALL aplicar o tema antes do primeiro desenho da página.

### FR-006: Armazenamento bloqueado e o tema (Must Have) — US-002
IF o armazenamento local do navegador estiver indisponível, THE SYSTEM SHALL seguir `prefers-color-scheme` sem erro visível.

### FR-007: Contraste (Must Have) — US-004
THE SYSTEM SHALL manter razão de contraste de pelo menos 4,5:1 para texto normal e 3:1 para texto grande e para componentes de interface, em ambos os temas, e SHALL ter teste automatizado que falha se um par de tokens violar.

### FR-008: Casca do site (Must Have) — US-001, US-004
THE SYSTEM SHALL renderizar em toda página um link "ir para o conteúdo", um cabeçalho com a navegação principal, o seletor de tema, o seletor de idioma, um `main` e um rodapé.

### FR-009: Tabela única de rotas (Must Have) — US-001
THE SYSTEM SHALL declarar cada rota numa única tabela de rotas, e a navegação, o título da página e a página de erro SHALL ler dela.

### FR-010: Rota fora do menu (Must Have) — US-001
WHERE uma rota não estiver marcada como item de menu, THE SYSTEM SHALL não exibi-la na navegação principal.

### FR-011: Rota sem texto em um idioma (Must Have) — US-003
IF uma rota da tabela não tiver rótulo, título ou descrição em PT ou em EN, THE SYSTEM SHALL falhar a verificação (usa a paridade da spec 001, FR-014).

### FR-012: Layout responsivo (Must Have) — US-001
THE SYSTEM SHALL renderizar a casca sem rolagem horizontal em larguras de 360 a 1920 px.

### FR-013: Menu em tela estreita (Must Have) — US-001
WHILE a largura for menor que o ponto de quebra do menu (definido no design), THE SYSTEM SHALL mostrar a navegação atrás de um único botão que abre e fecha por teclado e por toque.

### FR-014: Foco no menu (Must Have) — US-004
WHEN o menu de tela estreita abrir, THE SYSTEM SHALL levar o foco para ele; WHEN fechar, THE SYSTEM SHALL devolver o foco ao botão que o abriu.

### FR-015: Alcance por teclado (Must Have) — US-004
THE SYSTEM SHALL permitir alcançar e acionar todo controle da casca pelo teclado.

### FR-016: Ordem do foco (Must Have) — US-004
THE SYSTEM SHALL percorrer o foco, na página de prova do build de prova, com Tab nesta sequência: link "ir para o conteúdo", marca do site, itens do menu na ordem da tabela de rotas, seletor de tema, seletor de idioma, o link de texto, o botão principal e o botão secundário do conteúdo, o link do rodapé para a home; e um teste SHALL comparar a sequência real com esta. WHILE a faixa de idioma estiver visível, ela vem logo depois do link "ir para o conteúdo".

### FR-017: Foco visível (Must Have) — US-004
THE SYSTEM SHALL exibir, em todo controle focado, um indicador com contraste de pelo menos 3:1 contra o fundo adjacente.

### FR-018: Movimento reduzido (Must Have) — US-004
WHILE `prefers-reduced-motion` estiver ativo, THE SYSTEM SHALL não executar animações nem transições não essenciais.

### FR-019: Idiomas oferecidos (Must Have) — US-003
THE SYSTEM SHALL oferecer a interface em PT e em EN.

### FR-020: Endereço por idioma (Must Have) — US-003
THE SYSTEM SHALL servir cada página em PT na raiz (`/projetos`) e a mesma página em EN sob `/en/` (`/en/projects`), cada uma com o caminho declarado na tabela de rotas.

### FR-021: Troca de idioma leva à mesma página (Must Have) — US-003
WHEN o visitante trocar de idioma, THE SYSTEM SHALL abrir o equivalente da mesma página no outro idioma.

### FR-022: Troca de idioma é gravada (Must Have) — US-003
WHEN o visitante escolher um idioma, pelo seletor ou pela faixa de idioma, THE SYSTEM SHALL gravar a escolha para as visitas seguintes.

### FR-023: Atributo de idioma (Must Have) — US-003
THE SYSTEM SHALL manter o atributo `lang` do documento igual ao idioma da página exibida.

### FR-024: Páginas alternativas (Must Have) — US-003
THE SYSTEM SHALL declarar em cada página, com `hreflang`, o endereço da página equivalente no outro idioma.

### FR-025: Oferta de inglês na primeira visita (Must Have) — US-003
WHEN o visitante abrir um endereço em PT sem escolha de idioma gravada e sem ter dispensado a faixa, e o idioma preferido do navegador for o inglês (`Accept-Language`), THE SYSTEM SHALL mostrar uma faixa que oferece a página equivalente em `/en/`, sem redirecionar e sem alterar a página que o visitante abriu.

### FR-026: Armazenamento bloqueado e o idioma (Must Have) — US-003
IF o armazenamento local estiver indisponível, THE SYSTEM SHALL oferecer a faixa em cada visita em que o navegador preferir o inglês, sem erro visível.

### FR-027: Página de erro 404 (Must Have) — US-001
IF o endereço não existir, THE SYSTEM SHALL responder com status HTTP 404 e uma página, nos dois idiomas, com links para a home e para o menu principal.

### FR-028: Conteúdo sem JavaScript (Must Have) — US-001
THE SYSTEM SHALL entregar, para cada rota, um HTML que já contenha a casca e o conteúdo principal da rota, legível com JavaScript desligado.

### FR-029: Fontes (Must Have) — US-001
THE SYSTEM SHALL servir fontes do próprio site, usar no máximo duas famílias, e manter o texto visível com fonte reserva enquanto a fonte carrega.

### FR-030: Sem requisição a terceiros (Must Have) — US-001
THE SYSTEM SHALL NOT fazer requisição a origem de terceiros no carregamento de uma página.

### FR-031: Cabeçalhos de segurança (Must Have) — US-001
THE SYSTEM SHALL incluir em toda resposta de página os cabeçalhos `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` e `Permissions-Policy` que desliga câmera, microfone e geolocalização, e um teste SHALL falhar se algum faltar.

### FR-032: Remoção do código antigo (Should) — US-001
WHEN uma peça nova substituir uma antiga (casca, tokens, os 3 temas extras dracula, solarized e amber, roteamento), THE SYSTEM SHOULD remover a antiga na mesma tarefa, com a lista de arquivos removidos no `design.md` (regra de testes: spec 001, FR-006). O código fora do MVP (trilhas, personas, jogos, assistente de IA) é removido pela spec 001.

### FR-033: Terminal e integração contínua (Won't nesta spec)
THE SYSTEM WON'T tratar o terminal (spec 009) nem a integração contínua (spec 010) aqui.

### FR-034: Dispensar a faixa (Must Have) — US-003
WHEN o visitante dispensar a faixa de idioma, THE SYSTEM SHALL gravar a dispensa e SHALL NOT mostrar a faixa de novo.

### FR-035: Quando a faixa não aparece (Must Have) — US-003
IF o endereço estiver sob `/en/`, ou houver escolha de idioma gravada, ou a faixa já tiver sido dispensada, THE SYSTEM SHALL NOT mostrar a faixa. A faixa tem nome acessível, não rouba o foco ao aparecer e não desloca o conteúdo da página.

## Non-Functional Requirements
### NFR-001: Performance
- Todas as medições abaixo são feitas na página de prova do **build de prova** (otimizado como o de produção, ver Definições), nunca no servidor de desenvolvimento.
- JavaScript ≤ 100 KB e CSS ≤ 20 KB transferidos, comprimidos em gzip.
- Em perfil de celular médio: LCP ≤ 2,5 s, CLS ≤ 0,1 e INP ≤ 200 ms (o design define o método de medição de INP em laboratório). O CLS é medido também com a faixa de idioma visível (FR-035: não desloca o conteúdo).
- No máximo 2 famílias e 4 arquivos de fonte na primeira pintura, com a fonte crítica pré-carregada.
- A meta de JavaScript é conferida contra o resultado do SPIKE-001 (ver Riscos) antes de o design a fixar.

### NFR-002: Segurança
- Nenhuma requisição a terceiros no carregamento e nenhum script externo (FR-030).
- Os quatro cabeçalhos do FR-031 estão presentes em toda página (teste passa ou falha).
- Uma política de segurança de conteúdo (CSP) é decisão do design, ver DQ-001; esta spec não a exige.

### NFR-003: Acessibilidade
- WCAG 2.1 AA: contraste (FR-007), teclado (FR-015, FR-016), foco visível ≥ 3:1 (FR-017), `lang` correto (FR-023), marcos de página (FR-008), movimento reduzido (FR-018).
- Alvos de toque do menu ≥ 44×44 px.
- Verificador automatizado de acessibilidade sem violações na página de prova, nos 2 temas × 2 idiomas.
- Toda imagem com texto alternativo e dimensões (já garantido pelo dado, spec 001 FR-009).

## Constraints
- Stack e host conforme `.ai/steering/tech-stack.md` (V-D-014, V-D-013).
- A reconstrução fica na branch `rebuild/sdd`, com `git push` só quando a Duda pedir; o merge na `main` só no lançamento (spec 010), porque o Netlify publica a partir dela (V-D-015, corrigida em 2026-11-15); o código novo substitui o antigo no lugar (P-Q-001).
- Conteúdo nunca inventado; fontes e ativos com licença registrada (OFL ou equivalente).
- Aprovação só pela Duda.

## Decisions
### D-001: A produção atual permanece intacta até a 010
**Decision:** enquanto a Duda não der `git push`, nada é publicado, então as páginas antigas ainda não migradas podem ficar quebradas ou ausentes localmente durante a transição. O Netlify publica a partir da `main`: um push antes da spec 010 publicaria um site parcial. **Rationale:** evita manter a casca antiga e a nova em paralelo, que dobraria a complexidade (auditoria §8). **Alternatives considered:** manter as duas cascas atrás de uma chave (mais código e mais testes); migrar tudo de uma vez (bloco grande demais).

### D-002: Só dois temas
**Decision:** claro e escuro. **Rationale:** V-D-006 e menos pares de contraste para testar. **Alternatives considered:** manter os 5 temas (rejeitado pela Duda).

### D-003: Teste de contraste automatizado
**Decision:** um teste calcula as razões dos pares de tokens e falha abaixo do limite. **Rationale:** um número de contraste não pode depender de olho. **Alternatives considered:** só o verificador de acessibilidade na página (não cobre estados e pares fora da tela).

### D-004: Direção visual
**Decision:** a identidade segue o fallback da spec: sans-serif legível para interface, uma mono para código e metadados, paleta neutra com um único acento e sem degradê. As famílias e os valores concretos viram `TD` no design. **Rationale:** a Duda preferiu o fallback a passar referências (Q-001). **Alternatives considered:** partir de referências de sites que ela escolhesse (recusado por ela agora; pode ser refinado depois).

### D-005: PT na raiz, EN sob `/en/`
**Decision:** cada idioma tem endereço próprio. **Rationale:** bom para buscadores e para compartilhar link em inglês (Q-002). **Alternatives considered:** mesmo endereço nos dois idiomas, com o idioma só no navegador.

## Questions
### Q-001 (answered): direção visual
A Duda escolheu o fallback: sans-serif legível, uma mono, uma cor de acento, sem degradê (D-004).

### Q-002 (answered): endereços por idioma
A Duda confirmou PT na raiz e EN sob `/en/`, com `hreflang` (D-005).

## Perguntas para o design (não bloqueiam esta aprovação)
- **DQ-001:** avaliar uma política de segurança de conteúdo (CSP) para a casca e decidir com um `TD`; hoje não existe.
- **DQ-002:** ponto de quebra do menu e a faixa de idioma do FR-025: onde aparece, como se lê a preferência do navegador e o que o visitante vê sem JavaScript (o seletor de idioma do cabeçalho continua disponível).
- **DQ-003:** qual família sans-serif e qual mono, com licença livre, cumpre as restrições do FR-029.

## Implementation FAQ
**Q:** Uma rota existe só em um idioma?
**A:** Não pode: a tabela exige rótulo, título e descrição nos dois idiomas, e a verificação falha (FR-011).

**Q:** E se o armazenamento local do navegador estiver bloqueado?
**A:** O tema segue o sistema (FR-006) e o idioma segue a preferência do navegador a cada visita (FR-026), sem erro.

**Q:** O visitante escolheu PT, mas o navegador está em inglês?
**A:** A escolha gravada vence e a faixa não aparece (FR-035). Nada é redirecionado em nenhum caso: a faixa só oferece o link para `/en/` (FR-025).

**Q:** O visitante abre um link compartilhado em PT, com navegador em inglês, sem JavaScript?
**A:** Vê a página em PT, sem faixa (a leitura da preferência precisa de JavaScript) e com o seletor de idioma do cabeçalho (FR-025, DQ-002). Nunca é desviado.

**Q:** O visitante dispensa a faixa com o armazenamento bloqueado?
**A:** A dispensa não pode ser gravada, então a faixa volta na próxima visita, sem erro (FR-026). A faixa nunca bloqueia o conteúdo.

**Q:** O sistema prefere o tema escuro e o visitante escolheu claro?
**A:** A escolha gravada vence a preferência do sistema (FR-003, FR-004).

**Q:** Um título muito longo, um acento ou um texto de 80 caracteres sem espaço quebra a casca?
**A:** Não: o cabeçalho e o menu quebram linha ou truncam com `title`, e o texto sem espaço não gera rolagem horizontal (FR-012).

**Q:** O que acontece com uma página antiga ainda não migrada?
**A:** Fica quebrada ou ausente localmente até a spec dela (D-001). Só não é publicada enquanto a Duda não der `push`, porque o Netlify publica a partir da `main`. Essa dependência entre specs é a razão da ordem do PLAN.

**Q:** Duas rotas pedem o mesmo caminho, ou um caminho colide com `/en/`?
**A:** É erro de verificação: a tabela não aceita caminho repetido nem um caminho em PT que comece com `/en/` (dependência entre a tabela e FR-020).

**Q:** Um par de cores só aparece em hover ou em foco?
**A:** Entra no teste de contraste do mesmo jeito: todo token usado como texto ou controle é testado nos dois temas (FR-007).

**Q:** O JavaScript fica desligado e a página tem um menu?
**A:** O HTML entregue já contém os links do menu (FR-028); em tela estreita, o botão do menu pode exigir JavaScript, mas os links continuam alcançáveis (design define a alternativa sem JavaScript).

**Q:** Como sabemos o que o HTML pré-renderizado contém hoje (FR-028)?
**A:** Pelo SPIKE-001, a rodar no início do design e não agora; ele mede o conteúdo do HTML pré-renderizado atual e confere a meta de 100 KB (gzip) contra o resultado. O SPIKE-001 foi feito em 2026-11-17 (`spike-001.md`). O SPIKE nunca fecha tarefas.

## Success Metrics
- [ ] Na página de prova do build de prova: JavaScript ≤ 100 KB e CSS ≤ 20 KB comprimidos em gzip.
- [ ] No build de prova, em perfil de celular: LCP ≤ 2,5 s, CLS ≤ 0,1 (também com a faixa de idioma visível), INP ≤ 200 ms e notas de acessibilidade e boas práticas ≥ 95.
- [ ] O build publicado não contém `/_prova` (teste).
- [ ] O verificador de acessibilidade não encontra violações nos 2 temas × 2 idiomas.
- [ ] Os testes de contraste, de ordem de foco e de cabeçalhos de segurança passam.
- [ ] Cada rota da tabela existe nos dois idiomas, com `hreflang` recíproco.
- [ ] A faixa de idioma aparece só nos casos da tabela de idioma, e nunca há redirecionamento.

## Risks
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Identidade nova atrasa o design | Média | Alto | D-004: fallback aprovado; famílias e valores concretos como TD |
| Remover o código antigo quebra páginas ainda sem spec | Alta | Médio | D-001: nada é publicado enquanto a Duda não der `push`; lista de remoções no design |
| Um `push` antes da 010 publica um site parcial, porque o Netlify publica a partir da `main` | Média | Alto | D-001; a Duda só dá `push` no lançamento; o AGENTS.md já proíbe `push` sem pedido |
| Meta de 100 KB (gzip) de JavaScript inviável com o roteador e a i18n atuais | Média | Médio | SPIKE-001: medir cedo; ajustar o número ou a arquitetura com aprovação |
| HTML sem JavaScript (FR-028) exige mudar a renderização | Média | Alto | SPIKE-001 mede o conteúdo do HTML pré-renderizado de hoje; decisão registrada como TD |
| A faixa de idioma (FR-025) desloca o conteúdo e piora o CLS | Média | Médio | FR-035 a proíbe; o CLS é medido com a faixa visível (NFR-001) |
| A faixa depende de JavaScript para ler a preferência do navegador | Alta | Baixo | Sem JavaScript o visitante usa o seletor do cabeçalho; nenhum redirecionamento, então nenhum link compartilhado é desviado |
| A página de prova escapa para o build publicado | Baixa | Médio | Teste do build publicado: `/_prova` não existe |
| O build de prova se afasta do publicado e a medição deixa de valer | Média | Médio | As Definições exigem a mesma configuração, exceto `/_prova`; um teste compara os dois |

## Resolução do tema: entrada → resultado
| Escolha gravada | Preferência do sistema | Armazenamento | Tema aplicado |
| --- | --- | --- | --- |
| nenhuma | claro | disponível | claro (FR-003) |
| nenhuma | escuro | disponível | escuro (FR-003) |
| claro | escuro | disponível | claro (FR-004) |
| escuro | claro | disponível | escuro (FR-004) |
| (não lê) | escuro | bloqueado | escuro, sem erro (FR-006) |
| valor gravado inválido (`dracula`) | claro | disponível | claro: ignora o valor e segue o sistema |

## Resolução do idioma: entrada → resultado
Nenhuma linha redireciona: o endereço aberto é sempre o que o visitante vê.
| Endereço aberto | Escolha gravada | Faixa dispensada | Navegador prefere | Armazenamento | Resultado |
| --- | --- | --- | --- | --- | --- |
| `/projetos` (PT) | nenhuma | não | inglês | disponível | PT com faixa que oferece `/en/projects` (FR-025) |
| `/projetos` (PT) | nenhuma | não | português | disponível | PT, sem faixa |
| `/projetos` (PT) | nenhuma | não | espanhol ou outro | disponível | PT, sem faixa |
| `/projetos` (PT) | PT | não | inglês | disponível | PT, sem faixa (a escolha vence, FR-035) |
| `/projetos` (PT) | nenhuma | sim | inglês | disponível | PT, sem faixa (FR-034) |
| `/en/projects` | nenhuma | não | inglês | disponível | EN, sem faixa (FR-035) |
| `/en/projects` | PT | não | português | disponível | EN, sem faixa (o endereço direto vence) |
| `/projetos` (PT) | (não lê) | (não lê) | inglês | bloqueado | PT com faixa em toda visita, sem erro (FR-026) |
| `/xyz` inexistente | qualquer | qualquer | qualquer | qualquer | 404 no idioma do endereço (FR-027) |

## Rastreio com o primeiro rascunho
| ID no primeiro rascunho | ID aqui |
| --- | --- |
| US-001, US-002, US-003, US-004 | US-001, US-002, US-003, US-004 |
| FR-001 | FR-001 |
| FR-002 | FR-002 |
| FR-003 | FR-003, FR-004, FR-005, FR-006 |
| FR-004 | FR-007 |
| FR-005 | FR-008 |
| FR-006 | FR-009, FR-010, FR-011 |
| FR-007 | FR-012, FR-013 |
| FR-008 | FR-014, FR-015, FR-016, FR-017 |
| FR-009 | FR-018 |
| FR-010 | FR-019 a FR-026 (FR-025 e FR-026 são novos; v1.2: a faixa de idioma substitui o redirecionamento) |
| (novos na v1.2) | FR-034 (dispensar a faixa), FR-035 (quando a faixa não aparece) |
| FR-014 | FR-027 |
| FR-015 | FR-028 |
| FR-016 | FR-029, FR-030 |
| FR-019 | FR-032 |
| FR-021 | FR-033 |
| NFR-001, NFR-002, NFR-003 | NFR-001, NFR-002 (+ FR-031), NFR-003 |
| Q-001, Q-003 | Q-001, Q-002 |
| FR-011, FR-012, FR-013, FR-017, FR-018, FR-020, US-005, US-006 | spec 001 |

## Notas para o design (ferramentas, fora dos requisitos)
- Medição de desempenho e acessibilidade: Lighthouse (perfil móvel) e axe, nos 2 temas × 2 idiomas. INP em laboratório por teste de interação.
- Testes de ordem de foco e de cabeçalhos: Playwright; contraste: teste unitário sobre os tokens (`contrast.test.ts` já existe).
- Roteamento e HTML por rota: avaliar o roteador próprio e `scripts/seoPlugin.ts` (tech-stack, "Pendências de decisão").
- Chave de armazenamento de tema e idioma (`portfolio-theme`, `portfolio-lang`) existe hoje; o design decide se a reaproveita.

## Confirm before building
Não avance para o design sem restatar os FRs com suas palavras. Todas as perguntas Q-* desta spec já estão respondidas; as DQ-* são do design. Se um critério for ambíguo, pergunte antes.
