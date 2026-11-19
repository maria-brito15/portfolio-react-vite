// Projetos (spec 003, T4.1). Texto copiado de `src/data/projects.tsx` sem alteração; o que não existe lá
// continua ausente (sem nota, sem `variant`, sem `icon`). Início sem mês = só o ano. EcoShop traz as 3 capturas
// de `public/cases/ecoshop/` (decisão D1 da Duda, 2026-11-19).
import type { ContentProject } from './schema/project';

export const projects: ContentProject[] = [
  {
    id: 'planoriza',
    name: {
      pt: 'Planoriza',
      en: 'Planoriza',
    },
    start: {
      year: 2025,
      month: 1,
    },
    stack: [
      {
        id: 'html5',
        label: {
          pt: 'HTML5',
          en: 'HTML5',
        },
      },
      {
        id: 'css3',
        label: {
          pt: 'CSS3',
          en: 'CSS3',
        },
      },
      {
        id: 'javascript',
        label: {
          pt: 'JavaScript',
          en: 'JavaScript',
        },
      },
    ],
    images: [],
    badge: {
      pt: 'Finalista · PUC Minas',
      en: 'Finalist · PUC Minas',
    },
    description: {
      pt: 'Surgiu de um problema que quase todo estudante conhece: lista de tarefas que cresce mais do que dá pra cumprir e só gera frustração. A solução limita quantas tarefas você pode colocar por dia, tem sistema de streak pra manter a consistência, calendário interativo e temporizador. Prevenir o burnout virou uma decisão de produto, não um detalhe.',
      en: 'Born from a problem almost every student knows: to-do lists that grow way past what you can actually finish, and just end up causing frustration. The fix caps how many tasks you can add per day, adds a streak system to keep you consistent, an interactive calendar, and a built-in timer. Preventing burnout became a product decision, not an afterthought.',
    },
  },
  {
    id: 'ecoshop',
    name: {
      pt: 'EcoShop',
      en: 'EcoShop',
    },
    start: {
      year: 2025,
      month: 2,
    },
    stack: [
      {
        id: 'java',
        label: {
          pt: 'Java',
          en: 'Java',
        },
      },
      {
        id: 'spark-framework',
        label: {
          pt: 'Spark Framework',
          en: 'Spark Framework',
        },
      },
      {
        id: 'postgresql',
        label: {
          pt: 'PostgreSQL',
          en: 'PostgreSQL',
        },
      },
      {
        id: 'next-js-15',
        label: {
          pt: 'Next.js 15',
          en: 'Next.js 15',
        },
      },
      {
        id: 'typescript',
        label: {
          pt: 'TypeScript',
          en: 'TypeScript',
        },
      },
      {
        id: 'prisma',
        label: {
          pt: 'Prisma',
          en: 'Prisma',
        },
      },
      {
        id: 'redis',
        label: {
          pt: 'Redis',
          en: 'Redis',
        },
      },
    ],
    repo: 'https://github.com/maria-brito15/ecoshop-nextjs',
    images: [
      {
        path: '/cases/ecoshop/1.jpeg',
        alt: {
          pt: 'EcoShop — captura de tela 1 de 3',
          en: 'EcoShop — screenshot 1 of 3',
        },
        width: 1280,
        height: 631,
      },
      {
        path: '/cases/ecoshop/2.jpeg',
        alt: {
          pt: 'EcoShop — captura de tela 2 de 3',
          en: 'EcoShop — screenshot 2 of 3',
        },
        width: 1280,
        height: 631,
      },
      {
        path: '/cases/ecoshop/3.jpeg',
        alt: {
          pt: 'EcoShop — captura de tela 3 de 3',
          en: 'EcoShop — screenshot 3 of 3',
        },
        width: 1280,
        height: 631,
      },
    ],
    badge: {
      pt: 'Finalista · PUC Minas',
      en: 'Finalist · PUC Minas',
    },
    description: {
      pt: 'E-commerce sustentável que identifica materiais recicláveis por imagem e analisa sustentabilidade usando IA. Começou como trabalho de faculdade e depois eu reescrevi do zero, sozinha, e o mais interessante aqui não é a versão atual, é ver a distância entre as duas.',
      en: "A sustainable e-commerce platform that identifies recyclable materials from photos and analyzes sustainability using AI. It started as a school project and I later rewrote it from scratch, on my own, and honestly the interesting part isn't the current version, it's the gap between the two.",
    },
    versions: [
      {
        label: 'v1',
        date: {
          year: 2025,
          month: 2,
        },
        stack: {
          pt: 'Java + Spark Framework',
          en: 'Java + Spark Framework',
        },
        description: {
          pt: 'A versão de faculdade, selecionada entre os melhores projetos do semestre. Arquitetura MVC clássica, Controller → Service → DAO, conexão direta com PostgreSQL via JDBC.',
          en: "The school version, picked among the semester's best projects. Classic MVC architecture, Controller → Service → DAO, direct connection to PostgreSQL via JDBC.",
        },
        points: [
          {
            pt: 'Controllers, Services e DAOs separados por entidade',
            en: 'Controllers, Services and DAOs split by entity',
          },
          {
            pt: 'Autenticação por sessão com BCrypt',
            en: 'Session-based auth with BCrypt',
          },
          {
            pt: 'InputSanitizer manual contra XSS',
            en: 'Manual InputSanitizer against XSS',
          },
          {
            pt: 'Testes com JUnit 5 + Mockito',
            en: 'Tests with JUnit 5 + Mockito',
          },
          {
            pt: 'Deploy com Docker no Render',
            en: 'Docker deploy on Render',
          },
        ],
      },
      {
        label: 'v2',
        date: {
          year: 2026,
          month: 1,
        },
        stack: {
          pt: 'Next.js 15 + TypeScript',
          en: 'Next.js 15 + TypeScript',
        },
        description: {
          pt: 'Reescrevi tudo com uma stack mais moderna: App Router, cache em duas camadas, ORM tipado, autenticação stateless e validação em todas as rotas.',
          en: 'I rewrote everything with a more modern stack: App Router, two-layer cache, typed ORM, stateless auth, and validation on every route.',
        },
        points: [
          {
            pt: 'Cache em duas camadas: Redis (servidor) + Map stale-while-revalidate (cliente)',
            en: 'Two-layer cache: Redis (server) + stale-while-revalidate Map (client)',
          },
          {
            pt: 'JDBC manual → Prisma ORM com schema tipado',
            en: 'Manual JDBC → Prisma ORM with typed schema',
          },
          {
            pt: 'Sessões → JWT stateless com middleware centralizado',
            en: 'Sessions → stateless JWT with centralized middleware',
          },
          {
            pt: 'Validação com Zod em todas as rotas',
            en: 'Zod validation on every route',
          },
          {
            pt: 'CI/CD com GitHub Actions + Container Registry',
            en: 'CI/CD with GitHub Actions + Container Registry',
          },
          {
            pt: 'Serviços externos (Azure Custom Vision, Gemini) com degradação graciosa',
            en: 'External services (Azure Custom Vision, Gemini) with graceful degradation',
          },
        ],
      },
    ],
  },
  {
    id: 'portfolio',
    name: {
      pt: 'Portfólio',
      en: 'Portfólio',
    },
    start: {
      year: 2026,
      month: 10,
    },
    dateLabel: {
      pt: 'out/2026',
      en: 'oct/2026',
    },
    stack: [
      {
        id: 'react-19',
        label: {
          pt: 'React 19',
          en: 'React 19',
        },
      },
      {
        id: 'vite',
        label: {
          pt: 'Vite',
          en: 'Vite',
        },
      },
      {
        id: 'typescript',
        label: {
          pt: 'TypeScript',
          en: 'TypeScript',
        },
      },
      {
        id: 'vitest',
        label: {
          pt: 'Vitest',
          en: 'Vitest',
        },
      },
      {
        id: 'spec-driven-development',
        label: {
          pt: 'Spec-Driven Development',
          en: 'Spec-Driven Development',
        },
      },
    ],
    repo: 'https://github.com/maria-brito15/portfolio-react-vite',
    images: [],
    badge: {
      pt: 'Este site',
      en: 'This site',
    },
    description: {
      pt: 'Este portfólio, bilíngue (PT/EN), construído como um terminal interativo: a home é uma linha de comando e cada página (currículo, acadêmico, projetos…) é uma janela do mesmo ambiente. Roteador próprio, TypeScript estrito, tema claro/escuro e 215 testes automatizados. Cada funcionalidade nasceu de uma especificação (SDD) com requisitos rastreáveis.',
      en: 'This very portfolio, bilingual (PT/EN), built as an interactive terminal: the home page is a command line and every page (resume, academics, projects…) is a window in the same environment. Custom router, strict TypeScript, light/dark theme and 215 automated tests. Every feature started from a specification (SDD) with traceable requirements.',
    },
  },
  {
    id: 'whatsapp-dispatcher',
    name: {
      pt: 'WhatsApp Dispatcher',
      en: 'WhatsApp Dispatcher',
    },
    start: {
      year: 2026,
    },
    stack: [
      {
        id: 'bullmq',
        label: {
          pt: 'BullMQ',
          en: 'BullMQ',
        },
      },
      {
        id: 'redis',
        label: {
          pt: 'Redis',
          en: 'Redis',
        },
      },
      {
        id: 'postgresql',
        label: {
          pt: 'PostgreSQL',
          en: 'PostgreSQL',
        },
      },
      {
        id: 'prisma',
        label: {
          pt: 'Prisma',
          en: 'Prisma',
        },
      },
    ],
    caseStudy: '/estudos-de-caso/whatsapp-dispatcher',
    images: [],
    badge: {
      pt: 'Estudo de Caso · Desafio Técnico de Estágio',
      en: 'Case Study · Internship Technical Challenge',
    },
    description: {
      pt: 'Estudo de caso de um **desafio técnico de estágio**: um sistema de disparo de mensagens no WhatsApp pra campanhas e fluxos automatizados. A implementação original é parcial; o que documentei em HTML foi o raciocínio por trás de cada decisão, por que essa arquitetura, que trocas eu fiz, o que faria diferente hoje. Mostra como eu penso sistema: **Domain-Driven Design**, **Clean Architecture** e uma estrutura inspirada em arquitetura hexagonal.',
      en: "A case study of an **internship technical challenge**: a WhatsApp message dispatch system for campaigns and automated flows. The original implementation is partial; what I documented in HTML is the reasoning behind every decision, why this architecture, what trade-offs I made, what I'd do differently today. It shows how I think about systems: **Domain-Driven Design**, **Clean Architecture**, and a structure inspired by hexagonal architecture.",
    },
  },
  {
    id: 'shorturl',
    name: {
      pt: 'ShortURL',
      en: 'ShortURL',
    },
    start: {
      year: 2026,
    },
    stack: [
      {
        id: 'express',
        label: {
          pt: 'Express',
          en: 'Express',
        },
      },
      {
        id: 'typescript',
        label: {
          pt: 'TypeScript',
          en: 'TypeScript',
        },
      },
      {
        id: 'mongodb',
        label: {
          pt: 'MongoDB',
          en: 'MongoDB',
        },
      },
      {
        id: 'redis',
        label: {
          pt: 'Redis',
          en: 'Redis',
        },
      },
      {
        id: 'docker',
        label: {
          pt: 'Docker',
          en: 'Docker',
        },
      },
      {
        id: 'ci-cd',
        label: {
          pt: 'CI/CD',
          en: 'CI/CD',
        },
      },
    ],
    repo: 'https://github.com/maria-brito15/shorturl-express',
    images: [],
    description: {
      pt: 'API REST pra encurtar URLs, com cache em Redis e rastreamento de clique por link.',
      en: 'REST API for shortening URLs, with Redis caching and per-link click tracking.',
    },
  },
  {
    id: 'file-name-standardizer',
    name: {
      pt: 'File Name Standardizer',
      en: 'File Name Standardizer',
    },
    start: {
      year: 2026,
    },
    stack: [
      {
        id: 'javascript-es6',
        label: {
          pt: 'JavaScript ES6+',
          en: 'JavaScript ES6+',
        },
      },
    ],
    repo: 'https://github.com/maria-brito15/file-name-standardizer',
    images: [],
    description: {
      pt: 'Padroniza nomes de arquivo em lote, tira acento, troca espaço por underscore. Sem nenhuma dependência.',
      en: 'Batch-standardizes file names, strips accents, swaps spaces for underscores. No dependencies at all.',
    },
  },
];
