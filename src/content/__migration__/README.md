# Equivalência antigo × novo (spec 003)

**Descartável.** Existe só para provar que a migração do conteúdo não mudou nenhum fato (FR-008). Apagar a pasta inteira no fechamento da 003 (T6.2), com a aprovação da Duda.

- `compare.ts`: compara duas listas de fatos (`caminho -> texto`) e acusa `faltando`, `a mais`, `mudou` e `fora de ordem`.
- `legacy.ts`: `ReactNode` antigo para texto com `**negrito**` (só `<strong>` migra).
- `coverage.ts`: trava de cobertura (contagens lidas do antigo, chaves não mapeadas, PT e EN pareados).
- `legacyFacts.ts` / `newFacts.ts`: um projetor por lado e por domínio, escritos separadamente. Cada tarefa T4.x liga o seu.
- `equivalence.test.ts`: um teste por domínio; domínio sem projetor aparece como `todo`.

Quem apagar um módulo antigo (outra spec) apaga o trecho correspondente na mesma tarefa.
