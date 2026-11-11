# Status — Experiência interativa e originalidade

Legenda: ✅ atendido · ◐ parcial · ❌ não feito · ❔ não verificado. Verificado em 11/11/2026: `npm run lint` (0 erros), `npm test` (34 arquivos, 393 testes), `npm run build`, varredura do `verify-site` e capturas no Chrome (1440×900 e 390×844, cinco temas, sem rolagem horizontal e sem erro nem aviso no console).

## A. Comandos de personalidade

| ID | Estado | Evidência |
| --- | --- | --- |
| PE-01 | ✅ | `extras/extras.test.tsx` ("neofetch (PE-01, PE-02)"); capturas `neofetch-<tema>-desk/mob` nos 5 temas |
| PE-02 | ✅ | `extras/ascii.test.ts` ("monograma": iniciais, A–Z com 5 linhas, muda com o nome) |
| PE-03 | ✅ | `extras.test.tsx` ("sudo contratar-duda aponta o contato; outro sudo mantém a resposta antiga") |
| PE-04 | ✅ | `extras.test.tsx` ("rm -rf não apaga nada: o histórico e a sessão ficam intactos") |
| PE-05 | ✅ | `ascii.test.ts` ("cowsay"); `extras.test.tsx` ("cowsay desenha o balão…") |
| PE-06 | ◐ | `extras.test.tsx` ("matrix": encerra por tecla, em 6 s, movimento reduzido, replay, sob demanda; chunk próprio de 1,4 kB). A animação em canvas não foi vista no navegador |
| PE-07 | ✅ | `extras.test.tsx` ("fortune": lista vazia diz "em construção"). Conteúdo da Duda pendente (`src/data/fortunes.ts` vazio) |
| PE-08 | ✅ | `extras.test.tsx` ("historico (PE-08)") |
| PE-09 | ✅ | `extras.test.tsx` ("inventário dos comandos de personalidade"); `sections.test.tsx` ("inventário de comandos") |

## B. Temas e boot

| ID | Estado | Evidência |
| --- | --- | --- |
| TB-01 | ✅ | `data/themes.test.tsx` ("comando tema": sem argumento alterna, `tema <nome>`, nome inválido) |
| TB-02 | ✅ | `themes.test.tsx` ("tema ls lista com o atual marcado…") |
| TB-03 | ✅ | `themes.test.tsx` ("o script do index.html conhece exatamente os mesmos ids", "um valor salvo desconhecido cai no tema padrão", persistência) |
| TB-04 | ✅ | `styles/contrast.test.ts` (5 temas, AA; "nenhum tema usa degradê"); capturas dos 5 temas |
| TB-05 | ✅ | `themes.test.tsx` ("a partir de um tema extra, o botão volta ao escuro") |
| TB-06 | ✅ | `extras/Boot.test.tsx` (≤ 5 linhas + dica, ≤ 1,5 s, uma vez, pula por tecla/clique, robôs, histórico) |
| TB-07 | ✅ | `Boot.test.tsx` ("movimento reduzido": linhas de uma vez, nada sai sozinho) |
| TB-08 | ✅ | `Boot.test.tsx` ("comando boot": oculto, replay sem animar) |

## C. Campo minado

| ID | Estado | Evidência |
| --- | --- | --- |
| JG-01 | ✅ | `games/Minesweeper.test.tsx` ("comandos": `jogos`, `minas`, ajuda) |
| JG-02 | ✅ | `games/mines.test.ts` (25 testes da lógica pura, sem React) |
| JG-03 | ✅ | `mines.test.ts` ("primeiro clique nunca é mina": 3 níveis × 6 sementes × 3 casas) |
| JG-04 | ✅ | `mines.test.ts` ("níveis"); `Minesweeper.test.tsx` ("nível inválido", "celular"); captura `minas-dificil-mob` (480 casas, sem rolagem da página) |
| JG-05 | ✅ | `Minesweeper.test.tsx` ("tabuleiro": contador, cronômetro só após o clique, `aria-live`) |
| JG-06 | ✅ | `Minesweeper.test.tsx` ("mouse, toque e teclado"); capturas a 390 px. O toque longo foi testado só por eventos simulados, não num aparelho |
| JG-07 | ✅ | `Minesweeper.test.tsx` ("cada casa é um botão com aria-label completo", "o número aparece como dígito") |
| JG-08 | ✅ | `mines.test.ts` ("melhor tempo": grava só o melhor, separa por nível, lixo, armazenamento falhando) |
| JG-09 | ✅ | `Minesweeper.test.tsx` (sob demanda, troca de idioma mantém a partida, `sair`, Esc devolve o foco, replay); chunk próprio |

## D. Janelas e atalhos

| ID | Estado | Evidência |
| --- | --- | --- |
| JA-01 | ✅ | `components/shell/Windows.test.tsx` ("arrasto"); no Chrome a janela moveu dx=-120, dy=60 |
| JA-02 | ✅ | `Windows.test.tsx` ("a barra é focável e as setas movem 16 px; Home volta ao lugar") |
| JA-03 | ✅ | `Windows.test.tsx` ("celular e sem mouse"); capturas a 390 px sem alteração de layout |
| JA-04 | ✅ | `Windows.test.tsx` ("bolinhas da janela"); no Chrome, maximizar sem o rodapé por cima (corrigido após a captura) |
| JA-05 | ✅ | `Windows.test.tsx` (aparece só com janela recolhida, restaura, some ao mudar de página); conferido no Chrome |
| JA-06 | ✅ | `components/Overlays.test.tsx` ("paleta de comandos"); captura `palette-desk` |
| JA-07 | ✅ | `Overlays.test.tsx` (página roda `cd`, comando roda na sessão, painel fora da home) |
| JA-08 | ✅ | `Overlays.test.tsx` ("lista de atalhos"); captura `shortcuts-desk` |
| JA-09 | ✅ | `Overlays.test.tsx` ("o comando atalhos e a dica da ajuda leem a mesma tabela") |

## E. Conteúdo e acabamento

| ID | Estado | Evidência |
| --- | --- | --- |
| CE-01 | ✅ | `extras/phase3.test.tsx` ("git log": ordem, sem data fora, contagem) |
| CE-02 | ✅ | `phase3.test.tsx` ("stats"); `dist/static/index-*.js` contém `builtAt` real |
| CE-03 | ✅ | `phase3.test.tsx` ("404 temático"); captura `404-desk` (link com `--accent` após correção) |
| CE-04 | ✅ | Já atendido pela feature `seo` (`public/assets/og-image.png`, 1200×630, nome e cargo reais); nenhuma mudança necessária |
| CE-05 | ✅ | `phase3.test.tsx` ("mensagem no console") |
| CE-06 | ◐ | `pages/InfoPages.test.tsx`: rota, comando, apelido `/now`, aviso "em construção", fora do sitemap. **Falta o conteúdo da Duda** (`src/data/now.ts` vazio) |
| CE-07 | ◐ | Idem para `/setup` (`src/data/uses.ts` vazio) |
| CE-08 | ❌ | Não iniciado: depende de texto novo da Duda. Decisão: o estudo atual (~130 KB de texto longo) não é migrado, para não perder conteúdo |

Resumo: ✅ 39 · ◐ 3 · ❌ 1 · ❔ 0 (de 43)
