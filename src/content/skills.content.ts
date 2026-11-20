// Competências (spec 003, T4.4). Copiadas de `src/data/skillTimeline.ts` sem alteração. `since: null` do antigo
// vira ausente (nunca ano estimado); `since` e `source` aparecem juntos ou nenhum.
import type { ContentSkillGroup } from './schema/skills';

export const skillGroups: ContentSkillGroup[] = [
  {
    id: 'languages',
    title: {
      pt: 'Linguagens',
      en: 'Languages',
    },
    items: [
      {
        name: 'Java',
        since: 2025,
        source: {
          pt: 'EcoShop v1',
          en: 'EcoShop v1',
        },
      },
      {
        name: 'JavaScript',
        since: 2025,
        source: {
          pt: 'Planoriza',
          en: 'Planoriza',
        },
      },
      {
        name: 'TypeScript',
        since: 2026,
        source: {
          pt: 'EcoShop v2',
          en: 'EcoShop v2',
        },
      },
      {
        name: 'Python',
        since: 2026,
        source: {
          pt: 'Imersão Alura',
          en: 'Alura immersion',
        },
      },
      {
        name: 'C/C++',
      },
      {
        name: 'PHP',
      },
    ],
  },
  {
    id: 'frontend',
    title: {
      pt: 'Front-end',
      en: 'Front-end',
    },
    items: [
      {
        name: 'HTML5 · CSS3',
        since: 2025,
        source: {
          pt: 'Planoriza',
          en: 'Planoriza',
        },
      },
      {
        name: 'Next.js',
        since: 2026,
        source: {
          pt: 'EcoShop v2',
          en: 'EcoShop v2',
        },
      },
      {
        name: 'Figma',
        since: 2026,
        source: {
          pt: 'DevArt',
          en: 'DevArt',
        },
      },
      {
        name: 'React',
      },
      {
        name: 'Tailwind CSS',
      },
    ],
  },
  {
    id: 'data',
    title: {
      pt: 'Back-end e dados',
      en: 'Back-end and data',
    },
    items: [
      {
        name: 'PostgreSQL',
        since: 2025,
        source: {
          pt: 'EcoShop v1',
          en: 'EcoShop v1',
        },
      },
      {
        name: 'Node.js · Express',
        since: 2026,
        source: {
          pt: 'ShortURL',
          en: 'ShortURL',
        },
      },
      {
        name: 'MongoDB',
        since: 2026,
        source: {
          pt: 'ShortURL',
          en: 'ShortURL',
        },
      },
      {
        name: 'Redis',
        since: 2026,
        source: {
          pt: 'EcoShop v2',
          en: 'EcoShop v2',
        },
      },
      {
        name: 'Prisma ORM',
        since: 2026,
        source: {
          pt: 'EcoShop v2',
          en: 'EcoShop v2',
        },
      },
      {
        name: 'BullMQ',
        since: 2026,
        source: {
          pt: 'WhatsApp Dispatcher',
          en: 'WhatsApp Dispatcher',
        },
      },
      {
        name: 'Spring Boot',
      },
    ],
  },
  {
    id: 'quality',
    title: {
      pt: 'Testes e DevOps',
      en: 'Testing and DevOps',
    },
    items: [
      {
        name: 'JUnit 5 · Mockito',
        since: 2025,
        source: {
          pt: 'EcoShop v1',
          en: 'EcoShop v1',
        },
      },
      {
        name: 'Docker',
        since: 2025,
        source: {
          pt: 'EcoShop v1',
          en: 'EcoShop v1',
        },
      },
      {
        name: 'GitHub Actions',
        since: 2026,
        source: {
          pt: 'EcoShop v2',
          en: 'EcoShop v2',
        },
      },
      {
        name: 'Zod',
        since: 2026,
        source: {
          pt: 'EcoShop v2',
          en: 'EcoShop v2',
        },
      },
      {
        name: 'Jest',
      },
      {
        name: 'Git',
      },
    ],
  },
];
