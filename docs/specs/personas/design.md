# Personas: plano técnico

Requisitos em `requirements.md` (PR-01 a PR-16). Este plano parte do código atual: a home
é o painel `/`, o terminal é `/terminal`, `routes.ts` é a fonte única de rotas, o build
grava um HTML por rota em `scripts/seoPlugin.ts`.

## Decisões

| # | Decisão | Alternativa descartada | Por quê |
| --- | --- | --- | --- |
| D1 | Persona é **dado** em `src/data/personas.ts`, sem importar `routes.ts` (a ordem usa ids de rota como texto) | Persona dentro de `routes.ts` | `routes.ts` importa `personas.ts` para gerar as rotas `/r/*`; o sentido contrário criaria import circular. Um teste garante que todo id citado existe em `routes.ts` |
| D2 | Rotas `/r/<id>` geradas em `routes.ts` a partir de `personas.ts`, com `hidden: true` e o campo novo `persona` | Uma rota dinâmica `/r/:id` no roteador | O roteador e o plugin de SEO só conhecem a tabela; gerar da tabela mantém "rota só em `routes.ts`" (PR-08) e o HTML estático por rota (PR-09) |
| D3 | A rota `/r/<id>` **renderiza a home** na própria URL e grava a persona | Redirecionar para `/` | O link continua o que a Duda mandou; sem salto nem história extra |
| D4 | Estado em `PersonaProvider` (`src/hooks/usePersona.tsx`) com `localStorage`: `portfolio-persona` (id) e `portfolio-persona-asked` (`1`) | Cookie; query string | PR-05: nada vai ao servidor |
| D5 | **Pular também é lembrado** (marca `asked`), então a pergunta aparece uma vez por navegador | Pular vale só na sessão | Voltar a perguntar a cada visita irrita; `visitante` continua disponível. Vale mais que PR-03 pede, sem contrariá-lo |
| D6 | Comando `visitante` / `visitor`, alias `persona` | `whoami` | `whoami` já é o nome em inglês de `sobre` |
| D7 | A lente é uma função pura `byPersona(items, persona, idOf)`: itens da persona primeiro (na ordem dela), o resto na ordem original | Esconder itens | PR-10: nada some |
| D8 | Resposta numérica no terminal só vale **enquanto a pergunta está pendente**; depois, número volta a ser seção da última página | Sempre | Evita colisão com `2`, `proximo` (ver `runCommand`) |

## Dados

```ts
// src/data/personas.ts
export type PersonaId = 'rh' | 'tech' | 'professor' | 'amigo' | 'cliente';

export interface Persona {
  id: PersonaId;
  label: Localized;          // "Recrutador(a) / RH"
  desc: Localized;           // uma linha: o que essa lente destaca
  aliases: string[];         // 'hr', 'recruiter', 'rh'… aceitos no terminal
  order: string[];           // ids de rota, do mais ao menos importante
  commands: string[];        // comandos sugeridos (nomes em PT)
  cta: { route: string; label: Localized };
  askHint: string;           // foco/tom para o assistente (IA-12); texto de instrução, não fato
}
```

Ordem inicial (ids reais de `routes.ts`; item em rascunho é ignorado):

| Persona | `order` | `cta` |
| --- | --- | --- |
| `rh` | curriculo, experiencias, sobre, contato | curriculo |
| `tech` | projetos, github, habilidades, terminal | projetos |
| `professor` | academico, projetos, curriculo, sobre | academico |
| `amigo` | sobre, jogos, projetos, agora | sobre |
| `cliente` | servicos, projetos, contato | servicos |

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/data/personas.ts` (novo) | Dados, `findPersona(text)` (id, alias, número 1–5; ignora acento via `fold`), `byPersona` |
| `src/data/personas.test.ts` (novo) | Ids de `order`/`cta`/`commands` existem; PT e EN completos; aliases únicos; `byPersona` mantém todos os itens |
| `src/hooks/usePersona.tsx` (novo) | Contexto: `persona`, `asked`, `choose(id)`, `skip()`, `clear()`; `localStorage` em try/catch com memória como reserva |
| `src/data/routes.ts` | Campo `persona?: PersonaId` em `Route`; `...personas.map(...)` gera `/r/<id>` (`hidden`, label da persona) |
| `src/App.tsx` | Envolve com `PersonaProvider`; `Page` mostra `<Home />` quando `route.persona`, e `choose(route.persona)` ao montar |
| `src/data/seo.ts` | `metaFor` das rotas de persona usa a meta da home; `headTags`: canonical `/` e `noindex, follow` quando `route.persona` |
| `scripts/seoPlugin.ts` | Sitemap exclui `r.persona`. O HTML `dist/r/<id>.html` já sai do laço existente (`mkdirSync` recursivo) |
| `src/test/setup.ts` | Grava `portfolio-persona-asked` como o faz com o boot, para não quebrar testes existentes |
| `src/terminal/commands.tsx` + `extras/` | Comando `visitante`/`visitor`; `CommandContext` ganha `persona`, `personaPending`, `choosePersona`; com pergunta pendente, `1`–`5` ou nome escolhe |
| `src/terminal/catalog.ts` | `visitante: 'personalize'` (sem isso o catálogo e `deadCode.test.ts` reclamam) |
| `src/terminal/Terminal.tsx`, `CommandInput.tsx` | Mostra a pergunta quando pendente; Enter vazio = pular (hoje entrada vazia é ignorada em `execute`) |
| `src/components/PersonaPrompt.tsx` (novo) | Faixa na home: cinco botões + "pular"; depois vira `PersonaBadge` ("Vendo como: tech · trocar") |
| `src/pages/Home.tsx` | Monta `PersonaPrompt`; botão de CTA da persona junto aos existentes |
| `src/components/shell/Sidebar.tsx`, `dashboard/QuickAccess.tsx` | Aplicam `byPersona` e marcam as entradas da persona (`data-persona-pick`) |
| `src/i18n/ui.ts` | Bloco `persona` em PT e EN (pergunta, rótulos, ajuda, "pular", "trocar") |
| `src/styles/*.css` | Faixa e marca de destaque só com tokens de `tokens.css`; sem degradê |

## Fluxos

**Primeira visita.** `PersonaProvider` lê `asked`. Se falso e a rota não é `/r/*`, a home
mostra `PersonaPrompt` e o terminal mostra as cinco linhas. Escolher chama `choose(id)`
(grava `persona` e `asked`); pular chama `skip()` (grava só `asked`).

**Link `/r/tech`.** `Page` renderiza a home, `choose('tech')` roda uma vez e a faixa já
nasce como `PersonaBadge`. O HTML estático de `dist/r/tech.html` tem a meta da home, canonical
`/` e `noindex`, então o link não compete com a página principal.

**Terminal.** `runCommand` consulta `ctx.personaPending` antes da regra de número sozinho.
`visitante tech` troca; `visitante limpar` remove; sem argumento lista as opções.

## Riscos

| Risco | Tratamento |
| --- | --- |
| `routes.test.ts`, `seo.test.ts` e `seoPlugin.test.ts` assumem "toda rota tem meta e entra no sitemap" | Ajustar os três para a exceção `persona` (um teste novo prova que ela é intencional) |
| Netlify servir `/r/tech` | O build grava `dist/r/tech.html` e a Netlify serve sem `.html`, como em `/sobre`; conferir no preview do deploy |
| Persona antiga salva e depois removida de `personas.ts` | `usePersona` ignora id desconhecido |
| Contraste dos destaques nos cinco temas | Só tokens existentes; `/verify-site` confere AA |
