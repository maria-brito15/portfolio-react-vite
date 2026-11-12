# Personas

O site pergunta, de forma opcional, quem está visitando e usa a resposta como uma lente
sobre o mesmo conteúdo: ordem, destaque e sugestões. Contexto e decisões em `prd.md`.

Grupo de requisitos **PR-xx**. Fonte única: `src/data/personas.ts` (dados); rotas em
`src/data/routes.ts`; textos em `src/i18n/ui.ts`.

Legenda: **Pri.** P0 = essencial, P1 = importante. **Verif.** AUT = teste automático,
MAN = checagem manual.

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| PR-01 | Cinco personas como dado | `personas.ts` define `rh`, `tech`, `professor`, `amigo`, `cliente`, cada uma com rótulo e descrição PT/EN, ordem de páginas/seções, comandos sugeridos e chamado para ação; nenhum outro arquivo repete esses dados | P0 | AUT |
| PR-02 | Pergunta na primeira visita | **Quando** não há persona salva, resposta anterior nem rota de persona, a home (painel `/`) e o terminal (`/terminal`) mostram a pergunta com as cinco opções e "pular", em PT ou EN conforme o idioma; responder ou pular em um dos dois vale para os dois | P0 | AUT |
| PR-03 | Pulável e não bloqueante | Enter no terminal, o botão "pular" no painel ou qualquer outro comando dispensa a pergunta; o site funciona igual a hoje sem persona; depois de dispensada ou respondida, a pergunta não reaparece nesse navegador (o comando de PR-06 continua disponível) | P0 | AUT |
| PR-04 | Escolha por número ou nome | Digitar `1`–`5` ou o nome/alias da persona (`tech`, `rh`…) escolhe; entrada inválida reensina as opções sem erro quebrado | P0 | AUT |
| PR-05 | Persistência local | A escolha fica em `localStorage`; sem cookie, sem envio a servidor, sem analytics por persona; se `localStorage` falhar, a escolha vale só na sessão | P0 | AUT |
| PR-06 | Comando de troca | `visitante` / `visitor` (alias `persona`) mostra a persona atual e as opções; aceita um argumento para trocar e `limpar`/`clear` para remover; aparece em `ajuda` e no autocompletar (Tab) | P0 | AUT |
| PR-07 | Rotas diretas | `/r/rh`, `/r/tech`, `/r/professor`, `/r/amigo`, `/r/cliente` abrem o site com a persona já aplicada, sem pergunta; a persona da rota vale para a sessão e, ao abrir, passa a ser a salva | P0 | AUT |
| PR-08 | Rotas só em `routes.ts` | As rotas de persona nascem de `personas.ts` dentro de `routes.ts` (nada de caminho repetido em outro arquivo); persona desconhecida (`/r/xyz`) cai no 404 | P0 | AUT |
| PR-09 | HTML e SEO das rotas | `npm run build` grava `dist/r/<persona>.html`; as rotas ficam fora do `sitemap.xml`, com `canonical` para `/` e `noindex`, e o 404 continua com status 404 de verdade | P0 | AUT |
| PR-10 | Lente: ordem e destaque | Com persona ativa, a barra lateral, o painel da home e as sugestões põem primeiro as páginas/seções da persona e marcam essas entradas; **todas** as páginas continuam acessíveis e o conteúdo não muda | P0 | AUT |
| PR-11 | Lente: sugestões e chamado | Com persona ativa, o terminal sugere os comandos da persona após a escolha e o painel mostra o chamado para ação dela (ex.: `cliente` → contato/serviços) | P1 | AUT |
| PR-12 | Sem dado inventado | A lente só reordena e destaca conteúdo existente; textos novos são só de interface, em PT/EN, sem fato novo sobre a Duda | P0 | AUT/MAN |
| PR-13 | Paridade de idioma | Todo texto de persona existe em PT e EN; trocar o idioma troca a persona exibida sem perder a escolha | P0 | AUT |
| PR-14 | Estilo único | Destaques usam tokens de `tokens.css` e componentes de `components/ui/`; mono único, sem degradê, contraste AA nos cinco temas | P0 | AUT/MAN |
| PR-15 | Acessibilidade | A pergunta e a troca funcionam só com teclado; a persona atual é anunciada em região `aria-live`; respeita `prefers-reduced-motion` | P1 | AUT/MAN |
| PR-16 | Impressão do currículo intacta | Persona não altera a versão impressa do currículo | P1 | MAN |

## Ajustes feitos ao escrever o plano

- `whoami` já é o nome em inglês de `sobre` (`commands.tsx`) e `quemsou` é seu alias; por
  isso o comando de persona passou a se chamar `visitante` / `visitor` (PR-06).
- A home é o painel (`/`); o terminal mora em `/terminal`. A pergunta aparece nos dois
  (PR-02) e a escolha é compartilhada.

## Fora desta spec

- O assistente de IA (`docs/specs/assistente-ia/`), que lê a persona mas não é requisito
  daqui.
- Tema por persona (decidido: persona não muda tema).

## Perguntas em aberto

Nenhuma bloqueando. Para o plano: como `routes.ts` gera as rotas de persona sem quebrar
o teste que exige "uma rota por seção" (`routes.test.ts`) e o gerador de HTML
(`scripts/seoPlugin.ts`), que hoje lista todas as rotas no sitemap.
