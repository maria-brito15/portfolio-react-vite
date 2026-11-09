# Anatomia de um comando (`src/terminal/commands.jsx`)

## Forma de uma entrada

```jsx
{
  names: ['curriculo', 'resume'],      // [português, inglês]; o primeiro aparece na ajuda em PT
  aliases: ['cv'],                     // opcional; também valem sem acento e sem caixa
  route: 'curriculo',                  // só para comando de página: id em routes.js
  usage: L('[seção]', '[section]'),    // opcional: argumento mostrado na ajuda
  desc: L('resumo do currículo', 'resume summary'),   // obrigatório, PT e EN
  hidden: false,                       // true = fora da ajuda e do autocompletar (brincadeiras)
  run: (args, ctx) => ({               // args: string[] já sem aspas e sem espaços extras
    output: (lang) => <ResumeView lang={lang} />,     // sempre função de idioma
    // clear: true  → limpa a tela (como `limpar`)
  }),
}
```

`L(pt, en)` devolve `{ pt, en }`. Dentro de `output`, escolha o texto com `lang`.

## O que `ctx` oferece

`ctx.replay` (boolean), `ctx.history`, `ctx.theme`, `ctx.toggleTheme()`, `ctx.toggleLang()`,
e a navegação da sessão. **Efeito colateral só se `!ctx.replay`.**

## Fluxo de `runCommand`

1. `parse()` quebra a linha (aspas, espaços extras).
2. `curriculo/competencias` vira `curriculo competencias`.
3. `findCommand(name)` usa `fold()`; não achou → erro "comando não encontrado" com dica de `ajuda`.
4. Comando com `route` **e** argumento → `runSection` (lê a seção; erro de seção inválida).
5. Comando com `route` sem argumento → `run()` + `ActionLine` automático.

## Autocompletar

`complete(input, lang)` completa comando; depois de `cd`/`ls`/`open`, a página; depois de
`<página>/` ou `<página> `, a seção. Devolve string (única opção) ou lista (várias).
Argumento novo = novo ramo em `complete()` + teste.

## Checklist de um comando novo

- [ ] `names` PT/EN, `desc` PT/EN, sem colisão com outro nome ou apelido
- [ ] `output` função de idioma; sem texto fixo em um idioma só
- [ ] efeitos protegidos por `!ctx.replay`
- [ ] erro que ensina (nunca exceção)
- [ ] aparece em `ajuda` (ou `hidden`) e funciona no autocompletar
- [ ] teste novo + inventário continua passando
- [ ] README atualizado
