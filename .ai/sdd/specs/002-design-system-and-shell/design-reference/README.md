# Referência de design — portfólio da Duda

> Status: **referência visual, não especificação.** O mockup mostra a direção; quem decide o que entra no produto são as specs aprovadas por você. Nada aqui está aprovado.

## 1. O que são os arquivos
`mockup/*.dc.html` é o código-fonte das telas do mockup (HTML com estilos no próprio elemento). Serve para ler cores, medidas e estrutura. A tela **Home (Main)** não está na pasta: ela tem edições feitas direto no canvas, então baixe essa tela pelo canvas e coloque aqui. Não é código de produção: não copie para `src/`. As telas renderizam no canvas do Claude; para ver imagens, exporte do canvas (PDF ou PNG) e guarde ao lado.

## 2. Telas → specs do PLAN
| Tela do mockup | Spec do PLAN |
|---|---|
| Tokens, cabeçalho, rodapé de créditos, 404 | 002 design-system-and-shell |
| Home (Main) | 004 profile-home |
| Projetos (catálogo) | 005 projects-catalog |
| Projeto + Caso | 006 case-studies |
| Currículo, Acadêmico, Contato | 007 resume-academic-contact |
| Pessoal, Filmes, Livros, Música, Bastidores | 008 films-and-books (**Música e Bastidores são novos: ver decisões abertas**) |
| Terminal | 009 terminal |

## 3. Decisões visuais a levar para a spec 002 (propostas)
- Fontes: IBM Plex Sans (interface) e IBM Plex Mono (metadados, datas, etiquetas, código).
- Tema claro: fundo `#FFF7EA`, texto `#17171A`, texto secundário `#585861`, acento `#2B36D9`, divisor decorativo `#D9D9D4`, borda de controle `#77777F`.
- Tema escuro: fundo `#0E0E10`, superfície `#17171A`, texto `#ECECEE`, secundário `#A3A3AC`, acento `#8F98FF`, divisor `#2C2C32`, borda de controle `#7A7A84`.
- Tons de apoio (só como fundo, texto sempre `#17171A`, contraste de 13,4 a 15,4): pêssego `#FFD9C7`, lilás `#E4E1FF`, menta `#C9EDD8`, limão `#FFEEA8`, céu `#CFE8FF`, rosa `#FFD3E8`.
- Tons escuros equivalentes para capas no tema escuro (texto `#ECECEE`, contraste de 6,6 a 9,5): `#5A2A4E`, `#1F5A62`, `#6B3A1E`, `#2F3A9E`.
- Texto na cor de acento: indigo sobre creme e sobre os tons de apoio (contraste de 6,1 a 7,5). Magenta, laranja e azul-petróleo do seletor **não** passam sobre os pastéis: usar só em detalhes sem texto.
- Faixa de cinco cores no topo (decorativa, `aria-hidden`).
- Regras mantidas: sem gradientes, alvos de toque de 44×44, bordas de controle com contraste mínimo de 4:1, divisores só decorativos, cor nunca é o único sinal (estados trazem ícone ou texto).
- Rodapé de créditos em todas as páginas: UM PORTFÓLIO DE ENGENHARIA / DIRECTED BY DUDA / ROTEIRO E CÓDIGO / ELENCO (stack) / TRILHA SONORA / FILMADO EM Belo Horizonte, MG / FIM. O “ELENCO” deve ler a stack de uma fonte única para não ficar desatualizado.

## 4. Conteúdo
- Reais (do site atual): projetos e datas, currículo, experiências, competências, disciplinas e notas, contato.
- Regra de data: mostrar o mês só se confirmado; sem mês, só o ano; ordem entre itens do mesmo ano é “indeterminada” quando falta o mês.
- Placeholders `[entre colchetes]`: notas dos projetos (critérios ainda não aprovados), capas, filmes, livros, músicas, textos de Bastidores. Nada disso pode ir ao ar inventado.
- Frases marcadas “Sugestão… confirme” em Bastidores só ficam se forem verdade para você.

## 5. Decisões abertas (precisam de você antes de virar requisito)
1. **Música (Spotify) e Bastidores entram no escopo?** O PLAN atual só prevê filmes e livros.
2. **Nome da aba**: Bastidores, Arte ou outro.
3. **Fonte dos dados de filmes**: o Letterboxd não tem API pública aberta (acesso por pedido). Alternativas: feed RSS do perfil ou exportação CSV. Verificar os termos antes de decidir.
4. **Hardcover e Spotify**: exigem token/OAuth; o segredo fica só no servidor (função do Netlify) e o site serve uma cópia em cache. Verificar termos e limites de uso.
5. **Critérios públicos da nota** dos projetos.
6. **Mostrar as notas das disciplinas** no Acadêmico?
7. **Tema escuro**: manter os dois temas e a paleta colorida nos dois?
