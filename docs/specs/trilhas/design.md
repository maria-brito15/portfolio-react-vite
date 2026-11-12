# Trilhas: plano técnico

Requisitos em `requirements.md` (TR-01 a TR-27). Parte do código atual: o roteador próprio
(`router.tsx`), a sessão do terminal (`TerminalSession.tsx`, que já guarda o histórico em
`sessionStorage`), a persona (`usePersona`), `sections.ts` (âncoras reais das páginas) e o
padrão de dados de `routes.ts` e `personas.ts`.

## Decisões

| # | Decisão | Alternativa descartada | Por quê |
| --- | --- | --- | --- |
| D1 | Trilhas são **dados** em `src/data/trails.ts`; o texto de cada passo é uma função `(lang, dados) => string`, e os números vêm de `projects`, `experienceStats`, `finalistProjects` etc. | Texto fixo com números digitados | TR-03: nada inventado e nada que envelheça |
| D2 | Alvo de um passo = rota + âncora (`id` já existente nas páginas, as mesmas de `sections.ts`); sem âncora, o `h1` da página | `data-trail-step` espalhado pelas páginas | As âncoras já existem e têm teste; menos arquivos tocados |
| D3 | Motor próprio e pequeno (provedor + overlay), sem biblioteca de tour | Shepherd.js / driver.js | O destaque é um anel e uma caixa; uma dependência pesaria mais que o código, e o estilo único exige controle total |
| D4 | O overlay do tour é **carregado sob demanda** (`React.lazy`) e só monta com o tour aberto | Sempre no bundle | TR-27 |
| D5 | Eventos por um **barramento mínimo** (`trailEvents.emit`): a sessão do terminal emite "comando rodou"; os alternadores de tema e idioma emitem "tema/idioma mudou" | O tour ler o `sessionStorage` do terminal | Não acopla o motor ao formato do histórico e funciona também para conquistas |
| D6 | Progresso em `localStorage` (`portfolio-trail`), uma entrada por trilha, mais a lista de segredos achados (compartilhada) | Um registro por visita | TR-10: voltar a uma persona retoma; os segredos valem para qualquer trilha |
| D7 | Passo "ver" conclui ao **aparecer** (alvo achado ou página aberta); "fazer" ao receber o evento do comando; "achar" ao receber o evento de qualquer segredo; "agir" ao clicar na ação do cartão do tour | Detectar rolagem/visibilidade | Simples, testável e sem `IntersectionObserver` frágil |
| D8 | A ação final fica **no cartão do tour** (botão ou link), não em um botão da página; só o currículo imprime com `window.print()` | Ligar o tour a botões existentes das páginas | Evita tocar as páginas e funciona se o alvo não existir |
| D9 | Navegação entre rotas por `navigate()` do roteador; o overlay espera o alvo por até 1,5 s e, sem ele, mostra o cartão sem destaque (TR-13) | Pular o passo automaticamente | A pessoa nunca fica sem o texto do passo |
| D10 | Gamificação é um campo da trilha (`style: 'checklist' \| 'bar' \| 'achievements'`) e o cartão escolhe o componente | `if (persona === 'amigo')` espalhado | TR-19 testável em um lugar só |

## Dados

```ts
// src/data/trails.ts
export type StepKind = 'ver' | 'fazer' | 'achar' | 'agir';

export interface TrailStep {
  id: string;
  kind: StepKind;
  route: string;                 // id de rota (routes.ts)
  anchor?: string;               // id do elemento (âncora de sections.ts)
  command?: string;              // fazer: comando em PT (commands.tsx)
  action?: { kind: 'link'; route: string; anchor?: string } | { kind: 'print' };
  when?: 'assistant';            // só entra se o assistente estiver disponível (TR-05)
  text: (lang: Lang) => string;
}

export interface Trail {
  persona: PersonaId;
  style: 'checklist' | 'bar' | 'achievements';
  title: Localized; intro: Localized; outro: (lang, found?) => string;
  steps: TrailStep[];
}
```

Segredos do `amigo` (TR-20), todos já existentes: `fortune`, `cowsay`, `matrix`, `boot`, `rm`,
`minas`, troca de tema, troca de idioma (8).

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/data/trails.ts` (novo) + teste | Dados e validação: ids existem, 4 a 6 passos, último é `agir`, PT/EN completos, nenhum dígito digitado nos textos, âncoras existem nas páginas renderizadas |
| `src/trails/events.ts` (novo) | `emit`/`subscribe` tipados: `command`, `theme`, `lang` |
| `src/trails/storage.ts` (novo) + teste | Leitura/escrita tolerante a falha de `localStorage` (memória como reserva) |
| `src/trails/TrailProvider.tsx` (novo) + teste | Estado da trilha da persona, `start/next/prev/exit/restart/dismiss`, conclusão por tipo de passo, segredos |
| `src/trails/Tour.tsx` (novo, lazy) + teste | Anel, cartão, foco, Esc, navegação, alvo ausente, movimento reduzido, posição no celular |
| `src/trails/TrailCard.tsx` (novo) + teste | Cartão da home: convite, progresso, estilo por persona, selo, "agora não" |
| `src/terminal/extras/trilha.tsx` (novo) + teste | Comando `trilha`/`trail`; `catalog.ts`: `trilha: 'personalize'` |
| `src/terminal/TerminalSession.tsx` | Emite `command` depois de rodar um comando (fora do replay) |
| `src/hooks/useTheme.tsx`, `src/i18n/LanguageContext.tsx` | Emitem `theme`/`lang` ao trocar |
| `src/App.tsx` | `TrailProvider` dentro de `PersonaProvider`; o overlay lazy dentro do `TerminalProvider` (para poder rodar comandos) |
| `src/pages/Home.tsx` | Monta `TrailCard` junto da faixa de persona |
| `src/i18n/ui.ts` | Textos comuns (botões, progresso, selo, avisos); textos de passo ficam em `trails.ts` |
| `src/styles/workspace.css` | Anel, cartão, selo; só tokens, sem degradê |

## Fluxos

**Começar.** O cartão (ou `trilha iniciar`) chama `start()`: grava o passo 0, abre o overlay
e navega para a rota do passo.

**Passo.** O overlay resolve o alvo (`getElementById(anchor)` ou `h1`), rola até ele, posiciona
o anel (`getBoundingClientRect`, recalculado em rolagem e redimensionamento) e foca o cartão.
Passo "ver" marca feito ao aparecer. "fazer" mostra o comando e um botão "rodar" (usa
`session.execute`) e espera o evento. "agir" mostra a ação e conclui ao clicar.

**Sair.** Esc, "sair" ou `trilha sair`: fecha o overlay, devolve o foco ao elemento anterior e
mantém o passo salvo.

**Persona trocada.** `TrailProvider` lê a trilha da persona atual; o progresso das outras
fica intacto no armazenamento.

## Riscos

| Risco | Tratamento |
| --- | --- |
| O anel descola do alvo quando a página muda de altura | Recalcula em `ResizeObserver` do alvo e em rolagem |
| Anel ou cartão cobrem o alvo no celular | Cartão fixo na parte de baixo (largura total) e o alvo rolado para o terço superior |
| Foco preso depois de fechar | O overlay não usa captura total de foco: Tab circula só enquanto aberto, e o foco volta ao elemento anterior ao sair |
| JS inicial passar de +3 kB gzip (TR-27) | Medir no T-TR7; se passar, lazy também para o cartão e os dados |
| Eventos de comando duplicados no replay | A sessão só emite quando `replay` é falso |
