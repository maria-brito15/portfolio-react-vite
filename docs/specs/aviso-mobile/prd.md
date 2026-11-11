# PRD — Aviso de visualização em celular

## Problema

O portfólio funciona em qualquer tela, mas a interface (janela de terminal,
tabelas de notas, layout de duas colunas) foi desenhada para desktop. Em
celular a experiência é inferior — não quebra, mas não é a forma pretendida
de ver o trabalho. Hoje a pessoa não tem como saber disso: ela só vê a versão
reduzida, sem saber que existe uma melhor.

## Objetivo

Ao abrir o site em uma tela de celular, mostrar um aviso curto, não
bloqueante, dizendo que o site foi pensado para desktop e sugerindo acessar
de um computador para a melhor experiência. A pessoa pode fechar o aviso e
usar o site normalmente; ele não aparece de novo nesse navegador depois de
fechado.

## Fora de escopo

- Qualquer bloqueio de funcionalidade em celular (o site continua 100%
  usável).
- Redesenho do layout mobile existente.
- Detecção de dispositivo por user-agent (a decisão é por largura de tela,
  como o resto do site já faz com `useMediaQuery`).
- Tablets em paisagem ou telas intermediárias — o aviso só cobre a faixa que
  o site já trata como "estreita" (mesmo ponto de corte dos 390px citado nas
  skills do projeto).

## Decisões já tomadas com o usuário

1. Formato: modal/overlay centralizado, mesmo padrão visual do `Lightbox`
   (diálogo com `role="dialog"`, foco preso, Esc fecha).
2. Frequência: aparece uma vez por navegador. Depois de fechado, guarda uma
   marca em `localStorage` e não aparece de novo.
3. Não bloqueia: é possível fechar e usar o site normalmente; não há
   bloqueio de conteúdo por trás do modal.
4. Texto em PT/EN via `src/i18n/ui.ts`, seguindo o idioma atual do site.
5. Visual: mono único do terminal/IDE, tokens de `tokens.css`, sem
   degradê — nenhum estilo novo fora do sistema existente.
