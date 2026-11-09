# Falhas comuns e causa provável

| Sintoma | Causa provável |
| --- | --- |
| "Found multiple elements with text …" | mesmo texto na página e no terminal; use `within(document.getElementById(...))` |
| `getByRole('textbox')` não acha o input | use `.term-input` ou o rótulo "Linha de comando do terminal" |
| Teste de estilo reprova `var(--x)` | variável usada e não definida em `tokens.css` |
| Teste de nomes duplicados em comandos | novo `names`/`aliases` colide com outro comando |
| Ordem da timeline de projetos falha | projeto inserido fora da ordem crescente |
| `skillTimeline` falha | habilidade citada sem projeto/curso datado, ou `since` escrito à mão |
| `complete()` devolve lista em vez de string | duas opções casam; prefira correspondência única no idioma ativo |
| Redirect de teste não termina | falta `vi.useFakeTimers()`/`advanceTimersByTime` para a barra de carregamento |
| Saída some ao trocar idioma | `output` guardou JSX pronto em vez de função `(lang) => JSX` |
