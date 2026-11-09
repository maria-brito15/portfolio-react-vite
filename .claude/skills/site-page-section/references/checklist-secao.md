# Checklist: seção nova dentro de página

- [ ] `src/data/sections.js`: adicionar `{ id, names: [pt, en], desc }` na página; a **ordem do array é o número** `[n]` do índice (renumera os demais; avise no PR).
- [ ] Conteúdo: dado em `src/data/*` (nunca texto solto no componente).
- [ ] Página própria: `<section id="<id-da-secao>">` com âncora; título com `SectionTitle`.
- [ ] Visão em terminal: caso novo em `sectionViews.jsx`, lendo o mesmo dado.
- [ ] `sectionsOf(page)`, `resolveTarget`, `neighbors` já cobrem número, nome e vizinhos: **não** reimplemente.
- [ ] Autocompletar: o teste de Tab após `<página> ` precisa listar a seção nova.
- [ ] Contagem no índice (ex.: "6 seções") é calculada, não escrita à mão.
- [ ] Teste: abrir por número, por nome (PT e EN) e por clique; `proximo`/`anterior` passam por ela.
- [ ] Atualizar o requisito correspondente no SDD (DS-xx) se a mudança afeta descoberta.
