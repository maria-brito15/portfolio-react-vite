# Telas → specs → requisitos propostos (rascunho)

**Estado:** proposta. Nada aqui está aprovado nem vira requisito até a spec dona ser aberta e você aprová-la. Os requisitos usam EARS como rascunho e **não têm ID definitivo**: o prefixo `P-NNN-x` só rastreia a proposta. Tudo entre `[colchetes]` no mockup continua pendente e nada daqui o preenche. Dúvidas são `Q?` (perguntas abertas), nunca decisões.

**Lacuna do material:** a tela **Home (Main)** não está na pasta (o README pede para baixá-la do canvas). Os requisitos da home abaixo vêm só da tela **Mobile**, e a spec 004 não deve ser escrita sem a Home.

## 002 design-system-and-shell
**Telas:** Tokens, cabeçalho, rodapé de créditos, 404, faixa de idioma (vista na tela Mobile).

| Proposta | Requisito (EARS) |
| --- | --- |
| P-002-a | THE SYSTEM SHALL exibir, em toda página, um rodapé de créditos com as seções: título do portfólio, "directed by", roteiro e código, elenco (stack), trilha sonora, local e "fim". |
| P-002-b | THE SYSTEM SHALL ler o conteúdo do "elenco" (stack) de uma única fonte, para não ficar desatualizado. |
| P-002-c | THE SYSTEM SHALL exibir uma faixa decorativa de cinco cores no topo, oculta para leitores de tela. |
| P-002-d | IF o endereço não existir, THE SYSTEM SHALL mostrar, na 404, até três sugestões de rotas reais, mantendo o status 404 (estende FR-027). |
| P-002-e | WHERE um estado depender de cor (por exemplo, a página atual no menu), THE SYSTEM SHALL acompanhá-lo de sublinhado, peso ou texto. |

**Dúvidas abertas**
- Q? **Rodapé: "sem rastreadores"** (mockup) conflita com a decisão V-D-011 (analytics sem cookies): ela mede visitas. Texto mais exato seria "sem cookies". Qual vale?
- Q? **Rodapé: "TRILHA SONORA [sua playlist]"** depende da Música (Spotify) e de você escolher uma playlist. Fica fora até a decisão 1 da seção 5.
- Q? **404 em estilo de terminal** (`cd /curriculos`): decorativo ou funcional? A informação equivalente tem que aparecer também como texto normal.
- Q? **Menu com seis itens** (Projetos, Casos, Currículo, Acadêmico, Contato, Pessoal) mais tema e idioma: confirma que "Casos" e "Acadêmico" são itens de menu? (FR-009, FR-010)
- Q? **Fraunces/Caderno:** o mockup usa IBM Plex; confirma que Fraunces sai de vez?

## 003 content-migration
**Telas:** nenhuma própria; o mockup mostra conteúdo real do site atual em Currículo, Acadêmico, Contato e Projetos.
- Q? As disciplinas e notas do Acadêmico entram na migração mesmo que a exibição seja decidida depois (decisão 6)?

## 004 profile-home (tela Mobile; Home Main ausente)
| Proposta | Requisito (EARS) |
| --- | --- |
| P-004-a | THE SYSTEM SHALL mostrar, na home, foto, rótulo de área, nome, uma frase de apresentação e uma chamada "ver currículo". |
| P-004-b | THE SYSTEM SHALL mostrar quatro destaques (projetos), cada um com número, capa, título, nota em estrelas com texto alternativo e ano. |
| P-004-c | THE SYSTEM SHALL mostrar números (projetos, casos, filmes, livros) calculados do conteúdo, nunca digitados à mão. |
| P-004-d | THE SYSTEM SHALL mostrar atividade recente, com tipo, data e título, na regra de datas da spec 001. |
| P-004-e | IF um número depender de uma fonte externa ainda não verificada (filmes, livros), THE SYSTEM SHALL ocultá-lo em vez de mostrar valor de exemplo. |
- Q? A **foto** `[foto]`: qual? (conteúdo seu, pendente)
- Q? **Atividade recente** inclui filmes e livros (o mockup mostra "FILME")? Isso depende da 008 e do diário, que o PLAN deixa fora do MVP.
- Q? Os números "Filmes 120 / Livros 40" do mockup são exemplo: nunca podem ir ao ar sem a fonte.

## 005 projects-catalog
**Telas:** Projetos (catálogo), Projeto (tema escuro).
| Proposta | Requisito (EARS) |
| --- | --- |
| P-005-a | THE SYSTEM SHALL listar os projetos agrupados por ano, do mais recente ao mais antigo, com data, stack e uma frase. |
| P-005-b | WHEN o visitante escolher filtros de stack, ano ou tipo, THE SYSTEM SHALL mostrar só os projetos que combinam e refletir os filtros no endereço. |
| P-005-c | IF não houver projeto para os filtros, THE SYSTEM SHALL mostrar um estado vazio com a opção de limpar os filtros. |
| P-005-d | THE SYSTEM SHALL marcar a ordem como indeterminada entre projetos do mesmo ano quando faltar o mês (spec 001, FR-013). |
| P-005-e | WHILE a nota de um projeto não estiver definida pela Duda, THE SYSTEM SHALL mostrar estrelas vazias e nenhum número. |
| P-005-f | THE SYSTEM SHALL mostrar, na página do projeto, ficha técnica (stack, período, papel, equipe, estado), links de demonstração e de repositório e a nota por critério. |
- Q? **Critérios públicos da nota** (decisão 5): o mockup do Projeto mostra quatro critérios de exemplo (clareza do código, testes e verificação, acessibilidade e desempenho, uso real/impacto). São uma sugestão sua? Eles não foram aprovados.
- Q? **Capas dos projetos:** o mockup usa caixas coloridas por projeto. Existem capturas de tela suas para usar, ou ficam as caixas?
- Q? O filtro "Tipo" ("Com estudo de caso", "Finalista PUC Minas") é um filtro ou um selo?
- Q? A **ligação projeto ↔ filme ↔ livro** ("Moldado por") aparece no mockup do Projeto marcada "fora do MVP": confirmado fora?

## 006 case-studies
**Tela:** Caso (WhatsApp Dispatcher, tema escuro).
| Proposta | Requisito (EARS) |
| --- | --- |
| P-006-a | THE SYSTEM SHALL mostrar, em cada caso, escopo do material, índice lateral das seções e a tabela de ganho e custo de cada decisão. |
| P-006-b | WHEN o visitante escolher uma seção no índice, THE SYSTEM SHALL levá-lo à seção e destacá-la no índice, sem depender só da cor. |
| P-006-c | THE SYSTEM SHALL manter o texto atual do caso sem acréscimos (o mockup resume trechos com `[...]`). |
- Q? O índice lateral some ou vira lista no topo em tela estreita?

## 007 resume-academic-contact
**Telas:** Currículo, Acadêmico, Contato.
| Proposta | Requisito (EARS) |
| --- | --- |
| P-007-a | THE SYSTEM SHALL mostrar o currículo com as seções sobre mim, projetos em destaque, experiências, competências, formação e idiomas e reconhecimentos, com o texto atual. |
| P-007-b | WHEN o visitante imprimir ou salvar em PDF, THE SYSTEM SHALL gerar o mesmo conteúdo da página, legível em papel. |
| P-007-c | WHILE uma lista longa estiver recolhida ("mostrar mais"), THE SYSTEM SHALL manter o controle que a expande acessível ao teclado e ao leitor de tela, e anunciar o estado (recolhida ou expandida). |
| P-007-d | THE SYSTEM SHALL mostrar o Acadêmico com formação, linha do tempo, o que foi feito em cada ano e as disciplinas por semestre. |
| P-007-e | WHEN o visitante enviar o formulário com e-mail incompleto, THE SYSTEM SHALL mostrar a mensagem de erro com ícone e texto, sem enviar. |
| P-007-f | WHEN o envio for bem-sucedido, THE SYSTEM SHALL mostrar a confirmação e esvaziar o formulário. |
| P-007-g | THE SYSTEM SHALL incluir no formulário um campo-armadilha oculto contra envios automáticos e um contador de caracteres. |
- Q? **Notas das disciplinas** (decisão 6): mostrar ou esconder? Hoje o mockup as mostra; "você decide se mantém as notas visíveis".
- Q? A **carga horária e a modalidade** aparecem como "—" até você informar; confirma que ficam assim ou saem?
- Q? O Contato usa o e-mail e o LinkedIn que já estão no site atual; confirma que são os canais oficiais?
- Q? O PDF do currículo é gerado pela impressão do navegador ou um arquivo pronto?

## 008 films-and-books (ESCOPO REESCRITO em 2026-11-15)
**Telas:** Pessoal, Filmes, Livros. **Decisão da Duda:** Letterboxd, Hardcover e Spotify são preenchidos **manualmente**; não há API, token, cache de servidor nem Function. Os requisitos P-008-a a P-008-h (conteúdo curado, validado pelos schemas da 001) e as perguntas Q-P1 a Q-P10 estão em `.ai/sdd/PROPOSTA-pessoal-conteudo-curado.md`. Os requisitos antigos desta seção (capa condicional à verificação de termos, última cópia válida por falha de fonte, segredo no servidor, prazo de cache, atribuição de API) foram **removidos** porque dependiam de API.

## 009 terminal
**Tela:** Terminal.
| Proposta | Requisito (EARS) |
| --- | --- |
| P-009-a | THE SYSTEM SHALL oferecer o terminal em `/terminal`, fora do menu principal, com um botão "Sair do terminal" como primeiro item focável. |
| P-009-b | WHEN o visitante digitar um comando, THE SYSTEM SHALL anunciar a saída numa região ao vivo para leitores de tela. |
| P-009-c | IF o comando não existir, THE SYSTEM SHALL responder com a dica "digite ajuda". |
| P-009-d | THE SYSTEM SHALL manter toda informação do terminal também nas páginas normais. |
- Q? Os comandos do mockup (`ajuda, ls, whoami, projetos, curriculo, academico, contato, home`) são o conjunto final?

## 010 quality-and-launch
- Q? A faixa de idioma e o rodapé "sem cookies" entram nas medições de CLS e na revisão de privacidade?

## Respostas da Duda (2026-11-15) — registro
- **Música e Bastidores:** entram em specs próprias (011 e 012), fora do MVP. Nome da aba: **Bastidores**.
- ~~**Filmes:** feed RSS. **TMDB:** usar com atribuição.~~ **SUPERADO (2026-11-15):** Letterboxd, Hardcover e Spotify são preenchidos manualmente, sem API (ver `.ai/sdd/PROPOSTA-pessoal-conteudo-curado.md`).
- **Nota dos projetos:** quatro critérios do mockup, média simples; estrelas vazias até a avaliação.
- **Notas das disciplinas:** visíveis.
- **Rodapé:** "sem cookies". **Fundo claro:** creme `#FFF7EA`. **Escuro:** paleta colorida mantida, com regras de uso. **Borda de controle:** piso de 3:1 sobre pastel.
- **Ainda abertas:** Home (Main) não enviada; foto; capas dos projetos; canais de contato; PDF do currículo; comandos finais do terminal; Hardcover e Spotify (termos).
