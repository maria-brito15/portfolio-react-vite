# Modelo de semestre (`src/data/academics.ts`)

```js
{
  id: '2026-1',
  label: { pt: '01/2026', en: '01/2026' },
  program: 'cc',            // id de um item de `programs` ('cc' ou 'es')
  inProgress: false,        // true só no semestre atual
  courses: [
    // { name: { pt: '…', en: '…' }, hours: 80, modality: 'presencial', grade: null },
    // modality: 'presencial' | 'hibrida' | 'virtual'; grade: null até sair a nota
  ],
}
```

Carga horária e média do semestre são calculadas por `src/utils/academics.ts`; não escreva à mão.
Semestres preenchidos com as disciplinas aprovadas: `2025-1`, `2025-2`, `2026-1` (programa `cc`; sem `hours`/`modality`, que são opcionais)
e `2026-2` (programa `es`, `inProgress: true`).
Pergunte à pessoa antes de preencher qualquer `grade`, `hours` ou nome de disciplina.
