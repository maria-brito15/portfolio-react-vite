# Plano — Aviso de visualização em celular

Requisitos cobertos: MB-01 a MB-08.

## Decisão

Um componente `MobileNoticeModal`, montado uma vez em `App.tsx`, ao lado de
`<Page />`, dentro do `TerminalProvider`. Ele decide por si mesmo se deve se
renderizar (hook `useMediaQuery` + leitura de `localStorage`); nenhuma rota
ou página precisa saber dele.

### Por que aqui e não dentro do `SiteShell`

`SiteShell` é usado por várias páginas; colocar o modal em `App.tsx` garante
que ele apareça uma única vez, independente de qual página carregou
primeiro, sem duplicar a lógica por página.

### Detecção de tela estreita

Reusa `useMediaQuery('(max-width: 640px)')` (já existe em
`src/hooks/useMediaQuery.ts`, usado em outras partes do site). 640px cobre a
faixa de celular (inclusive os 390px citados nas skills) sem pegar tablets
em retrato largo nem desktop com janela estreita — mas é mais abrangente que
só olhar 390px, o que é aceitável: o aviso é sobre a experiência geral em
tela pequena.

### Persistência "já visto"

Chave `portfolio-mobile-notice-dismissed` em `localStorage` (mesmo padrão de
nome de `portfolio-theme`), valor `'1'`. Leitura e escrita
dentro de `try/catch` (MB-08): se `localStorage` lançar, o componente trata
como "nunca visto" e segue funcionando — o aviso só reaparece com mais
frequência nesse caso, mas nada quebra.

### Estrutura do componente

Modela o `Lightbox.tsx` existente:

- `createPortal` para `document.body`.
- `role="dialog"`, `aria-modal="true"`, `aria-label` traduzido.
- Bloqueia `document.body.style.overflow` enquanto aberto; restaura ao
  fechar (igual ao Lightbox — isso é sobre o modal em si, não sobre o site
  depois de fechado, o que mantém MB-04: o conteúdo nunca fica bloqueado
  *depois* de fechar).
- Foco inicial no botão de fechar; `Tab` preso entre os elementos focáveis
  (aqui só há um botão, então Tab simplesmente mantém o foco nele); `Esc` e
  clique fora fecham.
- Fechar (qualquer via) grava a marca em `localStorage` e desmonta.

### Arquivos afetados

| Arquivo | Mudança |
| --- | --- |
| `src/components/MobileNoticeModal.tsx` | novo componente |
| `src/styles/*.css` (arquivo de componentes, a confirmar durante a implementação qual arquivo já agrupa `.lightbox`/`.lb-*`) | novas classes `.mobile-notice`, `.mn-*`, só com tokens existentes |
| `src/i18n/ui.ts` | novo bloco `mobileNotice` em `pt` e `en` |
| `src/App.tsx` | monta `<MobileNoticeModal />` ao lado de `<Page />` |
| `src/test/` | teste do componente (detecção, dispensa, persistência, acessibilidade) |

### Texto (rascunho, PT/EN)

- PT — título: "Feito para computador"; corpo: "Este portfólio foi
  desenhado para telas de computador. Ele funciona no celular, mas a melhor
  experiência é acessando de um desktop."; botão: "Entendi".
- EN — title: "Built for desktop"; body: "This portfolio was designed for
  computer screens. It works on mobile, but you'll get the best experience
  on a desktop."; button: "Got it".

(Texto final confirmado na implementação, mantendo o tom do resto do site.)

## Alternativas consideradas

- **Banner fixo em vez de modal**: descartado — o usuário já escolheu modal
  na primeira pergunta.
- **Detecção por `navigator.userAgent`**: descartado — menos confiável que
  largura de viewport e o site já usa media query para decisões de layout
  responsivo.
- **Guardar a marca em cookie**: descartado — sem necessidade de enviar ao
  servidor; `localStorage` é mais simples e já é o padrão do projeto para
  preferências do visitante (tema, idioma).
