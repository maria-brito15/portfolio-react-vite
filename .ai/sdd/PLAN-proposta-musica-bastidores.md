# PROPOSTA de mudança no PLAN: Música (Spotify) e Bastidores

> **ATUALIZAÇÃO 2026-11-15:** Letterboxd, Hardcover e Spotify serão preenchidos **manualmente** (sem API). Por isso a **011-music está desbloqueada** (não depende mais da verificação dos termos do Spotify) e as linhas "bloqueada" e "risco alto" abaixo ficam **superadas**. O escopo reescrito está em `PROPOSTA-pessoal-conteudo-curado.md`. As respostas "feed RSS" e "TMDB com atribuição" desta proposta também estão superadas.

**Estado:** rascunho de proposta. O `PLAN.md` aprovado **não foi alterado** e nada foi renumerado. Só você aprova mudar o plano.

## O problema
A spec 008 cobre só filmes e livros. O mockup acrescenta duas páginas em `/pessoal`: **Música (Spotify)** e **Bastidores** (a arte na sua vida: paixões, ponte para a engenharia, três atos, trecho de roteiro). O README as marca como decisão aberta nº 1: entram no escopo?

Já existe código antigo de música e teatro como curadoria manual (`src/data/personal/music.ts`, `theater.ts`). A spec 001 não o remove (não é trilhas, personas, jogos nem assistente), então ele continua até alguma spec o tratar.

## As duas peças são muito diferentes
| | Música | Bastidores |
| --- | --- | --- |
| Dado | Spotify, ao vivo, com OAuth no servidor | Texto escrito por você, em arquivo |
| Risco | Alto: termos (uso "privado pessoal"), cache temporário, modo de desenvolvimento limitado a 5 usuários e Premium, endpoints de fev/2026 não confirmados | Baixo: só texto e design |
| Depende de | Verificação dos termos (`design-reference/termos-de-uso-apis.md`) | Só de você escrever os textos |
| Conteúdo | Capas e números `[...]` | Todo texto `[entre colchetes]` é seu; as frases "sugestão… confirme" só ficam se forem verdade |

## Opções
| Opção | Descrição | Prós | Contras |
| --- | --- | --- | --- |
| A | Ampliar a 008 para "personal-space" (filmes, livros, música, bastidores) | Uma spec só | Mistura um risco alto com um baixo; a 008 já é de risco alto |
| **B (recomendada)** | Manter a 008 como está e criar duas specs novas depois da 010: **011-music** e **012-bastidores**, sem renumerar nada | Isola o risco do Spotify e deixa Bastidores livre de API | Mais duas specs; ambas ficam fora do MVP até você decidir |
| C | Só Bastidores entra (na 008); Música fica fora | Corta o risco do Spotify | Perde parte do mockup e do rodapé "trilha sonora" |

## Recomendação: opção B
1. **011-music** (risco alto): nasce bloqueada pela verificação dos termos do Spotify e pela confirmação dos endpoints. Pode acabar descartada.
2. **012-bastidores** (risco baixo): sem API, só conteúdo seu.
3. Dependências: ambas dependem só da 002 (casca) e de `/pessoal` (008). Nenhuma bloqueia a 010.
4. **MVP:** continuam **fora do MVP** até você responder a decisão 1 da seção 5 do README. Os números novos (011, 012) não mexem na numeração aprovada.

## Perguntas abertas (não são decisões)
- Q? Música e Bastidores entram no escopo? (decisão 1)
- Q? **Nome da aba:** Bastidores, Arte ou outro? (decisão 2)
- Q? Se entrarem, entram no MVP ou depois dele?
- Q? Para Música: aceita só modo de desenvolvimento (5 usuários, exige Premium), já que acesso estendido exige empresa registrada?
- Q? O rodapé "TRILHA SONORA [sua playlist]" depende da Música: sem ela, o rodapé fica sem essa seção?
- Q? O código antigo de música e teatro (`music.ts`, `theater.ts`) é aproveitado ou descartado?

## Decisões abertas da seção 5 do README, por spec afetada
| Decisão | Spec afetada | Estado |
| --- | --- | --- |
| 1. Música e Bastidores no escopo? | PLAN (011, 012) | respondida: sim, specs separadas |
| 2. Nome da aba | 012 (e menu da 002) | respondida: Bastidores |
| 3. Fonte dos filmes (RSS ou CSV) | 008 | respondida: RSS (termos do Letterboxd ainda não confirmados) |
| 4. Hardcover e Spotify: token e termos | 008 e 011 | **encerrada:** sem API, não há token nem termos de API |
| 5. Critérios públicos da nota | 005 | respondida: quatro critérios, média simples |
| 6. Mostrar notas das disciplinas | 007 | respondida: mostrar |
| 7. Manter os dois temas e a paleta colorida nos dois | 002 (`design.md`, DQ-005) | respondida: sim, com regras de uso |

## Respostas da Duda (2026-11-15) — registro
| Decisão do README | Resposta |
| --- | --- |
| 1. Música e Bastidores no escopo? | **Sim, os dois, em specs separadas (opção B):** 011-music e 012-bastidores, depois da 010, sem renumerar. Continuam fora do MVP até você dizer o contrário. A 011 estava bloqueada pela verificação do Spotify; **está desbloqueada** desde a decisão de conteúdo manual (sem API). |
| 2. Nome da aba | **Bastidores** (em inglês, "Behind the scenes"). |
| 3. Fonte dos filmes | ~~Feed RSS do perfil~~ **superada:** preenchimento manual, sem API. |
| 4. Hardcover e Spotify | Aberta: termos do Hardcover e endpoints do Spotify não confirmados (`termos-de-uso-apis.md`). |
| 5. Critérios da nota | **Os quatro do mockup, média simples** (clareza do código; testes e verificação; acessibilidade e desempenho; uso real/impacto). Estrelas vazias até você avaliar cada projeto. |
| 6. Notas das disciplinas | **Mostrar disciplinas e notas.** |
| 7. Paleta colorida nos dois temas | **Sim, com regras de uso** (ver `design.md` da 002, DQ-005). |
| TMDB (superada) | ~~Usar com atribuição.~~ Risco registrado: os termos proíbem uso comercial e o TMDB decide o que é comercial; a licença pode ser revogada, e o cache é de no máximo 6 meses. Sem pôster até a verificação final. |

**O PLAN aprovado continua sem alteração.** Esta proposta só vira mudança no plano quando você pedir.
