# Qualidade e requisitos não funcionais

Lint, testes e build limpos, ausência de erro de console, PT/EN completos e documentação coerente.

Grupo de requisitos **NF-xx**. Escrito de forma retroativa a partir do código e dos testes em 09/11/2026: a spec original é `sdd-terminal-v2/requirements.md`, e esta pasta a organiza por feature.

Arquivos: [requirements.md](requirements.md) · [design.md](design.md) · [status.md](status.md) · [tasks.md](tasks.md)

| ID | Requisito | Critério de aceitação | Pri. | Verif. |
| --- | --- | --- | --- | --- |
| NF-01 | Qualidade automatizada | `npm run lint`, `npm test` e `npm run build` com código 0 | P0 | AUT |
| NF-02 | Sem erro de console | Nenhuma rota emite erro no console em 390, 768 e 1440 px | P1 | MAN |
| NF-03 | PT/EN completos | Todo texto novo existe nos dois idiomas, em `src/i18n/ui.js` ou nos dados | P0 | AUT |
| NF-04 | Documentação coerente | README descreve os comandos e a navegação reais; `docs/sdd/` marca o que foi superado (§1) | P1 | MAN |
