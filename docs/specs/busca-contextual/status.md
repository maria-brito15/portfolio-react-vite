# Busca e descoberta contextual: estado

Fase 5 do `roadmap-personas-site.md`. O site já tinha busca: a paleta de comandos (Ctrl+K,
`CommandPalette.tsx` + `paletteItems.ts`). Ela foi estendida, **não** foi criado um segundo sistema.
Regras de relevância em um só lugar: `src/data/searchRanking.ts`.

| ID | Requisito | Estado |
| --- | --- | --- |
| BC-01 | Ordenação por persona na paleta; a persona só muda a ordem, nunca o conjunto de resultados | ✅ `filterItems(items, query, persona)`; `search.test.ts` compara o conjunto com e sem persona para 8 consultas × 5 personas |
| BC-02 | Prioridades por persona (roadmap, Passo 17) centralizadas | ✅ `personaTopics`; projetos que a home da persona já destaca ganham +1 |
| BC-03 | Funciona sem persona, com a ordem de sempre | ✅ teste de igualdade; testes antigos da paleta seguem verdes |
| BC-04 | Busca sinônimos e termos PT/EN ("backend", "experience", "academic", "services", "personal") | ✅ `topicKeywords` + `techKeywords` (classifica as tecnologias que `projects.tsx` já declara como back/front-end) |
| BC-05 | Seções das páginas na busca, com ida direta à âncora (`/academico#disciplinas`) | ✅ novo tipo `section` (currículo, acadêmico, serviços, experiências); sem busca ficam ocultas, como as habilidades |
| BC-06 | Descrição em cada resultado, destaque do termo, estado vazio, teclado | ✅ `<mark>` sem acento/caixa (`matchRanges`); aviso "Ordenado para o perfil X; nada é escondido" |
| BC-07 | "O que você procura?" na home: 5 intenções, ordem por persona, sem perguntar a persona | ✅ `intents.ts` + `IntentShortcuts.tsx`; destinos são rotas/âncoras existentes; botão que abre a paleta |
| BC-08 | Sugestões sem repetir, no máximo duas | ✅ `suggestionsFor` (reusa `nextActions.ts`) + `utils/visited.ts` (sessionStorage); completa com páginas da persona ainda não vistas |
| BC-09 | Sem rastreamento externo | ✅ só `sessionStorage` local; nada enviado |
| BC-10 | PT e EN | ✅ testes de consulta em EN; capturas em EN |
| BC-11 | Desktop e celular | ✅ 1440×900 e 390×844 (Edge via Playwright): sem rolagem horizontal, sem erro de console |
| BC-12 | Acessibilidade | ◐ combobox/listbox existentes mantidos (`aria-activedescendant`, setas, Enter, Esc). **Falta** leitor de tela real |

## Como a busca difere por persona (mesma consulta, ordem diferente)

- **tech:** projetos e estudo de caso primeiro, depois GitHub, habilidades.
- **rh:** sobre, currículo, experiências, habilidades.
- **professor:** acadêmico, projetos, experiências, currículo.
- **cliente:** serviços, estudos de caso (cases), contato, projetos.
- **amigo:** sobre, projetos (os pessoais primeiro), jogos, terminal.

Ranking: nota = qualidade do casamento (0 nome igual … 4 só na descrição) menos o favorecimento da persona (0 a 3).
Os grupos seguem o melhor item de cada um. Casamento exato ainda vence um tema favorecido.

## Decisões

- A intenção "Conhecer a Duda" virou "Saber quem é a Duda" para não duplicar o nome do botão principal do amigo.
- "Seções" ficam depois de "Projetos" na ordem dos grupos: uma seção que só cita um projeto na descrição não passa na frente do projeto.
- Corrigido de passagem: em inglês, comandos com um só nome (`neofetch`) apareciam sem rótulo na paleta (`names[1]` indefinido).
- Sugestões (Fase C): as regras de `nextActions.ts` da Fase 3 já cobriam os exemplos do pedido (projeto → estudo de caso, serviço → case, competências → currículo). A Fase 5 só impede repetição e completa a vaga.

## Limites conhecidos

- A busca ainda não indexa o **texto** dos projetos (só nome, descrição curta, tecnologias e palavras-chave), nem o texto do estudo de caso.
- "Processo de trabalho" (cliente) continua sem texto nos dados; a busca por "processo" leva a Serviços/FAQ.
- As palavras-chave e os rótulos das intenções são texto novo de interface; a Duda deve revisar.
- JS inicial: 145,04 → 146,24 kB gzip (+1,2): intenções, regras de sugestão e `searchRanking` entram no pacote principal.
- Não verificado: leitor de tela, temas além do escuro, deploy.
