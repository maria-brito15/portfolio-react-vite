// Trajetória acadêmica (rota /academico). Formação e anos vêm do currículo da
// autora; as atividades por ano reaproveitam os ids de experiences.js e
// projects.jsx, sem repetir textos.
//
// DISCIPLINAS E NOTAS: a seção aparece quando `semesters` tiver itens. Preencha apenas com o histórico oficial, neste formato:
//
// {
//   id: '2026-1',
//   label: { pt: '1º semestre de 2026', en: '1st semester 2026' },
//   program: 'es',            // id de um item de `programs`
//   inProgress: false,        // true no semestre atual
//   courses: [
//     { name: { pt: 'Algoritmos e Estruturas de Dados I', en: 'Algorithms and Data Structures I' },
//       hours: 80, modality: 'presencial', grade: 92 },   // grade: null enquanto não sair
//   ],
// }
//
// modality: 'presencial' | 'hibrida' | 'virtual'. Carga horária e média do
// semestre são calculadas automaticamente (src/utils/academics.js).
export const academics = {
  // Anos sem mês: o currículo informa só o intervalo (2025–2026 e 2026–2029).
  programs: [
    {
      id: 'cc',
      institution: 'PUC Minas',
      degree: { pt: 'Bacharelado em Ciência da Computação', en: "Bachelor's in Computer Science" },
      start: 2025,
      end: 2026,
    },
    {
      id: 'es',
      institution: 'PUC Minas',
      degree: {
        pt: 'Bacharelado em Engenharia de Software',
        en: "Bachelor's in Software Engineering",
      },
      start: 2026,
      end: 2029,
      expected: true,
    },
  ],
  timeline: [
    {
      year: 2025,
      label: { pt: 'Início em Ciência da Computação', en: 'Started Computer Science' },
    },
    { year: 2026, label: { pt: 'Engenharia de Software', en: 'Software Engineering' } },
    { year: 2029, label: { pt: 'Previsão de conclusão', en: 'Expected graduation' } },
  ],
  // Atividades acadêmicas por ano, na ordem do próprio ano.
  years: [
    {
      year: 2025,
      items: [
        { kind: 'project', id: 'planoriza' },
        { kind: 'experience', id: 'palestra' },
        { kind: 'project', id: 'ecoshop' },
        { kind: 'experience', id: 'icpc' },
      ],
    },
    {
      year: 2026,
      items: [
        { kind: 'experience', id: 'alura' },
        { kind: 'experience', id: 'devart' },
        { kind: 'experience', id: 'monitoria' },
        { kind: 'experience', id: 'webtech' },
      ],
    },
  ],
  // Placeholders: semestres já criados, ainda sem disciplinas. Para preencher,
  // adicione os itens em `courses` (formato no topo deste arquivo). A carga
  // horária e a média do semestre aparecem sozinhas quando houver disciplinas.
  semesters: [
    {
      id: '2025-1',
      label: { pt: '01/2025', en: '01/2025' },
      program: 'cc',
      courses: [],
    },
    {
      id: '2025-2',
      label: { pt: '02/2025', en: '02/2025' },
      program: 'cc',
      courses: [],
    },
    {
      id: '2026-1',
      label: { pt: '01/2026', en: '01/2026' },
      program: 'cc',
      courses: [],
    },
    {
      id: '2026-2',
      label: { pt: '02/2026', en: '02/2026' },
      program: 'es',
      inProgress: true,
      courses: [],
    },
  ],
};
