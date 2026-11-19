// Acadêmico (spec 003, T4.3). Texto e notas copiados de `src/data/academics.ts` sem alteração, sem
// omitir disciplina e sem inventar escala (Q-002). Carga horária e modalidade não existem hoje e continuam
// ausentes; `grade: null` do antigo vira ausente. `years[].items[].id` aponta para projetos e experiências.
import type { ContentAcademics } from './schema/academics';

export const academics: ContentAcademics = {
  programs: [
    {
      id: 'cc',
      institution: 'PUC Minas',
      degree: {
        pt: 'Bacharelado em Ciência da Computação',
        en: "Bachelor's in Computer Science",
      },
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
      label: {
        pt: 'Início em Ciência da Computação',
        en: 'Started Computer Science',
      },
    },
    {
      year: 2026,
      label: {
        pt: 'Engenharia de Software',
        en: 'Software Engineering',
      },
    },
    {
      year: 2029,
      label: {
        pt: 'Previsão de conclusão',
        en: 'Expected graduation',
      },
    },
  ],
  years: [
    {
      year: 2025,
      items: [
        {
          kind: 'project',
          id: 'planoriza',
        },
        {
          kind: 'experience',
          id: 'palestra',
        },
        {
          kind: 'project',
          id: 'ecoshop',
        },
        {
          kind: 'experience',
          id: 'icpc',
        },
      ],
    },
    {
      year: 2026,
      items: [
        {
          kind: 'experience',
          id: 'alura',
        },
        {
          kind: 'experience',
          id: 'devart',
        },
        {
          kind: 'experience',
          id: 'monitoria',
        },
        {
          kind: 'experience',
          id: 'webtech',
        },
      ],
    },
  ],
  semesters: [
    {
      id: '2025-1',
      label: {
        pt: '01/2025',
        en: '01/2025',
      },
      program: 'cc',
      courses: [
        {
          name: {
            pt: 'Algoritmos e Estruturas de Dados I',
            en: 'Algorithms and Data Structures I',
          },
          grade: 75,
        },
        {
          name: {
            pt: 'Cálculo I',
            en: 'Calculus I',
          },
          grade: 60,
        },
        {
          name: {
            pt: 'Desenvolvimento de Interfaces Web',
            en: 'Web Interface Development',
          },
          grade: 99,
        },
        {
          name: {
            pt: 'Filosofia: Razão e Modernidade',
            en: 'Philosophy: Reason and Modernity',
          },
          grade: 90,
        },
        {
          name: {
            pt: 'Introdução à Computação',
            en: 'Introduction to Computing',
          },
          grade: 73,
        },
        {
          name: {
            pt: 'Laboratório de Iniciação à Programação',
            en: 'Programming Introduction Lab',
          },
          grade: 87,
        },
        {
          name: {
            pt: 'Trabalho Interdisciplinar I: Front-end',
            en: 'Interdisciplinary Project I: Front-end',
          },
          grade: 90,
        },
      ],
    },
    {
      id: '2025-2',
      label: {
        pt: '02/2025',
        en: '02/2025',
      },
      program: 'cc',
      courses: [
        {
          name: {
            pt: 'Algoritmos e Estruturas de Dados II',
            en: 'Algorithms and Data Structures II',
          },
          grade: 64,
        },
        {
          name: {
            pt: 'Cultura Religiosa: Fenômeno Religioso',
            en: 'Religious Culture: The Religious Phenomenon',
          },
          grade: 95,
        },
        {
          name: {
            pt: 'Engenharia de Software I',
            en: 'Software Engineering I',
          },
          grade: 86,
        },
        {
          name: {
            pt: 'Gerenciamento de Projetos',
            en: 'Project Management',
          },
          grade: 90,
        },
        {
          name: {
            pt: 'Trabalho Interdisciplinar II: Back-end',
            en: 'Interdisciplinary Project II: Back-end',
          },
          grade: 92,
        },
      ],
    },
    {
      id: '2026-1',
      label: {
        pt: '01/2026',
        en: '01/2026',
      },
      program: 'cc',
      courses: [
        {
          name: {
            pt: 'Algoritmos e Estruturas de Dados III',
            en: 'Algorithms and Data Structures III',
          },
          grade: 60,
        },
        {
          name: {
            pt: 'Banco de Dados',
            en: 'Databases',
          },
          grade: 62,
        },
        {
          name: {
            pt: 'Engenharia de Software II',
            en: 'Software Engineering II',
          },
          grade: 85,
        },
        {
          name: {
            pt: 'Impactos Ambientais e Alterações Climáticas Globais',
            en: 'Environmental Impacts and Global Climate Change',
          },
          grade: 83,
        },
        {
          name: {
            pt: 'Trabalho Interdisciplinar III: Pesquisa Aplicada',
            en: 'Interdisciplinary Project III: Applied Research',
          },
          grade: 69,
        },
      ],
    },
    {
      id: '2026-2',
      label: {
        pt: '02/2026',
        en: '02/2026',
      },
      program: 'es',
      inProgress: true,
      courses: [],
    },
  ],
};
