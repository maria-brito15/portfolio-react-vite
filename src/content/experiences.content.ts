// Experiências (spec 003, T4.2). Texto copiado de `src/data/experiences.ts` sem alteração: 3 grupos e 7
// itens, na ordem de hoje. `period.start` é o que o rótulo mostra (mês só quando o rótulo é MM/AAAA);
// `period.label` é o texto literal. O fim do período vive no rótulo.
import type { ContentExperienceGroup } from './schema/experience';

export const experienceGroups: ContentExperienceGroup[] = [
  {
    id: 'academic',
    title: {
      pt: 'Experiências acadêmicas e extensão',
      en: 'Academic experience and outreach',
    },
    items: [
      {
        id: 'webtech',
        highlight: true,
        period: {
          start: {
            year: 2026,
          },
          label: {
            pt: '2º semestre de 2026 – em andamento',
            en: '2nd half of 2026 – ongoing',
          },
        },
        org: {
          pt: 'WebTech',
          en: 'WebTech',
        },
        role: {
          pt: 'Projeto de Extensão',
          en: 'Extension Project',
        },
        description: {
          pt: 'Participo desse projeto de extensão, uma ponte entre a faculdade e empresas parceiras do setor de tecnologia. Atualmente me envolvo na preparação de um workshop e de um laboratório de Spec-Driven Development (SDD), que usarão como referência uma futura aplicação de monitorias universitárias.',
          en: "I take part in this extension project, a bridge between the university and partner companies in tech. I'm currently involved in preparing a Spec-Driven Development (SDD) workshop and lab, which will use a future university tutoring application as a reference.",
        },
        tag: {
          pt: 'Trabalho em equipe',
          en: 'Teamwork',
        },
      },
      {
        id: 'monitoria',
        period: {
          start: {
            year: 2026,
            month: 2,
          },
          label: {
            pt: '02/2026',
            en: '02/2026',
          },
        },
        org: {
          pt: 'PUC Minas',
          en: 'PUC Minas',
        },
        role: {
          pt: 'Monitoria — Desenvolvimento de Interfaces Web',
          en: 'Teaching Assistant — Web Interface Development',
        },
        description: {
          pt: 'Fui monitora dessa disciplina na PUC Minas.',
          en: 'Was a TA for this course at PUC Minas.',
        },
      },
      {
        id: 'palestra',
        period: {
          start: {
            year: 2025,
            month: 1,
          },
          label: {
            pt: '01/2025',
            en: '01/2025',
          },
        },
        org: {
          pt: 'PUC Minas',
          en: 'PUC Minas',
        },
        role: {
          pt: 'Palestrante de Computação',
          en: 'Computer Science Speaker',
        },
        description: {
          pt: 'Dei uma palestra em projeto de extensão de programação na PUC Minas.',
          en: 'Gave a talk in a programming outreach project at PUC Minas.',
        },
        tag: {
          pt: 'Ensino',
          en: 'Teaching',
        },
      },
    ],
  },
  {
    id: 'learning',
    title: {
      pt: 'Cursos e competições',
      en: 'Courses and competitions',
    },
    items: [
      {
        id: 'alura',
        period: {
          start: {
            year: 2026,
            month: 1,
          },
          label: {
            pt: '01/2026',
            en: '01/2026',
          },
        },
        org: {
          pt: 'Alura',
          en: 'Alura',
        },
        role: {
          pt: 'Imersão — Análise de Dados com Python',
          en: 'Immersion — Data Analysis with Python',
        },
        description: {
          pt: 'Estudei pandas e matplotlib pra trabalhar com dados.',
          en: 'Learned pandas and matplotlib to work with data.',
        },
      },
      {
        id: 'devart',
        period: {
          start: {
            year: 2026,
            month: 1,
          },
          label: {
            pt: '01/2026',
            en: '01/2026',
          },
        },
        org: {
          pt: 'DevArt',
          en: 'DevArt',
        },
        role: {
          pt: 'Desenvolvimento Web',
          en: 'Web Development',
        },
        description: {
          pt: 'Curso com o Gustavo Campelo, cobrindo Figma, design responsivo e animações.',
          en: 'Course with Gustavo Campelo, covering Figma, responsive design and animations.',
        },
      },
      {
        id: 'icpc',
        period: {
          start: {
            year: 2025,
            month: 2,
          },
          label: {
            pt: '02/2025',
            en: '02/2025',
          },
        },
        org: {
          pt: 'SBC — ICPC Brasil',
          en: 'SBC — ICPC Brazil',
        },
        role: {
          pt: 'Maratona de Programação',
          en: 'Programming Marathon',
        },
        description: {
          pt: 'Participei da maratona nacional de programação competitiva.',
          en: 'Took part in the national competitive programming marathon.',
        },
        tag: {
          pt: 'Algoritmos',
          en: 'Algorithms',
        },
      },
    ],
  },
  {
    id: 'awards',
    title: {
      pt: 'Reconhecimentos',
      en: 'Recognition',
    },
    items: [
      {
        id: 'finalista',
        highlight: true,
        period: {
          start: {
            year: 2025,
          },
          label: {
            pt: '2025–2026',
            en: '2025–2026',
          },
        },
        org: {
          pt: 'PUC Minas',
          en: 'PUC Minas',
        },
        role: {
          pt: 'Finalista — Melhores Trabalhos',
          en: 'Finalist — Best Projects',
        },
        description: {
          pt: 'Duas vezes finalista: EcoShop e Planoriza.',
          en: 'Two-time finalist: EcoShop and Planoriza.',
        },
        tag: {
          pt: 'PUC Minas',
          en: 'PUC Minas',
        },
      },
    ],
  },
];
